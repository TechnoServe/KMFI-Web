import React, {useState} from 'react';
import proptTypes from 'prop-types';
import {CloseButton, Flex, useToast} from '@chakra-ui/react';
import {nanoid} from '@reduxjs/toolkit';
import {request} from 'common';
import Loader from 'components/circular-loader';
import {useAuth} from 'hooks/user-auth';

/**
 * InviteMember component renders a modal UI that allows the authenticated user
 * to invite team members to a company by entering their email addresses.
 * Supports dynamic form fields, checkbox to restrict category invites,
 * and sends invites via API request.
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.showInviteModal - Controls visibility of the modal
 * @param {Function} props.setShowInviteModal - Function to update modal visibility
 * @returns {JSX.Element} InviteMember modal component
 */
const InviteMember = ({showInviteModal, setShowInviteModal}) => {
  // Hook to show feedback toasts to the user
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  // Get current authenticated user from custom auth hook
  const {user} = useAuth();
  // State to manage input fields for multiple email invites
  const [inputValue, setInputValue] = useState([
    {
      email: '',
      inviteOnly: true,
      from: user,
    },
  ]);
  /**
   * Handle input or checkbox changes for invite fields
   * @param {React.ChangeEvent<HTMLInputElement>} evt - Input or checkbox event
   */
  const onInputValueChange = (evt) => {
    const newArr = [...inputValue];
    const value = evt.target.type === 'checkbox' ? evt.target.checked : evt.target.value;
    newArr[evt.target.dataset.id][evt.target.name] = value;
    setInputValue(newArr);
  };

  // Add a new blank member entry to the invite form
  const addmember = () => {
    setInputValue([
      ...inputValue,
      {
        email: '',
        inviteOnly: true,
        from: user,
      },
    ]);
  };

  /**
   * Remove a specific member from the invite list
   * @param {number} i - Index of member to remove
   */
  const removeMember = (i) => {
    const array = [...inputValue];
    array.splice(i, 1);
    setInputValue([...array]);
  };

  /**
   * Send the invite list to the backend API
   * @param {React.FormEvent} e - Form submission event
   * @returns {Promise<void>}
   */
  const sendInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {invitationEmailsList: inputValue};
      await request(true).post('/company/invite-team-member', body);
      setLoading(false);
      return toast({
        status: 'success',
        title: 'Invite sent',
        description: 'Works',
        duration: 6000,
        variant: 'left-accent',
        isClosable: true,
        containerStyle: {
          zIndex: 10000,
        },
      });
    } catch (error) {
      setLoading(false);
      return toast({
        status: 'error',
        title: 'Error',
        description: 'Something went wrong',
        duration: 6000,
        variant: 'left-accent',
        isClosable: true,
        containerStyle: {
          zIndex: 10000,
        },
      });
    }
  };

  // Render the invite modal form with email inputs and submission buttons
  return (
    <div
      data-w-id="8771e887-cc75-77ca-294e-9dffadc19d42"
      className={`width-full height-viewport-full background-color-black-50 flex-row-middle flex-column-centered absolute-full sticky position-modal ${showInviteModal ? '' : 'hide'
      }`}
    >
      <div
        className="background-color-white border-1px padding-top-4 box-shadow-large rounded-large"
        style={{width: 300}}
      >
        <h6 className="padding-left-4 margin-bottom-5">Invite your team members</h6>
        <div className="margin-x-4 w-form" style={{padding: 10}}>
          {inputValue.map((val, i) => (
            <div key={nanoid()}>
              <label htmlFor="name" className="form-label">
                Email
              </label>
              <Flex>
                <input
                  pattern=".+@globex\.com"
                  className="form-input small w-input"
                  maxLength="256"
                  name="email"
                  placeholder=""
                  type="email"
                  value={val.email}
                  onChange={onInputValueChange}
                  data-id={i}
                  autoFocus
                />
                <CloseButton onClick={() => removeMember(i)} _focus={{outline: 'none'}} size="lg" />
              </Flex>
              <label className="w-checkbox flex-row-middle">
                <input
                  type="checkbox"
                  className="w-checkbox-input w-checkbox-input--inputType-custom margin-top-0 margin-right-2"
                  id="inviteOnly"
                  name="inviteOnly"
                  checked={val.inviteOnly}
                  data-name="Checkbox"
                  value={val.inviteOnly}
                  onChange={onInputValueChange}
                  data-id={i}
                />
                <span className="text-small text-color-body-text w-form-label">
                  Invite only to this category
                </span>
              </label>
            </div>
          ))}
          <a onClick={addmember} className="button-text active margin-top-4 rounded-large w-button">
            Add member
          </a>
          <div className="w-form-done">
            <div>Thank you! Your submission has been received!</div>
          </div>
          <div className="w-form-fail">
            <div>Oops! Something went wrong while submitting the form.</div>
          </div>
        </div>
        <div className="padding-y-3 padding-x-4 flex-justify-end background-secondary">
          <a
            className="button button-small w-button"
            onClick={() => setShowInviteModal(false)}
            style={{marginRight: 10, background: 'grey'}}
          >
            cancel
          </a>
          <button onClick={sendInvite} className="button button-small w-button">
            {(loading && <Loader />) || <span>Send invite</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

InviteMember.propTypes = {
  showInviteModal: proptTypes.any,
  setShowInviteModal: proptTypes.any,
};

export default InviteMember;
