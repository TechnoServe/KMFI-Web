import React, {useState} from 'react';
import {useToast, Text} from '@chakra-ui/react';
import {request} from 'common';
import Loader from 'components/circular-loader';
import {useAuth} from 'hooks/user-auth';
import {connect} from 'react-redux';
import {fetchAuthUserThunk} from 'store/action-types';
import PropTypes from 'prop-types';

/**
 * Account component renders a form to update the user's full name and email.
 * It pre-fills the form with current user data, handles input updates, and
 * sends the updated data to the server. Displays success or error toasts.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.fetchUser - Redux thunk to re-fetch the authenticated user
 * @returns {JSX.Element} Account update form
 */
const Account = ({fetchUser}) => {
  // Chakra UI toast hook for user feedback notifications
  const toast = useToast();
  // Retrieve current authenticated user
  const {user} = useAuth();
  // Local state for full name input
  const [fullName, setFullName] = useState(user.full_name);
  // Local state for email input
  const [email, setEmail] = useState(user.email);
  // Loading state to disable form during submission
  const [loading, setLoading] = useState(false);

  /**
   * Handles form submission for updating account details.
   * Sends PUT request and displays success or error toast.
   *
   * @param {React.FormEvent} e - Form submission event
   * @returns {void}
   */
  const saveChanges = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await request(true).put('me', {
        full_name: fullName,
        email: email,
        user: user
      });
      fetchUser();
      setLoading(false);
      return toast({
        status: 'success',
        title: 'Success',
        position: 'top-right',
        description: 'Account updated',
        duration: 6000,
        isClosable: true,
      });
    } catch (error) {
      setLoading(false);
      return toast({
        status: 'error',
        title: 'Error',
        position: 'top-right',
        description: 'Something went wrong',
        duration: 6000,
        isClosable: true,
      });
    }
  };

  // Render the form UI with input fields and save button
  return (
    <div data-w-tab="Account" className="w-tab-pane w--tab-active">
      <div className="padding-x-10 padding-y-10 w-container">
        <Text className="text-align-left" fontSize="20px" fontWeight="700">
          Create company account
        </Text>
        <div className="margin-top-10 margin-bottom-0 w-form">
          <label htmlFor="name" className="form-label">
            Full Name
          </label>
          <input
            type="text"
            className="form-input margin-bottom-4 w-input"
            maxLength="256"
            name="name"
            onChange={(e) => setFullName(e.target.value)}
            data-name="Name"
            placeholder="Full Name"
            value={fullName}
            id="name"
          />
          <label htmlFor="email" className="form-label">
            Company Email
          </label>
          <input
            type="email"
            className="form-input w-input"
            maxLength="256"
            name="email"
            onChange={(e) => setEmail(e.target.value)}
            data-name="Email"
            placeholder="email@example.com"
            value={email}
            id="email"
            required=""
          />
          <div className="margin-top-10">
            <button
              onClick={saveChanges}
              className="button width-full w-button"
              style={{outline: 'none'}}
            >
              {(loading && <Loader />) || <span>Save changes</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

Account.propTypes = {
  fetchUser: PropTypes.func,
};

export default connect(undefined, (dispatch) => ({
  fetchUser: () => dispatch(fetchAuthUserThunk()),
}))(Account);
