const {validate} = require('../utils');
const {COMPANY_TIERS} = require('../constants');

/**
 * Computes assessment scores (SAT, IEG, and IVC) for a company based on provided data.
 *
 * @param {Object} store - Store object with access methods to fetch and update data.
 * @returns {Function} Express middleware function to handle score computation.
 */
module.exports.computeScore = (store) => async (req, res) => {
  try {
    const SCORE_TYPES = {
      SAT: 'SAT',
      IEG: 'IEG',
    };

    // Define validation constraints for the incoming request body
    const constraints = {
      'company-id': {
        type: 'string',
        presence: {allowEmpty: false},
      },
      'cycle-id': {
        type: 'string',
      },
      'assessment-type': {
        type: 'string',
        presence: {allowEmpty: false},
        inclusion: {
          within: SCORE_TYPES,
          message: 'Provide a valid score type.',
        },
      },
    };

    // Validate the request body against the constraints
    const errors = validate(req.body, constraints);

    if (errors) {
      return res.status(400).json({errors});
    }

    // TODO: Restrict access to this endpoint

    // Fetch all assessment questions
    const questions = await store.getQuestions();
    // Collect unique hashes based on category and tier for scoring
    const answerHashes = [];

    for (let i = 0; i < questions.length; i++) {
      const hash = `${questions[i]['category_id']}-${questions[i]['tier_id']}`;
      if (!answerHashes.includes(hash)) answerHashes.push(hash);
    }

    // Determine the cycle ID from request or use active SAT cycle
    const cycleId = req.body['cycle-id'] ? req.body['cycle-id'] : (await store.getActiveSATCycle()).id;

    let score = 0;
    let ivcScore = 0;
    let satCompletionScore = 0;
    let ivcCompletionScore = 0;

    // Fetch company data using provided company ID
    const company = await store.getCompanyById(req.body['company-id']);

    switch (req.body['assessment-type']) {
      case SCORE_TYPES.SAT: {
        // Fetch SAT and IVC answers, compute scores and completion rates
        const answers = await store.getCompanySatScores(req.body['company-id'], cycleId, req.user, !cycleId);
        // Save SAT and IVC scores
        await store.createSATScores(answers, 'SAT', req.body['company-id'], cycleId);
        const ivcAnswers = await store.getCompanyIvcScores(req.body['company-id'], cycleId, req.user, !cycleId);
        await store.createSATScores(ivcAnswers, 'IVC', req.body['company-id'], cycleId);
        const sumOfPoints = answers.reduce((sum, answer) => sum + answer.score, 0);
        const satCompletion = (answers.reduce((sum, answer) => sum + answer.answersLength, 0)/(company.tier == COMPANY_TIERS.TIER_3 ? 105 : 35))*100;
        const ivcSumOfPoints = ivcAnswers.reduce((sum, answer) => sum + answer.score, 0);
        const ivcCompletion = (ivcAnswers.reduce((sum, answer) => sum + answer.answersLength, 0) / (company.tier == COMPANY_TIERS.TIER_3 ? 105 : 35)) * 100;
        // score = (sumOfPoints / answerHashes.length);
        score = sumOfPoints;
        ivcScore = ivcSumOfPoints;
        satCompletionScore = satCompletion;
        ivcCompletionScore = ivcCompletion;
        break;
      }
      case SCORE_TYPES.IEG: {
        // Fetch and compute IEG score
        const answers = await store.getIEGScores(req.body['company-id'], 'IEG', cycleId, req.user);
        const sumOfPoints = answers.reduce((sum, {value}) => sum + value, 0);
        score = sumOfPoints;
        break;
      }

      // TODO: Add IEG scoring logic which will be similar to SAT
      default:
        // Do nothing, you should never get here.
        break;
    }


    // if (company.tier == COMPANY_TIERS.TIER_1) score = score * 100/66;

    // Store computed assessment scores
    await store.setAssessmentScore(company.id, cycleId, req.body['assessment-type'], score);
    if (req.body['assessment-type'] === SCORE_TYPES.SAT) {
      await store.setAssessmentScore(company.id, cycleId, 'IVC', ivcScore);
      await store.setAssessmentScore(company.id, cycleId, 'SAT_COMPLETION', satCompletionScore);
      await store.setAssessmentScore(company.id, cycleId, 'IVC_COMPLETION', ivcCompletionScore);
    }

    return res.json({message: 'Score calculated successfully.'});
  } catch (err) {
    const message = 'Failed to compute score.';
    console.error(err, message);
    res.status(500).json({message});
  }
};

/**
 * Persists individual assessment scores for a company (SAT, IVC, IEG).
 *
 * @param {Object} store - Store object with persistence methods.
 * @returns {Function} Express middleware function to store scores.
 */
