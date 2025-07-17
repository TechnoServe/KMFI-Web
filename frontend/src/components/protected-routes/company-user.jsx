import React from 'react';
import {Route, Redirect} from 'react-router-dom';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

/**
 * CompanyUserRoute is a protected route component that only allows access if the user is authenticated.
 * If not authenticated, it redirects to the login page.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.authenticated - Whether the user is authenticated
 * @param {React.ComponentType} props.component - Component to render if authenticated
 * @param {Object} [props.location] - Current route location (used for redirect state)
 * @returns {JSX.Element} A protected route that renders the component or redirects to login
 */
/**
 *
 * @param {*} props
 * @return {*}
 */
function CompanyUserRoute(props) {
  const {component: Component, authenticated, ...rest} = props;

  // Render a Route that checks authentication before rendering the component
  return (
    <Route
      {...rest}
      render={(props) => {
        // If user is authenticated, render the target component
        if (authenticated) return <Component />;
        // If not authenticated, redirect to login and preserve intended destination
        return <Redirect to={{pathname: '/login', state: {from: props.location}}} />;
      }}
    />
  );
}

CompanyUserRoute.propTypes = {
  authenticated: PropTypes.bool,
  component: PropTypes.any,
  location: PropTypes.any,
};

const mapStateToProps = (state) => ({
  authenticated: state.auth.authenticated,
});

export default connect(mapStateToProps)(CompanyUserRoute);
