import React from 'react';
import {FiUpload} from 'react-icons/fi';
// import {GiConfirmed} from 'react-icons/Gi';
import {Icon, useDisclosure} from '@chakra-ui/react';
import {request} from 'common';
import propTypes from 'prop-types';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ModalCloseButton,
  Button,
  useToast,
  MenuItem,
  Text
} from '@chakra-ui/react';
// import image from '../../assets/images/dangote-sugar.png';

/**
 * IndustryPermissionRequest renders a modal interface for publishing or unpublishing
 * SAT and IVC results for a company, based on their permission request and cycle.
 *
 * @param {Object} props - Component props
 * @param {Object} props.permissionRequest - The company's permission request object containing brand and score data
 * @param {string|number} props.cycle - The self-assessment cycle ID
 * @returns {JSX.Element} Menu item and modal dialog for publishing/unpublishing SAT & IVC results
 */
const IndustryPermissionRequest = ({permissionRequest, cycle}) => {
  // Chakra UI hook for managing modal state
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [loading, setLoading] = React.useState(false);
  const toast = useToast();
  // /api/v1/admin/approve-sat?company-id=KKKL&cycle-id=HHHJJ

  const companyId = permissionRequest.id;
  const companyName = permissionRequest?.company_name;
  const productName = permissionRequest?.brands.map((x) => x.productType?.name);
  const tier = permissionRequest.tier;
  // const latestPermission = permissionRequest.satScores.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];


  /**
   * Publishes SAT & IVC scores to the backend for the given company and cycle.
   *
   * @returns {Promise<void>}
   */
  const setPermission = async () => {
    setLoading(true);
    try {
      // const companyId = permissionRequest.brands.map((x) => x.company_id);
      // const cycle = permissionRequest?.brands?.map((x) => x.productTests?.map((x) => x.results?.map((x) => x.cycle_id)));
      // const cycleId = cycle[0][0][0] === undefined ? '' : cycle[0][0][0];
      const res = await request(true).post(`admin/publish-sat?company-id=${companyId}&cycle-id=${cycle}`);
      setLoading(false);
      return toast({
        status: 'success',
        title: 'Success',
        position: 'top-right',
        description: res.data.success,
        duration: 6000,
        isClosable: true,
      });
    } catch (error) {
      setLoading(false);
      console.log(error);
      return toast({
        status: 'error',
        title: 'Error',
        position: 'top-right',
        description: error.response.data.error,
        duration: 6000,
        isClosable: true,
      });
    }
  };

  /**
   * Unpublishes previously published SAT & IVC scores for the given company and cycle.
   *
   * @returns {Promise<void>}
   */
  const unpublish = async () => {
    setLoading(true);
    try {
      // const companyId = permissionRequest.brands.map((x) => x.company_id);
      // const cycle = permissionRequest?.brands?.map((x) => x.productTests?.map((x) => x.results?.map((x) => x.cycle_id)));
      // const cycleId = cycle[0][0][0] === undefined ? '' : cycle[0][0][0];
      const res = await request(true).post(`admin/unpublish-sat?company-id=${companyId}&cycle-id=${cycle}`);
      setLoading;
      return toast({
        status: 'success',
        title: 'Success',
        position: 'top-right',
        description: res.data.success,
        duration: 6000,
        isClosable: true,
      });
    } catch (error) {
      setLoading(false);
      console.log(error);
      return toast({
        status: 'error',
        title: 'Error',
        position: 'top-right',
        description: error.response.data.error,
        duration: 6000,
        isClosable: true,
      });
    }
  };


  // Menu item to open the publish/unpublish confirmation modal
  return (
    <>
      <MenuItem value="publishScores" icon={<FiUpload strokeWidth="3" />} onClick={onOpen} >
        Publish Scores
      </MenuItem>
      {/* {permissionRequest.satScores.length === 1 ?
          <div className="button-secondary button-small w-button " >
            <GiConfirmed style={{color: 'green'}} />
          </div>

        : permissionRequest.satScores.length > 1 ?
            <Tooltip hasArrow label='Publish Scores' bg='gray.300' color='black'>
              <IconButton size='sm' variant='outline' onClick={onOpen} aria-label='Publish Scores' icon={<FiUpload style={{color: '#D6341F'}} />} />
            </Tooltip>
          : ''
      } */}


      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        {/* Adds a blur overlay to the background of the modal */}
        <ModalOverlay
          bg='blackAlpha.300'
          backdropFilter='blur(10px) hue-rotate(90deg)'
        />
        <ModalContent>
          <ModalHeader>Publish Results</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Confirmation message showing company name */}
            <Text>Publish SAT &amp; IVC Results for {companyName}?</Text>
          </ModalBody>
          <ModalFooter>
            {/* Cancel button to close the modal without action */}
            <Button size="sm" onClick={onClose} variant='outline' mr={3}>Cancel</Button>
            {/* Unpublish button triggers unpublishing API call */}
            <Button size="sm" colorScheme="red" onClick={unpublish} variant='solid' mr={3} isLoading={loading} loadingText="Unpublishing...">Unpublish</Button>
            {/* Publish button triggers publishing API call */}
            <Button size="sm" colorScheme="green" onClick={setPermission} variant='solid' isLoading={loading} loadingText="Publishing...">Publish</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

IndustryPermissionRequest.propTypes = {
  permissionRequest: propTypes.any,
  cycle: propTypes.any,
};

export default IndustryPermissionRequest;
