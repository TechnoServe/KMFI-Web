import React from 'react';
import {Bar} from 'react-chartjs-2';
import propTypes from 'prop-types';

/**
 * Renders a bar and line chart displaying product testing scores alongside a compliance threshold.
 * Displays micro-nutrient compliance percentages, optionally including aflatoxin score.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.productTestData - Array of test result objects with micro-nutrient data
 * @param {boolean} props.aflatoxin - Whether to include aflatoxin score in the chart
 * @returns {JSX.Element} A rendered bar and line chart using Chart.js
 */
const AssessmentChart = ({productTestData, aflatoxin}) => {
  // Arrays to store compliance percentages and micro-nutrient names
  let percentageCompliance = [];
  let microNutrients = [];

  // Populate arrays with compliance scores and nutrient labels from test data
  productTestData?.forEach((compliance) => {
    percentageCompliance = compliance.results.map((response) => response.percentage_compliance);
    microNutrients = compliance.results.map((response) => response.microNutrient.name);
  });

  // Add aflatoxin score if applicable
  if (productTestData.length > 0 && aflatoxin) {
    percentageCompliance.push(productTestData[0].aflatoxin_percent_of_max/(productTestData[0].aflatoxin_max_permitted/100) * 10);
    microNutrients.push('Aflatoxin');
  }


  // Chart.js dataset configuration: one line dataset for threshold, one bar dataset for scores
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
        data: percentageCompliance.length === 1 ? [100]
          : percentageCompliance.length === 2 ? [100, 100]
            : percentageCompliance.length === 3 ? [100, 100, 100]
              : percentageCompliance.length === 4 ? [100, 100, 100, 100]
                : ''
      },
      {
        label: 'Product Testing Score',
        type: 'bar',
        data: percentageCompliance,
        backgroundColor: 'rgba(82, 108, 219, 1)',
        borderWidth: 1,
        barThickness: 37,
        minBarLength: 2,
        barPercentage: 5.0,
      },
    ],
  };

  // Chart options: y-axis shows percentages
  const options = {
    scales: {
      y: {
        max: 400,
        ticks: {
          // Include a percentage sign in the ticks
          callback: function (value) {
            return value + '%';
          },
        },
      },
    },
  };

  // Render the chart using Bar component from react-chartjs-2
  return <Bar data={data3} options={options} />;
};

AssessmentChart.propTypes = {
  productTestData: propTypes.any,
  aflatoxin: propTypes.any
};

export default AssessmentChart;
