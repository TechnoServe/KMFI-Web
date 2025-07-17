import React, {useState} from 'react';
import {
  Container,
  Box,
  Flex,
  Button,
  Text,
  Spacer,
  Divider,
} from '@chakra-ui/react';
import InputField from 'components/customInput';
import CustomSelect from 'components/customSelect';
// import dummieData from 'Dummie/data';
import {searchArrayOfObject, downloadCSV} from 'utills/helpers';
import proptypes from 'prop-types';

import moment from 'moment';

const Header = ({company, newData}) => {
  const filterArray = ['Country', 'Product Vehicle', 'Tire'];
  const sorted = ['Date added', 'A-Z, Top - Bottom', 'A-Z, Bottom - Top'];
  const [loading, setIsLoading] = useState(false);
  // const [checkSearchClick, setCheckSearchClick] = useState(false);
  const [data, setData] = useState('');
  const search = (event) => {
    // setData(searchArrayOfObject(event.target.value, newData));
    // setCheckSearchClick(!checkSearchClick);
  };
  const sortActivity = () => {
    const localeSort = Array.from(state).sort((a, b) => {
      return a.company_detail.name.localeCompare(b.created_at, 'en');
    });
    setData(localeSort);
  };

  const handleDownloadCsv = () => {
    if (state.length) {
      setIsLoading(true);
      downloadCSV({
        fileName: `ACTIVITY LIST${moment().format('YYYYMMDDhhmmss')}`,
        data: state,
      });
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <Box bg="#fff" fontFamily="DM Sans">
      <Container maxW="container.xl" border="1px" borderColor="gray.200">
        <Flex
          direction="row"
          justify="space-between"
          alignItems="center"
          p="1rem"
        >
          <Text fontSize="1.25rem" fontWeight="700" lineHeight="1.6275rem">
            Companies Index
          </Text>
          <Button
            isLoading={loading}
            colorScheme="teal"
            loadingText="Downloading"
            w="8.3125rem"
            marginRight="0.5rem"
            bg="#00B27A"
            fontSize="13px"
            color="#ffffff"
            onClick={handleDownloadCsv}
          >
            Download CSV
          </Button>
        </Flex>
      </Container>
      <Divider borderWidth="1px" />

      <Container maxW="container.xl" border="1px" borderColor="gray.200">
        <Flex
          direction="row"
          justify="space-between"
          alignItems="center"
          p="1rem"
          width="100%"
        >
          <InputField
            placeholder="Search"
            name="search"
            search={search}
            onChange={search}
            bg="rgba(44,42,100,0.03)"
            variant="filled"
            width="31.25rem"
          />

          <Flex direction="row" justify="space-between" width="16rem">
            <CustomSelect filter={sorted} placeholder="Sort" onChange={sortCompany} />
            <Spacer />
            <CustomSelect
              filter={filterArray}
              placeholder="Filter"
              onChange={search}
            />
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
};

Header.propTypes = {
  company: proptypes.any,
  newData: proptypes.any
};
export default Header;
