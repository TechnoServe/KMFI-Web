import React, {useState, useMemo, useRef, useEffect} from 'react';
import {Bar, Line} from 'react-chartjs-2';
import {Chart as ChartJS, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
ChartJS.register(BarElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, annotationPlugin);
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
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  Flex,
  HStack,
  Spacer,
  Input,
  NumberInput,
  NumberInputField,
  Checkbox,
  CheckboxGroup,
  Button,
  Divider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  VStack,
  Center,
  Spinner,
  Alert,
  AlertIcon,
  Select,
  Collapse,
  Badge,
  Tooltip as CkTooltip,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
} from '@chakra-ui/react';
import {ChevronDownIcon} from '@chakra-ui/icons';
import PropTypes from 'prop-types';
import {request} from 'common';

const Reports = ({cycle}) => {
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [sortConfig, setSortConfig] = useState({key: null, direction: 'asc'});
  // Chart orientation: 'vertical' or 'horizontal'
  const [chartOrientation, setChartOrientation] = useState('vertical');

  // Drawer view: 'snapshot' | 'trend'
  const [drawerView, setDrawerView] = useState('snapshot');

  // Trend data state
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendError, setTrendError] = useState('');
  const [trendData, setTrendData] = useState(null);

  const fetchTrendForCompany = async (companyId) => {
    if (!companyId) return;
    setTrendLoading(true);
    setTrendError('');
    setTrendData(null);
    try {
      const res = await request(true).get(`/admin/company-reports/trend?companyId=${encodeURIComponent(companyId)}`);
      setTrendData(res?.data ?? null);
    } catch (e) {
      setTrendError(e?.response?.data?.message || e.message || 'Failed to load trend');
    } finally {
      setTrendLoading(false);
    }
  };

  // Flag when |SAT(U) - SAT(V)| >= 10 (out of 50)
  const SAT_DELTA_FLAG = 10;

  // ---- Chart export (drawer graph)
  const chartRef = useRef(null);
  const exportChartImage = () => {
    try {
      const chartInstance = chartRef.current;
      if (!chartInstance) return;
      // react-chartjs-2 forwards the ChartJS instance; try toBase64Image then canvas fallback
      const url = chartInstance.toBase64Image
        ? chartInstance.toBase64Image()
        : (chartInstance.canvas ? chartInstance.canvas.toDataURL('image/png') : null);
      if (!url) return;
      const name = (selectedCompany?.company || 'company').replace(/[^a-z0-9-_]+/gi, '_');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}_scores_chart.png`;
      a.click();
    } catch (e) {
      // silent fail to avoid disrupting the UI
    }
  };

  // ---- Filters ----
  const [filters, setFilters] = useState({
    query: '', // free text (optional)
    companies: [], // selected companies (multi-select)
    sizes: [], // selected company sizes (e.g., Small/Medium/Large)
    minSatU: '', // minimum SAT (U)
    minSatV: '', // minimum SAT (V)
    minIeg: '', // minimum IEG
    ptBrand: '', // PT brand name contains
    minPtScore: '', // minimum PT score (any brand)
    diffEnabled: false, // enable |SAT(V) - IEG| discrepancy filter
    diffThreshold: '', // threshold for discrepancy
  });

  // ---- Server data ----
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Advanced filter toggle
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showMoreStats, setShowMoreStats] = useState(false);

  useEffect(() => {
    const abort = new AbortController();
    const run = async () => {
      try {
        setLoading(true);
        setError('');
        const cycleId = typeof cycle === 'string' ? cycle : cycle?.id;
        if (!cycleId) {
          setError('No cycle provided.');
          return;
        }
        const res = await request(true).get(`/admin/company-reports?cycle-id=${cycleId}`);
        // Expecting an array of rows: { company, size, satU, satV, ieg, ptResults: [{brand, score}] }
        setData(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        if (e.name !== 'AbortError') setError(e.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    run();
    return () => abort.abort();
  }, [cycle]);

  const toNum = (v) => (v === '' || v == null ? null : Number(v));

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({key, direction});
  };

  // ---- Company multi-select options & search ----
  const companyOptions = useMemo(() => {
    const arr = Array.isArray(data) ? data : [];
    const set = new Set(arr.map((r) => r.company).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [data]);

  const [companySearch, setCompanySearch] = useState('');
  const filteredCompanyOptions = useMemo(() => {
    const q = companySearch.trim().toLowerCase();
    if (!q) return companyOptions;
    return companyOptions.filter((n) => n.toLowerCase().includes(q));
  }, [companyOptions, companySearch]);

  useEffect(() => {
    if (!filters.companies?.length) return;
    const allowed = new Set(companyOptions);
    setFilters((f) => ({
      ...f,
      companies: f.companies.filter((name) => allowed.has(name)),
    }));
  }, [companyOptions]);

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Company Reports
      </Heading>
      <Text mb={4}>
        View company-specific performance summaries including SAT scores, testing results, and compliance trends.
      </Text>

      {(() => {
        const reportData = Array.isArray(data) ? data : [];

        if (loading) {
          return (
            <Center py={10}>
              <Spinner size="lg" />
            </Center>
          );
        }
        if (error) {
          return (
            <Alert status="error" mb={4}>
              <AlertIcon />{error}
            </Alert>
          );
        }
        if (!reportData.length) {
          return (
            <Alert status="info" mb={4}>
              <AlertIcon />No company reports found{cycle ? ` for cycle ${cycle}` : ''}.
            </Alert>
          );
        }

        // Apply filters
        const filteredData = reportData.filter((row) => {
          const q = (filters.query || '').toLowerCase().trim();
          if (q && !row.company?.toLowerCase().includes(q)) return false;
          if (filters.companies.length && !filters.companies.includes(row.company)) return false;

          if (filters.sizes.length && !filters.sizes.includes(row.size)) return false;

          const minU = toNum(filters.minSatU);
          const minV = toNum(filters.minSatV);
          const minI = toNum(filters.minIeg);
          if (minU != null && !(Number.isFinite(row.satU) && row.satU >= minU)) return false;
          if (minV != null && !(Number.isFinite(row.satV) && row.satV >= minV)) return false;
          if (minI != null && !(Number.isFinite(row.ieg) && row.ieg >= minI)) return false;

          const brandQ = (filters.ptBrand || '').toLowerCase().trim();
          if (brandQ) {
            const match = (row.ptResults || []).some((b) => (b.brand || '').toLowerCase().includes(brandQ));
            if (!match) return false;
          }
          const minPt = toNum(filters.minPtScore);
          if (minPt != null) {
            const anyOk = (row.ptResults || []).some((b) => Number.isFinite(b.score) && b.score >= minPt);
            if (!anyOk) return false;
          }

          if (filters.diffEnabled) {
            const th = toNum(filters.diffThreshold);
            if (th != null) {
              const delta = Math.abs((row.satV ?? NaN) - (row.ieg ?? NaN));
              if (!Number.isFinite(delta) || delta < th) return false;
            }
          }
          return true;
        });
        if (sortConfig.key) {
          filteredData.sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];
            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
          });
        }

        return (
          <>
            {/* Key Stats */}
            {(() => {
              const totalCompanies = filteredData.length;
              const avg = (arr) => {
                const nums = arr.filter((v) => Number.isFinite(v));
                if (!nums.length) return 0;
                const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
                return Math.ceil(mean);
              };
              const avgSatU = avg(filteredData.map((r) => r.satU));
              const avgSatV = avg(filteredData.map((r) => r.satV));
              const avgIeg = avg(filteredData.map((r) => r.ieg));
              const ptScores = filteredData.flatMap((r) => (r.ptResults || []).map((p) => p.score)).filter((v) => Number.isFinite(v));
              const avgPt = avg(ptScores);
              const ptCount = ptScores.length;
              const flagged = filteredData.filter((r) => Math.abs(Math.ceil(r.satU) - Math.ceil(r.satV)) >= SAT_DELTA_FLAG).length;

              const bestBy = (key) => {
                let best = null;
                for (const r of filteredData) {
                  if (!Number.isFinite(r[key])) continue;
                  if (!best || r[key] > best[key]) best = r;
                }
                return best ? {name: best.company, value: Math.ceil(best[key])} : {name: '-', value: 0};
              };
              const bestU = bestBy('satU');
              const bestV = bestBy('satV');
              const bestI = bestBy('ieg');

              return (
                <Box mb={4}>
                  <Heading size="md">Key Stats</Heading>
                  {/* Always-visible stats (up to 5) */}
                  <SimpleGrid columns={{base: 1, sm: 2, md: 3, lg: 5}} spacing={3}>
                    <Stat p={3} borderWidth="1px" borderRadius="md">
                      <StatLabel>Total companies</StatLabel>
                      <StatNumber>{totalCompanies}</StatNumber>
                      <StatHelpText>after filters</StatHelpText>
                    </Stat>

                    <Stat p={3} borderWidth="1px" borderRadius="md">
                      <StatLabel>Avg SAT (U)</StatLabel>
                      <StatNumber>{avgSatU}%</StatNumber>
                      <StatHelpText>out of 50</StatHelpText>
                    </Stat>

                    <Stat p={3} borderWidth="1px" borderRadius="md">
                      <StatLabel>Avg SAT (V)</StatLabel>
                      <StatNumber>{avgSatV}%</StatNumber>
                      <StatHelpText>out of 50</StatHelpText>
                    </Stat>

                    <Stat p={3} borderWidth="1px" borderRadius="md">
                      <StatLabel>Avg IEG</StatLabel>
                      <StatNumber>{avgIeg}%</StatNumber>
                      <StatHelpText>out of 20</StatHelpText>
                    </Stat>

                    <Stat p={3} borderWidth="1px" borderRadius="md">
                      <StatLabel>Flagged discrepancies</StatLabel>
                      <StatNumber>{flagged}</StatNumber>
                      <StatHelpText>|SAT(U)−SAT(V)| ≥ {SAT_DELTA_FLAG}</StatHelpText>
                    </Stat>
                  </SimpleGrid>
                  {/* Show more button appears only when there are extra stats */}
                  <Button size="sm" variant="ghost" onClick={() => setShowMoreStats((v) => !v)}>
                    {showMoreStats ? 'Show less' : 'Show more'}
                  </Button>

                  {/* Additional stats */}
                  <Collapse in={showMoreStats} animateOpacity>
                    <SimpleGrid columns={{base: 1, sm: 2, md: 3, lg: 4}} spacing={3} mt={3}>
                      <Stat p={3} borderWidth="1px" borderRadius="md">
                        <StatLabel>Avg PT score</StatLabel>
                        <StatNumber>{avgPt}%</StatNumber>
                        <StatHelpText>across {ptCount} samples</StatHelpText>
                      </Stat>

                      <Stat p={3} borderWidth="1px" borderRadius="md">
                        <StatLabel>Best SAT (U)</StatLabel>
                        <StatNumber>{bestU.value}%</StatNumber>
                        <StatHelpText>{bestU.name}</StatHelpText>
                      </Stat>

                      <Stat p={3} borderWidth="1px" borderRadius="md">
                        <StatLabel>Best SAT (V)</StatLabel>
                        <StatNumber>{bestV.value}%</StatNumber>
                        <StatHelpText>{bestV.name}</StatHelpText>
                      </Stat>

                      <Stat p={3} borderWidth="1px" borderRadius="md">
                        <StatLabel>Best IEG</StatLabel>
                        <StatNumber>{bestI.value}%</StatNumber>
                        <StatHelpText>{bestI.name}</StatHelpText>
                      </Stat>
                    </SimpleGrid>
                  </Collapse>
                </Box>
              );
            })()}
            {/* Filters Toolbar */}
            <Box mb={4} p={3} borderWidth="1px" borderRadius="md">
              {(() => {
                // compute size & company options from current data
                const sizeOptions = Array.from(new Set(reportData.map((r) => r.size).filter(Boolean)));
                return (
                  <>
                    <Flex gap={3} align="center" wrap="wrap">
                      <HStack spacing={3}>
                        {/* Companies Popover */}
                        <Popover isLazy placement="bottom-start" onClose={() => setCompanySearch('')}>
                          <PopoverTrigger>
                            <Button size="sm" variant="outline" rightIcon={<ChevronDownIcon />} width={'220px'}>
                              {filters.companies.length ? `${filters.companies.length} selected` : 'All companies'}
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
                        {/* Size Select */}
                        <Select
                          size="sm"
                          maxW="180px"
                          placeholder="All sizes"
                          value={filters.sizes[0] || ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            setFilters((f) => ({...f, sizes: v ? [v] : []}));
                          }}
                        >
                          {sizeOptions.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </Select>
                      </HStack>
                      <Spacer />
                      <HStack>
                        <Button
                          size="sm"
                          onClick={() => setShowAdvanced((v) => !v)}
                          variant="outline"
                        >
                          Advanced Filters
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setFilters({
                          query: '', companies: [], sizes: [], minSatU: '', minSatV: '', minIeg: '', ptBrand: '', minPtScore: '', diffEnabled: false, diffThreshold: ''
                        })}>Reset</Button>
                        <Button size="sm" colorScheme="teal" onClick={() => {
                          const csvRows = [];
                          const headers = ['Company', 'Size', 'SAT (U)', 'SAT (V)', 'IEG', 'PT Results'];
                          csvRows.push(headers.join(','));
                          filteredData.forEach((r) => {
                            const pt = (r.ptResults || []).map((p) => `${p.brand}:${p.score}%`).join(' | ');
                            csvRows.push([r.company, r.size, r.satU, r.satV, r.ieg, pt].join(','));
                          });
                          const blob = new Blob([csvRows.join('\n')], {type: 'text/csv'});
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'company_reports.csv';
                          a.click();
                          window.URL.revokeObjectURL(url);
                        }}>
                          Export
                        </Button>
                      </HStack>
                    </Flex>
                    {/* Advanced Filters Collapse */}
                    <Collapse in={showAdvanced} animateOpacity>
                      <Box mt={4}>
                        <HStack spacing={3} flexWrap="wrap">
                          <NumberInput size="sm" maxW="165px" value={filters.minSatU} onChange={(_, n) => setFilters((f) => ({...f, minSatU: isNaN(n) ? '' : n}))}>
                            <NumberInputField placeholder="Min SAT(U)%" />
                          </NumberInput>
                          <NumberInput size="sm" maxW="165px" value={filters.minSatV} onChange={(_, n) => setFilters((f) => ({...f, minSatV: isNaN(n) ? '' : n}))}>
                            <NumberInputField placeholder="Min SAT(V)%" />
                          </NumberInput>
                          <NumberInput size="sm" maxW="165px" value={filters.minIeg} onChange={(_, n) => setFilters((f) => ({...f, minIeg: isNaN(n) ? '' : n}))}>
                            <NumberInputField placeholder="Min IEG%" />
                          </NumberInput>
                          <Input
                            size="sm"
                            placeholder="Brand Name"
                            value={filters.ptBrand}
                            onChange={(e) => setFilters((f) => ({...f, ptBrand: e.target.value}))}
                            maxW="220px"
                          />
                          <NumberInput size="sm" maxW="150px" value={filters.minPtScore} onChange={(_, n) => setFilters((f) => ({...f, minPtScore: isNaN(n) ? '' : n}))}>
                            <NumberInputField placeholder="Min PT%" />
                          </NumberInput>
                          <HStack spacing={2}>
                            <Checkbox isChecked={filters.diffEnabled} onChange={(e) => setFilters((f) => ({...f, diffEnabled: e.target.checked}))}>Δ V vs IEG ≥</Checkbox>
                            <NumberInput size="sm" maxW="110px" value={filters.diffThreshold} onChange={(_, n) => setFilters((f) => ({...f, diffThreshold: isNaN(n) ? '' : n}))}>
                              <NumberInputField placeholder="%" />
                            </NumberInput>
                          </HStack>
                        </HStack>
                      </Box>
                    </Collapse>
                  </>
                );
              })()}
            </Box>
            <Table variant="striped" colorScheme="teal" size="sm" mt={6}>
              <TableCaption>Company Performance Overview</TableCaption>
              <Thead>
                <Tr>
                  <Th cursor="pointer" onClick={() => handleSort('company')}>
                    <Flex align="center">
                      <Text>Company</Text>
                      {sortConfig.key === 'company' && (
                        <Box ml={1}>{sortConfig.direction === 'asc' ? '▲' : '▼'}</Box>
                      )}
                    </Flex>
                  </Th>
                  <Th cursor="pointer" onClick={() => handleSort('size')}>
                    <Flex align="center">
                      <Text>Size</Text>
                      {sortConfig.key === 'size' && (
                        <Box ml={1}>{sortConfig.direction === 'asc' ? '▲' : '▼'}</Box>
                      )}
                    </Flex>
                  </Th>
                  <Th cursor="pointer" onClick={() => handleSort('satU')}>
                    <Flex align="center">
                      <Text>SAT (U)</Text>
                      {sortConfig.key === 'satU' && (
                        <Box ml={1}>{sortConfig.direction === 'asc' ? '▲' : '▼'}</Box>
                      )}
                    </Flex>
                  </Th>
                  <Th cursor="pointer" onClick={() => handleSort('satV')}>
                    <Flex align="center">
                      <Text>SAT (V)</Text>
                      {sortConfig.key === 'satV' && (
                        <Box ml={1}>{sortConfig.direction === 'asc' ? '▲' : '▼'}</Box>
                      )}
                    </Flex>
                  </Th>
                  <Th cursor="pointer" onClick={() => handleSort('ieg')}>
                    <Flex align="center">
                      <Text>IEG</Text>
                      {sortConfig.key === 'ieg' && (
                        <Box ml={1}>{sortConfig.direction === 'asc' ? '▲' : '▼'}</Box>
                      )}
                    </Flex>
                  </Th>
                  <Th>Flags</Th>
                  <Th>PT Results</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredData.map((row, idx) => (
                  <Tr
                    key={idx}
                    onClick={() => {
                      setSelectedCompany(row);
                      setDrawerView('snapshot');
                      onOpen();
                    }}
                    cursor="pointer"
                    _hover={{bg: 'teal.50'}}
                  >
                    <Td>{row.company}</Td>
                    <Td>{row.size || '-'}</Td>
                    <Td color={Math.ceil(row.satU) >= 40 ? 'green.500' : Math.ceil(row.satU) >= 35 ? 'orange.500' : 'red.500'}>
                      {Math.ceil(row.satU)}%
                    </Td>
                    <Td color={Math.ceil(row.satV) >= 40 ? 'green.500' : Math.ceil(row.satV) >= 35 ? 'orange.500' : 'red.500'}>
                      {Math.ceil(row.satV)}%
                    </Td>
                    <Td color={Math.ceil(row.ieg) >= 16 ? 'green.500' : Math.ceil(row.ieg) >= 14 ? 'orange.500' : 'red.500'}>
                      {Math.ceil(row.ieg)}%
                    </Td>
                    {/* Flags */}
                    <Td>
                      {(() => {
                        const d = Math.abs(Math.ceil(row.satU) - Math.ceil(row.satV));
                        if (Number.isFinite(d) && d >= SAT_DELTA_FLAG) {
                          return (
                            <CkTooltip label={`Potential integrity issue: SAT(U) vs SAT(V) differ by ${d} / 50`}>
                              <Badge colorScheme="red">Δ {d}</Badge>
                            </CkTooltip>
                          );
                        }
                        return null;
                      })()}
                    </Td>
                    <Td>
                      {(row.ptResults || []).map((pt, i) => (
                        <Box key={i}>
                          <strong>{pt.brand}:</strong> {Math.ceil(pt.score)}%
                        </Box>
                      ))}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            {/* Drawer with chart for clicked company */}
            <Drawer isOpen={isOpen} placement="right" size="xl" onClose={onClose}>
              <DrawerOverlay />
              <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader>
                  {selectedCompany?.company ? `${selectedCompany.company} — Scores` : 'Scores'}
                </DrawerHeader>
                <DrawerBody>
                  {selectedCompany && (() => {
                    const s = selectedCompany;
                    const chartData = {
                      labels: ['SAT (U)', 'SAT (V)', 'IEG', ...(s.ptResults || []).map((b) => b.brand)],
                      datasets: [{
                        label: `${s.company} Scores`,
                        data: [
                          Math.ceil(s.satU),
                          Math.ceil(s.satV),
                          Math.ceil(s.ieg),
                          ...((s.ptResults || []).map((b) => Math.ceil(b.score)))
                        ],
                        backgroundColor: [
                          'lightgreen',
                          'darkgreen',
                          'black',
                          ...Array((s.ptResults || []).length).fill('orange')
                        ],
                      }],
                    };
                    // Chart options with orientation
                    const chartOptions = {
                      responsive: true,
                      plugins: {
                        legend: {position: 'top'},
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              // Support both vertical and horizontal
                              // For horizontal, value is context.parsed.x
                              const val = chartOrientation === 'vertical'
                                ? context.parsed.y
                                : context.parsed.x;
                              return `${context.label}: ${val}%`;
                            },
                          },
                        },
                        annotation: {
                          annotations: {
                            satLine: chartOrientation === 'vertical'
                              ? {
                                  type: 'line',
                                  yMin: 50,
                                  yMax: 50,
                                  borderColor: 'lightgreen',
                                  borderWidth: 2,
                                  borderDash: [5, 5],
                                  label: {
                                    display: true,
                                    content: 'SAT threshold',
                                    position: 'end',
                                    color: 'lightgreen',
                                    font: {style: 'italic', size: 10},
                                  },
                                }
                              : {
                                  type: 'line',
                                  xMin: 50,
                                  xMax: 50,
                                  borderColor: 'lightgreen',
                                  borderWidth: 2,
                                  borderDash: [5, 5],
                                  label: {
                                    display: true,
                                    content: 'SAT threshold',
                                    position: 'end',
                                    color: 'lightgreen',
                                    font: {style: 'italic', size: 10},
                                  },
                                },
                            iegLine: chartOrientation === 'vertical'
                              ? {
                                  type: 'line',
                                  yMin: 20,
                                  yMax: 20,
                                  borderColor: 'black',
                                  borderWidth: 2,
                                  borderDash: [5, 5],
                                  label: {
                                    display: true,
                                    content: 'IEG threshold',
                                    position: 'end',
                                    color: 'black',
                                    font: {style: 'italic', size: 10},
                                  },
                                }
                              : {
                                  type: 'line',
                                  xMin: 20,
                                  xMax: 20,
                                  borderColor: 'black',
                                  borderWidth: 2,
                                  borderDash: [5, 5],
                                  label: {
                                    display: true,
                                    content: 'IEG threshold',
                                    position: 'end',
                                    color: 'black',
                                    font: {style: 'italic', size: 10},
                                  },
                                },
                            ptLine: chartOrientation === 'vertical'
                              ? {
                                  type: 'line',
                                  yMin: 30,
                                  yMax: 30,
                                  borderColor: 'orange',
                                  borderWidth: 2,
                                  borderDash: [5, 5],
                                  label: {
                                    display: true,
                                    content: 'PT threshold',
                                    position: 'end',
                                    color: 'orange',
                                    font: {style: 'italic', size: 10},
                                  },
                                }
                              : {
                                  type: 'line',
                                  xMin: 30,
                                  xMax: 30,
                                  borderColor: 'orange',
                                  borderWidth: 2,
                                  borderDash: [5, 5],
                                  label: {
                                    display: true,
                                    content: 'PT threshold',
                                    position: 'end',
                                    color: 'orange',
                                    font: {style: 'italic', size: 10},
                                  },
                                },
                          },
                        },
                      },
                      scales: chartOrientation === 'vertical'
                        ? {y: {beginAtZero: true, max: 100}}
                        : {x: {beginAtZero: true, max: 100}},
                      indexAxis: chartOrientation === 'vertical' ? 'x' : 'y',
                    };
                    return (
                      <Box>
                        {(() => {
                          const d = Math.abs(Math.ceil(s.satU) - Math.ceil(s.satV));
                          if (Number.isFinite(d) && d >= SAT_DELTA_FLAG) {
                            return (
                              <Alert status="warning" mb={3}>
                                <AlertIcon />Potential integrity issue: Self‑assessment (SAT U) and Validation (SAT V) differ by {d} / 50.
                              </Alert>
                            );
                          }
                          return null;
                        })()}
                        {/* View toggle + controls */}
                        <HStack mb={3} justify="space-between" flexWrap="wrap">
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              variant={drawerView === 'snapshot' ? 'solid' : 'outline'}
                              onClick={() => setDrawerView('snapshot')}
                            >
                              Snapshot
                            </Button>
                            <Button
                              size="sm"
                              variant={drawerView === 'trend' ? 'solid' : 'outline'}
                              onClick={() => {
                                setDrawerView('trend');
                                fetchTrendForCompany(s.companyId);
                              }}
                            >
                              Trend
                            </Button>
                          </HStack>

                          <HStack spacing={2}>
                            {drawerView === 'snapshot' && (
                              <Button size="sm" variant="outline" onClick={() => setChartOrientation((o) => o === 'vertical' ? 'horizontal' : 'vertical')}>
                                {chartOrientation === 'vertical' ? 'Switch to Horizontal' : 'Switch to Vertical'}
                              </Button>
                            )}
                            <Button size="sm" onClick={exportChartImage}>Export Graph</Button>
                          </HStack>
                        </HStack>

                        {/* Chart area */}
                        {drawerView === 'snapshot' ? (
                          <Bar ref={chartRef} data={chartData} options={chartOptions} />
                        ) : (
                          <Box>
                            {trendLoading && (
                              <Center py={8}><Spinner /></Center>
                            )}
                            {trendError && !trendLoading && (
                              <Alert status="warning" mb={3}><AlertIcon />{trendError}</Alert>
                            )}
                            {!trendLoading && !trendError && (() => {
                              // Normalize trend data shape
                              let labels = [];
                              let seriesU = [];
                              let seriesV = [];
                              let seriesI = [];
                              let seriesPT = [];

                              if (trendData && Array.isArray(trendData)) {
                                labels = trendData.map((d) => d.cycle || d.label || '');
                                seriesU = trendData.map((d) => Math.ceil(d.satU ?? 0));
                                seriesV = trendData.map((d) => Math.ceil(d.satV ?? 0));
                                seriesI = trendData.map((d) => Math.ceil(d.ieg ?? 0));
                                seriesPT = trendData.map((d) => Math.ceil(d.ptAvg ?? 0));
                              } else if (trendData && trendData.labels) {
                                labels = trendData.labels || [];
                                const ceilArr = (arr) => (Array.isArray(arr) ? arr.map((v) => Math.ceil(v ?? 0)) : []);
                                seriesU = ceilArr(trendData.satU);
                                seriesV = ceilArr(trendData.satV);
                                seriesI = ceilArr(trendData.ieg);
                                seriesPT = ceilArr(trendData.ptAvg);
                              }

                              const lineData = {
                                labels,
                                datasets: [
                                  {label: 'SAT (U)', data: seriesU, borderColor: 'lightgreen', backgroundColor: 'lightgreen', tension: 0.2, pointRadius: 3},
                                  {label: 'SAT (V)', data: seriesV, borderColor: 'darkgreen', backgroundColor: 'darkgreen', tension: 0.2, pointRadius: 3},
                                  {label: 'IEG', data: seriesI, borderColor: 'black', backgroundColor: 'black', tension: 0.2, pointRadius: 3},
                                  {label: 'PT (avg)', data: seriesPT, borderColor: 'orange', backgroundColor: 'orange', tension: 0.2, pointRadius: 3},
                                ],
                              };

                              const lineOptions = {
                                responsive: true,
                                plugins: {
                                  legend: {position: 'top'},
                                  tooltip: {
                                    callbacks: {
                                      label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}%`,
                                    },
                                  },
                                },
                                scales: {
                                  y: {beginAtZero: true, max: 100, title: {display: true, text: 'Score (%)'}},
                                },
                              };

                              return <Line data={lineData} options={lineOptions} />;
                            })()}
                          </Box>
                        )}
                      </Box>
                    );
                  })()}
                </DrawerBody>
              </DrawerContent>
            </Drawer>
          </>
        );
      })()}
    </Box>
  );
};

Reports.propTypes = {
  // Optional: number or string (e.g., 2025 or '2025-Q1')
  cycle: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Reports.defaultProps = {
  cycle: null,
};

export default Reports;
