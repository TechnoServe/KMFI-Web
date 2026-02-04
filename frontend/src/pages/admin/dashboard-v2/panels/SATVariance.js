import React, {useState, useEffect, useMemo, useRef} from 'react';
import PropTypes from 'prop-types';
import {
  Badge,
  Box,
  Button,
  Center,
  Checkbox,
  CheckboxGroup,
  Collapse,
  Divider,
  Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseButton,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Select,
  SimpleGrid,
  Spinner,
  Switch,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Tooltip,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import {ChevronUpIcon, ChevronDownIcon} from '@chakra-ui/icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import {Bar} from 'react-chartjs-2';
import {request} from 'common';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ChartTooltip, Legend, annotationPlugin);

/**
 * SATVariance Component
 * Displays a comparison between self-assessed and validated SAT scores for companies,
 * highlighting the variance between the two scores.
 *
 * @returns {JSX.Element} The rendered SAT variance table.
 */

const SATVariance = ({cycle}) => {
  const scoresChartRef = useRef(null);
  const varianceChartRef = useRef(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [varianceThreshold, setVarianceThreshold] = useState(5); // percent
  const [showOnlyFlagged, setShowOnlyFlagged] = useState(false);

  const [companyNames, setCompanyNames] = useState([]);
  const [companyQuery, setCompanyQuery] = useState('');
  const {isOpen, onOpen, onClose} = useDisclosure();
  const {isOpen: isChartsOpen, onOpen: onChartsOpen, onClose: onChartsClose} = useDisclosure();

  const [hideUnvalidated, setHideUnvalidated] = useState(false);
  const [sizeFilter, setSizeFilter] = useState(''); // '', 'large', 'medium', 'small'

  const [sortConfig, setSortConfig] = useState({key: 'variance', direction: 'asc'});
  const [showMoreStats, setShowMoreStats] = useState(false);

  const handleExportFlagged = () => {
    const flagged = data.filter(
      (r) => typeof r.variance === 'number' && r.variance > varianceThreshold
    );
    if (flagged.length === 0) return;
    const headers = [
      'Company',
      'Size',
      'Self Score (%)',
      'Validated Score (%)',
      'Variance (%)',
      'Variance 2 (%)',
    ];
    const rows = flagged.map((r) => [
      r.company,
      r.company_size ?? '',
      (Number(r.selfScore) ?? 0).toFixed(2),
      (Number(r.validatedScore) ?? 0).toFixed(2),
      (Number(r.variance) ?? 0).toFixed(2),
      (Number(r.variance2) ?? 0).toFixed(2),
    ]);
    const csv = [headers, ...rows].map((arr) => arr.join(',')).join('\n');
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sat_variance_flagged.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportAll = () => {
    if (data.length === 0) return;
    const headers = [
      'Company',
      'Size',
      'Self Score (%)',
      'Validated Score (%)',
      'Variance (%)',
      'Variance 2 (%)',
    ];
    const rows = data.map((r) => [
      r.company,
      r.company_size ?? '',
      (Number(r.selfScore) ?? 0).toFixed(2),
      (Number(r.validatedScore) ?? 0).toFixed(2),
      (Number(r.variance) ?? 0).toFixed(2),
      (Number(r.variance2) ?? 0).toFixed(2),
    ]);
    const csv = [headers, ...rows].map((arr) => arr.join(',')).join('\n');
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sat_variance_all.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {key, direction: prev.direction === 'asc' ? 'desc' : 'asc'};
      }
      return {key, direction: 'asc'};
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setData([]);
      try {
        const response = await request(true).get('/admin/sat-variance', {
          params: {'cycle-id': cycle?.id}
        });
        const mappedData = response.data.map((item) => ({
          company: item.company_name,
          tier: item.tier,
          company_size: item.company_size,
          selfScore: item.selfScore,
          validatedScore: item.validatedScore,
          variance: item.variance,
          variance2: item.variance2,
        }));
        setData(mappedData);
      } catch (error) {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    if (cycle?.id) {
      fetchData();
    }
  }, [cycle]);

  const allCompanies = useMemo(() => {
    const set = new Set((data || []).map((r) => r.company).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [data]);

  const filteredData = useMemo(() => {
    let temp = data;
    // Multi-select & query filter
    if (companyNames.length > 0) {
      const set = new Set(companyNames);
      temp = temp.filter((r) => set.has(r.company));
    }
    if (companyQuery.trim()) {
      const lowerFilter = companyQuery.trim().toLowerCase();
      temp = temp.filter((r) => (r.company || '').toLowerCase().includes(lowerFilter));
    }
    if (hideUnvalidated) {
      temp = temp.filter((r) => r.validatedScore && r.validatedScore !== 0);
    }
    if (sizeFilter) {
      const want = String(sizeFilter).toLowerCase();
      temp = temp.filter((r) => String(r.company_size || '').toLowerCase() === want);
    }
    if (showOnlyFlagged) {
      temp = temp.filter((r) => typeof r.variance === 'number' && r.variance > varianceThreshold);
    }
    return temp;
  }, [data, companyNames, companyQuery, showOnlyFlagged, varianceThreshold, hideUnvalidated, sizeFilter]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        return sortConfig.direction === 'asc'
          ? aVal - bVal
          : bVal - aVal;
      }
    });
  }, [filteredData, sortConfig]);

  const summary = useMemo(() => {
    const rows = filteredData; // use filtered set for all key stats
    const totalCompanies = rows.length;
    const safeNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
    const hasVar = (r) => Number.isFinite(Number(r.variance));
    const hasVar2 = (r) => Number.isFinite(Number(r.variance2));

    const totalFlagged = rows.filter((r) => hasVar(r) && r.variance > varianceThreshold).length;

    const avgSelfScore = totalCompanies
      ? (rows.reduce((sum, r) => sum + safeNum(r.selfScore), 0) / totalCompanies).toFixed(2)
      : '0.00';
    const avgValidatedScore = totalCompanies
      ? (rows.reduce((sum, r) => sum + safeNum(r.validatedScore), 0) / totalCompanies).toFixed(2)
      : '0.00';

    const variances = rows.filter(hasVar).map((r) => Number(r.variance)).sort((a, b) => a - b);
    const variances2 = rows.filter(hasVar2).map((r) => Number(r.variance2)).sort((a, b) => a - b);
    const avgVariance = variances2.length
      ? (variances2.reduce((s, v) => s + v, 0) / variances2.length).toFixed(2)
      : '0.00';
    const medianVariance = variances.length
      ? (variances.length % 2 === 1
          ? variances[(variances.length - 1) / 2]
          : (variances[variances.length / 2 - 1] + variances[variances.length / 2]) / 2
        ).toFixed(2)
      : '0.00';

    let highestSatRow = null;
    for (const r of rows) {
      if (!highestSatRow || safeNum(r.selfScore) > safeNum(highestSatRow.selfScore)) highestSatRow = r;
    }

    let highestIvcRow = null;
    for (const r of rows) {
      if (!highestIvcRow || safeNum(r.validatedScore) > safeNum(highestIvcRow.validatedScore)) highestIvcRow = r;
    }

    const withVar = rows.filter(
      (r) =>
        hasVar(r) &&
        Number(r.selfScore) !== 0 &&
        Number(r.validatedScore) !== 0
    );
    let smallestVarRow = null;
    let biggestVarRow = null;
    for (const r of withVar) {
      if (!smallestVarRow || Number(r.variance) < Number(smallestVarRow.variance)) smallestVarRow = r;
      if (!biggestVarRow || Number(r.variance) > Number(biggestVarRow.variance)) biggestVarRow = r;
    }

    // Average variance by size (prefer variance2, fallback to variance)
    const normSize = (s) => String(s || '').toLowerCase();
    const avgBySize = (size) => {
      const sRows = rows.filter((r) => normSize(r.company_size) === size);
      if (!sRows.length) return '0.00';
      const vals = sRows.map((r) => {
        const v2 = Number(r.variance2);
        if (Number.isFinite(v2)) return v2;
        const v = Number(r.variance);
        return Number.isFinite(v) ? v : 0;
      });
      const sum = vals.reduce((s, v) => s + v, 0);
      return (sum / sRows.length).toFixed(2);
    };

    const avgLarge = avgBySize('large');
    const avgMedium = avgBySize('medium');
    const avgSmall = avgBySize('small');

    const outlierRate = totalCompanies ? ((totalFlagged / totalCompanies) * 100).toFixed(2) : '0.00';

    return {
      totalCompanies,
      totalFlagged,
      avgSelfScore,
      avgValidatedScore,
      avgVariance,
      medianVariance,
      highestSatCompany: highestSatRow?.company || '—',
      highestSat: highestSatRow ? safeNum(highestSatRow.selfScore).toFixed(2) : '0.00',
      highestIvcCompany: highestIvcRow?.company || '—',
      highestIvc: highestIvcRow ? safeNum(highestIvcRow.validatedScore).toFixed(2) : '0.00',
      smallestVarCompany: smallestVarRow?.company || '—',
      smallestVar: smallestVarRow ? Number(smallestVarRow.variance).toFixed(2) : '0.00',
      biggestVarCompany: biggestVarRow?.company || '—',
      biggestVar: biggestVarRow ? Number(biggestVarRow.variance).toFixed(2) : '0.00',
      outlierRate,
      avgLarge,
      avgMedium,
      avgSmall,
    };
  }, [filteredData, varianceThreshold]);

  // console.log('SAT Variance Summary:', summary);


  if (loading) {
    return (
      <Center py={10}>
        <Spinner size="lg" />
      </Center>
    );
  }

  return (
    <Box p={4}>
      <HStack align="start" justifyContent="flex-start" mb={4} spacing={3}>
        <Heading size="md" mb={4}>SAT Variance</Heading>
        <Button size="sm" variant="outline" onClick={onChartsOpen}>
          Show charts
        </Button>
        <Button
          size="sm"
          colorScheme="green"
          onClick={handleExportAll}
          isDisabled={data.length === 0}
        >
          Export all
        </Button>
        <Button
          size="sm"
          colorScheme="blue"
          onClick={handleExportFlagged}
          isDisabled={!data.some((r) => typeof r.variance === 'number' && r.variance > varianceThreshold)}
        >
          Export flagged
        </Button>
      </HStack>

      {/* Key Stats — one row by default */}
      <SimpleGrid columns={{base: 1, sm: 2, md: 3, lg: 4, xl: 5}} spacing={4} mb={2}>
        <Box p={4} bg="gray.50" borderWidth="1px" borderRadius="md">
          <Heading size="sm">Total Companies</Heading>
          <Box fontSize="lg" fontWeight="bold">{summary.totalCompanies}</Box>
        </Box>
        <Box p={4} bg="gray.50" borderWidth="1px" borderRadius="md">
          <Heading size="sm">Flagged Companies</Heading>
          <Box fontSize="lg" fontWeight="bold">{summary.totalFlagged}</Box>
        </Box>
        <Box p={4} bg="gray.50" borderWidth="1px" borderRadius="md">
          <Heading size="sm">Avg Self Score</Heading>
          <Box fontSize="lg" fontWeight="bold">{summary.avgSelfScore}%</Box>
        </Box>
        <Box p={4} bg="gray.50" borderWidth="1px" borderRadius="md">
          <Heading size="sm">Avg Validated Score</Heading>
          <Box fontSize="lg" fontWeight="bold">{summary.avgValidatedScore}%</Box>
        </Box>
        <Box p={4} bg="gray.50" borderWidth="1px" borderRadius="md">
          <Heading size="sm">Avg Variance</Heading>
          <Box fontSize="lg" fontWeight="bold">{summary.avgVariance}%</Box>
        </Box>
      </SimpleGrid>
      <Box textAlign="right" mb={4}>
        <Button size="sm" variant="ghost" onClick={() => setShowMoreStats((v) => !v)}>
          {showMoreStats ? 'Show less' : 'Show more'}
        </Button>
      </Box>

      {/* Expanded stats shown on demand */}
      <Collapse in={showMoreStats} animateOpacity>
        <SimpleGrid columns={{base: 1, sm: 2, md: 3, lg: 4, xl: 5}} spacing={4} mb={4}>
          <Box p={4} bg="gray.50" borderWidth="1px" borderRadius="md">
            <Heading size="sm">Highest SAT</Heading>
            <Box fontSize="lg" fontWeight="bold">{summary.highestSat}%</Box>
            <Box fontSize="sm">{summary.highestSatCompany}</Box>
          </Box>
          <Box p={4} bg="gray.50" borderWidth="1px" borderRadius="md">
            <Heading size="sm">Highest IVC</Heading>
            <Box fontSize="lg" fontWeight="bold">{summary.highestIvc}%</Box>
            <Box fontSize="sm">{summary.highestIvcCompany}</Box>
          </Box>
          <Box p={4} bg="gray.50" borderWidth="1px" borderRadius="md">
            <Heading size="sm">Smallest Variance</Heading>
            <Box fontSize="lg" fontWeight="bold">{summary.smallestVar}%</Box>
            <Box fontSize="sm">{summary.smallestVarCompany}</Box>
          </Box>
          <Box p={4} bg="gray.50" borderWidth="1px" borderRadius="md">
            <Heading size="sm">Biggest Variance</Heading>
            <Box fontSize="lg" fontWeight="bold">{summary.biggestVar}%</Box>
            <Box fontSize="sm">{summary.biggestVarCompany}</Box>
          </Box>
          <Box p={4} bg="gray.50" borderWidth="1px" borderRadius="md">
            <Heading size="sm">Outlier Rate</Heading>
            <Box fontSize="lg" fontWeight="bold">{summary.outlierRate}%</Box>
          </Box>
          <Box p={4} bg="gray.50" borderWidth="1px" borderRadius="md">
            <Heading size="sm">Avg Variance (Large)</Heading>
            <Box fontSize="lg" fontWeight="bold">{summary.avgLarge}%</Box>
          </Box>
          <Box p={4} bg="gray.50" borderWidth="1px" borderRadius="md">
            <Heading size="sm">Avg Variance (Medium)</Heading>
            <Box fontSize="lg" fontWeight="bold">{summary.avgMedium}%</Box>
          </Box>
          <Box p={4} bg="gray.50" borderWidth="1px" borderRadius="md">
            <Heading size="sm">Avg Variance (Small)</Heading>
            <Box fontSize="lg" fontWeight="bold">{summary.avgSmall}%</Box>
          </Box>
        </SimpleGrid>
      </Collapse>

      <HStack spacing={6} mb={4} align="center">
        <FormControl display="flex" alignItems="center" width="auto">
          <FormLabel m={0} mr={3}>Size</FormLabel>
          <Select size="sm" maxW="160px" value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)}>
            <option value="">All</option>
            <option value="large">Large</option>
            <option value="medium">Medium</option>
            <option value="small">Small</option>
          </Select>
        </FormControl>
        <FormControl display="flex" alignItems="center" width="auto">
          <FormLabel m={0} mr={3}>Outlier threshold (%)</FormLabel>
          <NumberInput size="sm" maxW="100px" step={0.1} min={0} max={100} value={varianceThreshold}
            onChange={(valueString, valueNumber) => setVarianceThreshold(Number.isFinite(valueNumber) ? valueNumber : 0)}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        <FormControl display="flex" alignItems="center" width="auto">
          <FormLabel m={0} mr={3}>Show only flagged</FormLabel>
          <Switch isChecked={showOnlyFlagged} onChange={(e) => setShowOnlyFlagged(e.target.checked)} />
        </FormControl>
        <FormControl display="flex" alignItems="center" width="auto">
          <Popover placement="bottom-start" isOpen={isOpen} onClose={onClose}>
            <PopoverTrigger>
              <Button size="sm" variant="outline" onClick={isOpen ? onClose : onOpen}>
                Companies{companyNames.length ? ` (${companyNames.length})` : ''}
              </Button>
            </PopoverTrigger>
            <PopoverContent w="320px">
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverHeader>Select Companies</PopoverHeader>
              <PopoverBody>
                <VStack align="stretch" spacing={3}>
                  <Input
                    size="sm"
                    placeholder="Search companies"
                    value={companyQuery}
                    onChange={(e) => setCompanyQuery(e.target.value)}
                  />
                  <Divider />
                  <HStack spacing={2} justify="space-between">
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => {
                        const visible = allCompanies.filter((c) => c.toLowerCase().includes((companyQuery || '').toLowerCase()));
                        setCompanyNames((prev) => Array.from(new Set([...(prev || []), ...visible])));
                      }}
                    >
                      Select all
                    </Button>
                    <Button size="xs" variant="ghost" onClick={() => setCompanyNames([])}>Clear selected</Button>
                  </HStack>
                  <Box maxH="220px" overflowY="auto" borderWidth="1px" borderRadius="md" p={2}>
                    <CheckboxGroup
                      value={companyNames}
                      onChange={(vals) => setCompanyNames(vals)}
                    >
                      <VStack align="stretch" spacing={2}>
                        {allCompanies
                          .filter((c) => c.toLowerCase().includes((companyQuery || '').toLowerCase()))
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
                <Button size="sm" variant="ghost" onClick={() => {
                  setCompanyNames([]); setCompanyQuery('');
                }}>Clear</Button>
                <Button size="sm" colorScheme="blue" onClick={onClose}>Done</Button>
              </PopoverFooter>
            </PopoverContent>
          </Popover>
        </FormControl>
        <HStack spacing={2} align="center">
          <Switch
            isChecked={hideUnvalidated}
            onChange={(e) => setHideUnvalidated(e.target.checked)}
          />
          <Text>Hide unvalidated</Text>
        </HStack>

      </HStack>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th cursor="pointer" onClick={() => handleSort('company')}>
              <Flex align="center">
                Company Name
                {sortConfig.key === 'company' && (
                  <Icon as={sortConfig.direction === 'asc' ? ChevronUpIcon : ChevronDownIcon} ml={2} />
                )}
              </Flex>
            </Th>
            <Th cursor="pointer" onClick={() => handleSort('company_size')}>
              <Flex align="center">
                Size
                {sortConfig.key === 'company_size' && (
                  <Icon as={sortConfig.direction === 'asc' ? ChevronUpIcon : ChevronDownIcon} ml={2} />
                )}
              </Flex>
            </Th>
            <Th cursor="pointer" onClick={() => handleSort('selfScore')}>
              <Flex align="center">
                SAT Score
                {sortConfig.key === 'selfScore' && (
                  <Icon as={sortConfig.direction === 'asc' ? ChevronUpIcon : ChevronDownIcon} ml={2} />
                )}
              </Flex>
            </Th>
            <Th cursor="pointer" onClick={() => handleSort('validatedScore')}>
              <Flex align="center">
                IVC Score
                {sortConfig.key === 'validatedScore' && (
                  <Icon as={sortConfig.direction === 'asc' ? ChevronUpIcon : ChevronDownIcon} ml={2} />
                )}
              </Flex>
            </Th>
            <Th cursor="pointer" onClick={() => handleSort('variance')}>
              <Flex align="center">
                Variance
                {sortConfig.key === 'variance' && (
                  <Icon as={sortConfig.direction === 'asc' ? ChevronUpIcon : ChevronDownIcon} ml={2} />
                )}
              </Flex>
            </Th>
            <Th cursor="pointer" onClick={() => handleSort('variance2')}>
              <Flex align="center">
                Variance 2
                {sortConfig.key === 'variance2' && (
                  <Icon as={sortConfig.direction === 'asc' ? ChevronUpIcon : ChevronDownIcon} ml={2} />
                )}
              </Flex>
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {sortedData.map((row) => (
            <Tr
              key={row.company}
              bg={Number(row.selfScore) === 0 && Number(row.validatedScore) === 0 ? 'gray.100' : undefined}
            >
              <Td>
                <HStack spacing={2}>
                  <span>{row.company}</span>
                  {Number(row.selfScore) === 0 && Number(row.validatedScore) === 0 && (
                    <Tooltip label="No SAT & IVC score">
                      <Badge colorScheme="yellow" variant="subtle">!</Badge>
                    </Tooltip>
                  )}
                  {typeof row.variance === 'number' && row.variance > varianceThreshold && (
                    <Tooltip label={`High variance: ${row.variance.toFixed(2)}%`}>
                      <Badge colorScheme="red" variant="subtle">Outlier</Badge>
                    </Tooltip>
                  )}
                </HStack>
              </Td>
              <Td>{row.company_size}</Td>
              <Td>{row.selfScore.toFixed(2)}%</Td>
              <Td>{row.validatedScore.toFixed(2)}%</Td>
              <Td>{typeof row.variance === 'number' ? `${row.variance.toFixed(2)}%` : '—'}</Td>
              <Td>{typeof row.variance2 === 'number' ? `${row.variance2.toFixed(2)}%` : '—'}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Drawer placement="bottom" onClose={onChartsClose} isOpen={isChartsOpen} size="xl">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader display="flex" justifyContent="flex-start" alignItems="center">
            <Box>Charts</Box>
            <HStack spacing={2}>
              <Button
                size="sm"
                onClick={() => {
                  const chart = scoresChartRef.current;
                  if (!chart) return;
                  try {
                    const url = chart.toBase64Image('image/png', 1);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'sat_vs_validated.png';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  } catch (e) {}
                }}
              >
                Export Scores PNG
              </Button>
              <Button
                size="sm"
                mr={20}
                onClick={() => {
                  const chart = varianceChartRef.current;
                  if (!chart) return;
                  try {
                    const url = chart.toBase64Image('image/png', 1);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'variance_chart.png';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  } catch (e) {}
                }}
                colorScheme="blue"
              >
                Export Variance PNG
              </Button>
            </HStack>
          </DrawerHeader>
          <DrawerBody>
            <Box mb={10}>
              <Heading size="sm" mb={4}>Self Assessment Vs. Validated Scores</Heading>
              <Bar ref={scoresChartRef}
                data={{
                  labels: data.map((item) => item.company),
                  datasets: [
                    {
                      label: 'Self Assessed SAT Score',
                      data: data.map((item) => item.selfScore),
                      backgroundColor: '#3182ce',
                    },
                    {
                      label: 'Validated SAT Score',
                      data: data.map((item) => item.validatedScore),
                      backgroundColor: '#2f855a',
                    },
                    {
                      type: 'line',
                      label: 'Average SAT (%)',
                      data: data.map(() => Number(summary.avgSelfScore) || 0),
                      borderDash: [6, 6],
                      borderColor: '#3182ce',
                      borderWidth: 2,
                      pointRadius: 0,
                    },
                    {
                      type: 'line',
                      label: 'Average IVC (%)',
                      data: data.map(() => Number(summary.avgValidatedScore) || 0),
                      borderDash: [4, 4],
                      borderColor: '#2f855a',
                      borderWidth: 3,
                      pointRadius: 0,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {position: 'top'},
                    tooltip: {
                      mode: 'index',
                      intersect: false,
                      callbacks: {
                        label: (context) => {
                          const val = (context.parsed && typeof context.parsed.y === 'number')
                            ? context.parsed.y
                            : (typeof context.raw === 'number' ? context.raw : 0);
                          return `${context.dataset.label}: ${val}%`;
                        },
                      },
                    },
                  },
                  scales: {
                    y: {beginAtZero: true, max: 100},
                  },
                }}
              />
            </Box>
            <Box>
              <Heading size="sm" mb={4}>Variance</Heading>
              {(() => {
                // Waterfall (floating bar) chart without a final Total column
                // Sort data descending by variance before building chart
                const sorted = [...data].sort((a, b) => {
                  const av = (typeof a.variance === 'number' ? a.variance : 0);
                  const bv = (typeof b.variance === 'number' ? b.variance : 0);
                  return bv - av; // highest to lowest
                });
                const labels = sorted.map((item) => item.company);
                const deltas = sorted.map((item) => (typeof item.variance === 'number' ? item.variance : 0));

                // Build running totals for floating bars
                const starts = [];
                const ends = [];
                let running = 0;
                for (let i = 0; i < deltas.length; i++) {
                  const start = running;
                  const end = running + deltas[i];
                  starts.push(start);
                  ends.push(end);
                  running = end;
                }

                const bars = starts.map((s, i) => [s, ends[i]]);

                // Find continuous block of least variance (between -5% and +5%) in the sorted deltas
                const isLeast = (v) => v >= -5 && v <= 5;
                let idxStartLeast = -1;
                let idxEndLeast = -1;
                for (let i = 0; i < deltas.length; i++) {
                  if (isLeast(deltas[i])) {
                    idxStartLeast = i; break;
                  }
                }
                if (idxStartLeast !== -1) {
                  for (let i = deltas.length - 1; i >= idxStartLeast; i--) {
                    if (isLeast(deltas[i])) {
                      idxEndLeast = i; break;
                    }
                  }
                }

                // Build annotation lines (vertical dashed) just before and after the least variance block
                const annotations = {};
                if (idxStartLeast > 0) {
                  annotations.leastStart = {
                    type: 'line',
                    xMin: idxStartLeast - 0.5,
                    xMax: idxStartLeast - 0.5,
                    borderColor: '#000',
                    borderWidth: 2,
                    borderDash: [6, 6],
                  };
                }
                if (idxEndLeast >= 0 && idxEndLeast < labels.length - 1) {
                  annotations.leastEnd = {
                    type: 'line',
                    xMin: idxEndLeast + 0.5,
                    xMax: idxEndLeast + 0.5,
                    borderColor: '#000',
                    borderWidth: 2,
                    borderDash: [6, 6],
                  };
                }

                // Split bars into three datasets for legend
                const increaseBars = bars.map((b) => {
                  const delta = b[1] - b[0];
                  return delta > 5 ? b : null;
                });
                const leastBars = bars.map((b) => {
                  const delta = b[1] - b[0];
                  return delta >= -5 && delta <= 5 ? b : null;
                });
                const decreaseBars = bars.map((b) => {
                  const delta = b[1] - b[0];
                  return delta < -5 ? b : null;
                });

                const wfData = {
                  labels,
                  datasets: [
                    {
                      label: 'Increase',
                      data: increaseBars,
                      backgroundColor: '#3182ce',
                      borderSkipped: false,
                    },
                    {
                      label: 'Least variance',
                      data: leastBars,
                      backgroundColor: '#38A169',
                      borderSkipped: false,
                    },
                    {
                      label: 'Decrease',
                      data: decreaseBars,
                      backgroundColor: '#dd6b20',
                      borderSkipped: false,
                    },
                  ],
                };

                const wfOptions = {
                  responsive: true,
                  plugins: {
                    legend: {position: 'top'},
                    tooltip: {
                      callbacks: {
                        label: (ctx) => {
                          const raw = ctx.raw;
                          if (Array.isArray(raw)) {
                            const delta = raw[1] - raw[0];
                            const end = raw[1];
                            const sign = delta > 0 ? '+' : '';
                            return `Δ: ${sign}${delta.toFixed(2)}% (total: ${end.toFixed(2)}%)`;
                          }
                          return '';
                        },
                      },
                    },
                    annotation: {annotations},
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {callback: (v) => `${v}%`},
                    },
                    x: {ticks: {autoSkip: false, maxRotation: 60, minRotation: 0}},
                  },
                  parsing: true, // allow [start,end] arrays
                };

                return <Bar ref={varianceChartRef} data={wfData} options={wfOptions} />;
              })()}
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};


SATVariance.propTypes = {
  cycle: PropTypes.object
};

export default SATVariance;
