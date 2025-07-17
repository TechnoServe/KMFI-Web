import React from 'react';
import propTypes from 'prop-types';
import 'styles/webflow.css';
import 'styles/mfi-tns.webflow.css';
import 'styles/normalize.css';

/**
 * ProductScoreCard component displays a product name alongside its status.
 * It uses flexible layout styling for responsive rendering on various devices.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.status - The status value to be displayed (e.g. "Pass", "Fail")
 * @param {string} props.product - The product name associated with the score
 * @returns {JSX.Element} A styled component showing the product and its score status
 */
const ProductScoreCard = ({status, product}) => {
  // Render product name and score status in a responsive flex layout
  return (
    <div className="flex flex-row-middle flex-align-baseline width-full tablet-flex-column">
      <div className="flex-child-grow tablet-width-full">
        <div className="width-full">
          <div className="flex-justify-end margin-bottom-4 items-center tablet-width-full portrait-flex-justify-start">
            <div className="text-small margin-right-4 flex-child-grow portrait-width-full portrait-margin-right-0">
              {product}
            </div>
            <div className="margin-right-4 flex flex-column">
              <div className="text-small text-color-blue weight-medium">{status}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ProductScoreCard.propTypes = {
  status: propTypes.string,
  product: propTypes.string,
};

export default ProductScoreCard;
