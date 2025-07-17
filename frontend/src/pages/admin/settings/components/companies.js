import React, {useEffect, useState} from 'react';
// import teamImg from 'assets/images/Team member name 2.svg';
import {Modal, ModalCloseButton, ModalContent, ModalOverlay, ModalBody} from '@chakra-ui/modal';
import {useDisclosure, Box} from '@chakra-ui/react';
import {Text} from '@chakra-ui/layout';
// import EditProfile from '../../settings/EditProfile';
import Brands from './brands';
import Email from './email';
import CompanyMembers from './companyMembers';
import CompanyInfo from './companyInfo';
import {
  Flex,
  Spinner
} from '@chakra-ui/react';
import {request} from 'common';


const Companies = () => {
  // const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  // const toast = useToast();
  const [theCompanies, setTheCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const {isOpen, onOpen, onClose} = useDisclosure();
  const {isOpen: isOpenEmail, onOpen: onOpenEmail, onClose: onCloseEmail} = useDisclosure();
  const {isOpen: isOpenMembers, onOpen: onOpenMembers, onClose: onCloseMembers} = useDisclosure();
  const {isOpen: isOpenInfo, onOpen: onOpenInfo, onClose: onCloseInfo} = useDisclosure();


  useEffect(() => {
    setLoading(true);
    const fetchCompanies = async () => {
      try {
        const data = await request(true).get(
          'admin/companies-admin?page-size=50'
        );
        setTheCompanies(data.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    }; fetchCompanies();
  }, []);

  const openBrands = (company) => {
    setSelectedCompany(company);
    setTimeout(() => {
      onOpen();
    }, 500);
  };
  const openEmail = (company) => {
    setSelectedCompany(company);
    setTimeout(() => {
      onOpenEmail();
    }, 500);
  };
  const openMembers = (company) => {
    setSelectedCompany(company);
    setTimeout(() => {
      onOpenMembers();
    }, 500);
  };
  const openInfo = (company) => {
    setSelectedCompany(company);
    setTimeout(() => {
      onOpenInfo();
    }, 500);
  };
  const activateCompany = async (company) => {
    setLoading(true);
    try {
      await request(true).put(`admin/companies-admin/${company.id}/activate`);
      const data = await request(true).get(
        'admin/companies-admin?page-size=50'
      );
      setTheCompanies(data.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const deactivateCompany = async (company) => {
    setLoading(true);
    try {
      await request(true).put(`admin/companies-admin/${company.id}/deactivate`);
      const data = await request(true).get(
        'admin/companies-admin?page-size=50'
      );
      setTheCompanies(data.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };
  const activateAllBrands = async () => {
    setLoading(true);
    try {
      await request(true).put(`admin/brands/activate/all`);
      const data = await request(true).get(
        'admin/companies-admin?page-size=50'
      );
      setTheCompanies(data.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const makeAllDocumentsTier1 = async () => {
    setLoading(true);
    try {
      await request(true).put(`admin/documents/update/all`);
      const data = await request(true).get(
        'admin/companies-admin?page-size=50'
      );
      setTheCompanies(data.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <Box fontFamily="DM Sans">
      <div data-w-tab="Companies" className="w-tab-pane w--tab-active">
        <div className="padding-x-10 padding-y-10 w-container">
          <div className="flex-align-center flex-space-between margin-bottom-10">
            <Text className="text-align-left" fontSize="20px" fontWeight="700">
              Companies
            </Text>
            <button onClick={() => activateAllBrands()} className="button-secondary button-small w-button">Activate All Brands</button>
            <button onClick={() => openEmail({id: 'ALL'})} className="button-secondary button-small w-button">Email All Companies</button>
          </div>
          {loading ? (
            <Flex height="100%" width="100%" mb="10" justifyContent="center" alignItems="center">
              <Spinner />
            </Flex>
          ) :
            theCompanies?.map((x) => (
              <div key={x.id} className="border-bottom-1px">
                <div className="padding-4 flex-row-middle flex-space-between">
                  <div className="flex-row-middle">
                    <div>
                      <div className="text-base medium">{x.company_name}</div>
                      <div className="text-small weight-medium text-color-body-text">
                        {x.email}
                      </div>
                      <div className="text-small weight-medium text-color-body-text">
                        {x.tier}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-row-middle flex-space-between margin-bottom-5">
                  <button onClick={() => openBrands(x)} className="button-secondary button-small w-button">Brands</button>
                  <button onClick={() => openEmail(x)} className="button-secondary button-small w-button">Email</button>
                  <button onClick={() => openMembers(x)} className="button-secondary button-small w-button">Members</button>
                  <button onClick={() => openInfo(x)} className="button-secondary button-small w-button">Info</button>
                  {x.active ? (
                    <button onClick={() => deactivateCompany(x)} className="button-secondary button-small w-button" style={{backgroundColor: 'red'}}>Deactivate</button>
                  ) : (
                    <button onClick={() => activateCompany(x)} className="button-secondary button-small w-button" style={{backgroundColor: 'green'}}>Activate</button>
                  )}
                </div>
              </div>
            ))}
        </div>
        <Modal isOpen={isOpen} isCentered>
          <ModalOverlay />
          <ModalContent>
            <div className="background-color-white border-1px box-shadow-large rounded-large h-screen overflow-scroll width-128">
              <ModalBody >
                <Box fontFamily="DM Sans" >
                  <Brands companyId={selectedCompany?.id}/>
                </Box>
              </ModalBody>
            </div>
            <ModalCloseButton onClick={onClose} style={{position: 'absolute', right: '0', background: '#fff', borderRadius: '50%', left: '100%', marginLeft: '90px'}} className="box-shadow-large" />
          </ModalContent>
        </Modal>
        <Modal isOpen={isOpenEmail} isCentered>
          <ModalOverlay />
          <ModalContent>
            <div className="background-color-white border-1px box-shadow-large rounded-large width-128">
              <Email companyId={selectedCompany?.id}/>
            </div>
            <ModalCloseButton onClick={onCloseEmail} style={{position: 'absolute', right: '0', background: '#fff', borderRadius: '50%', left: '100%', marginLeft: '90px'}} className="box-shadow-large" />
          </ModalContent>
        </Modal>
        <Modal isOpen={isOpenMembers} isCentered>
          <ModalOverlay />
          <ModalContent>
            <div className="background-color-white border-1px box-shadow-large rounded-large width-128">
              <CompanyMembers companyId={selectedCompany?.id}/>
            </div>
            <ModalCloseButton onClick={onCloseMembers} style={{position: 'absolute', right: '0', background: '#fff', borderRadius: '50%', left: '100%', marginLeft: '90px'}} className="box-shadow-large" />
          </ModalContent>
        </Modal>
        <Modal isOpen={isOpenInfo} isCentered>
          <ModalOverlay />
          <ModalContent>
            <div className="background-color-white border-1px box-shadow-large rounded-large width-128">
              <CompanyInfo company={selectedCompany}/>
            </div>
            <ModalCloseButton onClick={onCloseInfo} style={{position: 'absolute', right: '0', background: '#fff', borderRadius: '50%', left: '100%', marginLeft: '90px'}} className="box-shadow-large" />
          </ModalContent>
        </Modal>
      </div>
    </Box>
  );
};


export default Companies;
