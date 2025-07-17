import React from 'react';
import Header from './header';
import proptypes from 'prop-types';


/**
 * PageLayout wraps the company index page content with a header and children.
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The content to be rendered inside the layout
 * @returns {JSX.Element} Layout with header and page content
 */
const PageLayout = ({children}) => {
  // Render the page header and nested content
  return (
    <div>
      <Header/>
      {children}
    </div>
  );
};

PageLayout.propTypes = {
  children: proptypes.any,
};

export default PageLayout;
