import React, {useState} from 'react';
import proptTypes from 'prop-types';
import {CloseButton, Flex, useToast} from '@chakra-ui/react';
import {nanoid} from '@reduxjs/toolkit';
import {request} from 'common';
import Loader from 'components/circular-loader';

/**
 * InviteMember component renders a modal that allows users to invite team members by email.
 *
 * @param {Object} props - Component props.
 * @param {boolean} props.showInviteModal - Controls visibility of the modal.
 * @param {Function} props.setShowInviteModal - Function to toggle modal visibility.
 * @returns {JSX.Element} Modal component for inviting team members.
 */
const InviteMember = ({showInviteModal, setShowInviteModal}) => {
  const toast = useToast();
  // Loading state for invite request
  const [loading, setLoading] = useState(false);
  const {user} = useAuth();
  // Holds list of members to invite
  const [inputValue, setInputValue] = useState([
    {
      email: '',
      inviteOnly: true,
      from: user,
    },
  ]);

  // Update inputValue state based on input changes
  /**
   * Handles changes to email input and checkbox fields in the invitation form.
   *
   * @param {Event} evt - The input change event.
   */
  const onInputValueChange = (evt) => {
    const newArr = [...inputValue];
    const value = evt.target.type === 'checkbox' ? evt.target.checked : evt.target.value;
    newArr[evt.target.dataset.id][evt.target.name] = value;
    setInputValue(newArr);
  };

  // Add a new member input row
  /**
   * Adds a new empty member object to the input value array.
   */
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

  // Remove a specific member input row by index
  /**
   * Removes a member input field from the invitation form.
   *
   * @param {number} i - Index of the member input to remove.
   */
  const removeMember = (i) => {
    const array = [...inputValue];
    array.splice(i, 1);
    setInputValue([...array]);
  };

  // Send invite request to backend
  /**
   * Sends invitation emails using the provided list of email addresses.
   *
   * @param {Event} e - The form submission event.
   * @returns {Promise<void>} A toast notification indicating success or failure.
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
        position: 'top-right',
        description: 'Works',
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
    <div
      data-w-id="8771e887-cc75-77ca-294e-9dffadc19d42"
      className={`width-full height-viewport-full background-color-black-50 flex-row-middle flex-column-centered absolute-full sticky position-modal ${
        showInviteModal ? '' : 'hide'
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
