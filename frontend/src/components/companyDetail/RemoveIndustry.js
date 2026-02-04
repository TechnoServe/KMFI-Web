import React, {useState} from 'react';
import propTypes from 'prop-types';
import {useDisclosure, useToast, Button} from '@chakra-ui/react';
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
  const {isOpen, onOpen, onClose} = useDisclosure();
  const toast = useToast();
  const [isRemoving, setIsRemoving] = useState(false);

  /**
   * Sends a DELETE request to remove the company from the backend.
   * Displays success or error toast and reloads page on success.
   *
   * @returns {Promise<void>}
   */
  const removeCompany = async () => {
    console.log('Removing company:', company);
    alert('Are you sure you want to remove this company? This action cannot be undone.');
    if (!company?.id) {
      return toast({
        status: 'error',
        title: 'Error',
        position: 'top-right',
        description: 'Missing company id',
        duration: 6000,
        isClosable: true,
      });
    }
    try {
      setIsRemoving(true);
      const res = await request(true).delete(`admin/company/delete/${company.id}`);
      if (res.status === 200) {
        toast({
          status: 'success',
          title: 'Success',
          position: 'top-right',
          description: `${res.data.success}`,
          duration: 4000,
          isClosable: true,
        });
        onClose();
        setTimeout(() => {
          location.reload();
        }, 600);
      } else {
        toast({
          status: 'error',
          title: 'Error',
          position: 'top-right',
          description: 'Something went wrong',
          duration: 6000,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        status: 'error',
        title: 'Error',
        position: 'top-right',
        description: err?.response?.data?.message || err?.message || 'Something went wrong',
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setIsRemoving(false);
    }
  };


  // Render delete menu item and confirmation modal
  return (
    <>
      {/* Trigger for delete modal */}
      <MenuItem
        value="delete"
        color="red"
        icon={<FiTrash color='red' />}
        closeOnSelect={false}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onOpen();
        }}
      >
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
          </ModalBody>
          <ModalFooter className="padding-y-6 padding-x-4 flex-justify-end background-secondary border-top-1px rounded-large bottom sticky-bottom-0">
            <div>
              {/* Action buttons for cancelling or confirming removal */}
              <Button onClick={onClose} className="button-secondary button-small margin-right-3 w-button" size="sm" variant="outline">Cancel</Button>
              {/* Action buttons for cancelling or confirming removal */}
              <Button
                onClick={(e) => {
                  e.preventDefault(); e.stopPropagation(); removeCompany();
                }}
                className="button-danger button-small w-button"
                size="sm"
                colorScheme="red"
                isLoading={isRemoving}
                loadingText="Removing..."
              >
                Confirm Remove
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

RemoveIndustry.propTypes = {
  company: propTypes.any
};

export default RemoveIndustry;
