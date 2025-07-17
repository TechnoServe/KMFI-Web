import React, {useEffect, useState} from 'react';
import propTypes from 'prop-types';
import '../progress.css';

/**
 * ProgressChart component
 * Displays two animated progress bars based on `size` and `range` values.
 * Uses a timeout to animate width changes after component mounts.
 *
 * @component
 * @param {Object} props - Component props
 * @param {number} props.size - Width percentage for the primary progress bar
 * @param {number} props.range - Width percentage for the secondary progress bar
 * @returns {JSX.Element} A progress bar component with two visual bars
 */
const ProgressChart = ({size, range}) => {
  // State for the first progress bar's width
  const [width, setWidth] = useState(null);
  // State for the second progress bar's width
  const [width2, setWidth2] = useState(null);

  // On component mount or when `size` or `range` changes, update the widths after 1 second
  useEffect(() => {
    setTimeout(() => {
      setWidth(`${size}%`);
      setWidth2(`${range}%`);
    }, 1000);
  }, [size, range]);

  // Render two progress bars with animated width styles
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
