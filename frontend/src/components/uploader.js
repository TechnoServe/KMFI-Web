import React, {useEffect} from 'react';

import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import propTypes from 'prop-types';

const Uppy = require('@uppy/core');
const XHRUpload = require('@uppy/xhr-upload');
const Dashboard = require('@uppy/dashboard');
const GoogleDrive = require('@uppy/google-drive');

const UPLOAD_ENDPOINT = 'https://selfassessment.kmfi-ke.org/api/v1/documents';
const COMPANION_URL = 'https://mfi-companion.herokuapp.com';

let BTN_INSTANCE_COUNT = 0;
const getNextBtnInstanceId = () => `UppyModalOpenerBtn-${++BTN_INSTANCE_COUNT}`;
const getAuthToken = () => sessionStorage.getItem('auth-token');


/**
 * Uploader component initializes and renders a button that triggers Uppy Dashboard
 * to upload a single document. Supports Google Drive integration and metadata tagging.
 *
 * @param {Object} props - Component props
 * @param {string} [props.companyId='12345'] - ID of the company uploading the document
 * @param {string} [props.categoryId='12345'] - Category ID associated with the document
 * @param {Function} [props.onComplete=()=>undefined] - Callback function triggered after successful upload
 * @param {string} [props.tier='TIER_1'] - Tier level of the document being uploaded
 * @returns {JSX.Element} A button that opens the Uppy Dashboard for document uploads
 */
export const Uploader = ({companyId = '12345', categoryId = '12345', onComplete = () => undefined, tier = 'TIER_1'}) => {
  // Generate a unique ID for the Dashboard trigger button
  const btnId = getNextBtnInstanceId();
  // Setup Uppy instance with Dashboard, XHR upload, and Google Drive plugin
  useEffect(() => {
    const uppy = new Uppy({
      debug: true,
      autoProceed: false,
      restrictions: {
        maxFileSize: 10000000,
        maxNumberOfFiles: 1,
        minNumberOfFiles: 1,
        // https://uppy.io/docs/uppy/#restrictions
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
        allowedFileTypes: undefined, // ['application/*', 'image/*'],
      },
      meta: {
        category_id: categoryId,
        company_id: companyId,
        tier,
      },
    })
      // Configure XHRUpload plugin to send file to backend API with auth headers
      .use(XHRUpload, {
        endpoint: UPLOAD_ENDPOINT,
        fieldName: 'document',
        headers: {
          authorization: `Bearer ${getAuthToken()}`,
        },
      })
      // Attach Dashboard UI plugin to a button and configure metadata input fields
      .use(Dashboard, {
        trigger: `#${btnId}`,
        showProgressDetails: true,
        note: 'PDF only up to 10 MB',
        height: 470,
        metaFields: [
          {id: 'name', name: 'Name', placeholder: 'file name'},
          {id: 'caption', name: 'Caption', placeholder: 'describe what the document is about'},
        ],
        browserBackButtonClose: false,
      })
      // Enable file selection from Google Drive via Companion service
      .use(GoogleDrive, {
        target: Dashboard,
        companionUrl: COMPANION_URL,
      });

    // Handle upload completion event and invoke onComplete callback
    uppy.on('complete', (result) => {
      onComplete(result);
    });
    // Clean up Uppy instance on component unmount
    return () => {
      uppy.close();
    };
  }, [companyId, categoryId, tier]);
  // Render button that opens the Uppy Dashboard modal
  return (
    <button id={btnId} className="button-secondary button-small w-button" style={{outline: 'none'}}>
      Uploader
    </button>
  );
};

Uploader.propTypes = {
  categoryId: propTypes.string,
  onComplete: propTypes.func,
  companyId: propTypes.string,
  tier: propTypes.any,
};
