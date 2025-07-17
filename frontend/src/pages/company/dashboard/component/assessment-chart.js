import React from 'react';
import {Bar} from 'react-chartjs-2';
import propTypes from 'prop-types';

/**
 * AssessmentChart component renders a comparative bar chart of self-assessment and validated scores
 * across multiple performance categories using Chart.js.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array<number>} props.extractedSATScores - Array of validated scores to be displayed in the chart
 * @returns {JSX.Element} A bar chart comparing self-assessment and validated scores
 */
const AssessmentChart = ({extractedSATScores}) => {
  // Define the bar chart data, including labels and two datasets for validated and self-assessment scores
  const data3 = {
    labels: [
      'People Management Systems',
      'Production, Continuous Impovement & Innovation',
      'Procurement & Inputs Management',
      'Public Engagement',
      'Governance & Leadership Culture',
    ],
    datasets: [
      {
        label: 'validated score',
        data: [...extractedSATScores],
        backgroundColor: 'rgba(202, 211, 244, 1)',
        borderWidth: 1,
        barThickness: 37,
        minBarLength: 2,
        barPercentage: 5.0,
      },
      {
        label: 'self assessment score',
        data: [21, 17, 9, 11, 17],
        backgroundColor: 'rgba(82, 108, 219, 1)',
        borderWidth: 1,
        barThickness: 37,
        minBarLength: 2,
        barPercentage: 5.0,
      },
    ],
  };

  // Configure chart options including Y-axis with percentage tick labels
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

  // Render the Bar chart component with defined data and options
  return <Bar data={data3} options={options} />;
};

export default AssessmentChart;

AssessmentChart.propTypes = {
  extractedSATScores: propTypes.any
};
