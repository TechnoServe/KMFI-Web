import React from 'react';
import 'styles/webflow.css';
import 'styles/mfi-tns.webflow.css';
import propTypes from 'prop-types';
import 'styles/normalize.css';

/**
 * IndustryModalHeader displays a sticky header section for an industry modal.
 * It renders the given title and product name with styled layout.
 *
 * @param {Object} props - Component props
 * @param {string} props.title - The title to display in the header
 * @param {string} props.product - The product name to display under the title
 * @returns {JSX.Element} Rendered header component for a modal
 */
const IndustryModalHeader = ({title, product}) => {
  // Render sticky header section with title and product name
  return (
    <div className="flex-row-middle flex-space-between padding-5 background-color-white sticky-top-0">
      <div>
        {/* // Display modal title in bold text */}
        <h6 className="margin-bottom-0 weight-medium margin-bottom-1"> {title}</h6>
        {/* // Display the product name in smaller, muted text */}
        <div className="text-small text-color-body-text"> {product} </div>
      </div>
    </div>
  );
};

IndustryModalHeader.propTypes = {
  title: propTypes.string,
  product: propTypes.string
};

export default IndustryModalHeader;

