import React, {useState} from 'react';
import {useToast, Text} from '@chakra-ui/react';
import {useAuth} from 'hooks/user-auth';
import {request} from 'common';
import Loader from 'components/circular-loader';
import accountLogo from '../../../../assets/images/accountLogo.png';
import accountUpload from '../../../../assets/images/accountUpload.png';

const Account = () => {
  const toast = useToast();
  const {user} = useAuth();
  const [fullName, setFullName] = useState(user.full_name);
  const [email, setEmail] = useState(user.email);
  const [loading, setLoading] = useState(false);


  const saveChanges = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await request(true).put('/me', {fullName, email});
      setLoading(false);
      return toast({
        status: 'success',
        title: 'Success',
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
    <div data-w-tab="Account" className="w-tab-pane w--tab-active">
      <div className="padding-x-10 padding-y-10 w-container">
        <Text className="text-align-left" fontSize="20px" fontWeight="700">
          Account Settings
        </Text>

        <div className="margin-top-10">
          <div className="width-24 height-24 flex-column-centered margin-bottom-2">
            <img
              src={accountLogo}
              loading="lazy"
              alt=""
              className=" padding-bottom-1"
              width="90"
              height="90"
              style={{position: 'relative'}}
            />
            <img style={{position: 'absolute', marginTop: '74px', marginLeft: '51px'}} src={accountUpload} />
          </div>
        </div>


        <div className="margin-top-10 margin-bottom-0 w-form">
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
            placeholder="Omotola Adewale"
            id="name"
            value={fullName}
          />
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
            placeholder="omotola@dangote.flour"
            id="email"
            required=""
            value={email}
          />
          <div className="margin-top-10">
            <button
              onClick={saveChanges}
              className="button w-button"
              style={{outline: 'none', backgroundColor: '#ECECEF'}}
            >
              {(loading && <Loader />) || <span style={{color: '#9696A6'}}>Save changes</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
