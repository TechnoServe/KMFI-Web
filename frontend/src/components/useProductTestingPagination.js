import React, {useState, useEffect} from 'react';
import {Icon, IconButton} from '@chakra-ui/react';
import {
  HiChevronLeft,
  HiChevronRight
} from 'react-icons/hi';

/**
 * Custom React hook to handle pagination for product testing data.
 *
 * @param {Array<any>} filterResults - Array of filtered product testing data to paginate.
 * @returns {{
 *   PreviousButton: () => JSX.Element,
 *   NextButton: () => JSX.Element,
 *   brands: Array<any>
 * }} An object containing:
 *   - PreviousButton: React component to navigate to the previous page.
 *   - NextButton: React component to navigate to the next page.
 *   - brands: Current page slice of product testing results.
 */
export function useProductTestingPagination(filterResults) {
  // Number of rows/items to display per page (set to 1)
  const numTableBrands = 1;
  // Total number of pages based on filtered data length
  const [numPages, setNumPages] = useState(1);
  // Current active page in pagination
  const [paginationPage, setPaginationPage] = useState(1);
  // Subset of product testing data to display on the current page
  const [brands, setBrands] = useState([]);

  /**
   * Advances the pagination to the next page.
   *
   * @returns {void}
   */
  const next = () => setPaginationPage((page) => page + 1);

  /**
   * Goes back to the previous page in pagination.
   *
   * @returns {void}
   */
  const previous = () => setPaginationPage((page) => page - 1);

  useEffect(() => {
    // Calculate the slice of data for the current page and update brands array and total page count
    const firstItemIndex = (paginationPage - 1) * numTableBrands;
    const lastItemIndex = firstItemIndex + numTableBrands;
    const numOfPages = Math.ceil(filterResults.length / numTableBrands);
    setNumPages(numOfPages);
    setBrands([...filterResults].slice(firstItemIndex, lastItemIndex));
  }, [numTableBrands, filterResults, paginationPage]);

  /**
   * React component to render the button for navigating to the previous page.
   *
   * @returns {JSX.Element} Button component
   */
  const PreviousButton = () => (
    <IconButton
      isRound={true}
      variant="ghost"
      aria-label="go to previous page"
      size="sm"
      icon={<Icon as={HiChevronLeft} />}
      disabled={paginationPage <= 1}
      onClick={previous}
    />
  );
  /**
   * React component to render the button for navigating to the next page.
   *
   * @returns {JSX.Element} Button component
   */
  const NextButton = () => (
    <IconButton
      isRound={true}
      variant="ghost"
      aria-label="go to next page"
      size="sm"
      icon={<Icon as={HiChevronRight} />}
      disabled={paginationPage === numPages || !numPages}
      onClick={next}
    />
  );
  // Return pagination controls and paginated data
  return {PreviousButton, NextButton, brands};
}
