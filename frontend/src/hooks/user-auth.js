import {useSelector} from 'react-redux';

/**
 * Custom React hook to access authentication state from the Redux store.
 *
 * @returns {{
 *   user: Object|null,
 *   isAuthenticated: boolean
 * }} An object containing the current user and authentication status.
 */
export const useAuth = () => {
  // Extract user and authentication status from Redux auth slice
  const {user, authenticated} = useSelector((state) => state.auth);

  // Return current user object and whether the user is authenticated
  return {
    user,
    isAuthenticated: authenticated,
  };
};
