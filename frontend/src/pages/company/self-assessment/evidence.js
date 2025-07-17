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
 * Evidence component displays and manages uploaded supporting documents
 * related to a specific assessment category and tier for a company.
 * Allows uploading and deletion of files and displays them by type.
 *
 * @component
 * @param {Object} props - Component properties
 * @param {string} props.categoryId - ID of the current assessment category
 * @param {string} props.companyId - ID of the company submitting the assessment
 * @param {string} [props.tier='TIER_1'] - Assessment tier identifier
 * @returns {JSX.Element} The rendered Evidence upload and list component
 */
const Evidence = ({categoryId, companyId, tier = 'TIER_1'}) => {
  const [loading, setLoading] = useState(true);
  const [btnLoad, setBtnLoad] = useState(false);
  const [docs, setDocs] = useState([]);

  // Fetch documents for a specific category, company, and tier
  const getDocuments = async (type) => {
    type && setLoading(true);
    try {
      const {data: res} = await request(true).get(`/documents/list/category/${categoryId}?company_id=${companyId}&tier=${tier}`);
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

  // Delete a specific document by ID and refresh document list
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

  // Handler to trigger re-fetching of uploaded documents
  const refreshDocumentsHandler = () => {
    // refresh
    getDocuments(1);
  };

  // On component mount or when categoryId/tier changes, fetch documents
  useEffect(() => {
    getDocuments(1);
  }, [categoryId, tier]);

  return (
    <div className="padding-x-10 padding-bottom-6 border-bottom-1px">
      <div className="padding-top-6 padding-bottom-4">
        <div className="text-sub-header">Evidence descriptor</div>
      </div>
      <div className="background-color-white border-1px rounded-large padding-5">
        <div className="flex-row-middle flex-space-between margin-bottom-5">
          <h6 className="margin-bottom-0 weight-medium">Add supporting evidence</h6>
        </div>
        {/* Render spinner while loading, otherwise show document grid */}
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
            {/* Render each document preview based on content type (PDF, image, other) */}
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
          </div>
        )}
        {/* Static pagination dot indicators (decorative only) */}
        <div className="flex-row-middle flex-justify-center margin-bottom-5">
          <div className="pagination-dot"></div>
          <div className="pagination-dot active"></div>
          <div className="pagination-dot active"></div>
        </div>
        <div className="fafafa rounded-large flex-space-between flex-row-middle padding-3">
          <div className="text-small text-color-body-text">
            Max file size for upload is 10mb. Supports most file types
          </div>
          {/* Upload component allowing users to add new evidence */}
          <Uploader categoryId={categoryId} onComplete={refreshDocumentsHandler} tier={tier} />
        </div>
      </div>
    </div>
  );
};

Evidence.propTypes = {
  categoryId: propTypes.string,
  parentId: propTypes.string,
  companyId: propTypes.string,
  tier: propTypes.string,
};

export default Evidence;
