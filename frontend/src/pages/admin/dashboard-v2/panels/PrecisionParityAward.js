import React, {useEffect, useState, useMemo} from 'react';
import PropTypes from 'prop-types';
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  CheckboxGroup,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
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
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from '@chakra-ui/react';

import {request} from 'common';

const PrecisionParityAward = ({cycle}) => {
  const [rows, setRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]); // empty = all
  const [companySearch, setCompanySearch] = useState('');
  const [allCompanies, setAllCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [minVariance, setMinVariance] = useState(5);
  const [sortConfig, setSortConfig] = useState({key: 'variance2', direction: 'asc'});

  // Added states and variables for size filter
  const [selectedSizes, setSelectedSizes] = useState([]);
  const eligibleCompanies = useMemo(() => {
    return Array.from(new Set(
      allRows
        .filter((x) => x.variance2 != null && Math.abs(x.variance2) <= minVariance && !(x.selfScore === 0 && x.validatedScore === 0))
        .map((x) => (x && x.company != null ? String(x.company) : ''))
        .filter(Boolean)
    ));
  }, [allRows, minVariance]);

  const eligibleSizes = useMemo(() => {
    return Array.from(new Set(
      allRows
        .filter((x) => x.variance2 != null && Math.abs(x.variance2) <= minVariance && !(x.selfScore === 0 && x.validatedScore === 0))
        .map((x) => x.size)
        .filter(Boolean)
    ));
  }, [allRows, minVariance]);

  const filteredSizeList = useMemo(() => eligibleSizes.sort(), [eligibleSizes]);

  useEffect(() => {
    const arr = Array.from(eligibleCompanies || []).map((n) => String(n));
    let sorted = [];
    try {
      sorted = arr.sort((a, b) => a.localeCompare(b));
    } catch (e) {
      sorted = arr.sort();
    }
    setAllCompanies(sorted);
    setSelectedCompanies((prev) => prev.filter((name) => sorted.includes(String(name))));
  }, [eligibleCompanies]);

  useEffect(() => {
    if (selectedSizes.length && !eligibleSizes.includes(selectedSizes[0])) {
      setSelectedSizes([]);
    }
  }, [eligibleSizes, selectedSizes]);

  useEffect(() => {
    const filtered = allRows
      .filter((x) =>
        x.variance2 != null &&
        Math.abs(x.variance2) <= minVariance &&
        !(x.selfScore === 0 && x.validatedScore === 0)
      )
      .filter((x) => selectedCompanies.length === 0 ? true : selectedCompanies.includes(x.company))
      .filter((x) => selectedSizes.length === 0 ? true : selectedSizes.includes(x.size));
    setRows(filtered);
  }, [allRows, minVariance, selectedCompanies, selectedSizes]);

  const keyStats = React.useMemo(() => {
    const n = rows.length;
    if (!n) {
      return {
        count: 0,
        avgSelf: 0,
        avgValidated: 0,
        avgVariancePtsAbs: 0,
        avgVariance2Abs: 0,
        minVariance2Abs: 0,
        maxVariance2Abs: 0,
      };
    }
    const sum = (arr) => arr.reduce((s, x) => s + x, 0);
    const selfList = rows.map((r) => Number(r.selfScore) || 0);
    const valList = rows.map((r) => Number(r.validatedScore) || 0);
    const varPtsAbsList = rows.map((r) => Math.abs(Number(r.variance) || 0));
    const var2AbsList = rows.map((r) => Math.abs(Number(r.variance2) || 0));
    const avg = (arr) => Math.round(sum(arr) / n);
    return {
      count: n,
      avgSelf: avg(selfList),
      avgValidated: avg(valList),
      avgVariancePtsAbs: avg(varPtsAbsList),
      avgVariance2Abs: avg(var2AbsList),
      minVariance2Abs: Math.round(Math.min(...var2AbsList)),
      maxVariance2Abs: Math.round(Math.max(...var2AbsList)),
    };
  }, [rows]);

  useEffect(() => {
    const load = async () => {
      if (!cycle) return;
      try {
        setLoading(true);
        setError('');
        const response = await request(true).get('/admin/sat-variance', {
          params: {'cycle-id': typeof cycle === 'string' ? cycle : cycle?.id}
        });
        const raw = Array.isArray(response?.data) ? response.data : [];
        const norm = raw.map((r) => {
          const selfScore = Number(r.selfScore ?? r.sat ?? r.self_assessment ?? 0);
          const validatedScore = Number(r.validatedScore ?? r.ivc ?? r.validated ?? 0);
          const variancePts = Number(r.variance ?? (validatedScore - selfScore));
          return {
            id: r.company_id,
            company: r.company_name ?? r.name,
            tier: r.tier ?? null,
            size: r.company_size ?? r.size ?? null,
            selfScore,
            validatedScore,
            variance: variancePts,
            variance2: r.variance2 != null ? Number(r.variance2) : null,
          };
        });
        setAllRows(norm);
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [cycle]);

  const filteredCompanyList = useMemo(() => {
    const q = companySearch.trim().toLowerCase();
    const list = allCompanies || [];
    if (!q) return list;
    return list.filter((name) => String(name).toLowerCase().includes(q));
  }, [allCompanies, companySearch]);

  // Memoized rank map by absolute variance2 ascending
  const variance2RankMap = useMemo(() => {
    if (!rows?.length) return new Map();
    const sortedByVar2 = [...rows]
      .filter((r) => r.variance2 != null)
      .sort((a, b) => {
        const av = Math.abs(Number(a.variance2));
        const bv = Math.abs(Number(b.variance2));
        if (av < bv) return -1;
        if (av > bv) return 1;
        // stable tie-breaker to keep determinism
        return String(a.company || '').localeCompare(String(b.company || ''));
      });
    const map = new Map();
    sortedByVar2.forEach((r, i) => {
      const key = r.id || r.company;
      if (!map.has(key)) map.set(key, i + 1);
    });
    return map;
  }, [rows]);

  // Chakra color mode values for info block
  const infoBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box>
      {/* Award Description */}
      <Box mb={4} p={3} borderWidth="1px" borderColor={borderColor} borderRadius="md" bg={infoBg}>
        <Text fontSize="sm" mb={2}>
          <b>Precision Parity Award.</b> Recognizes companies whose self-assessed SAT scores closely match their validated IVC scores.
        </Text>
        <Text fontSize="sm" mb={1}>
          • <b>Eligibility</b>: Absolute Variance 2 (|%|) ≤ <b>{minVariance}%</b>, and SAT/IVC are not both zero.
        </Text>
        <Text fontSize="sm" mb={1}>
          • <b>Ranking</b>: Sorted by the smallest absolute Variance 2 (|%|). Ties break by company name.
        </Text>
        <Text fontSize="sm">
          • Use the filters to narrow by <b>company</b> and <b>size</b>, adjust the <b>Min Variance (%)</b> threshold, and export the current view as CSV.
        </Text>
      </Box>
      {/* Key Stats (reactive to current filters) */}
      <SimpleGrid columns={{base: 1, md: 3, lg: 6}} spacing={3} mb={4}>
        <Stat p={3} borderWidth="1px" borderRadius="md">
          <StatLabel>Companies</StatLabel>
          <StatNumber>{keyStats.count}</StatNumber>
          <StatHelpText>after filters</StatHelpText>
        </Stat>
        <Stat p={3} borderWidth="1px" borderRadius="md">
          <StatLabel>Avg Self Score</StatLabel>
          <StatNumber>{keyStats.avgSelf}%</StatNumber>
          <StatHelpText>mean of SAT</StatHelpText>
        </Stat>
        <Stat p={3} borderWidth="1px" borderRadius="md">
          <StatLabel>Avg Validated</StatLabel>
          <StatNumber>{keyStats.avgValidated}%</StatNumber>
          <StatHelpText>mean of IVC</StatHelpText>
        </Stat>
        <Stat p={3} borderWidth="1px" borderRadius="md">
          <StatLabel>Avg Var (pts, |Δ|)</StatLabel>
          <StatNumber>{keyStats.avgVariancePtsAbs}</StatNumber>
          <StatHelpText>absolute difference</StatHelpText>
        </Stat>
        <Stat p={3} borderWidth="1px" borderRadius="md">
          <StatLabel>Avg Var2 (|%|)</StatLabel>
          <StatNumber>{keyStats.avgVariance2Abs}%</StatNumber>
          <StatHelpText>absolute % gap</StatHelpText>
        </Stat>
        <Stat p={3} borderWidth="1px" borderRadius="md">
          <StatLabel>Range Var2 (|%|)</StatLabel>
          <StatNumber>{keyStats.minVariance2Abs}% – {keyStats.maxVariance2Abs}%</StatNumber>
          <StatHelpText>min to max</StatHelpText>
        </Stat>
      </SimpleGrid>
      <Flex wrap="wrap" align="flex-end" gap={4} mb={4}>
        <FormControl w="220px" mr={2}>
          <FormLabel fontSize="sm" mb={1}>Min Variance (%)</FormLabel>
          <NumberInput min={0} max={20} step={1} value={minVariance} onChange={(val)=>setMinVariance(Number(val))} size='sm'>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl w="220px" mr={2}>
          <FormLabel fontSize="sm" mb={1}>Size</FormLabel>
          <Select
            size="sm"
            value={selectedSizes[0] || ''}
            onChange={(e) => setSelectedSizes(e.target.value ? [e.target.value] : [])}
          >
            <option value="">All sizes</option>
            {filteredSizeList.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </FormControl>

        <FormControl w="320px">
          <FormLabel fontSize="sm" mb={1}>Companies</FormLabel>
          <Popover placement="bottom-start" closeOnBlur isLazy={false}>
            {({onClose}) => (
              <>
                <PopoverTrigger>
                  <Button size="sm" variant="outline" w="full">
                    {selectedCompanies.length === 0 ? 'All companies' : `${selectedCompanies.length} selected`}
                  </Button>
                </PopoverTrigger>
                <Portal>
                  <PopoverContent w="320px" zIndex={1500}>
                    <PopoverHeader fontWeight="semibold">Filter Companies</PopoverHeader>
                    <PopoverBody>
                      <Input
                        size="sm"
                        placeholder="Type to search…"
                        value={companySearch}
                        onChange={(e)=>setCompanySearch(e.target.value)}
                        mb={2}
                      />
                      <Divider />
                      <HStack spacing={2} justify="space-between">
                        <Button variant='ghost' size='sm' onClick={() => setSelectedCompanies(allCompanies)}>Select all</Button>
                        <Button variant='ghost' size='sm' onClick={() => setSelectedCompanies([])}>Clear</Button>
                      </HStack>
                      <Box maxH="220px" overflowY="auto" pr={1}>
                        <CheckboxGroup value={selectedCompanies} onChange={(vals)=>setSelectedCompanies(vals)}>
                          {filteredCompanyList.map((name) => (
                            <Box key={name} py={1}>
                              <Checkbox value={name}>{name}</Checkbox>
                            </Box>
                          ))}
                        </CheckboxGroup>
                        {filteredCompanyList.length === 0 && (
                          <Text fontSize="sm" color="gray.500">No matches</Text>
                        )}
                      </Box>
                    </PopoverBody>
                    <PopoverFooter display="flex" justifyContent="space-between" alignItems="center">
                      <Button size="sm" colorScheme="blue" onClick={onClose}>Done</Button>
                    </PopoverFooter>
                  </PopoverContent>
                </Portal>
              </>
            )}
          </Popover>
        </FormControl>

        <Button ml="auto" alignSelf="flex-end" size="sm" colorScheme="blue" onClick={() => {
          if (!rows.length) return;
          const headers = ['Company', 'Self Assessment Scores(%)', 'Validated Scores (%)', 'Variance', 'Variance 2'];
          const sortedRows = [...rows].sort((a, b) => {
            const {key, direction} = sortConfig;
            const aVal = a[key] ?? 0;
            const bVal = b[key] ?? 0;
            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
          });
          const csv = [headers.join(',')]
            .concat(sortedRows.map((r) => [
              r.company,
              `${Math.round(r.selfScore)}%`,
              `${Math.round(r.validatedScore)}%`,
              r.variance == null ? '—' : `${Math.round(r.variance)}%`,
              r.variance2 == null ? '—' : `${Math.round(r.variance2)}%`,
            ]
              .map((val) => '"' + String(val).replace(/"/g, '""') + '"')
              .join(',')))
            .join('\n');
          const blob = new Blob([csv], {type: 'text/csv'});
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'precision_parity_award.csv';
          a.click();
          URL.revokeObjectURL(url);
        }}>Export CSV</Button>
      </Flex>

      <Table variant="simple" size="md">
        <Thead>
          <Tr>
            <Th>Rank</Th>
            <Th cursor="pointer" onClick={() => setSortConfig({key: 'company', direction: sortConfig.key==='company'&&sortConfig.direction==='asc'?'desc':'asc'})}>
              Company {sortConfig.key==='company' ? (sortConfig.direction==='asc'?'▲':'▼'):''}
            </Th>
            <Th cursor="pointer" onClick={() => setSortConfig({key: 'size', direction: sortConfig.key==='size'&&sortConfig.direction==='asc'?'desc':'asc'})}>
              Size {sortConfig.key==='size' ? (sortConfig.direction==='asc'?'▲':'▼'):''}
            </Th>
            <Th cursor="pointer" onClick={() => setSortConfig({key: 'selfScore', direction: sortConfig.key==='selfScore'&&sortConfig.direction==='asc'?'desc':'asc'})}>
              SAT Scores (%) {sortConfig.key==='selfScore' ? (sortConfig.direction==='asc'?'▲':'▼'):''}
            </Th>
            <Th cursor="pointer" onClick={() => setSortConfig({key: 'validatedScore', direction: sortConfig.key==='validatedScore'&&sortConfig.direction==='asc'?'desc':'asc'})}>
              IVC Scores (%) {sortConfig.key==='validatedScore' ? (sortConfig.direction==='asc'?'▲':'▼'):''}
            </Th>
            {/* Removed Variance (pts) header */}
            <Th cursor="pointer" onClick={() => setSortConfig({key: 'variance', direction: sortConfig.key==='variance'&&sortConfig.direction==='asc'?'desc':'asc'})}>
              Variance {sortConfig.key==='variance' ? (sortConfig.direction==='asc'?'▲':'▼'):''}
            </Th>
            <Th cursor="pointer" onClick={() => setSortConfig({key: 'variance2', direction: sortConfig.key==='variance2'&&sortConfig.direction==='asc'?'desc':'asc'})}>
              Variance 2 {sortConfig.key==='variance2' ? (sortConfig.direction==='asc'?'▲':'▼'):''}
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {loading && (
            <Tr>
              <Td colSpan={7}>Loading…</Td>
            </Tr>
          )}
          {error && (
            <Tr>
              <Td colSpan={7} style={{color: 'red'}}>{error}</Td>
            </Tr>
          )}
          {!loading && !error && [...rows].sort((a, b)=>{
            const {key, direction}=sortConfig; const aVal=a[key]??0; const bVal=b[key]??0;
            if (aVal<bVal) return direction==='asc'?-1:1;
            if (aVal>bVal) return direction==='asc'?1:-1;
            return 0;
          }).map((row, idx) => (
            <Tr key={row.id || idx}>
              <Td>{variance2RankMap.get(row.id || row.company) || '—'}</Td>
              <Td>{row.company}</Td>
              <Td>{row.size || '—'}</Td>
              <Td>{Math.round(row.selfScore)}%</Td>
              <Td>{Math.round(row.validatedScore)}%</Td>
              {/* Removed variancePts cell */}
              <Td>{row.variance == null ? '—' : Math.round(row.variance)}%</Td>
              <Td>{row.variance2 == null ? '—' : Math.round(row.variance2)}%</Td>
            </Tr>
          ))}
          {!loading && !error && rows.length === 0 && (
            <Tr>
              <Td colSpan={7}>No data</Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </Box>
  );
};

PrecisionParityAward.propTypes = {
  // Accept either a cycle string or an object with an id field
  cycle: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({id: PropTypes.string}),
  ]),
};

export default PrecisionParityAward;