const persistScores = (store) => async (req, res) => {
  try {
    const SCORE_TYPES = {
      IVC: 'IVC',
      IEG: 'IEG',
      SAT: 'SAT',
    };

    // Define validation rules for each score object
    const constraints = {
      company_id: {
        type: 'string',
        presence: {allowEmpty: false},
      },
      category_id: {
        type: 'string',
        presence: {allowEmpty: false},
      },
      cycle_id: {
        type: 'string',
        presence: {allowEmpty: false},
      },
      type: {
        type: 'string',
        presence: {allowEmpty: false},
        inclusion: {
          within: SCORE_TYPES,
          message: 'Provide a valid score type.',
        },
      },
      value: {
        numericality: true,
      },
      weight: {
        numericality: true,
      },
    };

    const itemValidator = (constraints) => (val) => validate(val, constraints);

    let errors = null;

    // Validate that the request body is a non-empty array of score objects
    if (!Array.isArray(req.body)) {
      errors = 'Scores must be an array.';
    } else if (!(req.body.length > 0)) {
      errors = 'Scores cannot be empty.';
    } else {
      const validationError = req.body.map(itemValidator(constraints)).filter((err) => err);
      errors = validationError.length > 0 ? validationError : null;
    }

    if (errors) {
      return res.status(400).json({errors});
    }

    // Persist scores using store method
    const score = await store.createIEGScores(req.body);

    if (score) {
      return res.json({message: 'Scores persisted successfully.'});
    } else {
      return res.status(500).json({message: 'Failed to persist scores.'});
    }
  } catch (err) {
    const message = 'Failed to store score.';
    console.error(err, message);
    res.status(500).json({message});
  }
};

/**
 * Retrieves assessment scores for a specific company, cycle, and assessment type.
 *
 * @param {Object} store - Store object with query methods.
 * @returns {Function} Express middleware function to return scores.
 */
module.exports.getScores = (store) => async (req, res) => {
  try {
    const SCORE_TYPES = {
      IVC: 'IVC',
      IEG: 'IEG',
    };

    // Define validation constraints for the query parameters
    const constraints = {
      'company-id': {
        type: 'string',
        presence: {allowEmpty: false},
      },
      'cycle-id': {
        type: 'string',
      },
      'assessment-type': {
        type: 'string',
        presence: {allowEmpty: false},
        inclusion: {
          within: SCORE_TYPES,
          message: 'Provide a valid score type.',
        },
      },
    };

    // Validate query parameters
    const errors = validate(req.query, constraints);

    if (errors) {
      return res.status(400).json({errors});
    }

    // Construct payload to fetch scores
    const payload = {companyId: req.query['company-id'], cycleId: req.query['cycle-id'], type: req.query['assessment-type']};

    // Retrieve scores from store
    const scores = await store.getAssessmentScores(payload);

    return res.json(scores);
  } catch (err) {
    const message = 'Failed to get scores.';
    console.error(err, message);
    res.status(500).json({message});
  }
};

/**
 * Retrieves all assessment scores for all companies.
 * @param {Object} store - Data access layer with score retrieval methods.
 * @returns {Function} Express route handler that handles the request and response.
 */
module.exports.getAllScores = (store) => async (req, res) => {
  try {
    const cycleId = req.query['cycle-id'];
    const type = req.query['type'];

    if (!cycleId) {
      return res.status(400).json({ message: "'cycle-id' is required." });
    }

    const scores = await store.getAllAssessmentScores(cycleId, type);
    return res.json(scores);
  } catch (err) {
    const message = 'Failed to retrieve all scores.';
    console.error(err, message);
    res.status(500).json({ message });
  }
};

/**
 * Retrieves all IEG scores for all companies for a given cycle.
 * @param {Object} store - Data access layer with score retrieval methods.
 * @returns {Function} Express route handler that handles the request and response.
 */
module.exports.getAllIEGScores = (store) => async (req, res) => {
  try {
    const cycleId = req.query['cycle-id'];

    if (!cycleId) {
      return res.status(400).json({ message: "'cycle-id' is required." });
    }

    const scores = await store.getAllAssessmentScores(cycleId, 'IEG');
    return res.json(scores);
  } catch (err) {
    const message = 'Failed to retrieve all IEG scores.';
    console.error(err, message);
    res.status(500).json({ message });
  }
};

/**
 * Retrieves SAT variance per company for a given cycle.
 * @param {Object} store - Data access layer with score retrieval/variance methods.
 * @returns {Function} Express route handler.
 */
module.exports.getSATVariance = (store) => async (req, res) => {
  try {
    const cycleId = req.query['cycle-id'];
    if (!cycleId) {
      return res.status(400).json({ message: "'cycle-id' is required." });
    }
    const varianceData = await store.getSATVarianceByCompany(cycleId);
    return res.json(varianceData);
  } catch (err) {
    const message = 'Failed to retrieve SAT variance.';
    console.error(err, message);
    res.status(500).json({ message });
  }
};

/**
 * Retrieves the 4PG ranking for all companies for a given cycle.
 * @param {Object} store - Data access layer with 4PG ranking retrieval method.
 * @returns {Function} Express route handler.
 */
