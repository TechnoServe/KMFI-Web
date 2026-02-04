import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Bar} from 'react-chartjs-2';
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  Tooltip,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  // Filter UI components
  HStack,
  Flex,
  Spacer,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  Checkbox,
  CheckboxGroup,
  VStack,
  Collapse,
  Divider,
  Button,
  // Key Stats UI components
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
} from '@chakra-ui/react';
import {ChevronDownIcon} from '@chakra-ui/icons';
import PropTypes from 'prop-types';
import {request} from 'common';

const Triangulation = ({cycle}) => {
  const componentLabels = [
    'PMS (U) -15%',
    'PMS (V) -15%',
    'PMS (IEG) -15%',
    'PCII (U) -25%',
    'PCII (V) -25%',
    'PCII (IEG) -25%',
    'PIM (U) -25%',
    'PIM (V) -25%',
    'PIM (IEG) -25%',
    'PE (U) -10%',
    'PE (V) -10%',
    'PE (IEG) -10%',
    'GLC (U) -25%',
    'GLC (V) -25%',
    'GLC (IEG) -25%',
    'TOTAL (U) -100%',
    'TOTAL (V) -100%',
    'TOTAL (IEG) -100%',
  ];
  // Chart colors for each dataset (U, V, IEG) and for each component
  const chartColors = [
    '#4FD1C5', // Teal (U)
    '#4FD1C5', // Teal (U)
    '#4FD1C5', // Teal (U)
    '#FC8181', // Red
    '#FC8181', // Red
    '#FC8181', // Red
    '#FBD38D', // Light Orange
    '#FBD38D', // Light Orange
    '#FBD38D', // Light Orange
    '#81E6D9', // Light Teal
    '#81E6D9', // Light Teal
    '#81E6D9', // Light Teal
    '#3300ffff', // Purple
    '#3300ffff', // Purple
    '#3300ffff', // Purple
    '#000000', // Peach
    '#000000', // Peach
    '#000000', // Peach
  ];

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [triangulationData, setTriangulationData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const {isOpen, onOpen, onClose} = useDisclosure();

  const [sortConfig, setSortConfig] = useState({key: null, direction: 'asc'});
  const [activeTab, setActiveTab] = useState(0);

  // ---- Chart Export (Drawer Graph) ----
  const chartRef = useRef(null);
  const exportChartImage = () => {
    try {
      const chart = chartRef.current;
      if (!chart) return;
      // react-chartjs-2 exposes ChartJS instance; try toBase64Image first
      const url = chart.toBase64Image ? chart.toBase64Image() : (chart.canvas ? chart.canvas.toDataURL('image/png') : null);
      if (!url) return;
      const name = (selectedCompany?.company || 'company').replace(/[^a-z0-9-_]+/gi, '_');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}_component_breakdown_${Date.now()}.png`;
      a.click();
    } catch (e) {
      // no-op: silent failure to avoid breaking UI
    }
  };

  // ---- Key Stats ----
  const [showAllStats, setShowAllStats] = useState(false);

  // ---------------- Filters (Simple & Advanced) ----------------
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    companies: [], // selected companies (multi-select)
    minTotalU: '', // TOTAL_U minimum %
    minTotalV: '', // TOTAL_V minimum %
    minTotalIEG: '', // TOTAL_IEG minimum %
    advDataset: 'V+IEG', // U | V | IEG | V+IEG (components)
    advMinComp: '', // minimum component % for selected dataset
    advMaxComp: '', // maximum component % for selected dataset
    hideNulls: false, // drop rows with nulls for selected checks
  });

  // Normalize a single server row to { company, values: number[18] }
  const componentOrder = [
    'PMS_U', 'PMS_V', 'PMS_IEG',
    'PCII_U', 'PCII_V', 'PCII_IEG',
    'PIM_U', 'PIM_V', 'PIM_IEG',
    'PE_U', 'PE_V', 'PE_IEG',
    'GLC_U', 'GLC_V', 'GLC_IEG',
    'TOTAL_U', 'TOTAL_V', 'TOTAL_IEG',
  ];

  const IDX = {
    PMS: {U: 0, V: 1, IEG: 2},
    PCII: {U: 3, V: 4, IEG: 5},
    PIM: {U: 6, V: 7, IEG: 8},
    PE: {U: 9, V: 10, IEG: 11},
    GLC: {U: 12, V: 13, IEG: 14},
    TOTAL: {U: 15, V: 16, IEG: 17},
  };
  const COMPONENT_KEYS = ['PMS', 'PCII', 'PIM', 'PE', 'GLC'];

  const companyOptions = useMemo(() => {
    const set = new Set(triangulationData.map((r) => r.company).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [triangulationData]);

  // Search within company multi-select
  const [companySearch, setCompanySearch] = useState('');
  const filteredCompanyOptions = useMemo(() => {
    const q = companySearch.trim().toLowerCase();
    if (!q) return companyOptions;
    return companyOptions.filter((name) => name.toLowerCase().includes(q));
  }, [companyOptions, companySearch]);

  const normalizeRow = (row = {}) => {
    const company = row.company_name || row.company || row.name || '—';
    // Normalize to snake_case to match render/export usage
    const companySize =
      row.company_size ||
      row.size ||
      row.companySize ||
      row.company_size_label ||
      row.company_category ||
      null;
    const values = [
      row.PMS_U, row.PMS_V, row.PMS_IEG,
      row.PCII_U, row.PCII_V, row.PCII_IEG,
      row.PIM_U, row.PIM_V, row.PIM_IEG,
      row.PE_U, row.PE_V, row.PE_IEG,
      row.GLC_U, row.GLC_V, row.GLC_IEG,
      row.TOTAL_U, row.TOTAL_V, row.TOTAL_IEG,
    ].map((v) => (v == null ? null : Number(v)));
    return {company, companySize, values};
  };

  // Fetch from server, optionally by cycle
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = cycle?.id ? {cycleId: cycle.id} : undefined;
        const res = await request(true).get('/admin/triangulation', {params});
        const json = res?.data ?? res;

        if (!isMounted) return;
        const rows = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
        const normalized = rows.map(normalizeRow);
        setTriangulationData(normalized);
        if (normalized.length && !selectedCompany) setSelectedCompany(normalized[0]);
      } catch (e) {
        if (!isMounted) return;
        setError(e.message || 'Failed to load triangulation');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [/* cycle dependency handled via read at runtime */]);

  const handleSort = (columnIndex) => {
    setSortConfig((current) => {
      if (current.key === columnIndex) {
        return {
          key: columnIndex,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return {key: columnIndex, direction: 'asc'};
    });
  };

  const toNum = (v) => (v === '' || v == null ? null : Number(v));

  // Aggregation helpers
  const numberArray = (arr) => arr.filter((n) => Number.isFinite(n));
  const avg = (arr) => {
    const a = numberArray(arr);
    if (!a.length) return null;
    return a.reduce((x, y) => x + y, 0) / a.length;
  };
  const median = (arr) => {
    const a = numberArray(arr).sort((x, y) => x - y);
    if (!a.length) return null;
    const mid = Math.floor(a.length / 2);
    return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
  };
  const pct = (v, digits = 1) => (v == null ? '—' : `${v.toFixed(digits)}%`);

  const keyStats = useMemo(() => {
    if (!triangulationData?.length) return [];

    const getIdx = (idx) => triangulationData.map((r) => r.values[idx]);
    const TOTAL_U = getIdx(IDX.TOTAL.U);
    const TOTAL_V = getIdx(IDX.TOTAL.V);
    const TOTAL_IEG = getIdx(IDX.TOTAL.IEG);

    const PMS_V = getIdx(IDX.PMS.V);
    const PMS_IEG = getIdx(IDX.PMS.IEG);
    const PCII_V = getIdx(IDX.PCII.V);
    const PCII_IEG = getIdx(IDX.PCII.IEG);
    const PIM_V = getIdx(IDX.PIM.V);
    const PIM_IEG = getIdx(IDX.PIM.IEG);
    const PE_V = getIdx(IDX.PE.V);
    const PE_IEG = getIdx(IDX.PE.IEG);
    const GLC_V = getIdx(IDX.GLC.V);
    const GLC_IEG = getIdx(IDX.GLC.IEG);

    const discrepancies = triangulationData.map((r) => {
      const v = r.values[IDX.TOTAL.V];
      const i = r.values[IDX.TOTAL.IEG];
      return Number.isFinite(v) && Number.isFinite(i) ? Math.abs(v - i) : null;
    }).filter((n) => n != null);

    const compAvg = (V, IEG) => avg(V.map((v, i) => (Number.isFinite(v) && Number.isFinite(IEG[i])) ? (v + IEG[i]) / 2 : null));

    // --- Best-performer helpers -------------------------------------------
    const bestOverall = () => {
      // Use TOTAL average of V and IEG
      let best = {company: null, value: null};
      for (const r of triangulationData) {
        const v = r.values[IDX.TOTAL.V];
        const i = r.values[IDX.TOTAL.IEG];
        if (Number.isFinite(v) && Number.isFinite(i)) {
          const avgVI = (v + i) / 2;
          if (best.value == null || avgVI > best.value) best = {company: r.company, value: avgVI};
        }
      }
      return best.company ? `${best.company} — ${pct(best.value)}` : '—';
    };

    const bestByComponentAvg = (key) => {
      // For PMS/PCII/PIM/PE/GLC: average (V + IEG)/2
      let best = {company: null, value: null};
      const idxV = IDX[key].V;
      const idxI = IDX[key].IEG;
      for (const r of triangulationData) {
        const v = r.values[idxV];
        const i = r.values[idxI];
        if (Number.isFinite(v) && Number.isFinite(i)) {
          const avgVI = (v + i) / 2;
          if (best.value == null || avgVI > best.value) best = {company: r.company, value: avgVI};
        }
      }
      return best.company ? `${best.company} — ${pct(best.value)}` : '—';
    };

    const mostConsistentOverall = () => {
      // Smallest |V - IEG| on TOTAL
      let best = {company: null, value: null};
      for (const r of triangulationData) {
        const v = r.values[IDX.TOTAL.V];
        const i = r.values[IDX.TOTAL.IEG];
        if (Number.isFinite(v) && Number.isFinite(i)) {
          const delta = Math.abs(v - i);
          if (best.value == null || delta < best.value) best = {company: r.company, value: delta};
        }
      }
      return best.company ? `${best.company} — Δ ${pct(best.value)}` : '—';
    };

    const stats = [
      {label: 'Companies', value: String(triangulationData.length), help: 'Total companies in this cycle'},
      {label: 'Avg TOTAL (U)', value: pct(avg(TOTAL_U)), help: 'Average of self-reported totals'},
      {label: 'Avg TOTAL (V)', value: pct(avg(TOTAL_V)), help: 'Average of validated totals'},
      {label: 'Avg TOTAL (IEG)', value: pct(avg(TOTAL_IEG)), help: 'Average of IEG totals'},
      {label: 'Median TOTAL (V)', value: pct(median(TOTAL_V)), help: 'Median of validated totals'},
      {label: 'PMS Avg (V+IEG)', value: pct(compAvg(PMS_V, PMS_IEG)), help: 'Average of PMS (validated + IEG)/2'},
      {label: 'PCII Avg (V+IEG)', value: pct(compAvg(PCII_V, PCII_IEG)), help: 'Average of PCII (validated + IEG)/2'},
      {label: 'PIM Avg (V+IEG)', value: pct(compAvg(PIM_V, PIM_IEG)), help: 'Average of PIM (validated + IEG)/2'},
      {label: 'PE Avg (V+IEG)', value: pct(compAvg(PE_V, PE_IEG)), help: 'Average of PE (validated + IEG)/2'},
      {label: 'GLC Avg (V+IEG)', value: pct(compAvg(GLC_V, GLC_IEG)), help: 'Average of GLC (validated + IEG)/2'},
      {label: 'Max Δ (V vs IEG)', value: pct(numberArray(discrepancies).length ? Math.max(...discrepancies) : null), help: 'Largest absolute difference between V and IEG totals'},
      {label: 'Mean Δ (V vs IEG)', value: pct(avg(discrepancies)), help: 'Mean absolute difference between V and IEG totals'},
      {label: 'Best Overall (V+IEG)', value: bestOverall(), help: 'Highest TOTAL average of Validated and IEG'},
      {label: 'Best PMS (V+IEG)', value: bestByComponentAvg('PMS'), help: 'Top People Management Systems average'},
      {label: 'Best PCII (V+IEG)', value: bestByComponentAvg('PCII'), help: 'Top Production/Continuous Improvement & Innovation average'},
      {label: 'Best PIM (V+IEG)', value: bestByComponentAvg('PIM'), help: 'Top Procurement & Inputs Management average'},
      {label: 'Best PE (V+IEG)', value: bestByComponentAvg('PE'), help: 'Top Public Engagement average'},
      {label: 'Best GLC (V+IEG)', value: bestByComponentAvg('GLC'), help: 'Top Governance & Leadership Culture average'},
      {label: 'Most Consistent (TOTAL)', value: mostConsistentOverall(), help: 'Smallest discrepancy between TOTAL (V) and TOTAL (IEG)'},
    ];

    return stats;
  }, [triangulationData]);

  const filteredTriangulationData = useMemo(() => {
    const selectedCompanies = filters.companies || [];
    const minU = toNum(filters.minTotalU);
    const minV = toNum(filters.minTotalV);
    const minIEG = toNum(filters.minTotalIEG);
    const advDs = filters.advDataset; // 'U'|'V'|'IEG'|'V+IEG'
    const minC = toNum(filters.advMinComp);
    const maxC = toNum(filters.advMaxComp);
    const hideNulls = !!filters.hideNulls;

    return triangulationData.filter((row) => {
      // Company multi-select match
      if (selectedCompanies.length && !selectedCompanies.includes(row.company)) return false;

      const v = row.values;
      const totalU = v[IDX.TOTAL.U];
      const totalV = v[IDX.TOTAL.V];
      const totalIEG = v[IDX.TOTAL.IEG];

      // Totals minimums (simple filters)
      if (minU != null && !(Number.isFinite(totalU) && totalU >= minU)) return false;
      if (minV != null && !(Number.isFinite(totalV) && totalV >= minV)) return false;
      if (minIEG != null && !(Number.isFinite(totalIEG) && totalIEG >= minIEG)) return false;

      // Advanced component thresholds
      if (minC != null || maxC != null) {
        for (const key of COMPONENT_KEYS) {
          let a; let b;
          if (advDs === 'U' || advDs === 'V' || advDs === 'IEG') {
            const idx = IDX[key][advDs];
            const val = v[idx];
            if (hideNulls && !Number.isFinite(val)) return false;
            if (minC != null && !(Number.isFinite(val) && val >= minC)) return false;
            if (maxC != null && !(Number.isFinite(val) && val <= maxC)) return false;
          } else if (advDs === 'V+IEG') {
            a = v[IDX[key].V]; b = v[IDX[key].IEG];
            if (hideNulls && (!Number.isFinite(a) || !Number.isFinite(b))) return false;
            const avg = (Number(a) + Number(b)) / 2;
            if (minC != null && !(Number.isFinite(avg) && avg >= minC)) return false;
            if (maxC != null && !(Number.isFinite(avg) && avg <= maxC)) return false;
          }
        }
      }

      return true;
    });
  }, [triangulationData, filters]);

  const sortedTriangulationData = useMemo(() => {
    if (sortConfig.key === null) return filteredTriangulationData;
    const sorted = [...filteredTriangulationData];
    sorted.sort((a, b) => {
      let aValue; let bValue;
      if (sortConfig.key === 0) {
        aValue = a.company.toLowerCase();
        bValue = b.company.toLowerCase();
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      } else {
        aValue = a.values[sortConfig.key - 1];
        bValue = b.values[sortConfig.key - 1];
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });
    return sorted;
  }, [filteredTriangulationData, sortConfig]);

  const fmt1 = (v) => (v == null || Number.isNaN(Number(v)) ? '—' : `${Number(v).toFixed(1)}%`);

  // ---- CSV Helpers ----
  const toCSV = (rows) => rows.map((r) => r.map((cell) => {
    if (cell == null) return '';
    const s = String(cell);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }).join(','));

  const downloadCSV = (filename, header, rows) => {
    const csvLines = [toCSV([header])[0], ...toCSV(rows)];
    const blob = new Blob([csvLines.join('\n')], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- Export Functions ----
  const exportDetailedCSV = () => {
    const header = ['Company', 'Size',
                    'PMS (U) -15%', 'PMS (V) -15%', 'PMS (IEG) -15%',
                    'PCII (U) -25%', 'PCII (V) -25%', 'PCII (IEG) -25%',
                    'PIM (U) -25%', 'PIM (V) -25%', 'PIM (IEG) -25%',
                    'PE (U) -10%', 'PE (V) -10%', 'PE (IEG) -10%',
                    'GLC (U) -25%', 'GLC (V) -25%', 'GLC (IEG) -25%',
                    'TOTAL (U) -100%', 'TOTAL (V) -100%', 'TOTAL (IEG) -100%'];

    const rows = sortedTriangulationData.map((r) => [
      r.company,
      r.companySize || '',
      ...r.values.map((v) => (v == null ? '' : Number(v).toFixed(1)))
    ]);

    downloadCSV(`triangulation_detailed_${Date.now()}.csv`, header, rows);
  };

  const exportAveragesCSV = () => {
    const header = ['Company', 'Size', 'PMS Avg (V+IEG) -15%', 'PCII Avg (V+IEG) -25%', 'PIM Avg (V+IEG) -25%', 'PE Avg (V+IEG) -10%', 'GLC Avg (V+IEG) -25%', 'Total Averages -100%'];

    const rows = sortedTriangulationData.map((row) => {
      const [pmsV, pmsIEG, pciiV, pciiIEG, pimV, pimIEG, peV, peIEG, glcV, glcIEG] = [
        row.values[1], row.values[2],
        row.values[4], row.values[5],
        row.values[7], row.values[8],
        row.values[10], row.values[11],
        row.values[13], row.values[14]
      ];
      const pmsAvg = ((pmsV + pmsIEG) / 2);
      const pciiAvg = ((pciiV + pciiIEG) / 2);
      const pimAvg = ((pimV + pimIEG) / 2);
      const peAvg = ((peV + peIEG) / 2);
      const glcAvg = ((glcV + glcIEG) / 2);
      const total = (pmsAvg + pciiAvg + pimAvg + peAvg + glcAvg);
      const f = (n) => (Number.isFinite(n) ? n.toFixed(1) : '');
      return [row.company, row.companySize || '', f(pmsAvg), f(pciiAvg), f(pimAvg), f(peAvg), f(glcAvg), f(total)];
    });

    downloadCSV(`triangulation_averages_${Date.now()}.csv`, header, rows);
  };

  return (
    <Box>
      <Heading size="lg" mb={4}>
        SAT vs IEG Triangulation
      </Heading>
      <Text mb={6}>
        This panel compares SAT self-reported scores against IEG validated scores for the same assessment cycle. Use this to spot discrepancies and areas needing review.
      </Text>

      {/* Key Stats */}
      {keyStats.length > 0 && (
        <Box mb={4}>
          <SimpleGrid columns={{base: 2, md: 3, lg: 5}} spacing={4} mb={2}>
            {(showAllStats ? keyStats : keyStats.slice(0, 5)).map((s, i) => (
              <Box key={i} p={3} borderWidth="1px" borderRadius="md" bg="white">
                <Stat>
                  <StatLabel>{s.label}</StatLabel>
                  <StatNumber>{s.value}</StatNumber>
                  {s.help && (
                    <StatHelpText>{s.help}</StatHelpText>
                  )}
                </Stat>
              </Box>
            ))}
          </SimpleGrid>
          {keyStats.length > 5 && (
            <Flex justify="flex-end">
              <Button size="sm" variant="ghost" onClick={() => setShowAllStats((v) => !v)}>
                {showAllStats ? 'Show less' : 'Show more'}
              </Button>
            </Flex>
          )}
        </Box>
      )}

      {/* Filters Toolbar */}
      <Box mb={4} p={3} borderWidth="1px" borderRadius="md">
        <Flex gap={3} align="center" wrap="wrap">
          <HStack spacing={3} flexWrap="wrap">
            <Popover isLazy placement="bottom-start" onClose={() => setCompanySearch('')} closeOnBlur>
              <PopoverTrigger>
                <Button size="sm" rightIcon={<ChevronDownIcon />} variant="outline" maxW="360px">
                  {filters.companies?.length ? `${filters.companies.length} selected` : 'All companies'}
                </Button>
              </PopoverTrigger>
              <PopoverContent w="360px" maxW="90vw">
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverHeader fontWeight="semibold">Filter by companies</PopoverHeader>
                <PopoverBody>
                  <Box>
                    <Input
                      size="sm"
                      placeholder="Search companies..."
                      value={companySearch}
                      onChange={(e) => setCompanySearch(e.target.value)}
                    />
                    <HStack mt={2} spacing={2}>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => setFilters((f) => ({...f, companies: filteredCompanyOptions}))}
                      >
                        Select all
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => setFilters((f) => ({...f, companies: []}))}
                      >
                        Clear
                      </Button>
                    </HStack>
                    <Divider my={2} />
                    <CheckboxGroup
                      value={filters.companies}
                      onChange={(vals) => setFilters((f) => ({...f, companies: vals}))}
                    >
                      <VStack align="start" spacing={2} maxH="240px" overflowY="auto">
                        {filteredCompanyOptions.map((name) => (
                          <Checkbox key={name} value={name}>
                            {name}
                          </Checkbox>
                        ))}
                        {filteredCompanyOptions.length === 0 && (
                          <Box px={1} py={2} color="gray.500">No matches</Box>
                        )}
                      </VStack>
                    </CheckboxGroup>
                  </Box>
                </PopoverBody>
              </PopoverContent>
            </Popover>
            <NumberInput size="sm" maxW="180px" value={filters.minTotalU} onChange={(_, n)=>setFilters((f)=>({...f, minTotalU: isNaN(n)?'':n}))}>
              <NumberInputField placeholder="Min TOTAL(U)%" />
            </NumberInput>
            <NumberInput size="sm" maxW="180px" value={filters.minTotalV} onChange={(_, n)=>setFilters((f)=>({...f, minTotalV: isNaN(n)?'':n}))}>
              <NumberInputField placeholder="Min TOTAL(V)%" />
            </NumberInput>
            <NumberInput size="sm" maxW="190px" value={filters.minTotalIEG} onChange={(_, n)=>setFilters((f)=>({...f, minTotalIEG: isNaN(n)?'':n}))}>
              <NumberInputField placeholder="Min TOTAL(IEG)%" />
            </NumberInput>
            <Button size="sm" variant="outline" onClick={() => setShowAdvanced((v) => !v)}>
              {showAdvanced ? 'Hide Advanced' : 'Advanced filters'}
            </Button>
            <Button size="sm" onClick={() => setFilters({
              companies: [], minTotalU: '', minTotalV: '', minTotalIEG: '', advDataset: 'V+IEG', advMinComp: '', advMaxComp: '', hideNulls: false
            })}>Reset</Button>
          </HStack>

          <Spacer />
          <HStack spacing={2}>
            {activeTab === 0 && (
              <Button size="sm" onClick={exportDetailedCSV}>Export Detailed</Button>
            )}
            {activeTab === 1 && (
              <Button size="sm" onClick={exportAveragesCSV}>Export Averages</Button>
            )}
          </HStack>

        </Flex>

        <Collapse in={showAdvanced} animateOpacity>
          <Divider my={3} />
          <HStack spacing={3} flexWrap="wrap" align="center">
            <Select size="sm" value={filters.advDataset} onChange={(e)=>setFilters((f)=>({...f, advDataset: e.target.value}))} maxW="160px">
              <option value="U">Dataset: U</option>
              <option value="V">Dataset: V</option>
              <option value="IEG">Dataset: IEG</option>
              <option value="V+IEG">Dataset: V + IEG (avg)</option>
            </Select>
            <NumberInput size="sm" maxW="160px" value={filters.advMinComp} onChange={(_, n)=>setFilters((f)=>({...f, advMinComp: isNaN(n)?'':n}))}>
              <NumberInputField placeholder="Min component %" />
            </NumberInput>
            <NumberInput size="sm" maxW="160px" value={filters.advMaxComp} onChange={(_, n)=>setFilters((f)=>({...f, advMaxComp: isNaN(n)?'':n}))}>
              <NumberInputField placeholder="Max component %" />
            </NumberInput>
            <Checkbox isChecked={filters.hideNulls} onChange={(e)=>setFilters((f)=>({...f, hideNulls: e.target.checked}))}>Hide nulls</Checkbox>
          </HStack>
        </Collapse>
      </Box>

      {loading && (
        <Center py={10}>
          <Spinner size="lg" />
        </Center>
      )}
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon /> {error}
        </Alert>
      )}

      <Tabs index={activeTab} onChange={(i) => setActiveTab(i)}>
        <TabList>
          <Tab>Detailed Comparison</Tab>
          <Tab>Component Averages</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Table variant="striped" colorScheme="gray" size="sm" mt={3}
              sx={{'th, td': {whiteSpace: 'nowrap'}}}>
              <TableCaption>Comparison of SAT and IEG Scores</TableCaption>
              <Thead>
                <Tr>
                  <Th position="sticky" left={0} top={0} bg="gray.50" zIndex={3}>
                    <Box as="button" onClick={() => handleSort(0)} display="flex" alignItems="center" userSelect="none">
                      KMFI Company {sortConfig.key === 0 && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                    </Box>
                  </Th>
                  <Th>
                    Size
                  </Th>
                  <Tooltip label="People Management Systems (U) - Self-Reported Score" hasArrow>
                    <Th position="sticky" top={0} bg="gray.50" zIndex={2}>
                      <Box as="button" onClick={() => handleSort(1)} display="flex" alignItems="center" userSelect="none">
                        PMS (U) -15% {sortConfig.key === 1 && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </Box>
                    </Th>
                  </Tooltip>
                  <Tooltip label="People Management Systems (V) - Validated Score" hasArrow>
                    <Th position="sticky" top={0} bg="gray.50" zIndex={2}>
                      <Box as="button" onClick={() => handleSort(2)} display="flex" alignItems="center" userSelect="none">
                        PMS (V) -15% {sortConfig.key === 2 && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </Box>
                    </Th>
                  </Tooltip>
                  <Tooltip label="People Management Systems (IEG) - IEG Score" hasArrow>
                    <Th position="sticky" top={0} bg="gray.50" zIndex={2}>
                      <Box as="button" onClick={() => handleSort(3)} display="flex" alignItems="center" userSelect="none">
                        PMS (IEG) -15% {sortConfig.key === 3 && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </Box>
                    </Th>
                  </Tooltip>
                  <Tooltip label="Production, Continuous Improvement & Innovation (U)" hasArrow>
                    <Th position="sticky" top={0} bg="gray.50" zIndex={2}>
                      <Box as="button" onClick={() => handleSort(4)} display="flex" alignItems="center" userSelect="none">
                        PCII (U) -25% {sortConfig.key === 4 && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </Box>
                    </Th>
                  </Tooltip>
                  <Tooltip label="Production, Continuous Improvement & Innovation (V)" hasArrow>
                    <Th position="sticky" top={0} bg="gray.50" zIndex={2}>
                      <Box as="button" onClick={() => handleSort(5)} display="flex" alignItems="center" userSelect="none">
                        PCII (V) -25% {sortConfig.key === 5 && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </Box>
                    </Th>
                  </Tooltip>
                  <Tooltip label="Production, Continuous Improvement & Innovation (IEG)" hasArrow>
                    <Th position="sticky" top={0} bg="gray.50" zIndex={2}>
                      <Box as="button" onClick={() => handleSort(6)} display="flex" alignItems="center" userSelect="none">
                        PCII (IEG) -25% {sortConfig.key === 6 && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </Box>
                    </Th>
                  </Tooltip>
                  <Tooltip label="Procurement & Inputs Management (U)" hasArrow>
                    <Th position="sticky" top={0} bg="gray.50" zIndex={2}>
                      <Box as="button" onClick={() => handleSort(7)} display="flex" alignItems="center" userSelect="none">
                        PIM (U) -25% {sortConfig.key === 7 && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </Box>
                    </Th>
                  </Tooltip>
                  <Tooltip label="Procurement & Inputs Management (V)" hasArrow>
                    <Th position="sticky" top={0} bg="gray.50" zIndex={2}>
                      <Box as="button" onClick={() => handleSort(8)} display="flex" alignItems="center" userSelect="none">
                        PIM (V) -25% {sortConfig.key === 8 && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </Box>
                    </Th>
                  </Tooltip>
                  <Tooltip label="Procurement & Inputs Management (IEG)" hasArrow>
                    <Th position="sticky" top={0} bg="gray.50" zIndex={2}>
                      <Box as="button" onClick={() => handleSort(9)} display="flex" alignItems="center" userSelect="none">
                        PIM (IEG) -25% {sortConfig.key === 9 && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </Box>
                    </Th>
                  </Tooltip>
                  <Tooltip label="Public Engagement (U)" hasArrow>
                    <Th position="sticky" top={0} bg="gray.50" zIndex={2}>
                      <Box as="button" onClick={() => handleSort(10)} display="flex" alignItems="center" userSelect="none">
                        PE (U) -10% {sortConfig.key === 10 && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </Box>
                    </Th>
                  </Tooltip>
                  <Tooltip label="Public Engagement (V)" hasArrow>
                    <Th position="sticky" top={0} bg="gray.50" zIndex={2}>
                      <Box as="button" onClick={() => handleSort(11)} display="flex" alignItems="center" userSelect="none">
                        PE (V) -10% {sortConfig.key === 11 && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </Box>
                    </Th>
                  </Tooltip>
                  <Tooltip label="Public Engagement (IEG)" hasArrow>
                    <Th position="sticky" top={0} bg="gray.50" zIndex={2}>
                      <Box as="button" onClick={() => handleSort(12)} display="flex" alignItems="center" userSelect="none">
                        PE (IEG) -10% {sortConfig.key === 12 && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </Box>
                    </Th>
                  </Tooltip>
                  <Tooltip label="Governance & Leadership Culture (U)" hasArrow>
                    <Th position="sticky" top={0} bg="gray.50" zIndex={2}>
                      <Box as="button" onClick={() => handleSort(13)} display="flex" alignItems="center" userSelect="none">
                        GLC (U) -25% {sortConfig.key === 13 && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </Box>
                    </Th>
                  </Tooltip>
                  <Tooltip label="Governance & Leadership Culture (V)" hasArrow>
                    <Th position="sticky" top={0} bg="gray.50" zIndex={2}>
                      <Box as="button" onClick={() => handleSort(14)} display="flex" alignItems="center" userSelect="none">
                        GLC (V) -25% {sortConfig.key === 14 && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </Box>
                    </Th>
                  </Tooltip>
                  <Tooltip label="Governance & Leadership Culture (IEG)" hasArrow>
                    <Th position="sticky" top={0} bg="gray.50" zIndex={2}>
                      <Box as="button" onClick={() => handleSort(15)} display="flex" alignItems="center" userSelect="none">
                        GLC (IEG) -25% {sortConfig.key === 15 && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </Box>
                    </Th>
                  </Tooltip>
                  <Tooltip label="Total Self-Reported Score" hasArrow>
                    <Th position="sticky" top={0} bg="gray.50" zIndex={2}>
                      <Box as="button" onClick={() => handleSort(16)} display="flex" alignItems="center" userSelect="none">
                        TOTAL (U) -100% {sortConfig.key === 16 && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </Box>
                    </Th>
                  </Tooltip>
                  <Tooltip label="Total Validated Score" hasArrow>
                    <Th position="sticky" top={0} bg="gray.50" zIndex={2}>
                      <Box as="button" onClick={() => handleSort(17)} display="flex" alignItems="center" userSelect="none">
                        TOTAL (V) -100% {sortConfig.key === 17 && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </Box>
                    </Th>
                  </Tooltip>
                  <Tooltip label="Total IEG Score" hasArrow>
                    <Th position="sticky" top={0} bg="gray.50" zIndex={2}>
                      <Box as="button" onClick={() => handleSort(18)} display="flex" alignItems="center" userSelect="none">
                        TOTAL (IEG) -100% {sortConfig.key === 18 && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </Box>
                    </Th>
                  </Tooltip>
                </Tr>
              </Thead>
              <Tbody>
                {sortedTriangulationData.map((row, index) => (
                  <Tr key={index} onClick={() => {
                    setSelectedCompany(row); onOpen();
                  }} cursor="pointer" _hover={{bg: 'gray.100'}}>
                    <Td maxW="240px" position="sticky" left={0} bg="white" zIndex={1}>
                      <Tooltip label={row.company} hasArrow>
                        <Box as="span" display="inline-block" maxW="240px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                          {row.company}
                        </Box>
                      </Tooltip>
                    </Td>
                    <Td>
                      <Tooltip label={`Company Size: ${row.companySize || 'Unknown'}`}>
                        <span>{row.companySize || '-'}</span>
                      </Tooltip>
                    </Td>
                    {row.values.map((val, i) => (
                      <Td key={i}>{fmt1(val)}</Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TabPanel>
          <TabPanel>
            <Table variant="striped" colorScheme="blue" size="sm" mt={3}
              sx={{'th, td': {whiteSpace: 'nowrap'}}}>
              <TableCaption>Component Averages Based on Validated (V) and IEG Scores</TableCaption>
              <Thead>
                <Tr>
                  <Th position="sticky" left={0} top={0} bg="blue.50" zIndex={3}>
                    <Box as="button" onClick={() => handleSort(0)} display="flex" alignItems="center" userSelect="none">
                      Company {sortConfig.key === 0 && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                    </Box>
                  </Th>
                  <Th>
                    Size
                  </Th>
                  <Tooltip label="People Management Systems Average (Validated + IEG)" hasArrow>
                    <Th position="sticky" top={0} bg="blue.50" zIndex={2}>
                      <Box as="button" onClick={() => handleSort(2)} display="flex" alignItems="center" userSelect="none">
                        PMS Avg (V+IEG) -15% {sortConfig.key === 2 && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </Box>
                    </Th>
                  </Tooltip>
                  <Tooltip label="Production, Continuous Improvement & Innovation Avg (V+IEG)" hasArrow>
                    <Th position="sticky" top={0} bg="blue.50" zIndex={2}>
                      <Box as="button" onClick={() => handleSort(5)} display="flex" alignItems="center" userSelect="none">
                        PCII Avg (V+IEG) -25% {sortConfig.key === 5 && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </Box>
                    </Th>
                  </Tooltip>
                  <Tooltip label="Procurement & Inputs Management Avg (V+IEG)" hasArrow>
                    <Th position="sticky" top={0} bg="blue.50" zIndex={2}>
                      <Box as="button" onClick={() => handleSort(8)} display="flex" alignItems="center" userSelect="none">
                        PIM Avg (V+IEG) -25% {sortConfig.key === 8 && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </Box>
                    </Th>
                  </Tooltip>
                  <Tooltip label="Public Engagement Avg (V+IEG)" hasArrow>
                    <Th position="sticky" top={0} bg="blue.50" zIndex={2}>
                      <Box as="button" onClick={() => handleSort(11)} display="flex" alignItems="center" userSelect="none">
                        PE Avg (V+IEG) -10% {sortConfig.key === 11 && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </Box>
                    </Th>
                  </Tooltip>
                  <Tooltip label="Governance & Leadership Culture Avg (V+IEG)" hasArrow>
                    <Th position="sticky" top={0} bg="blue.50" zIndex={2}>
                      <Box as="button" onClick={() => handleSort(14)} display="flex" alignItems="center" userSelect="none">
                        GLC Avg (V+IEG) -25% {sortConfig.key === 14 && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </Box>
                    </Th>
                  </Tooltip>
                  <Tooltip label="Weighted Total Average (V+IEG)" hasArrow>
                    <Th position="sticky" top={0} bg="blue.50" zIndex={2}>
                      <Box as="button" onClick={() => handleSort(18)} display="flex" alignItems="center" userSelect="none">
                        Total Averages -100% {sortConfig.key === 18 && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </Box>
                    </Th>
                  </Tooltip>
                </Tr>
              </Thead>
              <Tbody>
                {sortedTriangulationData.map((row, index) => {
                  const [pmsV, pmsIEG, pciiV, pciiIEG, pimV, pimIEG, peV, peIEG, glcV, glcIEG] = [
                    row.values[1], row.values[2],
                    row.values[4], row.values[5],
                    row.values[7], row.values[8],
                    row.values[10], row.values[11],
                    row.values[13], row.values[14]
                  ];
                  const pmsAvg = (pmsV + pmsIEG) / 2;
                  const pciiAvg = (pciiV + pciiIEG) / 2;
                  const pimAvg = (pimV + pimIEG) / 2;
                  const peAvg = (peV + peIEG) / 2;
                  const glcAvg = (glcV + glcIEG) / 2;
                  const total = (
                    pmsAvg +
                    pciiAvg +
                    pimAvg +
                    peAvg +
                    glcAvg
                  ).toFixed(1);

                  return (
                    <Tr key={index} onClick={() => {
                      setSelectedCompany(row); onOpen();
                    }} cursor="pointer" _hover={{bg: 'gray.100'}}>
                      <Td maxW="240px" position="sticky" left={0} bg="white" zIndex={1}>
                        <Tooltip label={row.company} hasArrow>
                          <Box as="span" display="inline-block" maxW="240px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                            {row.company}
                          </Box>
                        </Tooltip>
                      </Td>
                      <Td>
                        <Tooltip label={`Company Size: ${row.companySize || 'Unknown'}`}>
                          <span>{row.companySize || '-'}</span>
                        </Tooltip>
                      </Td>
                      <Td>{pmsAvg.toFixed(1)}%</Td>
                      <Td>{pciiAvg.toFixed(1)}%</Td>
                      <Td>{pimAvg.toFixed(1)}%</Td>
                      <Td>{peAvg.toFixed(1)}%</Td>
                      <Td>{glcAvg.toFixed(1)}%</Td>
                      <Td>{total}%</Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Company Component Breakdown Drawer */}
      <Drawer isOpen={isOpen && !!selectedCompany} placement="right" size="xl" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            {selectedCompany?.company || 'Company'} — Component Breakdown
          </DrawerHeader>
          <DrawerBody>
            <Box mb={3} textAlign="right">
              <Button size="sm" onClick={exportChartImage}>Export Graph</Button>
            </Box>
            {selectedCompany && (
              <Box>
                <Bar
                  ref={chartRef}
                  data={{
                    labels: componentLabels,
                    datasets: [
                      {
                        label: 'Score (%)',
                        backgroundColor: chartColors,
                        data: selectedCompany.values,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {display: false},
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            return `${context.label}: ${context.raw}%`;
                          },
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        title: {display: true, text: '% Score'},
                      },
                    },
                  }}
                  height={400}
                />
              </Box>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

Triangulation.propTypes = {
  cycle: PropTypes.shape({id: PropTypes.string}),
};

export default Triangulation;
