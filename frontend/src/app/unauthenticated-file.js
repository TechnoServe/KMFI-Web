import React from 'react';

/**
 * UnAuthenticatedApp sets up routing for all public (unauthenticated) routes,
 * including login, sign-up, landing pages, and token verification.
 *
 * @returns {JSX.Element} React component rendering public route structure
 */
import LandingPage from 'pages/Landing/index';
import PublicIndex from 'pages/landing2';
import LoginPage from 'pages/login';
import SignUpPage from 'pages/sign-up';
import VerifyToken from 'pages/verify-token';
import IvcAssessment from '../pages/ivc/self-assessment/index';
import PropTypes from 'prop-types';
import MembersAcceptingInvite from 'pages/members-accepting-invites';
import {BrowserRouter, Switch, Route, Redirect} from 'react-router-dom';
import AdminsAcceptingInvite from 'pages/admin-accepting-invites';


const UnAuthenticatedApp = () => {
  return (
    // BrowserRouter enables client-side routing for the public interface
    <BrowserRouter>
      {/* Switch ensures only the first matching route is rendered */}
      <Switch>
        {/* Landing page route */}
        <Route path="/" exact component={LandingPage} />

        {/* Alternate public landing page */}
        <Route path="/public-index" exact component={PublicIndex} />

        {/* Sign-up route */}
        <Route path="/sign-up" exact component={SignUpPage} />

        {/* Login route */}
        <Route path="/login" exact component={LoginPage} />

        {/* IVC assessment dashboard */}
        <Route path="/ivc/companies-index" exact component={IvcAssessment} />

        {/* Route for invited members accepting invitations */}
        <Route path="/invite/:token/:name" exact component={MembersAcceptingInvite} />

        {/* Route for invited admins accepting invitations */}
        <Route path="/admin-invite/:token/:name" exact component={AdminsAcceptingInvite} />

        {/* Token verification route */}
        <Route path="/verify-token" exact component={VerifyToken} />

        {/* Redirect all unmatched routes to login */}
        <Redirect from="/*" to="/login" />
      </Switch>
    </BrowserRouter>
  );
};

UnAuthenticatedApp.propTypes = {
  location: PropTypes.any,
};

export default UnAuthenticatedApp;
