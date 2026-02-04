import React, {useState, useEffect} from 'react';
import {Container, Text, Box, Divider, useToast, Flex, Spinner, Button, Select, Spacer, Tooltip, IconButton, Menu,
  MenuButton,
  MenuList,
  MenuItem,
  HStack} from '@chakra-ui/react';
import InputField from '../../../components/customInput';
// import CustomSelect from '../../../components/customSelect';
import {CSVLink, CSVDownload} from 'react-csv';
// import CompanyDashboard from '../companyDashboard';// Added by EMmanuel
import ProductScoreCardV2 from 'components/companyDetail/ProductScoresV2';
import IndustryExpertScoresV2 from 'components/companyDetail/IndustryExpertScoresV2';
import IvcAssessment from '../../ivc/self-assessment/index';
import CompanyDashboard from '../companyDashboard/index';
import 'styles/webflow.css';
import 'styles/mfi-tns.webflow.css';
import 'styles/normalize.css';
import {request} from 'common';
import {FiEdit, FiTrash} from 'react-icons/fi';
import RemoveIndustry from 'components/companyDetail/RemoveIndustry';
import IndustryPermissionRequest from 'components/companyDetail/IndustryPermissionRequest';
import ComputeSATScores from 'components/companyDetail/ComputeSATScores';
import {nanoid} from '@reduxjs/toolkit';
import {useAuth} from 'hooks/user-auth';
import {usePagination} from 'components/useDashboardPagination';
import {MdDashboard, MdMoreVert, MdMenu} from 'react-icons/md';
import {FiUpload, FiInfo} from 'react-icons/fi';
import {Parser} from '@json2csv/plainjs';

