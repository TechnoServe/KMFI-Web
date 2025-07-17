/**
 * Reducer function to handle search-related actions.
 *
 * @param {Array<Object>} state - Current state of search results.
 * @param {Object} action - Action dispatched to modify the state.
 * @param {string} action.type - Type of the action ('SEARCH', 'TOGGLE', 'FETCH').
 * @param {Array<Object>} [action.data] - New data to replace the current state (for 'SEARCH' or 'FETCH').
 * @param {string|number} [action.id] - ID of the item to toggle the 'star' property (for 'TOGGLE').
 * @returns {Array<Object>} Updated state after applying the action.
 */
const searchReducer = (state, action) =>{
  switch (action.type) {
    // Replace current state with new search results
    case 'SEARCH':
      return [...action.data];

    // Toggle the 'star' property of the item with the matching ID
    case 'TOGGLE':
      return state?.map((datum) =>{
        return datum.id == action?.id ? {...datum, star: !datum.star}: datum;
      });
    // Replace current state with fetched data
    case 'FETCH':
      return [...action.data];
    // Return the existing state for unrecognized action types
    default:
      return state;
  }
};
export default searchReducer;
