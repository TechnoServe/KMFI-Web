import React from 'react';
import {useDisclosure} from '@chakra-ui/react';
import propTypes from 'prop-types';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody
} from '@chakra-ui/react';
// import image from '../../assets/images/dangote-sugar.png';

/**
 * DenyPermission component renders a modal dialog prompting the user to leave a note
 * explaining why a product's permission was denied.
 *
 * @param {Object} props - React component props
 * @param {string} props.productName - Name of the product associated with the denial
 * @param {string|number} props.tier - Tier level of the product
 * @returns {JSX.Element} A button that triggers a modal with a denial form
 */
const DenyPermission = ({productName, tier}) => {
  // Hook to manage the open/close state of the modal
  const {isOpen, onOpen, onClose} = useDisclosure();

  // Button to trigger the denial modal
  return (
    <>
      <button onClick={onOpen} className="button-secondary button-small margin-right-3 w-button">Deny</button>

      {/* Modal component to capture the reason for denial */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalBody className="background-color-white border-1px padding-top-4 box-shadow-large rounded-large width-150 padding-top-10">
            {/* <div className="background-color-white border-1px padding-top-4 box-shadow-large rounded-large width-150 padding-top-10"> */}
            {/* <div class="background-color-white border-1px padding-top-4 box-shadow-large rounded-large width-150 padding-top-10"> */}
            <div className="flex-column-centered padding-x-16 padding-bottom-5 border-bottom-1px">
              {/* <img src={image} loading="lazy" alt="" /> */}
              {/* Display location and product information */}
              <div className="text-small text-color-body-text margin-top-4">Nigeria · {productName} · {tier}</div>
            </div>
            <div className="flex-column-centered padding-x-16 padding-bottom-6 padding-top-6">
              <div className="width-9-12 margin-bottom-6">
                {/* Modal title and description prompting for a reason */}
                <h6 className="tracking-medium text-align-center margin-bottom-0">Please leave a note</h6>
                <div className="text-small leading-medium text-color-body-text text-align-center">It’s helpful for the company to know why their permission was denied</div>
              </div>
              <div className="width-9-12 w-form">
                <form id="email-form-2" name="email-form-2" data-name="Email Form 2">
                  {/* Input field to enter the reason for denial */}
                  <textarea placeholder="State reason here" maxLength="5000" id="field" name="field" required="" data-name="Field" className="text-area w-input"></textarea>
                  <div className="flex-justify-end">
                    {/* Submit button for the form */}
                    <input type="submit" value="Submit" data-wait="Please wait..." className="button button-small w-button" />
                  </div>
                </form>
                {/* Message shown on successful form submission */}
                <div className="w-form-done">
                  <div>Thank you! Your submission has been received!</div>
                </div>
                {/* Message shown on failed form submission */}
                <div className="w-form-fail">
                  <div>Oops! Something went wrong while submitting the form.</div>
                </div>
              </div>
            </div>
            {/* </div> */}
            {/* </div> */}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

DenyPermission.propTypes = {
  productName: propTypes.any,
  tier: propTypes.any
};

export default DenyPermission;
