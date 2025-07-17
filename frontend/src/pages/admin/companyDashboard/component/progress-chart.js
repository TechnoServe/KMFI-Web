import React, {useEffect, useState} from 'react';
import propTypes from 'prop-types';
import '../progress.css';

/**
 * ProgressChart component displays two animated progress bars.
 * One bar represents the `size` value, and the other represents the `range` value.
 *
 * @param {Object} props - Component props
 * @param {number} props.size - Percentage width for the first progress bar
 * @param {number} props.range - Percentage width for the second progress bar
 * @returns {JSX.Element} A dual progress bar visualization
 */
const ProgressChart = ({size, range}) => {
  // State to store the width of the first progress bar
  const [width, setWidth] = useState(null);
  // State to store the width of the second progress bar
  const [width2, setWidth2] = useState(null);

  // Set the widths after a 1-second delay to trigger animation
  useEffect(() => {
    setTimeout(() => {
      setWidth(`${size}%`);
      setWidth2(`${range}%`);
    }, 1000);
  }, [size, range]);

  // Render the progress bar container and two styled progress indicators
  return (
    <div className="progress-bar">
      <div style={{width}} className="progress"></div>
      <div style={{width: width2}} className="progress2"></div>
    </div>
  );
};

ProgressChart.propTypes = {
  size: propTypes.number,
  range: propTypes.number,
};

export default ProgressChart;
