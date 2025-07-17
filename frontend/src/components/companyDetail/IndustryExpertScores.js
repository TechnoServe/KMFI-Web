import React, {useState} from 'react';
import propTypes from 'prop-types';
import {useDisclosure, Box} from '@chakra-ui/react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalBody,
  useToast,
  Flex,
  Spinner
} from '@chakra-ui/react';
import 'styles/webflow.css';
import 'styles/mfi-tns.webflow.css';
import 'styles/normalize.css';
import IndustryModalHeader from './IndustryModalHeader';

import {request} from 'common';

/**
 * IndustryExpertScores displays and edits Industry Expert Group (IEG) scores for a company.
 * It allows viewing score history and submitting updated IEG scores via modal dialogs.
 *
 * @param {Object} props - Component props
 * @param {Array} props.score - Array of existing IEG score objects
 * @param {Object} props.company - Company object containing brand data for ID extraction
 * @returns {JSX.Element} Component with score display and modal interfaces
 */
const IndustryExpertScores = ({score, company}) => {
  const companyId = company?.brands.map((x) => x.company_id);
  const {isOpen, onOpen, onClose} = useDisclosure();
  const {isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose} = useDisclosure();
  const [, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState([
    {
      company_id: companyId[0],
      category_id: 'cLAomX2miF601colFBvC',
      cycle_id: 'vJqDawZlrKNHsMIW9G2s',
      type: 'IEG',
      value: 0,
      weight: 15
    },
    {
      company_id: companyId[0],
      category_id: 'Q9fYFc9CfTb9GIuJ1U0j',
      cycle_id: 'vJqDawZlrKNHsMIW9G2s',
      type: 'IEG',
      value: 0,
      weight: 25
    },
    {
      company_id: companyId[0],
      category_id: '1nct2tfnXhO3JDtJ27qn',
      cycle_id: 'vJqDawZlrKNHsMIW9G2s',
      type: 'IEG',
      value: 0,
      weight: 25
    },
    {
      company_id: companyId[0],
      category_id: 'DDjEmOJlIbpkwOXgW5hq',
      cycle_id: 'vJqDawZlrKNHsMIW9G2s',
      type: 'IEG',
      value: 0,
      weight: 10
    },
    {
      company_id: companyId[0],
      category_id: '3dUyBma0JsHXcRPdwNyi',
      cycle_id: 'vJqDawZlrKNHsMIW9G2s',
      type: 'IEG',
      value: 0,
      weight: 25
    }
  ]);


  /**
   * Updates score value in state when input changes.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} evt - Input event object
   * @returns {void}
   */
  const onInputValueChange = (evt) => {
    const newArr = [...scores];
    const value = Number(evt.target.value);
    newArr[evt.target.dataset.id][evt.target.name] = value;
    setScores(newArr);
  };

  const toast = useToast();

  /**
   * Fetches the list of assessment categories from the backend.
   *
   * @returns {Promise<void>} Resolves after data fetch and state update
   */
  const getCategories = async () => {
    setLoading(true);
    try {
      const res = await request(true).get(`/questions/categories/modal`);
      setCategories(res.data);
      setLoading(false);
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

  /**
   * Submits the updated IEG scores to the backend and triggers a page reload.
   *
   * @param {React.FormEvent} e - Form submit event
   * @returns {Promise<void>} Resolves after API call and reload
   */
  const setIEGScores = async (e) => {
    e.preventDefault();
    try {
      const toSend = [];
      for (let i = 0; i < scores.length; i++) {
        const tr = {
          company_id: scores[i].company_id,
          category_id: scores[i].category_id,
          cycle_id: 'vJqDawZlrKNHsMIW9G2s',
          type: 'IEG',
          value: scores[i].value,
          weight: scores[i].weight
        };
        toSend.push(tr);
      }
      await request(true).post(`assessments/ieg`, toSend);
      // setScores(res.data);
      localStorage.removeItem('company-list');
      setTimeout(function() {
        // body...
        location.reload();
      }, 2000);
      return toast({
        status: 'success',
        title: 'Success',
        position: 'top-right',
        description: '',
        duration: 6000,
        isClosable: true,
      });
    } catch (error) {
      console.log(error);
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
   * Filters a list of score objects by unique values of a category property.
   *
   * @param {Array} score - Array of score objects
   * @param {string} key - Key in the nested category object to deduplicate by
   * @returns {Array} Array of unique score objects
   */
  const unique = function getUniqueListBy(score, key) {
    return [...new Map(score.map((item) => [item.category[key], item])).values()];
  };

  const arr1 = unique(score, 'description');

  return (
    <Box fontFamily="DM Sans">
      <div className="flex flex-row-middle flex-align-baseline width-full tablet-flex-column">
        <div className="flex-child-grow tablet-width-full" >
          <div className="width-full">

            <div className="flex-justify-end margin-bottom-4 items-center tablet-width-full portrait-flex-justify-start">
              {/* Display the total combined weighted IEG score */}
              <div className="text-small margin-right-4 flex-child-grow portrait-width-full portrait-margin-right-0">
                {((arr1.reduce((accum, item) => accum + item.value, 0))).toFixed(2)}%</div>
              <div onClick={getCategories} className="flex justify-end">
                <button className="button-secondary button-small margin-right-3 w-button" onClick={onOpen}> Edit </button>
              </div>
            </div>

            <div className="flex-justify-end margin-bottom-4 items-center tablet-width-full portrait-flex-justify-start">

              <div className="flex justify-end">
                <button className="button-secondary button-small margin-right-3 w-button" onClick={onViewOpen}> View History </button>
              </div>
            </div>
          </div>
        </div>
        {/* Modal for viewing score history */}
        <Modal isOpen={isViewOpen} onClose={onViewClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <div className="background-color-white border-1px box-shadow-large rounded-large width-128 h-screen overflow-scroll">
              <IndustryModalHeader title="IEG Scores History" />
              {loading ? (
                <Flex height="100%" width="100%" mb="10" justifyContent="center" alignItems="center">
                  <Spinner />
                </Flex>
              ) : score?.map((item, i) => (
                <div key={item.id}>
                  <ModalBody >
                    <Box fontFamily="DM Sans" >
                      <div className="padding-bottom-6 border-bottom-1px w-form">
                        <form>
                          {/* Render form section for each IEG category score */}
                          <div className="text-base weight-medium margin-bottom-2">
                            {item.category.name}
                          </div>
                          <p className="text-small text-color-body-text">
                            {item.category.name}
                          </p>
                          <div>
                            <div className="w-layout-grid grid-3-columns padding-4 rounded-large background-secondary margin-top-5">
                              <div>
                                <label htmlFor="email-4" className="form-label small">Weighting(%)</label>
                                <input
                                  type="text"
                                  className="form-input margin-bottom-0 w-input"
                                  disabled
                                  maxLength="256"
                                  placeholder="20%"
                                  value={`${item.weight}%`}
                                />
                              </div>
                              <div>
                                <label htmlFor="email-4" className="form-label small">Scores</label>
                                <input
                                  type="number"
                                  className="form-input margin-bottom-0 w-input"
                                  maxLength="256"
                                  placeholder=""
                                  required=""
                                  name="value"
                                  value={item.value === 0 ? '' : item.value}
                                  data-id={i}
                                  disabled
                                  autoFocus
                                />
                              </div>
                              <div>
                                <label htmlFor="email-4" className="form-label small">Weighted</label>
                                {/* Display calculated weighted score = value * weight / 100 */}
                                <input
                                  type="text"
                                  className="form-input margin-bottom-0 w-input"
                                  disabled
                                  placeholder="20%"
                                  required=""
                                  value={`${item.value*(item.weight/100)}%`}
                                />
                              </div>
                            </div>
                          </div>
                        </form>
                      </div>
                    </Box>
                  </ModalBody>
                </div>
              ))}
              <ModalFooter className="padding-y-3 padding-x-4 flex-justify-end background-secondary border-top-1px rounded-large bottom sticky-bottom-0">
                <div >
                  <a href="#" className="button-secondary button-small margin-right-3 w-button">Close</a>
                </div>
              </ModalFooter>
            </div>
          </ModalContent>
        </Modal>
        {/* Modal for inputting new IEG scores */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <div className="background-color-white border-1px box-shadow-large rounded-large width-128 h-screen overflow-scroll">
              <IndustryModalHeader title="Input IEG Scores" />
              {loading ? (
                <Flex height="100%" width="100%" mb="10" justifyContent="center" alignItems="center">
                  <Spinner />
                </Flex>
              ) : scores?.map((item, i) => (
                <div key={item.id}>
                  <ModalBody >
                    <Box fontFamily="DM Sans" >
                      <div className="padding-bottom-6 border-bottom-1px w-form">
                        <form>
                          {/* Render form section for each IEG category score */}
                          {/* Dynamically label the category based on its index */}
                          <div className="text-base weight-medium margin-bottom-2">
                            {i === 0 ? 'People Management Systems'
                              : i === 1 ? 'Production, Continuous Impovement & Innovation'
                                : i === 2 ? 'Procurement & Inputs Management'
                                  : i === 3 ? 'Public Engagement'
                                    : i === 4 ? 'Governance & Leadership Culture' : ''
                            }
                          </div>
                          <p className="text-small text-color-body-text">
                            {i === 0 ? 'People Management Systems'
                              : i === 1 ? 'Production, Continuous Impovement & Innovation'
                                : i === 2 ? 'Procurement & Inputs Management'
                                  : i === 3 ? 'Public Engagement'
                                    : i === 4 ? 'Governance & Leadership Culture' : ''
                            }
                          </p>
                          <div>
                            <div className="w-layout-grid grid-3-columns padding-4 rounded-large background-secondary margin-top-5">
                              <div>
                                <label htmlFor="email-4" className="form-label small">Weighting(%)</label>
                                <input
                                  type="text"
                                  className="form-input margin-bottom-0 w-input"
                                  disabled
                                  maxLength="256"
                                  placeholder="20%"
                                  value={`${item.weight}%`}
                                />
                              </div>
                              <div>
                                <label htmlFor="email-4" className="form-label small">Scores</label>
                                <input
                                  type="number"
                                  className="form-input margin-bottom-0 w-input"
                                  maxLength="256"
                                  placeholder=""
                                  required=""
                                  name="value"
                                  value={item.value === 0 ? '' : item.value}
                                  data-id={i}
                                  onChange={onInputValueChange}
                                  autoFocus
                                />
                              </div>
                              <div>
                                <label htmlFor="email-4" className="form-label small">Weighted</label>
                                {/* Display calculated weighted score = value * weight / 100 */}
                                <input
                                  type="text"
                                  className="form-input margin-bottom-0 w-input"
                                  disabled
                                  placeholder="20%"
                                  required=""
                                  value={`${item.value*(item.weight/100)}%`}
                                />
                              </div>
                            </div>
                          </div>
                        </form>
                      </div>
                    </Box>
                  </ModalBody>
                </div>
              ))}
              <ModalFooter className="padding-y-3 padding-x-4 flex-justify-end background-secondary border-top-1px rounded-large bottom sticky-bottom-0">
                <div>
                  <a href="#" className="button-secondary button-small margin-right-3 w-button">Cancel</a>

                  <button disabled={loading === true} onClick={setIEGScores} className="button button-small w-button">Save</button>
                </div>
              </ModalFooter>
            </div>
          </ModalContent>
        </Modal>
      </div>
    </Box>
  );
};

IndustryExpertScores.propTypes = {
  score: propTypes.any,
  company: propTypes.any,
  // product: propTypes.any,
};

export default IndustryExpertScores;
