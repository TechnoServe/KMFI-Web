import React from 'react';
import {Stack, Text, Flex} from '@chakra-ui/react';

/**
 * ContinueView is a UI component that prompts the user to continue their self-assessment
 * by selecting a category. It features a styled container with a message.
 *
 * @component
 * @returns {JSX.Element} A flex container with instructional text and footer section
 */
const ContinueView = () => {
  // Main container with white background, rounded corners, and box shadow
  return (
    <Flex
      className="background-color-white container-480 padding-0 box-shadow-small rounded-large"
      style={{
        boxShadow: 'Shadow/small',
        border: '1px solid #1D1C361A',
      }}
      flexDirection="column"
    >
      {/* Text section prompting the user to click a category */}
      <Stack flex="1" p="5">
        <Text className="text-base" fontWeight="700" fontSize="20px" pt="7" pb="2">
          Click on a category to continue the Self Assessment Tool
        </Text>
      </Stack>
      {/* Footer section with light gray background and spacing (currently empty) */}
      <Flex bg="#FAFAFA" h="64px" w="100%" p="4" justifyContent="space-between"></Flex>
    </Flex>
  );
};
export default ContinueView;
