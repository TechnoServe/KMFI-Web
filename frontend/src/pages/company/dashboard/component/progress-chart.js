import React, {useEffect, useState} from 'react';
import propTypes from 'prop-types';
import '../progress.css';

/**
 * ProgressChart renders a dual-layer progress bar to visually compare two percentages.
 *
 * @component
 * @param {Object} props - Component props
 * @param {number} props.size - The width percentage for the primary progress bar
 * @param {number} props.range - The width percentage for the secondary progress bar
 * @returns {JSX.Element} A dual progress bar component styled via CSS
 */
const ProgressChart = ({size, range}) => {
  // State for the width of the primary progress bar
  const [width, setWidth] = useState(null);
  // State for the width of the secondary progress bar
  const [width2, setWidth2] = useState(null);

  useEffect(() => {
    // Delay setting the widths to simulate animated transition on mount
    setTimeout(() => {
      setWidth(`${size}%`);
      setWidth2(`${range}%`);
    }, 1000);
  }, [size, range]);

  return (
    // Container for the dual progress bars
    <div className="progress-bar">
      {/* Primary progress bar styled with dynamic width */}
      <div style={{width}} className="progress"></div>
      {/* Secondary progress bar styled with dynamic width */}
      <div style={{width: width2}} className="progress2"></div>
    </div>
  );
};

ProgressChart.propTypes = {
  size: propTypes.number,
  range: propTypes.number,
};

export default ProgressChart;
