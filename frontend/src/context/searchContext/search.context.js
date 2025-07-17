import React, {createContext, useReducer} from 'react';
import searchReducer from './search.reducer';
import propTypes from 'prop-types';

// Context for accessing search-related state
export const SearchContext = createContext();
// Context for dispatching actions to modify search state
export const DispatchContext = createContext();

// Sample default search data used to initialize the reducer
const defaultValue = [{name: 'Dangote Flour Mills', product: 'flour', country: 'Nigeria', tier: 3, sa: '32%', star: false}];

/**
 * Provides state and dispatch context for managing search-related data
 * using a React reducer pattern.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components that will consume the context
 * @returns {JSX.Element} Context provider wrapping the application or component subtree
 */
export const SearchProvider = ({children}) => {
  // Initialize reducer with default value representing sample search data
  const [state, dispatch] = useReducer(searchReducer, defaultValue);

  // Provide search state and dispatch function to child components via context
  return (
    <SearchContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </SearchContext.Provider>
  );
};

// Define prop types for the SearchProvider component
SearchProvider.propTypes = {
  children: propTypes.any,
};