module.exports.getAll4PGRanking = (store) => async (req, res) => {
  try {
    const cycleId = req.query['cycle-id'];

    if (!cycleId) {
      return res.status(400).json({ message: "'cycle-id' is required." });
    }

    const rankingData = await store.getAll4PGRanking(cycleId);

    return res.json(rankingData);
  } catch (err) {
    const message = 'Failed to retrieve 4PG ranking.';
    console.error(err, message);
    res.status(500).json({ message });
  }
};

/**
 * Retrieves Triangulation data (SAT = U, IVC = V, IEG) for **all companies** in a cycle,
 * broken down by key categories with weights, and includes TOTAL columns.
 *
 * Output shape per row:
 * {
 *   company_id, company_name, cycle_id,
 *   PMS_U, PMS_V, PMS_IEG,
 *   PCII_U, PCII_V, PCII_IEG,
 *   PIM_U, PIM_V, PIM_IEG,
 *   PE_U, PE_V, PE_IEG,
 *   GLC_U, GLC_V, GLC_IEG,
 *   TOTAL_U, TOTAL_V, TOTAL_IEG
 * }
 */
module.exports.getTriangulation = (store) => async (req, res) => {
  try {
    const cycleId = req.query['cycle-id'] || req.query['cycleId'];
    if (!cycleId) {
      return res.status(400).json({ message: "'cycle-id' is required." });
    }

    // Category weights (%)
    const CAT_WEIGHTS = {
      PMS: 15,   // Policy, Management & Strategy
      PCII: 25,  // Production, Continuous Improvement & Innovation
      PIM: 25,   // Procurement & Inputs Management
      PE: 10,    // Public Engagement
      GLC: 25,   // Grievance, Labor & Compliance
    };

    // Map incoming category names (collections) to our 5 category codes
    // Canonical labels per your spec:
    // - People Management Systems (PMS)
    // - Production, Continuous Improvement & Innovation (PCII)
    // - Procurement and Suppliers (PIM)
    // - SAT Public Engagement (PE)
    // - Governance & Leadership Culture (GLC)
    const NAME_TO_CODE = {
      'people management systems': 'PMS',
      'pms': 'PMS',
      'production, continuous improvement & innovation': 'PCII',
      'pcii': 'PCII',
      'procurement and suppliers': 'PIM',
      'pim': 'PIM',
      'sat public engagement': 'PE',
      'public engagement': 'PE', // tolerate legacy phrasing
      'pe': 'PE',
      'governance & leadership culture': 'GLC',
      'governance and leadership culture': 'GLC',
      'glc': 'GLC',
    };

    const toNum = (v) => (v == null || v === '' || Number.isNaN(Number(v)) ? 0 : Number(v));

    // Fetch all three score types (arrays of per-company, per-category items)
    const [satArr, ivcArr, iegArr] = await Promise.all([
      store.getAllAssessmentScores(cycleId, 'SAT').catch(() => []),
      store.getAllAssessmentScores(cycleId, 'IVC').catch(() => []),
      store.getAllAssessmentScores(cycleId, 'IEG').catch(() => []),
    ]);

    const getCompanyKey = (row) => row?.company_id || row?.companyId || row?.company?.id || row?.company?.company_id || row?.id;
    const getCompanyName = (row) => row?.company_name || row?.name || row?.company?.name || row?.company?.company_name || null;

    const getCategoryCode = (row) => {
      // Prefer an explicit code if present
      const code = (row?.category_code || row?.categoryCode || '').toString().toUpperCase();
      if (CAT_WEIGHTS.hasOwnProperty(code)) return code;
      // Else try to map from name
      const rawName = (row?.category_name || row?.category || row?.categoryId || '').toString().toLowerCase();
      if (NAME_TO_CODE[rawName]) return NAME_TO_CODE[rawName];
      // In some datasets, only partial text; try weak hints
      if (/\bpms\b|people\s+management\s+systems/i.test(rawName)) return 'PMS';
      if (/\bpcii\b|continuous\s+improve|production,\s*continuous/i.test(rawName)) return 'PCII';
      if (/\bpim\b|procurement|supplier/i.test(rawName)) return 'PIM';
      if (/\bpe\b|public\s*engagement|sat\s*public\s*engagement/i.test(rawName)) return 'PE';
      if (/\bglc\b|governance|leadership\s*culture/i.test(rawName)) return 'GLC';
      return null;
    };

    // byCompany: id -> accumulators for each category & type
    const byCompany = new Map();

    // Only allow active companies: row.company_active === true or row.active === true
    const ensureCompany = (row) => {
      const id = getCompanyKey(row);
      // Guard: skip if not active
      if (!id) return null;
      if (!(row && (row.company_active === true || row.active === true))) {
        return null;
      }
      if (!byCompany.has(id)) {
        byCompany.set(id, {
          company_id: id,
          company_name: getCompanyName(row),
          company_size: row.size_category,
          cycle_id: cycleId,
          // initialize category/type buckets
          PMS_U: 0, PMS_V: 0, PMS_IEG: 0,
          PCII_U: 0, PCII_V: 0, PCII_IEG: 0,
          PIM_U: 0, PIM_V: 0, PIM_IEG: 0,
          PE_U: 0, PE_V: 0, PE_IEG: 0,
          GLC_U: 0, GLC_V: 0, GLC_IEG: 0,
          TOTAL_U: 0, TOTAL_V: 0, TOTAL_IEG: 0,
        });
      }
      const cur = byCompany.get(id);
      // Keep the latest non-empty company_name we see
      const nm = getCompanyName(row);
      if (nm && !cur.company_name) cur.company_name = nm;
      return cur;
    };

    const bump = (cur, catCode, typeKey, rawVal) => {
      if (!catCode) return;
      const key = `${catCode}_${typeKey}`; // e.g., PMS_U
      cur[key] += toNum(rawVal);
    };

    // Ingest SAT (U), IVC (V), IEG per-category values (unweighted sums per category)
    for (const r of satArr) {
      const cur = ensureCompany(r); if (!cur) continue;
      const cat = getCategoryCode(r); if (!cat) continue;
      const val = r.score;
      bump(cur, cat, 'U', val);
    }
    for (const r of ivcArr) {
      const cur = ensureCompany(r); if (!cur) continue;
      const cat = getCategoryCode(r); if (!cat) continue;
      const val = r.score
      bump(cur, cat, 'V', val);
    }
    for (const r of iegArr) {
      const cur = ensureCompany(r); if (!cur) continue;
      const cat = getCategoryCode(r); if (!cat) continue;
      const val = r.value;
      bump(cur, cat, 'IEG', val);
    }

    // Compute weighted totals per type using category weights
    for (const cur of byCompany.values()) {
      const weightedSum = (typeKey) =>
        (toNum(cur.PMS_U && typeKey === 'U' ? cur.PMS_U : typeKey === 'V' ? cur.PMS_V : cur.PMS_IEG)) +
        (toNum(cur.PCII_U && typeKey === 'U' ? cur.PCII_U : typeKey === 'V' ? cur.PCII_V : cur.PCII_IEG)) +
        (toNum(cur.PIM_U && typeKey === 'U' ? cur.PIM_U : typeKey === 'V' ? cur.PIM_V : cur.PIM_IEG)) +
        (toNum(cur.PE_U && typeKey === 'U' ? cur.PE_U : typeKey === 'V' ? cur.PE_V : cur.PE_IEG)) +
        (toNum(cur.GLC_U && typeKey === 'U' ? cur.GLC_U : typeKey === 'V' ? cur.GLC_V : cur.GLC_IEG));

      cur.TOTAL_U = weightedSum('U');
      cur.TOTAL_V = weightedSum('V');
      cur.TOTAL_IEG = weightedSum('IEG');
    }

    // Final result array
    const result = Array.from(byCompany.values());
    return res.json(result);
  } catch (err) {
    const message = 'Failed to retrieve triangulation data.';
    console.error(err, message);
    res.status(500).json({ message });
  }
};


