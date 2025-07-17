import React, {useState, useEffect} from 'react';
import {Text, Flex, Icon, IconButton, Select} from '@chakra-ui/react';
import {AiOutlineDoubleLeft, AiOutlineDoubleRight} from 'react-icons/ai';

/**
 * Custom React hook for paginating an array of data.
 *
 * @param {Array<any>} filterResults - The data array to paginate, usually the filtered result set.
 * @returns {{ PaginationButtons: () => JSX.Element, allIndustryScores: Array<any> }}
 * An object containing:
 *   - PaginationButtons: A React component rendering pagination controls.
 *   - allIndustryScores: The current page's slice of items to display.
 */
export function usePagination(filterResults) {
  // Number of rows to display per page
  const [numTableAllIndustryScores, setNumTableAllIndustryScores] = useState(10);
  // Total number of pages
  const [numPages, setNumPages] = useState(1);
  // Current active page in pagination
  const [paginationPage, setPaginationPage] = useState(1);
  // Data slice for the current page
  const [allIndustryScores, setAllIndustryScores] = useState([]);

  // Move to the next page
  const next = () => setPaginationPage((page) => page + 1);

  // Move to the previous page
  const previous = () => setPaginationPage((page) => page - 1);

  // Calculate which slice of data to show on the current page and update pagination state
  useEffect(() => {
    const firstItemIndex = (paginationPage - 1) * numTableAllIndustryScores;
    const lastItemIndex = firstItemIndex + numTableAllIndustryScores;
    const numOfPages = Math.ceil(filterResults.length / numTableAllIndustryScores);
    setNumPages(numOfPages);
    setAllIndustryScores([...filterResults].slice(firstItemIndex, lastItemIndex));
  }, [numTableAllIndustryScores, filterResults, paginationPage]);

  /**
   * PaginationButtons is a React component that renders navigation controls
   * for paging through data.
   *
   * @returns {JSX.Element} Pagination controls including next/prev buttons and rows-per-page selector
   */
  const PaginationButtons = () => (
    // Render page navigation with current page display and size selector
    <Flex flexWrap="wrap" p={2}>
      <Text mr={['auto', 'auto', '4rem']} mb={4} color="#637381" fontSize="small">
        Showing {paginationPage} of {numPages || 1}
      </Text>
      <Flex>
        <IconButton
          aria-label="go to previous page"
          mr={4}
          size="xs"
          icon={<Icon as={AiOutlineDoubleLeft} />}
          disabled={paginationPage <= 1}
          onClick={previous}
        />
        <Text mr={4} color="#637381" fontSize="small">
          {paginationPage}
        </Text>

        <IconButton
          aria-label="go to next page"
          mr={4}
          size="xs"
          icon={<Icon as={AiOutlineDoubleRight} />}
          disabled={paginationPage === numPages || !numPages}
          onClick={next}
        />
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
