import React, {useEffect, useState} from 'react';
import fileZip from 'assets/images/tabler_file-zipThumbnail.svg';
import imageZip from 'assets/images/fi_imageThumbnail.svg';
import fileImg from 'assets/images/fi_fileThumbnail.svg';
import propTypes from 'prop-types';
import {request} from 'common';
import {Flex, Spinner, CloseButton} from '@chakra-ui/react';
import {Uploader} from '../../../components/uploader';
import {nanoid} from '@reduxjs/toolkit';

/**
 * Evidence component allows admins or users to view, upload, and delete supporting documents
 * tied to a specific assessment category and company.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string|number} props.categoryId - The current assessment category ID
 * @param {string|number} props.companyId - The ID of the company whose documents are being managed
 * @returns {JSX.Element} Rendered component UI for document display and upload interface
 */
const Evidence = ({categoryId, companyId}) => {
  const [loading, setLoading] = useState(true);
  const [btnLoad, setBtnLoad] = useState(false);
  const [docs, setDocs] = useState([]);

  /**
   * Fetches documents for the selected category and company from the server.
   *
   * @param {boolean} type - Whether to trigger loading spinner
   * @returns {Promise<void>}
   */
  const getDocuments = async (type) => {
    type && setLoading(true);
    try {
      const {data: res} = await request(true).get(`/documents/list/category/${categoryId}?company_id=${companyId}`);
      setDocs(res.result);
      type && setLoading(false);
    } catch (error) {
      type && setLoading(false);
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

  /**
   * Deletes a document by ID and refreshes the document list.
   *
   * @param {string|number} id - ID of the document to be deleted
   * @returns {Promise<void>}
   */
  const deleteDocuments = async (id) => {
    setBtnLoad(true);
    try {
      await request(true).delete(`/documents/${id}`);
      getDocuments();
      setBtnLoad(false);
    } catch (error) {
      setBtnLoad(false);
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

  /**
   * Triggers a manual refresh of the documents list.
   *
   * @returns {void}
   */
  const refreshDocumentsHandler = () => {
    // refresh
    getDocuments(1); // ???
  };

  useEffect(() => {
    getDocuments(1);
  }, [categoryId]);

  return (
    <div className="padding-x-10 padding-bottom-6 border-bottom-1px">
      <div className="padding-top-6 padding-bottom-4">
        <div className="text-sub-header">Evidence descriptor</div>
      </div>
      <div className="background-color-white border-1px rounded-large padding-5">
        <div className="flex-row-middle flex-space-between margin-bottom-5">
          <h6 className="margin-bottom-0 weight-medium">Add supporting evidence</h6>
        </div>
        {/* Conditionally render loading spinner or document thumbnails grid */}
        {loading ? (
          <Flex
            height="100%"
            width="100%"
            mb="10"
            justifyContent="center"
            alignItems="center
     "
          >
            <Spinner />
          </Flex>
        ) : (
          <div className="grid-5-columns margin-bottom-5">
            {/* Loop through each document and display with relevant icon, name, and delete button */}
            {docs.map(({content_type: contentType, original_file_name: originalFileName, id, file_name: fileName, storage_id: storageId}) => {
              return contentType === 'application/pdf' ? (
                <div key={id} className="border-1px rounded-large">
                  <Flex className="background-color-4" justify="flex-end">
                    <CloseButton
                      size="sm"
                      isDisabled={btnLoad}
                      onClick={() => deleteDocuments(id)}
                    />
                  </Flex>
                  <div className="padding-y-4 flex-justify-center background-color-4">
                    <img src={fileZip} loading="lazy" width="36" height="36" alt="" />
                  </div>
                  <div className="background-color-white border-top-1px flex-justify-center padding-y-2">
                    <div className="text-tiny" style={{padding: 5}}>
                      <a href={`https://www.googleapis.com/download/storage/v1/b/kmfi-945ef.appspot.com/o/${fileName}?generation=${storageId.toString().split('/').pop()}&alt=media`}> {originalFileName} </a>
                    </div>
                  </div>
                </div>
              ) : contentType.includes('image') ? (
                <div key={nanoid()} className="border-1px rounded-large">
                  <Flex className="background-color-4" justify="flex-end">
                    <CloseButton
                      size="sm"
                      isDisabled={btnLoad}
                      onClick={() => deleteDocuments(id)}
                    />
                  </Flex>
                  <div className="padding-y-4 flex-justify-center background-color-4">
                    <img src={imageZip} loading="lazy" width="36" height="36" alt="" />
                  </div>
                  <div className="background-color-white border-top-1px flex-justify-center padding-y-2">
                    <div className="text-tiny" style={{padding: 5}}>
                      <a href={`https://www.googleapis.com/download/storage/v1/b/kmfi-945ef.appspot.com/o/${fileName}?generation=${storageId.toString().split('/').pop()}&alt=media`}> {originalFileName} </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div key={nanoid()} className="border-1px rounded-large">
                  <Flex className="background-color-4" justify="flex-end">
                    <CloseButton
                      size="sm"
                      isDisabled={btnLoad}
                      onClick={() => deleteDocuments(id)}
                    />
                  </Flex>
                  <div className="padding-y-4 flex-justify-center background-color-4">
                    <img src={fileImg} loading="lazy" width="36" height="36" alt="" />
                  </div>
                  <div className="background-color-white border-top-1px flex-justify-center padding-y-2">
                    <div className="text-tiny" style={{padding: 5}}>
                      <a href={`https://www.googleapis.com/download/storage/v1/b/kmfi-945ef.appspot.com/o/${fileName}?generation=${storageId.toString().split('/').pop()}&alt=media`}> {originalFileName} </a>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* <div className="border-1px rounded-large">
              <div className="padding-y-4 flex-justify-center background-color-4">
                <img src={videoZip} loading="lazy" width="36" height="36" alt="" />
              </div>
              <div className="background-color-white border-top-1px flex-justify-center padding-y-2">
                <div className="text-tiny">A Video file.mp4</div>
              </div>
            </div>
            <div className="border-1px rounded-large">
              <div className="padding-y-4 flex-justify-center background-color-4">
                <img src={musicZip} loading="lazy" width="36" height="36" alt="" />
              </div>
              <div className="background-color-white border-top-1px flex-justify-center padding-y-2">
                <div className="text-tiny">An Audio file.mp3</div>
              </div>
            </div> */}
          </div>
        )}
        {/* Pagination dots (visual only) */}
        <div className="flex-row-middle flex-justify-center margin-bottom-5">
          <div className="pagination-dot"></div>
          <div className="pagination-dot active"></div>
          <div className="pagination-dot active"></div>
        </div>
        {/* Upload instructions and file size limit notice */}
        <div className="fafafa rounded-large flex-space-between flex-row-middle padding-3">
          <div className="text-small text-color-body-text">
            Max file size for upload is 10mb. Supports most file types
          </div>
          {/* Uploader component allows file submission; refresh on upload completion */}
          <Uploader categoryId={categoryId} onComplete={refreshDocumentsHandler} />
        </div>
      </div>
    </div>
  );
};

Evidence.propTypes = {
  categoryId: propTypes.any,
  parentId: propTypes.any,
  companyId: propTypes.any
};

export default Evidence;
