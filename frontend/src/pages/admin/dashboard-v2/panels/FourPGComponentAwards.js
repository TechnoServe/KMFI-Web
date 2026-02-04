import React, {useEffect, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import {
  Badge,
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Collapse,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  Select,
  SimpleGrid,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
  Text,
  useColorModeValue,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import {ChevronDownIcon, SearchIcon} from '@chakra-ui/icons';
import {request} from 'common';

const FourPGComponentAwards = ({cycle, data = []}) => {
  // Weights for total average (as shown in tooltips)
  const WEIGHTS = {pms: 0.15, pcii: 0.25, pim: 0.25, pe: 0.10, glc: 0.25};

  // Predefined thresholds for identifying top performance per component
  // Adjust these as needed to match program standards
  const THRESHOLDS = {pms: 85, pcii: 85, pim: 85, pe: 80, glc: 85, totalAvg: 85};

  // Prefer upstream-provided data; fall back to a small sample
  const {isOpen, onOpen, onClose} = useDisclosure();
  const {
    isOpen: isMIOpen,
    onOpen: onMIOpen,
    onClose: onMIClose,
  } = useDisclosure();
  const [categoryFilter, setCategoryFilter] = useState('');
  const [awardFilter, setAwardFilter] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [companySearch, setCompanySearch] = useState('');

  // --- Most Improved Overall (baseline compare) ---
  const [baselineCycleId, setBaselineCycleId] = useState('');
  const [baselineScores, setBaselineScores] = useState([]);
  const [baselineLoading, setBaselineLoading] = useState(false);
  const [baselineError, setBaselineError] = useState('');
  // --- Baseline cycles metadata & suggestion ---
  const [cyclesMeta, setCyclesMeta] = useState([]);
  const [suggestedBaseline, setSuggestedBaseline] = useState('');
  // --- Baseline loader for Most Improved Overall ---
  const loadBaseline = async (cid) => {
    const cycleId = (cid || baselineCycleId || '').trim();
    if (!cycleId) {
      setBaselineError('Please select a baseline cycle.');
      return false;
    }
    try {
      setBaselineError('');
      setBaselineLoading(true);
      const json = await request(true).get(`/admin/4pg-scores?cycle-id=${encodeURIComponent(cycleId)}&only-active=1`);
      const rows = Array.isArray(json?.data) ? json.data : [];
      const norm = rows.map((r) => ({
        name: r.name || r.company_name || r.company?.name || '—',
        totalAvg: Number(r.totalAvg ?? r.total ?? r['Total Averages - 100%'] ?? r['Total Average'] ?? 0),
        category: r.category || r.size || r.size_category || r.company?.size || 'Unknown',
      })).filter((r) => r.name && Number.isFinite(r.totalAvg));
      setBaselineScores(norm);
      return true;
    } catch (e) {
      setBaselineScores([]);
      setBaselineError(e?.response?.data?.message || e?.message || 'Failed to load baseline cycle');
      return false;
    } finally {
      setBaselineLoading(false);
    }
  };

  // --- Auto-suggest previous cycle (populate baselineCycleId) ---
  const tryFetch = async (url) => {
    try {
      const res = await request(true).get(url);
      return res?.data || null;
    } catch (e) {
      return null;
    }
  };

  const toMillis = (ts) => {
    if (!ts) return 0;
    if (typeof ts === 'number') return ts * 1000; // assume seconds
    if (typeof ts === 'string') {
      const d = Date.parse(ts);
      return Number.isNaN(d) ? 0 : d;
    }
    if (typeof ts === 'object' && ts._seconds != null) return ts._seconds * 1000;
    return 0;
  };

  const normalizeCycles = (arr) => {
    const list = Array.isArray(arr) ? arr : [];
    return list.map((c) => ({
      id: c.id || c.cycle_id || c._id || c.value || c.slug || String(c),
      name: c.name || c.description || '',
      previous_id: c.previous_id || '',
      previous: !!c.previous,
      active: !!c.active,
      start_ms: toMillis(c.start_date) || toMillis(c.startDate) || 0,
      end_ms: toMillis(c.end_date) || toMillis(c.endDate) || 0,
    })).filter((c) => !!c.id);
  };

  useEffect(() => {
    const currentId = (typeof cycle === 'string' ? cycle : cycle?.id) || '';
    if (!currentId) return;
    let mounted = true;
    (async () => {
      // Fetch cycles from the canonical endpoint
      const data = await tryFetch('/admin/cycles');
      if (!mounted || !Array.isArray(data) || !data.length) return;
      const norm = normalizeCycles(data);
      if (!norm.length) return;
      // Sort by start date descending (newest first)
      const sorted = norm.slice().sort((a, b) => (b.start_ms || 0) - (a.start_ms || 0));
      setCyclesMeta(sorted);

      // Identify current cycle in the list
      const current = sorted.find((c) => String(c.id) === String(currentId));
      if (!current) return;

      // Preferred previous: follow explicit previous_id when provided
      let prevId = '';
      if (current.previous_id && current.previous_id !== '0') {
        prevId = current.previous_id;
      } else {
        // Fallback 1: any cycle flagged as previous=true (closest by date)
        const flaggedPrev = sorted.find((c) => c.previous === true);
        if (flaggedPrev) prevId = flaggedPrev.id;
        // Fallback 2: the next item in date-desc list (older than current)
        if (!prevId) {
          const idx = sorted.findIndex((c) => String(c.id) === String(currentId));
          if (idx >= 0 && idx < sorted.length - 1) {
            prevId = sorted[idx + 1].id;
          }
        }
      }

      if (!mounted) return;
      if (prevId) {
        setSuggestedBaseline(prevId);
        if (!baselineCycleId) setBaselineCycleId(prevId);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [cycle]);


  const [apiScores, setApiScores] = useState([]);
  const [apiScoresLoading, setApiScoresLoading] = useState(false);
  const [apiScoresError, setApiScoresError] = useState('');
  const [showMoreStats, setShowMoreStats] = useState(false);
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const infoBg = useColorModeValue('gray.50', 'gray.700');
  const [sortConfig, setSortConfig] = useState({key: 'totalAvg', direction: 'desc'});

  useEffect(() => {
    const cycleId = typeof cycle === 'string' ? cycle : cycle?.id;
    if (!cycleId) return; // no cycle yet
    const controller = new AbortController();
    const loadScores = async () => {
      try {
        setApiScoresError('');
        setApiScoresLoading(true);
        // Ask backend for table-ready rows; filter only active companies server-side
        const json = await request(true).get(`/admin/4pg-scores?cycle-id=${cycleId}&only-active=1`);
        const rows = Array.isArray(json?.data) ? json.data : [];
        // Normalize: ensure required fields exist with safe defaults
        const norm = rows.map((r) => ({
          name: r.name || r.company_name || r.company?.name || '—',
          category: r.category || r.size || r.size_category || r.company?.size || 'Unknown',
          pms: Number(r.pms ?? r.PMS ?? 0),
          pcii: Number(r.pcii ?? r.PCII ?? 0),
          pim: Number(r.pim ?? r.PIM ?? 0),
          pe: Number(r.pe ?? r.PE ?? 0),
          glc: Number(r.glc ?? r.GLC ?? 0),
          totalAvg: Number(
            r.totalAvg ?? r.total ?? r['Total Averages - 100%'] ?? r['Total Average'] ?? 0
          ),
          cycle_id: r.cycle_id || r.cycleId || r.cycle || cycleId,
          active: r.active ?? r.company_active ?? r.company?.active ?? r.company?.is_active ?? true,
        })).filter((r) => r.active === true);
        setApiScores(norm);
      } catch (err) {
        setApiScores([]);
        setApiScoresError(err.message || 'Failed to load 4PG scores');
      } finally {
        setApiScoresLoading(false);
      }
    };
    loadScores();
    return () => controller.abort();
  }, [cycle]);


  const companies = useMemo(() => {
    const base = (Array.isArray(apiScores) && apiScores.length > 0)
      ? apiScores
      : (Array.isArray(data) && data.length > 0
          ? data
          : []);
    // Optional cycle filtering if rows include a cycle_id matching the current cycle
    const cycleStr = typeof cycle === 'string' ? cycle : cycle?.id;
    if (base.length && base[0] && Object.prototype.hasOwnProperty.call(base[0], 'cycle_id') && cycleStr) {
      return base.filter((r) => String(r.cycle_id) === String(cycleStr));
    }
    return base;
  }, [apiScores, data, cycle]);

  const allCompanies = useMemo(() => {
    const names = (companies || []).map((c) => c?.name ?? c?.company_name ?? '').filter((v) => v != null);
    const set = new Set(names.map((n) => String(n)));
    const arr = Array.from(set);
    try {
      return arr.sort((a, b) => a.localeCompare(b));
    } catch (e) {
      // Safari fallback
      return arr.sort();
    }
  }, [companies]);

  // --- Compute Most Improved Overall (delta between current and baseline) ---
  const mostImproved = useMemo(() => {
    if (!Array.isArray(baselineScores) || baselineScores.length === 0) return [];
    // Index baseline by company name (case-insensitive)
    console.log('Computing most improved vs baseline:', baselineScores);
    const baseMap = new Map(
      baselineScores.map((b) => [String(b.name).toLowerCase(), b])
    );
    const rows = (companies || [])
      .map((c) => {
        const base = baseMap.get(String(c.name).toLowerCase());
        if (!base) return null;
        const current = Number(c.totalAvg ?? 0);
        const prev = Number(base.totalAvg ?? 0);
        if (!Number.isFinite(current) || !Number.isFinite(prev)) return null;
        const delta = current - prev;
        const pctChange = prev !== 0 ? (delta / Math.abs(prev)) * 100 : (current !== 0 ? 100 : 0);
        return {
          name: c.name,
          category: c.category,
          prev: Math.round(prev),
          current: Math.round(current),
          delta: Math.round(delta * 10) / 10,
          pctChange: Math.round(pctChange * 10) / 10,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.delta - a.delta);
    return rows;
  }, [companies, baselineScores]);

  const companiesFilterLabel = useMemo(() => {
    if (!selectedCompanies.length) return 'Companies';
    if (selectedCompanies.length === allCompanies.length) return 'Companies (All)';
    return `Companies (${selectedCompanies.length})`;
  }, [selectedCompanies, allCompanies]);

  const filteredCompanies = useMemo(() => {
    const q = companySearch.trim().toLowerCase();
    if (!q) return allCompanies;
    return allCompanies.filter((name) => name.toLowerCase().includes(q));
  }, [allCompanies, companySearch]);

  // Compute totals and sorted rankings with all filters applied
  const ranked = useMemo(() => {
    // 1) Start from base list and filter by company category (if any)
    const base = companies.filter((c) => {
      if (c.hasOwnProperty('active') && c.active !== true) return false;
      if (selectedCompanies.length) {
        const set = new Set(selectedCompanies);
        if (!set.has(c.name)) return false;
      }
      if (!categoryFilter) return true;
      const cat = String(c.category || '').toLowerCase();
      return cat === categoryFilter.toLowerCase();
    });

    // 2) Do not recompute totalAvg here; trust backend normalization
    const withTotals = base; // passthrough

    // 3) Sort by selected component or total average (from normalization)
    const key = 'totalAvg';
    const sorted = [...withTotals].sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0));

    // 4) Attach provisional rank and percentile band (based on the sorted set)
    const n = sorted.length || 1;
    const withBand = sorted.map((c, i) => {
      const rankPos = i + 1;
      const pct = rankPos / n;
      let band = 'Top 50%';
      if (pct <= 0.1) band = 'Top 10%';
      else if (pct <= 0.25) band = 'Top 25%';
      else if (pct <= 0.5) band = 'Top 50%';
      else band = 'Below 50%';

      // Determine if company is a top performer for the active component
      const threshold = THRESHOLDS.totalAvg;
      const scoreForKey = c.totalAvg ?? 0;
      const top = scoreForKey >= threshold;

      return {...c, band, top, _provisionalRank: rankPos};
    });

    // 5) Apply percentile filter
    const matchesPercentile = (c) => {
      if (!awardFilter) return true;
      if (awardFilter === 'top10') return c.band === 'Top 10%';
      if (awardFilter === 'top25') return c.band === 'Top 25%';
      if (awardFilter === 'top50') return c.band === 'Top 50%';
      if (awardFilter === 'below50') return c.band === 'Below 50%';
      return true;
    };
    const afterAward = withBand.filter(matchesPercentile);

    // 6) Re-rank the final list (ranks should be contiguous for the displayed rows)
    const final = afterAward.map((c, i) => ({...c, rank: i + 1}));
    // 7) Apply sorting based on sortConfig
    if (sortConfig?.key) {
      const {key, direction} = sortConfig;
      final.sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return final;
  }, [companies, categoryFilter, awardFilter, selectedCompanies, sortConfig]);

  // Build Top Performers tables dynamically using weighted contributions
  const COMPONENTS = [
    {key: 'pms', label: 'PMS', max: WEIGHTS.pms * 100},
    {key: 'pcii', label: 'PCII', max: WEIGHTS.pcii * 100},
    {key: 'pim', label: 'PIM', max: WEIGHTS.pim * 100},
    {key: 'pe', label: 'PE', max: WEIGHTS.pe * 100},
    {key: 'glc', label: 'GLC', max: WEIGHTS.glc * 100},
  ];

  const categories = ['Large', 'Medium', 'Small'];

  const topTables = useMemo(() => {
    // Group by category, compute contributions per component, and pick top 3
    const res = {};
    categories.forEach((cat) => {
      res[cat] = {};
      COMPONENTS.forEach(({key, label, max}) => {
        // Rows in this category
        const rows = companies
          .filter((c) => String(c.category).toLowerCase() === cat.toLowerCase())
          .filter((c) => !selectedCompanies.length || selectedCompanies.includes(c.name))
          .map((c) => {
            const contribution = c[key] ?? 0;
            return {name: c.name, contribution};
          })
          .sort((a, b) => b.contribution - a.contribution);

        const totalInCat = rows.length;

        // Tie-friendly ranking: keep one decimal place; merge equal contributions
        const round1 = (x) => Math.round(x * 10) / 10;
        const topN = rows.slice(0, 10); // take more, we will slice to 3 after merging ties

        // Build display entries with possible ties (e.g., CAPWELL/UNGA)
        const merged = [];
        topN.forEach((row) => {
          const val = round1(row.contribution);
          const last = merged[merged.length - 1];
          if (last && round1(last.value) === val) {
            last.names.push(row.name);
          } else {
            merged.push({names: [row.name], value: val});
          }
        });

        const display = merged.slice(0, 3).map((m, idx) => ({
          rank: idx + 1,
          names: m.names.join('/'),
          note: `${m.value}% (of ${round1(max)}% max)`,
        }));

        res[cat][label] = {totalInCat, rows: display};
      });
    });
    return res;
  }, [companies, selectedCompanies]);

  // Compute key stats for display
  const keyStats = useMemo(() => {
    const rows = companies;
    const n = rows.length;
    let top10 = 0; let top25 = 0; let top50 = 0; let below50 = 0; let topPerformers = 0;
    let avgTotal = 0; let avgPMS = 0; let avgPCII = 0; let avgPIM = 0; let avgPE = 0; let avgGLC = 0;
    let large = 0; let medium = 0; let small = 0;
    rows.forEach((c, i) => {
      const pct = (i + 1) / (n || 1);
      if (pct <= 0.1) top10++;
      if (pct <= 0.25) top25++;
      if (pct <= 0.5) top50++;
      if (pct > 0.5) below50++;
      if ((c.totalAvg ?? 0) >= THRESHOLDS.totalAvg) topPerformers++;
      avgTotal += (c.totalAvg ?? 0);
      avgPMS += (c.pms ?? 0);
      avgPCII += (c.pcii ?? 0);
      avgPIM += (c.pim ?? 0);
      avgPE += (c.pe ?? 0);
      avgGLC += (c.glc ?? 0);
      const cat = String(c.category || '').toLowerCase();
      if (cat === 'large') large++;
      if (cat === 'medium') medium++;
      if (cat === 'small') small++;
    });
    return {
      companies: n,
      top10,
      top25,
      top50,
      below50,
      topPerformers,
      avgTotal: n ? Math.round(avgTotal / n) : 0,
      avgPMS: n ? Math.round(avgPMS / n) : 0,
      avgPCII: n ? Math.round(avgPCII / n) : 0,
      avgPIM: n ? Math.round(avgPIM / n) : 0,
      avgPE: n ? Math.round(avgPE / n) : 0,
      avgGLC: n ? Math.round(avgGLC / n) : 0,
      large,
      medium,
      small,
    };
  }, [companies, THRESHOLDS.totalAvg]);

  // Helper: Render a label for a cycle id from cyclesMeta
  const getCycleLabel = (id) => {
    if (!id) return '';
    const found = cyclesMeta.find((c) => String(c.id) === String(id));
    if (found && found.name) return found.name;
    if (found && (found.start_ms || found.end_ms)) {
      try {
        const sd = found.start_ms ? new Date(found.start_ms) : null;
        const ed = found.end_ms ? new Date(found.end_ms) : null;
        const s = sd ? sd.toLocaleDateString() : '';
        const e = ed ? ed.toLocaleDateString() : '';
        if (s && e) return `${s} - ${e}`;
      } catch (_) {}
    }
    return String(id);
  };

  return (
    <Box>
      <Heading size="md" mb={2} display="flex" alignItems="center" gap={2}>
        {apiScoresLoading && <Badge>Loading…</Badge>}
        {apiScoresError && <Badge colorScheme="red">{apiScoresError}</Badge>}
      </Heading>

      {/* --- Awards Overview / Description --- */}
      <Box mb={4} p={3} borderWidth="1px" borderColor={borderColor} borderRadius="md" bg={infoBg}>
        <Text fontSize="sm" mb={2}>
          <b>Awards overview.</b> This dashboard highlights company performance across the 4 Performance Groups (4PG):
          <b> PMS</b> (15%), <b>PCII</b> (25%), <b>PIM</b> (25%), <b>PE</b> (10%), and <b>GLC</b> (25%).
          The <b>Total Avg</b> is the weighted combination of these components.
        </Text>
        <Text fontSize="sm" mb={1}>
          • <b>Top Performer</b>: Company meets or exceeds the Total Avg threshold (currently {THRESHOLDS.totalAvg}%).
        </Text>
        <Text fontSize="sm" mb={1}>
          • <b>Percentile badge</b>: Position among the <i>currently displayed</i> companies after filters (e.g., Top 10% means better than 90% of peers in view).
        </Text>
        <Text fontSize="sm">
          • <b>Most Improved Overall</b>: Compares this cycle’s Total Avg to a selected baseline cycle and ranks by improvement.
        </Text>
      </Box>

      {/* --- Key Stats: Single row by default --- */}
      <SimpleGrid columns={{base: 2, md: 3, lg: 6}} spacing={4} mb={2}>
        <Stat borderWidth="1px" borderColor={borderColor} borderRadius="md" p={3}>
          <StatLabel>Companies</StatLabel>
          <StatNumber>{keyStats.companies}</StatNumber>
          <StatHelpText>filtered</StatHelpText>
        </Stat>
        <Stat borderWidth="1px" borderColor={borderColor} borderRadius="md" p={3}>
          <StatLabel>Top Performers</StatLabel>
          <StatNumber>{keyStats.topPerformers}</StatNumber>
          <StatHelpText>≥ {THRESHOLDS.totalAvg}% Total Avg</StatHelpText>
        </Stat>
        <Stat borderWidth="1px" borderColor={borderColor} borderRadius="md" p={3}>
          <StatLabel>Top 10%</StatLabel>
          <StatNumber>{keyStats.top10}</StatNumber>
        </Stat>
        <Stat borderWidth="1px" borderColor={borderColor} borderRadius="md" p={3}>
          <StatLabel>Top 25%</StatLabel>
          <StatNumber>{keyStats.top25}</StatNumber>
        </Stat>
        <Stat borderWidth="1px" borderColor={borderColor} borderRadius="md" p={3}>
          <StatLabel>Top 50%</StatLabel>
          <StatNumber>{keyStats.top50}</StatNumber>
        </Stat>
        <Stat borderWidth="1px" borderColor={borderColor} borderRadius="md" p={3}>
          <StatLabel>Below 50%</StatLabel>
          <StatNumber>{keyStats.below50}</StatNumber>
        </Stat>
      </SimpleGrid>
      <Box textAlign="right" mb={4}>
        <Button size="sm" variant="ghost" onClick={() => setShowMoreStats((v) => !v)}>
          {showMoreStats ? 'Show less' : 'Show more'}
        </Button>
      </Box>

      {/* --- Expanded Stats --- */}
      <Collapse in={showMoreStats} animateOpacity>
        <SimpleGrid columns={{base: 2, md: 3, lg: 6}} spacing={4} mb={4}>
          <Stat borderWidth="1px" borderColor={borderColor} borderRadius="md" p={3}>
            <StatLabel>Avg Total</StatLabel>
            <StatNumber>{keyStats.avgTotal}%</StatNumber>
          </Stat>
          <Stat borderWidth="1px" borderColor={borderColor} borderRadius="md" p={3}>
            <StatLabel>Avg PMS</StatLabel>
            <StatNumber>{keyStats.avgPMS}%</StatNumber>
          </Stat>
          <Stat borderWidth="1px" borderColor={borderColor} borderRadius="md" p={3}>
            <StatLabel>Avg PCII</StatLabel>
            <StatNumber>{keyStats.avgPCII}%</StatNumber>
          </Stat>
          <Stat borderWidth="1px" borderColor={borderColor} borderRadius="md" p={3}>
            <StatLabel>Avg PIM</StatLabel>
            <StatNumber>{keyStats.avgPIM}%</StatNumber>
          </Stat>
          <Stat borderWidth="1px" borderColor={borderColor} borderRadius="md" p={3}>
            <StatLabel>Avg PE</StatLabel>
            <StatNumber>{keyStats.avgPE}%</StatNumber>
          </Stat>
          <Stat borderWidth="1px" borderColor={borderColor} borderRadius="md" p={3}>
            <StatLabel>Avg GLC</StatLabel>
            <StatNumber>{keyStats.avgGLC}%</StatNumber>
          </Stat>
        </SimpleGrid>

        <SimpleGrid columns={{base: 3, md: 3, lg: 3}} spacing={4} mb={4}>
          <Stat borderWidth="1px" borderColor={borderColor} borderRadius="md" p={3}>
            <StatLabel>Large</StatLabel>
            <StatNumber>{keyStats.large}</StatNumber>
          </Stat>
          <Stat borderWidth="1px" borderColor={borderColor} borderRadius="md" p={3}>
            <StatLabel>Medium</StatLabel>
            <StatNumber>{keyStats.medium}</StatNumber>
          </Stat>
          <Stat borderWidth="1px" borderColor={borderColor} borderRadius="md" p={3}>
            <StatLabel>Small</StatLabel>
            <StatNumber>{keyStats.small}</StatNumber>
          </Stat>
        </SimpleGrid>
      </Collapse>
      <HStack spacing={2} align="start" mb={3}>
        <Select
          placeholder="Filter by Category"
          maxW="200px"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          size='sm'
        >
          <option value="large">Large</option>
          <option value="medium">Medium</option>
          <option value="small">Small</option>
        </Select>
        <Select
          placeholder="Filter by Percentile"
          maxW="180px"
          value={awardFilter}
          onChange={(e) => setAwardFilter(e.target.value)}
          size='sm'
        >
          <option value="">All Percentiles</option>
          <option value="top10">Top 10%</option>
          <option value="top25">Top 25%</option>
          <option value="top50">Top 50%</option>
          <option value="below50">Below 50%</option>
        </Select>
        <Popover placement="bottom-start" closeOnBlur={true} isLazy={false}>
          <PopoverTrigger>
            <Button rightIcon={<ChevronDownIcon />} variant="outline" size='sm'>
              {companiesFilterLabel}
            </Button>
          </PopoverTrigger>
          <Portal>
            <PopoverContent minW="320px" maxH="400px" overflowY="auto" zIndex={1400}>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverHeader>Select Companies</PopoverHeader>
              <PopoverBody>
                <InputGroup size="sm" mb={2}>
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon />
                  </InputLeftElement>
                  <Input
                    placeholder="Search companies..."
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                  />
                </InputGroup>
                <HStack justify="space-between" mb={2}>
                  <Button size="xs" variant="ghost" onClick={() => setSelectedCompanies(filteredCompanies)}>Select All</Button>
                  <Button size="xs" variant="ghost" onClick={() => setSelectedCompanies([])}>Clear</Button>
                </HStack>
                <Divider mb={2} />
                <CheckboxGroup
                  colorScheme="teal"
                  value={selectedCompanies}
                  onChange={(vals) => setSelectedCompanies(vals)}
                >
                  <VStack align="stretch" spacing={1}>
                    {(filteredCompanies || []).map((name) => (
                      <Checkbox key={name} value={name} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                        {name}
                      </Checkbox>
                    ))}
                    {!allCompanies.length && (
                      <Text px={2} py={1} color="gray.500">No companies</Text>
                    )}
                    {!!allCompanies.length && !filteredCompanies.length && (
                      <Text px={2} py={1} color="gray.500">No matches</Text>
                    )}
                  </VStack>
                </CheckboxGroup>
              </PopoverBody>
            </PopoverContent>
          </Portal>
        </Popover>
        <Box minW="200px">
          <Select
            size="sm"
            value={baselineCycleId}
            placeholder={suggestedBaseline ? `Suggested: ${getCycleLabel(suggestedBaseline)}` : 'Select baseline cycle'}
            onChange={(e) => setBaselineCycleId(e.target.value)}
          >
            {(cyclesMeta || []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || getCycleLabel(c.id)}
              </option>
            ))}
          </Select>
        </Box>
        {suggestedBaseline && baselineCycleId !== suggestedBaseline && (
          <Button size="sm" variant="ghost" onClick={() => setBaselineCycleId(suggestedBaseline)}>
            Use suggested ({suggestedBaseline})
          </Button>
        )}
        {baselineError && <Text fontSize="sm" color="red.500">{baselineError}</Text>}
        <Button
          onClick={async () => {
            const ok = await loadBaseline();
            if (ok) onMIOpen();
          }}
          colorScheme="purple"
          size='sm'
          ml={2}
          isLoading={baselineLoading}
        >
          Most Improved
        </Button>
        <Button
          onClick={onOpen}
          colorScheme="teal"
          ml="auto"
          size='sm'
        >
          Top Performers
        </Button>

      </HStack>


      <Table variant="striped" size="md">
        <Thead>
          <Tr>
            <Th
              cursor="pointer"
              onClick={() =>
                setSortConfig({
                  key: 'name',
                  direction: sortConfig.key === 'name' && sortConfig.direction === 'asc' ? 'desc' : 'asc',
                })
              }
            >
              Company {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
            </Th>
            <Th
              cursor="pointer"
              onClick={() =>
                setSortConfig({
                  key: 'category',
                  direction: sortConfig.key === 'category' && sortConfig.direction === 'asc' ? 'desc' : 'asc',
                })
              }
            >
              Category {sortConfig.key === 'category' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
            </Th>
            <Tooltip label="PMS Average (V+IEG) -15%" hasArrow>
              <Th
                color="green.600"
                cursor="pointer"
                onClick={() =>
                  setSortConfig({
                    key: 'pms',
                    direction: sortConfig.key === 'pms' && sortConfig.direction === 'asc' ? 'desc' : 'asc',
                  })
                }
              >
                PMS {sortConfig.key === 'pms' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </Th>
            </Tooltip>
            <Tooltip label="PCII Average (V+IEG) - 25%" hasArrow>
              <Th
                color="blue.600"
                cursor="pointer"
                onClick={() =>
                  setSortConfig({
                    key: 'pcii',
                    direction: sortConfig.key === 'pcii' && sortConfig.direction === 'asc' ? 'desc' : 'asc',
                  })
                }
              >
                PCII {sortConfig.key === 'pcii' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </Th>
            </Tooltip>
            <Tooltip label="PIM Average (V+IEG) - 25%" hasArrow>
              <Th
                color="yellow.600"
                cursor="pointer"
                onClick={() =>
                  setSortConfig({
                    key: 'pim',
                    direction: sortConfig.key === 'pim' && sortConfig.direction === 'asc' ? 'desc' : 'asc',
                  })
                }
              >
                PIM {sortConfig.key === 'pim' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </Th>
            </Tooltip>
            <Tooltip label="PE Average (V+IEG) - 10%" hasArrow>
              <Th
                color="gray.600"
                cursor="pointer"
                onClick={() =>
                  setSortConfig({
                    key: 'pe',
                    direction: sortConfig.key === 'pe' && sortConfig.direction === 'asc' ? 'desc' : 'asc',
                  })
                }
              >
                PE {sortConfig.key === 'pe' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </Th>
            </Tooltip>
            <Tooltip label="GLC Average (V+IEG) - 25%" hasArrow>
              <Th
                color="purple.600"
                cursor="pointer"
                onClick={() =>
                  setSortConfig({
                    key: 'glc',
                    direction: sortConfig.key === 'glc' && sortConfig.direction === 'asc' ? 'desc' : 'asc',
                  })
                }
              >
                GLC {sortConfig.key === 'glc' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </Th>
            </Tooltip>
            <Tooltip label="Total Averages - 100%" hasArrow>
              <Th
                cursor="pointer"
                onClick={() =>
                  setSortConfig({
                    key: 'totalAvg',
                    direction: sortConfig.key === 'totalAvg' && sortConfig.direction === 'asc' ? 'desc' : 'asc',
                  })
                }
              >
                Total Avg {sortConfig.key === 'totalAvg' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </Th>
            </Tooltip>
            <Tooltip label="Shows each company's relative position among the currently displayed (filtered) companies. For example, Top 10% means the company performed better than 90% of peers in this view." hasArrow>
              <Th>Percentile</Th>
            </Tooltip>
            <Tooltip label={`Top performer if Total Avg ≥ ${THRESHOLDS.totalAvg}%`} hasArrow>
              <Th>Top Performer</Th>
            </Tooltip>
            <Th
              cursor="pointer"
              onClick={() =>
                setSortConfig({
                  key: 'rank',
                  direction: sortConfig.key === 'rank' && sortConfig.direction === 'asc' ? 'desc' : 'asc',
                })
              }
            >
              Ranking {sortConfig.key === 'rank' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {(ranked || []).map((c) => (
            <Tr key={c.name}>
              <Td maxW="200px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" title={c.name}>
                {c.name}
              </Td>
              <Td>{c.category}</Td>
              <Td>{Math.ceil(c.pms)}%</Td>
              <Td>{Math.ceil(c.pcii)}%</Td>
              <Td>{Math.ceil(c.pim)}%</Td>
              <Td>{Math.ceil(c.pe)}%</Td>
              <Td>{Math.ceil(c.glc)}%</Td>
              <Td>{Math.ceil(c.totalAvg)}%</Td>
              <Td>
                <Tooltip label={`${c.rank}/${ranked.length} (${c.band})`} hasArrow>
                  <Box as="span">
                    {c.band === 'Top 10%' && <Badge colorScheme="blue">Top 10%</Badge>}
                    {c.band === 'Top 25%' && <Badge colorScheme="green">Top 25%</Badge>}
                    {c.band === 'Top 50%' && <Badge colorScheme="yellow">Top 50%</Badge>}
                    {c.band === 'Below 50%' && <Badge>Below 50%</Badge>}
                  </Box>
                </Tooltip>
              </Td>
              <Td>
                {c.top ? <Badge colorScheme="green">Top Performer</Badge> : <Badge variant="subtle">—</Badge>}
              </Td>
              <Td>{c.rank}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="lg">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader display="flex" justifyContent="space-between" alignItems="center">
            <Box>Top Performers</Box>
            <Button mr={10} size="sm" colorScheme="blue" onClick={() => {
              // Export logic: convert topTables into CSV and trigger download
              const rows = [];
              Object.keys(topTables).forEach((cat) => {
                COMPONENTS.forEach(({label}) => {
                  const t = topTables[cat]?.[label];
                  if (t && t.rows) {
                    t.rows.forEach((r) => {
                      rows.push({
                        Category: cat,
                        Component: label,
                        Rank: r.rank,
                        Companies: r.names,
                        Note: r.note,
                      });
                    });
                  }
                });
              });
              if (rows.length === 0) return;
              const headers = Object.keys(rows[0]);
              const csv = [headers.join(',')]
                .concat(rows.map((r) => headers.map((h) => '\"' + String(r[h]).replace(/\"/g, '\"\"') + '\"').join(',')))
                .join('\n');
              const blob = new Blob([csv], {type: 'text/csv'});
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'top_performers.csv';
              a.click();
              URL.revokeObjectURL(url);
            }}>
              Export
            </Button>
          </DrawerHeader>
          <DrawerBody>
            <VStack align="stretch" spacing={6}>
              {categories.map((cat) => (
                <Box key={cat}>
                  {COMPONENTS.map(({label}) => {
                    const apiKey = label; // API uses uppercase labels already
                    const t = topTables[cat]?.[apiKey] || topTables[cat]?.[label];
                    const title = `${label} (${cat}) - Top 3/${t?.totalInCat || 0}`;
                    return (
                      <Box key={`${cat}-${label}`} mb={6}>
                        <Heading size="sm" mb={2}>{title}</Heading>
                        <TableContainer>
                          <Table size="sm" variant="simple">
                            <Thead>
                              <Tr><Th>Ranking</Th><Th>Notes</Th></Tr>
                            </Thead>
                            <Tbody>
                              {(t?.rows?.length ? t.rows : []).map((r) => (
                                <Tr key={`${cat}-${label}-${r.rank}`}>
                                  <Td>{`${r.rank}. ${r.names}`}</Td>
                                  <Td>{r.note}</Td>
                                </Tr>
                              ))}
                              {(!t || !t.rows || t.rows.length === 0) && (
                                <Tr><Td colSpan={2}><Text fontSize="sm" color="gray.500">No data</Text></Td></Tr>
                              )}
                            </Tbody>
                          </Table>
                        </TableContainer>
                        <Divider my={4} />
                      </Box>
                    );
                  })}
                  <Divider />
                </Box>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <Drawer isOpen={isMIOpen} placement="bottom" onClose={onMIClose} size="xl">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader display="flex" justifyContent="flex-start" alignItems="center">
            <Box>Most Improved Overall</Box>
            <HStack ml={10}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const rows = (mostImproved || []).map((r, idx) => ({
                    '#': idx + 1,
                    'Company': r.name,
                    'Category': r.category,
                    'Prev Total Avg (%)': r.prev,
                    'Current Total Avg (%)': r.current,
                    'Δ Total Avg (pts)': r.delta,
                    '% Change': `${r.pctChange}%`,
                  }));
                  if (!rows.length) return;
                  const headers = Object.keys(rows[0]);
                  const csv = [headers.join(',')]
                    .concat(rows.map((r) => headers.map((h) => '"' + String(r[h]).replace(/"/g, '""') + '"').join(',')))
                    .join('\n');
                  const blob = new Blob([csv], {type: 'text/csv'});
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'most_improved_overall.csv';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export
              </Button>
            </HStack>
          </DrawerHeader>
          <DrawerBody>
            <Text mb={4} color="gray.600">
              Compares the current cycle&rsquo;s <b>Total Avg</b> to a selected baseline cycle for the same companies. Use the Baseline dropdown above and click <b>Load Baseline</b>, then open this drawer.
            </Text>

            {!(Array.isArray(baselineScores) && baselineScores.length) ? (
              <Text fontSize="sm" color="gray.500">No baseline loaded yet. Select a baseline cycle and click <b>Load Baseline</b>.</Text>
            ) : (
              <Table variant="striped" size="sm">
                <Thead>
                  <Tr>
                    <Th>#</Th>
                    <Th>Company</Th>
                    <Th>Category</Th>
                    <Tooltip label="Baseline cycle Total Average (%)" hasArrow><Th>Prev Total Avg</Th></Tooltip>
                    <Tooltip label="Current cycle Total Average (%)" hasArrow><Th>Current Total Avg</Th></Tooltip>
                    <Tooltip label="Improvement in percentage points (Current - Previous)" hasArrow><Th>Δ Total Avg</Th></Tooltip>
                    <Tooltip label="Percent change relative to baseline" hasArrow><Th>% Change</Th></Tooltip>
                  </Tr>
                </Thead>
                <Tbody>
                  {(mostImproved || []).map((r, idx) => (
                    <Tr key={r.name}>
                      <Td>{idx + 1}</Td>
                      <Td maxW="260px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" title={r.name}>
                        {r.name}
                      </Td>
                      <Td>{r.category}</Td>
                      <Td>{r.prev}%</Td>
                      <Td>{r.current}%</Td>
                      <Td>
                        <Tooltip label={`${r.prev}% → ${r.current}%`} hasArrow>
                          <Box as="span" color={r.delta >= 0 ? 'green.600' : 'red.600'}>
                            {r.delta}
                          </Box>
                        </Tooltip>
                      </Td>
                      <Td>{r.pctChange}%</Td>
                    </Tr>
                  ))}
                  {!mostImproved.length && (
                    <Tr><Td colSpan={7}><Text fontSize="sm" color="gray.500">No matches between current and baseline companies.</Text></Td></Tr>
                  )}
                </Tbody>
              </Table>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default FourPGComponentAwards;

FourPGComponentAwards.propTypes = {
  // Accept either a cycle string (e.g., "vJqDawZlrKNHsMIW9G2s") or an object with an `id` field
  cycle: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({id: PropTypes.string}),
  ]).isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    category: PropTypes.oneOf(['Large', 'Medium', 'Small']).isRequired,
    pms: PropTypes.number.isRequired,
    pcii: PropTypes.number.isRequired,
    pim: PropTypes.number.isRequired,
    pe: PropTypes.number.isRequired,
    glc: PropTypes.number.isRequired,
    // Optional: a cycle identifier on each row if upstream provides it
    cycle_id: PropTypes.string,
  })),
};
