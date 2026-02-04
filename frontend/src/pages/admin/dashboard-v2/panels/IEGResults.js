import React, {useState, useMemo, useEffect} from 'react';
import PropTypes from 'prop-types';
import {Box, Heading, Text, VStack, Stat, StatLabel, StatNumber, StatHelpText, SimpleGrid, Table, Thead, Tbody, Tr, Th, Td, Select, IconButton, Tooltip, Spinner, Center, HStack, Button, Checkbox, CheckboxGroup, Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverArrow, PopoverCloseButton, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Flex} from '@chakra-ui/react';
import {TriangleDownIcon, TriangleUpIcon} from '@chakra-ui/icons';
import {request} from 'common';

// Map backend category IDs → pillar codes used in this UI.
// TODO: Fill in the real IDs for each pillar once known.
const CATEGORY_ID_TO_PILLAR = {
  // 'DDjEmOJlIbpkwOXgW5hq': 'PMS',
  // '...PCII_ID...': 'PCII',
  // '...PIM_ID...': 'PIM',
  // '...PE_ID...': 'PE',
  // '...GLC_ID...': 'GLC',
};

const CATEGORY_NAME_TO_PILLAR = {
  'People Management Systems': 'PMS',
  'Production, Continuous Improvement & Innovation': 'PCII',
  'Production, Continuous Impovement & Innovation': 'PCII', // tolerate server typo
  'Procurement & Inputs Management': 'PIM',
  'Public Engagement': 'PE',
  'Governance & Leadership Culture': 'GLC',
};

const pillarKeys = ['PMS', 'PCII', 'PIM', 'PE', 'GLC'];

/**
 * Convert a single backend row to a normalized numeric percent (0-100).
 */
function rowToPercent(row) {
  const v = Number(row?.value);
  const w = Number(row?.weight) || 0;
  if (!Number.isFinite(v) || !Number.isFinite(w) || w <= 0) return 0;
  const pct = (v / w) * 100;
  return Math.max(0, Math.min(100, +pct.toFixed(1)));
}

/**
 * Given an array of backend rows, aggregate into one row per company with pillar fields.
 * Output shape matches the table: { company, category, pms, pcii, pim, pe, glc, total }
 */
function aggregateIEGRows(rows) {
  const byCompany = new Map();
  for (const r of rows) {
    const company = r.company_name || r.companyName || r.company || r.name || '—';
    const category = r.size_category || r.sizeCategory || r.category || '—';
    const key = `${company}__${category}`;
    const rec = byCompany.get(key) || {company, category, tier: (r.tier || '—'), pms: 0, pcii: 0, pim: 0, pe: 0, glc: 0};

    const pillar = CATEGORY_NAME_TO_PILLAR[r.category_name] || CATEGORY_ID_TO_PILLAR[r.category_id];
    const pct = r.value;// rowToPercent(r);
    if (pillar === 'PMS') rec.pms = pct;
    else if (pillar === 'PCII') rec.pcii = pct;
    else if (pillar === 'PIM') rec.pim = pct;
    else if (pillar === 'PE') rec.pe = pct;
    else if (pillar === 'GLC') rec.glc = pct;
    // If pillar mapping unknown, we skip assigning to a pillar.

    if (r.tier && rec.tier !== r.tier) rec.tier = r.tier;

    byCompany.set(key, rec);
  }

  // Compute totals with weighted formula if pillars exist; otherwise average of available percents
  return Array.from(byCompany.values()).map((rec) => {
    const hasAny = [rec.pms, rec.pcii, rec.pim, rec.pe, rec.glc].some((n) => Number(n) > 0);
    let total;
    if (hasAny) {
      const values = [rec.pms, rec.pcii, rec.pim, rec.pe, rec.glc].filter((n) => Number.isFinite(n));
      total = values.reduce((acc, v) => acc + v, 0);
    } else {
      // Fallback: average of all category_id rows for that company if mapping unknown
      total = 0;
    }
    return {...rec, total};
  });
}

