/**
 * Renders the Performance dashboard card with industry assessment metrics.
 *
 * @param {Object} props - Component props
 * @param {string} props.name - The title for the chart card.
 * @param {Array} props.companies - Array of company data objects with brand and score information.
 * @returns {JSX.Element} A component containing performance selectors and the AssessmentChart.
 */
import {Text, Flex, Spinner} from '@chakra-ui/react';
import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';

import AssessmentChart from './assessment-chart';
// import {request} from 'common';

const Performance = ({name, companies}) => {
  // Define all chart score states and industry metadata
  // Chart States for MaizeFlour
  const [SAMaizeFlour, setSAMaizeFlour] = useState(0);
  const [IEGMaizeFlour, setIEGMaizeFlour] = useState(0);
  const [PTMaizeFlour, setPTMaizeFlour] = useState(0);
  const [MFIMaizeFlour, setMFIMaizeFlour] = useState(0);

  // Chart state for WheatFlour
  const [SAWheatFlour, setSAWheatFlour] = useState(0);
  const [IEGWheatFlour, setIEGWheatFlour] = useState(0);
  const [PTWheatFlour, setPTWheatFlour] = useState(0);
  const [mfiWheatFlourData, setMFIWheatFlourData] = useState(0);

  // Chart state for Edible Oil
  const [SAEdibleOils, setSAEdibleOils] = useState(0);
  const [IEGEdibleOils, setIEGEdibleOils] = useState(0);
  const [PTEdibleOils, setPTEdibleOils] = useState(0);
  const [MFIEdibleOils, setMFIEdibleOils] = useState(0);
  const [industry, setIndustry] = useState('Wheat Flour');
  // 71, 91, 66, 18
  const [industryScores, setIndustryScores] = useState([]);
  const [loading, setLoading] = useState(false);

  const [edibleOil, setEdibleOil] = useState();
  const [wheatFlour, setWheatFlour] = useState();
  const [maizeFlour, setMaizeFlour] = useState();
  const [filteredData, setFilteredData] = useState();
  // const toast = useToast();

  console.log(loading);
  // Trigger initial data processing when key chart scores change
  useEffect(() => {
    getCompanies();
  }, [mfiWheatFlourData, SAWheatFlour, IEGWheatFlour, PTWheatFlour]);

  // const getCompaniesOld = async () => {
  //   setLoading(true);
  //   console.log(loading);
  //   try {
  //     const {
  //       data: {data: res},
  //     } = await request().get(`/ranking-list?page-size=30`);
  //     const filteredResponse = res.filter((x) => x.id !== 'akpQPiE0sFH2iwciggHd');

  //     const reFilteredResponse = filteredResponse?.filter((x) => x.iegScores.length && x.ivcScores.length && x.satScores.length);
  //     setFilteredData(reFilteredResponse);

  //     const dataEdibleOil = reFilteredResponse?.map((product) => product?.brands.map((item) => item?.productType).filter((x) => x.name === 'Edible Oil').map((x) => x?.name).length);

  //     const dataWheatFlour = reFilteredResponse?.map((product) => product?.brands.map((item) => item?.productType).filter((x) => x.name === 'Wheat Flour').map((x) => x?.name).length);

  //     const dataMaizeFlour = reFilteredResponse?.map((product) => product?.brands.map((item) => item?.productType).filter((x) => x.name === 'Maize Flour').map((x) => x?.name).length);

  //     setEdibleOil(dataEdibleOil.reduce(function (accumulator, currentValue) {
  //       return accumulator + currentValue;
  //     }, 0));
  //     setWheatFlour(dataWheatFlour.reduce(function (accumulator, currentValue) {
  //       return accumulator + currentValue;
  //     }, 0));
  //     setMaizeFlour(dataMaizeFlour.reduce(function (accumulator, currentValue) {
  //       return accumulator + currentValue;
  //     }, 0));

  //     // MaizeFlour SAT Charts
  //     const selfAssessmentMaizeFlour = reFilteredResponse?.filter((brand) => brand.brands.find((x) => x.productType.name.includes('Maize Flour')));

  //     // Tier One Breakdown
  //     const tierOneSAMaizeFlour = selfAssessmentMaizeFlour.filter((x) => x.tier.includes('TIER_1'));
  //     const tierOneSAMaizeFlourBrands = tierOneSAMaizeFlour.map((x) => x.brands.map((x) => x.productType.name === 'Edible Oil').filter(Boolean).length);

  //     const tierOneSatMaizeFlour = tierOneSAMaizeFlour.filter((x) => x.tier.includes('TIER_1')).map((x) => x.ivcScores.map((x) => x.score).reduce(function (accumulator, currentValue) {
  //       return accumulator + currentValue;
  //     }));

  //     const percentageTierOneSatMaizeFlour = tierOneSatMaizeFlour.map((x) => x / 100 * 66);
  //     const totalTierOneSATMaizeFlour = tierOneSAMaizeFlourBrands.reduce(function (r, a, i) {
  //       return r + a * percentageTierOneSatMaizeFlour[i];
  //     }, 0) / tierOneSAMaizeFlourBrands.reduce(function (accumulator, currentValue) {
  //       return accumulator + currentValue;
  //     }, 0);


  //     // Tier Three Breakdown
  //     const tierThreeSAMaizeFlour = selfAssessmentMaizeFlour.filter((x) => x.tier.includes('TIER_3'));

  //     const tierThreeSAMaizeFlourBrands = tierThreeSAMaizeFlour.map((x) => x.brands.map((x) => x.productType.name === 'Maize Flour').filter(Boolean).length);

  //     const tierThreeSatMaizeFlour = tierThreeSAMaizeFlour.filter((x) => x.tier.includes('TIER_3')).map((x) => x.ivcScores.map((x) => x.score).reduce(function (accumulator, currentValue) {
  //       return accumulator + currentValue;
  //     }));

  //     const totalTierThreeSATMaizeFlour = tierThreeSAMaizeFlourBrands.reduce(function (r, a, i) {
  //       return r + a * tierThreeSatMaizeFlour[i];
  //     }, 0) / tierThreeSAMaizeFlourBrands.reduce(function (accumulator, currentValue) {
  //       return accumulator + currentValue;
  //     }, 0);

  //     if (totalTierOneSATMaizeFlour || 0 === 0) {
  //       const tierOneAndTierThreeMaizeFlourTotal = totalTierThreeSATMaizeFlour;
  //       setSAMaizeFlour(tierOneAndTierThreeMaizeFlourTotal.toFixed());
  //     }

  //     if (totalTierOneSATMaizeFlour > 0) {
  //       const tierOneAndTierThreeMaizeFlourTotal = totalTierThreeSATMaizeFlour + totalTierOneSATMaizeFlour || 0;
  //       setSAMaizeFlour((tierOneAndTierThreeMaizeFlourTotal / 2).toFixed());
  //     }

  //     // MaizeFlour IEG Charts
  //     const industryExpertMaizeFlour = reFilteredResponse?.filter((brand) => brand.brands.find((x) => x.productType.name.includes('Maize Flour')));

  //     const culIndustryExpertMaizeFlour = industryExpertMaizeFlour?.map((x) => x.iegScores.map((x) => x.value).reduce(function (accumulator, currentValue) {
  //       return accumulator + currentValue;
  //     }, 0));

  //     const industryExpertMaizeFlourBrands = industryExpertMaizeFlour.map((x) => x.brands.map((x) => x.productType.name === 'Maize Flour').filter(Boolean).length);

  //     const totalIEGmaizeFlour = industryExpertMaizeFlourBrands.reduce(function (r, a, i) {
  //       return r + a * culIndustryExpertMaizeFlour[i];
  //     }, 0) / dataMaizeFlour.reduce(function (accumulator, currentValue) {
  //       return accumulator + currentValue;
  //     }, 0);
  //     setIEGMaizeFlour(totalIEGmaizeFlour.toFixed());

  //     // MaizeFlour PT Charts
  //     const filterMaizeFlour = reFilteredResponse?.filter((brand) => brand.brands.find((x) => x.productType.value === 'Maize Flour'));

  //     const culProductTestingMaizeFlour = filterMaizeFlour.map((x) => x.brands.filter((x) => x.productType.name === 'Maize Flour'));

  //     const latestProductTestingMaizeFlour = culProductTestingMaizeFlour.map(((x) => x.map((x) => x.productTests.sort((a, b) => new Date(b.sample_production_date).getTime() - new Date(a.sample_production_date).getTime())[0])));

  //     const fortifyProductTestingMaizeFlour = latestProductTestingMaizeFlour.map((x) => x.map((x) => x.fortification));

  //     const addProductTestingMaizeFlour = fortifyProductTestingMaizeFlour.map((x) => x.map((x) => x.score).reduce((sum, x) => sum + x, 0));

  //     const totalProductTestingMaizeFlour = addProductTestingMaizeFlour.reduce(function (accumulator, currentValue) {
  //       return accumulator + currentValue;
  //     }, 0) / dataMaizeFlour.reduce(function (accumulator, currentValue) {
  //       return accumulator + currentValue;
  //     }, 0);

  //     setPTMaizeFlour(totalProductTestingMaizeFlour.toFixed());

  //     // WheatFlour SAT Charts
  //     const selfAssessmentWheatFlour = reFilteredResponse?.filter((brand) => brand.brands.find((x) => x.productType.name.includes('Wheat Flour')));

  //     // Tier One Breakdown
  //     const tierOneSAWheatFlour = selfAssessmentWheatFlour.filter((x) => x.tier.includes('TIER_1'));
  //     const tierOneSAWheatFlourBrands = tierOneSAWheatFlour.map((x) => x.brands.map((x) => x.productType.name === 'Edible Oil').filter(Boolean).length);

  //     const tierOneSatWheatFlour = tierOneSAWheatFlour.filter((x) => x.tier.includes('TIER_1')).map((x) => x.ivcScores.map((x) => x.score).reduce(function (accumulator, currentValue) {
  //       return accumulator + currentValue;
  //     }));

  //     const percentageTierOneSatWheatFlour = tierOneSatWheatFlour.map((x) => x / 100 * 66);
  //     const totalTierOneSATWheatFlour = tierOneSAWheatFlourBrands.reduce(function (r, a, i) {
  //       return r + a * percentageTierOneSatWheatFlour[i];
  //     }, 0) / tierOneSAWheatFlourBrands.reduce(function (accumulator, currentValue) {
  //       return accumulator + currentValue;
  //     }, 0);


  //     // Tier Three Breakdown
  //     const tierThreeSAWheatFlour = selfAssessmentWheatFlour.filter((x) => x.tier.includes('TIER_3'));

  //     const tierThreeSAWheatFlourBrands = tierThreeSAWheatFlour.map((x) => x.brands.map((x) => x.productType.name === 'Wheat Flour').filter(Boolean).length);

  //     const tierThreeSatWheatFlour = tierThreeSAWheatFlour.filter((x) => x.tier.includes('TIER_3')).map((x) => x.ivcScores.map((x) => x.score).reduce(function (accumulator, currentValue) {
  //       return accumulator + currentValue;
  //     }));

  //     const totalTierThreeSATWheatFlour = tierThreeSAWheatFlourBrands.reduce(function (r, a, i) {
  //       return r + a * tierThreeSatWheatFlour[i];
  //     }, 0) / tierThreeSAWheatFlourBrands.reduce(function (accumulator, currentValue) {
  //       return accumulator + currentValue;
  //     }, 0);

  //     if (totalTierOneSATWheatFlour || 0 === 0) {
  //       setSAWheatFlour((totalTierThreeSATWheatFlour).toFixed());
  //     }

  //     if (totalTierOneSATWheatFlour > 0) {
  //       const tierOneAndTierThreeWheatFlourTotal = totalTierThreeSATWheatFlour + totalTierOneSATWheatFlour || 0;
  //       setSAWheatFlour((tierOneAndTierThreeWheatFlourTotal / 2).toFixed());
  //     }

  //     // WheatFlour  IEG Charts
  //     const industryExpertWheatFlour = reFilteredResponse?.filter((brand) => brand.brands.find((x) => x.productType.name.includes('Wheat Flour')));

  //     const culIndustryExpertWheatFlour = industryExpertWheatFlour?.map((x) => x.iegScores.map((x) => x.value).reduce(function (accumulator, currentValue) {
  //       return accumulator + currentValue;
  //     }, 0));

  //     const industryExpertWheatFlourBrands = industryExpertWheatFlour.map((x) => x.brands.map((x) => x.productType.name === 'Wheat Flour').filter(Boolean).length);

  //     const totalIEGWheatFlour = industryExpertWheatFlourBrands.reduce(function (r, a, i) {
  //       return r + a * culIndustryExpertWheatFlour[i];
  //     }, 0) / dataWheatFlour.reduce(function (accumulator, currentValue) {
  //       return accumulator + currentValue;
  //     }, 0);
  //     setIEGWheatFlour(totalIEGWheatFlour.toFixed());

  //     // WheatFlour PT Charts
  //     const filterWheatFlour = reFilteredResponse?.filter((brand) => brand.brands.find((x) => x.productType.value === 'Wheat Flour'));


  //     const culProductTestingWheatFlour = filterWheatFlour.map((x) => x.brands.filter((x) => x.productType.name === 'Wheat Flour'));

  //     const latestProductTestingWheatFlour = culProductTestingWheatFlour.map(((x) => x.map((x) => x.productTests.sort((a, b) => new Date(b.sample_production_date).getTime() - new Date(a.sample_production_date).getTime())[0])));

  //     const fortifyProductTestingWheatFlour = latestProductTestingWheatFlour.map((x) => x.map((x) => x.fortification));

  //     const addProductTestingWheatFlour = fortifyProductTestingWheatFlour.map((x) => x.map((x) => x.score).reduce((sum, x) => sum + x, 0));

  //     const totalProductTestingWheatFlour = addProductTestingWheatFlour.reduce(function (accumulator, currentValue) {
  //       return accumulator + currentValue;
  //     }, 0) / dataWheatFlour.reduce(function (accumulator, currentValue) {
  //       return accumulator + currentValue;
  //     }, 0);

  //     setPTWheatFlour(totalProductTestingWheatFlour.toFixed());

  //     // Edible Oil SAT Charts
  //     const selfAssessmentEdibleOil = reFilteredResponse?.filter((brand) => brand.brands.find((x) => x.productType.name.includes('Edible Oil')));

  //     // Tier One Breakdown
  //     const tierOneSAEdibleOil = selfAssessmentEdibleOil.filter((x) => x.tier.includes('TIER_1'));
  //     const tierOneSAEdibleOilBrands = tierOneSAEdibleOil.map((x) => x.brands.map((x) => x.productType.name === 'Edible Oil').filter(Boolean).length);

  //     const tierOneSatEdibleOil = tierOneSAEdibleOil.filter((x) => x.tier.includes('TIER_1')).map((x) => x.ivcScores.map((x) => x.score).reduce(function (accumulator, currentValue) {
  //       return accumulator + currentValue;
  //     }));

  //     const percentageTierOneSatEdibleOil = tierOneSatEdibleOil.map((x) => x / 100 * 66);
  //     const totalTierOneSATEdibleOil = tierOneSAEdibleOilBrands.reduce(function (r, a, i) {
  //       return r + a * percentageTierOneSatEdibleOil[i];
  //     }, 0) / tierOneSAEdibleOilBrands.reduce(function (accumulator, currentValue) {
  //       return accumulator + currentValue;
  //     }, 0);

  //     // Tier Three Breakdown
  //     const tierThreeSAEdibleOil = selfAssessmentEdibleOil.filter((x) => x.tier.includes('TIER_3'));

  //     const tierThreeSAEdibleOilBrands = tierThreeSAEdibleOil.map((x) => x.brands.map((x) => x.productType.name === 'Edible Oil').filter(Boolean).length);

  //     const tierThreeSatEdibleOil = tierThreeSAEdibleOil.filter((x) => x.tier.includes('TIER_3')).map((x) => x.ivcScores.map((x) => x.score).reduce(function (accumulator, currentValue) {
  //       return accumulator + currentValue;
  //     }));

  //     const totalTierThreeSATEdibleOil = tierThreeSAEdibleOilBrands.reduce(function (r, a, i) {
  //       return r + a * tierThreeSatEdibleOil[i];
  //     }, 0) / tierThreeSAEdibleOilBrands.reduce(function (accumulator, currentValue) {
  //       return accumulator + currentValue;
  //     }, 0);

  //     const tierOneAndTierThreeEdibleOilTotal = totalTierThreeSATEdibleOil + totalTierOneSATEdibleOil;
  //     setSAEdibleOils((tierOneAndTierThreeEdibleOilTotal / 2).toFixed());

  //     // Edible Oil  IEG Charts
  //     const industryExpertEdibleOil = reFilteredResponse?.filter((brand) => brand.brands.find((x) => x.productType.name.includes('Edible Oil')));

  //     const culIndustryExpertEdibleOil = industryExpertEdibleOil?.map((x) => x.iegScores.map((x) => x.value).reduce(function (accumulator, currentValue) {
  //       return accumulator + currentValue;
  //     }, 0));

  //     const industryExpertEdibleOilBrands = industryExpertEdibleOil.map((x) => x.brands.map((x) => x.productType.name === 'Edible Oil').filter(Boolean).length);

  //     const totalIEGEdibleOil = industryExpertEdibleOilBrands.reduce(function (r, a, i) {
  //       return r + a * culIndustryExpertEdibleOil[i];
  //     }, 0) / dataEdibleOil.reduce(function (accumulator, currentValue) {
  //       return accumulator + currentValue;
  //     }, 0);
  //     setIEGEdibleOils(totalIEGEdibleOil.toFixed());

  //     // Edible Oil PT Charts
  //     const filterEdibleOil = reFilteredResponse?.filter((brand) => brand.brands.find((x) => x.productType.value === 'Edible Oil'));

  //     const culProductTestingEdibleOil = filterEdibleOil.map((x) => x.brands.filter((x) => x.productType.name === 'Edible Oil'));

  //     const latestProductTestingEdibleOil = culProductTestingEdibleOil.map(((x) => x.map((x) => x.productTests.sort((a, b) => new Date(b.sample_production_date).getTime() - new Date(a.sample_production_date).getTime())[0])));

  //     const fortifyProductTestingEdibleOil = latestProductTestingEdibleOil.map((x) => x.map((x) => x.fortification));

  //     const addProductTestingEdibleOil = fortifyProductTestingEdibleOil.map((x) => x.map((x) => x.score).reduce((sum, x) => sum + x, 0));

  //     const totalProductTestingEdibleOil = addProductTestingEdibleOil.reduce(function (accumulator, currentValue) {
  //       return accumulator + currentValue;
  //     }, 0) / dataEdibleOil.reduce(function (accumulator, currentValue) {
  //       return accumulator + currentValue;
  //     }, 0);

  //     setPTEdibleOils(totalProductTestingEdibleOil.toFixed());

  //     setLoading(false);
  //   } catch (error) {
  //     setLoading(false);
  //     // return toast({
  //     //   status: 'error',
  //     //   title: 'Error',
  //     //   position: 'top-right',
  //     //   description: 'Something went wrong',
  //     //   duration: 6000,
  //     //   isClosable: true,
  //     // });
  //   }
  // };
  /**
   * Filters companies and calculates performance metrics for Maize Flour, Wheat Flour, and Edible Oil
   * across SAT, IEG, and Product Testing dimensions.
   */
  const getCompanies = () => {
    if (!companies) return;
    setLoading(true);
    const filteredResponse = companies?.filter((x) => x.id !== 'akpQPiE0sFH2iwciggHd');

    const reFilteredResponse = filteredResponse?.filter((x) => x.iegScores.length && x.ivcScores.length && x.satScores.length);
    setFilteredData(reFilteredResponse);

    const dataEdibleOil = reFilteredResponse?.map((product) => product?.brands.map((item) => item?.productType).filter((x) => x.name === 'Edible Oil').map((x) => x?.name).length);

    const dataWheatFlour = reFilteredResponse?.map((product) => product?.brands.map((item) => item?.productType).filter((x) => x.name === 'Wheat Flour').map((x) => x?.name).length);

    const dataMaizeFlour = reFilteredResponse?.map((product) => product?.brands.map((item) => item?.productType).filter((x) => x.name === 'Maize Flour').map((x) => x?.name).length);

    setEdibleOil(dataEdibleOil?.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0));
    setWheatFlour(dataWheatFlour?.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0));
    setMaizeFlour(dataMaizeFlour?.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0));

    // MaizeFlour SAT Charts
    const selfAssessmentMaizeFlour = reFilteredResponse?.filter((brand) => brand.brands.find((x) => x.productType.name.includes('Maize Flour')));

    // Tier One Breakdown
    const tierOneSAMaizeFlour = selfAssessmentMaizeFlour?.filter((x) => x.tier.includes('TIER_1'));
    const tierOneSAMaizeFlourBrands = tierOneSAMaizeFlour?.map((x) => x.brands.map((x) => x.productType.name === 'Edible Oil').filter(Boolean).length);

    const tierOneSatMaizeFlour = tierOneSAMaizeFlour?.filter((x) => x.tier.includes('TIER_1')).map((x) => x.ivcScores.map((x) => x.score).reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }));

    // const percentageTierOneSatMaizeFlour = tierOneSatMaizeFlour?.map((x) => x / 100 * 66);
    const percentageTierOneSatMaizeFlour = tierOneSatMaizeFlour;
    const totalTierOneSATMaizeFlour = tierOneSAMaizeFlourBrands?.reduce(function (r, a, i) {
      return r + a * percentageTierOneSatMaizeFlour[i];
    }, 0) / tierOneSAMaizeFlourBrands?.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0);


    // Tier Three Breakdown
    const tierThreeSAMaizeFlour = selfAssessmentMaizeFlour?.filter((x) => x.tier.includes('TIER_3'));

    const tierThreeSAMaizeFlourBrands = tierThreeSAMaizeFlour?.map((x) => x.brands.map((x) => x.productType.name === 'Maize Flour').filter(Boolean).length);

    const tierThreeSatMaizeFlour = tierThreeSAMaizeFlour?.filter((x) => x.tier.includes('TIER_3')).map((x) => x.ivcScores.map((x) => x.score).reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }));

    const totalTierThreeSATMaizeFlour = tierThreeSAMaizeFlourBrands?.reduce(function (r, a, i) {
      return r + a * tierThreeSatMaizeFlour[i];
    }, 0) / tierThreeSAMaizeFlourBrands?.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0);

    if (totalTierOneSATMaizeFlour || 0 === 0) {
      const tierOneAndTierThreeMaizeFlourTotal = totalTierThreeSATMaizeFlour;
      setSAMaizeFlour(tierOneAndTierThreeMaizeFlourTotal.toFixed());
    }

    if (totalTierOneSATMaizeFlour > 0) {
      const tierOneAndTierThreeMaizeFlourTotal = totalTierThreeSATMaizeFlour + totalTierOneSATMaizeFlour || 0;
      setSAMaizeFlour((tierOneAndTierThreeMaizeFlourTotal / 2).toFixed());
    }

    // MaizeFlour IEG Charts
    const industryExpertMaizeFlour = reFilteredResponse?.filter((brand) => brand.brands.find((x) => x.productType.name.includes('Maize Flour')));

    const culIndustryExpertMaizeFlour = industryExpertMaizeFlour?.map((x) => x.iegScores.map((x) => x.value).reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0));

    const industryExpertMaizeFlourBrands = industryExpertMaizeFlour?.map((x) => x.brands.map((x) => x.productType.name === 'Maize Flour').filter(Boolean).length);

    const totalIEGmaizeFlour = industryExpertMaizeFlourBrands?.reduce(function (r, a, i) {
      return r + a * culIndustryExpertMaizeFlour[i];
    }, 0) / dataMaizeFlour?.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0);
    setIEGMaizeFlour(totalIEGmaizeFlour.toFixed());

    // MaizeFlour PT Charts
    const filterMaizeFlour = reFilteredResponse?.filter((brand) => brand.brands.find((x) => x.productType.value === 'Maize Flour'));

    const culProductTestingMaizeFlour = filterMaizeFlour?.map((x) => x.brands.filter((x) => x.productType.name === 'Maize Flour'));

    const latestProductTestingMaizeFlour = culProductTestingMaizeFlour?.map(((x) => x.map((x) => x.productTests.sort((a, b) => new Date(b.sample_production_date).getTime() - new Date(a.sample_production_date).getTime())[0])));

    const fortifyProductTestingMaizeFlour = latestProductTestingMaizeFlour?.map((x) => x.map((x) => x.fortification));

    const addProductTestingMaizeFlour = fortifyProductTestingMaizeFlour?.map((x) => x.map((x) => x.score).reduce((sum, x) => sum + x, 0));

    const totalProductTestingMaizeFlour = addProductTestingMaizeFlour?.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0) / dataMaizeFlour.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0);

    setPTMaizeFlour(totalProductTestingMaizeFlour?.toFixed());

    // WheatFlour SAT Charts
    const selfAssessmentWheatFlour = reFilteredResponse?.filter((brand) => brand.brands.find((x) => x.productType.name.includes('Wheat Flour')));

    // Tier One Breakdown
    const tierOneSAWheatFlour = selfAssessmentWheatFlour?.filter((x) => x.tier.includes('TIER_1'));
    const tierOneSAWheatFlourBrands = tierOneSAWheatFlour?.map((x) => x.brands.map((x) => x.productType.name === 'Edible Oil').filter(Boolean).length);

    const tierOneSatWheatFlour = tierOneSAWheatFlour?.filter((x) => x.tier.includes('TIER_1')).map((x) => x.ivcScores.map((x) => x.score).reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }));

    // const percentageTierOneSatWheatFlour = tierOneSatWheatFlour?.map((x) => x / 100 * 66);
    const percentageTierOneSatWheatFlour = tierOneSatWheatFlour;
    const totalTierOneSATWheatFlour = tierOneSAWheatFlourBrands?.reduce(function (r, a, i) {
      return r + a * percentageTierOneSatWheatFlour[i];
    }, 0) / tierOneSAWheatFlourBrands?.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0);


    // Tier Three Breakdown
    const tierThreeSAWheatFlour = selfAssessmentWheatFlour.filter((x) => x.tier.includes('TIER_3'));

    const tierThreeSAWheatFlourBrands = tierThreeSAWheatFlour.map((x) => x.brands.map((x) => x.productType.name === 'Wheat Flour').filter(Boolean).length);

    const tierThreeSatWheatFlour = tierThreeSAWheatFlour.filter((x) => x.tier.includes('TIER_3')).map((x) => x.ivcScores.map((x) => x.score).reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }));

    const totalTierThreeSATWheatFlour = tierThreeSAWheatFlourBrands.reduce(function (r, a, i) {
      return r + a * tierThreeSatWheatFlour[i];
    }, 0) / tierThreeSAWheatFlourBrands.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0);

    if (totalTierOneSATWheatFlour || 0 === 0) {
      setSAWheatFlour((totalTierThreeSATWheatFlour).toFixed());
    }

    if (totalTierOneSATWheatFlour > 0) {
      const tierOneAndTierThreeWheatFlourTotal = totalTierThreeSATWheatFlour + totalTierOneSATWheatFlour || 0;
      setSAWheatFlour((tierOneAndTierThreeWheatFlourTotal / 2).toFixed());
    }

    // WheatFlour  IEG Charts
    const industryExpertWheatFlour = reFilteredResponse?.filter((brand) => brand.brands.find((x) => x.productType.name.includes('Wheat Flour')));

    const culIndustryExpertWheatFlour = industryExpertWheatFlour?.map((x) => x.iegScores.map((x) => x.value).reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0));

    const industryExpertWheatFlourBrands = industryExpertWheatFlour.map((x) => x.brands.map((x) => x.productType.name === 'Wheat Flour').filter(Boolean).length);

    const totalIEGWheatFlour = industryExpertWheatFlourBrands.reduce(function (r, a, i) {
      return r + a * culIndustryExpertWheatFlour[i];
    }, 0) / dataWheatFlour.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0);
    setIEGWheatFlour(totalIEGWheatFlour.toFixed());

    // WheatFlour PT Charts
    const filterWheatFlour = reFilteredResponse?.filter((brand) => brand.brands.find((x) => x.productType.value === 'Wheat Flour'));


    const culProductTestingWheatFlour = filterWheatFlour.map((x) => x.brands.filter((x) => x.productType.name === 'Wheat Flour'));

    const latestProductTestingWheatFlour = culProductTestingWheatFlour.map(((x) => x.map((x) => x.productTests.sort((a, b) => new Date(b.sample_production_date).getTime() - new Date(a.sample_production_date).getTime())[0])));

    const fortifyProductTestingWheatFlour = latestProductTestingWheatFlour.map((x) => x.map((x) => x.fortification));

    const addProductTestingWheatFlour = fortifyProductTestingWheatFlour.map((x) => x.map((x) => x.score).reduce((sum, x) => sum + x, 0));

    const totalProductTestingWheatFlour = addProductTestingWheatFlour.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0) / dataWheatFlour.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0);

    setPTWheatFlour(totalProductTestingWheatFlour.toFixed());

    // Edible Oil SAT Charts
    const selfAssessmentEdibleOil = reFilteredResponse?.filter((brand) => brand.brands.find((x) => x.productType.name.includes('Edible Oil')));

    // Tier One Breakdown
    const tierOneSAEdibleOil = selfAssessmentEdibleOil.filter((x) => x.tier.includes('TIER_1'));
    const tierOneSAEdibleOilBrands = tierOneSAEdibleOil.map((x) => x.brands.map((x) => x.productType.name === 'Edible Oil').filter(Boolean).length);

    const tierOneSatEdibleOil = tierOneSAEdibleOil.filter((x) => x.tier.includes('TIER_1')).map((x) => x.ivcScores.map((x) => x.score).reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }));

    // const percentageTierOneSatEdibleOil = tierOneSatEdibleOil.map((x) => x / 100 * 66);
    const percentageTierOneSatEdibleOil = tierOneSatEdibleOil;
    const totalTierOneSATEdibleOil = tierOneSAEdibleOilBrands.reduce(function (r, a, i) {
      return r + a * percentageTierOneSatEdibleOil[i];
    }, 0) / tierOneSAEdibleOilBrands.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0);

    // Tier Three Breakdown
    const tierThreeSAEdibleOil = selfAssessmentEdibleOil.filter((x) => x.tier.includes('TIER_3'));

    const tierThreeSAEdibleOilBrands = tierThreeSAEdibleOil.map((x) => x.brands.map((x) => x.productType.name === 'Edible Oil').filter(Boolean).length);

    const tierThreeSatEdibleOil = tierThreeSAEdibleOil.filter((x) => x.tier.includes('TIER_3')).map((x) => x.ivcScores.map((x) => x.score).reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }));

    const totalTierThreeSATEdibleOil = tierThreeSAEdibleOilBrands.reduce(function (r, a, i) {
      return r + a * tierThreeSatEdibleOil[i];
    }, 0) / tierThreeSAEdibleOilBrands.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0);

    const tierOneAndTierThreeEdibleOilTotal = totalTierThreeSATEdibleOil + totalTierOneSATEdibleOil;
    setSAEdibleOils((tierOneAndTierThreeEdibleOilTotal / 2).toFixed());

    // Edible Oil  IEG Charts
    const industryExpertEdibleOil = reFilteredResponse?.filter((brand) => brand.brands.find((x) => x.productType.name.includes('Edible Oil')));

    const culIndustryExpertEdibleOil = industryExpertEdibleOil?.map((x) => x.iegScores.map((x) => x.value).reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0));

    const industryExpertEdibleOilBrands = industryExpertEdibleOil.map((x) => x.brands.map((x) => x.productType.name === 'Edible Oil').filter(Boolean).length);

    const totalIEGEdibleOil = industryExpertEdibleOilBrands.reduce(function (r, a, i) {
      return r + a * culIndustryExpertEdibleOil[i];
    }, 0) / dataEdibleOil.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0);
    setIEGEdibleOils(totalIEGEdibleOil.toFixed());

    // Edible Oil PT Charts
    const filterEdibleOil = reFilteredResponse?.filter((brand) => brand.brands.find((x) => x.productType.value === 'Edible Oil'));

    const culProductTestingEdibleOil = filterEdibleOil.map((x) => x.brands.filter((x) => x.productType.name === 'Edible Oil'));

    const latestProductTestingEdibleOil = culProductTestingEdibleOil.map(((x) => x.map((x) => x.productTests.sort((a, b) => new Date(b.sample_production_date).getTime() - new Date(a.sample_production_date).getTime())[0])));

    const fortifyProductTestingEdibleOil = latestProductTestingEdibleOil.map((x) => x.map((x) => x.fortification));

    const addProductTestingEdibleOil = fortifyProductTestingEdibleOil.map((x) => x.map((x) => x.score).reduce((sum, x) => sum + x, 0));

    const totalProductTestingEdibleOil = addProductTestingEdibleOil.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0) / dataEdibleOil.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0);

    setPTEdibleOils(totalProductTestingEdibleOil.toFixed());

    setLoading(false);
  };

  /**
   * Aggregates final MFI scores for each product type based on weighted SAT, IEG, and PT scores.
   * Weights: SAT = 50%, IEG = 20%, PT = 30%.
   */
  useEffect(() => {
    // MaizeFlour MFI Charts
    const satValueMaizeFlour = SAMaizeFlour;
    const ptWeightedScoreMaizeFlour = (PTMaizeFlour / 100) * 30;
    const iegWeightedScoreMaizeFlour = (IEGMaizeFlour / 100) * 20;
    const satWeightedScoreMaizeFlour = (satValueMaizeFlour / 100) * 50;
    const maizeFlourMFITotalMaizeFlour = ptWeightedScoreMaizeFlour + iegWeightedScoreMaizeFlour + satWeightedScoreMaizeFlour;
    setMFIMaizeFlour(maizeFlourMFITotalMaizeFlour.toFixed());

    // WheatFlour MFI Charts
    const satValueWheatFlour = SAWheatFlour;
    const ptWeightedScoreWheatFlour = (PTWheatFlour / 100) * 30;
    const iegWeightedScoreWheatFlour = (IEGWheatFlour / 100) * 20;
    const satWeightedScoreWheatFlour = (satValueWheatFlour / 100) * 50;
    const wheatFlourMFITotal = ptWeightedScoreWheatFlour + iegWeightedScoreWheatFlour + satWeightedScoreWheatFlour;
    setMFIWheatFlourData(wheatFlourMFITotal.toFixed());

    // Edible Oil MFI Charts
    const satValueEdibleOil = SAEdibleOils;
    const ptWeightedScoreEdibleOil = (PTEdibleOils / 100) * 30;
    const iegWeightedScoreEdibleOil = (IEGEdibleOils / 100) * 20;
    const satWeightedScoreEdibleOil = (satValueEdibleOil / 100) * 50;
    const edibleOilMFITotal = ptWeightedScoreEdibleOil + iegWeightedScoreEdibleOil + satWeightedScoreEdibleOil;
    setMFIEdibleOils(edibleOilMFITotal.toFixed());
  });

  /**
   * Handles change of selected industry dropdown and updates associated scores.
   *
   * @param {React.ChangeEvent<HTMLSelectElement>} e - The select change event.
   */
  const changeScores = (e) => {
    setIndustry(e.target.value);
    switch (e.target.value) {
      case 'Wheat Flour':
        setIndustryScores([mfiWheatFlourData, SAWheatFlour, IEGWheatFlour, PTWheatFlour]);
        break;
      case 'Edible Oil':
        setIndustryScores([MFIEdibleOils, SAEdibleOils, IEGEdibleOils, PTEdibleOils]);
        break;
      case 'MaizeFlour':
        setIndustryScores([MFIMaizeFlour, SAMaizeFlour, IEGMaizeFlour, PTMaizeFlour]);
        break;
      default:
        break;
    }
  };

  // Render UI with dropdown selector and chart visualizations
  return (
    <div className="margin-top-5 background-color-white radius-large padding-5 border-1px">
      <div className="">
        <div>
          <Text className="margin-bottom-5 weight-medium" fontSize="15px" fontWeight="700">
            {name}
          </Text>
        </div>
        <Flex>
          <form
            id="email-form"
            name="email-form"
            data-name="Email Form"
            className="flex-row-middle"
            style={{width: 350, padding: 10}}
          >
            <select
              id="field-2"
              name="field-2"
              value={industry}
              onChange={changeScores}
              data-name="Field 2"
              className="border-1px rounded-large background-color-white w-select"
            >              <option value="Wheat Flour">Wheat Flour ({wheatFlour === undefined ? 'loading...' : wheatFlour})</option>
              <option value="Edible Oil">Edible Oil ({edibleOil === undefined ? 'loading...' : edibleOil})</option>
              <option value="Maize Flour">MaizeFlour ({maizeFlour === undefined ? 'loading...' : maizeFlour})</option>
            </select>
          </form>
        </Flex>
      </div>

      {wheatFlour === undefined ? <Spinner /> : <AssessmentChart
        industry={industry}
        industryScores={industryScores}
        filteredData={filteredData}
        mfiWheatFlourData={mfiWheatFlourData}
        SAWheatFlour={SAWheatFlour}
        IEGWheatFlour={IEGWheatFlour}
        PTWheatFlour={PTWheatFlour}
      />}


    </div>
  );
};

Performance.propTypes = {
  name: PropTypes.any,
  companies: PropTypes.any,
};

export default Performance;
