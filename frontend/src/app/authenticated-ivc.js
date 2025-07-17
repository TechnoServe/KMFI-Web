import {PROTECTED_PATHS} from 'common';
import {BrowserRouter, Switch, Route, Redirect} from 'react-router-dom';
import SideBar from 'components/side-bar';
import React from 'react';
import {SearchProvider} from 'context/searchContext/search.context';

/**
 * AuthenticatedIVC component sets up routing for the IVC (Independent Verifying Consultant) dashboard.
 * It wraps the routes in a browser router, provides global search context,
 * and includes a sidebar for IVC navigation.
 *
 * @returns {JSX.Element} React component rendering protected IVC layout with routing
 */
const {IVC, COMPANIES_INDEX} = PROTECTED_PATHS;
const AuthenticatedIVC = () => {
  return (
    // Enables client-side routing for the IVC interface
    <BrowserRouter>
      {/* Ensures that only the first matching route is rendered */}
      <Switch>
        {/* Wrap child components in search context */}
        <SearchProvider>
          {/* Render the IVC sidebar for all paths under /ivc */}
          <Route path={IVC}>
            <SideBar />
          </Route>
        </SearchProvider>
        {/* Redirect all unknown paths to the IVC companies index page */}
        <Redirect from="/*" to={`${IVC}/${COMPANIES_INDEX}`} />
      </Switch>
    </BrowserRouter>
  );
};

export default AuthenticatedIVC;
