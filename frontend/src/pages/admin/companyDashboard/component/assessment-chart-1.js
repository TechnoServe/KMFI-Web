import React from 'react';
import {Bar} from 'react-chartjs-2';
import propTypes from 'prop-types';

/**
 * Renders a bar and line chart to display percentage compliance of micronutrients
 * from product testing data, including optional aflatoxin data.
 *
 * @param {Object} props - Component props
 * @param {Array<Object>} props.productTestData - Array of compliance objects for each product
 * @param {boolean} props.aflatoxin - Flag to include aflatoxin compliance value if available
 * @returns {JSX.Element} A Bar chart displaying compliance percentages
 */
const AssessmentChart = ({productTestData, aflatoxin}) => {
  // console.log('productTestData', productTestData);

  // Array to hold percentage compliance values for each micronutrient
  let percentageCompliance = [];
  // Array to hold micronutrient names corresponding to compliance values
  let microNutrients = [];
  // let fortificationScore = [];
  // let productTestingScore = [];

  // Loop through product test data to extract compliance percentages and micronutrient names
  productTestData?.forEach((compliance) => {
    percentageCompliance = compliance.results.map((response) => response.percentage_compliance);
    microNutrients = compliance.results.map((response) => response.microNutrient.name);
  });

  // Optionally add aflatoxin data if the aflatoxin flag is true
  if (productTestData.length > 0 && aflatoxin) {
    percentageCompliance.push(productTestData[0].aflatoxin_percent_of_max);
    microNutrients.push('Aflatoxin');
  }
  // fortificationScore = productTestData?.map((x) => x.fortification.score);
  // productTestingScore = fortificationScore?.reduce((prevIter, item) => prevIter + item, 0);


  // Define chart data for Bar and Line datasets
  const data3 = {
    labels: microNutrients,
    datasets: [
      {
        label: 'Minimum Compliance Threshold',
        type: 'line',
        borderColor: 'rgba(256, 0, 0,  1)',
        backgroundColor: 'rgba(256, 0, 0,  1)',
        borderWidth: 3,
        fill: false,
        // Set threshold line at 100% for visual reference
        data: percentageCompliance.length === 1 ? [100]
          : percentageCompliance.length === 2 ? [100, 100]
            : percentageCompliance.length === 3 ? [100, 100, 100]
              : percentageCompliance.length === 4 ? [100, 100, 100, 100]
                : ''
      },
      {
        label: 'Product Testing Score',
        type: 'bar',
        // Bar chart showing actual product compliance values
        data: percentageCompliance,
        backgroundColor: 'rgba(82, 108, 219, 1)',
        borderWidth: 1,
        barThickness: 37,
        minBarLength: 2,
        barPercentage: 5.0,
      },
    ],
  };

  // Define chart display options, including Y-axis formatting
  const options = {
    scales: {
      y: {
        max: 400,
        ticks: {
          // Format Y-axis labels to include percentage sign
          callback: function (value) {
            return value + '%';
          },
        },
      },
    },
  };

  return <Bar data={data3} options={options} />;
};

AssessmentChart.propTypes = {
  productTestData: propTypes.any,
  aflatoxin: propTypes.any
};

export default AssessmentChart;
