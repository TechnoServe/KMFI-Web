import React, {useEffect, useState} from 'react';
import {Bar} from 'react-chartjs-2';
import PropTypes from 'prop-types';
// import MFICOY from '../../../../Dummie/mfiScoreSheet';
// import {request} from 'common';

/**
 * Renders a bar chart comparing MFI scores for a selected industry vs. all industries.
 * It calculates Self Assessment, IEG, and Product Testing scores,
 * and computes a final MFI score using weighted contributions.
 *
 * @param {Object} props - Component props
 * @param {string} props.industry - Industry name
 * @param {Array<number>} props.industryScores - Scores for the selected industry
 * @param {Array<Object>} props.filteredData - Filtered dataset of companies and brands
 * @param {number} props.mfiFlourData - MFI score for flour (selected industry)
 * @param {number} props.SAFlour - Self-assessment average score for flour
 * @param {number} props.IEGFlour - IEG average score for flour
 * @param {number} props.PTFlour - Product testing average score for flour
 * @returns {JSX.Element} A bar chart component comparing scores
 */
const AssessmentChart = ({industry, industryScores, filteredData, mfiFlourData, SAFlour, IEGFlour, PTFlour}) => {
  const [allSelfAssessment, setAllSelfAssessment] = useState();
  const [allIndustryExpertGroup, setAllIndustryExpertGroup] = useState();
  const [allProductTesting, setAllProductTesting] = useState();
  const [allMfi, setAllMfi] = useState();

  const getAllCompanies = async () => {
    try {
      // Get number of brands per company
      const allBrandsLength = filteredData?.map((product) => product?.brands.length);
      // Calculate Self Assessment score from Tier One companies
      const tierOneBrands = filteredData.filter((x) => x.tier.includes('TIER_1'));

      const culSelfAssessmentTierOne = tierOneBrands?.map((x) => x.brands.map((x) => x.productType.name).filter(Boolean).length);

      const tierOneCul = tierOneBrands.map((x) => x.ivcScores.map((x) => x.score).reduce(function (accumulator, currentValue) {
        return accumulator + currentValue;
      }, 0));

      const tierOnePercentage = tierOneCul.map((x) => x / 100 * 66);

      const totalTierOne = culSelfAssessmentTierOne.reduce(function (r, a, i) {
        return r + a * tierOnePercentage[i];
      }, 0);
      // Calculate Self Assessment score from Tier Three companies
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

      // Compute overall weighted Self Assessment score
      setAllSelfAssessment((tierOneAndTierThreeTotal).toFixed());

      // Calculate total IEG scores
      const industryExpertGroup = filteredData?.map((x) => x.iegScores.map((x) => x.value).reduce(function (accumulator, currentValue) {
        return accumulator + currentValue;
      }, 0));

      const culIndustryExpertGroup = filteredData?.map((x) => x.brands.map((x) => x.productType.name).filter(Boolean).length);

      // Compute overall weighted IEG score
      const totalIndustryExpertGroup = culIndustryExpertGroup.reduce(function (r, a, i) {
        return r + a * industryExpertGroup[i];
      }, 0) / allBrandsLength?.reduce(function (accumulator, currentValue) {
        return accumulator + currentValue;
      }, 0);

      // Compute overall weighted IEG score
      setAllIndustryExpertGroup(totalIndustryExpertGroup.toFixed());

      // Extract latest product test per brand
      const latestProductTesting = filteredData?.map((x) => x?.brands.map((x) => x?.productTests?.sort((a, b) => new Date(b?.sample_production_date).getTime() - new Date(a?.sample_production_date).getTime())[0]));
      // console.log('latestProductTestingEdibleOil', filteredData?.map((x) => x?.brands.map((x) => x?.productTests.map((x) => x[0]?.brand_id))));
      const filteredLatestProductTesting = [latestProductTesting[0]?.filter((x) => {
        return !(x === undefined);
      })];
      const allProducts = filteredLatestProductTesting?.map((x) => x?.map((x) => x?.fortification.score).reduce(function (accumulator, currentValue) {
        return accumulator + currentValue;
      }, 0));


      // Compute average Product Testing score across all brands
      const productTestingTotal = allProducts.reduce((sum, x) => sum + x, 0) / allBrandsLength?.reduce(function (accumulator, currentValue) {
        return accumulator + currentValue;
      }, 0);

      // Compute average Product Testing score across all brands
      setAllProductTesting(productTestingTotal.toFixed());
      // Compute final MFI score using weighted components
      const satValue = allSelfAssessment;
      const ptWeightedScore = (productTestingTotal.toFixed() / 100) * 30;
      const iegWeightedScore = (totalIndustryExpertGroup.toFixed() / 100) * 20;
      const satWeightedScore = (satValue / 100) * 50;
      const MFITotal = ptWeightedScore + iegWeightedScore + satWeightedScore;

      // Set final MFI score
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
  // Recalculate scores on component mount
  useEffect(() => {
    getAllCompanies();
  });

  // Define datasets for Bar chart comparing industry vs. overall averages
  const data3 = {
    labels: ['Overall MFI Score', 'Self Assessment', 'Industry Expert Group', 'Product Quality Testing'],
    datasets: [
      {
        label: `${industry} Industry Average MFI Scores`,
        data: industryScores.length === 0 ? [mfiFlourData, SAFlour, IEGFlour, PTFlour] : industryScores,
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

  // Chart.js configuration with percentage Y-axis
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
  // Render the bar chart with configured data and options
  return (
    <Bar data={data3} options={options} />
  );
};

AssessmentChart.propTypes = {
  industry: PropTypes.string,
  industryScores: PropTypes.array,
  filteredData: PropTypes.any,
  mfiFlourData: PropTypes.any,
  SAFlour: PropTypes.any,
  IEGFlour: PropTypes.any,
  PTFlour: PropTypes.any
};

export default AssessmentChart;
