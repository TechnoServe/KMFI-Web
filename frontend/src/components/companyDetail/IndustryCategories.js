import React, {useState} from 'react';
import 'styles/webflow.css';
import 'styles/mfi-tns.webflow.css';
import 'styles/normalize.css';
import propTypes from 'prop-types';
import {Box} from '@chakra-ui/react';

/**
 * IndustryCategories renders a form row that allows input of a raw score and calculates
 * a weighted percentage score based on the provided weight.
 *
 * @param {Object} props - Component props
 * @param {string} props.name - The name of the industry category
 * @param {string} props.description - A brief description of the category
 * @param {number} props.weight - The weight (in percentage) of the category in the overall score
 * @returns {JSX.Element} Form section for score entry and weighted calculation
 */
const IndustryCategories = ({name, description, weight}) => {
  // State to store the raw score input value
  const [weightedScore, setWeightedScore] = useState(0);
  // Main container for the weighted score form block
  return (

    <Box fontFamily="DM Sans">
      {/* Display the name of the industry category */}
      <div className="padding-bottom-6 border-bottom-1px w-form">
        <form>
          {/* Display a short description of the industry category */}
          <div className="text-base weight-medium margin-bottom-2">{name}</div>
          <p className="text-small text-color-body-text"> {description}</p>
          <div>
            <div className="w-layout-grid grid-3-columns padding-4 rounded-large background-secondary margin-top-5">
              {/* Display the weight percentage (disabled input) */}
              <div>
                <label htmlFor="email-4" className="form-label small">Weighting(%)</label>
                <input
                  type="text"
                  className="form-input margin-bottom-0 w-input"
                  disabled
                  maxLength="256"
                  placeholder="20%"
                  value={`${weight}%`}
                />
              </div>
              {/* Input for the user to enter the raw score */}
              <div>
                <label htmlFor="email-4" className="form-label small">Scores</label>
                <input
                  type="text"
                  className="form-input margin-bottom-0 w-input"
                  maxLength="256"
                  placeholder=""
                  required=""
                  onChange={(e) => setWeightedScore(e.target.value)}
                />
              </div>
              {/* Automatically calculated weighted score = (score * weight / 100) */}
              <div>
                <label htmlFor="email-4" className="form-label small">Weighted</label>
                <input
                  type="text"
                  className="form-input margin-bottom-0 w-input"
                  disabled
                  placeholder="20%"
                  required=""
                  value={`${weightedScore * weight / 100}%`}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </Box>
  );
};

IndustryCategories.propTypes = {
  name: propTypes.string,
  description: propTypes.string,
  weight: propTypes.any,
};


export default IndustryCategories;
