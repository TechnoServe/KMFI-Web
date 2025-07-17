import React, {useState} from 'react';
import {useToast} from '@chakra-ui/react';
import {request} from 'common';
import Loader from 'components/circular-loader';
import {useAuth} from 'hooks/user-auth';
import {connect} from 'react-redux';
import {fetchAuthUserThunk} from 'store/action-types';
import PropTypes from 'prop-types';

/**
 * React component for managing user account settings.
 * Allows users to update their full name and email address.
 *
 * @param {Object} props - Component props.
 * @param {Function} props.fetchUser - Redux thunk to refetch and update the authenticated user.
 * @returns {JSX.Element} The rendered Account settings component.
 */
const Account = ({fetchUser}) => {
  // Chakra UI toast for showing feedback messages
  const toast = useToast();
  // Get authenticated user data from custom auth hook
  const {user} = useAuth();
  // Track state for full name input
  const [fullName, setFullName] = useState(user.full_name);
  // Track state for email input
  const [email, setEmail] = useState(user.email);
  // Track loading state while saving changes
  const [loading, setLoading] = useState(false);

  /**
   * Handles the save button click event.
   * Sends PUT request to update user info and displays success/error toast.
   *
   * @param {Event} e - The form submission event.
   * @returns {Promise<void>} Promise that resolves after the update operation.
   */
  const saveChanges = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      // Send PUT request to update user data
      await request(true).put('me', {
        'full_name': fullName,
        'email': email,
      });
      // Refresh user data in global state
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

  return (
    <div data-w-tab="Account" className="w-tab-pane w--tab-active">
      <div className="padding-x-10 padding-y-10 w-container">
        <div>
          <h4 className="text-align-left">Create company account</h4>
        </div>
        <div className="margin-top-10 margin-bottom-0 w-form">
          {/* Full Name input field */}
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
          {/* Email input field */}
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
            {/* Save button with loading indicator */}
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
