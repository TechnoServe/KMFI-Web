import React from 'react';
import {Bar} from 'react-chartjs-2';
import propTypes from 'prop-types';

/**
 * AssessmentChart component renders a bar chart comparing validated SAT scores
 * with fixed self-assessment scores across five key business areas.
 *
 * @param {Object} props - React component props
 * @param {Array<number>} props.extractedSATScores - Array of validated SAT scores to plot
 * @returns {JSX.Element} A bar chart visualization using Chart.js
 */
const AssessmentChart = ({extractedSATScores}) => {
  // Define the chart data including labels and two datasets (validated and self-assessment scores)
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

  // Configuration options for the chart, including Y-axis max and label formatting
  const options = {
    scales: {
      y: {
        max: 100,
        ticks: {
          // Format tick values to show as percentages
          // Include a percentage sign in the ticks
          callback: function (value) {
            return value + '%';
          },
        },
      },
    },
  };

  // Render the bar chart using Chart.js with the specified data and options
  return <Bar data={data3} options={options} />;
};

export default AssessmentChart;

AssessmentChart.propTypes = {
  extractedSATScores: propTypes.any
};
