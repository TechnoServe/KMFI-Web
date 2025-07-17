import React from 'react';
import {Button, Flex, Text, Icon} from '@chakra-ui/react';
import {FcCheckmark} from 'react-icons/fc';
import propTypes from 'prop-types';

/**
 * FinishAnswer displays a success message after answers are submitted.
 * It optionally shows a continue button if the end of subcategory has not been reached.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.moveToNext - Callback function to proceed to the next requirement
 * @param {boolean} props.endOfSubCat - Flag indicating if the current subcategory is completed
 * @returns {JSX.Element} The rendered success message with conditional navigation
 */
const FinishAnswer = ({moveToNext, endOfSubCat}) => {
  return (
    // Outer container centering the success message content
    <Flex
      height="90vh"
      justifyContent="center"
      flexDirection="column"
      alignItems="center"
      className="flex-row-middle padding-x-10 background-color-white border-bottom-1px sticky-top-0 sticky-80px w-tab-menu"
    >
      {/* Circular icon container with checkmark */}
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
      {/* Main success message */}
      <Text mt="5" fontWeight="700" fontSize="20px" color="rgba(0, 0, 0, 1)" textAlign="center">
        Your answers have been uploaded successfully
      </Text>
      {/* Secondary instruction message depending on subcategory status */}
      <Text textAlign="center" color="rgba(28, 29, 38, 0.6)">
        {endOfSubCat ?
          'Please select next category ' :
          'Click continue to proceed to the next requirement'}
      </Text>
      {/* Conditionally render the Continue button if not at end of subcategory */}
      {endOfSubCat ? (
        ''
      ) : (
        <Button mt="5" _focus={{outline: 'none'}} onClick={moveToNext} bg="#00B27A" color="white">
          Continue
        </Button>
      )}
    </Flex>
  );
};

FinishAnswer.propTypes = {
  moveToNext: propTypes.any,
  endOfSubCat: propTypes.any,
};

export default FinishAnswer;
