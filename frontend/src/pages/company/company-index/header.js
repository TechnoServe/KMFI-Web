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
import dummieData from 'Dummie/data';
import {searchArrayOfObject, downloadCSV} from 'utills/helpers';

import moment from 'moment';

/**
 * Header component for the Companies Index page.
 * Includes search, sort, filter, and CSV download functionality using Chakra UI.
 *
 * @component
 * @returns {JSX.Element} The rendered header section for the company index
 */
const Header = () => {
  // Options for filtering and sorting
  const filterArray = ['Country', 'Product Vehicle', 'Tire'];
  const sorted = ['Date added', 'A-Z, Top - Bottom', 'A-Z, Bottom - Top'];

  // State for showing CSV download loading spinner
  const [loading, setIsLoading] = useState(false);

  // Used to trigger re-render or effect on search interaction
  const [checkSearchClick, setCheckSearchClick] = useState(false);

  /**
   * Handles search input changes by filtering dummy data using a helper utility.
   *
   * @param {Object} event - The input change event
   * @returns {void}
   */
  const search = (event) => {
    setData(searchArrayOfObject(event.target.value, dummieData));
    setCheckSearchClick(!checkSearchClick);
  };

  /**
   * Sorts the company data alphabetically by name using localeCompare.
   *
   * @returns {void}
   */
  const sortCompany =()=> {
    const localeSort = Array.from(state).sort((a, b) =>{
      return a.company_detail.name.localeCompare(b.company_detail.name, 'en', {sensitivity: 'base'});
    });
    setData(localeSort);
  };

  /**
   * Triggers CSV download of the current company state.
   * Displays a loading state during the download.
   *
   * @returns {void}
   */
  const handleDownloadCsv = () => {
    if (state.length) {
      setIsLoading(true);
      downloadCSV({
        fileName: `COMPANY LIST${moment().format('YYYYMMDDhhmmss')}`,
        data: state,
      });
    }
    // Reset loading state after download delay
    setTimeout(()=>{
      setIsLoading(false);
    }, 2000);
  };

  return (
    <Box bg="#fff" fontFamily="DM Sans">
      {/* Header bar with title and download button */}
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

      {/* Search, sort, and filter controls */}
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

export default Header;
