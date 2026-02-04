// Patch trigger: Added key stats section
/**
 * SATScores component displays SAT assessment scores for companies in a tabular format.
 *
 * Fetches SAT scores for the given cycle from the server, groups them by company, and renders a table with company details and SAT category scores.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Object} props.cycle - The cycle object containing the cycle ID used to fetch SAT scores.
 * @param {string} props.cycle.id - The unique identifier of the cycle.
 * @returns {JSX.Element} The rendered SAT scores table.
 */
import React, {useEffect, useState, useMemo} from 'react';
import PropTypes from 'prop-types';
import {request} from 'common';
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Heading,
  Tooltip,
  Spinner,
  Center,
  HStack,
  Input,
  Button,
  Text,
  Switch,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  Checkbox,
  CheckboxGroup,
  VStack,
  Divider,
  useDisclosure,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Select,
} from '@chakra-ui/react';

// --- helpers ---------------------------------------------------------------
/** Safely coerce any value to a finite number or return null. */
function toNumber(x) {
  if (typeof x === 'number' && Number.isFinite(x)) return x;
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

/** Format a value to 2dp if it’s a number; otherwise an em dash. */
function fmt2(x) {
  const n = toNumber(x);
  return n === null ? '—' : `${n.toFixed(2)}%`;
}

/** Map TIER_3 → T3, TIER_1 → T1, otherwise pass through or em dash. */
function fmtTier(tier) {
  if (!tier) return '—';
  if (tier === 'TIER_3') return 'T3';
  if (tier === 'TIER_1') return 'T1';
  return tier;
}

/** Map LARGE/MEDIUM/SMALL → L/M/S, otherwise pass through or em dash. */
function fmtSize(size) {
  if (!size) return '—';
  if (size === 'LARGE') return 'L';
  if (size === 'MEDIUM') return 'M';
  if (size === 'SMALL') return 'S';
  return size;
}

/** Turn a category name into an acronym (e.g., "Public Engagement" → "PE"). */
function toAcronym(name) {
  if (!name || typeof name !== 'string') return '';
  const stop = new Set(['and', 'of', 'for', 'the', 'to', '&']);
  const parts = name
    .replace(/[_/.-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const letters = parts
    .filter((w) => !stop.has(w.toLowerCase()))
    .map((w) => w[0].toUpperCase());
  const acro = (letters.length ? letters : parts.map((w) => w[0]?.toUpperCase() || '')).join('');
  return acro || name;
}

/** Validate and format a score value for display.
 * If the value is null or not a number, returns an em dash.
 * If it's a number, formats it to 1 decimal place with a percent sign.
 * @param {number|null} value - The score value to format.
 * @return {string} The formatted score value or an em dash.
 */
function fmt1(x) {
  const n = toNumber(x);
  return n === null ? '—' : `${n.toFixed(1)}%`;
}

/**
 * Groups SAT/IVC score data by company and normalizes categories.
 *
 * - Uses `type || score_type` to detect SAT vs IVC.
 * - Normalizes incoming category labels to 5 canonical 4PG names.
 * - Stores `score` (not `value`).
 * - Ignores non-SAT/IVC rows (e.g., IEG).
 *
 * @param {Array<Object>} data
 * @returns {Array<Object>}
 */
function groupByCompany(data) {
  // Normalize various incoming category labels to 5 canonical names
  const normalizeCategory = (raw) => {
    const s = String(raw || '').trim();
    if (!s) return null;
    const lower = s.toLowerCase();
    // Strip leading prefixes like "SAT " / "IVC "
    const noPrefix = lower.replace(/^(sat|ivc)\s+/, '');

    // People Management Systems
    if (noPrefix.includes('people') && noPrefix.includes('management')) {
      return 'People Management Systems';
    }
    // Production, Continuous Improvement & Innovation (handle “Impovement” typo)
    if (
      noPrefix.includes('production') ||
      noPrefix.includes('innovation') ||
      noPrefix.includes('continuous') ||
      noPrefix.includes('impovement') // common typo in data
    ) {
      return 'Production, Continuous Improvement & Innovation';
    }
    // Procurement and Suppliers (aka Procurement & Inputs Management)
    if (
      noPrefix.includes('procurement') ||
      noPrefix.includes('inputs') ||
      noPrefix.includes('suppliers')
    ) {
      return 'Procurement and Suppliers';
    }
    // Public Engagement
    if (noPrefix.includes('public') && noPrefix.includes('engagement')) {
      return 'Public Engagement';
    }
    // Governance & Leadership Culture
    if (noPrefix.includes('governance') || noPrefix.includes('leadership')) {
      return 'Governance & Leadership Culture';
    }
    return null; // ignore non-4PG categories
  };

  const companies = {};
  data.forEach((item) => {
    const id = item.company_id;
    if (!companies[id]) {
      companies[id] = {
        companyName: item.company_name,
        tier: item.tier,
        sizeCategory: item.size_category,
        active: item.active,
        // Initialize canonical categories with sat/ivc slots
        scores: {
          'People Management Systems': {sat: null, ivc: null},
          'Production, Continuous Improvement & Innovation': {sat: null, ivc: null},
          'Procurement and Suppliers': {sat: null, ivc: null},
          'Public Engagement': {sat: null, ivc: null},
          'Governance & Leadership Culture': {sat: null, ivc: null},
        },
      };
    }

    const categoryName = normalizeCategory(item.name);
    if (!categoryName) return; // skip unknown/non-4PG categories

    const kind = String(item.type || item.score_type || '').toUpperCase(); // 'SAT' | 'IVC' | 'IEG'
    if (kind !== 'SAT' && kind !== 'IVC') return; // ignore IEG, etc.

    const val = toNumber(item.score);
    if (val === null) return;

    if (kind === 'SAT') companies[id].scores[categoryName].sat = val;
    if (kind === 'IVC') companies[id].scores[categoryName].ivc = val;
  });

  // Only show active companies (parity with other panels)
  return Object.values(companies).filter((company) => company.active !== false);
}

const SATScores = ({cycle}) => {
  const [satData, setSatData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({key: null, direction: 'asc'});

  const [filters, setFilters] = useState({
    companyNames: [],
    companyQuery: '',
    tier: '',
    size: '',
    hideUnvalidated: false,
  });
  const {isOpen: isCompanyPopoverOpen, onOpen: onCompanyPopoverOpen, onClose: onCompanyPopoverClose} = useDisclosure();

  useEffect(() => {
    const fetchSATScores = async () => {
      setLoading(true);
      try {
        const response = await request(true).get('/admin/all-assessment-scores', {
          params: {'cycle-id': cycle?.id},
        });
        const payload = Array.isArray(response.data) ? response.data : [];
        setSatData(payload);
      } catch (error) {
        console.error('Failed to fetch SAT scores:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSATScores();
  }, [cycle]);

  // Group data by company for table rendering
  const companies = groupByCompany(satData);

  // Memoized list of all unique company names for filter popover
  const allCompanies = useMemo(() => {
    const namesSet = new Set();
    companies.forEach((c) => {
      if (c.companyName) namesSet.add(c.companyName);
    });
    return Array.from(namesSet).sort((a, b) => a.localeCompare(b));
  }, [companies]);

  // Fixed categories in order
  const satCategories = [
    'People Management Systems',
    'Production, Continuous Improvement & Innovation',
    'Procurement and Suppliers',
    'Public Engagement',
    'Governance & Leadership Culture',
  ];

  const ivcCategories = [
    'People Management Systems',
    'Production, Continuous Improvement & Innovation',
    'Procurement and Suppliers',
    'Public Engagement',
    'Governance & Leadership Culture',
  ];

  // Keys for sorting and rendering columns in order
  const columnKeys = [
    'companyName',
    'tier',
    'sizeCategory',
    // SAT categories (prefixed)
    ...satCategories.map((k) => `sat:${k}`),
    'satU', // Self Assessment Tool (SAT (U)) total
    // IVC categories (prefixed)
    ...ivcCategories.map((k) => `ivc:${k}`),
    'satV', // Validated Scores (SAT (V)) total
  ];

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({key, direction});
  };

  // Helper to convert full size name to acronym for filtering
  const sizeToAcronym = (size) => {
    if (!size) return '';
    if (size === 'LARGE') return 'L';
    if (size === 'MEDIUM') return 'M';
    if (size === 'SMALL') return 'S';
    return size;
  };

  // Filter companies based on filters state
  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      // Filter tier
      if (filters.tier && fmtTier(company.tier) !== filters.tier) {
        return false;
      }
      // Filter size
      if (filters.size && fmtSize(company.sizeCategory) !== filters.size) {
        return false;
      }
      // Filter company names (multiselect)
      if (filters.companyNames.length > 0 && !filters.companyNames.includes(company.companyName)) {
        return false;
      }
      // Filter company query (search)
      if (filters.companyQuery) {
        const q = filters.companyQuery.toLowerCase();
        if (!company.companyName || !company.companyName.toLowerCase().includes(q)) {
          return false;
        }
      }
      // Filter hide unvalidated (hide if all ivc scores are null or zero)
      if (filters.hideUnvalidated) {
        const hasValidated = ivcCategories.some((cat) => {
          const val = toNumber(company.scores[cat]?.ivc);
          return val !== null && val > 0;
        });
        if (!hasValidated) return false;
      }
      return true;
    });
  }, [companies, filters, ivcCategories]);

  const sortedCompanies = useMemo(() => {
    const sortable = [...filteredCompanies];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        let aVal; let bVal;
        if (sortConfig.key === 'companyName') {
          aVal = a.companyName || '';
          bVal = b.companyName || '';
          return sortConfig.direction === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        if (sortConfig.key === 'tier') {
          aVal = a.tier || '';
          bVal = b.tier || '';
          return sortConfig.direction === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        if (sortConfig.key === 'sizeCategory') {
          aVal = a.sizeCategory || '';
          bVal = b.sizeCategory || '';
          return sortConfig.direction === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        if (typeof sortConfig.key === 'string' && sortConfig.key.startsWith('sat:')) {
          const cat = sortConfig.key.slice(4);
          aVal = toNumber(a.scores[cat]?.sat) || 0;
          bVal = toNumber(b.scores[cat]?.sat) || 0;
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        if (typeof sortConfig.key === 'string' && sortConfig.key.startsWith('ivc:')) {
          const cat = sortConfig.key.slice(4);
          aVal = toNumber(a.scores[cat]?.ivc) || 0;
          bVal = toNumber(b.scores[cat]?.ivc) || 0;
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        if (sortConfig.key === 'satU') {
          aVal = satCategories.reduce((sum, cat) => sum + (toNumber(a.scores[cat]?.sat) || 0), 0);
          bVal = satCategories.reduce((sum, cat) => sum + (toNumber(b.scores[cat]?.sat) || 0), 0);
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        if (sortConfig.key === 'satV') {
          aVal = ivcCategories.reduce((sum, cat) => sum + (toNumber(a.scores[cat]?.ivc) || 0), 0);
          bVal = ivcCategories.reduce((sum, cat) => sum + (toNumber(b.scores[cat]?.ivc) || 0), 0);
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
    }
    return sortable;
  }, [filteredCompanies, sortConfig]);

  // ---- Key Stats (computed from the CURRENTLY FILTERED view) --------------
  const keyStats = useMemo(() => {
    const sum = (arr) => arr.reduce((s, n) => s + (Number.isFinite(n) ? n : 0), 0);
    const avg = (arr) => {
      const vals = arr.filter((n) => Number.isFinite(n));
      return vals.length ? sum(vals) / vals.length : 0;
    };
    const median = (arr) => {
      const vals = arr.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
      if (!vals.length) return 0;
      const mid = Math.floor(vals.length / 2);
      return vals.length % 2 ? vals[mid] : (vals[mid - 1] + vals[mid]) / 2;
    };
    const get = (v) => (Number.isFinite(v) ? v : 0);

    const rows = filteredCompanies.map((c) => {
      const satByCat = satCategories.map((cat) => get(toNumber(c.scores[cat]?.sat)));
      const ivcByCat = ivcCategories.map((cat) => get(toNumber(c.scores[cat]?.ivc)));
      const satTotal = sum(satByCat);
      const ivcTotal = sum(ivcByCat);
      const variance = satTotal - ivcTotal;
      const absVariance = Math.abs(variance);
      const hasAnyIVC = ivcByCat.some((v) => Number.isFinite(v) && v > 0);
      const fullyValidated = ivcByCat.every((v) => Number.isFinite(v) && v > 0);
      return {c, satByCat, ivcByCat, satTotal, ivcTotal, variance, absVariance, hasAnyIVC, fullyValidated};
    });

    const count = rows.length;
    const satTotals = rows.map((r) => r.satTotal);
    const ivcTotals = rows.map((r) => r.ivcTotal);
    const variances = rows.map((r) => r.variance);
    const absVariances = rows.map((r) => r.absVariance);

    const coverageAnyIVC = count ? (rows.filter((r) => r.hasAnyIVC).length / count) * 100 : 0;
    const fullyValidatedCount = rows.filter((r) => r.fullyValidated).length;
    const zeroIVCCount = rows.filter((r) => r.ivcTotal === 0).length;

    // Per-category averages
    const avgSATByCat = Object.fromEntries(
      satCategories.map((cat, i) => [cat, avg(rows.map((r) => r.satByCat[i]))])
    );
    const avgIVCByCat = Object.fromEntries(
      ivcCategories.map((cat, i) => [cat, avg(rows.map((r) => r.ivcByCat[i]))])
    );

    // Extremes
    const bestSAT = rows.reduce((best, r) => (r.satTotal > (best?.satTotal ?? -Infinity) ? r : best), null);
    const bestIVC = rows.reduce((best, r) => (r.ivcTotal > (best?.ivcTotal ?? -Infinity) ? r : best), null);

    return {
      count,
      coverageAnyIVC, // %
      fullyValidatedCount,
      zeroIVCCount,
      avgSatTotal: avg(satTotals),
      avgIvcTotal: avg(ivcTotals),
      medianSatTotal: median(satTotals),
      medianIvcTotal: median(ivcTotals),
      avgVariance: avg(variances),
      avgAbsVariance: avg(absVariances),
      bestSATName: bestSAT?.c?.companyName || '—',
      bestSATValue: bestSAT?.satTotal || 0,
      bestIVCName: bestIVC?.c?.companyName || '—',
      bestIVCValue: bestIVC?.ivcTotal || 0,
      avgSATByCat,
      avgIVCByCat,
    };
  }, [filteredCompanies, satCategories, ivcCategories]);

  // ---- Overall stats list & show-more toggle -------------------------------
  const [showAllStats, setShowAllStats] = useState(false);

  const overallStats = useMemo(() => {
    return [
      {key: 'count', label: 'Companies', value: String(keyStats.count), help: 'Currently filtered'},
      {key: 'coverageAnyIVC', label: 'Validated Coverage', value: fmt1(keyStats.coverageAnyIVC), help: '% with any IVC > 0'},
      {key: 'fullyValidatedCount', label: 'Fully Validated', value: String(keyStats.fullyValidatedCount), help: 'All 4PGs have IVC > 0'},
      {key: 'zeroIVCCount', label: 'No IVC', value: String(keyStats.zeroIVCCount), help: 'Companies with 0 total IVC'},
      {key: 'avgSatTotal', label: 'Avg SAT (U) Total', value: fmt1(keyStats.avgSatTotal), help: 'Sum across 4PGs'},
      {key: 'avgIvcTotal', label: 'Avg SAT (V) Total', value: fmt1(keyStats.avgIvcTotal), help: 'Validated sum across 4PGs'},
      {key: 'medianSatTotal', label: 'Median SAT (U) Total', value: fmt1(keyStats.medianSatTotal), help: 'Robust central tendency'},
      {key: 'medianIvcTotal', label: 'Median SAT (V) Total', value: fmt1(keyStats.medianIvcTotal), help: 'Validated'},
      {key: 'avgVariance', label: 'Avg Variance (U−V)', value: fmt1(keyStats.avgVariance), help: 'Positive means SAT > IVC'},
      {key: 'avgAbsVariance', label: 'Avg |Variance|', value: fmt1(keyStats.avgAbsVariance), help: 'Across companies'},
      {key: 'bestSAT', label: 'Top SAT (U)', value: fmt1(keyStats.bestSATValue), help: keyStats.bestSATName},
      {key: 'bestIVC', label: 'Top SAT (V)', value: fmt1(keyStats.bestIVCValue), help: keyStats.bestIVCName},
    ];
  }, [keyStats]);

  // Export handler for CSV
  const handleExport = () => {
    // Prepare CSV header using columnKeys
    const headers = columnKeys.map((key) => {
      if (key === 'companyName') return 'Company Name';
      if (key === 'tier') return 'Tier';
      if (key === 'sizeCategory') return 'Size';
      if (key.startsWith('sat:')) return `SAT ${toAcronym(key.slice(4))}`;
      if (key === 'satU') return 'SAT (U) Total';
      if (key.startsWith('ivc:')) return `IVC ${toAcronym(key.slice(4))}`;
      if (key === 'satV') return 'SAT (V) Total';
      return key;
    });
    // Build rows
    const rows = sortedCompanies.map((company) => {
      return columnKeys.map((key) => {
        if (key === 'companyName') return `"${company.companyName ?? ''}"`;
        if (key === 'tier') return fmtTier(company.tier);
        if (key === 'sizeCategory') return fmtSize(company.sizeCategory);

        if (key.startsWith('sat:')) {
          const cat = key.slice(4);
          const val = company.scores[cat]?.sat;
          return val !== undefined && val !== null ? fmt2(val).replace('%', '') : '';
        }
        if (key === 'satU') {
          const total = satCategories.reduce((sum, cat) => {
            const v = toNumber(company.scores[cat]?.sat);
            return sum + (v !== null ? v : 0);
          }, 0);
          return fmt2(total).replace('%', '');
        }

        if (key.startsWith('ivc:')) {
          const cat = key.slice(4);
          const val = company.scores[cat]?.ivc;
          return val !== undefined && val !== null ? fmt2(val).replace('%', '') : '';
        }
        if (key === 'satV') {
          const total = ivcCategories.reduce((sum, cat) => {
            const v = toNumber(company.scores[cat]?.ivc);
            return sum + (v !== null ? v : 0);
          }, 0);
          return fmt2(total).replace('%', '');
        }
        return '';
      });
    });
    // Compose CSV string
    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\r\n');
    const blob = new Blob([csvContent], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sat_scores.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box p={4}>
      <HStack justify="space-between" mb={4}>
        <Heading size="md">SAT Scores</Heading>
        <Button size="sm" colorScheme="blue" onClick={handleExport}>
          Export
        </Button>
      </HStack>
      {/* Key Stats (overall) */}
      <SimpleGrid columns={{base: 1, sm: 2, md: 3, lg: 4}} spacing={4} mb={2}>
        {(showAllStats ? overallStats : overallStats.slice(0, 8)).map((s) => (
          <Stat key={s.key} p={3} borderWidth="1px" borderRadius="md">
            <StatLabel>{s.label}</StatLabel>
            <StatNumber>{s.value}</StatNumber>
            {s.help && <StatHelpText>{s.help}</StatHelpText>}
          </Stat>
        ))}
      </SimpleGrid>
      <HStack justify="flex-end" mb={4}>
        <Button size="xs" variant="ghost" onClick={() => setShowAllStats((v) => !v)}>
          {showAllStats ? 'Show less' : 'Show more'}
        </Button>
      </HStack>

      {/* Per-Category Averages (shown when expanded) */}
      {showAllStats && (
        <SimpleGrid columns={{base: 1, sm: 2, md: 3, lg: 5}} spacing={4} mb={4}>
          {satCategories.map((cat) => (
            <Stat key={`avg-sat-${cat}`} p={3} borderWidth="1px" borderRadius="md">
              <StatLabel>{toAcronym(cat)} Avg (U)</StatLabel>
              <StatNumber>{fmt1(keyStats.avgSATByCat[cat])}</StatNumber>
              <StatHelpText>Category average</StatHelpText>
            </Stat>
          ))}
          {ivcCategories.map((cat) => (
            <Stat key={`avg-ivc-${cat}`} p={3} borderWidth="1px" borderRadius="md">
              <StatLabel>{toAcronym(cat)} Avg (V)</StatLabel>
              <StatNumber>{fmt1(keyStats.avgIVCByCat[cat])}</StatNumber>
              <StatHelpText>Validated category avg</StatHelpText>
            </Stat>
          ))}
        </SimpleGrid>
      )}
      {loading ? (
        <Center py={10}>
          <Spinner size="xl" />
        </Center>
      ) : (
        <Box overflowX="auto">
          <HStack mb={4} spacing={4} align="start" flexWrap="wrap">
            <Popover isOpen={isCompanyPopoverOpen} onOpen={onCompanyPopoverOpen} onClose={onCompanyPopoverClose} closeOnBlur closeOnEsc>
              <PopoverTrigger>
                <Button size="sm" onClick={isCompanyPopoverOpen ? onCompanyPopoverClose : onCompanyPopoverOpen}>
                    Companies ({filters.companyNames.length})
                </Button>
              </PopoverTrigger>
              <PopoverContent maxW="300px">
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverHeader>Select Companies</PopoverHeader>
                <PopoverBody>
                  <Input
                    size="sm"
                    placeholder="Search companies..."
                    mb={2}
                    value={filters.companyQuery}
                    onChange={(e) => setFilters((f) => ({...f, companyQuery: e.target.value}))}
                  />
                  <HStack spacing={2} mb={2}>
                    <Button
                      size="xs"
                      onClick={() =>
                        setFilters((f) => ({
                          ...f,
                          companyNames: allCompanies.filter((name) =>
                            name.toLowerCase().includes(f.companyQuery.toLowerCase()),
                          ),
                        }))
                      }
                    >
                        Select All
                    </Button>
                    <Button
                      size="xs"
                      onClick={() => setFilters((f) => ({...f, companyNames: []}))}
                    >
                        Clear
                    </Button>
                  </HStack>
                  <Divider mb={2} />
                  <Box maxH="200px" overflowY="auto" pr={2}>
                    <CheckboxGroup
                      value={filters.companyNames}
                      onChange={(values) => setFilters((f) => ({...f, companyNames: values}))}
                    >
                      <VStack align="start" spacing={1}>
                        {allCompanies
                          .filter((name) => name.toLowerCase().includes(filters.companyQuery.toLowerCase()))
                          .map((name) => (
                            <Checkbox key={name} value={name}>
                              <Text noOfLines={1} maxW="250px">{name}</Text>
                            </Checkbox>
                          ))}
                      </VStack>
                    </CheckboxGroup>
                  </Box>
                </PopoverBody>
                <PopoverFooter>
                  <Button size="sm" onClick={onCompanyPopoverClose} width="100%">
                      Close
                  </Button>
                </PopoverFooter>
              </PopoverContent>
            </Popover>

            <HStack spacing={1} align="center">
              <Text fontSize="sm">Tier:</Text>
              <Select
                size="sm"
                maxW="80px"
                value={filters.tier}
                onChange={(e) => setFilters((f) => ({...f, tier: e.target.value}))}
              >
                <option value="">All</option>
                <option value="T1">T1</option>
                <option value="T3">T3</option>
                <option value="—">—</option>
              </Select>
            </HStack>

            <HStack spacing={1} align="center">
              <Text fontSize="sm">Size:</Text>
              <Select
                size="sm"
                maxW="80px"
                value={filters.size}
                onChange={(e) => setFilters((f) => ({...f, size: e.target.value}))}
              >
                <option value="">All</option>
                <option value="L">L</option>
                <option value="M">M</option>
                <option value="S">S</option>
                <option value="—">—</option>
              </Select>
            </HStack>

            <HStack spacing={1} align="center">
              <Switch
                id="hide-unvalidated-switch"
                isChecked={filters.hideUnvalidated}
                onChange={(e) => setFilters((f) => ({...f, hideUnvalidated: e.target.checked}))}
              />
              <Text fontSize="sm" htmlFor="hide-unvalidated-switch" userSelect="none">
                  Hide unvalidated
              </Text>
            </HStack>
          </HStack>
          <Box overflowX="auto">
            <Table variant="simple" size="sm" tableLayout="fixed" minWidth="max-content">
              <Thead>
                <Tr>
                  <Th
                    onClick={() => handleSort('companyName')}
                    cursor="pointer"
                    position="sticky"
                    left={0}
                    zIndex={1}
                    bg="white"
                  >
                    <Tooltip label="Company Name" hasArrow>
                      <Box as="span" display="inline">
                        Company Name
                        {sortConfig.key === 'companyName' && (
                          <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                        )}
                      </Box>
                    </Tooltip>
                  </Th>
                  <Th
                    onClick={() => handleSort('tier')}
                    cursor="pointer"
                  >
                    <Tooltip label="Tier" hasArrow>
                      <Box as="span" display="inline">
                        TIER
                        {sortConfig.key === 'tier' && (
                          <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                        )}
                      </Box>
                    </Tooltip>
                  </Th>
                  <Th
                    onClick={() => handleSort('sizeCategory')}
                    cursor="pointer"
                  >
                    <Tooltip label="Size" hasArrow>
                      <Box as="span" display="inline">
                        Size
                        {sortConfig.key === 'sizeCategory' && (
                          <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                        )}
                      </Box>
                    </Tooltip>
                  </Th>
                  {satCategories.map((cat) => (
                    <Th
                      key={'sat-' + cat}
                      onClick={() => handleSort(`sat:${cat}`)}
                      cursor="pointer"
                    >
                      <Tooltip label={`SAT ${cat}`} hasArrow>
                        <Box as="span" display="inline">
                          {toAcronym(cat)}
                          {sortConfig.key === `sat:${cat}` && (
                            <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                          )}
                        </Box>
                      </Tooltip>
                    </Th>
                  ))}
                  <Th
                    onClick={() => handleSort('satU')}
                    cursor="pointer"
                  >
                    <Tooltip label="Self Assessment Tool (SAT (U))" hasArrow>
                      <Box as="span" display="inline">
                        SAT (U)
                        {sortConfig.key === 'satU' && (
                          <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                        )}
                      </Box>
                    </Tooltip>
                  </Th>
                  {ivcCategories.map((cat) => (
                    <Th
                      key={'ivc-' + cat}
                      onClick={() => handleSort(`ivc:${cat}`)}
                      cursor="pointer"
                    >
                      <Tooltip label={`IVC ${cat}`} hasArrow>
                        <Box as="span" display="inline">
                          {toAcronym(cat)}
                          {sortConfig.key === `ivc:${cat}` && (
                            <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                          )}
                        </Box>
                      </Tooltip>
                    </Th>
                  ))}
                  <Th
                    onClick={() => handleSort('satV')}
                    cursor="pointer"
                  >
                    <Tooltip label="Validated Scores (SAT (V))" hasArrow>
                      <Box as="span" display="inline">
                        SAT (V)
                        {sortConfig.key === 'satV' && (
                          <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                        )}
                      </Box>
                    </Tooltip>
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {sortedCompanies.map((company, idx) => (
                  <Tr key={`${company.companyName || 'company'}-${idx}`}>
                    <Td position="sticky" left={0} zIndex={1} bg="white">
                      <Tooltip label={company.companyName} hasArrow>
                        <Box isTruncated maxW="120px">
                          {company.companyName && company.companyName.length > 12
                            ? company.companyName.slice(0, 12)
                            : company.companyName}
                        </Box>
                      </Tooltip>
                    </Td>
                    <Td>{fmtTier(company.tier)}</Td>
                    <Td>{fmtSize(company.sizeCategory)}</Td>
                    {satCategories.map((cat) => (
                      <Td key={'sat-' + cat}>
                        {fmt2(company.scores[cat]?.sat)}
                      </Td>
                    ))}
                    <Td>
                      {fmt2(satCategories.reduce((sum, cat) => {
                        const val = toNumber(company.scores[cat]?.sat);
                        return sum + (val !== null ? val : 0);
                      }, 0))}
                    </Td>
                    {ivcCategories.map((cat) => (
                      <Td key={'ivc-' + cat}>
                        {fmt2(company.scores[cat]?.ivc)}
                      </Td>
                    ))}
                    <Td>
                      {fmt2(ivcCategories.reduce((sum, cat) => {
                        const val = toNumber(company.scores[cat]?.ivc);
                        return sum + (val !== null ? val : 0);
                      }, 0))}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}
    </Box>
  );
};

SATScores.propTypes = {
  cycle: PropTypes.object.isRequired,
};

export default SATScores;
