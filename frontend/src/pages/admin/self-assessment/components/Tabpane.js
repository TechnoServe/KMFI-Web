import React from 'react';
import PropTypes from 'prop-types';

/**
 * TabPane is a wrapper component used to encapsulate individual tab content
 * in a tabbed interface. Its content is rendered directly as children.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.name - Name identifier for the tab
 * @param {React.ReactNode} props.children - The content to be displayed within this tab
 * @returns {JSX.Element} The rendered child elements
 */
const TabPane = (props) => {
  // Render the children passed to this tab panel (actual tab content)
  return props.children;
};
TabPane.propTypes = {
  name: PropTypes.string,
  children: PropTypes.any,
};

export default TabPane;
