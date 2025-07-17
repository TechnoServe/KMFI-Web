import React from 'react';
import {Flex} from '@chakra-ui/react';
import propTypes from 'prop-types';
import Introduction from './introduction';
import ContinueView from './continue';
import {isNumber} from 'validate.js';

/**
 * EmptyTab component conditionally renders either the Introduction or ContinueView component
 * based on whether `progress` is a number.
 *
 * @param {Object} props - Component properties
 * @param {any} props.progress - Represents progress value (can be a number or null/undefined)
 * @param {Function} props.getCompanyDetails - Function to fetch company details, passed to Introduction
 * @returns {JSX.Element} A layout wrapper that shows either an introduction or progress continuation view
 */
const EmptyTab = ({progress, getCompanyDetails}) => {
  // Render layout wrapper with header and conditional content
  return (
    <div style={{width: '100%'}}>
      <div className="flex-row-middle flex-space-between padding-x-10 padding-y-4 border-bottom-0px height-20 background-color-white sticky-top-0"></div>
      <Flex bg="white" justifyContent="center" alignItems="center" height="100%">
        {/* If progress is a number, show the ContinueView; otherwise show the Introduction component */}
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
