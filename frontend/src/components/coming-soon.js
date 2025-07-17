import {Flex, Text} from '@chakra-ui/layout';
import React from 'react';

/**
 * ComingSoon is a simple placeholder component that displays a "Coming Soon" message
 * centered on the screen.
 *
 * @returns {JSX.Element} A flex container with a styled "Coming Soon" message
 */
const ComingSoon = () => {
  return (
    // Centered flex container to hold the message
    <Flex
      className="padding-0"
      justifyContent="center"
      alignItems="center"
      height="90%"
      bg="white"
      style={{width: '100%'}}
    >
      {/* Display the "Coming Soon" message in bold and large font */}
      <Text fontWeight="bold" fontSize="50px">
        Coming Soon
      </Text>
    </Flex>
  );
};

export default ComingSoon;