module.exports.getAllProductTests = (store) => async (req, res) => {
  try {
    const cycleId = req.query['cycle-id'];

    if (!cycleId) {
      return res.status(400).json({ message: "'cycle-id' is required." });
    }

    const tests = await store.getAllProductTests(cycleId);
    const filteredTests = tests.filter(t => {
      const brandName = t.brand_name || (t.brand && t.brand.name);
      const brandActive = t.brand_active;
      return brandName && brandName.trim() !== '' && brandActive;
    });
    return res.json(filteredTests);
  } catch (err) {
    const message = 'Failed to retrieve all product tests.';
    console.error(err, message);
    res.status(500).json({ message });
  }
};

/**
 * Retrieves consolidated Company Reports for a given cycle.
 * Output shape per row:
 *   { company, size, satU, satV, ieg, ptResults: [{ brand, score }] }
 */
module.exports.getCompanyReports = (store) => async (req, res) => {
  try {
    const cycleId = req.query['cycle-id'] || req.query['cycleId'];
    if (!cycleId) {
      return res.status(400).json({ message: "'cycle-id' is required." });
    }

    // Helpers to normalize various shapes coming from the DAL
    const toNum = (v) => (v == null || v === '' || Number.isNaN(Number(v)) ? 0 : Number(v));
    const getCompanyId = (row) => row?.company_id || row?.companyId || row?.company?.id || row?.company?.company_id || row?.id;
    const getCompanyName = (row) => row?.company_name || row?.name || row?.company?.name || row?.company?.company_name || null;
    const getCompanySize = (row) => row?.size || row?.size_category || row?.company?.size || row?.company?.size_category || null;
    const isCompanyActive = (row) => {
      const flags = [
        row?.company_active,
        row?.active,
        row?.company?.active,
        row?.company?.is_active,
      ];
      return flags.some((v) => v === true);
    };

    // 1) Load all assessment scores needed for totals
    const [satArr, ivcArr, iegArr] = await Promise.all([
      store.getAllAssessmentScores(cycleId, 'SAT').catch(() => []), // SAT -> U
      store.getAllAssessmentScores(cycleId, 'IVC').catch(() => []), // IVC -> V (validated)
      store.getAllAssessmentScores(cycleId, 'IEG').catch(() => []), // IEG
    ]);

    // 2) Build per-company aggregations for SAT (U), IVC (V), IEG totals
    const agg = new Map();
    const ensure = (row) => {
      const id = getCompanyId(row);
      if (!id) return null;
      // Filter only ACTIVE companies
      if (!isCompanyActive(row)) return null;
      if (!agg.has(id)) {
        agg.set(id, {
          companyId: id,
          company: getCompanyName(row) || '',
          size: getCompanySize(row) || null,
          satU: 0,
          satV: 0,
          ieg: 0,
          ptResults: [],
        });
      } else {
        // Keep first non-empty name/size we encounter
        const cur = agg.get(id);
        if (!cur.company) cur.company = getCompanyName(row) || cur.company;
        if (!cur.size) cur.size = getCompanySize(row) || cur.size;
      }
      return agg.get(id);
    };

    for (const r of satArr) {
      const cur = ensure(r); if (!cur) continue;
      cur.satU += toNum(r.score ?? r.value) * 0.5;
    }
    for (const r of ivcArr) {
      const cur = ensure(r); if (!cur) continue;
      cur.satV += toNum(r.score ?? r.value) * 0.5;
    }
    for (const r of iegArr) {
      const cur = ensure(r); if (!cur) continue;
      cur.ieg += toNum(r.value ?? r.score) * 0.2;
    }

    // 3) Load product test results and attach per company as ptResults [{brand, score}]
    const tests = await store.getAllProductTests(cycleId).catch(() => []);
    for (const t of tests) {
      if (!isCompanyActive(t)) continue;
      const id = getCompanyId(t) || t?.brand?.company_id || t?.companyId;
      if (!id) continue;
      if (!agg.has(id)) {
        agg.set(id, {
          companyId: id,
          company: getCompanyName(t) || (t?.company?.name) || '',
          size: getCompanySize(t) || null,
          satU: 0,
          satV: 0,
          ieg: 0,
          ptResults: [],
        });
      }
      const cur = agg.get(id);
      const brandName = t.brand_name || t?.brand?.name || t?.brandName || 'Brand';
      const scoreVal = toNum(t.product_type_name == 'Maize Flour' ? t.fortification.overallKMFIWeightedScore : t.fortification.score);
      cur.ptResults.push({ brand: brandName, score: scoreVal });
    }

    // 4) Produce the final array, sorted by company name
    const result = Array.from(agg.values())
      .map(({ companyId, company, size, satU, satV, ieg, ptResults }) => ({ companyId, company, size, satU, satV, ieg, ptResults }))
      .sort((a, b) => (a.company || '').localeCompare(b.company || ''));

    return res.json(result);
  } catch (err) {
    const message = 'Failed to retrieve company reports.';
    console.error(err, message);
    res.status(500).json({ message });
  }
};
/**
 * GET /admin/company-reports/trend
 * Query: companyId (string, required)
 * Returns an array of points for the selected company across cycles:
 *   [{ cycle, satU, satV, ieg, ptAvg }]
 * Weights:
 *  - SAT(U) * 0.5
 *  - SAT(V) * 0.5
 *  - IEG    * 0.2
 */
