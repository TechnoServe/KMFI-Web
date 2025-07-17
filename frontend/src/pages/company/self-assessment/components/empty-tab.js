import React from 'react';
import {Flex} from '@chakra-ui/react';
import propTypes from 'prop-types';
import Introduction from './introduction';
import ContinueView from './continue';
import {isNumber} from 'validate.js';

/**
 * EmptyTab conditionally renders either the ContinueView or Introduction component
 * based on whether a numeric `progress` value is provided.
 *
 * @component
 * @param {Object} props - Component props
 * @param {any} props.progress - Progress indicator, used to determine which view to render
 * @returns {JSX.Element} The rendered component showing either ContinueView or Introduction
 */
const EmptyTab = ({progress}) => {
  // Render layout container with top sticky header and content view
  return (
    <div style={{width: '100%'}}>
      <div className="flex-row-middle flex-space-between padding-x-10 padding-y-4 border-bottom-0px height-20 background-color-white sticky-top-0"></div>
      {/* Centered content area displaying either ContinueView or Introduction */}
      <Flex bg="white" justifyContent="center" alignItems="center" height="100%">
        {/* If `progress` is a number, show ContinueView; otherwise, show Introduction */}
        {isNumber(progress) ? (
          <ContinueView />
        ) : (
          <Introduction />
        )}
      </Flex>
    </div>
  );
};

EmptyTab.propTypes = {
  progress: propTypes.any
};
export default EmptyTab;
