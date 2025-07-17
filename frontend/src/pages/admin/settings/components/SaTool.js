import React, {useEffect, useState} from 'react';
import {useToast, Text} from '@chakra-ui/react';
import {useAuth} from 'hooks/user-auth';
import {request} from 'common';
import Loader from 'components/circular-loader';

const SaTool = () => {
  const {user} = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [lockDate, setLockDate] = useState();
  const [activeCycle, setActiveCycle] = useState({});

  useEffect(() => {
    setLoading(true);
    const fetchCurrentCycle = async () => {
      try {
        const data = await request(true).get(
          `admin/active-cycle`
        );
        setActiveCycle(data.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    }; fetchCurrentCycle();
  }, []);

  const saveChanges = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await request(true).put('admin/lock-sat', {
        'cycle-id': activeCycle.id,
        'date': lockDate
      });
      setLoading(false);
      return toast({
        status: 'success',
        title: 'Success',
        position: 'top-right',
        description: 'Cycle Upldated',
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
    <>
      <div data-w-tab="SaTool" className="w-tab-pane w--tab-active">
        <div className="padding-x-10 padding-y-10 w-container">
          <Text className="text-align-left" fontSize="20px" fontWeight="700">
            Self Assessment Tool Settings
          </Text>

          <div className="margin-top-10 margin-bottom-0 w-form">
            <div className="text-small weight-medium text-color-body-text" style={{paddingBottom: '15px'}}>
              Lock date
            </div>
            <input
              onChange={(e) => setLockDate(e.target.value)}
              type="date"
              className="form-input margin-bottom-4 w-input"
              maxLength="256"
              name="lockDate"
              data-name="lockDate"
              id="lockDate"
              disabled={user?.admin_user?.role?.value === 'basic_admin' || user?.admin_user?.role?.value === 'super_admin'}
            />
            <div className="text-small weight-medium text-color-body-text">
              Set the lock date for the 2021 SA Tool cycle.
            </div>
            <div className="margin-top-10">
              <button
                onClick={saveChanges}
                className="button w-button"
                style={{outline: 'none', backgroundColor: '#ECECEF', color: '#9696A6'}}
              >
                {(loading && <Loader />) || <span style={{color: '#9696A6'}}>Save changes</span>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SaTool;
