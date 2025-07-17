import React, {useEffect, useState} from 'react';
import fileZip from 'assets/images/tabler_file-zipThumbnail.svg';
import propTypes from 'prop-types';
import {request} from 'common';
import {Flex, CloseButton, Spinner} from '@chakra-ui/react';
import {Uploader} from '../../../components/uploader';
import {getCurrentCompany} from '../../../utills/helpers';

/**
 * Evidence component handles display and upload of supporting documents
 * for a specific self-assessment category and tier.
 *
 * @param {Object} props - Component props
 * @param {string|number} props.categoryId - ID of the assessment category
 * @param {string} [props.tier='TIER_1'] - Assessment tier (defaults to 'TIER_1')
 * @returns {JSX.Element} Evidence upload section UI
 */
const Evidence = ({categoryId, tier = 'TIER_1'}) => {
  const [loading, setLoading] = useState(true);
  const [btnLoad, setBtnLoad] = useState(false);
  const [docs, setDocs] = useState([]);
  const currentCompany = getCurrentCompany();
  const {id: companyId} = currentCompany;

  /**
   * Fetches documents for the given category and tier.
   *
   * @param {boolean} type - Used to determine whether to toggle loading spinner
   * @returns {Promise<void>}
   */
  const getDocuments = async (type) => {
    type && setLoading(true);
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

  /**
   * Deletes a document by its ID and refreshes the document list.
   *
   * @param {string|number} id - Document ID to delete
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
   * Refresh handler to reload documents list.
   *
   * @returns {void}
   */
  const refreshDocumentsHandler = () => {
    // refresh
    getDocuments(1); // ???
  };

  useEffect(() => {
    // Load documents on mount and when categoryId or tier changes
    getDocuments(1);
  }, [categoryId, tier]);

  // Main render output for Evidence component
  return (
    <div className="padding-x-10 padding-bottom-6 border-bottom-1px">
      <div className="padding-top-6 padding-bottom-4">
        <div className="text-sub-header">Evidence descriptor</div>
      </div>
      <div className="background-color-white border-1px rounded-large padding-5">
        <div className="flex-row-middle flex-space-between margin-bottom-5">
          <h6 className="margin-bottom-0 weight-medium">Add supporting evidence</h6>
        </div>
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
            {docs.map((x) =>
              <div key={x.id} className="border-1px rounded-large">
                <Flex className="background-color-4" justify="flex-end">
                  <CloseButton
                    size="sm"
                    isDisabled={btnLoad}
                    onClick={() => deleteDocuments(x.id)} // delete selected document
                  />
                </Flex>
                <div className="padding-y-4 flex-justify-center background-color-4">
                  <img src={fileZip} loading="lazy" width="36" height="36" alt="" />
                </div>
                <div style={{cursor: 'pointer'}} className="background-color-white border-top-1px flex-justify-center padding-y-2">
                  <div className="text-tiny" style={{padding: 5}}>
                    <a href={`https://www.googleapis.com/download/storage/v1/b/kmfi-945ef.appspot.com/o/${x.file_name}?generation=${x.storage_id.toString().split('/').pop()}&alt=media`}> {x.original_file_name} </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="flex-row-middle flex-justify-center margin-bottom-5">
          <div className="pagination-dot"></div>
          <div className="pagination-dot active"></div>
          <div className="pagination-dot active"></div>
        </div>
        <div className="fafafa rounded-large flex-space-between flex-row-middle padding-3">
          <div className="text-small text-color-body-text">
            Max file size for upload is 10mb. Supports most file types
          </div>
          {/* File uploader component with completion handler to refresh document list */}
          <Uploader companyId={companyId} categoryId={categoryId} onComplete={refreshDocumentsHandler} tier={tier} />
        </div>
      </div>
    </div>
  );
};

Evidence.propTypes = {
  categoryId: propTypes.any,
  parentId: propTypes.any,
  tier: propTypes.any,
};

export default Evidence;
