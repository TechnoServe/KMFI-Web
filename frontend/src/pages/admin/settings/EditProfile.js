import React, {useState} from 'react';
// import {Text} from '@chakra-ui/layout';
import {Modal, ModalCloseButton, ModalContent, ModalOverlay} from '@chakra-ui/modal';
import {useDisclosure, useToast} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import {useAuth} from 'hooks/user-auth';
import {request} from 'common';
import {Spinner} from '@chakra-ui/react';
import {useHistory} from 'react-router-dom';
// import accountLogo from '../../../assets/images/accountLogo.png';
// import accountUpload from '../../../assets/images/accountUpload.png';

const EditProfile = ({profileData}) => {
  const {isOpen, onOpen} = useDisclosure();
  const [show, setShow] = useState(false);
  const [list, setList] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [inputValue, setInputValue] = useState([
    {
      'assignedCompany': '',
    },
  ]);
  const [profileValue, setProfileValue] = useState(profileData.companies);
  const cycleId = localStorage.getItem('cycle') ? localStorage.getItem('cycle') : 'vJqDawZlrKNHsMIW9G2s';
  const [roleValue, setRoleValue] = useState(profileData?.role);
  const {user} = useAuth();
  const toast = useToast();
  const history = useHistory();

  const onInputValueChange = (evt) => {
    const newArr = [...inputValue];
    const value = evt.target.type === 'checkbox' ? evt.target.checked : evt.target.value;
    newArr[evt.target.dataset.id][evt.target.name] = value;
    setInputValue(newArr);
  };

  const addmember = () => {
    setInputValue([
      ...inputValue,
      {
        'assignedCompany': '',
      },
    ]);
  };

  const removeMember = (i) => {
    const array = [...inputValue];
    array.splice(i, 1);
    setInputValue([...array]);
  };

  const removeSelectedMember = async (name, id) => {
    setProfileValue(profileValue.filter((item) => item?.name !== name));

    const res = await request(true).delete(`admin/assign-company/${id}`);
    if (res.status === 200) {
      return toast({
        status: 'success',
        title: 'success',
        position: 'top-right',
        description: `${res.data.success}`,
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

  const roleIdValue = (event) => {
    const value = event.target.value;
    setRoleValue(value);
  };


  const assignRoleAndCompany = async () => {
    const assingContraint = {
      'role_id': roleValue,
      'user_id': profileData.id
    };
    const companyId = inputValue.map((x) => x.assignedCompany);
    // const userID = profileData.id;
    // const cycle = cycleId?.data[0]?.brands?.map((x) => x?.productTests?.map((x) => x?.results?.map((x) => x?.cycle_id)));

    try {
      await request(true).put('admin/assign-role', assingContraint);

      if (inputValue[0].assignedCompany !== '') {
        for (let i = 0; i < inputValue.length; i++) {
          const constraints = {
            'company-id': companyId[i],
            'user-id': profileData.id,
            'cycle-id': cycleId
          };
          await request(true).post('admin/assign-company', constraints);
        }
      }
      history.push('/admin/settings');
      return toast({
        status: 'success',
        title: 'Success',
        position: 'top-right',
        description: 'Company or Role Assigned Successfully',
        duration: 6000,
        isClosable: true,
      });
    } catch (err) {
      return toast({
        status: 'error',
        title: 'Error',
        position: 'top-right',
        description: 'Company Already Assigned',
        duration: 6000,
        isClosable: true,
      });
    }
  };

  const getCompanyList = async () => {
    try {
      setSpinning(true);
      const res = await request(true).get('admin/index?page-size=50');
      const resList = res.data.map((list) => list);
      // setCycleId(res);
      setList(resList);
      setSpinning(false);
    } catch (err) {
    }
  };

  const fetchAdminMembers = () => {
    history.push('/admin/settings');
  };

  const profileDataChange = (e) => {
    console.log(e);
  };

  return (
    <>
      {/* Show if user is Nuclear Admin */}
      {user.role === 'sHM61QwGajJMNUPYxTVI' &&
        <div

          data-w-id="1e597d38-b4f2-e776-75f8-6acc3c20f7bc"
          style={{cursor: 'pointer', color: '#00B27A'}}
          className="button-text padding-x-3 padding-y-1 "
          onClick={onOpen}
        >
          <div onClick={getCompanyList}>Edit Profile</div>
        </div>
      }
      {/* Show if user is Super Admin */}
      {user.role === 'F4UNfg4iRCZRKJGZpbvv' &&
        <div

          data-w-id="1e597d38-b4f2-e776-75f8-6acc3c20f7bc"
          style={{cursor: 'pointer', color: '#00B27A'}}
          className="button-text padding-x-3 padding-y-1 "
          onClick={onOpen}
        >
          <div onClick={getCompanyList}>Edit Profile</div>
        </div>
      }
      <Modal isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <div className="background-color-white border-1px box-shadow-large rounded-large width-128">
            <div className="flex-row-middle flex-space-between padding-5">
              <div>
                <h6 className="margin-bottom-0 weight-medium margin-bottom-1">{profileData.full_name}</h6>
                <div className="text-small text-color-body-text">
                  {
                    profileData.role === 'F4UNfg4iRCZRKJGZpbvv' ? 'Super Admin'
                      : profileData.role === 'l9SHXn44ldl0reoeRqlQ' ? 'Independent Validated Consultant'
                        : profileData.role === 'sHM61QwGajJMNUPYxTVI' ? 'Nuclear Admin'
                          : profileData.role === 'zgDkefjf2EOLxVhH2Hc8' ? 'Basic Admin'
                            : 'No Role Assigned'

                  }</div>
              </div>

              <button onClick={() => setShow(!show)} className="button-secondary button-small w-button">Remove</button>
            </div>
            <div>
              <div className="margin-top-10 margin-bottom-0 w-form">
                <form
                  style={{overflow: 'auto', height: '400px'}}
                  id="wf-form-PC---Create-company-account" name="wf-form-PC---Create-company-account"
                  data-name="PC - Create company account"
                  className="margin-bottom-10 padding-x-5">
                  <div className="margin-bottom-6 flex-justify-center">
                    <img
                      src="https://assets.website-files.com/60772f4527bb4e6ff9bf7f7d/611e67651946f20e8b3a74e9_Avatar%20-%20Large%20-%20Placeholder%20-%20Static.svg"
                      loading="lazy"
                      alt="" />
                  </div>

                  <label htmlFor="name" className="form-label">Role</label>
                  <div className="margin-bottom-4">
                    <select
                      style={{height: '60px'}}
                      className="form-input margin-bottom-0 w-input"
                      onChange={roleIdValue}
                    >
                      <option >

                        {
                          profileData.role === 'F4UNfg4iRCZRKJGZpbvv' ? 'Super Admin'
                            : profileData.role === 'l9SHXn44ldl0reoeRqlQ' ? 'Independent Validated Consultant'
                              : profileData.role === 'sHM61QwGajJMNUPYxTVI' ? 'Nuclear Admin'
                                : profileData.role === 'zgDkefjf2EOLxVhH2Hc8' ? 'Basic Admin'
                                  : 'No Role Assigned'

                        }
                      </option>
                      <option value="sHM61QwGajJMNUPYxTVI">Nuclear Admin</option>
                      <option value="F4UNfg4iRCZRKJGZpbvv">Super Admin</option>
                      <option value="zgDkefjf2EOLxVhH2Hc8">Basic Admin</option>
                      <option value="l9SHXn44ldl0reoeRqlQ">Independent Validation Consultant</option>
                    </select>
                  </div>
                  <label htmlFor="assignedCompany" className="form-label">Assigned companies</label>
                  {profileValue?.map(((x) =>
                    <div className="margin-bottom-4" key={x?.id}>
                      <div className="flex-row-middle">
                        <select
                          style={{height: '60px', backgroundImage: 'none'}}
                          className="form-input margin-bottom-0 w-input"
                          name="profileCompany"
                          value={x?.id}
                          onChange={profileDataChange}

                        >
                          <option
                            value={x?.id}
                          >
                            {x?.name}
                          </option>
                        </select>
                        {user?.role === 'F4UNfg4iRCZRKJGZpbvv' &&
                          <span
                            style={{cursor: 'pointer'}}
                            className="margin-left-4"
                            onClick={() => removeSelectedMember(x?.name, x?.id)}
                          >
                            <div className="button-icon-close">
                              <img
                                src="https://assets.website-files.com/60772f4527bb4e6ff9bf7f7d/60b41ced7b122cc493fac727_fi_xNavigation.svg"
                                loading="lazy"
                                width="24"
                                alt="" />
                            </div>
                          </span>
                        }
                        {user?.role === 'sHM61QwGajJMNUPYxTVI' &&
                          <span
                            style={{cursor: 'pointer'}}
                            className="margin-left-4"
                            onClick={() => removeSelectedMember(x?.name, x?.id)}
                          >
                            <div className="button-icon-close">
                              <img
                                src="https://assets.website-files.com/60772f4527bb4e6ff9bf7f7d/60b41ced7b122cc493fac727_fi_xNavigation.svg"
                                loading="lazy"
                                width="24"
                                alt="" />
                            </div>
                          </span>
                        }

                      </div>
                    </div>
                  ))}
                  {inputValue.map((val, i) => (
                    <>
                      <div key={val.assignedCompany} className="margin-bottom-4">
                        <div className="flex-row-middle">
                          {(spinning && <Spinner />) ||
                            <select
                              style={{height: '60px'}}
                              className="form-input margin-bottom-0 w-input"
                              onChange={onInputValueChange}
                              data-id={i}
                              name="assignedCompany"
                              value={val.assignedCompany}
                            >
                              <option value="" hidden>
                                Select Company
                              </option>
                              {list.map((data) => (
                                <option
                                  key={data.id}
                                  value={data.id}
                                >{data.company_name}</option>
                              ))}
                            </select>
                          }
                          <div style={{cursor: 'pointer'}} className="margin-left-4" onClick={() => removeMember(i)}>
                            <div className="button-icon-close">
                              <img
                                src="https://assets.website-files.com/60772f4527bb4e6ff9bf7f7d/60b41ced7b122cc493fac727_fi_xNavigation.svg"
                                loading="lazy"
                                width="24"
                                alt="" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ))}
                  <a onClick={addmember} className="button-secondary w-button">Add company</a>
                </form>

              </div>
            </div>

            <div
              className="padding-y-3 padding-x-4 flex-justify-end background-secondary rounded-large bottom border-top-1px">
              <a onClick={fetchAdminMembers} className="button-secondary button-small margin-right-3 w-button">Back
              </a>
              <button onClick={assignRoleAndCompany} disabled={spinning === true} className="button button-small w-button">Save</button>
            </div>
          </div>


          {/* Remove Modal */}

          <div className={`background-color-white border-1px padding-top-4 box-shadow-large rounded-large width-80 remove-dropdown ${show ? '' : 'hide'
          }`}
          style={{marginTop: '-21%', marginLeft: '10%'}}
          >
            <h6 className="padding-left-4">Are you sure?</h6>
            <div className="text-small margin-bottom-4 padding-left-4">This user won’t have any access to this project unless you invite them again.</div>
            <div className="padding-y-3 padding-x-4 flex-justify-end background-secondary rounded-large"><a href="#" className="button-danger button-small w-button">Confirm remove</a></div>
          </div>

          <ModalCloseButton onClick={fetchAdminMembers} style={{position: 'absolute', right: '0', background: '#fff', borderRadius: '50%', left: '100%', marginLeft: '90px'}} className="box-shadow-large" />
        </ModalContent>
      </Modal>
    </>
  );
};

EditProfile.propTypes = {
  profileData: PropTypes.any
};


export default EditProfile;
