import React from 'react';
import Header from './header';
import proptypes from 'prop-types';


/**
 * PageLayout component that wraps the page content with a common layout structure.
 * It includes the Header component and renders the child components inside a div.
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The child components to render inside the layout
 * @returns {JSX.Element} The layout structure with a header and children
 */
const PageLayout = ({children}) => {
  // Render the layout with a common Header and the children content
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
