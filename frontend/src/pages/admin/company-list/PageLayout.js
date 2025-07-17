import React from 'react';
import Header from './header';
import proptypes from 'prop-types';


/**
 * PageLayout component that wraps child content with a shared Header component.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be rendered within the layout
 * @param {Array<any>} props.companies - List of companies to pass to the Header component
 * @returns {JSX.Element} The rendered layout with header and children
 */
const PageLayout = ({children, companies}) => {
  // Render Header component and wrap the passed children
  return (
    <div>
      <Header company={companies} />
      {children}
    </div>
  );
};

PageLayout.propTypes = {
  children: proptypes.any,
  companies: proptypes.any,
};

export default PageLayout;
