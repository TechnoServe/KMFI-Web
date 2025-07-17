import React, {useEffect, useState} from 'react';
import {Modal, ModalBody, ModalContent, ModalOverlay} from '@chakra-ui/modal';
import {useToast, useDisclosure, ModalCloseButton, Box} from '@chakra-ui/react';
import {Text} from '@chakra-ui/layout';
import {
  Flex,
  Spinner
} from '@chakra-ui/react';
import {request} from 'common';
import Activities from './activity/activity';


const CompanyUsers = () => {
  // const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedUID, setSelectedUID] = useState(null);
  const toast = useToast();
  const [companyMembers, setCompanyMembers] = useState([]);
  const {isOpen, onOpen, onClose} = useDisclosure();

  const removeSelectedMember = async (id, authId) => {
    const res = await request(true).delete(`admin/delete/user/${id}/${authId}/`);
    if (res.status === 200) {
      setTimeout(() => {
        location.reload();
      }, 3000);
      return toast({
        status: 'success',
        title: 'success',
        position: 'top-right',
        description: `User deleted`,
        duration: 6000,
        isClosable: true,
      });
    } else {
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

  useEffect(() => {
    setLoading(true);
    const fetchCompanyMembers = async () => {
      try {
        const data = await request(true).get(
          `admin/company/members`
        );
        setCompanyMembers(data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    }; fetchCompanyMembers();
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
              Company Users
            </Text>
          </div>
          {loading ? (
            <Flex height="100%" width="100%" mb="10" justifyContent="center" alignItems="center">
              <Spinner />
            </Flex>
          ) :
            companyMembers?.data?.map((x) => (
              <div key={x.id} className="border-bottom-1px">
                <div className="padding-4 flex-row-middle flex-space-between">
                  <div className="flex-row-middle">
                    <div>
                      <div className="text-base medium">{x.full_name}</div>
                      <div className="text-small weight-medium text-color-body-text">
                        {x.email}
                      </div>
                      <div className="text-small weight-medium text-color-body-text">
                        {x.company_name?x.company_name:'NO company Assigned'}
                      </div>
                    </div>
                  </div>

                  {/* <EditProfile profileData={x} /> */}
                </div>
                <div className="flex-row-middle flex-space-between margin-bottom-5">
                  <button onClick={() => showActivityModal(x?.user_id)} className="button-secondary button-small w-button">Activity Log</button>
                  <button disabled={loading} onClick={() => removeSelectedMember(x?.user_id, x?.auth_provider_id)} className="button-danger button-small w-button">Remove User</button>
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


export default CompanyUsers;
