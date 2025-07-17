import React from 'react';
import propTypes from 'prop-types';
import {Box} from '@chakra-ui/react';
import 'styles/webflow.css';
import 'styles/mfi-tns.webflow.css';
import 'styles/normalize.css';

/**
 * IndustryExpertScores displays a given score with styling applied using Chakra UI and custom CSS.
 *
 * @component
 * @param {Object} props - Component props
 * @param {any} props.score - The score to be displayed (can be string or number)
 * @returns {JSX.Element} A styled box showing the score
 */
const IndustryExpertScores = ({score}) => {
  // Render the score inside a styled flex container with custom font
  return (
    <Box fontFamily="DM Sans">
      <div className="flex flex-row-middle flex-align-baseline width-full tablet-flex-column">
        <div className="flex-child-grow width-40 flex-align-center margin-right-2 tablet-full-width tablet-margin-bottom-2">
          <div className="flex-child-grow width-40 margin-right-2 flex-align-center tablet-flex-shrink tablet-margin-right-0 tablet-margin-left-2">
            {score}
          </div>
        </div>
      </div>
    </Box>
  );
};

IndustryExpertScores.propTypes = {
  effect: propTypes.string,
  score: propTypes.any,
};

export default IndustryExpertScores;
