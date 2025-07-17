import React, {useState, useEffect} from 'react';
import {Text, Flex, Icon, IconButton, Select} from '@chakra-ui/react';
import {AiOutlineDoubleLeft, AiOutlineDoubleRight} from 'react-icons/ai';

/**
 * Custom React hook for paginating an array of edible oil data.
 *
 * @param {Array<any>} filterResults - The filtered data array to paginate (e.g., from a search or filter).
 * @returns {{ PaginationEdibleOilButtons: () => JSX.Element, edibleOilScores: Array<any> }}
 * An object containing:
 *   - PaginationEdibleOilButtons: A React component rendering pagination controls.
 *   - edibleOilScores: The current page's slice of items to display.
 */
export function usePaginationEdibleOilButtons(filterResults) {
  // Number of rows to display per page
  const [numTableEdibleOilScores, setNumTableEdibleOilScores] = useState(10);
  // Total number of pages
  const [numPages, setNumPages] = useState(1);
  // Current active page in pagination
  const [paginationPage, setPaginationPage] = useState(1);
  // Data slice for the current page
  const [edibleOilScores, setEdibleOilScores] = useState([]);

  /**
   * Advances the current page number by one.
   *
   * @returns {void}
   */
  const next = () => setPaginationPage((page) => page + 1);

  /**
   * Decreases the current page number by one.
   *
   * @returns {void}
   */
  const previous = () => setPaginationPage((page) => page - 1);

  // Update the paginated data slice and number of pages when input data or pagination changes
  useEffect(() => {
    const firstItemIndex = (paginationPage - 1) * numTableEdibleOilScores;
    const lastItemIndex = firstItemIndex + numTableEdibleOilScores;
    const numOfPages = Math.ceil(filterResults.length / numTableEdibleOilScores);
    setNumPages(numOfPages);
    setEdibleOilScores([...filterResults].slice(firstItemIndex, lastItemIndex));
  }, [numTableEdibleOilScores, filterResults, paginationPage]);

  /**
   * PaginationEdibleOilButtons renders page navigation controls, including previous/next buttons
   * and a dropdown for selecting number of rows per page.
   *
   * @returns {JSX.Element} Pagination controls UI
   */
  const PaginationEdibleOilButtons = () => (
    <Flex flexWrap="wrap" p={2}>
      {/* Display current page out of total number of pages */}
      <Text mr={['auto', 'auto', '4rem']} mb={4} color="#637381" fontSize="small">
        Showing {paginationPage} of {numPages || 1}
      </Text>
      <Flex>
        {/* Button to go to the previous page, disabled if on the first page */}
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
        {/* Button to go to the next page, disabled if on the last page */}
        <IconButton
          aria-label="go to next page"
          mr={4}
          size="xs"
          icon={<Icon as={AiOutlineDoubleRight} />}
          disabled={paginationPage === numPages || !numPages}
          onClick={next}
        />
        {/* Dropdown to choose how many items to show per page */}
        <Select
          onChange={(e) => setNumTableEdibleOilScores(Number(e.target.value))}
          size="xs"
          value={numTableEdibleOilScores}
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </Select>
      </Flex>
    </Flex>
  );
  return {PaginationEdibleOilButtons, edibleOilScores};
}
