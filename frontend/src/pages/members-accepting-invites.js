import React, {useState} from 'react';
import Loader from 'components/circular-loader';
import logo from 'assets/images/logo.svg';
import ConfirmationFragment from 'components/confirmation-fragment';
import {request} from 'common';
import {useParams} from 'react-router-dom';
import validatejs from 'validate.js';
import {useToast} from '@chakra-ui/react';
import {getApiResponseErrorMessage} from 'utills/helpers';


const MembersAcceptingInvite = () => {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [loginSuccessful] = useState(false);
  const {token: invitationId, name} = useParams();
  const toast = useToast();

  /**
   * Validates the fullName input field to ensure it is not empty.
   * Uses validate.js for presence validation.
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  const validateForm = () => {
    // Clear previous error before validating
    setFullNameError(null);
    // Validate fullName input using validate.js
    const errors = validatejs.single(fullName, {
      presence: {
        allowEmpty: false,
        message: 'Your full name is required.',
      },
    });

    // If validation errors exist, set error message and return false
    if (errors && errors.length) {
      setFullNameError(errors[0]);
      return false;
    }

    return true;
  };

  /**
   * Submits the form data to accept the invite.
   * Sends a POST request to the backend with the fullName and invitationId.
   * Displays success or error toast messages based on the result.
   * @param {Event} e - The form submission event.
   * @returns {Promise<void>}
   */
  const submit = async (e) => {
    // Prevent the default form submission behavior
    e.preventDefault();
    // If form is not valid, exit early
    if (!validateForm()) return;

    try {
      // Set loading state before making the API request
      setLoading(true);
      // Send request to backend to accept the invite
      await request().post('company/accept-invite', {
        fullName,
        invitationId,
      });
      // Show success toast notification
      toast({
        status: 'success',
        title: 'Sign up successful',
        position: 'bottom-right',
        description: 'Please check your email for your login link',
        duration: 6000,
        isClosable: true,
      });
    } catch (e) {
      // Show error toast notification with appropriate message
      toast({
        status: 'error',
        title: 'Error',
        position: 'bottom-right',
        description: getApiResponseErrorMessage(
          e?.response?.data,
          'Request not completed. Please try again'
        ),
        duration: 6000,
        isClosable: true,
      });
    }
    // Reset loading state after request is complete
    setLoading(false);
  };

  return (
    <section id="entry-page" className="relative">
      <div className="navbar bg-white z-50">
        <div className="container mx-auto">
          <img src={logo} alt="logo" className="h-9" />
        </div>
      </div>
      <div className="min-h-screen grid items-center">
        <div className="container mx-auto">
          <div className="container-480 md:w-2/4 py-24 mx-auto">
            {(loginSuccessful && <ConfirmationFragment />) || (
              <>
                <div className="text-center">
                  <h4 className="text-2xl font-bold mb-3">Setup your profile</h4>
                  <p className="text-sm text-gray-800">
                  You have been invited by {name} to join this space. Kindly fill in your
                    details to get started
                  </p>
                </div>
                <form onSubmit={submit}>
                  <fieldset disabled={loading}></fieldset>
                  <div className="mt-10">
                    <div className="mb-2 text-sm">
                      <label htmlFor="email" className="form-label">
                        Full Name
                      </label>
                    </div>
                    <input
                      name="fullName"
                      className="form-control border-gray-300 focus:border-blue-600 form-input margin-bottom-4 w-input"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onBlur={validateForm}
                    />
                    <div className="mt-2 text-sm text-red-600">{fullNameError}</div>
                  </div>
                  <div className="mt-7">
                    <button
                      className="btn w-full border-green-500 bg-green-500 focus:bg-green-700 focus:border-green-700  text-white"
                      type="submit"
                    >
                      {(loading && <Loader />) || <span>Get Started</span>}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MembersAcceptingInvite;
