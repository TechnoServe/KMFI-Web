import React, {useEffect, useState} from 'react';
import {Modal, ModalBody, ModalContent, ModalOverlay} from '@chakra-ui/modal';
import {useDisclosure, ModalCloseButton, Box} from '@chakra-ui/react';
import {Text} from '@chakra-ui/layout';
import EditProfile from '../../settings/EditProfile';
import InviteMember from './inviteMember';
import {
  Flex,
  Spinner
} from '@chakra-ui/react';
import {request} from 'common';
import Activities from './activity/activity';


const Team = () => {
  // const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [selectedUID, setSelectedUID] = useState(null);
  const [adminMembers, setAdminMembers] = useState([]);

  useEffect(() => {
    setLoading(true);
    const fetchAdminMembers = async () => {
      try {
        const data = await request(true).get(
          `admin/members`
        );
        setAdminMembers(data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    }; fetchAdminMembers();
  }, []);

  const showActivityModal = (uid) => {
    setSelectedUID(uid);
    setTimeout(() => {
      onOpen();
    }, 500);
  };

  return (
    <Box fontFamily="DM Sans">
      <div data-w-tab="Team" className="w-tab-pane w--tab-active">
        <div className="padding-x-10 padding-y-10 w-container">
          <div className="flex-align-center flex-space-between margin-bottom-10">
            <Text className="text-align-left" fontSize="20px" fontWeight="700">
              Team Members
            </Text>
            <InviteMember />
          </div>
          {loading ? (
            <Flex height="100%" width="100%" mb="10" justifyContent="center" alignItems="center">
              <Spinner />
            </Flex>
          ) :
            adminMembers?.data?.map((x) => (
              <div key={x.id} className="border-bottom-1px">
                <div className="padding-4 flex-row-middle flex-space-between">
                  <div className="flex-row-middle">
                    <img src="https://assets.website-files.com/60772f4527bb4e6ff9bf7f7d/6088137dc77d256e4e541759_Team%20member%20name.png" loading="lazy" alt="" className="width-9 height-9 rounded-full margin-right-4" />
                    <div>
                      <div className="text-base medium">{x.full_name}</div>
                      <div className="text-small weight-medium text-color-body-text">

                        {
                          x.role === 'F4UNfg4iRCZRKJGZpbvv' ? 'Super Admin'
                            : x.role === 'l9SHXn44ldl0reoeRqlQ' ? 'Independent Validated Consultant'
                              : x.role === 'sHM61QwGajJMNUPYxTVI' ? 'Nuclear Admin'
                                : x.role === 'zgDkefjf2EOLxVhH2Hc8' ? 'Basic Admin'
                                  : 'No Role Assigned'

                        }
                      </div>
                    </div>
                  </div>
                  <EditProfile profileData={x} />
                </div>
                <div className="padding-x-4 padding-bottom-4 padding-top-1 flex-row-middle flex-space-between">
                  <div className="category-header">
                    {x?.companies === null ? 0 : x?.companies?.length} ASSIGNED COMPANIES</div>
                  <img src="https://assets.website-files.com/60772f4527bb4e6ff9bf7f7d/611e46b9c7bda0a185d74d92_Assigned%20Companies.svg" loading="lazy" alt="" />
                </div>
                <div className="flex-row-middle flex-space-between margin-bottom-5">
                  <button onClick={() => showActivityModal(x?.id)} className="button-secondary button-small w-button">Activity Log</button>
                </div>
              </div>
            ))}
        </div>
        <Modal size={'3xl'} isOpen={isOpen} isCentered closeOnEsc={true} closeOnOverlayClick={true}>
          <ModalOverlay />
          <ModalContent>
            <div className="background-color-white border-1px box-shadow-large rounded-large h-screen overflow-scroll">
              <ModalBody >
                <Box fontFamily="DM Sans" >
                  <Activities uid={selectedUID}/>
                </Box>
              </ModalBody>
            </div>
            <ModalCloseButton onClick={onClose} style={{position: 'absolute', top: '0', right: '0', background: '#fff', borderRadius: '50%'}} className="box-shadow-large" />
          </ModalContent>
        </Modal>
      </div>
    </Box>
  );
};


export default Team;
