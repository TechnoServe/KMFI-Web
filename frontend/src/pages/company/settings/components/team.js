import {nanoid} from '@reduxjs/toolkit';
import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Text} from '@chakra-ui/react';
import Loader from 'components/circular-loader';

/**
 * Team component displays a list of company team members, with an interface
 * to invite new members and remove existing ones.
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.showInviteModal - Controls the visibility of the invite modal
 * @param {Function} props.setShowInviteModal - Toggles the invite modal
 * @param {Function} props.fetchMembersHandler - Function to fetch member data
 * @param {Function} props.deleteMemberHandler - Function to remove a member
 * @param {Object} props.membersData - Member data including list, fetching status, etc.
 * @param {boolean} props.membersData.fetching - Indicates if data is being fetched
 * @param {boolean} props.membersData.fetched - Indicates if data has been fetched
 * @param {string|null} props.membersData.idBeingRemoved - ID of member being removed
 * @param {Array} props.membersData.data - Array of team member objects
 * @returns {JSX.Element} The rendered Team component
 */
const Team = ({
  showInviteModal,
  setShowInviteModal,
  fetchMembersHandler,
  membersData,
  deleteMemberHandler,
}) => {
  const [show, setShow] = useState(false);

  // Fetch members when the component first mounts
  useEffect(() => {
    fetchMembersHandler();
  }, []);

  // Hide the remove confirmation when member deletion is complete
  useEffect(() => {
    if (show && membersData.idBeingRemoved == null) {
      setShow(!show);
    }
  }, [membersData]);

  return (
    <>
      <div data-w-tab="Team" className="w-tab-pane w--tab-active">
        <div className="padding-x-10 padding-y-10 w-container">
          <div className="flex-align-center flex-space-between margin-bottom-10">
            <Text className="text-align-left" fontSize="20px" fontWeight="700">
              Team members
            </Text>
            <a
              data-w-id="a79b7997-519c-1332-bf20-d87feb8c2e16"
              onClick={() => setShowInviteModal(!showInviteModal)}
              className="button-secondary button-small w-button"
            >
              Invite
            </a>
          </div>
          {/* Show loader while fetching team members */}
          {membersData.fetching ? <Loader /> : null}
          {/* Render each team member in a card with name, company, and remove option */}
          {membersData.data.map((member) => (
            <div key={nanoid()} className="w-layout-grid grid-list box-shadow-small rounded-large">
              <div className="padding-4 flex-row-middle flex-space-between border-bottom-1px">
                <div className="flex-row-middle">
                  <img
                    src={`https://ui-avatars.com/api/?background=random&name=${member.full_name}`}
                    loading="lazy"
                    alt=""
                    className="width-9 height-9 rounded-full margin-right-4"
                  />
                  <div>
                    <div className="text-base medium">{member.full_name}</div>
                    <div className="text-small weight-medium text-color-body-text">
                      {member.company.company_name}
                    </div>
                  </div>
                </div>
                {/* Show confirmation dialog before removing a member */}
                <div
                  data-w-id="96da7984-2260-4962-0d48-c3b889abade4"
                  className={`background-color-white border-1px padding-top-4 box-shadow-large rounded-large width-80 remove-dropdown ${show ? '' : 'hide'
                  }`}
                >
                  <h6 className="padding-left-4">Are you sure?</h6>
                  <div className="text-small margin-bottom-4 padding-left-4">
                    {member.full_name} won’t have any access to this project unless you invite them
                    again.
                  </div>
                  <div className="flex-row flex-space-between">
                    <div className="padding-y-3 padding-x-4 flex-justify-end background-secondary">
                      {/* Toggle remove confirmation dropdown */}
                      <a
                        onClick={() => setShow(!show)}
                        className="button-primary button-small w-button"
                      >
                        Cancel
                      </a>
                    </div>
                    <div className="padding-y-3 padding-x-4 flex-justify-end background-secondary">
                      {membersData.idBeingRemoved === member.id ? (
                        <Loader />
                      ) : (
                        // Confirm and trigger member deletion
                        <a
                          onClick={(event) => {
                            event.preventDefault();
                            deleteMemberHandler(member.id);
                          }}
                          href="#!"
                          className="button-danger button-small w-button"
                        >
                          Confirm remove
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                {/* Toggle remove confirmation dropdown */}
                <div
                  onClick={() => setShow(!show)}
                  data-w-id="1e597d38-b4f2-e776-75f8-6acc3c20f7bc"
                  style={{cursor: 'pointer'}}
                  className="button-text padding-x-3 padding-y-1 "
                >
                  Remove
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

Team.propTypes = {
  setShowInviteModal: PropTypes.any,
  showInviteModal: PropTypes.bool,
  fetchMembersHandler: PropTypes.func,
  deleteMemberHandler: PropTypes.func,
  membersData: PropTypes.shape({
    fetching: PropTypes.bool,
    fetched: PropTypes.bool,
    idBeingRemoved: PropTypes.string,
    data: PropTypes.array,
  }),
};

export default Team;
