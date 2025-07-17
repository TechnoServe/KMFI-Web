/* eslint-disable react/prop-types */
import React, {useState, useEffect, useRef} from 'react';
import {Bar, Line} from 'react-chartjs-2';
import ReactToPrint from 'react-to-print';
import {PieChart, Pie, Cell, Sector} from 'recharts';
import {Flex, Text, useToast, Spinner, Select, Spacer} from '@chakra-ui/react';
import AssessmentChart1 from './component/assessment-chart-1';
import ProgressChart from './component/progress-chart';
import {useSelector} from 'react-redux';
import {request} from 'common';
import {nanoid} from '@reduxjs/toolkit';
import {CSVLink, CSVDownload} from 'react-csv';
import {Modal} from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import {Parser} from '@json2csv/plainjs';

const Dashboard = () => {
  const [open, setOpen] = useState(false);
  const onOpenModal = () => setOpen(true);
  const onCloseModal = () => setOpen(false);

  const [upgrading, setUpgrading] = useState(null);
  const [companyTier, setCompanyTier] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);

  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState([]);
  const [previousScores, setPreviousScores] = useState([]);

  const [satData, setSATData] = useState([]);
  const [companySATScores, setCompanySATScores] = useState([]);
  const [satTotalScore, setSATTotalScore] = useState(0);

  const [ivcData, setIVCData] = useState([]);
  const [companyIVCScores, setCompanyIVCScores] = useState([]);
  const [ivcTotalScore, setIVCTotalScore] = useState(0);

  const [iegData, setIEGData] = useState([]);
  const [companyIEGScores, setCompanyIEGScores] = useState([]);
  const [iegTotalScore, setIEGTotalScore] = useState(0);

  const [ptTotalScore, setPTTotalScore] = useState(0);
  const [ptData, setPTData] = useState([]);
  const [productTestData, setProductTestData] = useState([]);
  const [ptDataPrevious, setPTDataPrevious] = useState([]);

  const [companyBrandDetails, setCompanyBrandDetails] = useState([]);
  const [productTestingChart, setProductTestingChart] = useState();
  const cycle = localStorage.getItem('cycle') ? localStorage.getItem('cycle') : 'vJqDawZlrKNHsMIW9G2s';
  const [selectedCycle, setSelectedCycle] = useState(cycle);
  const localCycles = localStorage.getItem('cycles');
  const [cycles, setCycles] = useState(localCycles ? JSON.parse(localCycles) : []);
  const [aflatoxin, setAflatoxin] = useState(false);
  const [aflatoxinData, setAflatoxinData] = useState([
    {name: 'Group B', value: 0, color: '#04B279'},
    {name: 'Group A', value: 100 - 0, color: '#f8f8fa'},
  ]);
  const [overviewData, setOverviewData] = useState([
    {name: 'Group B', value: 0, color: '#04B279'},
    {name: 'Group A', value: 100 - 0, color: '#f8f8fa'},
  ]);
  const [averageOverviewData, setAverageOverviewData] = useState([
    {name: 'Group B', value: 0, color: '#04B279'},
    {name: 'Group A', value: 100 - 0, color: '#f8f8fa'},
  ]);
  const [brandDropDown, setBrand] = useState();
  const [brandName, setBrandName] = useState('');
  const user = useSelector((state) => state.auth.user);
  const componentRef = useRef();
  const [activeIndex] = useState(0);
  const [companyData, setCompanyData] = useState('');
  const [CSVSatData, setCSVSatData] = useState([]);
  const [companyDataReady, setCompanyDataReady] = useState(false);
  const individualHeaders = [
    {label: 'Company Name', key: 'company_name'},
    {label: 'Brand Name', key: 'brand_name'},
    {label: 'Product', key: 'product_type'},
    {label: 'Weighted SAT Score (v) 50%', key: 'sat_score'},
    {label: 'Weighted PT Score 30%', key: 'pt_score'},
    {label: 'Weighted IEG Score 20%', key: 'ieg_score'},
    {label: 'Overall KMFI Score', key: 'overall_score'},
  ];

  const satHeaders = [
    {label: 'Self Assessment Tool(%)', key: 'self_assessment_tool'},
    {label: 'SAT People Management Systems(%)', key: 'sat_personnel'},
    {label: 'SAT Production, Continuous Impovement & Innovation(%)', key: 'sat_people_management'},
    {label: 'SAT Procurement and Suppliers(%)', key: 'sat_procurement_supply'},
    {label: 'SAT Public Engagement(%)', key: 'sat_public_engagement'},
    {label: 'SAT Governance & Leadership Culture(%)', key: 'sat_governance'},
    {label: 'Validated Scores(%)', key: 'validated_scores'},
    {label: 'IVC People Management Systems(%)', key: 'ivc_people_management'},
    {label: 'IVC Production, Continuous Impovement & Innovation(%)', key: 'ivc_production'},
    {label: 'IVC Procurement and Suppliers(%)', key: 'ivc_procurement_supply'},
    {label: 'IVC Public Engagement(%)', key: 'ivc_public_engagement'},
    {label: 'IVC Governance & Leadership Culture(%)', key: 'ivc_governance'},
    {label: 'Industry Expert Group(%)', key: 'industry_expert_group'},
    {label: 'IEG People Management Systems(%)', key: 'ieg_personnel'},
    {label: 'IEG Production, Continuous Impovement & Innovation(%)', key: 'ieg_production'},
    {label: 'IEG Procurement and Suppliers(%)', key: 'ieg_procurement_supply'},
    {label: 'IEG Public Engagement', key: 'ieg_public_engagement'},
    {label: 'IEG Governance & Leadership Culture', key: 'ieg_governance'},
  ];

  const onCycleChange = (evt) => {
    setSATData([]);
    setProductTestingChart(0);
    setIEGTotalScore(0);
    setIVCTotalScore(0);
    setSATTotalScore(0);
    setCompanySATScores([]);
    setPTTotalScore(0);
    setCompanyIVCScores([]);
    setCompanyBrandDetails([]);
    setProductTestData([]);
    setIEGData([]);
    setOverviewData([
      {name: 'Group B', value: 0, color: '#04B279'},
      {name: 'Group A', value: 100 - 0, color: '#f8f8fa'},
    ]);
    setLoading(true);
    const value = evt.target.options[evt.target.selectedIndex].value;
    const mCycle = cycles.find((x) => x.id === value);
    setSelectedCycle(value);
    localStorage.setItem('cycle', value);
    getSATScores(value);
    getPTScores(value);
    getTestScores(value);
  };

  useEffect(() => {
    let mounted = true;
    cycles.length === 0 &&
      setLoading(true);
    (async () => {
      try {
        const res = await request(true).get(`/company/cycles`);
        if (mounted) {
          localStorage.setItem('cycles', JSON.stringify(res.data));
          setCycles(res.data);
          setLoading(false);
        }

        // setLoading(false);
      } catch (error) {
        setLoading(false);
        return toast({
          status: 'error',
          title: 'Error',
          position: 'top-right',
          description: 'Something went wrong',
          duration: 6000,
          isClosable: true,
        });
      }
    })();
    return () => mounted = false;
  }, []);

  const getCompanyDetails = async () => {
    try {
      const res = await request(true).get(
        `/company/details/?company-id=${user.company.id}`
      );
      if (res.status === 200) {
        setCompanyTier(res.data.company.tier);
        setCompanyDetails(res.data.company);
      }
    } catch (error) {
    }
  };
  const upgrade = async () => {
    setUpgrading(true);
    try {
      await request(true).post(`/company/set-tier`, {
        'tier': 'TIER_3',
        'company-id': user.company_user.company_id,
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

  const getTestScores = async (cyc = selectedCycle) => {
    try {
      const {
        data: {data: res},
      } = await request(true).get(`/sat/scores?company-id=${user.company.id}&cycle-id=${cyc}&previous-id=${cycles.find((x) => x.id === cyc).previous_id}`);
      console.log('getTestScores', res);
      setScores(res.current.sort((a, b) => a.sort_order - b.sort_order));
      setPreviousScores(res.previous.sort((a, b) => a.sort_order - b.sort_order));
      setLoading(false);
    } catch (error) {
      console.log('error', error);
      setLoading(false);
    }
  };

  const getSATScores = async (cyc = selectedCycle) => {
    setLoading(true);
    try {
      const res = await request(true).get(`companies/${user.company.id}/${cyc}/aggs`);
      if (res.status === 200) {
        if (res.data) {
          setSATData([res.data]);
          setIVCData([res.data]);
          if (res.data.iegScores) {
            setIEGData(res.data.iegScores);
          }
          setCompanyBrandDetails([res.data]);
          const cleanedData = res.data.brands.map((item) => {
            return {
              company_name: res.data.company_name,
              brand_name: item.name,
              product_type: item.productType.name,
              sat_score: (res.data.ivcTotal * 0.50).toFixed(2),
              pt_score: item.productType.aflatoxin ? item.productTests[0]?.fortification?.overallKMFIWeightedScore.toFixed(2) : item.productTests[0]?.fortification.score.toFixed(2),
              ieg_score: (res.data.iegTotal * 0.20).toFixed(2),
              overall_score: ((res.data.ivcTotal * 0.50) + (item.productType.aflatoxin ? item.productTests[0]?.fortification.overallKMFIWeightedScore : item.productTests[0]?.fortification.score) + (res.data.iegTotal * 0.20)).toFixed(2)
            };
          });

          const cleanedSATData =
          {
            company_name: res.data.company_name,
            self_assessment_tool: res.data.satTotal.toFixed(2),
            sat_people_management: res.data.satScores?.find((o) => o?.name === 'People Management Systems')?.score?.toFixed(2),
            sat_production: res.data.satScores?.find((o) => o?.name === 'Production, Continuous Impovement & Innovation')?.score?.toFixed(2),
            sat_procurement_supply: res.data.satScores?.find((o) => o?.name === 'Procurement & Inputs Management')?.score?.toFixed(2),
            sat_public_engagement: res.data.satScores?.find((o) => o?.name === 'Public Engagement')?.score?.toFixed(2),
            sat_governance: res.data.satScores?.find((o) => o?.name === 'Governance & Leadership Culture')?.score?.toFixed(2),
            validated_scores: res.data.ivcTotal.toFixed(2),
            ivc_people_management: res.data.ivcScores?.find((o) => o?.name === 'People Management Systems')?.score?.toFixed(2),
            ivc_production: res.data.ivcScores?.find((o) => o?.name === 'Production, Continuous Impovement & Innovation')?.score?.toFixed(2),
            ivc_procurement_supply: res.data.ivcScores?.find((o) => o?.name === 'Procurement & Inputs Management')?.score?.toFixed(2),
            ivc_public_engagement: res.data.ivcScores?.find((o) => o?.name === 'Public Engagement')?.score?.toFixed(2),
            ivc_governance: res.data.ivcScores?.find((o) => o?.name === 'Governance & Leadership Culture')?.score?.toFixed(2),
            industry_expert_group: res.data.iegTotal.toFixed(2),
            ieg_personnel: res.data.iegScores?.find((o) => o?.category?.name === 'People Management Systems')?.value?.toFixed(2),
            ieg_production: res.data.iegScores?.find((o) => o?.category?.name === 'Production, Continuous Impovement & Innovation')?.value?.toFixed(2),
            ieg_procurement_supply: res.data.iegScores?.find((o) => o?.category?.name === 'Procurement & Inputs Management')?.value?.toFixed(2),
            ieg_public_engagement: res.data.iegScores?.find((o) => o?.category?.name === 'Public Engagement')?.value?.toFixed(2),
            ieg_governance: res.data.iegScores?.find((o) => o?.category?.name === 'Governance & Leadership Culture')?.value?.toFixed(2),
          };

          const parser = new Parser();
          const csv = parser.parse(cleanedData);
          const parser2 = new Parser();
          const csvSAT = parser2.parse(cleanedSATData);
          setCompanyData(csv);
          setCSVSatData(csvSAT);
        }
      } else {
        setSATData([]);
        setIVCData([]);
        setIEGData([]);
      }
    } catch (error) {
      console.log('SATScoresError', error);
      setSATData([]);
      setIVCData([]);
      setIEGData([]);

      setLoading(false);
    }
  };

  const getPTScores = async (cyc = selectedCycle) => {
    try {
      const {
        data: res,
      } = await request(true).get(`companies/${user.company.id}/products-tests-v2?cycle-id=${cyc}&previous-id=${cycles.find((x) => x.id === cyc).previous_id}`);
      console.log('PTScores', res);
      setPTData(res.current);
      setPTDataPrevious(res.previous);
    } catch (error) {
      console.log('PTScoresError', error);
      setLoading(false);
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


  useEffect(async () => {
    user.company && getCompanyDetails();
    user.company && getSATScores();
    user.company && getTestScores();
    user.company && getPTScores();
  }, [user]);

  useEffect(() => {
    analyze();
  }, [satData, iegData, ivcData, ptData, previousScores, ptDataPrevious, setAflatoxinData, setOverviewData, setPTDataPrevious, setPTData]);

  const analyze = () => {
    const filteredCompanyBrand =
      satData.length > 0
        ? satData.filter((item) => {
          return item.id === user.company.id;
        })
        : [];


    const satScoresArr = [];
    const satTotalScoreArr = [];
    if (filteredCompanyBrand.length > 0 && filteredCompanyBrand[0].satScores.length > 0) {
      setCompanyBrandDetails(filteredCompanyBrand);
      setBrand(filteredCompanyBrand[0]?.brands[0]?.id);
      setProductTestingChart(filteredCompanyBrand[0]?.brands[0]?.productTests[0]?.fortification?.score);
      setBrandName(filteredCompanyBrand[0]?.brands[0]?.name);

      if (filteredCompanyBrand[0]?.brands[0]?.productType.aflatoxin) {
        const overallKMFIWeightedScore = filteredCompanyBrand[0]?.brands[0]?.productTests[0]?.fortification?.overallKMFIWeightedScore;
        setProductTestingChart(overallKMFIWeightedScore);
      }

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

      setAflatoxin(brands[0].productType.aflatoxin);
      setProductTestData(brands[0].productTests);

      const aflaScore = brands[0].productTests[0]?.aflatoxinScore;
      setAflatoxinData([
        {name: 'Group B', value: aflaScore, color: '#04B279'},
        {name: 'Group A', value: 100 - aflaScore, color: '#f8f8fa'},
      ]);

      if (filteredCompanyBrand[0]?.brands[0]?.productTests.length > 0) {
        setPTTotalScore(filteredCompanyBrand[0]?.brands[0]?.productTests[0]?.fortification?.score);
        if (brands[0].productType.aflatoxin) {
          const overallKMFIWeightedScore = filteredCompanyBrand[0]?.brands[0]?.productTests[0]?.fortification?.overallKMFIWeightedScore;
          setPTTotalScore(overallKMFIWeightedScore);
        }
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


    const newIVCData = companyBrandDetails[0]?.ivcScores;
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
    const selfAssessmentBrand = companyBrandDetails?.filter((brand) => brand?.brands?.find((x) => x?.id === brandDropDown));
    // Tier One Breakdown
    const tierOneSABrand = selfAssessmentBrand?.filter((x) => x?.tier?.includes('TIER_1'));
    const tierOneSatBrand = tierOneSABrand?.map((x) => x?.ivcScores?.map((x) => x?.score).reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0));
    const percentageTierOneSatBrand = tierOneSatBrand;

    const tierOneSatBrandTotal = percentageTierOneSatBrand?.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0);

    // Tier Three Breakdown
    const tierThreeSABrand = selfAssessmentBrand?.filter((x) => x?.tier?.includes('TIER_3'));

    const tierThreeSatBrandCul = tierThreeSABrand?.map((x) => x?.ivcScores?.map((x) => x?.score).reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0));

    const tierThreeSatBrandTotal = tierThreeSatBrandCul?.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0);

    let SABrandsTierOne = 0;
    let SABrandsTierThree = 0;
    if ((selfAssessmentBrand?.map((x) => x.tier === 'TIER_1'))) {
      SABrandsTierOne = tierOneSatBrandTotal.toFixed();
    }
    if ((selfAssessmentBrand?.map((x) => x.tier === 'TIER_3'))) {
      SABrandsTierThree = tierThreeSatBrandTotal.toFixed();
    }

    // Brands IEG Charts
    const industryExpertGroupBrand = companyBrandDetails?.filter((brand) => brand.brands.find((x) => x.id === brandDropDown));

    const culIndustryExpertBrand = industryExpertGroupBrand?.map((x) => x.iegScores.map((x) => x.value).reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0));

    const totalIndustryExpertGroupBrand = culIndustryExpertBrand?.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0);
    let IEGBrands = [];
    IEGBrands = totalIndustryExpertGroupBrand?.toFixed();


    // Brands PT Charts
    const productTestingBrand = companyBrandDetails?.filter((brand) => brand.brands.find((x) => x.id === brandDropDown));

    const latestProductTestingBrand = productTestingBrand?.map(((x) => x.brands.map((x) => {
      const productType = x.productType;
      const productTests = x.productTests?.sort((a, b) => new Date(b.sample_production_date).getTime() - new Date(a.sample_production_date).getTime())[0];
      const toReturn = {
        productType: productType,
        productTests: productTests
      };
      return toReturn;
    })));

    const brandTesting = latestProductTestingBrand?.map((x) => x?.find((x) => x?.productTests?.brand_id === brandDropDown));

    let PTTesting = 0;
    let averagePTTesting = 0;
    if (brandTesting[0]?.productType?.aflatoxin) {
      PTTesting = brandTesting[0]?.productTests.fortification?.overallKMFIWeightedScore;
    } else {
      PTTesting = brandTesting[0]?.productTests.fortification?.score;
    }

    latestProductTestingBrand[0]?.map((x) => {
      if (x.productType.aflatoxin) {
        averagePTTesting = averagePTTesting + x.productTests.fortification?.overallKMFIWeightedScore;
      } else {
        averagePTTesting = averagePTTesting + x.productTests.fortification?.score;
      }
    });
    averagePTTesting = averagePTTesting / companyBrandDetails[0]?.brands.length;


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
  };


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
          {`${value.toFixed(0)}%`}
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
            src={`https://ui-avatars.com/api/?background=random&name=${companyDetails?.company_name.trim()}$rounded=true`}
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
        <Flex direction="row" justify="space-between" alignItems="center" grow={1}>
          <h5 className="page-title">Dashboard</h5>
          <Spacer />
          <Select
            size="md"
            style={{marginTop: '9px'}}
            name="cycles"
            id="cycles"
            onChange={onCycleChange}
            value={selectedCycle}
          >
            {cycles?.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name} Cycle
              </option>
            ))}
          </Select>
          <Spacer />
          <button className="flex-row-middle padding-x-4 padding-y-2 background-brand rounded-large text-color-4 no-underline w-inline-block" onClick={() => {
            setCompanyDataReady(true); setTimeout(() => {
              setCompanyDataReady(false);
            }, 5000);
          }}>
            <div className="padding-right-2 text-small text-color-4">Download</div>
            {companyDataReady && (
              <>
                <CSVDownload data={companyData} target="_blank" />
                <CSVDownload data={CSVSatData} target="_blank" />
              </>

            )}
          </button>
        </Flex>

      </div>
      <div className="padding-10" ref={componentRef}>
        <div className="flex-row-middle flex-space-between margin-bottom-10">
          <div>
            <Text className="margin-bottom-1 weight-medium" fontSize="25px" fontWeight="700">
              {cycles[cycles.map((e) => e.id).indexOf(selectedCycle)] ?new Date(
                cycles[cycles.map((e) => e.id).indexOf(selectedCycle)]?.end_date?._seconds * 1000 + cycles[cycles.map((e) => e.id).indexOf(selectedCycle)]?.end_date?._nanoseconds / 1000000,
              ).getFullYear():'New '} Cycle
            </Text>
            <div className="text-small text-color-body-text weight-medium">
              {cycles[cycles.map((e) => e.id).indexOf(selectedCycle)]?.name}
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
              <div className="width-full flex-justify-start" style={{maxWidth: 700}}>
                <Bar
                  data={{
                    labels: ['SAT(U)', 'SAT(V) 50%', 'Product Testing 30%', 'Industry Intelligence 20%'],
                    datasets: [
                      {
                        label: 'Unweighted Scores',
                        data: [satTotalScore, ivcTotalScore, ((productTestingChart/30)*100), iegTotalScore],
                        backgroundColor: 'rgba(82, 108, 219, 1)',
                        borderColor: 'rgba(82, 108, 219, 1)',
                        borderWidth: 1,
                        barThickness: 37,
                        minBarLength: 2,
                        barPercentage: 5.0,
                      },
                      {
                        label: 'Weighted Scores',
                        data: [(satTotalScore / 100) * 50, (ivcTotalScore / 100) * 50, productTestingChart, (iegTotalScore / 100) * 20],
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
                    KMFI Scores Trend (Unweighted) - By Component
                </Text>
              </div>
              <div className="width-full flex-justify-start" style={{maxWidth: 700}}>
                <Line
                  data={{
                    labels: [cycles[cycles.map((e) => e.id).indexOf(selectedCycle)] ? new Date(
                      cycles[cycles.map((e) => e.id).indexOf(selectedCycle)]?.end_date?._seconds * 1000 + cycles[cycles.map((e) => e.id).indexOf(selectedCycle)]?.end_date?._nanoseconds / 1000000,
                    ).getFullYear() - 1 : 'New ', cycles[cycles.map((e) => e.id).indexOf(selectedCycle)] ? new Date(
                      cycles[cycles.map((e) => e.id).indexOf(selectedCycle)]?.end_date?._seconds * 1000 + cycles[cycles.map((e) => e.id).indexOf(selectedCycle)]?.end_date?._nanoseconds / 1000000,
                    ).getFullYear() : 'New '],
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
                        data: [(ptDataPrevious?.find((x) => x.brand_id === brandDropDown)?.fortification?.score / 30) * 100, (ptData?.find((x) => x.brand_id === brandDropDown)?.fortification?.score / 30) * 100],
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

export default Dashboard;
