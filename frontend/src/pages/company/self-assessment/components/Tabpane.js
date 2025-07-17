import React from 'react';
import PropTypes from 'prop-types';

/**
 * TabPane is a wrapper component that simply renders its children.
 * It is used to encapsulate a specific tab's content in a tabbed interface.
 *
 * @component
 * @param {Object} props - Component properties
 * @param {string} props.name - Name or identifier of the tab
 * @param {React.ReactNode} props.children - The content to render inside the tab
 * @returns {JSX.Element} The rendered child components
 */
const TabPane = (props) => {
  // Render the children elements passed to this tab pane
  return props.children;
};
TabPane.propTypes = {
  name: PropTypes.string,
  children: PropTypes.any,
};

export default TabPane;
