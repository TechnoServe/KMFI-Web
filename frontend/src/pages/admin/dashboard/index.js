/* eslint-disable react/prop-types */
import React, {useState, useRef, useEffect} from 'react';
import ReactToPrint from 'react-to-print';
// import { Flex, Text, Spinner, Divider, Stack, Select } from '@chakra-ui/react';
import {Flex, Text, Spinner, Divider, Stack} from '@chakra-ui/react';

// import AssessmentChart from './component/assessment-chart';
// import ProgressChart from './component/progress-chart';
import PieChart from './component/pie-chart';
import {nanoid} from '@reduxjs/toolkit';
import {Link} from 'react-router-dom';
import {usePagination} from 'components/usePagination';
import {usePaginationWheatFlourButtons} from 'components/usePaginationWheatFlour';
import {usePaginationEdibleOilButtons} from 'components/usePaginationEdibleOil';
import {usePaginationMaizeFlourButtons} from 'components/usePaginationMaizeFlour';
import Performance from './component/performance';
import CompanyScore from './component/company-score';
import {request} from 'common';
import {useAuth} from 'hooks/user-auth';

const Dashboard = () => {
  // const [, setTesting] = useState('WheatFlour');
  const {user} = useAuth();
  const [industry, setIndustry] = useState('All');
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [companyScores, setCompanyScores] = useState(list);
  const [companyWheatFlourScores, setCompanyWheatFlourScores] = useState(list);
  const [companyEdibleOilScores, setCompanyEdibleOilScores] = useState(list);
  const [companyMaizeFlourScores, setCompanyMaizeFlourScores] = useState(list);
  const cycle = 'xIO8ABl5Q7jmwwPK4wAg';
  // const [selectedCycle, setSelectedCycle] = useState(cycle);
  const [, setCycles] = useState([]);
  // const [companyDropDown, setCompanyDropDown] = useState(['Apple and Pears']);
  const {PaginationButtons, allIndustryScores} = usePagination(companyScores);
  const {PaginationWheatFlourButtons, wheatFlourScores} = usePaginationWheatFlourButtons(companyWheatFlourScores);
  const {PaginationEdibleOilButtons, edibleOilScores} = usePaginationEdibleOilButtons(companyEdibleOilScores);
  const {PaginationMaizeFlourButtons, maizeFlourScores} = usePaginationMaizeFlourButtons(companyMaizeFlourScores);
  const [, setEdibleOil] = useState();
  const [, setWheatFlour] = useState();
  const [, setMaizeFlour] = useState();
  const componentRef = useRef();
  const [spinning, setSpinning] = useState(false);
  const [brandsTotal, setBrandsTotal] = useState([]);
  const [response, setResponse] = useState([]);
  const [mfiScore, setMfiScore] = useState([]);
  const [maizeFlourScore, setMaizeFlourScore] = useState([]);
  const [edibleOilScore, setEdibleOilScore] = useState([]);
  const [wheatFlourScore, setWheatFlourScore] = useState([]);
  // const [SAMaizeFlour, setSAMaizeFlour] = useState(0);

  // const rangeScore = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, , 110, 120, 130];
  /**
   * Fetches the list of companies and filters them based on available scores and brand product tests.
   * Updates the component state with company and industry-specific score data.
   *
   * @async
   * @function
   * @returns {Promise<void>}
   */
  const getCompanyList = async () => {
    try {
      // Show loading spinner
      setSpinning(true);
      setLoading(true);
      // Make API request to fetch dashboard company data
      const res = await request(true).get(`admin/index?page-size=100`);
      setResponse(res);
      // Remove specific company by ID (possibly test or placeholder)
      const filteredResponse = res.data.filter((x) => x.id !== 'akpQPiE0sFH2iwciggHd');

      // Ensure companies have IEG, IVC, SAT scores and at least one brand with product tests
      const reFilteredResponse = filteredResponse?.filter((x) => x.iegScores.length && x.ivcScores.length && x.satScores.length && (x.brands.length > 0 && x.brands[0].productTests.length > 0));

      const resList = reFilteredResponse.map((list) => list.company_name);
      setCompanyScores(reFilteredResponse);

      // Filter companies for Wheat Flour industry scores
      setCompanyWheatFlourScores(reFilteredResponse?.filter((brand) => brand.brands.find((x) => (x.productType.value === 'Wheat Flour' && x.productTests.length > 0))));

      // Filter companies for Edible Oil industry scores
      setCompanyEdibleOilScores(reFilteredResponse?.filter((brand) => brand.brands.find((x) => (x.productType.value === 'Edible Oil' && x.productTests.length > 0))));

      // Filter companies for Maize Flour industry scores
      setCompanyMaizeFlourScores(reFilteredResponse?.filter((brand) => brand.brands.find((x) => (x.productType.value === 'Maize Flour' && x.productTests.length > 0))));

      // setCompanyDropDown(reFilteredResponse);
      setList(resList);
      // Compute total number of brands across companies
      const brands = filteredResponse.map((x) => x?.brands?.map((x) => x?.name).length);
      setBrandsTotal((brands?.reduce((accum, item) => accum + item, 0)));

      // const data = reFilteredResponse.map((product) => product.brands[0]);
      // const type = data.map((item) => item.productType);

      // Cache specific industry company lists (optional)
      setEdibleOil(reFilteredResponse.filter((data) => data?.brands[0]?.productType?.name === 'Edible Oil'));
      // Cache specific industry company lists (optional)
      setWheatFlour(reFilteredResponse.filter((data) => data?.brands[0]?.productType?.name === 'Wheat Flour'));
      // Cache specific industry company lists (optional)
      setMaizeFlour(reFilteredResponse.filter((data) => data?.brands[0]?.productType?.name === 'Maize Flour'));
      setSpinning(false);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setSpinning(false);
    }
  };


  useEffect(() => {
    getCompanyList(cycle);
  }, []);

  useEffect(() => {
    setMfiScore(0);
    setMaizeFlourScore(localStorage.getItem('maizeFlourMFI') ? JSON.parse(localStorage.getItem('maizeFlourMFI')) : 0);
    setWheatFlourScore(localStorage.getItem('wheatFlourMFI') ? JSON.parse(localStorage.getItem('wheatFlourMFI')) : 0);
    setEdibleOilScore(localStorage.getItem('edibleOilMFI') ? JSON.parse(localStorage.getItem('edibleOilMFI')) : 0);
  });

  // const onCycleChange = (evt) => {
  //   console.log(evt);
  //   const value = evt.target.options[evt.target.selectedIndex].value;
  //   console.log('Current:', value);
  //   setSelectedCycle(value);
  //   getCompanyList(value);
  // };

  /**
   * Handles selection of industry type from dropdown and updates state accordingly.
   *
   * @param {Event} e - The change event from the industry select element.
   * @returns {void}
   */
  const setAllScores = (e) => {
    setIndustry(e.target.value);
    // Handle selection logic for industry filtering
    switch (e.target.value) {
      case 'All':
        // setCompanyScores(list);
        break;
      case 'Wheat Flour':
        // setCompanyScores(wheatFlour?.map((x) => x?.company_name));
        break;
      case 'Edible Oil':
        // setCompanyScores(edibleOil?.map((x) => x?.company_name));
        break;
      case 'Maize Flour':
        // setCompanyScores(maizeFlour?.map((x) => x?.company_name));
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    /**
     * Fetches available assessment cycles for the dashboard.
     *
     * @async
     * @function
     * @returns {Promise<void>}
     */
    const getCycles = async () => {
      // setLoading(true);
      try {
        // Make API request to retrieve available assessment cycles
        const res = await request(true).get(`/admin/cycles`);
        setCycles(res.data);
        console.log('Cycle:', res.data);
        // setLoading(false);
      } catch (error) {
        // setLoading(false);
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
    getCycles();
  }, []);


  /**
   For All Industries
  * */
  // Brands SAT Charts
  let tierSatBrandTotal = [];
  tierSatBrandTotal = allIndustryScores?.map((x) => {
    return x.tier === 'TIER_1' ? x.ivcScores.map((x) => x.score / 100 * 66).reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0) : x.tier === 'TIER_3' ? x.ivcScores.map((x) => x.score).reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0) : '';
  });

  // Brands IEG Charts
  let IEGBrands = [];
  IEGBrands = allIndustryScores?.map((x) => x.iegScores.map((x) => x.value).reduce(function (accumulator, currentValue) {
    return accumulator + currentValue;
  }, 0));

  // Brands PT Charts
  let PTTesting = [];
  const latestProductTestingBrand = allIndustryScores?.map(((x) => x.brands.map((x) => x.productTests?.sort((a, b) => new Date(b.sample_production_date).getTime() - new Date(a.sample_production_date).getTime())[0])));

  const brandTesting = latestProductTestingBrand?.map((x) => x?.find((x) => x?.brand_id));

  if (brandTesting?.length > 0) {
    console.log('brandTesting', brandTesting);
    PTTesting = brandTesting?.map((x) => x?.fortification.score);
  }

  const satValueBrand = tierSatBrandTotal;
  const ptWeightedScoreBrand = (PTTesting.map((x) => x / 100 * 30));
  const iegWeightedScoreBrand = (IEGBrands.map((x) => x / 100 * 20));
  const satWeightedScoreBrand = (satValueBrand.map((x) => x / 100 * 50));
  let MFIBrandTotalBrand = [];
  MFIBrandTotalBrand = ptWeightedScoreBrand.map((val, idx) => val + iegWeightedScoreBrand[idx] + satWeightedScoreBrand[idx]);

  let sortMfiScore = [];
  sortMfiScore = allIndustryScores.map((v, i) => ({...v, mfiScore: MFIBrandTotalBrand[i]})).sort(function (a, b) {
    return b.mfiScore - a.mfiScore;
  });


  // console.log('sortMfiScore', sortMfiScore);
  /**
 For WheatFlour Industries
* */

  // Brands SAT Charts
  let tierSatBrandTotalWheatFlour = [];
  tierSatBrandTotalWheatFlour = wheatFlourScores?.map((x) => {
    return x.tier === 'TIER_1' ? x.ivcScores.map((x) => x.score / 100 * 66).reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0) : x.tier === 'TIER_3' ? x.ivcScores.map((x) => x.score).reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0) : '';
  });

  // Brands IEG Charts
  let IEGBrandsWheatFlour = [];
  IEGBrandsWheatFlour = wheatFlourScores?.map((x) => x.iegScores.map((x) => x.value).reduce(function (accumulator, currentValue) {
    return accumulator + currentValue;
  }, 0));

  // Brands PT Charts
  let PTTestingWheatFlour = [];
  const latestProductTestingBrandWheatFlour = wheatFlourScores?.map(((x) => x.brands.map((x) => x.productTests?.sort((a, b) => new Date(b.sample_production_date).getTime() - new Date(a.sample_production_date).getTime())[0])));

  const brandTestingWheatFlour = latestProductTestingBrandWheatFlour?.map((x) => x.find((x) => x?.brand_id));

  if (brandTestingWheatFlour?.length > 0) {
    console.log('brandTestingWheatFlour', brandTestingWheatFlour);
    PTTestingWheatFlour = brandTestingWheatFlour?.map((x) => x.fortification.score);
  }
  const satValueBrandWheatFlour = tierSatBrandTotalWheatFlour;
  const ptWeightedScoreBrandWheatFlour = (PTTestingWheatFlour.map((x) => x / 100 * 20));
  const iegWeightedScoreBrandWheatFlour = (IEGBrandsWheatFlour.map((x) => x / 100 * 20));
  const satWeightedScoreBrandWheatFlour = (satValueBrandWheatFlour.map((x) => x / 100 * 60));

  let MFIBrandTotalBrandWheatFlour = [];

  MFIBrandTotalBrandWheatFlour = ptWeightedScoreBrandWheatFlour.map((val, idx) => val + iegWeightedScoreBrandWheatFlour[idx] + satWeightedScoreBrandWheatFlour[idx]);

  let sortMfiScoreWheatFlour = [];
  sortMfiScoreWheatFlour = wheatFlourScores.map((v, i) => ({...v, wheatFlourScore: MFIBrandTotalBrandWheatFlour[i]})).sort(function (a, b) {
    return b.wheatFlourScore - a.wheatFlourScore;
  });

  /**
For MaizeFlour Industries
* */

  // Brands SAT Charts
  let tierSatBrandTotalMaizeFlour = [];
  tierSatBrandTotalMaizeFlour = maizeFlourScores?.map((x) => {
    return x.tier === 'TIER_1' ? x.ivcScores.map((x) => x.score / 100 * 66).reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0) : x.tier === 'TIER_3' ? x.ivcScores.map((x) => x.score).reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0) : '';
  });

  console.log(tierSatBrandTotalMaizeFlour);

  // Brands IEG Charts
  let IEGBrandsMaizeFlour = [];
  IEGBrandsMaizeFlour = maizeFlourScores?.map((x) => x.iegScores.map((x) => x.value).reduce(function (accumulator, currentValue) {
    return accumulator + currentValue;
  }, 0));
  console.log('IEGBrandsMaizeFlour', IEGBrandsMaizeFlour);
  // Brands PT Charts
  let PTTestingMaizeFlour = [];
  const latestProductTestingBrandMaizeFlour = maizeFlourScores?.map(((x) => x.brands.map((x) => x.productTests?.sort((a, b) => new Date(b.sample_production_date).getTime() - new Date(a.sample_production_date).getTime())[0])));

  const brandTestingMaizeFlour = latestProductTestingBrandMaizeFlour?.map((x) => x.find((x) => x.brand_id));

  if (brandTestingMaizeFlour?.length > 0) {
    console.log('brandTestingMaizeFlour', brandTestingMaizeFlour);
    PTTestingMaizeFlour = brandTestingMaizeFlour?.map((x) => x.fortification.score);
  }
  console.log(PTTestingMaizeFlour);
  const satValueBrandMaizeFlour = tierSatBrandTotalWheatFlour;
  const ptWeightedScoreBrandMaizeFlour = (PTTestingWheatFlour.map((x) => x / 100 * 20));
  const iegWeightedScoreBrandMaizeFlour = (IEGBrandsWheatFlour.map((x) => x / 100 * 20));
  const satWeightedScoreBrandMaizeFlour = (satValueBrandMaizeFlour.map((x) => x / 100 * 60));

  let MFIBrandTotalBrandMaizeFlour = [];

  MFIBrandTotalBrandMaizeFlour = ptWeightedScoreBrandMaizeFlour.map((val, idx) => val + iegWeightedScoreBrandMaizeFlour[idx] + satWeightedScoreBrandMaizeFlour[idx]);

  console.log(maizeFlourScores);
  let sortMfiScoreMaizeFlour = [];
  sortMfiScoreMaizeFlour = maizeFlourScores.map((v, i) => ({...v, maizeFlourScore: MFIBrandTotalBrandMaizeFlour[i]})).sort(function (a, b) {
    return b.maizeFlourScore - a.maizeFlourScore;
  });

  /**
For Edible Oil Industries
* */

  // Brands SAT Charts
  let tierSatBrandTotalEdibleOil = [];
  tierSatBrandTotalEdibleOil = edibleOilScores?.map((x) => {
    return x.tier === 'TIER_1' ? x.ivcScores.map((x) => x.score / 100 * 66).reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0) : x.tier === 'TIER_3' ? x.ivcScores.map((x) => x.score).reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0) : '';
  });

  // Brands IEG Charts
  let IEGBrandsEdibleOil = [];
  IEGBrandsEdibleOil = edibleOilScores?.map((x) => x.iegScores.map((x) => x.value).reduce(function (accumulator, currentValue) {
    return accumulator + currentValue;
  }, 0));

  // Brands PT Charts
  let PTTestingEdibleOil = [];
  const latestProductTestingBrandEdibleOil = edibleOilScores?.map(((x) => x.brands.map((x) => x.productTests?.sort((a, b) => new Date(b.sample_production_date).getTime() - new Date(a.sample_production_date).getTime())[0])));


  const brandTestingEdibleOil = latestProductTestingBrandEdibleOil?.map((x) => x.find((x) => x.brand_id));

  if (brandTestingEdibleOil?.length > 0) {
    console.log('brandTestingEdibleOil', brandTestingEdibleOil);
    PTTestingEdibleOil = brandTestingEdibleOil?.map((x) => x.fortification.score);
  }
  const satValueBrandEdibleOil = tierSatBrandTotalEdibleOil;
  const ptWeightedScoreBrandEdibleOil = (PTTestingEdibleOil.map((x) => x / 100 * 20));
  const iegWeightedScoreBrandEdibleOil = (IEGBrandsEdibleOil.map((x) => x / 100 * 20));
  const satWeightedScoreBrandEdibleOil = (satValueBrandEdibleOil.map((x) => x / 100 * 60));

  let MFIBrandTotalBrandEdibleOil = [];

  MFIBrandTotalBrandEdibleOil = ptWeightedScoreBrandEdibleOil.map((val, idx) => val + iegWeightedScoreBrandEdibleOil[idx] + satWeightedScoreBrandEdibleOil[idx]);

  let sortMfiScoreEdibleOil = [];
  sortMfiScoreEdibleOil = edibleOilScores.map((v, i) => ({...v, edibleOilScore: MFIBrandTotalBrandEdibleOil[i]})).sort(function (a, b) {
    return b.edibleOilScore - a.edibleOilScore;
  });

  return loading ? (
    <Flex height="100%" width="100%" mb="10" justifyContent="center" alignItems="center">
      <Spinner />

    </Flex>
  ) : (
    <div className="padding-0 background-color-4 w-col w-col-10" style={{width: '100%'}}>
      <div className="background-color-white padding-x-10 padding-y-6 border-bottom-1px sticky-top-0 flex-row-middle flex-space-between gap">
        <h5 className="page-title">Dashboard</h5>
        <ReactToPrint
          trigger={() => (
            <button className="flex-row-middle padding-x-4 padding-y-2 background-brand rounded-large text-color-4 no-underline w-inline-block">
              <div className="padding-right-2 text-small text-color-4">Download</div>
            </button>
          )}
          content={() => componentRef.current}
        />
      </div>
      <div className="padding-10" ref={componentRef}>
        <div>
          <Flex flexDirection="row" flexWrap="wrap">
            <Flex
              className="background-color-white border-1px rounded-large padding-5"
              key={nanoid()}
              flexDirection="column"
              width="340px"
              m={3}
            >
              <Text className="margin-bottom-1 weight-medium" fontSize="18px" fontWeight="700">
                Total Brands
              </Text>
              <Text className="margin-bottom-2 weight-medium" fontSize="44px" fontWeight="700">
                {(spinning && <Spinner />) || brandsTotal}
              </Text>
            </Flex>
            {/** */}
            <Flex
              className="background-color-white border-1px rounded-large padding-5"
              key={nanoid()}
              flexDirection="column"
              width="340px"
              m={3}
            >
              <Text
                className="margin-bottom-1 weight-medium"
                mb={5}
                fontSize="18px"
                fontWeight="700"
              >
                Industry Breakdown
              </Text>
              <PieChart
                response={response}
                bg={[
                  'rgb(103, 197, 134)',
                  'rgb(233, 246, 237)',
                  'rgb(169, 222, 186)',
                  'rgb(200, 234, 211)',
                ]}
              />
            </Flex>
            {/** */}
            <Flex
              className="background-color-white border-1px rounded-large padding-5"
              key={nanoid()}
              flexDirection="column"
              width="340px"
              m={3}
            >
              <Text className="margin-bottom-1 weight-medium" fontSize="18px" fontWeight="700">
                Average Score for{' '}
                <Link to="/admin/dashboard" style={{textDecoration: 'underline', color: 'gray'}}>
                  all industries
                </Link>
              </Text>
              <Text className="margin-bottom-2 weight-medium" fontSize="44px" fontWeight="700">
                {mfiScore}%
              </Text>
            </Flex>
          </Flex>
          {/** TOP */}
          {(!loading && (user?.admin_user?.role?.value === 'nuclear_admin' || user?.admin_user?.role?.value === 'super_admin')) &&
            <Performance name={'MFI Performance By Fortified Staple Food Vehicle'} companies={companyScores} />
          }
          <div className="margin-top-5 background-color-white radius-large padding-5 border-1px">
            <div>
              <div>
                {(user?.admin_user?.role?.value === 'nuclear_admin' || user?.admin_user?.role?.value === 'super_admin') &&
                  <Text className="margin-bottom-5 weight-medium" fontSize="15px" fontWeight="700">
                    Brand Score vs Industry Average
                  </Text>
                }
                {(user?.admin_user?.role?.value === 'nuclear_admin' || user?.admin_user?.role?.value === 'super_admin') &&
                  <div className="text-small text-color-body-text margin-top-2 margin-bottom-2">
                    Brand scores are compared with the average industry score
                  </div>
                }
              </div>
              <Flex>
              </Flex>
            </div>
            {(!loading && (user?.admin_user?.role?.value === 'nuclear_admin' || user?.admin_user?.role?.value === 'super_admin')) &&
              <CompanyScore companies={companyScores} />
            }
          </div>


          <div className="margin-top-5 background-color-white radius-large padding-5 border-1px">
            <div>
              <div>
                <Text className="margin-bottom-5 weight-medium" fontSize="15px" fontWeight="700">
                  All Scores
                </Text>
                <div className="text-small text-color-body-text margin-top-2 margin-bottom-2">
                  All ranked company scores compared with the average industry scores
                </div>
              </div>
              <Flex>
                <form
                  id="email-form"
                  name="email-form"
                  data-name="Email Form"
                  className="flex-row-middle"
                  style={{width: 200, padding: 10}}
                >
                  <select
                    id="field-2"
                    name="field-2"
                    onChange={setAllScores}
                    data-name="Field 2"
                    className="border-1px rounded-large background-color-white w-select"
                  >
                    <option value="All">All industries</option>
                    <option value="Wheat Flour">Wheat Flour</option>
                    <option value="Edible Oil">Edible Oil</option>
                    <option value="Maize Flour">Maize Flour</option>
                  </select>
                </form>
                <form
                  id="email-form"
                  name="email-form"
                  data-name="Email Form"
                  className="flex-row-middle"
                  style={{width: 350, padding: 10}}
                >
                </form>
              </Flex>
            </div>
            <Divider />

            {/* All Industries */}
            {industry === 'All' ?
                <Flex paddingX="60px" paddingY="30px" flexDirection="column">
                  {(spinning && <Spinner />) || sortMfiScore?.map((x) => (
                    <div key={nanoid()}>
                      <Flex mb={8} mt={8}>
                        <Text className="margin-bottom-1" fontSize="16px" mr={10} style={{width: '100px'}}>
                          {x?.company_name}
                        </Text>
                        <Stack flex={1} alignSelf="center">
                          {/* <ProgressChart size={rangeScore} range={74} /> */}
                          <div className="progress-bar">
                            <div style={{
                              width: `${x?.mfiScore}%`
                            }} className="progress"></div>
                            <div style={{width: `${mfiScore}%`}} className="progress2"></div>
                          </div>
                        </Stack>
                      </Flex>
                      <Divider />
                    </div>
                  ))}
                  <PaginationButtons />
                </Flex>
              :
              industry === 'Wheat Flour' ?
                  <Flex paddingX="60px" paddingY="30px" flexDirection="column">
                    {(spinning && <Spinner />) || sortMfiScoreWheatFlour?.map((x) => (
                      <div key={nanoid()}>
                        <Flex mb={8} mt={8}>
                          <Text className="margin-bottom-1" fontSize="16px" mr={10} style={{width: '100px'}}>
                            {x?.company_name}
                          </Text>
                          <Stack flex={1} alignSelf="center">
                            {/* <ProgressChart size={rangeScore} range={74} /> */}
                            <div className="progress-bar">
                              <div style={{width: `${x?.wheatFlourScore}%`}} className="progress"></div>
                              <div style={{width: `${wheatFlourScore}%`}} className="progress2"></div>
                            </div>
                          </Stack>
                        </Flex>
                        <Divider />
                      </div>
                    ))}
                    <PaginationWheatFlourButtons />
                  </Flex>
                :
                industry === 'Edible Oil' ?
                    <Flex paddingX="60px" paddingY="30px" flexDirection="column">
                      {(spinning && <Spinner />) || sortMfiScoreEdibleOil?.map((x) => (
                        <div key={nanoid()}>
                          <Flex mb={8} mt={8}>
                            <Text className="margin-bottom-1" fontSize="16px" mr={10} style={{width: '100px'}}>
                              {x?.company_name}
                            </Text>
                            <Stack flex={1} alignSelf="center">
                              {/* <ProgressChart size={rangeScore} range={74} /> */}
                              <div className="progress-bar">
                                <div style={{width: `${x?.edibleOilScore}%`}} className="progress"></div>
                                <div style={{width: `${edibleOilScore}%`}} className="progress2"></div>
                              </div>
                            </Stack>
                          </Flex>
                          <Divider />
                        </div>
                      ))}
                      <PaginationEdibleOilButtons />
                    </Flex>
                  :
                  industry === 'Maize Flour' ?
                      <Flex paddingX="60px" paddingY="30px" flexDirection="column">
                        {(spinning && <Spinner />) || sortMfiScoreMaizeFlour?.map((x) => (
                          <div key={nanoid()}>
                            <Flex mb={8} mt={8}>
                              <Text className="margin-bottom-1" fontSize="16px" mr={10} style={{width: '100px'}}>
                                {x?.company_name}
                              </Text>
                              <Stack flex={1} alignSelf="center">
                                {/* <ProgressChart size={rangeScore} range={74} /> */}
                                <div className="progress-bar">
                                  <div style={{width: `${x?.maizeFlourScore}%`}} className="progress"></div>
                                  <div style={{width: `${maizeFlourScore}%`}} className="progress2"></div>
                                </div>
                              </Stack>
                            </Flex>
                            <Divider />
                          </div>
                        ))}
                        <PaginationMaizeFlourButtons />
                      </Flex>
                    : ''
            }
          </div>

        </div>
        <div className="border-top-1px margin-top-10 padding-top-5 flex-space-between">
          <div className="text-xs text-color-body-text">© Copyright MFI. All rights reserved</div>
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
