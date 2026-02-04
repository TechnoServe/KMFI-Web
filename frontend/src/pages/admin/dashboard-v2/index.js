import React, {Suspense, lazy, useEffect, useState, useMemo} from 'react';
import {
  Box,
  Flex,
  VStack,
  Button,
  Spinner,
  Select,
  IconButton,
  HStack
} from '@chakra-ui/react';

import {
  ChevronLeftIcon,
  ViewOffIcon,
  ViewIcon,
  StarIcon,
  EditIcon,
  CheckCircleIcon,
  SettingsIcon,
  ExternalLinkIcon,
  TimeIcon,
} from '@chakra-ui/icons';

import {FaTools} from 'react-icons/fa';
import {request} from 'common';

const Awards = lazy(() => import('./panels/Awards'));
const Summary = lazy(() => import('./panels/Summary'));
const SATScores = lazy(() => import('./panels/SATScores'));
const SATVariance = lazy(() => import('./panels/SATVariance'));
const ProductTesting = lazy(() => import('./panels/ProductTesting'));
const IEGResults = lazy(() => import('./panels/IEGResults'));
const Triangulation = lazy(() => import('./panels/Triangulation'));
const Reports = lazy(() => import('./panels/CompanyReports'));
const Settings = lazy(() => import('./panels/Settings'));

const panelMap = (cycle) => ({
  'Awards': <Awards key={`awards-${cycle?.id || 'none'}`} cycle={cycle} />,
  'Summary Dashboard': <Summary key={`summarydashboard-${cycle?.id || 'none'}`} cycle={cycle} />,
  'SAT Scores': <SATScores key={`satcores-${cycle?.id || 'none'}`} cycle={cycle} />,
  'SAT Variance': <SATVariance key={`satvariance-${cycle?.id || 'none'}`} cycle={cycle} />,
  'Product Testing Scores': <ProductTesting key={`producttestingscores-${cycle?.id || 'none'}`} cycle={cycle} />,
  'IEG Results': <IEGResults key={`iegresults-${cycle?.id || 'none'}`} cycle={cycle} />,
  'Triangulation': <Triangulation key={`triangulation-${cycle?.id || 'none'}`} cycle={cycle} />,
  'Company Reports': <Reports key={`companyreports-${cycle?.id || 'none'}`} cycle={cycle} />,
  'Settings': <Settings key={`settings-${cycle?.id || 'none'}`} cycle={cycle} />,
});

const sidebarItems = [
  {label: 'Awards', icon: StarIcon},
  {label: 'Summary Dashboard', icon: ViewIcon},
  {label: 'SAT Scores', icon: EditIcon},
  {label: 'SAT Variance', icon: ChevronLeftIcon},
  {label: 'Product Testing Scores', icon: CheckCircleIcon},
  {label: 'IEG Results', icon: ExternalLinkIcon},
  {label: 'Triangulation', icon: FaTools},
  {label: 'Company Reports', icon: TimeIcon},
  {label: 'Settings', icon: SettingsIcon},
];

const DashboardV2 = () => {
  const [activePanel, setActivePanel] = React.useState('Awards');
  const [showSidebar, setShowSidebar] = React.useState(false);
  const [cycles, setCycles] = useState([]);
  const [cycle, setCycle] = useState(null);
  const [loadingCycles, setLoadingCycles] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchCycles = async () => {
      setLoadingCycles(true);
      try {
        const res = await request(true).get('/admin/cycles');
        const sorted = res.data.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
        if (!isMounted) return;
        setCycles(sorted);
        const activeCycle = sorted.find((c) => c.active);
        if (activeCycle) setCycle(activeCycle);
        else if (sorted.length > 0) setCycle(sorted[0]);
      } catch (err) {
        console.error('Failed to load cycles:', err);
      } finally {
        if (isMounted) setLoadingCycles(false);
      }
    };
    fetchCycles();
    return () => {
      isMounted = false;
    };
  }, []);

  const panels = useMemo(() => panelMap(cycle), [cycle]);

  return (
    <Flex height="100vh">
      <Box flex="1" p={4} overflow="auto">
        <Flex justify="flex-end" p={4}>
          <HStack>
            <Select
              width="250px"
              value={cycle?.name || ''}
              placeholder={loadingCycles ? 'Loading cycles…' : 'Select cycle'}
              isDisabled={loadingCycles || cycles.length === 0}
              onChange={(e) => {
                const selected = cycles.find((c) => c.name === e.target.value);
                setCycle(selected || null);
              }}
            >
              {cycles.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </Select>
            {loadingCycles && <Spinner size="sm" ml={2} />}
          </HStack>
        </Flex>
        <Suspense fallback={<Spinner size="xl" />}>
          {panels[activePanel]}
        </Suspense>
      </Box>
      <Box
        width={showSidebar ? '260px' : '70px'}
        p={4}
        bg="gray.800"
        color="white"
        boxShadow="md"
        transition="width 0.3s"
      >
        <VStack spacing={4} align="start">
          <IconButton
            icon={showSidebar ? <ViewOffIcon /> : <ViewIcon />}
            aria-label="Toggle Sidebar"
            onClick={() => setShowSidebar(!showSidebar)}
            variant="ghost"
            alignSelf="start"
          />
          {sidebarItems.map(({label, icon: Icon}) => (
            <Button
              key={label}
              leftIcon={<Icon />}
              onClick={() => setActivePanel(label)}
              variant="ghost"
              justifyContent={showSidebar ? 'flex-start' : 'center'}
              width="100%"
              fontWeight={activePanel === label ? 'bold' : 'normal'}
            >
              {showSidebar && label}
            </Button>
          ))}
        </VStack>
      </Box>
    </Flex>
  );
};

export default DashboardV2;
