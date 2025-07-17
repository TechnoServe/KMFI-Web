import React, {useEffect, useState} from 'react';
import {Text} from '@chakra-ui/layout';
import {useToast} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import {request} from 'common';


const CompanyInfo = ({company}) => {
  const [saving, setSaving] = useState(false);
  const [staffSizeData, setStaffSizeData] = useState(null);
  const toast = useToast();
  const [formData, setFormData] = useState({
    company_name: company.company_name,
    company_size: company.company_size,
  });

  useEffect(() => {
    setSaving(true);
    const fetchStaffSizes = async () => {
      try {
        const data = await request().get(
          `/company-size-list`
        );
        setStaffSizeData(data);
        setSaving(false);
      } catch (error) {
        setSaving(false);
      }
    }; fetchStaffSizes();
  }, []);

  const setFormField = (event) => {
    const fieldName = event.target.name;
    const fieldValue = event.target.value;
    if (typeof formData[fieldName] !== 'undefined') {
      setFormData({
        ...formData,
        [fieldName]: fieldValue,
      });
    }
  };

  const submitCompanyData = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);

    try {
      await request(true).post('company/edit', {
        'company-id': company.id,
        'name': formData.company_name,
        'company-size-id': formData.company_size
      });
      setSaving(false);

      setTimeout(() => {
        location.reload();
      }, 1000);
      return toast({
        status: 'success',
        title: 'Success',
        position: 'top-right',
        description: 'Company updated',
        duration: 6000,
        isClosable: true,
      });
    } catch (error) {
      console.log('ERR', error);
      setSaving(false);
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
    <div data-w-tab="Company" className="w-tab-pane w--tab-active">
      <div className="padding-x-10 padding-y-10 w-container">
        <Text className="text-align-left" fontSize="20px" fontWeight="700">
          Update company details
        </Text>
        <div className="margin-top-10 margin-bottom-0 w-form">
          <form
            id="wf-form-PC---Create-company-account"
            name="wf-form-PC---Create-company-account"
            onSubmit={submitCompanyData}
          >
            <label htmlFor="name-2" className="form-label">
              Company Name
            </label>
            <input
              type="text"
              className="form-input margin-bottom-4 w-input"
              maxLength="256"
              name="company_name"
              placeholder="Company Name"
              value={formData.company_name}
              onChange={setFormField}
              id="name-2"
            />
            <label htmlFor="email-3" className="form-label">
              Staff Size
            </label>
            <select
              id="field"
              name="company_size"
              className="form-select margin-bottom-4 w-select"
              value={formData.company_size}
              onChange={setFormField}
            >
              {staffSizeData?.data.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <div className="margin-top-10">
              <input
                type="submit"
                disabled={saving}
                value={saving ? 'Please wait...' : 'Save changes'}
                className="button width-full w-button"
              />
            </div>
          </form>
          <div className="success-message w-form-done">
            <div className="text-block">Thank you! Your submission has been received!</div>
          </div>
          <div className="w-form-fail">
            <div>Oops! Something went wrong while submitting the form.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

CompanyInfo.propTypes = {
  company: PropTypes.any
};

export default CompanyInfo;
