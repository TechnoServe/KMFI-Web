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

/**
 * Header component for the Company List page.
 * Displays the page title, search bar, sorting and filtering dropdowns,
 * and a button to download the list of companies as CSV.
 *
 * @param {Object} props - Component props
 * @param {Array<any>} props.company - Company data (unused in this component)
 * @param {Array<any>} props.newData - Dataset used for searching
 * @returns {JSX.Element} The rendered Header UI
 */
const Header = ({company, newData}) => {
  // Options for the filtering dropdown
  const filterArray = ['Country', 'Product Vehicle', 'Tire'];
  // Options for the sorting dropdown
  const sorted = ['Date added', 'A-Z, Top - Bottom', 'A-Z, Bottom - Top'];
  // State to manage loading spinner for CSV download button
  const [loading, setIsLoading] = useState(false);
  // const [checkSearchClick, setCheckSearchClick] = useState(false);
  // State to store filtered or sorted company data (currently unused)
  const [data, setData] = useState('');
  /**
   * Handles search input change by filtering newData.
   * (Currently commented out and not functional.)
   *
   * @param {Object} event - The input change event
   */
  const search = (event) => {
    // setData(searchArrayOfObject(event.target.value, newData));
    // setCheckSearchClick(!checkSearchClick);
  };
  /**
   * Sorts company data alphabetically by company name.
   * Updates local state with sorted data.
   */
  const sortCompany = () => {
    const localeSort = Array.from(state).sort((a, b) => {
      return a.company_detail.name.localeCompare(b.company_detail.name, 'en', {sensitivity: 'base'});
    });
    setData(localeSort);
  };

  /**
   * Initiates download of company list as a CSV file using current timestamp.
   * Sets loading spinner during the process.
   */
  const handleDownloadCsv = () => {
    if (state.length) {
      setIsLoading(true);
      downloadCSV({
        fileName: `COMPANY LIST${moment().format('YYYYMMDDhhmmss')}`,
        data: state,
      });
    }
    // Simulate loading delay to reset button state
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  // Render layout with header text, download button, search field, and filters
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
