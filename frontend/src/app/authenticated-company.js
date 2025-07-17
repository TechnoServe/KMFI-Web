import {PROTECTED_PATHS} from 'common';
import {BrowserRouter, Switch, Route, Redirect} from 'react-router-dom';
import SideBar from 'components/side-bar';
import React from 'react';

/**
 * AuthenticatedCompany component sets up routing for the company dashboard.
 * Wraps the routes in a browser router and includes a sidebar component.
 *
 * @returns {JSX.Element} React component rendering protected company layout with routing
 */
const {COMPANY, DASHBOARD} = PROTECTED_PATHS;
const AuthenticatedCompany = () => {
  return (
    // Set up browser-based routing for company user interface
    <BrowserRouter>
      <Switch>
        {/* Render the SideBar component for all COMPANY routes */}
        <Route path={COMPANY}>
          <SideBar />
        </Route>
        {/* Redirect all unmatched routes to the company's dashboard */}
        <Redirect from="/*" to={`${COMPANY}/${DASHBOARD}`} />
      </Switch>
    </BrowserRouter>
  );
};

export default AuthenticatedCompany;
