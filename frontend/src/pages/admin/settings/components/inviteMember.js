import React, {useState} from 'react';
import {nanoid} from '@reduxjs/toolkit';
import {request} from 'common';
import Loader from 'components/circular-loader';
import {useToast} from '@chakra-ui/react';
import {useAuth} from 'hooks/user-auth';
import {Modal, ModalBody, ModalContent, ModalFooter, ModalOverlay} from '@chakra-ui/modal';
import {useDisclosure} from '@chakra-ui/hooks';
import {Box, Text} from '@chakra-ui/layout';
import {IoMdAdd} from 'react-icons/Io';

const InviteMember = () => {
  const {isOpen, onOpen, onClose} = useDisclosure();

  const toast = useToast();
  const {user} = useAuth();
  // const [role, setRole] = useState(user.admin_user.role.id);
  // console.log('USER', user);
  // console.log('role', role);
  const [inputValue, setInputValue] = useState([
    {
      email: '',
      role_id: 'zgDkefjf2EOLxVhH2Hc8',
      from: user
    },
  ]);
  const [loading, setLoading] = useState(false);

  const onInputValueChange = (evt) => {
    const newArr = [...inputValue];
    const value = evt.target.value;
    newArr[evt.target.dataset.id][evt.target.name] = value;
    setInputValue(newArr);
  };

  const addMember = () => {
    setInputValue([
      ...inputValue,
      {
        email: '',
        role_id: '',
        from: user
      },
    ]);
  };


  const sendInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // const body = {invitationEmailsList: inputValue};
      await request(true).post('/admin/invite', inputValue);
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
        description: 'Something went wrong: ' + errors.invitationId[0],
        duration: 6000,
        isClosable: true,
      });
    }
  };

  return (

    <>
      <a
        data-w-id="a79b7997-519c-1332-bf20-d87feb8c2e16"
        className="button-secondary button-small w-button"
        onClick={onOpen}
      >
        Invite
      </a>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <div className="background-color-white border-1px box-shadow-large rounded-large width-128">
            {/* <IndustryModalHeader title="Input IEG Scores" /> */}
            <ModalBody >
              <Box fontFamily="DM Sans" >
                <div className="padding-bottom-6 border-bottom-1px w-form">
                  <form>
                    <Text className="text-align-left margin-top-5" fontSize="16px" fontWeight="700">
                      Invite your team members
                    </Text>
                    <div>

                      {inputValue.map((val, i) => (
                        <div key={nanoid()} className="w-layout-grid  rounded-large  margin-top-5">
                          <div>
                            <label htmlFor="name" className="form-label">Email</label>
                            <input
                              type="email"
                              className="form-input margin-bottom-0 w-input"
                              name="email"
                              placeholder=""
                              value={val.email}
                              onChange={onInputValueChange}
                              data-id={i}
                              autoFocus
                            />
                          </div>

                          <div>
                            <label htmlFor="cars" className="form-label">Role</label>
                            {user?.admin_user?.role?.value === 'nuclear_admin' &&
                              <select className="form-input margin-bottom-0 w-input" value={val.role_id} data-id={i} name="role_id" id="role_id" onChange={onInputValueChange}>
                                <option value="zgDkefjf2EOLxVhH2Hc8">Basic Admin</option>
                                <option value="F4UNfg4iRCZRKJGZpbvv">Super Admin</option>
                                <option value="l9SHXn44ldl0reoeRqlQ">IVC Admin</option>
                              </select>
                            }
                            {user?.admin_user?.role?.value === 'super_admin' &&
                              <select className="form-input margin-bottom-0 w-input" name="role_id" id="role_id" onChange={onInputValueChange}>
                                <option value="zgDkefjf2EOLxVhH2Hc8">Basic Admin</option>
                                <option value="F4UNfg4iRCZRKJGZpbvv">Super Admin</option>
                                <option value="l9SHXn44ldl0reoeRqlQ">IVC Admin</option>
                              </select>
                            }
                            { user?.admin_user?.role?.value === 'basic_admin' &&
                            <select className="form-input margin-bottom-0 w-input" name="role_id" id="role_id" onChange={onInputValueChange}>
                              <option value="zgDkefjf2EOLxVhH2Hc8">Basic Admin</option>
                              <option value="l9SHXn44ldl0reoeRqlQ">IVC Admin</option>
                            </select>
                            }
                            {user?.admin_user?.role?.value === 'ivc' &&
                              <select className="form-input margin-bottom-0 w-input" name="role_id" id="role_id" onChange={onInputValueChange}>
                                <option value="l9SHXn44ldl0reoeRqlQ">IVC Admin</option>
                              </select>
                            }
                          </div>
                        </div>

                      ))}


                    </div>
                  </form>
                  <button onClick={addMember} style={{display: 'flex', paddingLeft: '0'}} className="button-text active margin-top-4 rounded-large w-button">
                    <IoMdAdd />
                    Add member
                  </button>
                </div>
              </Box>
            </ModalBody>
            <ModalFooter className="padding-y-3 padding-x-4 flex-justify-end background-secondary border-top-1px rounded-large bottom sticky-bottom-0">
              <div>
                <a href="#" className="button-secondary button-small margin-right-3 w-button">Cancel</a>
                <button onClick={sendInvite} className="button button-small w-button">
                  {(loading && <Loader />) || <span>Send invite</span>}
                </button>
              </div>
            </ModalFooter>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
};

export default InviteMember;
