import React, {useState} from 'react';
import propTypes from 'prop-types';
import 'styles/webflow.css';
import 'styles/mfi-tns.webflow.css';
import 'styles/normalize.css';
import {useDisclosure} from '@chakra-ui/react';
import {nanoid} from '@reduxjs/toolkit';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
} from '@chakra-ui/react';
import ProductModalHeader from 'components/productTestingScores/testingScoreModal';

/**
 * ProductScoreCard displays a summary of product fortification compliance status for each brand
 * and provides a button to view detailed modal results.
 *
 * @param {Object} props - Component props
 * @param {Object} props.fortifyAndProductTest - Contains brand and product test data
 * @returns {JSX.Element} React component showing fortification status and details modal
 */
const ProductScoreCard = ({fortifyAndProductTest}) => {
  // Manages modal open/close state
  const {isOpen, onOpen, onClose} = useDisclosure();
  // Stores the selected brand whose details should be shown in the modal
  const [brandID, setBrandID] = useState();

  return (
    <div className="flex flex-row-middle flex-align-baseline width-full tablet-flex-column">
      <div className="flex-child-grow tablet-width-full" >
        <div className="width-full">

          {fortifyAndProductTest?.brands.map((comply) =>
            // Render a row for each brand's fortification status and details button
            <div key={comply.id} className="flex-justify-end margin-bottom-4 items-center tablet-width-full portrait-flex-justify-start">
              <div className="text-small margin-right-4 flex-child-grow portrait-width-full portrait-margin-right-0">
                {comply.name}
              </div>
              <div className="margin-right-4 flex flex-column">
                <div className="padding-x-3 padding-y-2 mb-2 rounded-large background-color-blue-lighter text-center" style={{width: 144}}>
                  <div className="text-small text-color-blue weight-medium">

                    {/* Determine fortification status based on percentage_compliance thresholds */}
                    {comply?.productTests[0]?.results?.map((x) => x.percentage_compliance).every((el) => el >= 80) ? 'Fully Fortified'
                      : comply?.productTests[0]?.results?.map((x) => x.percentage_compliance).every((el) => el <= 30) ? 'Not Fortified'
                        : comply?.productTests[0]?.results?.map((x) => x.percentage_compliance).some((el) => el >= 51) ? 'Adequately Fortified'
                          : comply?.productTests[0]?.results?.map((x) => x.percentage_compliance).some((el) => el >= 31) ? 'Inadequately Fortified'
                            :
                            ''}
                    {/* {console.log('comply', comply?.productTests[0]?.results?.map((x) => x.percentage_compliance))} */}

                  </div>
                </div>
              </div>
              {/* On click, open modal and set the brand to be viewed in detail */}
              <div onClick={onOpen} className="flex justify-end">
                <button className="button-secondary button-small margin-right-3 w-button" onClick={() => {
                  setBrandID(comply);
                }}>
                  Details</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal to display detailed product test results using ProductModalHeader */}
      <Modal size={'3xl'} isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <div className="background-color-white border-1px box-shadow-large rounded-large w-full h-screen mt-4 overflow-scroll">
            {/* Render product test details for selected brand using modal header component */}
            <ProductModalHeader key={nanoid()} productTest={fortifyAndProductTest} product="Dangote Flour"
              uniqueBrands={brandID}
            />
            <ModalCloseButton style={{position: 'absolute', right: '0', background: '#fff', borderRadius: '50%', left: '100%'}} className="box-shadow-large" />
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
};

// Define PropTypes for the ProductScoreCard component
ProductScoreCard.propTypes = {
  effect: propTypes.any,
  status: propTypes.any,
  product: propTypes.any,
  fortifyAndProductTest: propTypes.any,
};

export default ProductScoreCard;
