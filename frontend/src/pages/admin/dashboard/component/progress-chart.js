import React, {useEffect, useState} from 'react';
import propTypes from 'prop-types';
import '../progress.css';

/**
 * ProgressChart component renders two progress bars:
 * - A static progress bar (10%)
 * - A dynamic progress bar whose width is based on props `range`
 *
 * @param {Object} props - Component props
 * @param {number} props.size - Percentage size for the first progress bar (currently unused in render)
 * @param {number} props.range - Percentage width for the second progress bar
 * @returns {JSX.Element} A styled progress chart element
 */
const ProgressChart = ({size, range}) => {
  // State to hold the width for the first progress bar (currently not rendered)
  const [width, setWidth] = useState(null);
  // State to hold the width for the second progress bar (visible)
  const [width2, setWidth2] = useState(null);

  // Set the width values after a short delay to simulate animation
  useEffect(() => {
    setTimeout(() => {
      setWidth(`${size}%`);
      setWidth2(`${range}%`);
    }, 1000);
  }, [size, range]);


  // Render the progress bar container and two progress segments
  return (
    <div className="progress-bar">
      <div style={{width: '10%'}} className="progress"></div>
      <div style={{width: width2}} className="progress2"></div>
    </div>
  );
};

ProgressChart.propTypes = {
  size: propTypes.number,
  range: propTypes.number,
};

export default ProgressChart;
