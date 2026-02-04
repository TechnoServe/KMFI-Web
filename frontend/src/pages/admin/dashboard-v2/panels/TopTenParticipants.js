
import PropTypes from 'prop-types';
import React, {useState, useMemo, useEffect, useCallback} from 'react';
// Removed sort icons — Top 10 is fixed to descending by final score
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Text,
  Button,
  Tooltip,
  Spinner,
  Alert,
  AlertIcon,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  Checkbox,
  CheckboxGroup,
  Stack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Collapse,
  useDisclosure,
  HStack,
  Portal,
  useColorModeValue,
  Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerCloseButton, DrawerBody,
} from '@chakra-ui/react';
import {request} from 'common';

/**
 * All KMFI Participants – Overall Scores
 * Mirrors the UX pattern used in FullyFortifiedProducts: live fetch by `cycle`, filters, key stats, pagination, export.
 */
const TopTenParticipants = ({cycle}) => {
  // ----- state -----
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // filters
  const [productTypeFilter, setProductTypeFilter] = useState(''); // Wheat / Maize / Edible Oil
  const [categoryFilter, setCategoryFilter] = useState(''); // Large / Medium / Small
  const [companyFilters, setCompanyFilters] = useState([]); // multi-select of companies
  const [companySearch, setCompanySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');

  // sorting & pagination (fixed order: highest Final KMFI first)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // key stats UI
  const [showMoreStats, setShowMoreStats] = useState(false);

  // company popover disclosure (for Done to close)
  const {isOpen: isCompanyOpen, onOpen: onCompanyOpen, onClose: onCompanyClose, onToggle: onCompanyToggle} = useDisclosure();

  // bottom drawers for Top 3 per product type
  const {isOpen: isTopWOpen, onOpen: onTopWOpen, onClose: onTopWClose} = useDisclosure();
  const {isOpen: isTopMOpen, onOpen: onTopMOpen, onClose: onTopMClose} = useDisclosure();
  const {isOpen: isTopOOpen, onOpen: onTopOOpen, onClose: onTopOClose} = useDisclosure();

  // ----- fetch -----
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
      .get('/index-ranking-list', {
        params: {
          'page-size': 200,
          'cycle-id': cycleId,
        },
      })
      .then((res) => {
        const list = Array.isArray(res?.data?.results) ? res.data.results : [];
        const mapped = list.map((item) => {
          const company = item.company_name || '—';
          const categoryRaw = item.size_category || '';
          // Normalize size to labels used in filters (large/medium/small)
          const category = categoryRaw === 'LARGE' ? 'Large' : categoryRaw === 'MEDIUM' ? 'Medium' : categoryRaw === 'SMALL' ? 'Small' : (categoryRaw || '—');
          const brand = item.name || '—';
          const product = item.productType?.name || item.sector || '—';
          const satType = item.tier || '—';

          const ivc = Number(item.ivc) || 0; // Weighted SAT
          // PT: use weighted KMFI score for Maize Flour, otherwise standard score
          let pt = 0;
          const ft = item?.productTests?.[0]?.fortification;
          if (ft) {
            const vehicle = (item?.productType?.name || item?.sector || '').toLowerCase();
            const value = /maize/.test(vehicle) ? ft?.overallKMFIWeightedScore : ft?.score;
            pt = Number(value) || 0;
          } else {
            pt = Number(item?.pt) || 0;
          }
          const ieg = Number(item.ieg) || 0; // IEG
          const finalScore = ivc + pt + ieg; // 0..100

          return {company, category, brand, product, score: finalScore, satType};
        });

        // Dedupe by (company + brand + product) keeping highest finalScore
        const bestMap = new Map();
        mapped.forEach((r) => {
          const key = `${r.company}|${r.brand}|${r.product}`;
          const prev = bestMap.get(key);
          if (!prev || (r.score > prev.score)) bestMap.set(key, r);
        });
        setRows(Array.from(bestMap.values()));
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message || 'Error loading data');
        setLoading(false);
      });
  }, [cycle]);

  // ----- build global ranking first, then apply filters -----
  const sortedAll = useMemo(() => {
    return [...rows].sort((a, b) => b.score - a.score);
  }, [rows]);

  const rankedAll = useMemo(() => {
    let currentRank = 0;
    let lastScore = null;
    return sortedAll.map((row) => {
      if (row.score !== lastScore) {
        currentRank += 1; // dense ranking across ALL rows
        lastScore = row.score;
      }
      return {...row, rank: currentRank};
    });
  }, [sortedAll]);

  // Top 3 by product type (global ranking basis)
  const top3Wheat = useMemo(() => {
    return rankedAll.filter((r) => /wheat/i.test(r.product || '')).slice(0, 3);
  }, [rankedAll]);
  const top3Maize = useMemo(() => {
    return rankedAll.filter((r) => /maize/i.test(r.product || '')).slice(0, 3);
  }, [rankedAll]);
  const top3Oil = useMemo(() => {
    return rankedAll.filter((r) => /oil/i.test(r.product || '') || /edible/i.test(r.product || '')).slice(0, 3);
  }, [rankedAll]);


  // ----- options & filters (based on full ranked set) -----
  const companyOptions = useMemo(() => {
    // de-dupe by lowercased trimmed key, keep first-seen original label for display
    const map = new Map();
    rankedAll.forEach((r) => {
      const raw = r && r.company != null ? String(r.company) : '';
      const label = raw.trim();
      if (!label) return;
      const key = label.toLowerCase();
      if (!map.has(key)) map.set(key, label);
    });
    const arr = Array.from(map.values());
    try {
      return arr.sort((a, b) => a.localeCompare(b));
    } catch (e) {
      return arr.sort();
    }
  }, [rankedAll]);

  const filteredCompanyOptions = useMemo(() => {
    const q = (companySearch || '').trim().toLowerCase();
    if (!q) return companyOptions;
    return companyOptions.filter((c) => String(c).toLowerCase().includes(q));
  }, [companyOptions, companySearch]);

  const filtered = useMemo(() => {
    // Apply filters within the full ranked set
    return rankedAll.filter((r) => {
      const typeOk = !productTypeFilter ||
        (productTypeFilter === 'wheat' && /wheat/i.test(r.product)) ||
        (productTypeFilter === 'maize' && /maize/i.test(r.product)) ||
        (productTypeFilter === 'oil' && (/oil/i.test(r.product) || /edible/i.test(r.product)));
      const categoryOk = !categoryFilter || categoryFilter.toLowerCase() === (r.category || '').toLowerCase();
      const companyOk =
        companyFilters.length === 0 ||
        companyFilters.some(
          (c) => (c || '').toLowerCase().trim() === (r.company || '').toLowerCase().trim()
        );
      const brandOk = !brandSearch || (r.brand || '').toLowerCase().includes(brandSearch.toLowerCase());
      return typeOk && categoryOk && companyOk && brandOk;
    });
  }, [rankedAll, productTypeFilter, categoryFilter, companyFilters, brandSearch]);

  // ----- the Top 10 is already ranked in `rankedAll`; keep ranks from there -----
  const ranked = useMemo(() => {
    // Merge the filtered subset back with their existing ranks
    const mapByKey = new Map(rankedAll.map((r) => [`${r.company}|${r.brand}|${r.product}|${r.score}`, r]));
    return filtered.map((f) => {
      const key = `${f.company}|${f.brand}|${f.product}|${f.score}`;
      const src = mapByKey.get(key);
      return {...f, rank: src ? src.rank : null};
    });
  }, [filtered, rankedAll]);

  // ----- show all filtered rows -----
  const paged = ranked;
  const totalPages = 1;

  // ----- key stats (from what is shown: all filtered rows) -----
  const keyStats = useMemo(() => {
    const rowsView = paged; // stats should reflect exactly what's visible in the table
    const n = rowsView.length;
    const uniq = (arr) => Array.from(new Set(arr));

    const companies = uniq(rowsView.map((r) => (r.company || '').trim()).filter(Boolean));
    const brands = uniq(rowsView.map((r) => `${(r.brand || '').trim()}||${(r.product || '').trim()}`).filter(Boolean));

    const sum = rowsView.reduce((s, r) => s + (typeof r.score === 'number' ? r.score : 0), 0);
    const avg = n ? Math.round((sum / n) * 100) / 100 : 0; // 2dp

    const isWheat = (r) => /wheat\s*flour/i.test(r.product || '');
    const isMaize = (r) => /maize\s*flour/i.test(r.product || '');
    const isOil = (r) => /oil/i.test(r.product || '') || /edible/i.test(r.product || '');

    const wheatRows = rowsView.filter(isWheat);
    const maizeRows = rowsView.filter(isMaize);
    const oilRows = rowsView.filter(isOil);

    const avgOf = (arr) => {
      if (!arr.length) return 0;
      const s = arr.reduce((t, r) => t + (typeof r.score === 'number' ? r.score : 0), 0);
      return Math.round((s / arr.length) * 100) / 100; // 2dp
    };

    // Company sizes (unique companies by size category) and averages by size
    const sizeKey = (v) => (v || '').toString().trim().toLowerCase();
    const companyToSize = new Map();
    rowsView.forEach((r) => {
      const comp = (r.company || '').trim();
      if (!comp) return;
      if (!companyToSize.has(comp)) companyToSize.set(comp, sizeKey(r.category));
    });
    const sizeCounts = {large: 0, medium: 0, small: 0, other: 0};
    companyToSize.forEach((sz) => {
      if (sz === 'large') sizeCounts.large += 1;
      else if (sz === 'medium') sizeCounts.medium += 1;
      else if (sz === 'small') sizeCounts.small += 1;
      else sizeCounts.other += 1;
    });
    const rowsBySize = {
      large: rowsView.filter((r) => sizeKey(r.category) === 'large'),
      medium: rowsView.filter((r) => sizeKey(r.category) === 'medium'),
      small: rowsView.filter((r) => sizeKey(r.category) === 'small'),
      other: rowsView.filter((r) => !['large', 'medium', 'small'].includes(sizeKey(r.category))),
    };
    const avgLarge = avgOf(rowsBySize.large);
    const avgMedium = avgOf(rowsBySize.medium);
    const avgSmall = avgOf(rowsBySize.small);
    const avgOther = avgOf(rowsBySize.other);
    const oilCount = oilRows.length;
    const oilAvg = avgOf(oilRows);

    return {
      totalRows: n,
      uniqueCompanies: companies.length,
      uniqueBrands: brands.length,
      avgScore: avg,
      wheatCount: wheatRows.length,
      maizeCount: maizeRows.length,
      oilCount,
      wheatAvg: avgOf(wheatRows),
      maizeAvg: avgOf(maizeRows),
      oilAvg,
      topCount: n,
      sizeCounts,
      avgLarge,
      avgMedium,
      avgSmall,
      avgOther,
    };
  }, [paged]);

  // ----- export CSV -----
  const handleExport = useCallback(() => {
    // Export exactly what is shown in the table (all filtered rows)
    const headers = ['Company', 'Category', 'Brand', 'Product', 'Final KMFI Score (100%)', 'Rank'];
    const rowsCsv = paged.map((r) => [
      r.company ?? '',
      r.category ?? '',
      r.brand ?? '',
      r.product ?? '',
      typeof r.score === 'number' ? r.score.toFixed(2) : '',
      r.rank ?? ''
    ]);

    const csv = [headers, ...rowsCsv]
      .map((cols) => cols.map((v) => {
        const s = String(v ?? '');
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
    a.download = `shown_kmfi_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [paged]);

  // ----- UI -----
  const infoBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  return (
    <Box>
      <Box mb={3} p={3} borderWidth="1px" borderColor={borderColor} borderRadius="md" bg={infoBg}>
        <Text fontSize="sm" mb={2}>
          <b>Overview.</b> This view lists <b>all companies</b> and their <b>Final KMFI Score (100%)</b>, ranked from highest to lowest. Final KMFI combines weighted components including SAT, Product Testing (PT), and IEG.
        </Text>
        <Text fontSize="sm" mb={1}>
          • <b>Filters</b>: Narrow by <b>Product Type</b> (Wheat Flour, Maize Flour, Edible Oil), <b>Company Size</b>, specific <b>Companies</b>, and <b>Brand</b> search.
        </Text>
        <Text fontSize="sm">
          • <b>Export Shown</b> downloads exactly what you see in the table, including the global <b>Rank</b> among all participants.
        </Text>
      </Box>

      {error && (
        <Alert status="error" mb={4}><AlertIcon />{error}</Alert>
      )}
      {loading && (
        <Box mb={4}><Spinner /> Loading...</Box>
      )}

      {/* Primary key stats (one row) */}
      <Box mb={2}>
        <SimpleGrid columns={{base: 2, md: 6, lg: 6}} spacing={3}>
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
            <StatLabel>Wheat Rows</StatLabel>
            <StatHelpText>Avg: {keyStats.wheatAvg}%</StatHelpText>
            <StatNumber>{keyStats.wheatCount}</StatNumber>
          </Stat>
          <Stat p={3} borderWidth="1px" borderRadius="md">
            <StatLabel>Maize Rows</StatLabel>
            <StatHelpText>Avg: {keyStats.maizeAvg}%</StatHelpText>
            <StatNumber>{keyStats.maizeCount}</StatNumber>
          </Stat>
          <Stat p={3} borderWidth="1px" borderRadius="md">
            <StatLabel>Edible Oil Rows</StatLabel>
            <StatHelpText>Avg: {keyStats.oilAvg}%</StatHelpText>
            <StatNumber>{keyStats.oilCount}</StatNumber>
          </Stat>
        </SimpleGrid>
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button size="sm" variant="ghost" onClick={() => setShowMoreStats((v) => !v)}>
            {showMoreStats ? 'Show less' : 'Show more'}
          </Button>
        </Box>
      </Box>

      {/* Additional key stats */}
      <Collapse in={showMoreStats} animateOpacity>
        <SimpleGrid columns={{base: 2, md: 5, lg: 5}} spacing={3} mb={4}>
          <Stat p={3} borderWidth="1px" borderRadius="md">
            <StatLabel>Unique Brands</StatLabel>
            <StatNumber>{keyStats.uniqueBrands}</StatNumber>
          </Stat>
          <Stat p={3} borderWidth="1px" borderRadius="md">
            <StatLabel>Rows Shown</StatLabel>
            <StatNumber>{keyStats.topCount}</StatNumber>
          </Stat>
          <Stat p={3} borderWidth="1px" borderRadius="md">
            <StatLabel>Companies by Size</StatLabel>
            <StatHelpText>
              L:{keyStats.sizeCounts.large} • M:{keyStats.sizeCounts.medium} • S:{keyStats.sizeCounts.small} • O:{keyStats.sizeCounts.other}
            </StatHelpText>
          </Stat>
          <Stat p={3} borderWidth="1px" borderRadius="md">
            <StatLabel>Avg by Size (L/M/S)</StatLabel>
            <StatHelpText>
              {keyStats.avgLarge.toFixed(2)}% / {keyStats.avgMedium.toFixed(2)}% / {keyStats.avgSmall.toFixed(2)}%
            </StatHelpText>
          </Stat>
        </SimpleGrid>
      </Collapse>

      {/* filters */}
      <HStack spacing={2} align="start" mb={3} flexWrap="wrap">
        <Select placeholder="Filter by Product Type" maxW="200px" value={productTypeFilter} onChange={(e) => setProductTypeFilter(e.target.value)} size='sm'>
          <option value="wheat">Wheat Flour</option>
          <option value="maize">Maize Flour</option>
          <option value="oil">Edible Oil</option>
        </Select>
        <Select placeholder="Filter by Category" maxW="200px" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} size='sm'>
          <option value="large">Large</option>
          <option value="medium">Medium</option>
          <option value="small">Small</option>
        </Select>

        {/* Company multi-select with search */}
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
                <Input placeholder="Search companies..." size="sm" mb={3} value={companySearch} onChange={(e) => setCompanySearch(e.target.value)} />
                <CheckboxGroup colorScheme="blue" value={companyFilters} onChange={(vals) => setCompanyFilters(vals)}>
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

        <Input placeholder="Search by Brand" size="sm" maxW="220px" value={brandSearch} onChange={(e) => setBrandSearch(e.target.value)} />

        <Button onClick={handleExport} size="sm" variant="outline">Export Shown</Button>
      </HStack>

      {/* Top 3 drawers triggers */}
      <HStack spacing={2} align="center" mb={4}>
        <Button size="sm" colorScheme="yellow" onClick={onTopWOpen}>Top 3 Flour Wheat</Button>
        <Button size="sm" colorScheme="green" onClick={onTopMOpen}>Top 3 Flour Maize</Button>
        <Button size="sm" colorScheme="orange" onClick={onTopOOpen}>Top 3 Edible Oil</Button>
      </HStack>

      {/* table */}
      <Table variant="simple" size="md" sx={{tableLayout: 'fixed'}}>
        <Thead>
          <Tr>
            <Th w="28%">
              <Text noOfLines={1}>Company</Text>
            </Th>
            <Th w="12%">Category</Th>
            <Th w="24%">
              <Text noOfLines={1}>Brand</Text>
            </Th>
            <Th w="18%">
              <Text noOfLines={1}>Product</Text>
            </Th>
            <Th w="10%">
              <Tooltip label="Final KMFI Score out of 100%" hasArrow placement="top">
                <Text noOfLines={1}>Final KMFI Score (100%)</Text>
              </Tooltip>
            </Th>
            <Th w="8%">Rank</Th>
          </Tr>
        </Thead>
        <Tbody>
          {(!loading && paged.length === 0) ? (
            <Tr>
              <Td colSpan={6} textAlign="center">No data available</Td>
            </Tr>
          ) : (
            paged.map((item, index) => (
              <Tr key={`${item.company}|${item.brand}|${item.product}|${index}`}>
                <Td>
                  <Tooltip label={item.company} hasArrow placement="top"><Text noOfLines={1}>{item.company}</Text></Tooltip>
                </Td>
                <Td>
                  <Tooltip label={item.category} hasArrow placement="top"><Text noOfLines={1}>{item.category}</Text></Tooltip>
                </Td>
                <Td>
                  <Tooltip label={item.brand} hasArrow placement="top"><Text noOfLines={1}>{item.brand}</Text></Tooltip>
                </Td>
                <Td>
                  <Tooltip label={item.product} hasArrow placement="top"><Text noOfLines={1}>{item.product}</Text></Tooltip>
                </Td>
                <Td>
                  <Tooltip label={`${item.score.toFixed(2)}%`} hasArrow placement="top">
                    <Text noOfLines={1} color={
                      item.score >= 90 ? 'green.500' : item.score >= 80 ? 'yellow.500' : 'red.500'
                    }>
                      {item.score.toFixed(2)}%
                    </Text>
                  </Tooltip>
                </Td>
                <Td color={
                  item.rank == null ? 'gray.500' : (item.rank === 1 ? 'green.500' : item.rank <= 3 ? 'yellow.500' : undefined)
                }>
                  {item.rank ?? '—'}
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>

      {/* Drawers: Top 3 per product type */}
      <Drawer isOpen={isTopWOpen} placement="bottom" onClose={onTopWClose} size="xl">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader display="flex" justifyContent="space-between" alignItems="center">
            <Box>Top 3 – Wheat Flour</Box>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const headers = ['Company', 'Brand', 'Product', 'Final KMFI Score (100%)', 'Global Rank'];
                const data = (top3Wheat || []).map((r) => [
                  r.company ?? '',
                  r.brand ?? '',
                  r.product ?? '',
                  typeof r.score === 'number' ? r.score.toFixed(2) : '',
                  r.rank ?? ''
                ]);
                const csv = [headers, ...data]
                  .map((row) => row.map((v) => {
                    const s = String(v ?? '');
                    return s.includes(',') || s.includes('"') || s.includes('\n') ? '"' + s.replace(/"/g, '""') + '"' : s;
                  }).join(','))
                  .join('\n');
                const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `top3_wheat_${Date.now()}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              }}
            >
              Export
            </Button>
          </DrawerHeader>
          <DrawerBody>
            <Table variant="striped" size="sm">
              <Thead>
                <Tr>
                  <Th>#</Th>
                  <Th>Company</Th>
                  <Th>Brand</Th>
                  <Th>Product</Th>
                  <Th isNumeric>Final KMFI (100%)</Th>
                  <Th isNumeric>Global Rank</Th>
                </Tr>
              </Thead>
              <Tbody>
                {(top3Wheat || []).map((r, i) => (
                  <Tr key={`${r.company}|${r.brand}|${r.product}|${i}`}>
                    <Td>{i + 1}</Td>
                    <Td><Text noOfLines={1}>{r.company}</Text></Td>
                    <Td><Text noOfLines={1}>{r.brand}</Text></Td>
                    <Td><Text noOfLines={1}>{r.product}</Text></Td>
                    <Td isNumeric>{typeof r.score === 'number' ? r.score.toFixed(2) : ''}%</Td>
                    <Td isNumeric>{r.rank}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Drawer isOpen={isTopMOpen} placement="bottom" onClose={onTopMClose} size="xl">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader display="flex" justifyContent="space-between" alignItems="center">
            <Box>Top 3 – Maize Flour</Box>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const headers = ['Company', 'Brand', 'Product', 'Final KMFI Score (100%)', 'Global Rank'];
                const data = (top3Maize || []).map((r) => [
                  r.company ?? '',
                  r.brand ?? '',
                  r.product ?? '',
                  typeof r.score === 'number' ? r.score.toFixed(2) : '',
                  r.rank ?? ''
                ]);
                const csv = [headers, ...data]
                  .map((row) => row.map((v) => {
                    const s = String(v ?? '');
                    return s.includes(',') || s.includes('"') || s.includes('\n') ? '"' + s.replace(/"/g, '""') + '"' : s;
                  }).join(','))
                  .join('\n');
                const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `top3_maize_${Date.now()}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              }}
            >
              Export
            </Button>
          </DrawerHeader>
          <DrawerBody>
            <Table variant="striped" size="sm">
              <Thead>
                <Tr>
                  <Th>#</Th>
                  <Th>Company</Th>
                  <Th>Brand</Th>
                  <Th>Product</Th>
                  <Th isNumeric>Final KMFI (100%)</Th>
                  <Th isNumeric>Global Rank</Th>
                </Tr>
              </Thead>
              <Tbody>
                {(top3Maize || []).map((r, i) => (
                  <Tr key={`${r.company}|${r.brand}|${r.product}|${i}`}>
                    <Td>{i + 1}</Td>
                    <Td><Text noOfLines={1}>{r.company}</Text></Td>
                    <Td><Text noOfLines={1}>{r.brand}</Text></Td>
                    <Td><Text noOfLines={1}>{r.product}</Text></Td>
                    <Td isNumeric>{typeof r.score === 'number' ? r.score.toFixed(2) : ''}%</Td>
                    <Td isNumeric>{r.rank}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Drawer isOpen={isTopOOpen} placement="bottom" onClose={onTopOClose} size="xl">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader display="flex" justifyContent="space-between" alignItems="center">
            <Box>Top 3 – Edible Oil</Box>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const headers = ['Company', 'Brand', 'Product', 'Final KMFI Score (100%)', 'Global Rank'];
                const data = (top3Oil || []).map((r) => [
                  r.company ?? '',
                  r.brand ?? '',
                  r.product ?? '',
                  typeof r.score === 'number' ? r.score.toFixed(2) : '',
                  r.rank ?? ''
                ]);
                const csv = [headers, ...data]
                  .map((row) => row.map((v) => {
                    const s = String(v ?? '');
                    return s.includes(',') || s.includes('"') || s.includes('\n') ? '"' + s.replace(/"/g, '""') + '"' : s;
                  }).join(','))
                  .join('\n');
                const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `top3_oil_${Date.now()}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              }}
            >
              Export
            </Button>
          </DrawerHeader>
          <DrawerBody>
            <Table variant="striped" size="sm">
              <Thead>
                <Tr>
                  <Th>#</Th>
                  <Th>Company</Th>
                  <Th>Brand</Th>
                  <Th>Product</Th>
                  <Th isNumeric>Final KMFI (100%)</Th>
                  <Th isNumeric>Global Rank</Th>
                </Tr>
              </Thead>
              <Tbody>
                {(top3Oil || []).map((r, i) => (
                  <Tr key={`${r.company}|${r.brand}|${r.product}|${i}`}>
                    <Td>{i + 1}</Td>
                    <Td><Text noOfLines={1}>{r.company}</Text></Td>
                    <Td><Text noOfLines={1}>{r.brand}</Text></Td>
                    <Td><Text noOfLines={1}>{r.product}</Text></Td>
                    <Td isNumeric>{typeof r.score === 'number' ? r.score.toFixed(2) : ''}%</Td>
                    <Td isNumeric>{r.rank}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* No pagination: showing all filtered rows */}
    </Box>
  );
};

TopTenParticipants.propTypes = {
  cycle: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
};

export default TopTenParticipants;
