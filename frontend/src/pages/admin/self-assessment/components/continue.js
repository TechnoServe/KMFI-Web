import React from 'react';
import {Stack, Text, Flex} from '@chakra-ui/react';

/**
 * ContinueView displays a static instruction card prompting users
 * to click a category to continue the Self Assessment Tool process.
 *
 * @returns {JSX.Element} A styled card UI with guidance for user interaction
 */
const ContinueView = () => {
  return (
    // Outer container styled with border, shadow, and rounded edges
    <Flex
      className="background-color-white container-480 padding-0 box-shadow-small rounded-large"
      style={{
        boxShadow: 'Shadow/small',
        border: '1px solid #1D1C361A',
      }}
      flexDirection="column"
    >
      {/* // Inner content stack containing the instructional text */}
      <Stack flex="1" p="5">
        {/* // Instructional message for the user */}
        <Text className="text-base" fontWeight="700" fontSize="20px" pt="7" pb="2">
          Click on a category to continue the Self Assessment Tool
        </Text>
      </Stack>
      {/* // Footer spacer area with light gray background */}
      <Flex bg="#FAFAFA" h="64px" w="100%" p="4" justifyContent="space-between"></Flex>
    </Flex>
  );
};
export default ContinueView;
