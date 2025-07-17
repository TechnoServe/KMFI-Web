import React, {useState, useEffect} from 'react';
import {Text, Flex, Icon, IconButton, Select} from '@chakra-ui/react';
import {AiOutlineDoubleLeft, AiOutlineDoubleRight} from 'react-icons/ai';

/**
 * Custom React hook to handle pagination for wheat flour data tables.
 *
 * @param {Array<any>} filterResults - The array of filtered wheat flour data to paginate.
 * @returns {{
 *   PaginationWheatFlourButtons: () => JSX.Element,
 *   wheatFlourScores: Array<any>
 * }} An object containing:
 *   - PaginationWheatFlourButtons: React component that renders pagination controls.
 *   - wheatFlourScores: Current page slice of wheat flour data to be displayed.
 */
export function usePaginationWheatFlourButtons(filterResults) {
  // Number of rows to display per page
  const [numTableFlourScores, setNumTableFlourScores] = useState(10);
  // Total number of pages calculated from data length
  const [numPages, setNumPages] = useState(1);
  // Current page number in pagination
  const [paginationPage, setPaginationPage] = useState(1);
  // Slice of wheat flour scores to display for the current page
  const [wheatFlourScores, setFlourScores] = useState([]);

  /**
   * Increment pagination page to move to the next page.
   *
   * @returns {void}
   */
  const next = () => setPaginationPage((page) => page + 1);

  /**
   * Decrement pagination page to move to the previous page.
   *
   * @returns {void}
   */
  const previous = () => setPaginationPage((page) => page - 1);

  // Calculate first/last item indexes and update paginated data and page count
  useEffect(() => {
    const firstItemIndex = (paginationPage - 1) * numTableFlourScores;
    const lastItemIndex = firstItemIndex + numTableFlourScores;
    const numOfPages = Math.ceil(filterResults.length / numTableFlourScores);
    setNumPages(numOfPages);
    setFlourScores([...filterResults].slice(firstItemIndex, lastItemIndex));
  }, [numTableFlourScores, filterResults, paginationPage]);

  /**
   * PaginationWheatFlourButtons renders navigation controls for wheat flour table pages.
   *
   * @returns {JSX.Element} Pagination control component
   */
  const PaginationWheatFlourButtons = () => (
    <Flex flexWrap="wrap" p={2}>
      {/* Display current page out of total pages */}
      <Text mr={['auto', 'auto', '4rem']} mb={4} color="#637381" fontSize="small">
        Showing {paginationPage} of {numPages || 1}
      </Text>
      <Flex>
        {/* Button to go to the previous page */}
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

        {/* Button to go to the next page */}
        <IconButton
          aria-label="go to next page"
          mr={4}
          size="xs"
          icon={<Icon as={AiOutlineDoubleRight} />}
          disabled={paginationPage === numPages || !numPages}
          onClick={next}
        />
        {/* Dropdown to select number of rows per page */}
        <Select
          onChange={(e) => setNumTableFlourScores(Number(e.target.value))}
          size="xs"
          value={numTableFlourScores}
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </Select>
      </Flex>
    </Flex>
  );
  return {PaginationWheatFlourButtons, wheatFlourScores};
}
