import PropTypes from 'prop-types';
import React, {useState, useMemo, useEffect, useCallback} from 'react';
import {ChevronDownIcon, ChevronUpIcon} from '@chakra-ui/icons';
import {
  Box,
  Text,
  Select,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  Checkbox,
  CheckboxGroup,
  Stack,
  Input,
  // --- Added Stat components and SimpleGrid for key stats ---
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tooltip,
  Collapse,
  HStack,
  Portal,
  useColorModeValue
} from '@chakra-ui/react';
import {request} from 'common';

const FullyFortifiedProducts = ({cycle}) => {
  const [sortOrder, setSortOrder] = useState('desc');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [productTypeFilter, setProductTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [companyFilters, setCompanyFilters] = useState([]); // array of selected company names
  const [companySearch, setCompanySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const {isOpen, onOpen, onClose} = useDisclosure();
  const {isOpen: isCompanyOpen, onOpen: onCompanyOpen, onClose: onCompanyClose, onToggle: onCompanyToggle} = useDisclosure();

  const [pageMain, setPageMain] = useState(1);
  const [pageSizeMain, setPageSizeMain] = useState(10);
  const [pageCompanies, setPageCompanies] = useState(1);
  const [pageSizeCompanies, setPageSizeCompanies] = useState(10);
  const [showMoreStats, setShowMoreStats] = useState(false);

  // Map API payload into table-ready rows
  const normalizeItemToRow = (item) => {
    const typeName = item.product_type_name || item.productTypeName || item.type || '';
    const isWheat = /wheat\s*flour/i.test(typeName);
    const isMaize = /maize\s*flour/i.test(typeName);

    // Decide score per spec: Wheat -> fortification.score; Maize -> fortification.overallKMFIWeightedScore
    let rawScore = null;
    if (isWheat) rawScore = item?.fortification?.score;
    else if (isMaize) rawScore = item?.fortification?.overallKMFIWeightedScore;

    // Fallbacks if type not matched or fields missing
    if (rawScore == null) {
      rawScore = item?.fortification?.overallKMFIWeightedScore ?? item?.fortification?.score ?? item?.overall_mfi_average;
    }

    // Coerce to 0-30 integer when present
    const score = typeof rawScore === 'number' && !Number.isNaN(rawScore)
      ? Math.round(rawScore)
      : 0;

    return {
      company: item.company_name || item.company || '—',
      category: item.company_size || item.companySize || '—',
      brand: item.brand_name || item.brand || '—',
      type: typeName || '—',
      score,
    };
  };

  useEffect(() => {
    setLoading(true);
    setError(null);

    const cycleId = typeof cycle === 'string' ? cycle : cycle?.id;
    if (!cycleId) {
      setError('No cycle provided.');
      setLoading(false);
      return;
    }

    request(true)
      .get(`/admin/all-product-tests?cycle-id=${encodeURIComponent(cycleId)}`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const rows = data.map(normalizeItemToRow);
        setRows(rows);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message || 'Error loading data');
        setLoading(false);
      });
  }, [cycle]);

  const companyOptions = useMemo(() => {
    const names = rows.map((r) => (r && r.company != null ? String(r.company) : '')).filter(Boolean);
    const set = new Set(names);
    const arr = Array.from(set);
    try {
      return arr.sort((a, b) => a.localeCompare(b));
    } catch (e) {
      return arr.sort();
    }
  }, [rows]);

  const filteredCompanyOptions = useMemo(() => {
    const q = (companySearch || '').trim().toLowerCase();
    if (!q) return companyOptions;
    return companyOptions.filter((c) => String(c).toLowerCase().includes(q));
  }, [companyOptions, companySearch]);

  const filteredData = useMemo(() => {
    return rows.filter((r) => {
      const typeOk = !productTypeFilter ||
        (productTypeFilter === 'wheat' && /wheat/i.test(r.type)) ||
        (productTypeFilter === 'maize' && /maize/i.test(r.type)) ||
        (productTypeFilter === 'other' && !/wheat|maize/i.test(r.type));
      const categoryOk = !categoryFilter || categoryFilter.toLowerCase() === (r.category || '').toLowerCase();
      const companyOk = companyFilters.length === 0 || companyFilters.includes(r.company);
      const brandOk = !brandSearch || (r.brand || '').toLowerCase().includes(brandSearch.toLowerCase());
      return typeOk && categoryOk && companyOk && brandOk;
    });
  }, [rows, productTypeFilter, categoryFilter, companyFilters, brandSearch]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) =>
      sortOrder === 'desc' ? b.score - a.score : a.score - b.score
    );
  }, [filteredData, sortOrder]);

  // --- Key stats for filtered data
  const keyStats = useMemo(() => {
    const rowsView = filteredData;
    const n = rowsView.length;
    const uniq = (arr) => Array.from(new Set(arr));

    const companies = uniq(rowsView.map((r) => r.company).filter(Boolean));
    const brands = uniq(rowsView.map((r) => `${r.brand}||${r.type}`).filter(Boolean));

    const sum = rowsView.reduce((s, r) => s + (typeof r.score === 'number' ? r.score : 0), 0);
    const avg = n ? Math.round((sum / n) * 10) / 10 : 0;

    const isWheat = (r) => /wheat\s*flour/i.test(r.type || '');
    const isMaize = (r) => /maize\s*flour/i.test(r.type || '');

    const wheatRows = rowsView.filter(isWheat);
    const maizeRows = rowsView.filter(isMaize);

    const avgOf = (arr) => {
      if (!arr.length) return 0;
      const s = arr.reduce((t, r) => t + (typeof r.score === 'number' ? r.score : 0), 0);
      return Math.round((s / arr.length) * 10) / 10;
    };

    const fully = rowsView.filter((r) => (typeof r.score === 'number') && r.score >= 30);

    // Company-level compliance summary (reusing logic similar to companyCompliance)
    const byCompany = new Map();
    rowsView.forEach((r) => {
      const comp = r.company || '—';
      const brandKey = `${r.brand || '—'}|${r.type || '—'}`;
      let e = byCompany.get(comp);
      if (!e) {
        e = {total: 0, compliant: 0, brands: new Set()}; byCompany.set(comp, e);
      }
      if (!e.brands.has(brandKey)) {
        e.brands.add(brandKey);
        e.total += 1;
        if (typeof r.score === 'number' && r.score >= 30) e.compliant += 1;
      }
    });
    const companiesWithAnyCompliant = Array.from(byCompany.values()).filter((e) => e.compliant > 0).length;

    // --- Company size breakdown (unique companies per size) ---
    const sizeKey = (c) => (c || '').toString().trim().toLowerCase();
    const companyToSize = new Map();
    rowsView.forEach((r) => {
      if (!r.company) return;
      if (!companyToSize.has(r.company)) companyToSize.set(r.company, sizeKey(r.category));
    });
    const sizeCounts = {large: 0, medium: 0, small: 0, other: 0};
    companyToSize.forEach((sz) => {
      if (sz === 'large') sizeCounts.large += 1;
      else if (sz === 'medium') sizeCounts.medium += 1;
      else if (sz === 'small') sizeCounts.small += 1;
      else sizeCounts.other += 1;
    });

    // Averages by company size (row-level averages over filtered view)
    const rowsBySize = {
      large: rowsView.filter((r) => sizeKey(r.category) === 'large'),
      medium: rowsView.filter((r) => sizeKey(r.category) === 'medium'),
      small: rowsView.filter((r) => sizeKey(r.category) === 'small'),
      other: rowsView.filter((r) => !['large', 'medium', 'small'].includes(sizeKey(r.category))),
    };
    const avgSize = (arr) => arr.length ? Math.round((arr.reduce((t, r) => t + (typeof r.score === 'number' ? r.score : 0), 0) / arr.length) * 10) / 10 : 0;

    // Fully compliant counts by product type
    const fullyWheat = fully.filter(isWheat).length;
    const fullyMaize = fully.filter(isMaize).length;

    // Score range
    const scores = rowsView.map((r) => typeof r.score === 'number' ? r.score : 0);
    const maxScore = scores.length ? Math.max(...scores) : 0;
    const minScore = scores.length ? Math.min(...scores) : 0;

    return {
      totalRows: n,
      uniqueCompanies: companies.length,
      uniqueBrands: brands.length,
      avgScore: avg,
      fullyCount: fully.length,
      fullyPct: n ? Math.round((fully.length / n) * 100) : 0,
      wheatCount: wheatRows.length,
      maizeCount: maizeRows.length,
      wheatAvg: avgOf(wheatRows),
      maizeAvg: avgOf(maizeRows),
      companiesWithCompliant: companiesWithAnyCompliant,
      // New stats
      sizeCounts,
      avgLarge: avgSize(rowsBySize.large),
      avgMedium: avgSize(rowsBySize.medium),
      avgSmall: avgSize(rowsBySize.small),
      avgOther: avgSize(rowsBySize.other),
      fullyWheat,
      fullyMaize,
      maxScore,
      minScore,
    };
  }, [filteredData]);

  useEffect(() => {
    setPageMain(1);
  }, [productTypeFilter, categoryFilter, companyFilters, sortOrder, brandSearch]);

  const companyCompliance = useMemo(() => {
    // Aggregate by company, counting unique brands (brand + type)
    const byCompany = new Map();

    rows.forEach((r) => {
      const company = r.company || '—';
      const brandKey = `${r.brand || '—'}|${r.type || '—'}`; // ensure uniqueness across product types
      let entry = byCompany.get(company);
      if (!entry) {
        entry = {company, total: 0, compliant: 0, brands: new Set()};
        byCompany.set(company, entry);
      }
      if (!entry.brands.has(brandKey)) {
        entry.brands.add(brandKey);
        entry.total += 1;
        if (typeof r.score === 'number' && r.score >= 30) {
          entry.compliant += 1; // fully fortified == 30%
        }
      }
    });

    const list = Array.from(byCompany.values()).map((e) => ({
      company: e.company,
      compliant: e.compliant,
      total: e.total,
      percent: e.total ? Math.round((e.compliant / e.total) * 100) : 0,
    }));

    // Sort by percent desc, then compliant desc, then company asc
    list.sort((a, b) => (b.percent - a.percent) || (b.compliant - a.compliant) || a.company.localeCompare(b.company));

    const summary = {
      totalCompanies: list.length,
      companiesWithCompliant: list.filter((x) => x.compliant > 0).length,
      totalBrands: list.reduce((s, x) => s + x.total, 0),
      totalCompliant: list.reduce((s, x) => s + x.compliant, 0),
    };

    return {list, summary};
  }, [rows]);

  const compliantCompanyList = useMemo(() => {
    return companyCompliance.list.filter((x) => x.percent > 0);
  }, [companyCompliance]);

  // Company drawer key stats (for Drawer grid above table)
  const companyDrawerStats = useMemo(() => {
    const list = compliantCompanyList;
    const totalCompanies = list.length;
    const totalCompliantBrands = list.reduce((s, x) => s + (x.compliant || 0), 0);
    const totalBrandsAssessed = list.reduce((s, x) => s + (x.total || 0), 0);
    const avgPercent = totalCompanies ? Math.round((list.reduce((s, x) => s + (x.percent || 0), 0) / totalCompanies) * 10) / 10 : 0;
    const maxPercent = totalCompanies ? Math.max(...list.map((x) => x.percent || 0)) : 0;
    const minPercent = totalCompanies ? Math.min(...list.map((x) => x.percent || 0)) : 0;
    return {totalCompanies, totalCompliantBrands, totalBrandsAssessed, avgPercent, maxPercent, minPercent};
  }, [compliantCompanyList]);

  useEffect(() => {
    setPageCompanies(1);
  }, [compliantCompanyList]);

  const {
    paged: pagedMain,
    totalPages: totalPagesMain,
  } = useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSizeMain));
    const safePage = Math.min(Math.max(1, pageMain), totalPages);
    const start = (safePage - 1) * pageSizeMain;
    const end = start + pageSizeMain;
    return {
      paged: sortedData.slice(start, end),
      totalPages,
    };
  }, [sortedData, pageMain, pageSizeMain]);

  const {
    paged: pagedCompanies,
    totalPages: totalPagesCompanies,
  } = useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(compliantCompanyList.length / pageSizeCompanies));
    const safePage = Math.min(Math.max(1, pageCompanies), totalPages);
    const start = (safePage - 1) * pageSizeCompanies;
    const end = start + pageSizeCompanies;
    return {
      paged: compliantCompanyList.slice(start, end),
      totalPages,
    };
  }, [compliantCompanyList, pageCompanies, pageSizeCompanies]);

  // CSV export for main table (current sorted/filtered rows)
  const handleExportMain = useCallback(() => {
    const headers = ['Ranking', 'Company', 'Category', 'Brand', 'Type', 'Score'];
    const rowsCsv = sortedData.map((r, i) => [
      i + 1,
      r.company ?? '',
      r.category ?? '',
      r.brand ?? '',
      r.type ?? '',
      typeof r.score === 'number' ? r.score : ''
    ]);

    const csv = [headers, ...rowsCsv]
      .map((cols) => cols.map((v) => {
        const s = String(v ?? '');
        // escape quotes and wrap if needed
        if (s.includes(',') || s.includes('"') || s.includes('\n')) {
          return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
      }).join(','))
      .join('\n');

    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fully_fortified_products_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [sortedData]);

  // CSV export for companies table in drawer
  const handleExportCompanies = useCallback(() => {
    const headers = ['Ranking', 'Company', 'Compliant Brands', 'Total Brands Assessed', '% Compliant'];
    const rowsCsv = compliantCompanyList.map((r, i) => [
      i + 1,
      r.company ?? '',
      typeof r.compliant === 'number' ? r.compliant : '',
      typeof r.total === 'number' ? r.total : '',
      typeof r.percent === 'number' ? r.percent : ''
    ]);

    const csv = [headers, ...rowsCsv]
      .map((cols) => cols.map((v) => {
        const s = String(v ?? '');
        if (s.includes(',') || s.includes('"') || s.includes('\n')) {
          return '"' + s.replace(/\"/g, '""') + '"';
        }
        return s;
      }).join(','))
      .join('\n');

    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `companies_fully_fortified_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [compliantCompanyList]);

  // Info box colors for light/dark mode
  const infoBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box>
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      {loading && (
        <Box mb={4}>
          <Spinner /> Loading...
        </Box>
      )}

      {/* Award / Section Description */}
      <Box mb={3} p={3} borderWidth="1px" borderColor={borderColor} borderRadius="md" bg={infoBg}>
        <Text fontSize="sm" mb={2}>
          <b>Fully Fortified Products.</b> This view lists brands and product types that meet the KMFI definition of full fortification, using the <b>Overall MFI Fortification Result (Average)</b>.
        </Text>
        <Text fontSize="sm" mb={1}>
          • <b>Scoring</b>: For <b>Wheat Flour</b>, the table uses the Fortification <b>Score</b>. For <b>Maize Flour</b>, it uses the <b>Overall KMFI Weighted Score</b>.
        </Text>
        <Text fontSize="sm" mb={1}>
          • <b>Fully fortified</b> rows are those with a score of <b>30%</b>.
        </Text>
        <Text fontSize="sm">
          • Use the filters (Product Type, Category, Company, Brand) to refine the view. &quot;Export&quot; downloads the currently shown rows.
        </Text>
      </Box>

      {/* Primary key stats (single row) */}
      <Box mb={2}>
        <SimpleGrid columns={{base: 2, md: 5, lg: 5}} spacing={3}>
          <Stat p={3} borderWidth="1px" borderRadius="md">
            <StatLabel>Total Rows (Filtered)</StatLabel>
            <StatNumber>{keyStats.totalRows}</StatNumber>
          </Stat>
          <Stat p={3} borderWidth="1px" borderRadius="md">
            <StatLabel>Unique Companies</StatLabel>
            <StatNumber>{keyStats.uniqueCompanies}</StatNumber>
          </Stat>
          <Stat p={3} borderWidth="1px" borderRadius="md">
            <StatLabel>Avg Score</StatLabel>
            <StatNumber>{keyStats.avgScore}%</StatNumber>
          </Stat>
          <Stat p={3} borderWidth="1px" borderRadius="md">
            <StatLabel>Fully Fortified</StatLabel>
            <StatNumber>{keyStats.fullyCount}</StatNumber>
            <StatHelpText>{keyStats.fullyPct}% of rows</StatHelpText>
          </Stat>
          <Stat p={3} borderWidth="1px" borderRadius="md">
            <StatLabel>Companies w/ Compliant</StatLabel>
            <StatNumber>{keyStats.companiesWithCompliant}</StatNumber>
          </Stat>
        </SimpleGrid>
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button size="sm" variant="ghost" onClick={() => setShowMoreStats((v) => !v)}>
            {showMoreStats ? 'Show less' : 'Show more'}
          </Button>
        </Box>
      </Box>

      {/* Additional key stats (collapsible) */}
      <Collapse in={showMoreStats} animateOpacity>
        <SimpleGrid columns={{base: 2, md: 5, lg: 5}} spacing={3} mb={4}>
          <Stat p={3} borderWidth="1px" borderRadius="md">
            <StatLabel>Unique Brands</StatLabel>
            <StatNumber>{keyStats.uniqueBrands}</StatNumber>
          </Stat>
          <Stat p={3} borderWidth="1px" borderRadius="md">
            <StatLabel>Wheat Rows</StatLabel>
            <StatNumber>{keyStats.wheatCount}</StatNumber>
            <StatHelpText>Avg: {keyStats.wheatAvg}%</StatHelpText>
          </Stat>
          <Stat p={3} borderWidth="1px" borderRadius="md">
            <StatLabel>Maize Rows</StatLabel>
            <StatNumber>{keyStats.maizeCount}</StatNumber>
            <StatHelpText>Avg: {keyStats.maizeAvg}%</StatHelpText>
          </Stat>
          <Stat p={3} borderWidth="1px" borderRadius="md">
            <StatLabel>Companies by Size</StatLabel>
            <StatHelpText>L:{keyStats.sizeCounts.large} • M:{keyStats.sizeCounts.medium} • S:{keyStats.sizeCounts.small} • O:{keyStats.sizeCounts.other}</StatHelpText>
          </Stat>
          <Stat p={3} borderWidth="1px" borderRadius="md">
            <StatLabel>Avg by Size (L/M/S)</StatLabel>
            <StatHelpText>{keyStats.avgLarge}% / {keyStats.avgMedium}% / {keyStats.avgSmall}%</StatHelpText>
          </Stat>
          <Stat p={3} borderWidth="1px" borderRadius="md">
            <StatLabel>Fully Fortified (Wheat)</StatLabel>
            <StatNumber>{keyStats.fullyWheat}</StatNumber>
          </Stat>
          <Stat p={3} borderWidth="1px" borderRadius="md">
            <StatLabel>Fully Fortified (Maize)</StatLabel>
            <StatNumber>{keyStats.fullyMaize}</StatNumber>
          </Stat>
          <Stat p={3} borderWidth="1px" borderRadius="md">
            <StatLabel>Score Range</StatLabel>
            <StatHelpText>{keyStats.minScore}% – {keyStats.maxScore}%</StatHelpText>
          </Stat>
        </SimpleGrid>
      </Collapse>
      <HStack spacing={2} align="start" mb={3}>
        <Select placeholder="Filter by Product Type" maxW="200px" value={productTypeFilter} onChange={(e) => setProductTypeFilter(e.target.value)} size='sm'>
          <option value="wheat">Wheat Flour</option>
          <option value="maize">Maize Flour</option>
          <option value="other">Other</option>
        </Select>
        <Select placeholder="Filter by Category" maxW="200px" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} size='sm'>
          <option value="large">Large</option>
          <option value="medium">Medium</option>
          <option value="small">Small</option>
        </Select>
        <Popover placement="bottom-start" closeOnBlur={false} isOpen={isCompanyOpen} onClose={onCompanyClose} onOpen={onCompanyOpen} isLazy={false}>
          <PopoverTrigger>
            <Button size="sm" variant="outline" maxW="280px" overflow="hidden" textOverflow="ellipsis" onClick={onCompanyToggle}>
              {companyFilters.length === 0 ? 'Filter by Company' : `${companyFilters.length} selected`}
            </Button>
          </PopoverTrigger>
          <Portal>
            <PopoverContent w="320px" zIndex={1500}>
              <PopoverHeader fontWeight="semibold">Select Companies</PopoverHeader>
              <PopoverBody>
                <Input
                  placeholder="Search companies..."
                  size="sm"
                  mb={3}
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                />
                <CheckboxGroup
                  colorScheme="blue"
                  value={companyFilters}
                  onChange={(vals) => setCompanyFilters(vals)}
                >
                  <Stack spacing={2} maxH="220px" overflowY="auto">
                    {filteredCompanyOptions.length === 0 ? (
                      <Text fontSize="sm" opacity={0.7}>No matches</Text>
                    ) : (
                      filteredCompanyOptions.map((c) => (
                        <Checkbox key={c} value={c}>{c}</Checkbox>
                      ))
                    )}
                  </Stack>
                </CheckboxGroup>
              </PopoverBody>
              <PopoverFooter display="flex" justifyContent="space-between">
                <Button size="sm" variant="ghost" onClick={() => setCompanyFilters(companyOptions)}>Select All</Button>
                <Box>
                  <Button size="sm" mr={2} onClick={() => setCompanyFilters([])}>Clear</Button>
                  <Button size="sm" onClick={onCompanyClose}>Done</Button>
                </Box>
              </PopoverFooter>
            </PopoverContent>
          </Portal>
        </Popover>
        <Input
          placeholder="Search by Brand"
          size="sm"
          maxW="220px"
          value={brandSearch}
          onChange={(e) => setBrandSearch(e.target.value)}
        />
        <Button onClick={onOpen} size="sm" colorScheme='teal'>Fully Fortified Products</Button>
        <Button onClick={handleExportMain} size="sm" variant="outline">Export</Button>
      </HStack>


      <Table variant="simple" size="md" sx={{tableLayout: 'fixed'}}>
        <Thead>
          <Tr>
            <Th w="86px">Rank</Th>
            <Th w="24%">Company</Th>
            <Th w="14%">Category</Th>
            <Th w="26%">Brand</Th>
            <Th w="14%">Type</Th>
            <Th
              cursor="pointer"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            >
              <Tooltip label="Overall MFI Fortification Result (Average)" hasArrow placement="top">
                <Text noOfLines={1}>(Average){sortOrder === 'desc' ? <ChevronDownIcon ml={1} /> : <ChevronUpIcon ml={1} />}</Text>
              </Tooltip>
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {!loading && pagedMain.length === 0 ? (
            <Tr>
              <Td colSpan={6} textAlign="center">No data available</Td>
            </Tr>
          ) : (
            pagedMain.map((row, index) => (
              <Tr key={index}>
                <Td>{(pageMain - 1) * pageSizeMain + index + 1}</Td>
                <Td>
                  <Tooltip label={row.company} hasArrow placement="top">
                    <Text noOfLines={1}>{row.company}</Text>
                  </Tooltip>
                </Td>
                <Td>
                  <Tooltip label={row.category} hasArrow placement="top">
                    <Text noOfLines={1}>{row.category}</Text>
                  </Tooltip>
                </Td>
                <Td>
                  <Tooltip label={row.brand} hasArrow placement="top">
                    <Text noOfLines={1}>{row.brand}</Text>
                  </Tooltip>
                </Td>
                <Td>
                  <Tooltip label={row.type} hasArrow placement="top">
                    <Text noOfLines={1}>{row.type}</Text>
                  </Tooltip>
                </Td>
                <Td>
                  <Tooltip label={`${row.score}%`} hasArrow placement="top">
                    <Text noOfLines={1} color={
                      row.score >= 27 ? 'green.500' :
                        row.score >= 24 ? 'yellow.500' :
                          'red.500'
                    }>
                      {row.score}%
                    </Text>
                  </Tooltip>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
      <Box display="flex" alignItems="center" justifyContent="space-between" mt={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Text fontSize="sm" minW={40}>Rows per page:</Text>
          <Select size="sm" maxW="80px" value={pageSizeMain} onChange={(e) => setPageSizeMain(Number(e.target.value))}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </Select>
        </Box>
        <Box display="flex" alignItems="center" gap={3}>
          <Text fontSize="sm">Page {pageMain} of {totalPagesMain}</Text>
          <Button size="sm" onClick={() => setPageMain((p) => Math.max(1, p - 1))} isDisabled={pageMain <= 1}>Prev</Button>
          <Button size="sm" onClick={() => setPageMain((p) => Math.min(totalPagesMain, p + 1))} isDisabled={pageMain >= totalPagesMain}>Next</Button>
        </Box>
      </Box>

      <Drawer isOpen={isOpen} placement="bottom" onClose={onClose} size="lg">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Companies with Fully Fortified Products</DrawerHeader>
          <DrawerBody>
            <SimpleGrid columns={{base: 2, md: 3, lg: 6}} spacing={3} mb={4}>
              <Stat p={3} borderWidth="1px" borderRadius="md">
                <StatLabel>Companies (Shown)</StatLabel>
                <StatNumber>{companyDrawerStats.totalCompanies}</StatNumber>
              </Stat>
              <Stat p={3} borderWidth="1px" borderRadius="md">
                <StatLabel>Compliant Brands</StatLabel>
                <StatNumber>{companyDrawerStats.totalCompliantBrands}</StatNumber>
              </Stat>
              <Stat p={3} borderWidth="1px" borderRadius="md">
                <StatLabel>Brands Assessed</StatLabel>
                <StatNumber>{companyDrawerStats.totalBrandsAssessed}</StatNumber>
              </Stat>
              <Stat p={3} borderWidth="1px" borderRadius="md">
                <StatLabel>Avg % Compliant</StatLabel>
                <StatNumber>{companyDrawerStats.avgPercent}%</StatNumber>
              </Stat>
              <Stat p={3} borderWidth="1px" borderRadius="md">
                <StatLabel>Max %</StatLabel>
                <StatNumber>{companyDrawerStats.maxPercent}%</StatNumber>
              </Stat>
              <Stat p={3} borderWidth="1px" borderRadius="md">
                <StatLabel>Min %</StatLabel>
                <StatNumber>{companyDrawerStats.minPercent}%</StatNumber>
              </Stat>
            </SimpleGrid>
            <Table variant="simple" size="md" sx={{tableLayout: 'fixed'}}>
              <Thead>
                <Tr>
                  <Th w="85px">Rank</Th>
                  <Th w="40%">Company</Th>
                  <Th w="18%">Compliant Brands</Th>
                  <Th w="22%">TOTAL BRANDS Assessed</Th>
                  <Th w="14%">% Compliant</Th>
                </Tr>
              </Thead>
              <Tbody>
                {pagedCompanies.length === 0 ? (
                  <Tr>
                    <Td colSpan={5} textAlign="center">No companies to display</Td>
                  </Tr>
                ) : (
                  pagedCompanies.map((row, index) => (
                    <Tr key={row.company + index}>
                      <Td>{(pageCompanies - 1) * pageSizeCompanies + index + 1}</Td>
                      <Td>
                        <Tooltip label={row.company} hasArrow placement="top">
                          <Text noOfLines={1}>{row.company}</Text>
                        </Tooltip>
                      </Td>
                      <Td>
                        <Tooltip label={`${row.compliant}`} hasArrow placement="top">
                          <Text noOfLines={1}>{row.compliant}</Text>
                        </Tooltip>
                      </Td>
                      <Td>
                        <Tooltip label={`${row.total}`} hasArrow placement="top">
                          <Text noOfLines={1}>{row.total}</Text>
                        </Tooltip>
                      </Td>
                      <Td>
                        <Tooltip label={`${row.percent}%`} hasArrow placement="top">
                          <Text noOfLines={1}>{row.percent}%</Text>
                        </Tooltip>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
              <Tfoot>
                <Tr>
                  <Td fontWeight="bold" colSpan={2}>% Total Companies with Compliant Brands</Td>
                  <Td colSpan="3">{companyCompliance.summary.totalCompanies ? Math.round((companyCompliance.summary.companiesWithCompliant / companyCompliance.summary.totalCompanies) * 100) : 0}%</Td>
                </Tr>
                <Tr>
                  <Td fontWeight="bold" colSpan={2}>% Total Compliant Brands of ALL KMFI</Td>
                  <Td colSpan="3">{companyCompliance.summary.totalBrands ? Math.round((companyCompliance.summary.totalCompliant / companyCompliance.summary.totalBrands) * 100) : 0}%</Td>
                </Tr>
              </Tfoot>
            </Table>
            <Box display="flex" alignItems="center" justifyContent="space-between" mt={3}>
              <Box display="flex" alignItems="center" gap={2}>
                <Text fontSize="sm" minW={40}>Rows per page:</Text>
                <Select size="sm" maxW="80px" value={pageSizeCompanies} onChange={(e) => setPageSizeCompanies(Number(e.target.value))}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </Select>
              </Box>
              <Box display="flex" alignItems="center" gap={3}>
                <Text fontSize="sm">Page {pageCompanies} of {totalPagesCompanies}</Text>
                <Button size="sm" onClick={() => setPageCompanies((p) => Math.max(1, p - 1))} isDisabled={pageCompanies <= 1}>Prev</Button>
                <Button size="sm" onClick={() => setPageCompanies((p) => Math.min(totalPagesCompanies, p + 1))} isDisabled={pageCompanies >= totalPagesCompanies}>Next</Button>
              </Box>
            </Box>
          </DrawerBody>
          <DrawerFooter>
            <Button onClick={handleExportCompanies} size="sm" mr={3} variant="outline">Export</Button>
            <Button variant="solid" colorScheme="gray" onClick={onClose}>Close</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};


FullyFortifiedProducts.propTypes = {
  cycle: PropTypes.string.isRequired,
};

export default FullyFortifiedProducts;
