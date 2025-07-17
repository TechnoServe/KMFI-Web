import AuthenticatedCompany from 'app/authenticated-company';
import AuthenticatedAdmin from 'app/authenticate-admin';
import UnAuthenticatedApp from 'app/unauthenticated-file';
import AuthenticatedIVC from 'app/authenticated-ivc';
import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {fetchAuthUserThunk} from 'store/action-types';
import {Flex, Spinner} from '@chakra-ui/react';

/**
 * Main application component that renders different views depending on authentication status and user role.
 *
 * @returns {JSX.Element} The rendered UI based on user authentication and role.
 */
// Main App component that manages authentication state and conditionally renders content.
const App = () => {
  // Redux dispatch hook to dispatch actions.
  const dispatch = useDispatch();
  // State to store whether the user is authenticated.
  const [authenticated, setAuthenticated] = useState(false);
  // State to control the loading spinner visibility.
  const [loading, setLoading] = useState(true);
  // State to hold the user type (e.g., company, ivc, admin).
  const [value, setValue] = useState(null);
  // Get authentication status from Redux state.
  const isAuthenticated = useSelector((state) => state.auth.authenticated);
  // Get the user object from Redux state.
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    // Sync local state with Redux auth status.
    setAuthenticated(isAuthenticated);
    // If authenticated, fetch the full user profile.
    isAuthenticated && dispatch(fetchAuthUserThunk());
    // If the user's role is available, update the user type and stop loading.
    if (user?.user_type) {
      setValue(user?.user_type?.value);
      setLoading(false);
    }
    // Fallback to ensure loading state is cleared.
    setLoading(false);
  }, [isAuthenticated]);

  // Render loading spinner while waiting for authentication/user data.
  if (loading) {
    return (
      <Flex height="100vh" justifyContent="center" alignItems="center">
        <Spinner />
      </Flex>
    );
  }

  // Render authenticated view depending on user type.
  if (authenticated) {
    return value === 'company' ? (
      <AuthenticatedCompany />
    ) : value === 'ivc' ? (
      <AuthenticatedIVC />
    ) : (
      <AuthenticatedAdmin />
    );
  } else {
    // Render unauthenticated view if user is not logged in.
    return <UnAuthenticatedApp />;
  }
};

export default App;