module.exports.getCompanyReportsTrend = (store) => async (req, res) => {
  try {
    const companyIdQ = (req.query.companyId || '').trim();
    if (!companyIdQ) return res.status(400).json({ message: "'companyId' is required" });

    const toNum = (v) => (v == null || v === '' || Number.isNaN(Number(v)) ? 0 : Number(v));
    const getCompanyId = (row) => row?.company_id || row?.companyId || row?.company?.id || row?.company?.company_id || row?.id;

    const cycles = await store.getCycles().catch(() => []);
    if (!Array.isArray(cycles) || cycles.length === 0) return res.json([]);

    const out = [];
    for (const c of cycles) {
      const cycleId = c?.id ?? c?.cycle_id ?? c;
      const cycleLabel = c?.name ?? c?.label ?? String(cycleId);
      if (!cycleId) continue;

      const [satArr, ivcArr, iegArr, tests] = await Promise.all([
        store.getAllAssessmentScores(cycleId, 'SAT').catch(() => []),
        store.getAllAssessmentScores(cycleId, 'IVC').catch(() => []),
        store.getAllAssessmentScores(cycleId, 'IEG').catch(() => []),
        store.getAllProductTests(cycleId).catch(() => []),
      ]);

      const byCompany = (r) => {
        const id = getCompanyId(r);
        return id && String(id) === String(companyIdQ);
      };

      let satU = 0, satV = 0, ieg = 0;
      for (const r of satArr.filter(byCompany)) satU += toNum(r.score ?? r.value) * 0.5;
      for (const r of ivcArr.filter(byCompany)) satV += toNum(r.score ?? r.value) * 0.5;
      for (const r of iegArr.filter(byCompany))  ieg  += toNum(r.value ?? r.score) * 0.2;

      const pts = tests.filter(byCompany)
        .map((t) => toNum(t.product_type_name == 'Maize Flour' ? t.fortification.overallKMFIWeightedScore : t.fortification.score))
        .filter((v) => Number.isFinite(v));
      const ptAvg = pts.length ? (pts.reduce((a, b) => a + b, 0) / pts.length) : 0;

      out.push({ cycle: cycleLabel, satU, satV, ieg, ptAvg });
    }

    res.json(out);
  } catch (err) {
    console.error('getCompanyReportsTrend error', err);
    res.status(500).json({ message: 'Failed to retrieve company trend.' });
  }
};

