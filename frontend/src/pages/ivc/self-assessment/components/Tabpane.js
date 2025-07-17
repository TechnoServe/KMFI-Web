import React from 'react';
import PropTypes from 'prop-types';

/**
 * TabPane component serves as a container for tab content in the IVC self-assessment flow.
 * It simply renders its children, allowing for nested tabbed content.
 *
 * @component
 * @param {Object} props - React props
 * @param {string} props.name - The name of the tab (used for identification)
 * @param {React.ReactNode} props.children - Elements to render inside the tab
 * @returns {JSX.Element} Rendered tab content
 */
const TabPane = (props) => {
  // Render the children elements inside the TabPane
  return props.children;
};
TabPane.propTypes = {
  name: PropTypes.string,
  children: PropTypes.any,
};

export default TabPane;
