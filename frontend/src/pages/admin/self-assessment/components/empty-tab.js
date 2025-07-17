import React from 'react';
import {Flex} from '@chakra-ui/react';
import propTypes from 'prop-types';
import Introduction from './introduction';
import ContinueView from './continue';
import {isNumber} from 'validate.js';

/**
 * EmptyTab component conditionally renders either an introduction view or continuation view
 * based on whether the company's assessment progress is available as a number.
 *
 * @component
 * @param {Object} props - React props
 * @param {number|null|undefined} props.progress - Numeric progress value to determine view
 * @param {Function} props.getCompanyDetails - Function to fetch company details for Introduction
 * @returns {JSX.Element} A conditional layout with Introduction or ContinueView
 */
const EmptyTab = ({progress, getCompanyDetails}) => {
  return (
    // Wrapper div for full-width container
    <div style={{width: '100%'}}>
      {/* // Header spacer row (currently empty but styled) */}
      <div className="flex-row-middle flex-space-between padding-x-10 padding-y-4 border-bottom-0px height-20 background-color-white sticky-top-0"></div>
      {/* // Centered content container for either Introduction or ContinueView */}
      <Flex bg="white" justifyContent="center" alignItems="center" height="100%">
        {/* // Conditionally render ContinueView if progress is a number; otherwise show Introduction */}
        {isNumber(progress) ? (
          <ContinueView />
        ) : (
          <Introduction getCompanyDetails={getCompanyDetails} />
        )}
      </Flex>
    </div>
  );
};

EmptyTab.propTypes = {
  progress: propTypes.any,
  getCompanyDetails: propTypes.any,
};
export default EmptyTab;
