import PropTypes from 'prop-types';
import React from 'react';
import {
  Box,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import FourPGComponentAwards from './FourPGComponentAwards';
import PrecisionParityAward from './PrecisionParityAward';
import FullyFortifiedProducts from './FullyFortifiedProducts';
import TopTenParticipants from './TopTenParticipants';

const Awards = ({cycle}) => {
  return (
    <Box>
      <Heading size="lg" mb={4}>
        KMFI Awards Dashboard
      </Heading>
      <Text mb={6}>
        This dashboard displays weighted average scores using triangulated SAT and IEG data across KMFI components and highlights top-performing companies per category.
      </Text>
      <Tabs variant="enclosed">
        <TabList>
          <Tab>1) 4-PG Component Awards</Tab>
          <Tab>2) Precision Parity Award</Tab>
          <Tab>3) Fully Fortified Products</Tab>
          <Tab>4) Top 10 - All KMFI Participants</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <FourPGComponentAwards cycle={cycle} />
          </TabPanel>
          <TabPanel>
            <PrecisionParityAward cycle={cycle} />
          </TabPanel>
          <TabPanel>
            <FullyFortifiedProducts cycle={cycle} />
          </TabPanel>
          <TabPanel>
            <TopTenParticipants cycle={cycle} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Awards;

Awards.propTypes = {
  cycle: PropTypes.string.isRequired,
};
