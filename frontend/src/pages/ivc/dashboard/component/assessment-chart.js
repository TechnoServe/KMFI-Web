import React from 'react';
import {Bar} from 'react-chartjs-2';

/**
 * AssessmentChart Component
 * Renders a bar chart comparing validated scores and self-assessment scores
 * across multiple categories using react-chartjs-2.
 *
 * @component
 * @returns {JSX.Element} A bar chart with two datasets representing different assessment scores
 */
const AssessmentChart = () => {
  // Chart data configuration including labels and two datasets for scores
  const data3 = {
    labels: ['Personal', 'Production', 'Procurement and Supply', 'Public Engagement', 'Governance'],
    datasets: [
      {
        label: 'validated score',
        data: [80, 60, 82, 75, 70],
        backgroundColor: 'rgba(202, 211, 244, 1)',
        borderWidth: 1,
        barThickness: 37,
        minBarLength: 2,
        barPercentage: 5.0,
      },
      {
        label: 'self assessment score',
        data: [60, 70, 92, 85, 50],
        backgroundColor: 'rgba(82, 108, 219, 1)',
        borderWidth: 1,
        barThickness: 37,
        minBarLength: 2,
        barPercentage: 5.0,
      },
    ],
  };

  // Chart options configuration, sets max value and percentage formatting for Y-axis
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

  // Render the bar chart with the configured data and options
  return <Bar data={data3} options={options} />;
};

export default AssessmentChart;
