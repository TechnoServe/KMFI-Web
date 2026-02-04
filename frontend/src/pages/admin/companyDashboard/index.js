/* eslint-disable react/prop-types */
import React, {useState, useEffect, useRef} from 'react';
import {Bar, Line} from 'react-chartjs-2';
import ReactToPrint from 'react-to-print';
import {PieChart, Pie, Cell, Sector} from 'recharts';
import {Flex, Text, useToast, Spinner} from '@chakra-ui/react';
import AssessmentChart1 from './component/assessment-chart-1';
import ProgressChart from './component/progress-chart';
import {useSelector} from 'react-redux';
import {request} from 'common';
import {nanoid} from '@reduxjs/toolkit';
import propTypes from 'prop-types';

import {Modal} from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';

/**
 * CompanyDashboard component renders the dashboard UI for an individual company
 * within a selected cycle. It fetches and visualizes data from SAT, IVC, IEG,
 * and product testing modules and supports Tier 3 upgrade.
 *
 * @param {Object} props - Component props
 * @param {Object} props.cycle - The selected cycle data
 * @param {Object} props.company - The company data object
 * @returns {JSX.Element} Rendered company dashboard view
 */
const CompanyDashboard = ({cycle, company}) => {
  // Modal open/close state for Tier 3 upgrade
  const [open, setOpen] = useState(false);
  const onOpenModal = () => setOpen(true);
  const onCloseModal = () => setOpen(false);

  // State for upgrade process, company tier, and details
  const [upgrading, setUpgrading] = useState(null);
  const [companyTier, setCompanyTier] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);

  const toast = useToast();
  // Loading state for initial dashboard data
  const [loading, setLoading] = useState(true);
  // SAT scores
  const [scores, setScores] = useState([]);
  const [previousScores, setPreviousScores] = useState([]);
  // SAT, IVC, IEG, PT data and respective scores
  const [satData, setSATData] = useState([]);
  const [companySATScores, setCompanySATScores] = useState([]);
  const [satTotalScore, setSATTotalScore] = useState(0);
  const [ivcData, setIVCData] = useState([]);
  const [companyIVCScores, setCompanyIVCScores] = useState([]);
  const [ivcTotalScore, setIVCTotalScore] = useState(0);
  const [iegData, setIEGData] = useState([]);
  const [companyIEGScores, setCompanyIEGScores] = useState([]);
  const [iegTotalScore, setIEGTotalScore] = useState(0);
  const [ptData, setPTData] = useState([]);
  const [ptDataPrevious, setPTDataPrevious] = useState([]);
  const [ptTotalScore, setPTTotalScore] = useState(0);
  // Product test data for chart rendering
  const [productTestData, setProductTestData] = useState([]);
  // Overall weighted score for dashboard
  const [overallWeightedScore, setOverallWeightedScore] = useState(0);
  // Brand details and selections
  const [companyBrandDetails, setCompanyBrandDetails] = useState([]);
  const [productTestingChart, setProductTestingChart] = useState();
  // Aflatoxin state and chart data
  const [aflatoxin, setAflatoxin] = useState(false);
  const [aflatoxinData, setAflatoxinData] = useState([
    {name: 'Group B', value: 0, color: '#04B279'},
    {name: 'Group A', value: 100 - 0, color: '#f8f8fa'},
  ]);
  // Overview chart data
  const [overviewData, setOverviewData] = useState([
    {name: 'Group B', value: 0, color: '#04B279'},
    {name: 'Group A', value: 100 - 0, color: '#f8f8fa'},
  ]);
  // Average overview chart data
  const [averageOverviewData, setAverageOverviewData] = useState([
    {name: 'Group B', value: 0, color: '#04B279'},
    {name: 'Group A', value: 100 - 0, color: '#f8f8fa'},
  ]);
  // Brand dropdown selection and name
  const [brandDropDown, setBrand] = useState();
  const [brandName, setBrandName] = useState('');
  // Redux user and ref for printing
  const user = useSelector((state) => state.auth.user);
  const componentRef = useRef();
  // Pie chart active index
  const [activeIndex] = useState(0);

  /**
   * Fetches and sets the current company's details including its tier.
   * @returns {Promise<void>}
   */
  const getCompanyDetails = async () => {
    try {
      const {data: res} = await request(true).get(
        `/company/details/?company-id=${company.id}`
      );
      setCompanyTier(res.company.tier);
      setCompanyDetails(res.company);
    } catch (error) {
    }
  };
  // console.log('company details ', getCompanyDetails);

  /**
   * Handles upgrading the company to Tier 3 and shows a toast on success.
   * @returns {Promise<void>}
   */
  const upgrade = async () => {
    setUpgrading(true);
    try {
      await request(true).post(`/company/set-tier`, {
        'tier': 'TIER_3',
        'company-id': company.id,
      });
      setUpgrading(false);
      setCompanyTier('TIER_3');
      onCloseModal();
      return toast({
        status: 'success',
        title: 'You have upgraded!',
        position: 'top-right',
        description: 'Check your Self Assessment Tool for new requirements',
        duration: 6000,
        isClosable: true,
      });
    } catch (error) {
      setUpgrading(false);
    }
  };

  /**
   * Retrieves current and previous SAT scores for the company.
   * @returns {Promise<void>}
   */
  const getTestScores = async () => {
    try {
      const {
        data: {data: res},
      } = await request(true).get(`/sat/scores?company-id=${company.id}&cycle-id=${cycle.id}&previous-id=${cycle.previous_id}`);
      setScores(res.current.sort((a, b) => a.sort_order - b.sort_order));
      setPreviousScores(res.previous.sort((a, b) => a.sort_order - b.sort_order));
      // setLoading(false); // handled centrally
    } catch (error) {
      // setLoading(false); // handled centrally
    }
  };

  /**
   * Retrieves SAT aggregation scores and updates SAT and IVC data states.
   * @returns {Promise<void>}
   */
  const getSATScores = async () => {
    try {
      const res = await request(true).get(`companies/${company.id}/${cycle.id}/aggs`);
      if (res.status === 200) {
        // console.log('SATScores', res);
        if (res.data) {
          setSATData([res.data]);
          setIVCData([res.data]);
        }
      } else {
        setSATData([]);
        setIVCData([]);
      }
    } catch (error) {
      console.log('SATScoresError', error);
      // setLoading(false); // handled centrally
      return toast({
        status: 'error',
        title: 'Error',
        position: 'top-right',
        description: 'Error getting SAT scores',
        duration: 6000,
        isClosable: true,
      });
    }
  };

  /**
   * Fetches Industry Expert Group (IEG) scores for the company.
   * @returns {Promise<void>}
   */
  const getIEGScores = async () => {
    try {
      const {
        data: {data: res},
      } = await request(true).get(
        `/company/ieg?cycle-id=${cycle.id}&company-id=${company.id}`
      );

      setIEGData(res);
    } catch (error) {
      // setLoading(false); // handled centrally
    }
  };

  /**
   * Fetches Product Testing (PT) scores including current and previous data.
   * @returns {Promise<void>}
   */
  const getPTScores = async () => {
    try {
      const {
        data: res,
      } = await request(true).get(`companies/${company.id}/products-tests-v2?cycle-id=${cycle.id}&previous-id=${cycle.previous_id}`);
      console.log('PTScores', res);
      setPTData(res.current);
      setPTDataPrevious(res.previous);
    } catch (error) {
      console.log('PTScoresError', error);
      // setLoading(false); // handled centrally
      return toast({
        status: 'error',
        title: 'Error',
        position: 'top-right',
        description: 'Error getting PT scores',
        duration: 6000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        await Promise.allSettled([
          getCompanyDetails(),
          getTestScores(),
          getSATScores(),
          getIEGScores(),
          getPTScores(),
        ]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [company?.id, cycle?.id]);

  useEffect(() => {
    // Updates dashboard charts and state when SAT, IEG, IVC, PT data or scores change
    const filteredCompanyBrand =
      satData.length > 0
        ? satData.filter((item) => {
          return item.id === company.id;
        })
        : [];

    setCompanyBrandDetails(filteredCompanyBrand);

    // Don’t clobber user selection; default to first brand only if none selected yet
    const brandsArr = filteredCompanyBrand[0]?.brands || [];
    const currentBrandId = brandDropDown || brandsArr[0]?.id;
    if (!brandDropDown && currentBrandId) {
      setBrand(currentBrandId);
    }

    // Pick the selected brand object
    const selectedBrandObj = brandsArr.find((b) => b.id === currentBrandId) || brandsArr[0];
    setBrandName(selectedBrandObj?.name || '');

    // Use the newest PT entry for the selected brand
    const firstPT = selectedBrandObj?.productTests?.[0];
    if (selectedBrandObj?.productType?.aflatoxin) {
      const overallKMFIWeightedScore = firstPT?.fortification?.overallKMFIWeightedScore;
      setProductTestingChart(overallKMFIWeightedScore);
    } else {
      setProductTestingChart(firstPT?.fortification?.score);
    }
    const satScoresArr = [];
    const satTotalScoreArr = [];
    if (filteredCompanyBrand.length > 0 && filteredCompanyBrand[0].satScores.length > 0) {
      filteredCompanyBrand[0].satScores.forEach((categoryObj) => {
        switch (categoryObj?.name) {
          case 'People Management Systems':
            satScoresArr[0] = (categoryObj.score / 15) * 100;
            satTotalScoreArr[0] = categoryObj.score;
            break;
          case 'Production, Continuous Impovement & Innovation':
            satScoresArr[1] = (categoryObj.score / 25) * 100;
            satTotalScoreArr[1] = categoryObj.score;
            break;
          case 'Procurement & Inputs Management':
            satScoresArr[2] = (categoryObj.score / 25) * 100;
            satTotalScoreArr[2] = categoryObj.score;
            break;
          case 'Public Engagement':
            satScoresArr[3] = (categoryObj.score / 10) * 100;
            satTotalScoreArr[3] = categoryObj.score;
            break;
          case 'Governance & Leadership Culture':
            satScoresArr[4] = (categoryObj.score / 25) * 100;
            satTotalScoreArr[4] = (categoryObj.score);
            break;
        }
      });
    }

    if (satTotalScoreArr.length > 0) {
      setSATTotalScore(satTotalScoreArr.reduce((prevIter, item) => prevIter + item));
    }

    // Product Test
    if (filteredCompanyBrand.length > 0 && filteredCompanyBrand[0].brands.length > 0) {
      const brands = filteredCompanyBrand[0].brands;
      const selected = brands.find((b) => b.id === currentBrandId) || brands[0];

      setAflatoxin(selected?.productType?.aflatoxin);
      setProductTestData(selected?.productTests || []);

      const aflaScore = selected?.productTests?.[0]?.aflatoxinScore;
      if (typeof aflaScore === 'number') {
        setAflatoxinData([
          {name: 'Group B', value: aflaScore, color: '#04B279'},
          {name: 'Group A', value: 100 - aflaScore, color: '#f8f8fa'},
        ]);
      }
      if (selected?.productTests?.length > 0) {
        const baseScore = selected?.productTests?.[0]?.fortification?.score;
        const weighted = selected?.productType?.aflatoxin
          ? selected?.productTests?.[0]?.fortification?.overallKMFIWeightedScore
          : baseScore;
        setPTTotalScore(weighted ?? 0);
      }
    }
    const iegScoresArr = [];
    const iegTotalScoreArr = [];
    if (iegData?.length > 0) {
      iegData?.forEach((item) => {
        switch (item.category.name) {
          case 'People Management Systems':
            iegScoresArr[0] = (item.value?.toFixed() / 15) * 100;
            iegTotalScoreArr[0] = parseInt(item.value);
            break;
          case 'Production, Continuous Impovement & Innovation':
            iegScoresArr[1] = (item.value?.toFixed() / 25) * 100;
            iegTotalScoreArr[1] = parseInt(item.value);
            break;
          case 'Procurement & Inputs Management':
            iegScoresArr[2] = (item.value?.toFixed() / 25) * 100;
            iegTotalScoreArr[2] = parseInt(item.value);
            break;
          case 'Public Engagement':
            iegScoresArr[3] = (item.value?.toFixed() / 10) * 100;
            iegTotalScoreArr[3] = parseInt(item.value);
            break;
          case 'Governance & Leadership Culture':
            iegScoresArr[4] = (item.value?.toFixed() / 25) * 100;
            iegTotalScoreArr[4] = parseInt(item.value);
            break;
        }
      });
    }


    if (iegTotalScoreArr.length > 0) {
      setIEGTotalScore(iegTotalScoreArr.reduce((prevIter, item) => prevIter + item));
    }


    const newIVCData = filteredCompanyBrand[0]?.ivcScores;
    const ivcScoresArr = [];
    const ivcTotalScoreArr = [];
    if (newIVCData?.length > 0) {
      newIVCData?.forEach((item) => {
        switch (item?.name) {
          case 'People Management Systems':
            ivcScoresArr[0] = (item.score / 15) * 100;
            ivcTotalScoreArr[0] = item.score;
            break;
          case 'Production, Continuous Impovement & Innovation':
            ivcScoresArr[1] = (item.score / 25) * 100;
            ivcTotalScoreArr[1] = item.score;
            break;
          case 'Procurement & Inputs Management':
            ivcScoresArr[2] = (item.score / 25) * 100;
            ivcTotalScoreArr[2] = item.score;
            break;
          case 'Public Engagement':
            ivcScoresArr[3] = (item.score / 10) * 100;
            ivcTotalScoreArr[3] = item.score;
            break;
          case 'Governance & Leadership Culture':
            ivcScoresArr[4] = (item.score / 25) * 100;
            ivcTotalScoreArr[4] = item.score;
            break;
        }
      });
    }


    if (ivcTotalScoreArr.length > 0) {
      setIVCTotalScore(ivcTotalScoreArr.reduce((prevIter, item) => prevIter + item));
    }

    setCompanySATScores(satScoresArr);
    setCompanyIEGScores(iegScoresArr);
    setCompanyIVCScores(ivcScoresArr);

    // Brands SAT Charts
    const selfAssessmentBrand = filteredCompanyBrand?.filter((brand) => brand.brands.find((x) => x.id === brandDropDown));
    // Tier One Breakdown
    const tierOneSABrand = selfAssessmentBrand?.filter((x) => x?.tier?.includes('TIER_1'));
    console.log('tierOneSABrand', tierOneSABrand);
    const tierOneSatBrand = tierOneSABrand?.filter((x) => x.tier?.includes('TIER_1')).map((x) => x.ivcScores?.map((x) => x?.score).reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }));
    const percentageTierOneSatBrand = tierOneSatBrand;

    const tierOneSatBrandTotal = percentageTierOneSatBrand?.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0);

    // Tier Three Breakdown
    const tierThreeSABrand = selfAssessmentBrand?.filter((x) => x?.tier?.includes('TIER_3'));
    const tierThreeSatBrandCul = tierThreeSABrand?.filter((x) => x.tier?.includes('TIER_3')).map((x) => x.ivcScores?.map((x) => x?.score).reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0));

    const tierThreeSatBrandTotal = tierThreeSatBrandCul?.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0);

    let SABrandsTierOne = 0;
    let SABrandsTierThree = 0;
    // const SABrands = 0;
    if ((selfAssessmentBrand?.map((x) => x.tier === 'TIER_1'))) {
      SABrandsTierOne = tierOneSatBrandTotal.toFixed();
    }
    if ((selfAssessmentBrand?.map((x) => x.tier === 'TIER_3'))) {
      SABrandsTierThree = tierThreeSatBrandTotal.toFixed();
    }

    // Brands IEG Charts
    const industryExpertGroupBrand = filteredCompanyBrand?.filter((brand) => brand.brands.find((x) => x.id === brandDropDown));

    const culIndustryExpertBrand = industryExpertGroupBrand?.map((x) => x.iegScores?.map((x) => x.value).reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0));

    const totalIndustryExpertGroupBrand = culIndustryExpertBrand?.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0);
    let IEGBrands = [];
    IEGBrands = totalIndustryExpertGroupBrand?.toFixed();


    // Brands PT Charts
    const productTestingBrand = filteredCompanyBrand?.filter((brand) => brand.brands.find((x) => x.id === brandDropDown));
    console.log('productTestingBrand', productTestingBrand);
    const latestProductTestingBrand = productTestingBrand?.map(((x) => x.brands.map((x) => {
      const productType = x.productType;
      const productTests = x.productTests?.sort((a, b) => new Date(b.sample_production_date).getTime() - new Date(a.sample_production_date).getTime())[0];
      const toReturn = {
        productType: productType,
        productTests: productTests
      };
      return toReturn;
    })));
    console.log('latestProductTestingBrand', latestProductTestingBrand);
    const brandTesting = latestProductTestingBrand?.map((x) => x?.find((x) => x?.productTests?.brand_id === brandDropDown));
    console.log('brandTesting', brandTesting);


    let PTTesting = 0;
    let averagePTTesting = 0;

    if (brandTesting[0]?.productType?.aflatoxin) {
      if (brandTesting[0]?.productTests != null && brandTesting[0]?.productTests.length !== 0) {
        PTTesting = brandTesting[0]?.productTests?.fortification?.overallKMFIWeightedScore;
      }
    } else {
      if (brandTesting[0]?.productTests != null && brandTesting[0]?.productTests.length !== 0) {
        PTTesting = brandTesting[0]?.productTests?.fortification?.score;
      }
    }

    (latestProductTestingBrand?.[0] || []).map((x) => {
      if (x.productType.aflatoxin) {
        if (x.productTests && x.productTests.length !== 0) {
          averagePTTesting = averagePTTesting + x.productTests?.fortification?.overallKMFIWeightedScore;
        }
      } else {
        if (x.productTests && x.productTests.length !== 0) {
          averagePTTesting = averagePTTesting + x.productTests?.fortification?.score;
        }
      }
    });
    const brandsLen = filteredCompanyBrand[0]?.brands?.length || 0;
    averagePTTesting = brandsLen ? (averagePTTesting / brandsLen) : 0;

    const satValueBrand = parseInt(SABrandsTierThree) === 0 ?
      parseInt(SABrandsTierOne) :
      parseInt(SABrandsTierOne) === 0 ?
        parseInt(SABrandsTierThree) : '';


    const ptWeightedScoreBrand = PTTesting;
    const iegWeightedScoreBrand = ((IEGBrands / 100)) * 20;
    const satWeightedScoreBrand = (satValueBrand / 100) * 50;


    const MFIBrandTotalBrand = ptWeightedScoreBrand + iegWeightedScoreBrand + satWeightedScoreBrand;
    const MFIBrandTotalBrandAverage = averagePTTesting + iegWeightedScoreBrand + satWeightedScoreBrand;

    const data = [
      {name: 'Group B', value: MFIBrandTotalBrand, color: '#04B279'},
      {name: 'Group A', value: 100 - MFIBrandTotalBrand, color: '#f8f8fa'},
    ];
    const od = [
      {name: 'Group B', value: MFIBrandTotalBrandAverage, color: '#04B279'},
      {name: 'Group A', value: 100 - MFIBrandTotalBrandAverage, color: '#f8f8fa'},
    ];
    setAverageOverviewData(od);
    setOverviewData(data);

    const loadData = async () => {
      const satValue = (await typeof ivcTotalScore) !== 'undefined' ? ivcTotalScore : satTotalScore;
      const ptWeightedScore = ((await ptTotalScore) / 100) * 30;
      const iegWeightedScore = ((await iegTotalScore) / 100) * 20;
      const satWeightedScore = ((await satValue) / 100) * 50;
      setOverallWeightedScore(ptWeightedScore + iegWeightedScore + satWeightedScore);
    };
    loadData();
    // Compliance Score
  }, [
    satData,
    iegData,
    ivcData,
    ptData,
    previousScores,
    ptDataPrevious,
    brandDropDown,
  ]);

  /**
   * Updates dashboard state and chart data when a different product brand is selected.
   * @param {React.ChangeEvent<HTMLSelectElement>} e - Event triggered on brand select
   */
  const setPT = (e) => {
    const d = JSON.parse(e.target.value);
    setProductTestingChart((d?.productTests[0]?.fortification?.score));
    if (d?.productType.aflatoxin) {
      const overallKMFIWeightedScore = d?.productTests[0]?.fortification?.overallKMFIWeightedScore;
      setProductTestingChart(overallKMFIWeightedScore);
    }

    setBrand(d?.id);
    setBrandName(d?.name);
    setAflatoxin(d?.productType.aflatoxin);
    setProductTestData(d?.productTests);

    if (d?.productType.aflatoxin) {
      setAflatoxinData([
        {name: 'Group B', value: d?.productTests[0]?.aflatoxinScore, color: '#04B279'},
        {name: 'Group A', value: 100 - d?.productTests[0]?.aflatoxinScore, color: '#f8f8fa'},
      ]);
    }

    // --- Instant recompute of Overall Weighted Score on brand change ---
    const nextPTTotal = d?.productType?.aflatoxin
      ? (d?.productTests?.[0]?.fortification?.overallKMFIWeightedScore ?? 0)
      : (d?.productTests?.[0]?.fortification?.score ?? 0);
    // setPTTotalScore(nextPTTotal);

    // Use validated SAT total if available, else fallback to SAT self-assessment total
    const satValueInstant = (typeof ivcTotalScore !== 'undefined' && ivcTotalScore !== null)
      ? ivcTotalScore
      : satTotalScore;

    const ptWeightedInstant = (nextPTTotal / 100) * 30;
    const iegWeightedInstant = (iegTotalScore / 100) * 20;
    const satWeightedInstant = (satValueInstant / 100) * 50;
    const overallInstant = ptWeightedInstant + iegWeightedInstant + satWeightedInstant;

    console.log('overallInstant', overallInstant);
    setOverallWeightedScore(overallInstant);
    setOverviewData([
      {name: 'Group B', value: overallInstant, color: '#04B279'},
      {name: 'Group A', value: 100 - overallInstant, color: '#f8f8fa'},
    ]);

    // --- Instant recompute of Average Overall Weighted Score (company-wide average) ---
    // Average PT across all brands (latest test per brand), then combine with IEG and SAT
    try {
      const brands = companyBrandDetails?.[0]?.brands || [];
      let sumPT = 0;
      let countPT = 0;
      for (const b of brands) {
        const pts = Array.isArray(b?.productTests) ? b.productTests.slice() : [];
        if (!pts.length) continue;
        // newest test by sample_production_date (fallback: leave order as-is)
        pts.sort((a, b) => {
          const ad = a?.sample_production_date ? new Date(a.sample_production_date).getTime() : 0;
          const bd = b?.sample_production_date ? new Date(b.sample_production_date).getTime() : 0;
          return bd - ad;
        });
        const latest = pts[0];
        const ptVal = b?.productType?.aflatoxin
          ? latest?.fortification?.overallKMFIWeightedScore
          : latest?.fortification?.score;
        if (typeof ptVal === 'number' && isFinite(ptVal)) {
          sumPT += ptVal;
          countPT += 1;
        }
      }
      const avgPT = countPT ? (sumPT / countPT) : 0;

      const avgPtWeighted = (avgPT / 100) * 30;
      const avgIegWeighted = (iegTotalScore / 100) * 20; // company-level IEG already aggregated
      const avgSatWeighted = (satValueInstant / 100) * 50; // validated SAT (IVC) preferred when available
      const avgOverallInstant = avgPtWeighted + avgIegWeighted + avgSatWeighted;

      setAverageOverviewData([
        {name: 'Group B', value: avgOverallInstant, color: '#04B279'},
        {name: 'Group A', value: 100 - avgOverallInstant, color: '#f8f8fa'},
      ]);
    } catch (e) {
      // swallow; average card will be computed by the effect as a fallback
    }
  };

  const options = {
    scales: {
      y: {
        max: 100,
        ticks: {
          // Include a percentage sign in the ticks
          callback: function (value) {
            return value + '%';
          },
        },
      },
    },
  };
  /**
   * Custom render method for displaying a PieChart sector with a central value.
   * @param {Object} props - Sector rendering props including radius, angles, fill color, and value
   * @returns {JSX.Element}
   */
  const renderActiveShape = (props) => {
    const {cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, value} = props;
    return (
      <>
        <text
          x={cx}
          y={cy}
          dy={8}
          textAnchor="middle"
          style={{fontSize: 44, fontWeight: '700'}}
          fill={'#000'}
        >
          {`${value?.toFixed(0)}%`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </>
    );
  };

  return loading ? (
    <Flex height="100%" width="100%" mb="10" justifyContent="center" alignItems="center">
      <Spinner />
    </Flex>
  ) : (
    <div className="padding-0 background-color-4 w-col w-col-10" style={{width: '100%'}}>
      <div className="background-color-white padding-x-10 padding-y-6 border-bottom-1px sticky-top-0 flex-row-middle flex-space-between">
        <div className="flex items-center">
          <img
            src={`https://ui-avatars.com/api/?background=random&name=${(companyDetails?.company_name ?? '').trim()}&rounded=true`}
            loading="lazy"
            width="48"
            style={{borderRadius: '50%'}}
            alt=""
            className="rounded-large margin-right-4"
          />
          <h5 className="page-title mr-8">{companyDetails?.company_name}</h5>
          {companyTier != 'TIER_3' && (
            <button
              onClick={onOpenModal}
              className="background-brand px-4 py-2 text-sm rounded-lg text-white"
            >
              Upgrade to Tier 3
            </button>
          )}
          <Modal open={open} onClose={onCloseModal} center>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-4 max-w-md">Upgrade to Tier 3</h2>
              <p className="text-gray-700 max-w-md mb-4">
                You are currently using the abridged MFI self-assessment tool (Tier 1 Only) which
                allows you to achieve a maximum of 40% out of a possible 60% total score for the
                self-assessment component of the MFI.
                <br />
                By clicking <b>Confirm</b> below, you are hereby choosing to upgrade to the full MFI
                self-assessment which potentially allows you to achieve the maximum 60% total score.
                This will require you to complete responses (and provide additional evidence) for
                Tiers 2 & 3 of the self-assessment tool.
              </p>
              {!upgrading ? (
                <button
                  onClick={upgrade}
                  className="background-brand px-6 py-4 rounded-lg text-white"
                >
                  Confirm
                </button>
              ) : (
                <button className="bg-gray-200 px-6 py-4 rounded-lg text-gray-500 cursor-not-allowed">
                  Upgrading...
                </button>
              )}
            </div>
          </Modal>
        </div>
      </div>
      <div className="padding-10" ref={componentRef}>
        <div className="flex-row-middle flex-space-between margin-bottom-10">
          <div>
            <Text className="margin-bottom-1 weight-medium" fontSize="25px" fontWeight="700">
              {cycle?new Date(
                cycle?.end_date?._seconds * 1000 + cycle?.end_date?._nanoseconds / 1000000,
              ).getFullYear():'New '} Cycle
            </Text>
            <div className="text-small text-color-body-text weight-medium">
              {cycle?.name} Cycle
            </div>
          </div>
          <div className="flex-row-middle">
            <div className="margin-right-4 text-small text-color-body-text">Showing Product Testing Result for:</div>
            <div className="width-auto margin-bottom-0 w-form" style={{width: '37%'}}>
              <form
                id="email-form"
                name="email-form"
                data-name="Email Form"
                className="flex-row-middle"
              >
                <select
                  id="field-2"
                  name="field-2"
                  data-name="Field 2"
                  className="border-1px rounded-large background-color-4 margin-bottom-0 w-select"
                  onChange={setPT}
                >
                  {
                    companyBrandDetails[0]?.brands?.map((brand) =>
                      <option
                        key={brand.id}
                        value={JSON.stringify(brand)}>
                        {brand.name}
                      </option>
                    )}
                </select>
              </form>
              <div className="w-form-done">
                <div>Thank you! Your submission has been received!</div>
              </div>
              <div className="w-form-fail">
                <div>Oops! Something went wrong while submitting the form.</div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <Text
            className="margin-bottom-2 weight-medium margin-top-8"
            fontSize="18px"
            fontWeight="700"
          >
            Overview ({brandName})
          </Text>
          <div className="w-layout-grid grid-2-columns right-2---1 margin-top-5">
            <div className="background-color-white border-1px rounded-large padding-5">
              <Text className="margin-bottom-5 weight-medium" fontSize="15px" fontWeight="700">
                  Overall Weighted Score ({brandName})
              </Text>
              <div className="width-full flex-justify-center margin-top-10">
                <PieChart width={300} height={300}>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    cx="50%"
                    cy="50%"
                    data={overviewData}
                    innerRadius={110}
                    outerRadius={135}
                    dataKey="value"
                  >
                    {overviewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </div>
            </div>
            <div className="background-color-white border-1px rounded-large padding-5">
              <div className="flex-space-between margin-bottom-5">
                <Text className="margin-bottom-5 weight-medium" fontSize="15px" fontWeight="700">
                  KMFI Scores - By Component
                </Text>
              </div>
              <div className="width-full flex-justify-start" style={{maxWidth: 650}}>
                <Bar
                  data={{
                    labels: ['SAT(U)', 'SAT(V) 50%', 'Product Testing 30%', 'Industry Intelligence 20%'],
                    datasets: [
                      {
                        label: 'Unweighted Scores',
                        data: [satTotalScore, ivcTotalScore, (productTestingChart/30)*100, iegTotalScore],
                        backgroundColor: 'rgba(82, 108, 219, 1)',
                        borderColor: 'rgba(82, 108, 219, 1)',
                        borderWidth: 1,
                        barThickness: 37,
                        minBarLength: 2,
                        barPercentage: 5.0,
                      },
                      {
                        label: 'Weighted Scores',
                        data: [(satTotalScore/100)*50, (ivcTotalScore/100)*50, productTestingChart, (iegTotalScore/100)*20],
                        backgroundColor: 'rgba(4, 178, 121, 1)',
                        borderColor: 'rgba(4, 178, 121, 1)',
                        borderWidth: 1,
                        barThickness: 37,
                        minBarLength: 2,
                        barPercentage: 5.0,
                      },
                    ],
                  }}
                  options={options}
                />
              </div>
            </div>
          </div>
          <div className="w-layout-grid grid-2-columns right-2---1 margin-top-5">
            <div className="background-color-white border-1px rounded-large padding-5">
              <Text className="margin-bottom-5 weight-medium" fontSize="15px" fontWeight="700">
                  Average Overall Weighted Score
              </Text>
              <div className="width-full flex-justify-center margin-top-10">
                <PieChart width={300} height={300}>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    cx="50%"
                    cy="50%"
                    data={averageOverviewData}
                    innerRadius={110}
                    outerRadius={135}
                    dataKey="value"
                  >
                    {averageOverviewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </div>
            </div>
            <div className="background-color-white border-1px rounded-large padding-5">
              <div className="flex-space-between margin-bottom-5">
                <Text className="margin-bottom-5 weight-medium" fontSize="15px" fontWeight="700">
                    KMFI Scores Trend (Unweighted) - By Component
                </Text>
              </div>
              <div className="width-full flex-justify-start" style={{maxWidth: 650}}>
                <Line
                  data={{
                    labels: [cycle ? new Date(
                      cycle?.end_date?._seconds * 1000 + cycle?.end_date?._nanoseconds / 1000000,
                    ).getFullYear() - 1 + ' Cycle' : 'New Cycle', cycle ? new Date(
                      cycle?.end_date?._seconds * 1000 + cycle?.end_date?._nanoseconds / 1000000,
                    ).getFullYear() + ' Cycle' : 'New Cycle'],
                    datasets: [
                      {
                        label: 'SAT (U)',
                        data: [previousScores?.find((x) => x.score_type === 'SAT')?.value, satTotalScore],
                        backgroundColor: 'rgba(219, 82, 82, 1)',
                        borderColor: 'rgba(219, 82, 82, 1)',
                        borderWidth: 1,
                        barThickness: 37,
                        minBarLength: 2,
                        barPercentage: 5.0,
                      },
                      {
                        label: 'SAT (V)',
                        data: [previousScores?.find((x) => x.score_type === 'IVC')?.value, ivcTotalScore],
                        backgroundColor: 'rgba(0, 251, 8, 1)',
                        borderColor: 'rgba(0, 251, 8, 1)',
                        borderWidth: 1,
                        barThickness: 37,
                        minBarLength: 2,
                        barPercentage: 5.0,
                      },
                      {
                        label: 'Product Testing',
                        data: [(ptDataPrevious?.find((x) => x.brand_id === brandDropDown)?.fortification?.score / 30) * 100, (productTestingChart / 30) * 100],
                        backgroundColor: 'rgba(0, 51, 255, 1)',
                        borderColor: 'rgba(0, 51, 255, 1)',
                        borderWidth: 1,
                        barThickness: 37,
                        minBarLength: 2,
                        barPercentage: 5.0,
                      },
                      {
                        label: 'IEG',
                        data: [previousScores?.find((x) => x.score_type === 'IEG')?.value, iegTotalScore],
                        backgroundColor: 'rgba(238, 255, 0, 1)',
                        borderColor: 'rgba(238, 255, 0, 1)',
                        borderWidth: 1,
                        barThickness: 37,
                        minBarLength: 2,
                        barPercentage: 5.0,
                      },
                    ],
                  }}
                  options={options}
                />
              </div>
            </div>
          </div>

          <div className="margin-top-5 background-color-white radius-large padding-5 border-1px">
            <div>
              <Text className="margin-bottom-5 weight-medium" fontSize="15px" fontWeight="700">
                Self Assessment Scores
              </Text>
            </div>
            <Bar
              data={{
                labels: [
                  'People Management Systems',
                  'Production, Continuous Impovement & Innovation',
                  'Procurement & Inputs Management',
                  'Public Engagement',
                  'Governance & Leadership Culture',
                ],
                datasets: [
                  {
                    label: 'Validated Scores',
                    data: companyIVCScores,
                    backgroundColor: 'rgba(202, 211, 244, 1)',
                    borderWidth: 1,
                    barThickness: 37,
                    minBarLength: 2,
                    barPercentage: 5.0,
                  },
                  {
                    label: 'Self Assessment Scores',
                    data: companySATScores,
                    backgroundColor: 'rgba(82, 108, 219, 1)',
                    borderColor: 'rgba(82, 108, 219, 1)',
                    borderWidth: 1,
                    barThickness: 37,
                    minBarLength: 2,
                    barPercentage: 5.0,
                  },
                ],
              }}
              options={options}
            />
          </div>
          <div className="margin-top-5 background-color-white radius-large padding-5 border-1px">
            <div>
              <Text className="margin-bottom-5 weight-medium" fontSize="15px" fontWeight="700">
                Industry Expert Group Scores
              </Text>
            </div>

            <Bar
              data={{
                labels: [
                  'People Management Systems',
                  'Production, Continuous Impovement & Innovation',
                  'Procurement & Inputs Management',
                  'Public Engagement',
                  'Governance & Leadership Culture',
                ],
                datasets: [
                  {
                    label: 'Industry Expert Group Scores',
                    data: companyIEGScores,
                    backgroundColor: 'rgba(82, 108, 219, 1)',
                    borderColor: 'rgba(82, 108, 219, 1)',
                    borderWidth: 1,
                    barThickness: 37,
                    minBarLength: 2,
                    barPercentage: 5.0,
                  },
                ],
              }}
              options={options}
            />
          </div>
          <div className="margin-top-5 background-color-white radius-large padding-5 border-1px">
            <div className="flex-space-between">
              <div>
                <Text className="margin-bottom-5 weight-medium" fontSize="15px" fontWeight="700">
                  Product Testing
                </Text>
                <div className="text-small text-color-body-text margin-top-2">
                  Company scores are compared with the average industry score
                </div>
              </div>
              <div className="width-auto w-form">
                <form
                  id="email-form"
                  name="email-form"
                  data-name="Email Form"
                  className="flex-row-middle"
                >
                </form>
                <div className="w-form-done">
                  <div>Thank you! Your submission has been received!</div>
                </div>
                <div className="w-form-fail">
                  <div>Oops! Something went wrong while submitting the form.</div>
                </div>
              </div>
            </div>
            <AssessmentChart1 productTestData={productTestData} aflatoxin={aflatoxin} />
          </div>
          {aflatoxin &&
            <div className="w-layout-grid grid-2-columns right-2---1 margin-top-5">
              <div className="background-color-white border-1px rounded-large padding-5">
                <Text className="margin-bottom-5 weight-medium" fontSize="15px" fontWeight="700">
                  KMFI Aflatoxin Score - 10% weighting
                </Text>
                <div className="width-full flex-justify-center margin-top-10">
                  <PieChart width={300} height={300}>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      cx="50%"
                      cy="50%"
                      data={aflatoxinData}
                      innerRadius={110}
                      outerRadius={135}
                      dataKey="value"
                    >
                      {aflatoxinData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </div>
              </div>
            </div>
          }
        </div>
        <div className="border-top-1px margin-top-10 padding-top-5 flex-space-between">
          <div className="text-xs text-color-body-text">© Copyright KMFI. All rights reserved</div>
          <div className="text-xs text-color-body-text">
            Powered by{' '}
            <a href=" https://www.technoserve.org/" target="_blank">
              TechnoServe
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

CompanyDashboard.propTypes = {
  cycle: propTypes.any
};

export default CompanyDashboard;
