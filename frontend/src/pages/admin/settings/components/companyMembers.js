import React, {useEffect, useState} from 'react';
import {Text} from '@chakra-ui/layout';
import PropTypes from 'prop-types';
import {
  Flex,
  Spinner
} from '@chakra-ui/react';
import {request} from 'common';


const CompanyMembers = ({companyId}) => {
  const [loading, setLoading] = useState(false);
  const [companyMembers, setCompanyMembers] = useState([]);

  useEffect(() => {
    setLoading(true);
    const fetchCompanyMembers = async () => {
      try {
        const data = await request(true).get(
          `company/${companyId}/members`
        );
        setCompanyMembers(data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    }; fetchCompanyMembers();
  }, []);
  return (
    <>
      <div data-w-tab="Team" className="w-tab-pane w--tab-active">
        <div className="padding-x-10 padding-y-10 w-container">
          <div className="flex-align-center flex-space-between margin-bottom-10">
            <Text className="text-align-left" fontSize="20px" fontWeight="700">
              Company Members
            </Text>
          </div>
          {loading ? (
            <Flex height="100%" width="100%" mb="10" justifyContent="center" alignItems="center">
              <Spinner />
            </Flex>
          ) :
            companyMembers?.data?.map((x) => (
              <div key={x.id} className="w-layout-grid grid-list box-shadow-small rounded-large">
                <div className="padding-4 flex-row-middle flex-space-between border-bottom-1px">
                  <div className="flex-row-middle">
                    <img
                      src={`https://ui-avatars.com/api/?background=random&name=${x.full_name}`}
                      loading="lazy"
                      alt=""
                      className="width-9 height-9 rounded-full margin-right-4"
                    />
                    <div>
                      <div className="text-base medium">{x.full_name}</div>
                      <div className="text-small weight-medium text-color-body-text">
                        {x.email}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

CompanyMembers.propTypes = {
  companyId: PropTypes.any
};

export default CompanyMembers;
