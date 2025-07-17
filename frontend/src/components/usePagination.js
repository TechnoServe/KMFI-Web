import React, {useState, useEffect} from 'react';
import {Text, Flex, Icon, IconButton, Select} from '@chakra-ui/react';
import {AiOutlineDoubleLeft, AiOutlineDoubleRight} from 'react-icons/ai';

/**
 * Custom React hook to manage pagination for any list of data.
 *
 * @param {Array<any>} filterResults - Filtered or full dataset to be paginated.
 * @returns {{ PaginationButtons: () => JSX.Element, allIndustryScores: Array<any> }}
 * An object containing:
 *   - PaginationButtons: A React component for controlling pagination (UI).
 *   - allIndustryScores: A subset of the data corresponding to the current page.
 */
export function usePagination(filterResults) {
  // Number of rows to show per page (default is 100)
  const [numTableAllIndustryScores, setNumTableAllIndustryScores] = useState(100);
  // Total number of pages calculated from data length
  const [numPages, setNumPages] = useState(1);
  // Current active page number
  const [paginationPage, setPaginationPage] = useState(1);
  // Current subset of data to display based on page
  const [allIndustryScores, setAllIndustryScores] = useState([]);

  // Go to next page
  const next = () => setPaginationPage((page) => page + 1);

  // Go to previous page
  const previous = () => setPaginationPage((page) => page - 1);

  // Update current page data and total page count when pagination settings or data changes
  useEffect(() => {
    const firstItemIndex = (paginationPage - 1) * numTableAllIndustryScores;
    const lastItemIndex = firstItemIndex + numTableAllIndustryScores;
    const numOfPages = Math.ceil(filterResults.length / numTableAllIndustryScores);
    setNumPages(numOfPages);
    setAllIndustryScores([...filterResults].slice(firstItemIndex, lastItemIndex));
  }, [numTableAllIndustryScores, filterResults, paginationPage]);

  /**
   * PaginationButtons is a React component for navigating paginated data.
   *
   * @returns {JSX.Element} Pagination control UI including page number and size selector.
   */
  const PaginationButtons = () => (
    <Flex flexWrap="wrap" p={2}>
      {/* Display current page out of total pages */}
      <Text mr={['auto', 'auto', '4rem']} mb={4} color="#637381" fontSize="small">
        Showing {paginationPage} of {numPages || 1}
      </Text>
      <Flex>
        {/* Button to go to previous page */}
        <IconButton
          aria-label="go to previous page"
          mr={4}
          size="xs"
          icon={<Icon as={AiOutlineDoubleLeft} />}
          disabled={paginationPage <= 1}
          onClick={previous}
        />
        {/* Show current page number */}
        <Text mr={4} color="#637381" fontSize="small">
          {paginationPage}
        </Text>

        {/* Button to go to next page */}
        <IconButton
          aria-label="go to next page"
          mr={4}
          size="xs"
          icon={<Icon as={AiOutlineDoubleRight} />}
          disabled={paginationPage === numPages || !numPages}
          onClick={next}
        />
        {/* Select dropdown to choose number of items per page */}
        <Select
          onChange={(e) => setNumTableAllIndustryScores(Number(e.target.value))}
          size="xs"
          value={numTableAllIndustryScores}
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </Select>
      </Flex>
    </Flex>
  );
  return {PaginationButtons, allIndustryScores};
}
