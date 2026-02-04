import React, {useState, useMemo, useEffect} from 'react';
import {request} from 'common';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Select,
  HStack,
  Input,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  Tooltip,
  Spinner,
  Center,
  Button,
  Text,
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
  Switch,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * Summary Component
 * Displays a summary table for MFI scoring with rankings.
 *
 * @param {Object} props
 * @param {Object} props.cycle
 * @returns {JSX.Element}
 */
const Summary = ({cycle}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await request(true).get('/index-ranking-list', {
          params: {
            'page-size': 100,
            'cycle-id': cycle?.id,
          },
        });
        setData(res.data.results);
      } catch (err) {
        console.error('Failed to fetch index rankings', err);
      } finally {
        setLoading(false);
      }
    };

    cycle && fetchData();
  }, [cycle]);

  const [filters, setFilters] = useState({sector: '', satType: '', companyNames: [], companyQuery: '', companySize: '', hideUnvalidated: false});

  const [sortConfig, setSortConfig] = useState({key: 'variance', direction: 'desc'});
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const {isOpen, onOpen, onClose} = useDisclosure();

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filteredData = useMemo(() => data.filter((item) => {
    const sectorLabel = item.productType?.name || item.sector || '';
    const satTypeLabel = item.tier || item.satType || '';
    const sectorOk = filters.sector === '' || sectorLabel === filters.sector;
    const satTypeOk = filters.satType === '' || satTypeLabel === filters.satType;
    const selected = filters.companyNames || [];
    const query = (filters.companyQuery || '').toLowerCase();
    const name = (item.company_name || '').toLowerCase();
    const companyOk =
      (selected.length === 0 || selected.includes(item.company_name)) &&
      (query === '' || name.includes(query));
    const sizeCategory = item.size_category || '';
    const m = sizeCategory === 'MEDIUM' ? 'M' : sizeCategory === 'SMALL' ? 'S' : sizeCategory === 'LARGE' ? 'L' : sizeCategory;
    const companySizeOk =
      filters.companySize === '' ||
      filters.companySize === m ||
      filters.companySize === sizeCategory;
    const validatedOk = !filters.hideUnvalidated || (item.ivc && item.ivc !== 0);
    return sectorOk && satTypeOk && companyOk && companySizeOk && validatedOk;
  }), [data, filters]);
  const allCompanies = useMemo(() => {
    const rows = data.filter((item) => {
      const sectorLabel = item.productType?.name || item.sector || '';
      const satTypeLabel = item.tier || item.satType || '';
      const sectorOk = filters.sector === '' || sectorLabel === filters.sector;
      const satTypeOk = filters.satType === '' || satTypeLabel === filters.satType;
      const sizeCategory = item.size_category || '';
      const m = sizeCategory === 'MEDIUM' ? 'M' : sizeCategory === 'SMALL' ? 'S' : sizeCategory === 'LARGE' ? 'L' : sizeCategory;
      const companySizeOk =
        filters.companySize === '' ||
        filters.companySize === m ||
        filters.companySize === sizeCategory;
      return sectorOk && satTypeOk && companySizeOk;
    });
    const set = new Set(rows.map((r) => r.company_name).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [data, filters.sector, filters.satType, filters.companySize]);

  const derivedData = useMemo(() => {
    const rows = filteredData.map((item) => {
      const ivc = Number(item.ivc) || 0; // Weighted SAT (50%)
      // PT (varies by vehicle)
      const getPTScore = (it) => {
        const ft = it?.productTests?.[0]?.fortification;
        if (!ft) return 0;
        const vehicle = (it?.productType?.name || it?.sector || '').toLowerCase();
        const value = vehicle === 'maize flour' ? ft?.overallKMFIWeightedScore : ft?.score;
        return Number(value) || 0;
      };
      const pt = getPTScore(item);
      const ieg = Number(item.ieg) || 0; // IEG (20%)
      const finalScore = ivc + pt + ieg; // FINAL (100%)
      const sectorLabel = item.productType?.name || item.sector || '';
      return {
        ...item,
        ivc,
        pt,
        ieg,
        finalScore,
        sectorLabel,
      };
    });

    const byFinal = [...rows].sort((a, b) => b.finalScore - a.finalScore);
    byFinal.forEach((row, idx) => {
      row.rank = idx + 1;
    });
    return byFinal;
  }, [filteredData]);

  const metrics = useMemo(() => {
    const rows = derivedData;
    const sum = (key) => rows.reduce((s, r) => s + (Number(r[key]) || 0), 0);
    const avg = (key) => (rows.length ? sum(key) / rows.length : 0);

    const avgIVC = avg('ivc');
    const avgPT = avg('pt');
    const avgIEG = avg('ieg');
    const avgFinal = avg('finalScore');

    const topBrandRow = rows.length
      ? rows.reduce((best, r) => (r.finalScore > best.finalScore ? r : best), rows[0])
      : null;

    const sectorAgg = rows.reduce((acc, r) => {
      const key = r.sectorLabel || '—';
      if (!acc[key]) acc[key] = {sum: 0, count: 0};
      acc[key].sum += r.finalScore;
      acc[key].count += 1;
      return acc;
    }, {});

    let topSector = '—';
    let topSectorAvg = 0;
    Object.entries(sectorAgg).forEach(([k, v]) => {
      const a = v.sum / v.count;
      if (v.count > 0 && (a > topSectorAvg)) {
        topSectorAvg = a;
        topSector = k;
      }
    });

    const totalCompanies = new Set(rows.map((r) => r.company_name)).size;
    const totalBrands = new Set(rows.map((r) => r.name)).size;
    const totalTier1 = rows.filter((r) => r.tier === 'TIER_1').length;
    const totalTier3 = rows.filter((r) => r.tier === 'TIER_3').length;

    return {
      topBrand: topBrandRow ? topBrandRow.name : '—',
      topBrandScore: topBrandRow ? topBrandRow.finalScore : 0,
      topSector,
      topSectorAvg,
      avgIVC,
      avgPT,
      avgIEG,
      avgFinal,
      avgMFI: avgFinal,
      count: rows.length,
      totalCompanies,
      totalBrands,
      totalTier1,
      totalTier3,
    };
  }, [derivedData]);

  const fmt = (num) => (typeof num === 'number' ? num.toFixed(2) : '—');

  const isIncomplete = (val) => {
    if (val === null || val === undefined) return true;
    if (typeof val === 'string') {
      const v = val.trim();
      if (v === '' || v.toUpperCase() === 'N/A') return true;
      const n = Number(v);
      if (!Number.isNaN(n) && n === 0) return true;
      return false;
    }
    if (typeof val === 'number') return val === 0;
    return false;
  };

  const CellWithBadge = ({value, children, reason}) => (
    <HStack spacing={2} align="center">
      {children}
      {isIncomplete(value) && (
        <Tooltip label={reason || 'Incomplete (null, N/A, or 0)'}>
          <Badge colorScheme="orange" variant="subtle">!</Badge>
        </Tooltip>
      )}
    </HStack>
  );

  CellWithBadge.propTypes = {
    value: PropTypes.any,
    children: PropTypes.node,
    reason: PropTypes.string,
  };

  const sortedData = useMemo(() => {
    const keyMap = {
      brand: 'name',
      company: 'company_name',
      sector: 'sectorLabel',
      satType: 'tier',
      satScore: 'ivc',
      ptScore: 'pt',
      iegScore: 'ieg',
      finalScore: 'finalScore',
      rank: 'rank',
      variance: 'variance',
    };
    const key = keyMap[sortConfig.key] || sortConfig.key;
    const isAsc = sortConfig.direction === 'asc';

    const sorted = [...derivedData].sort((a, b) => {
      const valA = a[key];
      const valB = b[key];
      const aU = valA === undefined || valA === null;
      const bU = valB === undefined || valB === null;
      if (aU && bU) return 0;
      if (aU) return isAsc ? -1 : 1;
      if (bU) return isAsc ? 1 : -1;
      if (typeof valA === 'number' && typeof valB === 'number') {
        return isAsc ? valA - valB : valB - valA;
      }
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return isAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });

    return sorted;
  }, [derivedData, sortConfig]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortedData, pageSize]);

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(sortedData.length / pageSize)),
    [sortedData.length, pageSize]
  );

  useEffect(() => {
    setCurrentPage((p) => Math.min(Math.max(1, p), pageCount));
  }, [pageCount]);

  const paginatedData = useMemo(() => {
    const safePage = Math.min(Math.max(1, currentPage), pageCount);
    const start = (safePage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, pageCount]);

  const handleExport = () => {
    const headers = [
      'Brand',
      'Company Name',
      'Sector',
      'SAT Type',
      'Weighted SAT Score',
      'Weighted PT Score',
      'Weighted IEG Score',
      'Final MFI Score',
      'Ranking'
    ];
    const rows = sortedData.map((item) => [
      item.name,
      item.company_name,
      item.productType?.name || '—',
      item.tier || '—',
      item.ivc.toFixed(2),
      item.pt.toFixed(2),
      item.ieg.toFixed(2),
      item.finalScore.toFixed(2),
      item.rank
    ]);
    const csvContent = [headers, ...rows].map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'mfi_index_rankings.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    loading ? (
      <Center py={10}><Spinner size="lg" /></Center>
    ) : (
      <Box p={4}>
        <HStack justify="space-between" mb={4}>
          <Heading size="md">Program Summary Dashboard</Heading>
          <Button colorScheme="blue" onClick={handleExport}>Export</Button>
        </HStack>

        <SimpleGrid columns={{base: 1, md: 2, lg: 3, xl: 5}} spacing={4} mb={4}>
          <Stat p={4} borderWidth="1px" borderRadius="md">
            <StatLabel>Top Performing Brand</StatLabel>
            <StatNumber fontSize="lg">{metrics.topBrand || '—'}</StatNumber>
            <StatHelpText>Final Score: {fmt(metrics.topBrandScore)}</StatHelpText>
          </Stat>
          <Stat p={4} borderWidth="1px" borderRadius="md">
            <StatLabel>Top Performing Sector</StatLabel>
            <StatNumber fontSize="lg">{metrics.topSector || '—'}</StatNumber>
            <StatHelpText>Avg Final: {fmt(metrics.topSectorAvg)}</StatHelpText>
          </Stat>
          <Stat p={4} borderWidth="1px" borderRadius="md">
            <StatLabel>Average SAT (50%)</StatLabel>
            <StatNumber fontSize="lg">{fmt(metrics.avgIVC)}</StatNumber>
          </Stat>
          <Stat p={4} borderWidth="1px" borderRadius="md">
            <StatLabel>Average PT (30%)</StatLabel>
            <StatNumber fontSize="lg">{fmt(metrics.avgPT)}</StatNumber>
          </Stat>
          <Stat p={4} borderWidth="1px" borderRadius="md">
            <StatLabel>Average IEG (20%)</StatLabel>
            <StatNumber fontSize="lg">{fmt(metrics.avgIEG)}</StatNumber>
          </Stat>
          <Stat p={4} borderWidth="1px" borderRadius="md">
            <StatLabel>Average MFI Score</StatLabel>
            <StatNumber fontSize="lg">{fmt(metrics.avgMFI)}</StatNumber>
          </Stat>
          <Stat p={4} borderWidth="1px" borderRadius="md">
            <StatLabel>Total Companies</StatLabel>
            <StatNumber fontSize="lg">{metrics.totalCompanies}</StatNumber>
          </Stat>
          <Stat p={4} borderWidth="1px" borderRadius="md">
            <StatLabel>Total Brands</StatLabel>
            <StatNumber fontSize="lg">{metrics.totalBrands}</StatNumber>
          </Stat>
          <Stat p={4} borderWidth="1px" borderRadius="md">
            <StatLabel>Total Tier 1</StatLabel>
            <StatNumber fontSize="lg">{metrics.totalTier1}</StatNumber>
          </Stat>
          <Stat p={4} borderWidth="1px" borderRadius="md">
            <StatLabel>Total Tier 3</StatLabel>
            <StatNumber fontSize="lg">{metrics.totalTier3}</StatNumber>
          </Stat>
        </SimpleGrid>

        <HStack align="start" spacing={4} mb={4}>
          <Popover placement="bottom-start" isOpen={isOpen} onClose={onClose}>
            <PopoverTrigger>
              <Button variant="outline" onClick={isOpen ? onClose : onOpen}>
                Companies{filters.companyNames?.length ? ` (${filters.companyNames.length})` : ''}
              </Button>
            </PopoverTrigger>
            <PopoverContent w="320px">
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverHeader>Select Companies</PopoverHeader>
              <PopoverBody>
                <VStack align="stretch" spacing={3}>
                  <Input
                    placeholder="Search companies"
                    value={filters.companyQuery}
                    onChange={(e) => setFilters((prev) => ({...prev, companyQuery: e.target.value}))}
                  />
                  <Divider />
                  <HStack spacing={2} justify="space-between">
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => {
                        const visible = allCompanies.filter((c) =>
                          c.toLowerCase().includes((filters.companyQuery || '').toLowerCase())
                        );
                        setFilters((prev) => ({
                          ...prev,
                          companyNames: Array.from(new Set([...(prev.companyNames || []), ...visible])),
                        }));
                      }}
                    >
                      Select all
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => setFilters((prev) => ({...prev, companyNames: []}))}
                    >
                      Clear selected
                    </Button>
                  </HStack>
                  <Box maxH="220px" overflowY="auto" borderWidth="1px" borderRadius="md" p={2}>
                    <CheckboxGroup
                      value={filters.companyNames}
                      onChange={(vals) => setFilters((prev) => ({...prev, companyNames: vals}))}
                    >
                      <VStack align="stretch" spacing={2}>
                        {allCompanies
                          .filter((c) => c.toLowerCase().includes((filters.companyQuery || '').toLowerCase()))
                          .map((c) => (
                            <Checkbox key={c} value={c}>
                              {c.length > 24 ? c.slice(0, 24) + '…' : c}
                            </Checkbox>
                          ))}
                      </VStack>
                    </CheckboxGroup>
                  </Box>
                </VStack>
              </PopoverBody>
              <PopoverFooter display="flex" justifyContent="space-between">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setFilters((prev) => ({...prev, companyNames: [], companyQuery: ''}))
                  }
                >
                  Clear
                </Button>
                <Button size="sm" colorScheme="blue" onClick={onClose}>
                  Done
                </Button>
              </PopoverFooter>
            </PopoverContent>
          </Popover>
          <Select
            placeholder="Filter by Food Vehicle"
            value={filters.sector}
            onChange={(e) => setFilters((prev) => ({...prev, sector: e.target.value}))}
            width="200px"
          >
            <option value="Edible Oil">Edible Oil</option>
            <option value="Wheat Flour">Wheat Flour</option>
            <option value="Maize Flour">Maize Flour</option>
          </Select>

          <Select
            placeholder="Filter by SAT Type"
            value={filters.satType}
            onChange={(e) => setFilters((prev) => ({...prev, satType: e.target.value}))}
            width="200px"
          >
            <option value="TIER_1">TIER_1</option>
            <option value="TIER_3">TIER_3</option>
          </Select>
          <Select
            placeholder="Filter by Company Size"
            value={filters.companySize}
            onChange={(e) => setFilters((prev) => ({...prev, companySize: e.target.value}))}
            width="200px"
          >
            <option value="M">Medium</option>
            <option value="S">Small</option>
            <option value="L">Large</option>
          </Select>
          <HStack spacing={2} align="center">
            <Switch
              isChecked={filters.hideUnvalidated}
              onChange={(e) => setFilters((prev) => ({...prev, hideUnvalidated: e.target.checked}))}
            />
            <Text>Hide unvalidated SAT</Text>
          </HStack>
        </HStack>

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th onClick={() => handleSort('brand')} cursor="pointer">
                Brands{sortConfig.key === 'brand' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''}
              </Th>
              <Th onClick={() => handleSort('company')} cursor="pointer">
                Company Name{sortConfig.key === 'company' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''}
              </Th>
              <Th>Size</Th>
              <Th onClick={() => handleSort('sector')} cursor="pointer">
                Sector{sortConfig.key === 'sector' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''}
              </Th>
              <Th onClick={() => handleSort('satType')} cursor="pointer">
                SAT Type{sortConfig.key === 'satType' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''}
              </Th>
              <Th>Validated</Th>
              <Th onClick={() => handleSort('satScore')} cursor="pointer">
                Weighted SAT Scores (50%){sortConfig.key === 'satScore' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''}
              </Th>
              <Th onClick={() => handleSort('ptScore')} cursor="pointer">
                Weighted Product Testing Scores (30%){sortConfig.key === 'ptScore' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''}
              </Th>
              <Th onClick={() => handleSort('iegScore')} cursor="pointer">
                Weighted IEG Scores (20%){sortConfig.key === 'iegScore' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''}
              </Th>
              <Th onClick={() => handleSort('finalScore')} cursor="pointer">
                FINAL MFI Score (100%){sortConfig.key === 'finalScore' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''}
              </Th>
              <Th onClick={() => handleSort('rank')} cursor="pointer">
                Ranking{sortConfig.key === 'rank' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''}
              </Th>

            </Tr>
          </Thead>
          <Tbody>
            {paginatedData.map((item, index) => (
              <Tr key={index}>
                <Td maxW="240px">
                  <Tooltip label={item.name} hasArrow>
                    <Box as="span" display="inline-block" maxW="240px" isTruncated>
                      {item.name && item.name.length > 12 ? item.name.slice(0, 12) + '…' : item.name}
                    </Box>
                  </Tooltip>
                </Td>
                <Td maxW="260px">
                  <Tooltip label={item.company_name} hasArrow>
                    <Box as="span" display="inline-block" maxW="260px" isTruncated>
                      {item.company_name && item.company_name.length > 12 ? item.company_name.slice(0, 12) + '…' : item.company_name}
                    </Box>
                  </Tooltip>
                </Td>
                <Td>
                  {item.size_category
                    ? item.size_category === 'MEDIUM'
                      ? 'M'
                      : item.size_category === 'SMALL'
                        ? 'S'
                        : item.size_category === 'LARGE'
                          ? 'L'
                          : item.size_category
                    : '—'}
                </Td>
                <Td maxW="220px">
                  <Tooltip label={item.productType?.name || '—'} hasArrow>
                    <CellWithBadge value={item.productType?.name} reason="Missing sector">
                      <Box as="span" display="inline-block" maxW="220px" isTruncated>
                        {item.productType?.name || '—'}
                      </Box>
                    </CellWithBadge>
                  </Tooltip>
                </Td>
                <Td>
                  <CellWithBadge value={item.tier} reason="Missing SAT type">
                    <span>{item.tier === 'TIER_3' ? 'T3' : item.tier === 'TIER_1' ? 'T1' : (item.tier || '—')}</span>
                  </CellWithBadge>
                </Td>
                <Td>{item.ivc && item.ivc !== 0 ? 'Yes' : 'No'}</Td>
                <Td>
                  <CellWithBadge value={item.ivc} reason="SAT score is 0 or missing">
                    <span>{typeof item.ivc === 'number' ? item.ivc.toFixed(2) : item.ivc}</span>
                  </CellWithBadge>
                </Td>
                <Td>
                  <CellWithBadge value={typeof item.pt === 'number' ? item.pt : 'N/A'} reason="PT score is N/A or 0">
                    <span>{typeof item.pt === 'number' ? item.pt.toFixed(2) : 'N/A'}</span>
                  </CellWithBadge>
                </Td>
                <Td>
                  <CellWithBadge value={item.ieg} reason="IEG score is 0 or missing">
                    <span>{typeof item.ieg === 'number' ? item.ieg.toFixed(2) : item.ieg}</span>
                  </CellWithBadge>
                </Td>
                <Td>
                  <CellWithBadge value={item.finalScore} reason="Final score is 0">
                    <span>{item.finalScore.toFixed(2)}</span>
                  </CellWithBadge>
                </Td>
                <Td>{item.rank}</Td>


              </Tr>
            ))}
          </Tbody>
        </Table>
        <HStack justify="space-between" align="center" mt={4}>
          <HStack>
            <Text>Rows per page:</Text>
            <Select
              width="90px"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </Select>
          </HStack>
          <HStack>
            <Text>
              Page {currentPage} of {pageCount}
            </Text>
            <Button
              type="button"
              size="sm"
              onClick={() => setCurrentPage(1)}
              isDisabled={currentPage <= 1}
            >
              First
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              isDisabled={currentPage <= 1}
            >
              Previous
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
              isDisabled={currentPage >= pageCount}
            >
              Next
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setCurrentPage(pageCount)}
              isDisabled={currentPage >= pageCount}
            >
              Last
            </Button>
          </HStack>
        </HStack>
      </Box>
    )
  );
};

Summary.propTypes = {
  cycle: PropTypes.object.isRequired,
};

export default Summary;
