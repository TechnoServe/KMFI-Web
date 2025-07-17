import React from 'react';
import PropTypes from 'prop-types';
import './style.scss';

/**
 * CircularLoader React component that renders a modern Google-style loading spinner.
 *
 * @extends React.Component
 */
class Component extends React.Component {
  /**
   * Defines prop types for the CircularLoader component.
   *
   * @returns {Object} PropTypes definition
   */
  static get propTypes() {
    return {
      children: PropTypes.any,
      color: PropTypes.string,
    };
  }

  /**
   * Constructor for the CircularLoader component.
   *
   * @param {Object} props - React props passed to the component
   */
  constructor(props) {
    super(props);
  }

  /**
   * Renders the CircularLoader component JSX.
   *
   * @returns {JSX.Element} The rendered loader component
   */
  render() {
    // Return SVG-based loader markup with optional stroke color animation
    return (
      <>
        <div className="circular-loader">
          <svg className="vector" viewBox="25 25 50 50">
            <circle
              className="path"
              cx="50"
              cy="50"
              r="20"
              fill="none"
              strokeWidth="5"
              strokeMiterlimit="10"
            />
          </svg>
        </div>
        <style>
          {// Dynamically injects stroke color animation if color prop is provided
            this.props.color &&
            `
              @keyframes color {
                0%,
                100% {
                  stroke: ${this.props.color};
                }
              }
            `}
        </style>
      </>
    );
  }
}

export default Component;
