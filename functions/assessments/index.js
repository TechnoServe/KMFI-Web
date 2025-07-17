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
        // score = (sumOfPoints / answerHashes.length);
        score = sumOfPoints;
        ivcScore = ivcSumOfPoints;
        satCompletionScore = satCompletion;
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

module.exports.persistIEGScores = persistScores;

module.exports.persistIVCScores = persistScores;

module.exports.persistSATScores = persistScores;
