/**
 * CompanyScore component calculates and renders MFI and score breakdowns
 * (SAT, IEG, PT) for selected companies and brands across industries.
 *
 * @param {Object} props - Component props
 * @param {string} props.name - Name to be displayed in the heading
 * @param {Array} props.companies - List of companies to analyze and render data for
 * @returns {JSX.Element} - React component rendering score information
 */
import {Text, Flex, Spinner} from '@chakra-ui/react';
import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
// import {request} from 'common';
import AssessmentCompany from './assessment-coy';

const CompanyScore = ({name, companies}) => {
  // Industry selection state (Wheat Flour, Edible Oil, Maize Flour)
  const [industry, setIndustry] = useState('WheatFlour');
  // Brand dropdown selection state
  const [brandDropDown, setBrand] = useState('1XZWpY9qXtIW4jLYdIKT');

  // Score states for SAT, IEG, PT, and MFI across product categories
  // 77, 98, 71, 19
  const [industryScores, setIndustryScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState();

  const [, setEdibleOil] = useState();
  const [wheatFlour, setWheatFlour] = useState();
  const [, setMaizeFlour] = useState();
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

  console.log('MFIMaizeFlour', MFIMaizeFlour);
  console.log('MFIEdibleOils', MFIEdibleOils);
  console.log('mfiWheatFlourData', mfiWheatFlourData);

  console.log(loading);
  /**
   * Filters valid companies and calculates scores for each category and brand
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

    // Brands SAT Charts
    const selfAssessmentBrand = filteredData?.filter((brand) => brand.brands.find((x) => x.name === brandDropDown));

    // Tier One Breakdown
    const tierOneSABrand = selfAssessmentBrand?.filter((x) => x?.tier.includes('TIER_1'));
    const tierOneSatBrand = tierOneSABrand?.filter((x) => x.tier.includes('TIER_1')).map((x) => x.ivcScores.map((x) => x?.score).reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }));
    // const percentageTierOneSatBrand = tierOneSatBrand?.map((x) => x / 100 * 66);
    const percentageTierOneSatBrand = tierOneSatBrand;

    const tierOneSatBrandTotal = percentageTierOneSatBrand?.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    });

    // Tier Three Breakdown
    const tierThreeSABrand = selfAssessmentBrand?.filter((x) => x?.tier.includes('TIER_3'));
    const tierThreeSatBrandTotal = tierThreeSABrand?.filter((x) => x.tier.includes('TIER_3')).map((x) => x.ivcScores.map((x) => x?.score).reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }));

    if ((selfAssessmentBrand?.map((x) => x.tier === 'TIER_1'))) {
      setSAMaizeFlour(tierOneSatBrandTotal?.toFixed());
    } else {
      setSAMaizeFlour(tierThreeSatBrandTotal?.toFixed());
    }


    // MaizeFlour IEG Charts
    const industryExpertMaizeFlour = reFilteredResponse?.filter((brand) => brand.brands.find((x) => x.productType.name.includes('Maize Flour')));

    const culIndustryExpertMaizeFlour = industryExpertMaizeFlour?.map((x) => x.iegScores.map((x) => x.value).reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0));

    const totalIEGmaizeFlour = culIndustryExpertMaizeFlour?.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0) / culIndustryExpertMaizeFlour.length;
    setIEGMaizeFlour(totalIEGmaizeFlour.toFixed());

    // MaizeFlour PT Charts
    const filterMaizeFlour = reFilteredResponse?.filter((brand) => brand.brands.find((x) => x.productType.value === 'Maize Flour'));

    const culProductTestingMaizeFlour = filterMaizeFlour?.map((x) => x.brands.filter((x) => x.productType.name === 'Maize Flour'));

    const latestProductTestingMaizeFlour = culProductTestingMaizeFlour?.map(((x) => x.map((x) => x.productTests.sort((a, b) => new Date(b.sample_production_date).getTime() - new Date(a.sample_production_date).getTime())[0])));

    const fortifyProductTestingMaizeFlour = latestProductTestingMaizeFlour?.map((x) => x?.map((x) => x?.fortification));

    const addProductTestingMaizeFlour = fortifyProductTestingMaizeFlour?.map((x) => x.map((x) => x.score).reduce((sum, x) => sum + x, 0));

    const totalProductTestingMaizeFlour = addProductTestingMaizeFlour?.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0) / culProductTestingMaizeFlour.length;

    setPTMaizeFlour(totalProductTestingMaizeFlour.toFixed());

    // WheatFlour SAT Charts
    const selfAssessmentWheatFlour = reFilteredResponse?.filter((brand) => brand.brands.find((x) => x.productType.name.includes('Wheat Flour')));

    const culSelfAssessmentWheatFlour = selfAssessmentWheatFlour?.map((x) => x.ivcScores.map((x) => x.score).reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0));

    const totalSATWheatFlour = culSelfAssessmentWheatFlour?.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0) / culSelfAssessmentWheatFlour.length;
    setSAWheatFlour(totalSATWheatFlour.toFixed());

    // WheatFlour  IEG Charts
    const industryExpertWheatFlour = reFilteredResponse?.filter((brand) => brand.brands.find((x) => x.productType.name.includes('Wheat Flour')));

    const culIndustryExpertWheatFlour = industryExpertWheatFlour?.map((x) => x.iegScores.map((x) => x.value).reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0));

    const totalIEGWheatFlour = culIndustryExpertWheatFlour?.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0) / culIndustryExpertWheatFlour.length;
    setIEGWheatFlour(totalIEGWheatFlour.toFixed());

    // WheatFlour PT Charts
    const filterWheatFlour = reFilteredResponse?.filter((brand) => brand.brands.find((x) => x.productType.value === 'Wheat Flour'));

    const culProductTestingWheatFlour = filterWheatFlour?.map((x) => x.brands.filter((x) => x.productType.name === 'Wheat Flour'));

    const latestProductTestingWheatFlour = culProductTestingWheatFlour?.map(((x) => x.map((x) => x.productTests.sort((a, b) => new Date(b.sample_production_date).getTime() - new Date(a.sample_production_date).getTime())[0])));

    const fortifyProductTestingWheatFlour = latestProductTestingWheatFlour?.map((x) => x?.map((x) => x?.fortification));

    const addProductTestingWheatFlour = fortifyProductTestingWheatFlour?.map((x) => x.map((x) => x.score).reduce((sum, x) => sum + x, 0));

    const totalProductTestingWheatFlour = addProductTestingWheatFlour?.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0) / culProductTestingWheatFlour.length;

    setPTWheatFlour(totalProductTestingWheatFlour.toFixed());
    // Edible Oil SAT Charts
    const selfAssessmentEdibleOil = reFilteredResponse?.filter((brand) => brand.brands.find((x) => x.productType.name.includes('Edible Oil')));

    const culSelfAssessmentEdibleOil = selfAssessmentEdibleOil?.map((x) => x.ivcScores.map((x) => x?.score).reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0));

    const totalSATEdibleOil = culSelfAssessmentEdibleOil?.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0) / culSelfAssessmentEdibleOil.length;

    setSAEdibleOils(totalSATEdibleOil.toFixed());

    // Edible Oil  IEG Charts
    const industryExpertEdibleOil = reFilteredResponse?.filter((brand) => brand.brands.find((x) => x.productType.name.includes('Edible Oil')));

    const culIndustryExpertEdibleOil = industryExpertEdibleOil?.map((x) => x.iegScores.map((x) => x.value).reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0));

    const totalIEGEdibleOil = culIndustryExpertEdibleOil?.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0) / culIndustryExpertEdibleOil.length;
    setIEGEdibleOils(totalIEGEdibleOil.toFixed());

    // Edible Oil PT Charts
    const filterEdibleOil = reFilteredResponse?.filter((brand) => brand.brands.find((x) => x.productType.value === 'Edible Oil'));

    const culProductTestingEdibleOil = filterEdibleOil?.map((x) => x.brands.filter((x) => x.productType.name === 'Edible Oil'));

    const latestProductTestingEdibleOil = culProductTestingEdibleOil?.map(((x) => x.map((x) => x.productTests.sort((a, b) => new Date(b.sample_production_date).getTime() - new Date(a.sample_production_date).getTime())[0])));

    const fortifyProductTestingEdibleOil = latestProductTestingEdibleOil?.map((x) => x.map((x) => x?.fortification));

    const addProductTestingEdibleOil = fortifyProductTestingEdibleOil?.map((x) => x.map((x) => x?.score).reduce((sum, x) => sum + x, 0));

    const totalProductTestingEdibleOil = addProductTestingEdibleOil?.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0) / culProductTestingEdibleOil.length;
    setPTEdibleOils(totalProductTestingEdibleOil.toFixed());

    setLoading(false);
  };

  // On mount, run getCompanies() to initialize score calculations
  useEffect(() => {
    getCompanies();
  }, []);

  // Brands SAT Charts
  const selfAssessmentBrand = filteredData?.filter((brand) => brand.brands.find((x) => x.id === brandDropDown));

  // Tier One Breakdown
  const tierOneSABrand = selfAssessmentBrand?.filter((x) => x?.tier.includes('TIER_1'));
  const tierOneSatBrand = tierOneSABrand?.filter((x) => x.tier.includes('TIER_1')).map((x) => x.ivcScores.map((x) => x?.score).reduce(function (accumulator, currentValue) {
    return accumulator + currentValue;
  }));
  const percentageTierOneSatBrand = tierOneSatBrand?.map((x) => x / 100 * 66);

  const tierOneSatBrandTotal = percentageTierOneSatBrand?.reduce(function (accumulator, currentValue) {
    return accumulator + currentValue;
  }, 0);

  // Tier Three Breakdown
  const tierThreeSABrand = selfAssessmentBrand?.filter((x) => x?.tier.includes('TIER_3'));
  const tierThreeSatBrandCul = tierThreeSABrand?.filter((x) => x.tier.includes('TIER_3')).map((x) => x.ivcScores.map((x) => x?.score).reduce(function (accumulator, currentValue) {
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
  const industryExpertGroupBrand = filteredData?.filter((brand) => brand.brands.find((x) => x.id === brandDropDown));

  const culIndustryExpertBrand = industryExpertGroupBrand?.map((x) => x.iegScores.map((x) => x.value).reduce(function (accumulator, currentValue) {
    return accumulator + currentValue;
  }, 0));

  const totalIndustryExpertGroupBrand = culIndustryExpertBrand?.reduce(function (accumulator, currentValue) {
    return accumulator + currentValue;
  }, 0);
  let IEGBrands = [];
  IEGBrands = totalIndustryExpertGroupBrand?.toFixed();

  console.log('filteredData', filteredData);
  console.log('filteredData', filteredData);

  // Brands PT Charts
  const productTestingBrand = filteredData?.filter((brand) => brand.brands.find((x) => x.id === brandDropDown));
  // console.log('productTestingBrand', filteredData?.filter((brand) => brand.brands.find((x) => x.productTests)));
  console.log('productTestingBrand', productTestingBrand);

  const latestProductTestingBrand = productTestingBrand?.map(((x) => x.brands.map((x) => x.productTests.sort((a, b) => new Date(b.sample_production_date).getTime() - new Date(a.sample_production_date).getTime())[0])));

  // console.log('latestProductTestingBrand', latestProductTestingBrand?.map((x) => x.map((x) => x.brand_id === '1XZWpY9qXtIW4jLYdIKT')));
  console.log('latestProductTestingBrand', latestProductTestingBrand);
  const filteredLatestProductTestingBrand = (latestProductTestingBrand && latestProductTestingBrand.length>0)?[latestProductTestingBrand[0].filter((x) => {
    return !(x === undefined);
  })]:[];
  const brandTesting = filteredLatestProductTestingBrand?.map((x) => x.find((x) => x.brand_id === brandDropDown));
  let productTestingBrandScore = 0;

  if (brandTesting?.length > 0) {
    productTestingBrandScore = brandTesting[0]?.fortification?.score;
  }

  let PTTesting = [];
  PTTesting = productTestingBrandScore.toFixed();

  const satValueBrand = parseInt(SABrandsTierThree) === 0 ? parseInt(SABrandsTierOne) : parseInt(SABrandsTierOne) === 0 ? parseInt(SABrandsTierThree) : '';
  const ptWeightedScoreBrand = (PTTesting / 100) * 20;
  const iegWeightedScoreBrand = (IEGBrands / 100) * 20;
  const satWeightedScoreBrand = (satValueBrand / 100) * 60;


  const MFIBrandTotalBrand = ptWeightedScoreBrand + iegWeightedScoreBrand + satWeightedScoreBrand;

  /**
   * Updates score data when user selects a different brand
   * @param {Event} e - Change event from dropdown
   */
  const changeBrand = (e) => {
    setBrand(e.target.value);
  };

  useEffect(() => {
    // MaizeFlour MFI Charts calculation
    const satValueMaizeFlour = SAMaizeFlour;
    const ptWeightedScoreMaizeFlour = (PTMaizeFlour / 100) * 20;
    const iegWeightedScoreMaizeFlour = (IEGMaizeFlour / 100) * 20;
    const satWeightedScoreMaizeFlour = (satValueMaizeFlour / 100) * 60;
    const maizeFlourMFITotalMaizeFlour = ptWeightedScoreMaizeFlour + iegWeightedScoreMaizeFlour + satWeightedScoreMaizeFlour;
    setMFIMaizeFlour(maizeFlourMFITotalMaizeFlour.toFixed());

    // WheatFlour MFI Charts calculation
    const satValueWheatFlour = SAWheatFlour;
    const ptWeightedScoreWheatFlour = (PTWheatFlour / 100) * 20;
    const iegWeightedScoreWheatFlour = (IEGWheatFlour / 100) * 20;
    const satWeightedScoreWheatFlour = (satValueWheatFlour / 100) * 60;
    const wheatFlourMFITotal = ptWeightedScoreWheatFlour + iegWeightedScoreWheatFlour + satWeightedScoreWheatFlour;
    setMFIWheatFlourData(wheatFlourMFITotal.toFixed());

    // Edible Oil MFI Charts calculation
    const satValueEdibleOil = SAEdibleOils;
    const ptWeightedScoreEdibleOil = (PTEdibleOils / 100) * 20;
    const iegWeightedScoreEdibleOil = (IEGEdibleOils / 100) * 20;
    const satWeightedScoreEdibleOil = (satValueEdibleOil / 100) * 60;
    const edibleOilMFITotal = ptWeightedScoreEdibleOil + iegWeightedScoreEdibleOil + satWeightedScoreEdibleOil;
    setMFIEdibleOils(edibleOilMFITotal.toFixed());
  });

  /**
   * Updates chart data when user switches industry type
   * @param {Event} e - Change event from select input
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
      case 'Maize Flour':
        setIndustryScores([MFIMaizeFlour, 87, IEGMaizeFlour, PTMaizeFlour]);
        break;
      default:
        break;
    }
  };

  console.log(changeScores);

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
              value={brandDropDown}
              onChange={changeBrand}
              data-name="Field 2"
              className="border-1px rounded-large background-color-white w-select"
            >
              {filteredData?.map((brand) => brand?.brands.map((x) =>
                <option key={x.id} value={x.id}>{x.name === '' ? 'loading...' : x.name}</option>
              ))}
            </select>
          </form>
        </Flex>
      </div>

      {wheatFlour === undefined ? <Spinner /> : <AssessmentCompany
        industry={industry}
        industryScores={industryScores}
        filteredData={filteredData}
        MFIBrandTotalBrand={MFIBrandTotalBrand}
        SABrandsTierOne={SABrandsTierOne}
        SABrandsTierThree={SABrandsTierThree}
        IEGBrands={IEGBrands}
        PTTesting={PTTesting}
      />}
    </div>
  );
};

CompanyScore.propTypes = {
  name: PropTypes.any,
  companies: PropTypes.any,
};

export default CompanyScore;
