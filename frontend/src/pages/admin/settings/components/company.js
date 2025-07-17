import React from 'react';

const Company = () => {
  return (
    <div data-w-tab="Company" className="w-tab-pane w--tab-active">
      <div className="padding-x-10 padding-y-10 w-container">
        <div>
          <h4 className="text-align-left">Update company details</h4>
        </div>
        <div className="margin-top-10">
          <div className="width-24 height-24 border-1px background-secondary rounded-full flex-column-middle flex-column-centered margin-bottom-2">
            <img
              src="https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg"
              loading="lazy"
              alt=""
              className="width-6 padding-bottom-1"
            />
            <div className="text-small">Upload</div>
          </div>
          <div className="text-small">Upload your company&#x27;s Logo</div>
        </div>
        <div className="margin-top-10 margin-bottom-0 w-form">
          <form
            id="wf-form-PC---Create-company-account"
            name="wf-form-PC---Create-company-account"
            data-name="PC - Create company account"
          >
            <label htmlFor="name-2" className="form-label">
              Company Name
            </label>
            <input
              type="text"
              className="form-input margin-bottom-4 w-input"
              maxLength="256"
              name="name-2"
              data-name="Name 2"
              placeholder="Omotola Adewale"
              id="name-2"
            />
            <label htmlFor="email-2" className="form-label">
              Company Email
            </label>
            <input
              type="email"
              className="form-input w-input"
              maxLength="256"
              name="email-2"
              data-name="Email 2"
              placeholder="omotola@dangote.flour"
              id="email-2"
              required=""
            />
            <label htmlFor="email-3" className="form-label">
              Staff Size
            </label>
            <select
              id="field"
              name="field"
              data-name="Field"
              className="form-select margin-bottom-4 w-select"
            >
              <option value="">0 - 25</option>
              <option value="First">26 - 50</option>
              <option value="Second">56 - 100</option>
              <option value="Third">100+</option>
            </select>
            <label htmlFor="email-3" className="form-label">
              Food vehicle
            </label>
            <select
              id="field-2"
              name="field-2"
              data-name="Field 2"
              className="form-select w-select"
            >
              <option value="">Wheat Flour</option>
              <option value="First">Maize Flour</option>
              <option value="Second">Edible Oil</option>
              <option value="Third">Third Choice</option>
            </select>
            <div className="margin-top-10">
              <input
                type="submit"
                value="Save changes"
                data-wait="Please wait..."
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

export default Company;
