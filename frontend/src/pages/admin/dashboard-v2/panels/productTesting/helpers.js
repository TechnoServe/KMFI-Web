// Formatting
export const fmt2 = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(2) : '—';
};
export const fmtPct2 = (v) => {
  if (v == null || v === '') return '—';
  const n = parseFloat(String(v).toString().replace(/%/g, ''));
  return Number.isFinite(n) ? `${n.toFixed(2)}%` : String(v);
};

// Generic pick
export const pickField = (obj, keys, def = undefined) => {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return def;
};

// Nutrient finders
export const findNutrient = (results, namesLike) => {
  if (!Array.isArray(results)) return null;
  const match = (s = '') => namesLike.some((n) => new RegExp(n, 'i').test(String(s)));
  for (const r of results) {
    const name = pickField(r, ['name', 'nutrient', 'microNutrient', 'micro_nutrient', 'micro_nutrient_name', 'micronutrient_name', 'mnName', 'label'], '');
    if (match(name)) return r;
  }
  return null;
};
export const findVitaminAResult = (results) => {
  if (!Array.isArray(results)) return null;
  const fields = ['name', 'nutrient', 'microNutrient', 'micro_nutrient', 'micro_nutrient_name', 'micronutrient_name', 'mnName', 'label', 'code', 'key', 'shortName'];
  const isVitA = (s = '') => /vit(?:amin)?\.?\s*A\b/i.test(String(s)) || /retinol/i.test(String(s)) || /retinyl/i.test(String(s)) || /\bVA\b/i.test(String(s));
  for (const r of results) {
    for (const f of fields) {
      const v = r && r[f];
      if (typeof v === 'string' && isVitA(v)) return r;
    }
  }
  for (const r of results) {
    const text = fields.map((f) => (r && r[f]) || '').join(' ').toLowerCase();
    if (text && text.includes('vit') && text.includes('a') && !/b3|niacin/.test(text)) return r;
  }
  return null;
};

// Banding
export const getPercentForBand = (row) => {
  const toPct = (x) => x == null ? null : Number(String(x).toString().replace(/%/g, ''));
  const parts = [toPct(row?.vitACompliance), toPct(row?.vitB3Compliance), toPct(row?.ironCompliance)].filter((v) => Number.isFinite(v));
  if (parts.length) return parts.reduce((a, b) => a + b, 0) / parts.length;

  const ws = Number(row?.weightedScore);
  if (Number.isFinite(ws) && ws >= 0 && ws <= 100) return ws;

  const ov = Number(row?.overall);
  if (Number.isFinite(ov)) {
    if (ov <= 30) return (ov / 30) * 100;
    if (ov <= 100) return ov;
  }
  return null;
};
export const getBandLabel = (pct) => {
  if (pct == null || !Number.isFinite(pct)) return '—';
  if (pct >= 100) return 'Fully Fortified';
  if (pct >= 80) return 'Adequately Fortified';
  if (pct >= 51) return 'Partly Fortified';
  if (pct >= 31) return 'Inadequately Fortified';
  return 'Not Fortified';
};
export const getBandColorScheme = (label) => {
  switch (label) {
    case 'Fully Fortified': return 'green';
    case 'Adequately Fortified': return 'teal';
    case 'Partly Fortified': return 'orange';
    case 'Inadequately Fortified': return 'red';
    case 'Not Fortified': return 'red';
    default: return 'gray';
  }
};

// Misc
export const toNumber = (v, def = 0) => {
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n : def;
};
export const inRange = (val, min, max) => {
  const n = Number(val);
  const hasMin = min !== '' && min !== null && min !== undefined;
  const hasMax = max !== '' && max !== null && max !== undefined;
  if (hasMin && Number(n) < Number(min)) return false;
  if (hasMax && Number(n) > Number(max)) return false;
  return true;
};
export const overallColor = (score) => {
  const v = Number(score) || 0;
  if (v >= 28) return 'green.600';
  if (v >= 22) return 'yellow.600';
  return 'red.600';
};

// CSV
export const toCSVRow = (values) =>
  values.map((v) => {
    if (v == null) return '';
    const s = String(v);
    const needsQuote = /[",\n]/.test(s);
    const escaped = s.replace(/"/g, '""');
    return needsQuote ? `"${escaped}"` : escaped;
  }).join(',');
export const downloadCSV = (filename, header, rows) => {
  const csv = [toCSVRow(header), ...rows.map(toCSVRow)].join('\n');
  const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
