import React, {useState} from 'react';
import Loader from 'components/circular-loader';
import logo from 'assets/images/logo.svg';
import ConfirmationFragment from 'components/confirmation-fragment';
import {request} from 'common';
import {useParams} from 'react-router-dom';
import validatejs from 'validate.js';
import {useToast} from '@chakra-ui/react';
import {getApiResponseErrorMessage} from 'utills/helpers';


/**
 * Component for accepting an admin invitation. Allows the invited user
 * to enter their full name and complete the signup process.
 *
 * @returns {JSX.Element} A form interface for completing an invitation.
 */
const AdminsAcceptingInvite = () => {
  // Tracks whether the form is currently submitting
  const [loading, setLoading] = useState(false);
  // Stores the user's full name input
  const [fullName, setFullName] = useState('');
  // Holds validation error message for full name
  const [fullNameError, setFullNameError] = useState('');
  const [loginSuccessful] = useState(false);
  // Extracts the invitation token and inviter's name from the URL
  const {token: invitationId, name} = useParams();
  // Hook for displaying toast notifications
  const toast = useToast();

  /**
   * Validates the full name input to ensure it is not empty.
   *
   * @returns {boolean} True if the full name is valid, false otherwise.
   */
  const validateForm = () => {
    setFullNameError(null);
    const errors = validatejs.single(fullName, {
      presence: {
        allowEmpty: false,
        message: 'Your full name is required.',
      },
    });

    if (errors && errors.length) {
      setFullNameError(errors[0]);
      return false;
    }

    return true;
  };

  /**
   * Submits the form data to accept the admin invitation.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   * @returns {Promise<void>}
   */
  const submit = async (e) => {
    e.preventDefault();
    // Prevent submission if form validation fails
    if (!validateForm()) return;

    try {
      setLoading(true);
      // Submit invitation acceptance to backend API
      await request().post('admin/accept-invitation', {
        fullName,
        invitationId,
      });
      toast({
        status: 'success',
        title: 'Sign up successful',
        position: 'bottom-right',
        description: 'Please check your email for your login link',
        duration: 6000,
        isClosable: true,
      });
    } catch (e) {
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

export default AdminsAcceptingInvite;