/**
 * Retrieves Top Performers per component (PMS, PCII, PIM, PE, GLC) grouped by company size.
 * Scoring logic:
 *  - Component contribution = ((IVC% + IEG%) / 2) * (componentWeight / 100)
 *  - Component weights (max points): PMS=15, PCII=25, PIM=25, PE=10, GLC=25
 *
 * Query params:
 *  - cycle-id (required)
 *  - top (optional, default 3)
 *  - size (optional, one of Large|Medium|Small to restrict categories)
 *
 * Response shape:
 * {
 *   cycleId,
 *   topN,
 *   components: {
 *     PMS: { Large: { totalInCat, rows: [{ rank, names, value, note }] }, Medium: {...}, Small: {...} },
 *     PCII: {...},
 *     PIM: {...},
 *     PE: {...},
 *     GLC: {...}
 *   }
 * }
 */
module.exports.getTopPerformers = (store) => async (req, res) => {
  try {
    const cycleId = req.query['cycle-id'] || req.query['cycleId'];
    if (!cycleId) return res.status(400).json({ message: "'cycle-id' is required." });

    const topN = Math.max(1, Math.min(10, parseInt(req.query.top, 10) || 3));
    const sizeFilter = (req.query.size || '').trim(); // Large | Medium | Small | ''

    // Component weights (max points out of 100)
    const WEIGHTS = { PMS: 15, PCII: 25, PIM: 25, PE: 10, GLC: 25 };

    const NAME_TO_CODE = {
      'people management systems': 'PMS', 'pms': 'PMS',
      'production, continuous improvement & innovation': 'PCII', 'pcii': 'PCII',
      'procurement and suppliers': 'PIM', 'pim': 'PIM',
      'sat public engagement': 'PE', 'public engagement': 'PE', 'pe': 'PE',
      'governance & leadership culture': 'GLC', 'governance and leadership culture': 'GLC', 'glc': 'GLC',
    };

    const toNum = (v) => (v == null || v === '' || Number.isNaN(Number(v)) ? 0 : Number(v));
    const getCompanyId = (row) => row?.company_id || row?.companyId || row?.company?.id || row?.id;
    const getCompanyName = (row) => row?.company_name || row?.name || row?.company?.name || null;
    const getCompanySize = (row) => row?.size || row?.size_category || row?.company?.size || row?.company?.size_category || 'Unknown';

    const getCategoryCode = (row) => {
      const code = (row?.category_code || row?.categoryCode || '').toString().toUpperCase();
      if (WEIGHTS.hasOwnProperty(code)) return code;
      const rawName = (row?.category_name || row?.category || row?.categoryId || '').toString().toLowerCase();
      if (NAME_TO_CODE[rawName]) return NAME_TO_CODE[rawName];
      if (/\bpms\b|people\s+management\s+systems/i.test(rawName)) return 'PMS';
      if (/\bpcii\b|continuous\s+improve|production,\s*continuous/i.test(rawName)) return 'PCII';
      if (/\bpim\b|procurement|supplier/i.test(rawName)) return 'PIM';
      if (/\bpe\b|public\s*engagement|sat\s*public\s*engagement/i.test(rawName)) return 'PE';
      if (/\bglc\b|governance|leadership\s*culture/i.test(rawName)) return 'GLC';
      return null;
    };

    const isCompanyActive = (row) => {
      const flags = [
        row?.company_active,
        row?.active,
        row?.company?.active,
        row?.company?.is_active,
      ];
      return flags.some((v) => v === true);
    };

    // Load IVC (validated) and IEG scores per category
    const [ivcArr, iegArr] = await Promise.all([
      store.getAllAssessmentScores(cycleId, 'IVC').catch(() => []),
      store.getAllAssessmentScores(cycleId, 'IEG').catch(() => []),
    ]);

    // Build per-company, per-component aggregates
    const companies = new Map();
    const ensure = (row) => {
      const id = getCompanyId(row);
      if (!id) return null;
      // Filter only ACTIVE companies
      if (!isCompanyActive(row)) return null;
      if (!companies.has(id)) {
        companies.set(id, {
          id,
          name: getCompanyName(row) || '',
          size: getCompanySize(row) || 'Unknown',
          comps: { PMS: { V: 0, IEG: 0 }, PCII: { V: 0, IEG: 0 }, PIM: { V: 0, IEG: 0 }, PE: { V: 0, IEG: 0 }, GLC: { V: 0, IEG: 0 } },
        });
      } else {
        const cur = companies.get(id);
        if (!cur.name) cur.name = getCompanyName(row) || cur.name;
        if (!cur.size || cur.size === 'Unknown') cur.size = getCompanySize(row) || cur.size;
      }
      return companies.get(id);
    };

    for (const r of ivcArr) {
      const comp = getCategoryCode(r); if (!comp) continue;
      const cur = ensure(r); if (!cur) continue;
      cur.comps[comp].V += toNum(r.score ?? r.value);
    }
    for (const r of iegArr) {
      const comp = getCategoryCode(r); if (!comp) continue;
      const cur = ensure(r); if (!cur) continue;
      cur.comps[comp].IEG += toNum(r.value ?? r.score);
    }

    // Group by size category
    const SIZES = ['Large', 'Medium', 'Small'];
    const sizesToUse = sizeFilter && SIZES.includes(sizeFilter) ? [sizeFilter] : SIZES;

    // Prepare response buckets
    const resp = { cycleId, topN, components: { PMS: {}, PCII: {}, PIM: {}, PE: {}, GLC: {} } };

    const round1 = (x) => Math.round(x * 10) / 10;

    for (const sizeCat of sizesToUse) {
      // take companies in this size category
      const rowsInSize = Array.from(companies.values()).filter((c) => String(c.size).toLowerCase() === sizeCat.toLowerCase());
      const totalInCat = rowsInSize.length;

      // For each component, compute contribution and build ranking
      for (const compKey of Object.keys(WEIGHTS)) {
        const max = WEIGHTS[compKey];
        const rows = rowsInSize
          .map((c) => {
            const V = toNum(c.comps[compKey].V);
            const IEG = toNum(c.comps[compKey].IEG);
            // Average the two and scale by weight (e.g., 85% * 0.15 => 12.75)
            const contribution = ((V + IEG) / 2) * (max / 100);
            return { name: c.name || c.id, contribution };
          })
          .filter((r) => Number.isFinite(r.contribution))
          .sort((a, b) => b.contribution - a.contribution);

        // Merge ties by 0.1 precision and take top N (tie-aware)
        const merged = [];
        for (const r of rows) {
          const val = round1(r.contribution);
          const last = merged[merged.length - 1];
          if (last && round1(last.value) === val) last.names.push(r.name);
          else merged.push({ names: [r.name], value: val });
        }

        const take = merged.slice(0, topN).map((m, idx) => ({
          rank: idx + 1,
          names: m.names.join('/'),
          value: m.value,
          note: `${m.value}% (of ${max}% max)`,
        }));

        resp.components[compKey][sizeCat] = { totalInCat, rows: take };
      }
    }

    return res.json(resp);
  } catch (err) {
    console.error('getTopPerformers error', err);
    return res.status(500).json({ message: 'Failed to compute top performers.' });
  }
};
/**
 * Retrieves table-ready 4PG component scores per company for a given cycle.
 * Each row contains the *weighted contribution* per component based on:
 *   contribution(component) = ((IVC% + IEG%) / 2) * (componentWeight / 100)
 * Weights: PMS=15, PCII=25, PIM=25, PE=10, GLC=25
 *
 * Query params:
 *  - cycle-id (required)
 *  - only-active (optional; if truthy, only include active companies)
 *  - size (optional; Large|Medium|Small)
 *
 * Response rows example:
 *  [
 *    {
 *      company_id,
 *      name,                // company name
 *      category,            // size category: Large|Medium|Small
 *      cycle_id,
 *      pms, pcii, pim, pe, glc, // numbers, 1-decimal
 *      active               // boolean when detectable
 *    }
 *  ]
 */
