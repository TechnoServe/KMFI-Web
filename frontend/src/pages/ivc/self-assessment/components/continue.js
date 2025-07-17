import React from 'react';
import {Stack, Text, Flex} from '@chakra-ui/react';

/**
 * ContinueView component renders a prompt for users to select a category
 * and continue the self-assessment process.
 *
 * @returns {JSX.Element} A styled container with instructional text and footer area.
 */
const ContinueView = () => {
  // Main container with styling, shadow, and column layout
  return (
    <Flex
      className="background-color-white container-480 padding-0 box-shadow-small rounded-large"
      style={{
        boxShadow: 'Shadow/small',
        border: '1px solid #1D1C361A',
      }}
      flexDirection="column"
    >
      {/* Stack for vertical spacing and padding inside container */}
      <Stack flex="1" p="5">
        {/* Instructional heading prompting the user to select a category */}
        <Text className="text-base" fontWeight="700" fontSize="20px" pt="7" pb="2">
          Click on a category to continue the Self Assessment Tool
        </Text>
      </Stack>
      {/* Footer area with light background (can be used for actions or navigation) */}
      <Flex bg="#FAFAFA" h="64px" w="100%" p="4" justifyContent="space-between"></Flex>
    </Flex>
  );
};
export default ContinueView;
