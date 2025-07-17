import React from 'react';
import {FiRefreshCw} from 'react-icons/fi';
import {useDisclosure, Button, Text} from '@chakra-ui/react';
import {request} from 'common';
import propTypes from 'prop-types';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
  MenuItem
} from '@chakra-ui/react';
// import {set} from 'core-js/core/dict';


/**
 * ComputeSATScores is a React component that triggers SAT and IVC score computation
 * for a given company and cycle using a confirmation modal.
 *
 * @param {Object} props - React component props
 * @param {Object} props.company - Company object containing `id` and `company_name`
 * @param {string|number} props.cycle - ID of the self-assessment cycle
 * @returns {JSX.Element} Menu item and confirmation dialog for triggering score computation
 */
const ComputeSATScores = ({company, cycle}) => {
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [loading, setLoading] = React.useState(false);

  const toast = useToast();

  // Extract company ID from props
  const companyId = company.id;
  // Extract company name for display in the confirmation dialog
  const companyName = company?.company_name;
  const cancelRef = React.useRef();

  /**
   * Sends a POST request to compute SAT scores for the given company and cycle.
   *
   * @returns {void}
   */
  const computeSATScores = async () => {
    setLoading(true);
    try {
      const body = {
        'company-id': companyId,
        'cycle-id': cycle,
        'assessment-type': 'SAT'
      };
      // Construct and send request to backend to compute scores
      const res = await request(true).post('assessments/compute-scores', body);
      setLoading(false);
      onClose();
      // Show success toast notification
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
      // Show error toast notification if request fails
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

  // Render menu item and confirmation alert dialog
  return (
    <>
      <MenuItem value="compute" icon={<FiRefreshCw strokeWidth="3" />} onClick={onOpen}>
        Compute Scores
      </MenuItem>

      <AlertDialog onOpen={onOpen} isOpen={isOpen} onClose={onClose} leastDestructiveRef={cancelRef}>
        <AlertDialogOverlay
          bg='blackAlpha.300'
          backdropFilter='blur(10px) hue-rotate(90deg)'
        />
        <AlertDialogContent>
          <AlertDialogHeader>Compute Results</AlertDialogHeader>
          <AlertDialogBody>
            <Text>Compute SAT &amp; IVC Results for {companyName}?</Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button size="sm" ref={cancelRef} onClick={onClose} variant='outline' mr={3}>Cancel</Button>
            <Button size="sm" colorScheme="green" isLoading={loading} loadingText="Computing..." onClick={computeSATScores} variant='solid'>Compute</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

ComputeSATScores.propTypes = {
  company: propTypes.any,
  cycle: propTypes.any,
};

export default ComputeSATScores;
