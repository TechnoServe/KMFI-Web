import React from 'react';
import 'styles/webflow.css';
import 'styles/mfi-tns.webflow.css';
import propTypes from 'prop-types';
import 'styles/normalize.css';


/**
 * CompanyNameCard component displays the main company name and its details
 * such as country, product, and tier level in a responsive layout.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.companyDetail - Object containing company data and metadata
 * @returns {JSX.Element} A styled component showing company name and details
 */
const CompanyNameCard = ({companyDetail}) => {
  // Render the company name and a row of details (country, product, tier)
  return (
    <div className="flex-row-middle flex-align-baseline width-full tablet-flex-column">
      <div className="flex-child-grow width-64 tablet-margin-bottom-2">
        <div className="weight-medium text-color-1 uppercase">{companyDetail?.name}</div>
        <div className="flex-row">
          <div className="text-xs margin-right-2">{companyDetail?.company_name_detail?.country}</div>
          <div className="text-xs margin-right-2">{companyDetail?.company_name_detail?.product}</div>
          <div className="text-xs margin-right-2">Tier {companyDetail?.company_name_detail?.tier}</div>
        </div>
      </div>
    </div>
  );
};

CompanyNameCard.propTypes = {
  companyDetail: propTypes.any,
};

export default CompanyNameCard;
