import * as React from 'react';
import {Line} from 'react-chartjs-2';

/**
 * CustomLine renders a Line chart representing industry breakdown data across product types.
 *
 * @returns {JSX.Element} A Line chart visualizing industry data using react-chartjs-2
 */
const CustomLine = () => {
  // Define chart data including labels and dataset for industry breakdown
  const data3 = {
    labels: ['Flour', 'Oil', 'Sugar'],
    datasets: [
      {
        label: 'Industry Breakdown',
        data: [13, 5, 3, 2, 9],
        backgroundColor: [
          'rgb(103, 197, 134)',
          'rgb(233, 246, 237)',
          'rgb(169, 222, 186)',
          'rgb(200, 234, 211)',
        ],
        hoverOffset: 4,
      },
    ],
  };

  // Chart configuration settings including legend position and scale visibility
  const options = {
    plugins: {
      legend: {
        display: true,
        position: 'right',
      },
    },
    scales: {
      y: {
        display: false,
      },
      x: {
        display: false,
      },
    },
    responsive: false,
  };

  // Render the Line chart with specified data and options
  return <Line data={data3} width={300} options={options} />;
};

export default CustomLine;
