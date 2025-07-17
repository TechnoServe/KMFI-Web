import React from 'react';
import propTypes from 'prop-types';
import {useDisclosure} from '@chakra-ui/react';
import {request} from 'common';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  Text,
  MenuItem,
} from '@chakra-ui/react';
import {FiTrash} from 'react-icons/fi';


/**
 * RemoveIndustry renders a menu item and modal confirmation dialog
 * for deleting a company from the live index.
 *
 * @param {Object} props - React component props
 * @param {Object} props.company - The company object containing the ID and name
 * @returns {JSX.Element} Menu item and modal for company removal confirmation
 */
const RemoveIndustry = ({company}) => {
  // Hook to manage modal open/close state
  const {isOpen, onClose} = useDisclosure();

  /**
   * Sends a DELETE request to remove the company from the backend.
   * Displays success or error toast and reloads page on success.
   *
   * @returns {Promise<void>}
   */
  const removeCompany = async () => {
    const res = await request(true).delete(`admin/company/delete/${company.id}`);
    if (res.status === 200) {
      setTimeout(() => {
        location.reload();
      }, 2000);
      return toast({
        status: 'success',
        title: 'success',
        position: 'top-right',
        description: `${res.data.success}`,
        duration: 6000,
        isClosable: true,
      });
    } else {
      return toast({
        status: 'error',
        title: 'Error',
        position: 'top-right',
        description: 'Something went wrong',
        duration: 6000,
        isClosable: true,
      });
    }
  };


  // Render delete menu item and confirmation modal
  return (
    <>
      {/* Trigger for delete modal */}
      <MenuItem value="delete" color="red" icon={<FiTrash color='red' />}>
        Delete
      </MenuItem>
      {/* Modal dialog for confirming company removal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            {/* Modal title and confirmation message */}
            <Text
              fontFamily="DM Sans"
              fontWeight="700"
              fontSize="16px"
              fontStyle="normal"
              color="#1E1F24"
              height="21px"
              my="1.5rem"
            >
              Confirm Remove
            </Text>
            {/* Modal title and confirmation message */}
            <Text
              fontFamily="DM Sans"
              fontWeight="normal"
              fontSize="14px"
              fontStyle="normal"
              color="#1E1F24"
              lineHeight="21px"
              my="1.5rem"
            >
              {company?.company_name} will be removed from the Live Index.
            </Text>
            <ModalFooter className="padding-y-6 padding-x-4 flex-justify-end background-secondary border-top-1px rounded-large bottom sticky-bottom-0">
              <div>
                {/* Action buttons for cancelling or confirming removal */}
                <a className="button-secondary button-small margin-right-3 w-button">Cancel</a>
                {/* Action buttons for cancelling or confirming removal */}
                <a onClick={() => removeCompany()} className="button-danger button-small w-button">Confirm Remove</a>
              </div>
            </ModalFooter>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

RemoveIndustry.propTypes = {
  company: propTypes.any
};

export default RemoveIndustry;
