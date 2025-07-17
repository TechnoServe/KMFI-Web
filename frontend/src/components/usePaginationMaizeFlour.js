import React, {useState, useEffect} from 'react';
import {Text, Flex, Icon, IconButton, Select} from '@chakra-ui/react';
import {AiOutlineDoubleLeft, AiOutlineDoubleRight} from 'react-icons/ai';

/**
 * Custom React hook for paginating an array of maize flour score data.
 *
 * @param {Array<any>} filterResults - Filtered results to be paginated (e.g., from search or filter).
 * @returns {{
 *   PaginationMaizeFlourButtons: () => JSX.Element,
 *   maizeFlourScores: Array<any>
 * }} Object with:
 *   - PaginationMaizeFlourButtons: a component rendering pagination controls.
 *   - maizeFlourScores: the current page's data slice.
 */
export function usePaginationMaizeFlourButtons(filterResults) {
  // Number of rows to display per page
  const [numTableSugarScores, setNumTableSugarScores] = useState(10);
  // Total number of pages
  const [numPages, setNumPages] = useState(1);
  // Current active page number
  const [paginationPage, setPaginationPage] = useState(1);
  // Slice of maize flour scores to show on current page
  const [maizeFlourScores, setSugarScores] = useState([]);

  // Move to the next page
  const next = () => setPaginationPage((page) => page + 1);

  // Move to the previous page
  const previous = () => setPaginationPage((page) => page - 1);

  // Recalculate which items to show on current page and how many total pages there are
  useEffect(() => {
    const firstItemIndex = (paginationPage - 1) * numTableSugarScores;
    const lastItemIndex = firstItemIndex + numTableSugarScores;
    const numOfPages = Math.ceil(filterResults.length / numTableSugarScores);
    setNumPages(numOfPages);
    setSugarScores([...filterResults].slice(firstItemIndex, lastItemIndex));
  }, [numTableSugarScores, filterResults, paginationPage]);

  /**
   * PaginationMaizeFlourButtons renders the pagination controls, including:
   * - current page number
   * - navigation arrows
   * - page size selector
   *
   * @returns {JSX.Element} Pagination UI for navigating through maize flour score data
   */
  const PaginationMaizeFlourButtons = () => (
    <Flex flexWrap="wrap" p={2}>
      {/* Display current page number and total number of pages */}
      <Text mr={['auto', 'auto', '4rem']} mb={4} color="#637381" fontSize="small">
        Showing {paginationPage} of {numPages || 1}
      </Text>
      <Flex>
        {/* Button to navigate to previous page */}
        <IconButton
          aria-label="go to previous page"
          mr={4}
          size="xs"
          icon={<Icon as={AiOutlineDoubleLeft} />}
          disabled={paginationPage <= 1}
          onClick={previous}
        />
        {/* Display current page number */}
        <Text mr={4} color="#637381" fontSize="small">
          {paginationPage}
        </Text>

        {/* Button to navigate to next page */}
        <IconButton
          aria-label="go to next page"
          mr={4}
          size="xs"
          icon={<Icon as={AiOutlineDoubleRight} />}
          disabled={paginationPage === numPages || !numPages}
          onClick={next}
        />
        {/* Dropdown to choose how many rows to display per page */}
        <Select
          onChange={(e) => setNumTableSugarScores(Number(e.target.value))}
          size="xs"
          value={numTableSugarScores}
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </Select>
      </Flex>
    </Flex>
  );
  return {PaginationMaizeFlourButtons, maizeFlourScores};
}