const IEGResults = ({cycle}) => {
  const [sortConfig, setSortConfig] = useState({key: 'total', direction: 'desc'});
  const [categoryFilter, setCategoryFilter] = useState('');

  const [companyFilter, setCompanyFilter] = useState([]);
  const [data, setData] = useState([]);

  // Tier / Pillar / Score filters
  const [tierFilter, setTierFilter] = useState([]); // e.g., ['TIER_1','TIER_3']
  const [scoreMin, setScoreMin] = useState(''); // string so NumberInput controls nicely
  const [scoreMax, setScoreMax] = useState('');
  const [showAllStats, setShowAllStats] = useState(false);

  const tierOptions = useMemo(
    () => Array.from(new Set((data || []).map((d) => d.tier).filter(Boolean))).sort(),
    [data]
  );

  const companyOptions = useMemo(
    () => Array.from(new Set((data || []).map((d) => d.company))).sort((a, b) => a.localeCompare(b)),
    [data]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const cycleId = cycle?.id;
    if (!cycleId) {
      setError('Missing \'cycle-id\'. Add ?cycle-id=... to URL or store it.');
      return;
    }
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await request(true).get(`/admin/all-ieg-scores?cycle-id=${cycleId}`);
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.scores || []);
        const activeList = list.filter((item) => item.active);
        const rows = aggregateIEGRows(activeList);
        if (mounted) setData(rows);
      } catch (e) {
        if (mounted) setError(e?.response?.data?.message || e?.message || 'Failed to load IEG scores');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const sortedData = useMemo(() => {
    const norm = (x) => (x ?? '').toString().trim().toUpperCase();
    let filtered = categoryFilter ? data.filter((d) => norm(d.category) === norm(categoryFilter)) : data;

    // Company multi-select
    if (companyFilter.length > 0) {
      const set = new Set(companyFilter);
      filtered = filtered.filter((d) => set.has(d.company));
    }

    // Tier multi-select
    if (tierFilter.length > 0) {
      const set = new Set(tierFilter);
      filtered = filtered.filter((d) => d.tier && set.has(d.tier));
    }


    // Score range (total)
    const minVal = scoreMin === '' ? -Infinity : Number(scoreMin);
    const maxVal = scoreMax === '' ? +Infinity : Number(scoreMax);
    filtered = filtered.filter((d) => {
      const t = Number(d.total);
      return Number.isFinite(t) && t >= minVal && t <= maxVal;
    });

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        const toNum = (v) => {
          const n = typeof v === 'number' ? v : parseFloat(v);
          return Number.isFinite(n) ? n : null;
        };

        const na = toNum(aVal);
        const nb = toNum(bVal);

        let cmp = 0;
        if (na !== null && nb !== null) {
          // numeric compare
          cmp = na === nb ? 0 : (na < nb ? -1 : 1);
        } else {
          // string compare (case-insensitive)
          const sa = (aVal ?? '').toString().toUpperCase();
          const sb = (bVal ?? '').toString().toUpperCase();
          cmp = sa.localeCompare(sb);
        }

        return sortConfig.direction === 'asc' ? cmp : -cmp;
      });
    }
    return filtered;
  }, [data, sortConfig, categoryFilter, companyFilter, tierFilter, scoreMin, scoreMax]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({key, direction});
  };

  const avgTotal = useMemo(() => {
    if (!data.length) return 0;
    const s = data.reduce((acc, r) => acc + (Number.isFinite(r.total) ? r.total : 0), 0);
    return (s / data.length).toFixed(0);
  }, [data]);

  const keyStats = useMemo(() => {
    const rows = sortedData || [];
    const nums = (arr) => arr.filter((n) => Number.isFinite(n));
    const avg = (arr) => {
      const v = nums(arr);
      return v.length ? v.reduce((s, n) => s + n, 0) / v.length : 0;
    };
    const median = (arr) => {
      const v = nums(arr).slice().sort((a, b) => a - b);
      if (!v.length) return 0;
      const m = Math.floor(v.length / 2);
      return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
    };

    const count = rows.length;
    const totals = rows.map((r) => Number(r.total));
    const pms = rows.map((r) => Number(r.pms));
    const pcii = rows.map((r) => Number(r.pcii));
    const pim = rows.map((r) => Number(r.pim));
    const pe = rows.map((r) => Number(r.pe));
    const glc = rows.map((r) => Number(r.glc));

    const maxRow = rows.reduce((best, r) => (Number(r.total) > Number(best?.total ?? -Infinity) ? r : best), null);
    const minRow = rows.reduce((best, r) => (Number(r.total) < Number(best?.total ?? +Infinity) ? r : best), null);

    return {
      count,
      avgTotal: avg(totals),
      medianTotal: median(totals),
      topName: maxRow?.company || '—',
      topValue: Number(maxRow?.total ?? 0),
      bottomName: minRow?.company || '—',
      bottomValue: Number(minRow?.total ?? 0),
      avgPMS: avg(pms),
      avgPCII: avg(pcii),
      avgPIM: avg(pim),
      avgPE: avg(pe),
      avgGLC: avg(glc),
    };
  }, [sortedData]);

  const statsList = useMemo(() => (
    [
      {key: 'count', label: 'Companies', value: `${keyStats.count}`, help: 'Currently filtered'},
      {key: 'avg', label: 'Average IEG Score', value: `${keyStats.avgTotal.toFixed(1)}%`},
      {key: 'median', label: 'Median IEG Score', value: `${keyStats.medianTotal.toFixed(1)}%`},
      {key: 'top', label: 'Top Company', value: `${keyStats.topValue.toFixed(1)}%`, help: keyStats.topName},
      {key: 'bottom', label: 'Bottom Company', value: `${keyStats.bottomValue.toFixed(1)}%`, help: keyStats.bottomName},
      {key: 'pms', label: 'PMS Avg', value: `${keyStats.avgPMS.toFixed(1)}%`},
      {key: 'pcii', label: 'PCII Avg', value: `${keyStats.avgPCII.toFixed(1)}%`},
      {key: 'pim', label: 'PIM Avg', value: `${keyStats.avgPIM.toFixed(1)}%`},
      {key: 'pe', label: 'PE Avg', value: `${keyStats.avgPE.toFixed(1)}%`},
      {key: 'glc', label: 'GLC Avg', value: `${keyStats.avgGLC.toFixed(1)}%`},
    ]
  ), [keyStats]);

  // Export CSV handler
  const handleExportCSV = () => {
    const headers = Object.keys(sortedData[0] || {});
    const csvRows = [headers.join(',')];
    sortedData.forEach((row) => {
      csvRows.push(headers.map((h) => JSON.stringify(row[h] ?? '')).join(','));
    });
    const blob = new Blob([csvRows.join('\n')], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'IEG_Results.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Heading size="lg" mb={4}>
        IEG Results Overview
      </Heading>
      <Text mb={6}>
        Insights on Independent Expert Group (IEG) validation results across companies. These are used to compare internal SAT self-reported scores with external validation outcomes.
      </Text>
      <Box mb={6}>
        {/* First row: first 5 key stats (non-scrollable) */}
        <SimpleGrid columns={{base: 1, sm: 2, md: 3, lg: 5}} spacing={4}>
          {statsList.slice(0, 5).map((s) => (
            <Stat key={s.key} p={4} borderWidth="1px" borderRadius="md">
              <StatLabel>{s.label}</StatLabel>
              <StatNumber>{s.value}</StatNumber>
              {s.help ? <StatHelpText>{s.help}</StatHelpText> : null}
            </Stat>
          ))}
        </SimpleGrid>

        {/* Toggle button aligned bottom-right */}
        <HStack justify="flex-end" mt={2}>

          <Button size="sm" variant="ghost" onClick={() => setShowAllStats((v) => !v)}>
            {showAllStats ? 'Show less' : 'Show more'}
          </Button>
        </HStack>

        {/* Expanded section: remaining key stats render below */}
        {showAllStats && (
          <SimpleGrid columns={{base: 1, sm: 2, md: 3, lg: 5}} spacing={4} mt={4}>
            {statsList.slice(5).map((s) => (
              <Stat key={s.key} p={4} borderWidth="1px" borderRadius="md">
                <StatLabel>{s.label}</StatLabel>
                <StatNumber>{s.value}</StatNumber>
                {s.help ? <StatHelpText>{s.help}</StatHelpText> : null}
              </Stat>
            ))}
          </SimpleGrid>
        )}
      </Box>

      <HStack mb={4} spacing={3} align="start" flexWrap="wrap">
        <Select placeholder="Filter by Size" onChange={(e) => setCategoryFilter(e.target.value)} width="220px">
          <option value="LARGE">Large</option>
          <option value="MEDIUM">Medium</option>
          <option value="SMALL">Small</option>
        </Select>

        <Popover placement="bottom-start">
          <PopoverTrigger>
            <Button size="sm" variant="outline">
              {companyFilter.length > 0 ? `Companies (${companyFilter.length})` : 'Filter by Company'}
            </Button>
          </PopoverTrigger>
          <PopoverContent w="320px">
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader fontWeight="semibold">Select companies</PopoverHeader>
            <PopoverBody>
              <HStack justify="space-between" mb={2}>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => setCompanyFilter(companyOptions)}
                  isDisabled={companyOptions.length === 0}
                >
                  Select all
                </Button>
                <Button size="xs" variant="ghost" onClick={() => setCompanyFilter([])}>
                  Clear
                </Button>
              </HStack>
              <Box maxH="220px" overflowY="auto" pr={1}>
                <CheckboxGroup value={companyFilter} onChange={(vals) => setCompanyFilter(vals)}>
                  <VStack align="start" spacing={2}>
                    {companyOptions.map((name) => (
                      <Checkbox key={name} value={name}>
                        {name}
                      </Checkbox>
                    ))}
                  </VStack>
                </CheckboxGroup>
              </Box>
            </PopoverBody>
          </PopoverContent>
        </Popover>

        {/* Tier multi-select */}
        <Popover placement="bottom-start">
          <PopoverTrigger>
            <Button size="sm" variant="outline">
              {tierFilter.length > 0 ? `Tiers (${tierFilter.length})` : 'Filter by Tier'}
            </Button>
          </PopoverTrigger>
          <PopoverContent w="260px">
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader fontWeight="semibold">Select tiers</PopoverHeader>
            <PopoverBody>
              <HStack justify="space-between" mb={2}>
                <Button size="xs" variant="ghost" onClick={() => setTierFilter(tierOptions)} isDisabled={tierOptions.length === 0}>Select all</Button>
                <Button size="xs" variant="ghost" onClick={() => setTierFilter([])}>Clear</Button>
              </HStack>
              <Box maxH="200px" overflowY="auto" pr={1}>
                <CheckboxGroup value={tierFilter} onChange={(vals) => setTierFilter(vals)}>
                  <VStack align="start" spacing={2}>
                    {tierOptions.map((t) => (
                      <Checkbox key={t} value={t}>{t}</Checkbox>
                    ))}
                  </VStack>
                </CheckboxGroup>
              </Box>
            </PopoverBody>
          </PopoverContent>
        </Popover>


        {/* Score range (Total %) */}
        <HStack spacing={2} align="center">
          <Text fontSize="sm">Score:</Text>
          <NumberInput size="sm" maxW="80px" min={0} max={100} value={scoreMin} onChange={(v) => setScoreMin(v)}>
            <NumberInputField placeholder="Min" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <Text>–</Text>
          <NumberInput size="sm" maxW="80px" min={0} max={100} value={scoreMax} onChange={(v) => setScoreMax(v)}>
            <NumberInputField placeholder="Max" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </HStack>

        <Button colorScheme="blue" onClick={handleExportCSV} size='sm' variant="outline">
          Export CSV
        </Button>
      </HStack>

      {loading && (
        <Center py={10}><Spinner size="lg" /></Center>
      )}
      {error && !loading && (
        <Box mb={4} color="red.500">{error}</Box>
      )}

      <Table variant="simple" mt={10}>
        <Thead>
          <Tr>
            <Th onClick={() => requestSort('company')} cursor="pointer" userSelect="none">
              <HStack spacing={1}>
                <Box as="span">Participating Company</Box>
                {sortConfig.key === 'company' && (
                  <IconButton size="xs" aria-label="sort" icon={sortConfig.direction === 'asc' ? <TriangleUpIcon/> : <TriangleDownIcon/>} variant="ghost" />
                )}
              </HStack>
            </Th>
            <Th onClick={() => requestSort('category')} cursor="pointer" userSelect="none">
              <HStack spacing={1}>
                <Box as="span">Category</Box>
                {sortConfig.key === 'category' && (
                  <IconButton size="xs" aria-label="sort" icon={sortConfig.direction === 'asc' ? <TriangleUpIcon/> : <TriangleDownIcon/>} variant="ghost" />
                )}
              </HStack>
            </Th>
            <Tooltip label="People Management Systems (15%)" placement="top">
              <Th onClick={() => requestSort('pms')} cursor="pointer" userSelect="none">
                <HStack spacing={1}>
                  <Box as="span">PMS</Box>
                  {sortConfig.key === 'pms' && (
                    <IconButton size="xs" aria-label="sort" icon={sortConfig.direction === 'asc' ? <TriangleUpIcon/> : <TriangleDownIcon/>} variant="ghost" />
                  )}
                </HStack>
              </Th>
            </Tooltip>
            <Tooltip label="Production, Continuous Improvement & Innovation (25%)" placement="top">
              <Th onClick={() => requestSort('pcii')} cursor="pointer" userSelect="none">
                <HStack spacing={1}>
                  <Box as="span">PCII</Box>
                  {sortConfig.key === 'pcii' && (
                    <IconButton size="xs" aria-label="sort" icon={sortConfig.direction === 'asc' ? <TriangleUpIcon/> : <TriangleDownIcon/>} variant="ghost" />
                  )}
                </HStack>
              </Th>
            </Tooltip>
            <Tooltip label="Procurement & Inputs Management (25%)" placement="top">
              <Th onClick={() => requestSort('pim')} cursor="pointer" userSelect="none">
                <HStack spacing={1}>
                  <Box as="span">PIM</Box>
                  {sortConfig.key === 'pim' && (
                    <IconButton size="xs" aria-label="sort" icon={sortConfig.direction === 'asc' ? <TriangleUpIcon/> : <TriangleDownIcon/>} variant="ghost" />
                  )}
                </HStack>
              </Th>
            </Tooltip>
            <Tooltip label="Public Engagement (10%)" placement="top">
              <Th onClick={() => requestSort('pe')} cursor="pointer" userSelect="none">
                <HStack spacing={1}>
                  <Box as="span">PE</Box>
                  {sortConfig.key === 'pe' && (
                    <IconButton size="xs" aria-label="sort" icon={sortConfig.direction === 'asc' ? <TriangleUpIcon/> : <TriangleDownIcon/>} variant="ghost" />
                  )}
                </HStack>
              </Th>
            </Tooltip>
            <Tooltip label="Governance & Leadership Culture (25%)" placement="top">
              <Th onClick={() => requestSort('glc')} cursor="pointer" userSelect="none">
                <HStack spacing={1}>
                  <Box as="span">GLC</Box>
                  {sortConfig.key === 'glc' && (
                    <IconButton size="xs" aria-label="sort" icon={sortConfig.direction === 'asc' ? <TriangleUpIcon/> : <TriangleDownIcon/>} variant="ghost" />
                  )}
                </HStack>
              </Th>
            </Tooltip>
            <Tooltip label="Total Score (100%)" placement="top">
              <Th onClick={() => requestSort('total')} cursor="pointer" userSelect="none">
                <HStack spacing={1}>
                  <Box as="span">TOTAL</Box>
                  {sortConfig.key === 'total' && (
                    <IconButton size="xs" aria-label="sort" icon={sortConfig.direction === 'asc' ? <TriangleUpIcon/> : <TriangleDownIcon/>} variant="ghost" />
                  )}
                </HStack>
              </Th>
            </Tooltip>
          </Tr>
        </Thead>
        <Tbody>
          {sortedData.map((row, idx) => (
            <Tr key={idx}>
              <Td>{row.company}</Td>
              <Td>{row.category}</Td>
              <Td>{Number.isFinite(row.pms) ? row.pms : 0}%</Td>
              <Td>{Number.isFinite(row.pcii) ? row.pcii : 0}%</Td>
              <Td>{Number.isFinite(row.pim) ? row.pim : 0}%</Td>
              <Td>{Number.isFinite(row.pe) ? row.pe : 0}%</Td>
              <Td>{Number.isFinite(row.glc) ? row.glc : 0}%</Td>
              <Td color={
                row.total >= 85 ? 'green.500' :
                  row.total >= 70 ? 'yellow.500' : 'red.500'
              }>{row.total}%</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};


IEGResults.propTypes = {
  cycle: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
};

export default IEGResults;
