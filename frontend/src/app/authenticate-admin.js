import {PROTECTED_PATHS} from 'common';
import {BrowserRouter, Switch, Route, Redirect} from 'react-router-dom';
import SideBar from 'components/side-bar';
import React from 'react';
import {SearchProvider} from 'context/searchContext/search.context';

const {ADMIN} = PROTECTED_PATHS;

/**
 * AuthenticatedAdmin component sets up routing for the admin dashboard.
 * It wraps the route in context providers and includes a sidebar component.
 *
 * @returns {JSX.Element} React component rendering protected admin layout with routing
 */
const AuthenticatedAdmin = () => {
  // BrowserRouter enables client-side routing for the admin interface
  return (
    <BrowserRouter>
      <Switch>
        {/* Provide global search context to child components */}
        <SearchProvider>
          {/* Route to render the SideBar component for admin path */}
          <Route path={ADMIN}>
            <SideBar />
          </Route>
        </SearchProvider>

        {/* Redirect all unknown paths to the admin route */}
        <Redirect from="/*" to={ADMIN} />
      </Switch>
    </BrowserRouter>
  );
};

export default AuthenticatedAdmin;
