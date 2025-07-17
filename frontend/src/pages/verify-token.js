import React, {Component} from 'react';
import Loader from 'components/circular-loader';
import {request} from 'common';
import logo from 'assets/images/logo.svg';
import {Link, withRouter} from 'react-router-dom';
import {authLogin, authSetUser} from 'store/action-types';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

/**
 * Login page component
 */
class Page extends Component {
  /**
   * Component constructor
   * @param {*} props
   */
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      invalid_token: false,
      login_success: false,
    };
  }

  /**
   * Refreshs auth token, adds token to session storage and gets user object.
   *
   * @return {undefined}
   */
  initUser() {
    const token = new URLSearchParams(window.location.search).get('token').trim();
    if (!token) {
      this.setState({...this.setState, invalid_token: true});
      return;
    }

    request()
      .post(
        '/verify-login-token',
        {},
        {
          headers: {Authorization: `Bearer ${token}`},
        }
      )
      .then((res) => {
        const {
          data: {token, user, cycle},
        } = res;
        if (!token || !user) {
          console.error('Invalid auth response.');
          this.setState({...this.setState, invalid_token: true});
          return;
        }
        this.props.dispatch(authLogin(user, token, cycle));
        if (user.user_type.value === 'company') {
          this.props.dispatch(authSetUser(user));
          request(true)
            .get('company/details', {params: {'company-id': user.company_user.company_id}})
            .then(({data: {company}}) => {
              user.company = company;
              this.props.history.push('/company');
            });
        } else if (user.user_type.value === 'ivc') {
          this.props.history.push('/ivc');
        } else {
          this.props.history.push('/admin');
        }
      })
      .catch((err) => {
        console.log(err);
        if (err.response.status == 401) {
          this.setState({...this.setState, invalid_token: true});
          return;
        }
        console.error(err.response.data);
      })
      .finally(() => this.setState({...this.setState, loading: false}));
  }

  /**
   * Lifecycle method
   */
  componentDidMount() {
    this.initUser();
  }

  /**
   * Component render method
   * @return {string}
   */
  render() {
    return (
      <section id="entry-page" className="relative">
        <div className="navbar bg-white z-50">
          <div className="container mx-auto">
            <img src={logo} alt="logo" className="h-9" />
          </div>
        </div>
        <div className="min-h-screen grid items-center">
          <div className="container mx-auto">
            <div className="w-80 md:w-96 py-24 mx-auto">
              <div className="text-center">
                {((this.state.loading || !this.state.invalid_token) && (
                  <>
                    <h4 className="mb-4 text-lg">Verifying Magic Link...</h4>
                    <Loader color="#10b981" />
                  </>
                )) || (
                  <>
                    <h4 className="mb-3 text-lg text-red-600">Login Failed</h4>
                    <Link to="/login" className="text-sm text-blue-700 underline">
                      Get a new link.
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

Page.propTypes = {
  history: PropTypes.any,
  dispatch: PropTypes.any,
};

export default connect()(withRouter(Page));
