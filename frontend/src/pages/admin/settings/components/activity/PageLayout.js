import React from 'react';
import Header from './header';
import proptypes from 'prop-types';


const PageLayout = ({children, activities}) => {
  return (
    <div>
      <Header activity={activities} />
      {children}
    </div>
  );
};

PageLayout.propTypes = {
  children: proptypes.any,
  activities: proptypes.any,
};

export default PageLayout;
