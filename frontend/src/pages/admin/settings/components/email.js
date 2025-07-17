import React, {useState} from 'react';
import {Text, useToast} from '@chakra-ui/react';
// import {nanoid} from '@reduxjs/toolkit';
import {request} from 'common';
import PropTypes from 'prop-types';
import Loader from 'components/circular-loader';
import {EditorState, convertToRaw} from 'draft-js';
import {Editor} from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import draftToHtml from 'draftjs-to-html';

const Email = ({companyId}) => {
  const [subject, setSubject] = useState(null);
  const [message, setMessage] = useState(EditorState.createEmpty());
  // const [message, setMessage] = useState(null);
  // const [show, setShow] = useState(false);
  // const editorRef = useRef(null);
  const [loading, setLoading] = useState(false);
  // const [spinning, setSpinning] = useState(false);
  const toast = useToast();

  const sendMail = async () => {
    const messageToSend = draftToHtml(convertToRaw(message.getCurrentContent()));
    console.log('messageToSend', messageToSend);
    setLoading(true);
    try {
      const body = {
        'company-id': companyId,
        'subject': subject,
        'message': messageToSend,
      };
      await request(true)
        .post(`admin/email?company-id=${companyId}`, body);
      setLoading(false);
      return toast({
        status: 'success',
        title: 'Success',
        position: 'top-right',
        description: 'Email Sent',
        duration: 6000,
        isClosable: true,
      });
    } catch (error) {
      setLoading(false);
      return toast({
        status: 'error',
        title: 'Error',
        position: 'top-right',
        description: 'Email Sent',
        duration: 6000,
        isClosable: true,
      });
    }
  };

  return (
    <div data-w-tab="Account" className="w-tab-pane w--tab-active">
      <div className="padding-x-10 padding-y-10 w-container">
        <Text className="text-align-left" fontSize="20px" fontWeight="700">
          Email Company(s)
        </Text>
        <div className="margin-top-10 margin-bottom-0 w-form">
          <label htmlFor="subject" className="form-label">
            Subject
          </label>
          <input
            type="text"
            className="form-input margin-bottom-4 w-input"
            maxLength="256"
            name="subject"
            onChange={(e) => setSubject(e.target.value)}
            data-name="subject"
            id="subject"
            value={subject}
          />
          <label htmlFor="message" className="form-label">
            Message
          </label>
          <Editor
            editorState={message}
            toolbarClassName="toolbarClassName"
            wrapperClassName="wrapperClassName"
            editorClassName="editorClassName"
            onEditorStateChange={setMessage}
          />

          <div className="margin-top-10">
            <button
              disabled={(loading || !subject || !message)}
              onClick={sendMail}
              className="button w-button"
              style={{outline: 'none', backgroundColor: '#ECECEF'}}
            >
              {((loading || !subject || !message) && <Loader />) || <span style={{color: '#9696A6'}}>Send Email</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

Email.propTypes = {
  companyId: PropTypes.any
};


export default Email;
