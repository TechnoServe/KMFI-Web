import {useEffect, useMemo, useState} from 'react';
import {request} from 'common';
import {pickField, findNutrient, findVitaminAResult, toNumber} from './helpers';

export const useProductTestingData = (cycle) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [wheat, setWheat] = useState([]);
  const [maize, setMaize] = useState([]);
  const [oils, setOils] = useState([]);

  const normalizeEntry = (entry) => {
    const company = pickField(entry, ['company_name', 'company', 'companyName'], '—');
    const brand = pickField(entry, ['brand_name', 'brand', 'brandName'], '—');
    const size = entry.company_size;
    const productTypeName = pickField(entry, ['product_type_name', 'productTypeName', 'category'], '');
    const type =
            /maize/i.test(productTypeName) ? 'Maize'
              : /wheat/i.test(productTypeName) ? 'Wheat'
                : /oil/i.test(productTypeName) || /edible/i.test(productTypeName) ? 'Edible Oil'
                  : (pickField(entry, ['type'], '—'));

    const results = entry.results || [];
    const rVitA = findVitaminAResult(results) || findNutrient(results, ['vit\\.?\\s*A', 'vitamin\\s*A', 'retinol']);
    const rB3 = findNutrient(results, ['vit\\.?\\s*B3', 'niacin']);
    const rIron = findNutrient(results, ['iron']);

    const r1 = rVitA || (Array.isArray(results) ? results.find((x) => x && x !== rB3 && x !== rIron) : {}) || {};
    const r2 = rB3 || (Array.isArray(results) ? results.find((x) => x && x !== r1 && x !== rIron) : {}) || {};
    const r3 = rIron || (Array.isArray(results) ? results.find((x) => x && x !== r1 && x !== r2) : {}) || {};

    const score1 = toNumber(pickField(r1, ['mfiScore', 'mfi_score', 'score']), 0);
    const score2 = toNumber(pickField(r2, ['mfiScore', 'mfi_score', 'score']), 0);
    const score3 = toNumber(pickField(r3, ['mfiScore', 'mfi_score', 'score']), 0);

    const vitACompliance = pickField(r1, ['percentage_compliance', 'compliance', 'percent'], null);
    const vitB3Compliance = pickField(r2, ['percentage_compliance', 'compliance', 'percent'], null);
    const ironCompliance = pickField(r3, ['percentage_compliance', 'compliance', 'percent'], null);

    const vitA = toNumber(pickField(r1, ['value', 'result', 'amount']), 0);
    const vitB3 = toNumber(pickField(r2, ['value', 'result', 'amount']), 0);
    const iron = toNumber(pickField(r3, ['value', 'result', 'amount']), 0);

    const samples = toNumber(pickField(entry, ['samples', 'sample_count', 'count']), results.length || 0);
    const overall = toNumber(pickField(entry, ['overall_mfi_average', 'overall', 'avg', 'average']), 0);

    const aflatoxinScore = toNumber(pickField(entry, ['aflatoxinValue', 'aflatoxin_value', 'aflatoxinScore', 'aflatoxin_score']), undefined);
    const aflatoxinMaxPermitted = pickField(entry, ['aflatoxin_max_permitted', 'maxPercent', 'max_percent'], undefined);
    const percentOfMax = (
      aflatoxinScore != null && aflatoxinMaxPermitted != null && Number(aflatoxinMaxPermitted) !== 0
    ) ? (Number(aflatoxinScore) / Number(aflatoxinMaxPermitted)) * 100 : undefined;

    const fortScore = toNumber(pickField(entry?.fortification || {}, ['score']), undefined);
    const fortWeighted = toNumber(pickField(entry?.fortification || {}, ['overallKMFIWeightedScore']), undefined);

    const kmfiAflatoxin = fortScore ?? toNumber(pickField(entry, ['kmfiAflatoxin', 'kmfi_aflatoxin']), undefined);
    const weightedScore = fortWeighted ?? toNumber(pickField(entry, ['weightedScore', 'overall_weighted', 'weighted']), undefined);

    return {
      type, productTypeName,
      company, brand, size, samples,
      vitA, vitACompliance, score1,
      vitB3, vitB3Compliance, score2,
      iron, ironCompliance, score3,
      overall,
      aflatoxinScore, aflatoxinMaxPermitted, percentOfMax,
      kmfiAflatoxin, weightedScore
    };
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true); setError('');
        const cycleId = typeof cycle === 'string' ? cycle : cycle?.id;
        if (!cycleId) throw new Error('No cycle provided.');
        const url = `/admin/all-product-tests?cycle-id=${encodeURIComponent(cycleId)}`;
        const res = await request(true).get(url);
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.rows || res?.data?.data || []);
        const normalized = list.map(normalizeEntry);
        const wheatRows = normalized.filter((r) => /wheat/i.test(r.type) || /wheat/i.test(r.productTypeName));
        const maizeRows = normalized.filter((r) => /maize/i.test(r.type) || /maize/i.test(r.productTypeName));
        const oilRows = normalized.filter((r) => /oil/i.test(r.type) || /oil/i.test(r.productTypeName) || /edible/i.test(r.productTypeName));
        if (mounted) {
          setWheat(wheatRows);
          setMaize(maizeRows);
          setOils(oilRows);
        }
      } catch (e) {
        if (mounted) setError(e?.response?.data?.message || e?.message || 'Failed to load product tests');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [cycle]);

  // Stats
  const wheatStats = useMemo(() => {
    const rows = wheat; const c = rows.length || 0;
    if (!c) return {samples: 0, vitA: 0, vitB3: 0, iron: 0, overall: 0, vitACompliance: 0, vitB3Compliance: 0, ironCompliance: 0, score1: 0, score2: 0, score3: 0};
    const avg = (key) => rows.reduce((s, r) => s + (Number(r[key]) || 0), 0) / c;
    const avgParse = (key) => rows.reduce((s, r) => s + (parseFloat(r[key]) || 0), 0) / c;
    return {
      samples: avg('samples'), vitA: avg('vitA'), vitB3: avg('vitB3'), iron: avg('iron'), overall: avg('overall'),
      vitACompliance: avgParse('vitACompliance'), vitB3Compliance: avgParse('vitB3Compliance'), ironCompliance: avgParse('ironCompliance'),
      score1: avg('score1'), score2: avg('score2'), score3: avg('score3'),
    };
  }, [wheat]);

  const maizeStats = useMemo(() => {
    const rows = maize; const c = rows.length || 0;
    if (!c) return {samples: 0, vitA: 0, vitB3: 0, iron: 0, overall: 0, vitACompliance: 0, vitB3Compliance: 0, ironCompliance: 0, score1: 0, score2: 0, score3: 0, aflatoxinScore: 0, kmfiAflatoxin: 0, weightedScore: 0};
    const avg = (key) => rows.reduce((s, r) => s + (Number(r[key]) || 0), 0) / c;
    const avgParse = (key) => rows.reduce((s, r) => s + (parseFloat(r[key]) || 0), 0) / c;
    return {
      samples: avg('samples'), vitA: avg('vitA'), vitB3: avg('vitB3'), iron: avg('iron'), overall: avg('overall'),
      vitACompliance: avgParse('vitACompliance'), vitB3Compliance: avgParse('vitB3Compliance'), ironCompliance: avgParse('ironCompliance'),
      score1: avg('score1'), score2: avg('score2'), score3: avg('score3'),
      aflatoxinScore: avg('aflatoxinScore'), kmfiAflatoxin: avg('kmfiAflatoxin'), weightedScore: avg('weightedScore'),
    };
  }, [maize]);

  const oilStats = useMemo(() => {
    const rows = oils; const c = rows.length || 0;
    if (!c) return {samples: 0, vitA: 0, overall: 0, vitACompliance: 0, score1: 0};
    const avg = (key) => rows.reduce((s, r) => s + (Number(r[key]) || 0), 0) / c;
    const avgParse = (key) => rows.reduce((s, r) => s + (parseFloat(r[key]) || 0), 0) / c;
    return {
      samples: avg('samples'), vitA: avg('vitA'), overall: avg('overall'),
      vitACompliance: avgParse('vitACompliance'), score1: avg('score1'),
    };
  }, [oils]);

  return {loading, error, wheat, maize, oils, wheatStats, maizeStats, oilStats};
};
