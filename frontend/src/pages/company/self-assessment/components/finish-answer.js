import React from 'react';
import {Button, Flex, Text, Icon} from '@chakra-ui/react';
import {FcCheckmark} from 'react-icons/fc';
import propTypes from 'prop-types';

/**
 * FinishAnswer component displays a completion message after a user finishes the self-assessment.
 * It shows a success icon, congratulatory text, and conditionally renders a continue button.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.moveToNext - Function to move to the next requirement or question
 * @param {boolean} props.endOfSubCat - Flag to determine if the current subcategory is the last one
 * @returns {JSX.Element} The rendered congratulatory message and navigation controls
 */
const FinishAnswer = ({moveToNext, endOfSubCat}) => {
  // Container for entire completion message with centered layout
  return (
    <Flex
      height="90vh"
      justifyContent="center"
      flexDirection="column"
      alignItems="center"
      className="flex-row-middle padding-x-10 background-color-white border-bottom-1px sticky-top-0 sticky-80px w-tab-menu"
    >
      {/* Circular background with checkmark icon */}
      <Flex
        justifyContent="center"
        alignItems="center"
        w="120px"
        h="120px"
        bg="rgba(0, 178, 119, 0.13)"
        mt="-200px"
        borderRadius="50%"
      >
        <Icon fontSize="40px" as={FcCheckmark} />
      </Flex>
      {/* Congratulatory headline and description text */}
      <Text mt="5" fontWeight="700" fontSize="20px" color="rgba(0, 0, 0, 1)" textAlign="center">
        <p><strong>Congratulations! You have completed the self-assessment!</strong></p>
      Your answers have been uploaded successfully
      </Text>
      {/* Instructional text based on subcategory status */}
      <Text textAlign="center" color="rgba(28, 29, 38, 0.6)">
        {endOfSubCat ?
          'Please select next category ' :
          'Click continue to proceed to the next requirement'}
      </Text>
      {/* Conditionally render continue button if not end of subcategory */}
      {endOfSubCat ? (
        ''
      ) : (
        // Continue button to proceed to next requirement
        <Button mt="5" _focus={{outline: 'none'}} onClick={moveToNext} bg="#00B27A" color="white">
          Continue
        </Button>
      )}
    </Flex>
  );
};

FinishAnswer.propTypes = {
  moveToNext: propTypes.any,
  endOfSubCat: propTypes.any
};

export default FinishAnswer;