const Companies = () => {
  const [input, setInput] = useState('');
  const localCompanies = localStorage.getItem('company-list');
  const [companies, setCompanies] = useState(localCompanies ? JSON.parse(localCompanies) : []);
  const [data, setData] = useState(localCompanies ? JSON.parse(localCompanies) : []);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [companyDataReady, setCompanyDataReady] = useState(false);
  const [sortCompanies, setSortCompanies] = useState(localCompanies ? JSON.parse(localCompanies) : []);
  const [selected, setSelected] = useState(null);
  const [company, setCompany] = useState(null);
  const toast = useToast();
  // const filterArray = ['Country', 'Product Vehicle', 'Tier'];
  const cycle = localStorage.getItem('cycle') ? localStorage.getItem('cycle') : 'vJqDawZlrKNHsMIW9G2s';
  const [selectedCycle, setSelectedCycle] = useState(cycle);
  const [SATData, setSATData] = useState([]);
  const [CSVSatData, setCSVSatData] = useState([]);
  const localCycles = localStorage.getItem('cycles');
  const [cycles, setCycles] = useState(localCycles ? JSON.parse(localCycles) : []);
  const {PaginationButtons, allIndustryScores} = usePagination(companies);
  const [companyData, setCompanyData] = useState('');
  const {user} = useAuth();

  const headers = [
    {label: 'Company Name', key: 'company_name'},
    {label: 'Self Assessment Tool(%)', key: 'self_assessment_tool'},
    {label: 'SAT People Management Systems(%)', key: 'sat_people_management'},
    {label: 'SAT Production, Continuous Impovement & Innovation(%)', key: 'sat_production'},
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
    // {label: 'Brand Name:Score', key: 'brand_name'},

  ];

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

  useEffect(() => {
    let mounted = true;
    cycles.length === 0 &&
    setLoading(true);
    (async () => {
      try {
        const res = await request(true).get(`/admin/cycles`);
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
    return () => mounted = false; // cleanup function
  }, []);

  const getRemoteCompanies = async (cyc) => {
    setLoading(true);
    // console.log('passedData: ', cyc);
    try {
      const res = await request(true).get('admin/index?page-size=50&cycle=' + cyc);
      localStorage.setItem('company-list', JSON.stringify(res.data));

      setCompanies(res.data);
      setData(res.data);
      setSortCompanies(res.data);
      setLoading(false);
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
  };

  useEffect(() => {
    companies.length === 0 && getRemoteCompanies(selectedCycle);
  }, []);


  useEffect(() => {
    setCompanies([]);
    data.filter((val) => {
      if (val.company_name.toLowerCase().includes(input.toLowerCase())) {
        setCompanies((companies) => [...companies, val]);
      }
    });
  }, [input]);


  const sortIt = (sortBy) => (a, b) => {
    if (a[sortBy] > b[sortBy]) {
      return 1;
    } else if (a[sortBy] < b[sortBy]) {
      return -1;
    }
    return 0;
  };

  const sortDesc = (sortBy) => (a, b) => {
    if (a[sortBy] < b[sortBy]) {
      return 1;
    } else if (a[sortBy] > b[sortBy]) {
      return -1;
    }
    return 0;
  };


  const sortCompany = (e) => {
    const index = e.nativeEvent.target.selectedIndex;
    if (e.target.value === 'created_at' || e.target.value === 'company_name') {
      const sorted = [...sortCompanies].sort(sortIt(e.target.value));
      setCompanies(sorted);
    }

    if (e.target.value === 'company_name' && e.nativeEvent.target[index].text === 'A-Z, Bottom - Top') {
      const sorted = [...sortCompanies].sort(sortDesc(e.target.value));
      setCompanies(sorted);
    }
    ;
  };

  const onCycleChange = (evt) => {
    console.log(evt);
    const value = evt.target.options[evt.target.selectedIndex].value;
    setSelectedCycle(value);
    localStorage.setItem('cycle', value);
    getRemoteCompanies(value);
  };

  const getSATScores = async (company) => {
    setLoading(true);
    try {
      const res = await request(true).get(`companies/${company.id}/${selectedCycle}/aggs`);
      if (res.status === 200) {
        if (res.data) {
          setSelected(
            'IVCAssessment',
            localStorage.setItem('company', JSON.stringify(res.data))
          );
        }
        setLoading(false);
      } else {
        setSATData([]);
      }
    } catch (error) {
      console.log('SATScoresError', error);
      setLoading(false);
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


  // const doAdjustedScores = (micronutrient, productType, compliance) => {
  //   switch (micronutrient) {
  //     case 'Vitamin A':
  //       return compliance >= 451
  //         ? productType == '7solPkqUcOabROFd5Lgt' || productType == 'XjGrnod6DDbJFVxtZDkD'
  //           ? 0
  //           : 0
  //         : compliance >= 414
  //           ? productType == '7solPkqUcOabROFd5Lgt' || productType == 'XjGrnod6DDbJFVxtZDkD'
  //             ? 10
  //             : 0
  //           : compliance >= 376
  //             ? productType == '7solPkqUcOabROFd5Lgt' || productType == 'XjGrnod6DDbJFVxtZDkD'
  //               ? 15
  //               : 0
  //             : compliance >= 241
  //               ? productType == '7solPkqUcOabROFd5Lgt' || productType == 'XjGrnod6DDbJFVxtZDkD'
  //                 ? 30
  //                 : 0
  //               : compliance >= 221
  //                 ? productType == '7solPkqUcOabROFd5Lgt' || productType == 'XjGrnod6DDbJFVxtZDkD'
  //                   ? 30
  //                   : 10
  //                 : compliance >= 201
  //                   ? productType == '7solPkqUcOabROFd5Lgt' || productType == 'XjGrnod6DDbJFVxtZDkD'
  //                     ? 30
  //                     : 15
  //                   : compliance >= 100
  //                     ? 30
  //                     : compliance >= 80
  //                       ? 25
  //                       : compliance >= 51
  //                         ? 15
  //                         : compliance >= 31
  //                           ? 10
  //                           : 0;
  //     case 'Vitamin B3 (Niacin)':
  //       return compliance >= 100
  //         ? 30
  //         : compliance >= 80
  //           ? 25
  //           : compliance >= 51
  //             ? 15
  //             : compliance >= 31
  //               ? 10
  //               : 0;
  //     case 'Vitamin B (Niacin)':
  //       return compliance >= 100
  //         ? 30
  //         : compliance >= 80
  //           ? 25
  //           : compliance >= 51
  //             ? 15
  //             : compliance >= 31
  //               ? 10
  //               : 0;
  //     case 'Iron':
  //       return compliance >= 100
  //         ? 30
  //         : compliance >= 80
  //           ? 25
  //           : compliance >= 51
  //             ? 15
  //             : compliance >= 31
  //               ? 10
  //               : 0;
  //     default:
  //       return 0;
  //   }
  // };

  // const getScore = (x) => {
  //   if (x.productTests.length == 0) return '';

  //   const fortification = x?.productTests[0].results
  //     .map((x) => x.percentage_compliance)
  //     .every((el) => el >= 80)
  //     ? 'Fully Fortified'
  //     : x?.productTests[0].results.map((x) => x.percentage_compliance).every((el) => el <= 30)
  //       ? 'Not Fortified'
  //       : x?.productTests[0].results.map((x) => x.percentage_compliance).some((el) => el >= 51)
  //         ? 'Adequately Fortified'
  //         : x?.productTests[0].results.map((x) => x.percentage_compliance).some((el) => el >= 31)
  //           ? 'Inadequately Fortified'
  //           : '';

  //   let resultString = '';
  //   x.productTests[0].results.forEach((result, i) => {
  //     const mfiScore = doAdjustedScores(
  //       result.microNutrient.name,
  //       result.product_type,
  //       result.percentage_compliance
  //     );
  //     resultString += `Name: ${result.name}, Value: ${result.value}, MFI Score: ${mfiScore}\n`;
  //     // go back to productTests[0] check if aflatoxinScore is not null. If its not null then add the aflatoxin score to the resultString
  //     if (x.productTests[0].aflatoxinScore != null && i == x.productTests[0].results.length - 1) {
  //       resultString += `Aflatoxin Score: ${x.productTests[0].aflatoxinScore}\n`;
  //     }
  //   });

  //   // Rest of the code...
  //   return fortification + '-' + resultString;
  // };

  const dataCSV = companies?.map((item) => (
    {
      company_name: item?.company_name, // Company Name
      // company_name: item?.company_name,
      // // SAT
      // self_assessment_tool: item?.satScores?.reduce((accum, item) => accum + item.score, 0).toFixed(),
      // sat_personnel: item?.satScores?.find((o) => o?.name === 'People Management Systems')?.score.toFixed(),
      // sat_production: item?.satScores?.find((o) => o?.name === 'Production, Continuous Impovement & Innovation')?.score.toFixed(),
      // sat_procurement_supply: item?.satScores?.find((o) => o?.name === 'Procurement & Inputs Management')?.score.toFixed(),
      // sat_public_engagement: item?.satScores?.find((o) => o?.name === 'Public Engagement')?.score.toFixed(),
      // sat_governance: item?.satScores?.find((o) => o?.name === 'Governance & Leadership Culture')?.score.toFixed(),
      // // IVC
      // validated_scores: item?.ivcScores.reduce((accum, item) => accum + (item?.score ? item.score : 0), 0).toFixed(),
      // ivc_personnel: item?.ivcScores?.find((o) => o?.name === 'People Management Systems')?.score?.toFixed(),
      // ivc_production: item?.ivcScores?.find((o) => o?.name === 'Production, Continuous Impovement & Innovation')?.score?.toFixed(),
      // ivc_procurement_supply: item?.ivcScores?.find((o) => o?.name === 'Procurement & Inputs Management')?.score?.toFixed(),
      // ivc_public_engagement: item?.ivcScores?.find((o) => o?.name === 'Public Engagement')?.score?.toFixed(),
      // ivc_governance: item?.ivcScores?.find((o) => o?.name === 'Governance & Leadership Culture')?.score?.toFixed(),
      // // IEG
      // industry_expert_group: (item?.iegScores?.reduce((accum, item) => accum + (item?.value ? item.value : 0), 0)).toFixed(),
      // ieg_personnel: item?.iegScores?.find((o) => o?.category?.name === 'People Management Systems')?.value?.toFixed(),
      // ieg_production: item?.iegScores?.find((o) => o?.category?.name === 'Production, Continuous Impovement & Innovation')?.value?.toFixed(),
      // ieg_procurement_supply: item?.iegScores?.find((o) => o?.category?.name === 'Procurement & Inputs Management')?.value?.toFixed(),
      // ieg_public_engagement: item?.iegScores?.find((o) => o?.category?.name === 'Public Engagement')?.value?.toFixed(),
      // ieg_governance: item?.iegScores?.find((o) => o?.category?.name === 'Governance & Leadership Culture')?.value?.toFixed(),
      // // Brand Name
      // brand_name: item?.brands?.map((x) => x?.name + ':' + getScore(x) + '\r\n')
    }
  ));

  // const getCompanyScores = async (company) => {
  //     try {
  //       const res = await request(true).get(`companies/${company.id}/${selectedCycle}/aggs`);
  //       if (res.status === 200) {
  //         console.log('SATScores', res);
  //         if (res.data) {
  //           setSATData([res.data]);
  //           setIVCData([res.data]);
  //         }
  //       } else {

  //       }
  //     } catch (error) {
  //       console.log('SATScoresError', error);
  //       setLoading(false);
  //       return toast({
  //         status: 'error',
  //         title: 'Error',
  //         position: 'top-right',
  //         description: 'Error getting SAT scores',
  //         duration: 6000,
  //         isClosable: true,
  //       });
  //     }
  //   };

  const dataFromListOfUsersState = () => {
    return companyData;
  };

  // const getCompanyScores = (company) => {
  //   try {
  //     if (!isLoading) {
  //       setIsLoading(true);
  //       const res = await request(true).get(`companies/${company.id}/${selectedCycle}/aggs`);
  //       if (res.status === 200) {
  //         if (res.data) {
  //           setCompanyData([res.data]);
  //         }
  //         setIsLoading(false);
  //       } else {
  //         setCompanyData([]);
  //       }
  //     } else {
  //       setIsLoading(false);
  //     }
  //   } catch (error) {
  //     console.log('getCompanyScores', error);
  //     setIsLoading(false);
  //     return toast({
  //       status: 'error',
  //       title: 'Error',
  //       position: 'top-right',
  //       description: 'Error getting SAT scores',
  //       duration: 6000,
  //       isClosable: true,
  //     });
  //   }
  // };

  const exportSAT = (company) => {
    if (!loading) {
      setLoading(true);
      request(true).get(`admin/sat-export/${company.id}/${selectedCycle}`).then((response) => {
        setLoading(false);
        console.log('exportSAT', response);
        return toast({
          status: 'success',
          title: 'Success',
          position: 'top-right',
          description: 'SAT Exported Successfully. Please check your email Tobi',
          duration: 6000,
          isClosable: true,
        });
      }).catch((error) => {
        console.log('exportSAT', error);
        setLoading(false);
      });
    }
  };
  const removeCompany = (company) => {
    if (!loading) {
      setLoading(true);
      request(true).delete(`admin/company/delete/${company.id}`).then((response) => {
        setLoading(false);
        console.log('removeCompany', response);
        return toast({
          status: 'success',
          title: 'Success',
          position: 'top-right',
          description: 'Company removed successfully',
          duration: 6000,
          isClosable: true,
        });
      }).catch((error) => {
        console.log('removeCompany', error);
        setLoading(false);
        return toast({
          status: 'error',
          title: 'Error',
          position: 'top-right',
          description: 'Error removing company',
          duration: 6000,
          isClosable: true,
        });
      });
    }
  };
  /**
   * Fetches company scores for SAT, PT, and IEG, and prepares downloadable CSV data.
   *
   * @param {Object} company - The company object containing at least an `id` field.
   * @returns {void}
   */
  const getCompanyScores = (company) => {
    if (!loading) {
      setLoading(true);
      // Send GET request to fetch aggregated scores for the selected company and cycle.
      request(true).get(`companies/${company.id}/${selectedCycle}/aggs`).then((userListJson) => {
        // Transform brand and score data for CSV export of individual brand metrics.
        const cleanedData = userListJson.data.brands.map((item) => {
          return {
            company_name: userListJson.data.company_name,
            brand_name: item.name,
            product_type: item.productType.name,
            sat_score: (userListJson.data.ivcTotal * 0.50).toFixed(2),
            pt_score: item.productType.aflatoxin ? item.productTests[0]?.fortification?.overallKMFIWeightedScore.toFixed(2) : item.productTests[0]?.fortification.score.toFixed(2),
            ieg_score: (userListJson.data.iegTotal * 0.20).toFixed(2),
            overall_score: ((userListJson.data.ivcTotal * 0.50) + (item.productType.aflatoxin ? item.productTests[0]?.fortification.overallKMFIWeightedScore : item.productTests[0]?.fortification.score) + (userListJson.data.iegTotal * 0.20)).toFixed(2)
          };
        });

        // Prepare SAT-related scores for company-wide CSV export.
        const cleanedSATData =
          {
            company_name: userListJson.data.company_name,
            self_assessment_tool: userListJson.data.satTotal.toFixed(2),
            sat_people_management: userListJson.data.satScores?.find((o) => o?.name === 'People Management Systems')?.score?.toFixed(2),
            sat_production: userListJson.data.satScores?.find((o) => o?.name === 'Production, Continuous Impovement & Innovation')?.score?.toFixed(2),
            sat_procurement_supply: userListJson.data.satScores?.find((o) => o?.name === 'Procurement & Inputs Management')?.score?.toFixed(2),
            sat_public_engagement: userListJson.data.satScores?.find((o) => o?.name === 'Public Engagement')?.score?.toFixed(2),
            sat_governance: userListJson.data.satScores?.find((o) => o?.name === 'Governance & Leadership Culture')?.score?.toFixed(2),
            validated_scores: userListJson.data.ivcTotal.toFixed(2),
            ivc_people_management: userListJson.data.ivcScores?.find((o) => o?.name === 'People Management Systems')?.score?.toFixed(2),
            ivc_production: userListJson.data.ivcScores?.find((o) => o?.name === 'Production, Continuous Impovement & Innovation')?.score?.toFixed(2),
            ivc_procurement_supply: userListJson.data.ivcScores?.find((o) => o?.name === 'Procurement & Inputs Management')?.score?.toFixed(2),
            ivc_public_engagement: userListJson.data.ivcScores?.find((o) => o?.name === 'Public Engagement')?.score?.toFixed(2),
            ivc_governance: userListJson.data.ivcScores?.find((o) => o?.name === 'Governance & Leadership Culture')?.score?.toFixed(2),
            industry_expert_group: userListJson.data.iegTotal.toFixed(2),
            ieg_personnel: userListJson.data.iegScores?.find((o) => o?.category?.name === 'People Management Systems')?.value?.toFixed(2),
            ieg_production: userListJson.data.iegScores?.find((o) => o?.category?.name === 'Production, Continuous Impovement & Innovation')?.value?.toFixed(2),
            ieg_procurement_supply: userListJson.data.iegScores?.find((o) => o?.category?.name === 'Procurement & Inputs Management')?.value?.toFixed(2),
            ieg_public_engagement: userListJson.data.iegScores?.find((o) => o?.category?.name === 'Public Engagement')?.value?.toFixed(2),
            ieg_governance: userListJson.data.iegScores?.find((o) => o?.category?.name === 'Governance & Leadership Culture')?.value?.toFixed(2),
          };
        // const opts1 = {header: false};
        const parser = new Parser();
        const csv = parser.parse(cleanedData);
        // const opts2 = {header: false};
        const parser2 = new Parser();
        const csvSAT = parser2.parse(cleanedSATData);

        // Set the transformed CSV data into component state for download triggers.
        setCompanyData(csv);
        setCSVSatData(csvSAT);
        setLoading(false);
        // Indicate that CSV download is ready to be triggered.
        setCompanyDataReady(true);
        setTimeout(() => {
          setCompanyDataReady(false);
        }, 5000);
      }).catch((error) => {
        // Log and handle any errors that occur during the fetch process.
        console.log('getCompanyScores', error);
        setLoading(false);
      });
    }
  };

  if (selected == 'CD') {
    return (
      <div>
        {
          <CompanyDashboard cycle={cycles[cycles.map((e) => e.id).indexOf(selectedCycle)]} company={company} />
        }
      </div>
    );
  } else {
    return (
      <div>
        {selected == 'IVCAssessment' ? (
          <IvcAssessment
            cycleId={selectedCycle}
            companyDetailsIVC={allIndustryScores?.map((company) => company)}
          />
        ) : (
          <>
            <Box bg="#fff" fontFamily="DM Sans">
              <Container maxW="container.xl" border="1px" borderColor="gray.200">
                <Flex direction="row" justify="space-between" alignItems="center" p="1rem">
                  <Text fontSize="1.25rem" fontWeight="700" lineHeight="1.6275rem">
                    Companies Index
                  </Text>
                  <Button
                    colorScheme="teal"
                    loadingText="Refreshing..."
                    w="8.3125rem"
                    marginRight="10px"
                    bg="#00B27A"
                    fontSize="13px"
                    color="#ffffff"
                    onClick={() => getRemoteCompanies(selectedCycle)}
                  >
                    Refresh
                  </Button>
                  {/* <CSVLink data={dataCSV} headers={headers} target="_blank">
                    <Button
                      colorScheme="teal"
                      loadingText="Downloading"
                      w="8.3125rem"
                      marginRight="0.5rem"
                      bg="#00B27A"
                      fontSize="13px"
                      color="#ffffff"
                    >
                      Download CSV
                    </Button>
                  </CSVLink> */}
                  {companyDataReady && (
                    <>
                      <CSVDownload data={companyData} target="_blank" />
                      <CSVDownload data={CSVSatData} target="_blank" />
                    </>

                  )}

                </Flex>
              </Container>
              <Divider borderWidth="1px" />

              <Container maxW="container.xl" border="1px" borderColor="gray.200">
                <Flex
                  direction="row"
                  justify="space-between"
                  alignItems="center"
                  p="1rem"
                  width="100%"
                >
                  <InputField
                    placeholder="Search"
                    name="search"
                    onChange={(e) => setInput(e.target.value)}
                    bg="rgba(44,42,100,0.03)"
                    variant="filled"
                    width="31.25rem"
                  />

                  <Flex direction="row" justify="space-between" width="70rem">
                    {/* <CustomSelect filter={sorted} placeholder="Sort" onChange={sortCompany} /> */}
                    <Select
                      size="md"
                      style={{marginTop: '9px', marginLeft: '5px', marginRight: '10px'}}
                      placeholder="Sort"
                      onChange={sortCompany}
                    >
                      <option value="created_at">Date added</option>
                      <option value="company_name">A-Z, Top - Bottom</option>
                      <option value="company_name">A-Z, Bottom - Top</option>
                    </Select>
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
                  </Flex>
                </Flex>
              </Container>
            </Box>
            {/* Header Ends  */}

            <Container
              maxW="container.xl"
              border="1px solid gray.200"
              className="background-color-4"
              p="2.5rem"
              height="100vh"
              fontFamily="DM Sans"
            >
              <Text
                fontFamily="DM Sans"
                fontWeight="500"
                fontSize="0.875rem"
                fontStyle="normal"
                color="#1C1D26"
                my="1.5rem"
              >
                Showing {allIndustryScores?.length} Companies
              </Text>
              <Box key={nanoid()} className="table width-full border-1px rounded-large mb-16">
                <Flex
                  key={nanoid()}
                  className="table-header padding-x-5 padding-y-4 all-caps text-xs letters-looser border-bottom-1px"
                >
                  <Box width="4%" className="margin-right-2">
                    Menu
                  </Box>
                  <Box flex="0 0 auto" width="25%" className="margin-right-2 ">
                    Company Name
                  </Box>
                  <Box
                    flex="0 0 auto"
                    width="18%"
                    className="margin-right-2 flex-align-center tablet-width-full"
                  >
                    SAT & IVC Scores
                  </Box>
                  <Box
                    flex="0 0 auto"
                    width="10%"
                    className="margin-right-2 flex-align-center tablet-width-full"
                  >
                    IEG Scores
                  </Box>
                  <Box flex="0 0 auto" width="30%" className="margin-right-2 tablet-width-full">
                    Product Testing
                  </Box>
                </Flex>
                {loading ? (
                  <Flex
                    height="100%"
                    width="100%"
                    mb="10"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Spinner />
                  </Flex>
                ) : (
                  allIndustryScores?.map((company) => (
                    <Box key={nanoid()} className="">
                      <Flex
                        key={nanoid()}
                        direction="row"
                        className="table-body flex-row-middle flex-align-baseline width-full tablet-flex-column p-5 background-color-white rounded-large"
                      >
                        <Box width="4%" className="margin-right-2 ">
                          <Menu isLazy>
                            <MenuButton
                              as={IconButton}
                              aria-label="Menu"
                              icon={<MdMenu />}
                              variant="outline"
                              size="xs"
                            />
                            <MenuList>
                              <MenuItem value="companyDashboard" icon={<MdDashboard />} onClick={() => {
                                setCompany(company); setSelected('CD');
                              }}>
                                Company Dashboard
                              </MenuItem>
                              <MenuItem value="export" icon={<FiUpload />} onClick={() => getCompanyScores(company)} closeOnSelect={false}>
                                Export
                              </MenuItem>
                              {user?.admin_user?.role?.value === 'nuclear_admin' ? (
                                <MenuItem value="exportsat" icon={<FiUpload />} onClick={() => exportSAT(company)} closeOnSelect={false}>
                                  Export SAT
                                </MenuItem>
                              ) : (
                                ''
                              )}


                              {user?.admin_user?.role?.value === 'nuclear_admin' ? (
                                <MenuItem
                                  value="delete"
                                  color="red"
                                  icon={<FiTrash color='red' />}
                                  onClick={() => removeCompany(company)}
                                >
                                        Delete
                                </MenuItem>
                              ) : (
                                ''
                              )}
                            </MenuList>
                          </Menu>
                        </Box>
                        <Box
                          flex="0 0 auto"
                          width="25%"
                          className="margin-right-2 tablet-width-full"
                        >
                          <HStack>
                            <Text
                              flexGrow="1"
                              maxWidth="220px"
                              key={nanoid()}
                              className="weight-medium text-color-1 uppercase"
                              isTruncated
                              title={company?.company_name}
                            >
                              {company?.company_name}
                            </Text>
                            <Tooltip hasArrow label={company?.tier} bg="gray.300" color="black">
                              <span>
                                <FiInfo size={'12px'}/>
                              </span>
                            </Tooltip>
                          </HStack>
                        </Box>
                        <Box
                          flex="0 0 auto"
                          width="18%"
                          className="margin-right-2 tablet-width-full "
                        >
                          <HStack width="157px" justifyContent="space-around">
                            <Tooltip hasArrow label="SAT Score">
                              <span>
                                {company?.computedScores
                                  ?.find((o) => o.score_type === 'SAT')
                                  ?.value?.toFixed()}
                                %
                              </span>
                            </Tooltip>
                            <Tooltip hasArrow label="SAT% Completed">
                              <span>
                                {company?.computedScores
                                  ?.find((o) => o.score_type === 'SAT_COMPLETION')
                                  ?.value?.toFixed()}
                                %
                              </span>
                            </Tooltip>
                            <Tooltip hasArrow label="IVC Score">
                              <span>
                                {company?.computedScores
                                  ?.find((o) => o.score_type === 'IVC')
                                  ?.value?.toFixed()}
                                %
                              </span>
                            </Tooltip>
                            <Tooltip hasArrow label="IVC Completion">
                              <span>
                                {company?.computedScores
                                  ?.find((o) => o.score_type === 'IVC_COMPLETION')
                                  ?.value?.toFixed()}
                                %
                              </span>
                            </Tooltip>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                aria-label="Menu"
                                icon={<MdMoreVert />}
                                variant="ghost"
                                size="xs"
                              />
                              <MenuList>
                                {user.admin_user.role.value === 'nuclear_admin' ||
                                  user.admin_user.role.value === 'super_admin' || user.admin_user.role.value ? (
                                      <IndustryPermissionRequest
                                        key={nanoid()}
                                        permissionRequest={company}
                                        cycle={selectedCycle}
                                      />
                                    ) : (
                                      ''
                                    )}
                                {user.admin_user.role.value === 'nuclear_admin' ||
                                  user.admin_user.role.value === 'super_admin' || user.admin_user.role.value ==='ivc' ? (
                                      <ComputeSATScores
                                        key={nanoid()}
                                        company={company}
                                        cycle={selectedCycle}
                                      />
                                    ) : (
                                      ''
                                    )}
                                <MenuItem
                                  value="editIVC"
                                  icon={<FiEdit strokeWidth="3" />}
                                  onClick={() => getSATScores(company)}
                                >
                                  Edit IVC
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </HStack>
                        </Box>
                        <Box
                          flex="0 0 auto"
                          width="10%"
                          className="margin-right-2 tablet-width-full"
                        >
                          {user?.admin_user?.role?.value === 'nuclear_admin' ||
                          user?.admin_user?.role?.value === 'super_admin' ? (
                                <IndustryExpertScoresV2
                                  key={nanoid()}
                                  cycleId={selectedCycle}
                                  company={company}
                                />
                              ) : (
                                ''
                              )}
                        </Box>
                        <Box
                          flex="0 0 auto"
                          width="30%"
                          className="margin-right-2 tablet-width-full"
                        >
                          <ProductScoreCardV2
                            cycleId={selectedCycle}
                            key={nanoid()}
                            company={company}
                          />
                        </Box>
                      </Flex>
                      <Divider bg="#000000" border="1px" borderColor="#FAFAFA" />
                    </Box>
                  ))
                )}
              </Box>
              <PaginationButtons />
            </Container>
          </>
        )}
      </div>
    );
  }
};


export default Companies;
