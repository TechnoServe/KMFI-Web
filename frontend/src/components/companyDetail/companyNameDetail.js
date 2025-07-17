import React from 'react';
import 'styles/webflow.css';
import 'styles/mfi-tns.webflow.css';
import propTypes from 'prop-types';
import 'styles/normalize.css';

/**
 * Renders a company name card displaying the company name, brand name, and brand tier.
 *
 * @param {Object} props - Component props
 * @param {string} props.companyName - The name of the company
 * @param {string} props.brandName - The name of the brand
 * @param {string|number} props.brandTier - The tier level of the brand
 * @returns {JSX.Element} A styled card displaying company and brand information
 */
const CompanyNameCard = ({companyName, brandName, brandTier}) => {
  // Outer wrapper for responsive layout of the company name card
  return (
    <div className="flex-row-middle flex-align-baseline width-full tablet-flex-column">
      {/* Container for company and brand information */}
      <div className="flex-child-grow width-64 tablet-margin-bottom-2">
        {/* Display the company name in styled uppercase format */}
        <div className="weight-medium text-color-1 uppercase">{companyName}</div>
        <div className="flex-row">
          {/* Display the brand name in small text */}
          <div className="text-xs margin-right-2">{brandName}</div>
          {/* Display the brand tier in small text */}
          <div className="text-xs margin-right-2">Tier {brandTier}</div>

        </div>

      </div>
    </div>
  );
};

CompanyNameCard.propTypes = {
  companyName: propTypes.any,
  brandName: propTypes.any,
  brandTier: propTypes.any,
};

export default CompanyNameCard;