module.exports.get4PGScores = (store) => async (req, res) => {
  try {
    const cycleId = req.query['cycle-id'] || req.query['cycleId'];
    if (!cycleId) return res.status(400).json({ message: "'cycle-id' is required." });

    const sizeFilter = (req.query.size || '').trim(); // Large|Medium|Small|''
    const onlyActive = ['1', 'true', 'yes'].includes(String(req.query['only-active'] || '').toLowerCase());

    // Component weights (max points out of 100)
    const WEIGHTS = { PMS: 15, PCII: 25, PIM: 25, PE: 10, GLC: 25 };

    // Map incoming category names to codes
    const NAME_TO_CODE = {
      'people management systems': 'PMS', 'pms': 'PMS',
      'production, continuous improvement & innovation': 'PCII', 'pcii': 'PCII',
      'procurement and suppliers': 'PIM', 'pim': 'PIM',
      'sat public engagement': 'PE', 'public engagement': 'PE', 'pe': 'PE',
      'governance & leadership culture': 'GLC', 'governance and leadership culture': 'GLC', 'glc': 'GLC',
    };

    const toNum = (v) => (v == null || v === '' || Number.isNaN(Number(v)) ? 0 : Number(v));
    const round1 = (x) => Math.round(x * 10) / 10;

    const getCompanyId = (row) => row?.company_id || row?.companyId || row?.company?.id || row?.id;
    const getCompanyName = (row) => row?.company_name || row?.name || row?.company?.name || null;
    const getCompanySize = (row) => row?.size || row?.size_category || row?.company?.size || row?.company?.size_category || 'Unknown';
    const isCompanyActive = (row) => {
      const flags = [row?.company_active, row?.active, row?.company?.active, row?.company?.is_active];
      return flags.some((v) => v === true);
    };
    const getCategoryCode = (row) => {
      const code = (row?.category_code || row?.categoryCode || '').toString().toUpperCase();
      if (WEIGHTS.hasOwnProperty(code)) return code;
      const rawName = (row?.category_name || row?.category || row?.categoryId || '').toString().toLowerCase();
      if (NAME_TO_CODE[rawName]) return NAME_TO_CODE[rawName];
      if (/\bpms\b|people\s+management\s+systems/i.test(rawName)) return 'PMS';
      if (/\bpcii\b|continuous\s+improve|production,\s*continuous/i.test(rawName)) return 'PCII';
      if (/\bpim\b|procurement|supplier/i.test(rawName)) return 'PIM';
      if (/\bpe\b|public\s*engagement|sat\s*public\s*engagement/i.test(rawName)) return 'PE';
      if (/\bglc\b|governance|leadership\s*culture/i.test(rawName)) return 'GLC';
      return null;
    };

    // Load IVC (validated) and IEG scores per category
    const [ivcArr, iegArr] = await Promise.all([
      store.getAllAssessmentScores(cycleId, 'IVC').catch(() => []),
      store.getAllAssessmentScores(cycleId, 'IEG').catch(() => []),
    ]);

    // Aggregate per company
    const byCompany = new Map();
    const ensure = (row) => {
      const id = getCompanyId(row); if (!id) return null;
      if (!byCompany.has(id)) {
        byCompany.set(id, {
          company_id: id,
          name: getCompanyName(row) || '',
          category: getCompanySize(row) || 'Unknown',
          cycle_id: cycleId,
          active: isCompanyActive(row),
          comps: { PMS: { V: 0, IEG: 0 }, PCII: { V: 0, IEG: 0 }, PIM: { V: 0, IEG: 0 }, PE: { V: 0, IEG: 0 }, GLC: { V: 0, IEG: 0 } },
        });
      } else {
        const cur = byCompany.get(id);
        if (!cur.name) cur.name = getCompanyName(row) || cur.name;
        if (!cur.category || cur.category === 'Unknown') cur.category = getCompanySize(row) || cur.category;
        if (cur.active !== true) cur.active = isCompanyActive(row);
      }
      return byCompany.get(id);
    };

    for (const r of ivcArr) {
      const comp = getCategoryCode(r); if (!comp) continue;
      const cur = ensure(r); if (!cur) continue;
      cur.comps[comp].V += toNum(r.score);
    }
    for (const r of iegArr) {
      const comp = getCategoryCode(r); if (!comp) continue;
      const cur = ensure(r); if (!cur) continue;
      cur.comps[comp].IEG += toNum(r.value);
    }

    // Build final rows with weighted contributions and pretty column names
    let rows = Array.from(byCompany.values()).map((c) => {
      const out = { company_id: c.company_id, name: c.name || c.company_id, category: c.category, cycle_id: c.cycle_id, active: c.active };

      const pmsVal  = round1((((toNum(c.comps.PMS.V)  + toNum(c.comps.PMS.IEG))  / 2)));
      const pciiVal = round1((((toNum(c.comps.PCII.V) + toNum(c.comps.PCII.IEG)) / 2)));
      const pimVal  = round1((((toNum(c.comps.PIM.V)  + toNum(c.comps.PIM.IEG))  / 2)));
      const peVal   = round1((((toNum(c.comps.PE.V)   + toNum(c.comps.PE.IEG))   / 2)));
      const glcVal  = round1((((toNum(c.comps.GLC.V)  + toNum(c.comps.GLC.IEG))  / 2)));

      const totalVal = round1(pmsVal + pciiVal + pimVal + peVal + glcVal);

      // Short keys retained for existing frontend parser
      out.pms = pmsVal;
      out.pcii = pciiVal;
      out.pim = pimVal;
      out.pe = peVal;
      out.glc = glcVal;
      out.total = totalVal;

      // Pretty column aliases as requested
      out['Company'] = out.name;
      out['Category'] = out.category;
      out['PMS Average (V+IEG) -15%'] = pmsVal;
      out['PCII Average (V+IEG) - 25%'] = pciiVal;
      out['PIM Average (V+IEG) - 25%'] = pimVal;
      out['PE Average (V+IEG) - 10%'] = peVal;
      out['GLC Average (V+IEG) - 25%'] = glcVal;
      out['TotalAvg'] = totalVal;

      return out;
    });

    // Optional filters
    if (onlyActive) rows = rows.filter((r) => r.active === true);
    if (sizeFilter) rows = rows.filter((r) => String(r.category).toLowerCase() === sizeFilter.toLowerCase());

    // Sort by name asc for consistency
    rows.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return res.json(rows);
  } catch (err) {
    console.error('get4PGScores error', err);
    return res.status(500).json({ message: 'Failed to compute 4PG scores.' });
  }
};
module.exports.persistIEGScores = persistScores;

module.exports.persistIVCScores = persistScores;

module.exports.persistSATScores = persistScores;
