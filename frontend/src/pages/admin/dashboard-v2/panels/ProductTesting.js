import React, {useEffect, useMemo, useState, useRef} from 'react';
import PropTypes from 'prop-types';
import {Box, Heading, Text, VStack, Table, Thead, Tbody, Tr, Th, Td, Tooltip, Tabs, TabList, TabPanels, Tab, TabPanel, Spinner, Center, Alert, AlertIcon, SimpleGrid, Stat, StatLabel, StatNumber, IconButton, HStack, Wrap, WrapItem, Input, NumberInput, NumberInputField, Button, Checkbox, CheckboxGroup, Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverArrow, PopoverCloseButton, Divider, Select, Collapse, FormControl, FormLabel, Badge, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseButton, useBreakpointValue} from '@chakra-ui/react';
import {TriangleUpIcon, TriangleDownIcon, DownloadIcon} from '@chakra-ui/icons';
import {request} from 'common';
import {fmt2, fmtPct2, pickField, findNutrient, findVitaminAResult, getPercentForBand, getBandLabel, getBandColorScheme, inRange, overallColor, downloadCSV} from './productTesting/helpers';
import {useProductTestingData} from './productTesting/useProductTestingData';
import {WheatTable, MaizeTable, OilTable} from './productTesting/Tables';


const ProductTesting = ({cycle}) => {
  const {loading, error, wheat: wheatFlourData, maize: maizeFlourData, oils: edibleOilData, wheatStats, maizeStats, oilStats} = useProductTestingData(cycle);

  // ---------------- Filters ----------------
  const [searchText, setSearchText] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [typeFilter, setTypeFilter] = useState(''); // '', 'Wheat', 'Maize'

  // samples
  const [samplesMin, setSamplesMin] = useState('');
  const [samplesMax, setSamplesMax] = useState('');

  // Overall MFI
  const [overallMin, setOverallMin] = useState('');
  const [overallMax, setOverallMax] = useState('');

  // Pillar values
  const [vitAMin, setVitAMin] = useState('');
  const [vitAMax, setVitAMax] = useState('');
  const [vitB3Min, setVitB3Min] = useState('');
  const [vitB3Max, setVitB3Max] = useState('');
  const [ironMin, setIronMin] = useState('');
  const [ironMax, setIronMax] = useState('');

  // Compliance minimums
  const [compVitAMin, setCompVitAMin] = useState('');
  const [compVitB3Min, setCompVitB3Min] = useState('');
  const [compIronMin, setCompIronMin] = useState('');

  // Scores (0-30)
  const [score1Min, setScore1Min] = useState('');
  const [score1Max, setScore1Max] = useState('');
  const [score2Min, setScore2Min] = useState('');
  const [score2Max, setScore2Max] = useState('');
  const [score3Min, setScore3Min] = useState('');
  const [score3Max, setScore3Max] = useState('');

  // Maize-specific extras
  const [aflatoxinMin, setAflatoxinMin] = useState('');
  const [aflatoxinMax, setAflatoxinMax] = useState('');
  const [maxPercentMin, setMaxPercentMin] = useState('');
  const [maxPercentMax, setMaxPercentMax] = useState('');
  const [kmfiAflatoxinMin, setKmfiAflatoxinMin] = useState('');
  const [kmfiAflatoxinMax, setKmfiAflatoxinMax] = useState('');
  const [weightedMin, setWeightedMin] = useState('');
  const [weightedMax, setWeightedMax] = useState('');

  // UI: show/hide advanced filters
  const [showAdvanced, setShowAdvanced] = useState(false);
  // Show/Hide: Micronutrient Standard Keys & Scoring Bands
  const [showStandards, setShowStandards] = useState(false);
  // Drawer size: full width on mobile, xl on md+
  const drawerSize = useBreakpointValue({base: 'full', md: 'xl'});


  // ---- Per-tab filters storage & helpers ----
  const prevTabRef = useRef(0);
  const makeDefaultFilters = (index) => ({
    searchText: '',
    selectedCompanies: [],
    selectedBrands: [],
    typeFilter: index === 0 ? 'Wheat' : index === 1 ? 'Maize' : index === 2 ? 'Edible Oil' : '',
    samplesMin: '', samplesMax: '',
    overallMin: '', overallMax: '',
    vitAMin: '', vitAMax: '',
    vitB3Min: '', vitB3Max: '',
    ironMin: '', ironMax: '',
    compVitAMin: '', compVitB3Min: '', compIronMin: '',
    score1Min: '', score1Max: '',
    score2Min: '', score2Max: '',
    score3Min: '', score3Max: '',
    aflatoxinMin: '', aflatoxinMax: '',
    maxPercentMin: '', maxPercentMax: '',
    kmfiAflatoxinMin: '', kmfiAflatoxinMax: '',
    weightedMin: '', weightedMax: '',
    showAdvanced: false,
    showStandards: false,
  });

  const filtersRef = useRef({
    0: makeDefaultFilters(0),
    1: makeDefaultFilters(1),
    2: makeDefaultFilters(2),
    3: makeDefaultFilters(3),
  });

  const getFiltersSnapshot = () => ({
    searchText,
    selectedCompanies,
    selectedBrands,
    typeFilter,
    samplesMin, samplesMax,
    overallMin, overallMax,
    vitAMin, vitAMax,
    vitB3Min, vitB3Max,
    ironMin, ironMax,
    compVitAMin, compVitB3Min, compIronMin,
    score1Min, score1Max,
    score2Min, score2Max,
    score3Min, score3Max,
    aflatoxinMin, aflatoxinMax,
    maxPercentMin, maxPercentMax,
    kmfiAflatoxinMin, kmfiAflatoxinMax,
    weightedMin, weightedMax,
    showAdvanced,
    showStandards,
  });

  const applyFiltersSnapshot = (f) => {
    setSearchText(f.searchText ?? '');
    setSelectedCompanies(f.selectedCompanies ?? []);
    setSelectedBrands(f.selectedBrands ?? []);
    setTypeFilter(f.typeFilter ?? '');
    setSamplesMin(f.samplesMin ?? ''); setSamplesMax(f.samplesMax ?? '');
    setOverallMin(f.overallMin ?? ''); setOverallMax(f.overallMax ?? '');
    setVitAMin(f.vitAMin ?? ''); setVitAMax(f.vitAMax ?? '');
    setVitB3Min(f.vitB3Min ?? ''); setVitB3Max(f.vitB3Max ?? '');
    setIronMin(f.ironMin ?? ''); setIronMax(f.ironMax ?? '');
    setCompVitAMin(f.compVitAMin ?? '');
    setCompVitB3Min(f.compVitB3Min ?? '');
    setCompIronMin(f.compIronMin ?? '');
    setScore1Min(f.score1Min ?? ''); setScore1Max(f.score1Max ?? '');
    setScore2Min(f.score2Min ?? ''); setScore2Max(f.score2Max ?? '');
    setScore3Min(f.score3Min ?? ''); setScore3Max(f.score3Max ?? '');
    setAflatoxinMin(f.aflatoxinMin ?? ''); setAflatoxinMax(f.aflatoxinMax ?? '');
    setMaxPercentMin(f.maxPercentMin ?? ''); setMaxPercentMax(f.maxPercentMax ?? '');
    setKmfiAflatoxinMin(f.kmfiAflatoxinMin ?? ''); setKmfiAflatoxinMax(f.kmfiAflatoxinMax ?? '');
    setWeightedMin(f.weightedMin ?? ''); setWeightedMax(f.weightedMax ?? '');
    setShowAdvanced(!!(f.showAdvanced));
    setShowStandards(!!(f.showStandards));
  };

  const allRows = useMemo(
    () => [...wheatFlourData, ...maizeFlourData, ...edibleOilData],
    [wheatFlourData, maizeFlourData, edibleOilData]
  );
  const companyOptions = useMemo(
    () => Array.from(new Set(allRows.map((r) => r.company).filter(Boolean))).sort((a, b)=>a.localeCompare(b)),
    [allRows]
  );
  const brandOptions = useMemo(
    () => Array.from(new Set(allRows.map((r) => r.brand).filter(Boolean))).sort((a, b)=>a.localeCompare(b)),
    [allRows]
  );


  const toNumber = (v, def = 0) => {
    const n = typeof v === 'number' ? v : parseFloat(v);
    return Number.isFinite(n) ? n : def;
  };

  const sizeTooltipText = (row) => {
    const s = row?.small ?? '—';
    const m = row?.medium ?? '—';
    const l = row?.large ?? '—';
    const src = row?.size || row?.companySize || row?.company_size ? 'Provided by dataset' : 'Derived from S/M/L values';
    return `Small: ${s}\nMedium: ${m}\nLarge: ${l}\n(${src})`;
  };


  const exportWheat = () => {
    const header = [
      'Company',
      'Brand',
      'Size',
      'No of Samples',
      'Vit. A Results (Mg/Kg)',
      '% Compliance (Vit A)',
      'MFI Score 1',
      'Vit. B3 Results (Mg/Kg)',
      '% Compliance (Vit B3)',
      'MFI Score 2',
      'Iron Results (Mg/Kg)',
      '% Compliance (Iron)',
      'MFI Score 3',
      'Overall MFI Fortification Result (Average)',
      'Interpretation'
    ];
    const rows = wheatSorted.map((r) => [
      r.company,
      r.brand,
      r.size,
      fmt2(r.samples),
      fmt2(r.vitA),
      fmtPct2(r.vitACompliance),
      fmt2(r.score1),
      fmt2(r.vitB3),
      fmtPct2(r.vitB3Compliance),
      fmt2(r.score2),
      fmt2(r.iron),
      fmtPct2(r.ironCompliance),
      fmt2(r.score3),
      fmt2(r.overall),
      getBandLabel(getPercentForBand(r)),
    ]);
    downloadCSV(`wheat_flour_${Date.now()}.csv`, header, rows);
  };

  const exportMaize = () => {
    const header = [
      'Company',
      'Brand',
      'Size',
      'No of Samples',
      'Vit. A Results (Mg/Kg)',
      '% Compliance (Vit A)',
      'MFI Score 1',
      'Vit. B3 Results (Mg/Kg)',
      '% Compliance (Vit B3)',
      'MFI Score 2',
      'Iron Results (Mg/Kg)',
      '% Compliance (Iron)',
      'MFI Score 3',
      'Overall MFI Result (Avg) - 20%',
      'Aflatoxin Containment Score',
      '% of Max',
      'KMFI Aflatoxin Score - 10%',
      'Overall KMFI Score - Weighted',
      'Interpretation'
    ];
    const rows = maizeSorted.map((r) => [
      r.company,
      r.brand,
      r.size,
      fmt2(r.samples),
      fmt2(r.vitA),
      fmtPct2(r.vitACompliance),
      fmt2(r.score1),
      fmt2(r.vitB3),
      fmtPct2(r.vitB3Compliance),
      fmt2(r.score2),
      fmt2(r.iron),
      fmtPct2(r.ironCompliance),
      fmt2(r.score3),
      fmt2(r.overall),
      fmt2(r.aflatoxinScore),
      r.percentOfMax != null ? `${fmt2(r.percentOfMax)}%` : '',
      fmt2(r.kmfiAflatoxin),
      fmt2(r.weightedScore),
      getBandLabel(getPercentForBand(r)),
    ]);
    downloadCSV(`maize_flour_${Date.now()}.csv`, header, rows);
  };
  const exportOil = () => {
    const header = [
      'Company',
      'Brand',
      'Size',
      'No of Samples',
      'Vit. A Results (Mg/Kg)',
      '% Compliance (Vit A)',
      'MFI Score (Vit A)',
      'Overall MFI Fortification Result (Average)',
      'Interpretation'
    ];
    const rows = oilSorted.map((r) => [
      r.company,
      r.brand,
      r.size,
      fmt2(r.samples),
      fmt2(r.vitA),
      fmtPct2(r.vitACompliance),
      fmt2(r.score1),
      fmt2(r.overall),
      getBandLabel(getPercentForBand(r)),
    ]);
    downloadCSV(`edible_oil_${Date.now()}.csv`, header, rows);
  };

  const exportSummary = () => {
    const header = [
      'Company',
      'Category',
      'Brand',
      'Size',
      'Type',
      'Overall MFI Fortification Result (Average)',
      'Interpretation'
    ];
    const rows = summarySorted.map((r) => [
      r.company,
      r.category,
      r.brand,
      r.size,
      r.type,
      fmt2(r.overall),
      getBandLabel(getPercentForBand(r)),
    ]);
    downloadCSV(`summary_results_${Date.now()}.csv`, header, rows);
  };


  const filterRows = (rows) => {
    const txt = searchText.trim().toLowerCase();
    const compSet = selectedCompanies.length ? new Set(selectedCompanies) : null;
    const brandSet = selectedBrands.length ? new Set(selectedBrands) : null;

    return rows.filter((r) => {
      // Type/category filter
      if (typeFilter && String(r.type).toLowerCase() !== typeFilter.toLowerCase()) return false;

      // Search (company OR brand)
      if (txt) {
        const hay = `${r.company ?? ''} ${r.brand ?? ''}`.toLowerCase();
        if (!hay.includes(txt)) return false;
      }

      // Company & Brand multi-select
      if (compSet && !compSet.has(r.company)) return false;
      if (brandSet && !brandSet.has(r.brand)) return false;

      // Samples
      if (!inRange(r.samples, samplesMin, samplesMax)) return false;

      // Overall MFI
      if (!inRange(r.overall, overallMin, overallMax)) return false;

      // Nutrient values
      if (!inRange(r.vitA, vitAMin, vitAMax)) return false;
      if (!inRange(r.vitB3, vitB3Min, vitB3Max)) return false;
      if (!inRange(r.iron, ironMin, ironMax)) return false;

      // Compliance minimums (treat strings like "83%")
      const pc = (x) => x == null ? null : Number(String(x).replace(/%/g, ''));
      const cA = pc(r.vitACompliance);
      const cB3 = pc(r.vitB3Compliance);
      const cFe = pc(r.ironCompliance);
      if (compVitAMin !== '' && !(cA != null && cA >= Number(compVitAMin))) return false;
      if (compVitB3Min !== '' && !(cB3 != null && cB3 >= Number(compVitB3Min))) return false;
      if (compIronMin !== '' && !(cFe != null && cFe >= Number(compIronMin))) return false;

      // Scores
      if (!inRange(r.score1, score1Min, score1Max)) return false;
      if (!inRange(r.score2, score2Min, score2Max)) return false;
      if (!inRange(r.score3, score3Min, score3Max)) return false;

      // Maize extras (no-op for wheat rows)
      if (typeFilter.toLowerCase() === 'maize' || r.type === 'Maize') {
        if (!inRange(r.aflatoxinScore ?? null, aflatoxinMin, aflatoxinMax)) return false;
        if (!inRange(r.percentOfMax ?? null, maxPercentMin, maxPercentMax)) return false;
        if (!inRange(r.kmfiAflatoxin ?? null, kmfiAflatoxinMin, kmfiAflatoxinMax)) return false;
        if (!inRange(r.weightedScore ?? null, weightedMin, weightedMax)) return false;
      }

      return true;
    });
  };


  // Add useState for tab index
  const [tabIndex, setTabIndex] = useState(0);

  // Persist & swap filters when tab changes
  useEffect(() => {
    const prev = prevTabRef.current;
    // Save current tab filters
    filtersRef.current[prev] = getFiltersSnapshot();

    // Load filters for new tab (or defaults)
    const snap = filtersRef.current[tabIndex] || makeDefaultFilters(tabIndex);
    applyFiltersSnapshot(snap);

    // Ensure sensible default for type based on tab if blank
    if (!snap.typeFilter || snap.typeFilter === '') {
      if (tabIndex === 0) setTypeFilter('Wheat');
      else if (tabIndex === 1) setTypeFilter('Maize');
      else if (tabIndex === 2) setTypeFilter('Edible Oil');
      else setTypeFilter('');
    }

    prevTabRef.current = tabIndex;
  }, [tabIndex]);

  // Sorting state (shared across tabs)
  const [sortConfig, setSortConfig] = useState({key: null, direction: 'asc'});

  const requestSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {key, direction: prev.direction === 'asc' ? 'desc' : 'asc'};
      }
      return {key, direction: 'asc'};
    });
  };

  const compareValues = (a, b) => {
    // If sorting by band, map labels to ranks first
    if (sortConfig.key === 'band') {
      const rank = (label) => {
        switch (label) {
          case 'Fully Fortified': return 5;
          case 'Adequately Fortified': return 4;
          case 'Partly Fortified': return 3;
          case 'Inadequately Fortified': return 2;
          case 'Not Fortified': return 1;
          default: return 0;
        }
      };
      const ra = rank(getBandLabel(getPercentForBand(a)));
      const rb = rank(getBandLabel(getPercentForBand(b)));
      if (ra < rb) return -1;
      if (ra > rb) return 1;
      return 0;
    }

    // Try numeric compare first
    const na = typeof a === 'number' ? a : parseFloat(a);
    const nb = typeof b === 'number' ? b : parseFloat(b);
    const aNum = Number.isFinite(na) ? na : null;
    const bNum = Number.isFinite(nb) ? nb : null;
    if (aNum !== null && bNum !== null) {
      if (aNum < bNum) return -1;
      if (aNum > bNum) return 1;
      return 0;
    }
    // Fallback to string compare
    const sa = (a ?? '').toString().toUpperCase();
    const sb = (b ?? '').toString().toUpperCase();
    return sa.localeCompare(sb);
  };

  const sortRows = (rows) => {
    if (!sortConfig.key) return rows;
    const sorted = [...rows].sort((r1, r2) => compareValues(r1[sortConfig.key], r2[sortConfig.key]));
    return sortConfig.direction === 'asc' ? sorted : sorted.reverse();
  };

  const wheatFiltered = useMemo(() => filterRows(wheatFlourData), [wheatFlourData, searchText, selectedCompanies, selectedBrands, typeFilter, samplesMin, samplesMax, overallMin, overallMax, vitAMin, vitAMax, vitB3Min, vitB3Max, ironMin, ironMax, compVitAMin, compVitB3Min, compIronMin, score1Min, score1Max, score2Min, score2Max, score3Min, score3Max, aflatoxinMin, aflatoxinMax, maxPercentMin, maxPercentMax, kmfiAflatoxinMin, kmfiAflatoxinMax, weightedMin, weightedMax]);
  const maizeFiltered = useMemo(() => filterRows(maizeFlourData), [maizeFlourData, searchText, selectedCompanies, selectedBrands, typeFilter, samplesMin, samplesMax, overallMin, overallMax, vitAMin, vitAMax, vitB3Min, vitB3Max, ironMin, ironMax, compVitAMin, compVitB3Min, compIronMin, score1Min, score1Max, score2Min, score2Max, score3Min, score3Max, aflatoxinMin, aflatoxinMax, maxPercentMin, maxPercentMax, kmfiAflatoxinMin, kmfiAflatoxinMax, weightedMin, weightedMax]);
  const oilFiltered = useMemo(
    () => filterRows(edibleOilData),
    [
      edibleOilData,
      searchText, selectedCompanies, selectedBrands, typeFilter,
      samplesMin, samplesMax, overallMin, overallMax,
      vitAMin, vitAMax, vitB3Min, vitB3Max, ironMin, ironMax,
      compVitAMin, compVitB3Min, compIronMin,
      score1Min, score1Max, score2Min, score2Max, score3Min, score3Max,
      aflatoxinMin, aflatoxinMax, maxPercentMin, maxPercentMax,
      kmfiAflatoxinMin, kmfiAflatoxinMax, weightedMin, weightedMax
    ]
  );

  const wheatSorted = useMemo(() => sortRows(wheatFiltered), [wheatFiltered, sortConfig]);
  const maizeSorted = useMemo(() => sortRows(maizeFiltered), [maizeFiltered, sortConfig]);
  const oilSorted = useMemo(() => sortRows(oilFiltered), [oilFiltered, sortConfig]);

  const summaryFiltered = useMemo(
    () => filterRows([
      ...wheatFlourData.map((r) => ({...r, category: 'Wheat Flour', type: 'Wheat'})),
      ...maizeFlourData.map((r) => ({...r, category: 'Maize Flour', type: 'Maize'})),
      ...edibleOilData.map((r) => ({...r, category: 'Edible Oil', type: 'Edible Oil'})),
    ]),
    [wheatFlourData, maizeFlourData, edibleOilData, searchText, selectedCompanies, selectedBrands, typeFilter, samplesMin, samplesMax, overallMin, overallMax, vitAMin, vitAMax, vitB3Min, vitB3Max, ironMin, ironMax, compVitAMin, compVitB3Min, compIronMin, score1Min, score1Max, score2Min, score2Max, score3Min, score3Max, aflatoxinMin, aflatoxinMax, maxPercentMin, maxPercentMax, kmfiAflatoxinMin, kmfiAflatoxinMax, weightedMin, weightedMax]
  );
  const summarySorted = useMemo(() => sortRows(summaryFiltered), [summaryFiltered, sortConfig]);

  return (
    <Box>
      <HStack spacing={4} mb={4}>
        <Heading size="lg">
          Product Testing Scores
        </Heading>
        <Button size="sm" onClick={() => setShowStandards((v) => !v)} variant="ghost">
          {showStandards ? 'Hide Keys & Bands' : 'Show Keys & Bands'}
        </Button>
      </HStack>
      <Text mb={6}>
        Overview of micronutrient compliance based on lab results of wheat flour, maize flour, and edible oil samples collected from participating companies.
      </Text>

      {loading && (
        <Center py={8}><Spinner size="lg" /></Center>
      )}
      {error && !loading && (
        <Alert status="error" mb={4}>
          <AlertIcon /> {error}
        </Alert>
      )}

      {/* Stats Grid */}
      {tabIndex === 0 && (
        <SimpleGrid columns={{base: 1, sm: 2, md: 3, lg: 4}} spacing={6} mb={8}>
          <Stat>
            <StatLabel>Wheat: Avg Samples</StatLabel>
            <StatNumber>{fmt2(wheatStats.samples)}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Wheat: Avg Vit. A (mg/kg)</StatLabel>
            <StatNumber>{fmt2(wheatStats.vitA)}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Wheat: Avg Vit. B3 (mg/kg)</StatLabel>
            <StatNumber>{fmt2(wheatStats.vitB3)}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Wheat: Avg Iron (mg/kg)</StatLabel>
            <StatNumber>{fmt2(wheatStats.iron)}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Wheat: Avg Overall MFI</StatLabel>
            <StatNumber>{fmt2(wheatStats.overall)}</StatNumber>
          </Stat>
        </SimpleGrid>
      )}
      {tabIndex === 1 && (
        <SimpleGrid columns={{base: 1, sm: 2, md: 3, lg: 4}} spacing={6} mb={8}>
          <Stat>
            <StatLabel>Maize: Avg Samples</StatLabel>
            <StatNumber>{fmt2(maizeStats.samples)}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Maize: Avg Vit. A (mg/kg)</StatLabel>
            <StatNumber>{fmt2(maizeStats.vitA)}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Maize: Avg Vit. B3 (mg/kg)</StatLabel>
            <StatNumber>{fmt2(maizeStats.vitB3)}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Maize: Avg Iron (mg/kg)</StatLabel>
            <StatNumber>{fmt2(maizeStats.iron)}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Maize: Avg Overall MFI</StatLabel>
            <StatNumber>{fmt2(maizeStats.overall)}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Maize: Avg Aflatoxin</StatLabel>
            <StatNumber>{fmt2(maizeStats.aflatoxinScore)}</StatNumber>
          </Stat>
        </SimpleGrid>
      )}
      {tabIndex === 2 && (
        <SimpleGrid columns={{base: 1, sm: 2, md: 3, lg: 4}} spacing={6} mb={8}>
          <Stat>
            <StatLabel>Edible Oil: Avg Samples</StatLabel>
            <StatNumber>{fmt2(oilStats.samples)}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Edible Oil: Avg Vit. A (mg/kg)</StatLabel>
            <StatNumber>{fmt2(oilStats.vitA)}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Edible Oil: Avg Overall MFI</StatLabel>
            <StatNumber>{fmt2(oilStats.overall)}</StatNumber>
          </Stat>
        </SimpleGrid>
      )}
      {tabIndex === 3 && (
        <SimpleGrid columns={{base: 1, sm: 2, md: 3, lg: 4}} spacing={6} mb={8}>
          <Stat>
            <StatLabel>Wheat: Avg Overall MFI</StatLabel>
            <StatNumber>{fmt2(wheatStats.overall)}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Maize: Avg Overall MFI</StatLabel>
            <StatNumber>{fmt2(maizeStats.overall)}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Edible Oil: Avg Overall MFI</StatLabel>
            <StatNumber>{fmt2(oilStats.overall)}</StatNumber>
          </Stat>
        </SimpleGrid>
      )}

      {/* Filters Toolbar (clean) */}
      <Box mb={4} p={3} borderWidth="1px" borderRadius="md">
        {/* Top row: essentials */}
        <HStack spacing={3} align="center" flexWrap="wrap">
          <Input
            size="sm"
            placeholder="Search company or brand"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            maxW="260px"
          />

          <Select
            size="sm"
            placeholder="Filter by Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            maxW="160px"
          >
            <option value="Wheat">Wheat</option>
            <option value="Maize">Maize</option>
            <option value="Edible Oil">Edible Oil</option>
          </Select>

          {/* Company Multi-select */}
          <Popover placement="bottom-start">
            <PopoverTrigger>
              <Button size="sm" variant="outline">
                {selectedCompanies.length ? `Companies (${selectedCompanies.length})` : 'Filter Companies'}
              </Button>
            </PopoverTrigger>
            <PopoverContent w="280px">
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverHeader fontWeight="semibold">Select Companies</PopoverHeader>
              <PopoverBody>
                <HStack justify="space-between" mb={2}>
                  <Button size="xs" variant="ghost" onClick={() => setSelectedCompanies(companyOptions)}>All</Button>
                  <Button size="xs" variant="ghost" onClick={() => setSelectedCompanies([])}>Clear</Button>
                </HStack>
                <Box maxH="220px" overflowY="auto" pr={1}>
                  <CheckboxGroup value={selectedCompanies} onChange={(vals) => setSelectedCompanies(vals)}>
                    <VStack align="start" spacing={2}>
                      {companyOptions.map((name) => (
                        <Checkbox key={name} value={name}>{name}</Checkbox>
                      ))}
                    </VStack>
                  </CheckboxGroup>
                </Box>
              </PopoverBody>
            </PopoverContent>
          </Popover>

          {/* Brand Multi-select */}
          <Popover placement="bottom-start">
            <PopoverTrigger>
              <Button size="sm" variant="outline">
                {selectedBrands.length ? `Brands (${selectedBrands.length})` : 'Filter Brands'}
              </Button>
            </PopoverTrigger>
            <PopoverContent w="280px">
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverHeader fontWeight="semibold">Select Brands</PopoverHeader>
              <PopoverBody>
                <HStack justify="space-between" mb={2}>
                  <Button size="xs" variant="ghost" onClick={() => setSelectedBrands(brandOptions)}>All</Button>
                  <Button size="xs" variant="ghost" onClick={() => setSelectedBrands([])}>Clear</Button>
                </HStack>
                <Box maxH="220px" overflowY="auto" pr={1}>
                  <CheckboxGroup value={selectedBrands} onChange={(vals) => setSelectedBrands(vals)}>
                    <VStack align="start" spacing={2}>
                      {brandOptions.map((name) => (
                        <Checkbox key={name} value={name}>{name}</Checkbox>
                      ))}
                    </VStack>
                  </CheckboxGroup>
                </Box>
              </PopoverBody>
            </PopoverContent>
          </Popover>

          <HStack ml="auto" spacing={2}>
            <Button size="sm" variant="ghost" onClick={() => {
              setSearchText(''); setSelectedCompanies([]); setSelectedBrands([]); setTypeFilter('');
              setSamplesMin(''); setSamplesMax(''); setOverallMin(''); setOverallMax('');
              setVitAMin(''); setVitAMax(''); setVitB3Min(''); setVitB3Max(''); setIronMin(''); setIronMax('');
              setCompVitAMin(''); setCompVitB3Min(''); setCompIronMin('');
              setScore1Min(''); setScore1Max(''); setScore2Min(''); setScore2Max(''); setScore3Min(''); setScore3Max('');
              setAflatoxinMin(''); setAflatoxinMax(''); setMaxPercentMin(''); setMaxPercentMax(''); setKmfiAflatoxinMin(''); setKmfiAflatoxinMax(''); setWeightedMin(''); setWeightedMax('');
            }}>
              Reset
            </Button>

            <Button size="sm" onClick={() => setShowAdvanced((v) => !v)} variant="solid">
              {showAdvanced ? 'Hide advanced' : 'Advanced filters'}
            </Button>
            <Button
              size="sm"
              leftIcon={<DownloadIcon />}
              onClick={() => {
                if (tabIndex === 0) return exportWheat();
                if (tabIndex === 1) return exportMaize();
                if (tabIndex === 2) return exportOil();
                return exportSummary();
              }}
            >
              Export CSV
            </Button>
          </HStack>
        </HStack>

        {/* Micronutrient Standard Keys & Scoring Bands */}
        <Drawer isOpen={showStandards} placement="right" size={drawerSize} onClose={() => setShowStandards(false)}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Micronutrient Standards & Scoring Bands</DrawerHeader>
            <DrawerBody>
              <SimpleGrid columns={{base: 1, md: 2}} spacing={6}>
                {/* MICRONUTRIENT STANDARDS KEY */}
                <Box p={4} borderWidth="1px" borderRadius="md">
                  <Heading as="h3" size="sm" mb={2}>Micronutrient Standards Key</Heading>
                  <Text fontSize="sm" mb={3}>Expected values at 100% compliance</Text>

                  {/* Flour (Wheat/Maize) */}
                  <Heading as="h4" size="xs" mb={2}>Flour</Heading>
                  <Table size="sm" variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Nutrient</Th>
                        <Th isNumeric>Target @ 100%</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td>Vitamin A</Td>
                        <Td isNumeric>6,666 iu/kg</Td>
                      </Tr>
                      <Tr>
                        <Td>Vitamin B3 (Niacin)</Td>
                        <Td isNumeric>45 iu/kg</Td>
                      </Tr>
                      <Tr>
                        <Td>Iron</Td>
                        <Td isNumeric>40 mg/kg</Td>
                      </Tr>
                    </Tbody>
                  </Table>

                  <Divider my={4} />

                  {/* Sugar */}
                  <Heading as="h4" size="xs" mb={2}>Sugar</Heading>
                  <Table size="sm" variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Nutrient</Th>
                        <Th isNumeric>Target @ 100%</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td>Vitamin A</Td>
                        <Td isNumeric>25,000 iu/kg</Td>
                      </Tr>
                    </Tbody>
                  </Table>

                  <Divider my={4} />

                  {/* Edible Oils */}
                  <Heading as="h4" size="xs" mb={2}>Edible Oils</Heading>
                  <Table size="sm" variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Nutrient</Th>
                        <Th isNumeric>Target @ 100%</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td>Vitamin A</Td>
                        <Td isNumeric>20,000 iu/kg</Td>
                      </Tr>
                    </Tbody>
                  </Table>

                  <Divider my={4} />

                  {/* Salt */}
                  <Heading as="h4" size="xs" mb={2}>Salt</Heading>
                  <Table size="sm" variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Nutrient</Th>
                        <Th isNumeric>Target @ 100%</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td>Iodine</Td>
                        <Td isNumeric>—</Td>
                      </Tr>
                    </Tbody>
                  </Table>

                  <Text fontSize="xs" color="gray.600" mt={3}>
                    Note: Targets are reference values used in dashboard banding. Country standards may specify different units/values.
                  </Text>
                </Box>

                {/* SCORING BANDS */}
                <Box p={4} borderWidth="1px" borderRadius="md">
                  <Heading as="h3" size="sm" mb={2}>Bandings & Narrative Scores</Heading>
                  <Table size="sm" variant="striped" colorScheme="gray">
                    <Thead>
                      <Tr>
                        <Th>Banding (Compliance %)</Th>
                        <Th>Weighted Scores (MFI 0–20)</Th>
                        <Th>Narrative</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td>100% and above</Td>
                        <Td>20%</Td>
                        <Td>Fully Fortified</Td>
                      </Tr>
                      <Tr>
                        <Td>80% – 99%</Td>
                        <Td>—</Td>
                        <Td>Adequately Fortified</Td>
                      </Tr>
                      <Tr>
                        <Td>51% – 79%</Td>
                        <Td>10% – 19.9%</Td>
                        <Td>Partly Fortified</Td>
                      </Tr>
                      <Tr>
                        <Td>31% – 50%</Td>
                        <Td>5% – 9.9%</Td>
                        <Td>Inadequately Fortified</Td>
                      </Tr>
                      <Tr>
                        <Td>Below 31%</Td>
                        <Td>0% – 4.9%</Td>
                        <Td>Not Fortified</Td>
                      </Tr>
                    </Tbody>
                  </Table>

                  <Divider my={4} />

                  <Text fontSize="sm" mb={2}>
                    How this maps in the table:
                  </Text>
                  <VStack align="stretch" spacing={2} fontSize="sm">
                    <HStack>
                      <Badge colorScheme="green">Fully Fortified</Badge>
                      <Text>≥ 100% (shows as green band)</Text>
                    </HStack>
                    <HStack>
                      <Badge colorScheme="teal">Adequately Fortified</Badge>
                      <Text>80%–99%</Text>
                    </HStack>
                    <HStack>
                      <Badge colorScheme="orange">Partly Fortified</Badge>
                      <Text>51%–79%</Text>
                    </HStack>
                    <HStack>
                      <Badge colorScheme="red">Inadequately Fortified</Badge>
                      <Text>31%–50%</Text>
                    </HStack>
                    <HStack>
                      <Badge colorScheme="red">Not Fortified</Badge>
                      <Text>&lt; 31%</Text>
                    </HStack>
                  </VStack>
                </Box>
              </SimpleGrid>
            </DrawerBody>
          </DrawerContent>
        </Drawer>


        {/* Advanced area */}
        <Collapse in={showAdvanced} animateOpacity>
          <Divider my={3} />
          <SimpleGrid columns={{base: 1, md: 2, lg: 3}} spacing={4}>
            {/* Samples */}
            <Box p={3} borderWidth="1px" borderRadius="md">
              <Text fontWeight="semibold" mb={2}>Samples</Text>
              <HStack>
                <FormControl>
                  <FormLabel m={0} fontSize="xs">Min</FormLabel>
                  <NumberInput size="sm" value={samplesMin} onChange={(v) => setSamplesMin(v)}>
                    <NumberInputField placeholder="≥" />
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel m={0} fontSize="xs">Max</FormLabel>
                  <NumberInput size="sm" value={samplesMax} onChange={(v) => setSamplesMax(v)}>
                    <NumberInputField placeholder="≤" />
                  </NumberInput>
                </FormControl>
              </HStack>
            </Box>

            {/* Overall */}
            <Box p={3} borderWidth="1px" borderRadius="md">
              <Text fontWeight="semibold" mb={2}>Overall MFI</Text>
              <HStack>
                <FormControl>
                  <FormLabel m={0} fontSize="xs">Min</FormLabel>
                  <NumberInput size="sm" value={overallMin} onChange={(v) => setOverallMin(v)}>
                    <NumberInputField placeholder="≥" />
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel m={0} fontSize="xs">Max</FormLabel>
                  <NumberInput size="sm" value={overallMax} onChange={(v) => setOverallMax(v)}>
                    <NumberInputField placeholder="≤" />
                  </NumberInput>
                </FormControl>
              </HStack>
            </Box>

            {/* Nutrient values */}
            <Box p={3} borderWidth="1px" borderRadius="md">
              <Text fontWeight="semibold" mb={2}>Nutrient values (mg/kg)</Text>
              <VStack align="stretch" spacing={2}>
                <HStack>
                  <FormControl>
                    <FormLabel m={0} fontSize="xs">Vit A ≥</FormLabel>
                    <NumberInput size="sm" value={vitAMin} onChange={(v) => setVitAMin(v)}>
                      <NumberInputField placeholder="e.g. 7" />
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel m={0} fontSize="xs">≤</FormLabel>
                    <NumberInput size="sm" value={vitAMax} onChange={(v) => setVitAMax(v)}>
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                </HStack>
                <HStack>
                  <FormControl>
                    <FormLabel m={0} fontSize="xs">Vit B3 ≥</FormLabel>
                    <NumberInput size="sm" value={vitB3Min} onChange={(v) => setVitB3Min(v)}>
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel m={0} fontSize="xs">≤</FormLabel>
                    <NumberInput size="sm" value={vitB3Max} onChange={(v) => setVitB3Max(v)}>
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                </HStack>
                <HStack>
                  <FormControl>
                    <FormLabel m={0} fontSize="xs">Iron ≥</FormLabel>
                    <NumberInput size="sm" value={ironMin} onChange={(v) => setIronMin(v)}>
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel m={0} fontSize="xs">≤</FormLabel>
                    <NumberInput size="sm" value={ironMax} onChange={(v) => setIronMax(v)}>
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                </HStack>
              </VStack>
            </Box>

            {/* Compliance minimums */}
            <Box p={3} borderWidth="1px" borderRadius="md">
              <Text fontWeight="semibold" mb={2}>% Compliance minimums</Text>
              <VStack align="stretch" spacing={2}>
                <FormControl>
                  <FormLabel m={0} fontSize="xs">%Comp A ≥</FormLabel>
                  <NumberInput size="sm" value={compVitAMin} onChange={(v) => setCompVitAMin(v)}>
                    <NumberInputField placeholder="%" />
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel m={0} fontSize="xs">%Comp B3 ≥</FormLabel>
                  <NumberInput size="sm" value={compVitB3Min} onChange={(v) => setCompVitB3Min(v)}>
                    <NumberInputField placeholder="%" />
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel m={0} fontSize="xs">%Comp Fe ≥</FormLabel>
                  <NumberInput size="sm" value={compIronMin} onChange={(v) => setCompIronMin(v)}>
                    <NumberInputField placeholder="%" />
                  </NumberInput>
                </FormControl>
              </VStack>
            </Box>

            {/* Scores */}
            <Box p={3} borderWidth="1px" borderRadius="md">
              <Text fontWeight="semibold" mb={2}>Scores (0–30)</Text>
              <VStack align="stretch" spacing={2}>
                <HStack>
                  <FormControl>
                    <FormLabel m={0} fontSize="xs">Score1 ≥</FormLabel>
                    <NumberInput size="sm" value={score1Min} onChange={(v) => setScore1Min(v)}>
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel m={0} fontSize="xs">≤</FormLabel>
                    <NumberInput size="sm" value={score1Max} onChange={(v) => setScore1Max(v)}>
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                </HStack>
                <HStack>
                  <FormControl>
                    <FormLabel m={0} fontSize="xs">Score2 ≥</FormLabel>
                    <NumberInput size="sm" value={score2Min} onChange={(v) => setScore2Min(v)}>
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel m={0} fontSize="xs">≤</FormLabel>
                    <NumberInput size="sm" value={score2Max} onChange={(v) => setScore2Max(v)}>
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                </HStack>
                <HStack>
                  <FormControl>
                    <FormLabel m={0} fontSize="xs">Score3 ≥</FormLabel>
                    <NumberInput size="sm" value={score3Min} onChange={(v) => setScore3Min(v)}>
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel m={0} fontSize="xs">≤</FormLabel>
                    <NumberInput size="sm" value={score3Max} onChange={(v) => setScore3Max(v)}>
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                </HStack>
              </VStack>
            </Box>

            {/* Maize-only extras */}
            <Box p={3} borderWidth="1px" borderRadius="md">
              <Text fontWeight="semibold" mb={2}>Maize extras</Text>
              <VStack align="stretch" spacing={2}>
                <HStack>
                  <FormControl>
                    <FormLabel m={0} fontSize="xs">Aflatoxin ≥</FormLabel>
                    <NumberInput size="sm" value={aflatoxinMin} onChange={(v) => setAflatoxinMin(v)}>
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel m={0} fontSize="xs">≤</FormLabel>
                    <NumberInput size="sm" value={aflatoxinMax} onChange={(v) => setAflatoxinMax(v)}>
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                </HStack>
                <HStack>
                  <FormControl>
                    <FormLabel m={0} fontSize="xs">% of Max ≥</FormLabel>
                    <NumberInput size="sm" value={maxPercentMin} onChange={(v) => setMaxPercentMin(v)}>
                      <NumberInputField placeholder="e.g. 80" />
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel m={0} fontSize="xs">≤</FormLabel>
                    <NumberInput size="sm" value={maxPercentMax} onChange={(v) => setMaxPercentMax(v)}>
                      <NumberInputField placeholder="e.g. 120" />
                    </NumberInput>
                  </FormControl>
                </HStack>
                <HStack>
                  <FormControl>
                    <FormLabel m={0} fontSize="xs">KMFI Aflat ≥</FormLabel>
                    <NumberInput size="sm" value={kmfiAflatoxinMin} onChange={(v) => setKmfiAflatoxinMin(v)}>
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel m={0} fontSize="xs">≤</FormLabel>
                    <NumberInput size="sm" value={kmfiAflatoxinMax} onChange={(v) => setKmfiAflatoxinMax(v)}>
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                </HStack>
                <HStack>
                  <FormControl>
                    <FormLabel m={0} fontSize="xs">Weighted ≥</FormLabel>
                    <NumberInput size="sm" value={weightedMin} onChange={(v) => setWeightedMin(v)}>
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel m={0} fontSize="xs">≤</FormLabel>
                    <NumberInput size="sm" value={weightedMax} onChange={(v) => setWeightedMax(v)}>
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                </HStack>
              </VStack>
            </Box>
          </SimpleGrid>
        </Collapse>
      </Box>

      <Tabs index={tabIndex} onChange={setTabIndex}>
        <TabList>
          <Tab>Wheat Flour</Tab>
          <Tab>Maize Flour</Tab>
          <Tab>Edible Oil</Tab>
          <Tab>Summary Results</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <WheatTable rows={wheatSorted} sortConfig={sortConfig} requestSort={requestSort} />
          </TabPanel>
          <TabPanel>
            <MaizeTable rows={maizeSorted} sortConfig={sortConfig} requestSort={requestSort} />
          </TabPanel>
          <TabPanel>
            <OilTable rows={oilSorted} sortConfig={sortConfig} requestSort={requestSort} />
          </TabPanel>
          <TabPanel>
            <Table variant="striped" colorScheme="blue" size="sm">
              <Thead>
                <Tr>
                  <Th onClick={() => requestSort('company')} cursor="pointer" userSelect="none">
                    <Box display="inline-flex" alignItems="center" gap={1}>
                      Company {sortConfig.key === 'company' ? (sortConfig.direction === 'asc' ? <TriangleUpIcon /> : <TriangleDownIcon />) : null}
                    </Box>
                  </Th>
                  <Th onClick={() => requestSort('category')} cursor="pointer" userSelect="none">
                    <Box display="inline-flex" alignItems="center" gap={1}>
                      Category {sortConfig.key === 'category' ? (sortConfig.direction === 'asc' ? <TriangleUpIcon /> : <TriangleDownIcon />) : null}
                    </Box>
                  </Th>
                  <Th onClick={() => requestSort('brand')} cursor="pointer" userSelect="none">
                    <Box display="inline-flex" alignItems="center" gap={1}>
                      Brand {sortConfig.key === 'brand' ? (sortConfig.direction === 'asc' ? <TriangleUpIcon /> : <TriangleDownIcon />) : null}
                    </Box>
                  </Th>
                  <Th onClick={() => requestSort('size')} cursor="pointer" userSelect="none">
                    <Tooltip label="Company size (explicit if provided; otherwise derived from S/M/L values)" hasArrow>
                      <Box display="inline-flex" alignItems="center" gap={1}>
                        Size {sortConfig.key === 'size' ? (sortConfig.direction === 'asc' ? <TriangleUpIcon /> : <TriangleDownIcon />) : null}
                      </Box>
                    </Tooltip>
                  </Th>
                  <Th onClick={() => requestSort('type')} cursor="pointer" userSelect="none">
                    <Box display="inline-flex" alignItems="center" gap={1}>
                      Type {sortConfig.key === 'type' ? (sortConfig.direction === 'asc' ? <TriangleUpIcon /> : <TriangleDownIcon />) : null}
                    </Box>
                  </Th>
                  <Th onClick={() => requestSort('overall')} cursor="pointer" userSelect="none">
                    <Box display="inline-flex" alignItems="center" gap={1}>
                      Overall MFI Fortification Result (Average) {sortConfig.key === 'overall' ? (sortConfig.direction === 'asc' ? <TriangleUpIcon /> : <TriangleDownIcon />) : null}
                    </Box>
                  </Th>
                  <Th onClick={() => requestSort('band')} cursor="pointer" userSelect="none">
                    <Box display="inline-flex" alignItems="center" gap={1}>
                      Band {sortConfig.key === 'band' ? (sortConfig.direction === 'asc' ? <TriangleUpIcon /> : <TriangleDownIcon />) : null}
                    </Box>
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {summarySorted.map((row, idx) => (
                  <Tr key={idx} bg={/maize/i.test(row.type) ? 'green.50' : /wheat/i.test(row.type) ? 'yellow.50' : 'orange.50'}>
                    <Td maxW="240px" position="sticky" left={0} bg="white" zIndex={1}>
                      <Tooltip label={row.company} hasArrow>
                        <Box as="span" display="inline-block" maxW="240px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                          {row.company}
                        </Box>
                      </Tooltip>
                    </Td>
                    <Td>{row.category}</Td>
                    <Td>{row.brand}</Td>
                    <Td>{row.size}</Td>
                    <Td>{row.type}</Td>
                    <Td color={overallColor(row.overall)} fontWeight="bold">{fmt2(row.overall)}</Td>
                    <Td>
                      {(() => {
                        const pct = getPercentForBand(row);
                        const label = getBandLabel(pct);
                        const cs = getBandColorScheme(label);
                        return <Badge colorScheme={cs}>{label}</Badge>;
                      })()}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};


ProductTesting.propTypes = {
  cycle: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  ])
};

export default ProductTesting;
