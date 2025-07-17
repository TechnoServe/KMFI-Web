import React, {useEffect, useState} from 'react';
import {Bar} from 'react-chartjs-2';
import PropTypes from 'prop-types';
// import MFICOY from '../../../../Dummie/mfiScoreSheet';
// import {request} from 'common';

/**
 * Renders a bar chart comparing the MFI scores of a specific industry
 * against the average MFI scores across all industries. It computes the
 * Self Assessment, Industry Expert Group, and Product Testing scores and
 * derives the overall MFI score using a weighted formula.
 *
 * @param {Object} props - Component props
 * @param {string} props.industry - The name of the industry being assessed
 * @param {Array<number>} props.industryScores - MFI-related scores for a specific brand or industry
 * @param {Array<Object>} props.filteredData - Filtered data containing company, brand, and testing info
 * @param {number} props.MFIBrandTotalBrand - Overall MFI score for the brand
 * @param {number} props.SABrandsTierOne - SAT score for Tier 1 brands
 * @param {number} props.SABrandsTierThree - SAT score for Tier 3 brands
 * @param {number} props.IEGBrands - IEG score for the brand
 * @param {number} props.PTTesting - Product testing score for the brand
 * @returns {JSX.Element} Bar chart showing comparison of scores
 */
const AssessmentCompany = ({industry, industryScores, filteredData, MFIBrandTotalBrand, SABrandsTierOne, SABrandsTierThree, IEGBrands, PTTesting}) => {
  console.log(industry);
  const [allSelfAssessment, setAllSelfAssessment] = useState();
  const [allIndustryExpertGroup, setAllIndustryExpertGroup] = useState();
  const [allProductTesting, setAllProductTesting] = useState();
  const [allMfi, setAllMfi] = useState();

  const getAllCompanies = async () => {
    try {
      // Compute the number of brands for each company
      const allBrandsLength = filteredData?.map((product) => product?.brands.length);
      // Extract and compute SAT scores for Tier One and Tier Three brands
      // Tier One Breakdown SAT
      const tierOneBrands = filteredData.filter((x) => x.tier.includes('TIER_1'));

      const culSelfAssessmentTierOne = tierOneBrands?.map((x) => x.brands.map((x) => x.productType.name).filter(Boolean).length);

      const tierOneCul = tierOneBrands.map((x) => x.ivcScores.map((x) => x.score).reduce(function (accumulator, currentValue) {
        return accumulator + currentValue;
      }, 0));

      const tierOnePercentage = tierOneCul.map((x) => x / 100 * 66);

      const totalTierOne = culSelfAssessmentTierOne.reduce(function (r, a, i) {
        return r + a * tierOnePercentage[i];
      }, 0);

      // Tier Three Breakdown SAT
      const tierThreeBrands = filteredData.filter((x) => x.tier.includes('TIER_3'));

      const culSelfAssessmentTierThree = tierThreeBrands?.map((x) => x.brands.map((x) => x.productType.name).filter(Boolean).length);

      const tierThreeCul = tierThreeBrands.map((x) => x.ivcScores.map((x) => x.score).reduce(function (accumulator, currentValue) {
        return accumulator + currentValue;
      }, 0));


      const totalTierThree = culSelfAssessmentTierThree.reduce(function (r, a, i) {
        return r + a * tierThreeCul[i];
      }, 0);
      const addTierOneAndTierThree = totalTierThree + totalTierOne;
      const tierOneAndTierThreeTotal = addTierOneAndTierThree / allBrandsLength.reduce(function (accumulator, currentValue) {
        return accumulator + currentValue;
      }, 0);
      // Compute the average SAT score across all brands
      setAllSelfAssessment((tierOneAndTierThreeTotal).toFixed());

      // Compute weighted Industry Expert Group (IEG) scores
      // All Industry Expert Group Scores
      const industryExpertGroup = filteredData?.map((x) => x.iegScores.map((x) => x.value).reduce(function (accumulator, currentValue) {
        return accumulator + currentValue;
      }, 0));

      const culIndustryExpertGroup = filteredData?.map((x) => x.brands.map((x) => x.productType.name).filter(Boolean).length);


      const totalIndustryExpertGroup = culIndustryExpertGroup.reduce(function (r, a, i) {
        return r + a * industryExpertGroup[i];
      }, 0) / allBrandsLength?.reduce(function (accumulator, currentValue) {
        return accumulator + currentValue;
      }, 0);

      // Save final IEG average score
      setAllIndustryExpertGroup(totalIndustryExpertGroup.toFixed());

      // Extract and average most recent product testing scores
      // All Product Testing
      const latestProductTestingEdibleOil = filteredData.map((x) => x.brands.map((x) => x.productTests.sort((a, b) => new Date(b.sample_production_date).getTime() - new Date(a.sample_production_date).getTime())[0]));

      const allProducts = latestProductTestingEdibleOil.map((x) => x.map((x) => x.fortification.score).reduce(function (accumulator, currentValue) {
        return accumulator + currentValue;
      }, 0));

      const productTestingTotal = allProducts.reduce((sum, x) => sum + x, 0) / allBrandsLength?.reduce(function (accumulator, currentValue) {
        return accumulator + currentValue;
      }, 0);
      // Save average product testing score
      setAllProductTesting(productTestingTotal.toFixed());

      // Calculate final MFI score using weighted SAT, IEG, and PT values
      // All MFI Scores
      const satValue = allSelfAssessment;
      const ptWeightedScore = (productTestingTotal.toFixed() / 100) * 20;
      const iegWeightedScore = (totalIndustryExpertGroup.toFixed() / 100) * 20;
      const satWeightedScore = (satValue / 100) * 60;
      const MFITotal = ptWeightedScore + iegWeightedScore + satWeightedScore;

      // Save computed final MFI score
      setAllMfi(MFITotal.toFixed());
    } catch (error) {
      // return toast({
      //   status: 'error',
      //   title: 'Error',
      //   position: 'top-right',
      //   description: 'Something went wrong',
      //   duration: 6000,
      //   isClosable: true,
      // });
    }
  };

  // Save MFI scores
  localStorage.setItem('mfi', JSON.stringify(allMfi));
  useEffect(() => {
    getAllCompanies();
  });

  // Configure data for the bar chart comparing individual vs. average scores
  const data3 = {
    labels: ['Overall MFI Score', 'Self Assessment', 'Industry Expert Group', 'Product Quality Testing'],
    datasets: [
      {
        label: `Brand MFI Scores`,
        data: industryScores.length === 0 ? [MFIBrandTotalBrand, parseInt(SABrandsTierThree) === 0 ? parseInt(SABrandsTierOne) : parseInt(SABrandsTierOne) === 0 ? parseInt(SABrandsTierThree) : '', IEGBrands, PTTesting] : industryScores,
        backgroundColor: 'rgba(82, 108, 219, 1)',
        borderWidth: 1,
        barThickness: 37,
        minBarLength: 2,
        barPercentage: 5.0,
      },
      {
        label: 'All Industries Average MFI Scores',
        data: [allMfi, allSelfAssessment, allIndustryExpertGroup, allProductTesting],
        backgroundColor: 'rgba(202, 211, 244, 1)',
        borderWidth: 1,
        barThickness: 37,
        minBarLength: 2,
        barPercentage: 5.0,
      },
    ],

  };

  // Chart.js options for display formatting and axis scaling
  const options = {
    maintainAspectRatio: true,
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
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
    },
  };
  // Render the bar chart with calculated data and options
  return (
    <Bar data={data3} options={options} />
  );
};

AssessmentCompany.propTypes = {
  industry: PropTypes.string,
  industryScores: PropTypes.array,
  filteredData: PropTypes.any,
  MFIBrandTotalBrand: PropTypes.any,
  SABrandsTierOne: PropTypes.any,
  SABrandsTierThree: PropTypes.any,
  IEGBrands: PropTypes.any,
  PTTesting: PropTypes.any
};

export default AssessmentCompany;
