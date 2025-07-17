import React, {useState, useEffect} from 'react';
import avatars from 'assets/images/Avatar Group (24px).svg';
import {request} from 'common';
import proptypes from 'prop-types';
import Comments from '../comments';
import Descriptor from '../descriptor';
import Evidence from '../evidence';
import {useToast, Flex, Spinner, Button} from '@chakra-ui/react';
import {nanoid} from '@reduxjs/toolkit';
import FinishAnswer from './finish-answer';
import InviteMember from 'pages/company/settings/components/inviteMember';

/**
 * Tab component handles the rendering and interaction logic for IVC self-assessment questions,
 * including tier switching, question retrieval, answer posting, and UI updates.
 *
 * @param {Object} props - React props
 * @param {string} props.name - The name/title of the tab section
 * @param {Object} props.selectedSubCat - The currently selected subcategory object
 * @param {Function} props.setSelectedSubCat - Setter to update selected subcategory
 * @param {boolean} props.finish - Boolean indicating if current section is completed
 * @param {Function} props.setFinish - Setter to update finish state
 * @param {Array} props.subCategories - List of all subcategories
 * @param {string|number} props.cycleId - ID of the current assessment cycle
 * @returns {JSX.Element} Tab rendered component
 */
const Tab = ({
  name,
  selectedSubCat,
  setSelectedSubCat,
  finish,
  subCategories,
  setFinish,
  cycleId,

}) => {
  const toast = useToast();
  const [question, setQuestion] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [tierQuestions, setTierQuestions] = useState([]);
  const [activeTiers, setActiveTiers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [endOfSubCat, setEndOfSubCat] = useState(false);
  const [btnLoad, setBtnLoad] = useState(false);
  const [tierOneChoice, setTierOneChoice] = useState(null);
  const [tierTwoChoice, setTierTwoChoice] = useState(null);
  const [tierThreeChoice, setTierThreeChoice] = useState(null);

  const [ivcTierOneChoice, setIVCTierOneChoice] = useState(null);
  const [ivcTierTwoChoice, setIVCTierTwoChoice] = useState(null);
  const [ivcTierThreeChoice, setIVCTierThreeChoice] = useState(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [didComment, setDidComment] = useState(false);
  const [isFullyMet, setIsFullyMet] = useState(false);

  const currentCompany = JSON.parse(localStorage.getItem('company'));

  // Move to the next subcategory in the list and reset finish state
  const moveToNext = () => {
    const index = subCategories.indexOf(selectedSubCat);
    if (index + 1 === subCategories.length - 1) {
      setSelectedSubCat(subCategories[index + 1]);
      setFinish(false);
      setEndOfSubCat(true);
    } else {
      setSelectedSubCat(subCategories[index + 1]);
      setFinish(false);
    }
  };

  // Move back to the previous tier in the same subcategory
  const goBack = () => {
    setActiveTiers(tiers.filter((val) => val.sort_order === activeTiers.sort_order - 1)[0]);
  };
  /**
   * Submit selected tier answer to the backend, update UI state and handle transitions.
   * Skips submission if response is undefined, and shows appropriate toast messages.
   *
   * @returns {Promise<void>}
   */
  const postAnswer = async () => {
    const currentCompany = JSON.parse(localStorage.getItem('company'));
    const companyID = currentCompany.brands.map((company) => company.company_id);
    setBtnLoad(true);
    try {
      const assessment = {
        'response': activeTiers.tier_constant === 'TIER_1' ? ivcTierOneChoice : activeTiers.tier_constant === 'TIER_2' ? ivcTierTwoChoice : activeTiers.tier_constant === 'TIER_3' ? ivcTierThreeChoice : body.response === undefined ? 'NOT_ASSESSED' : ''
      };

      const notAssessed = assessment.response === undefined ? 'NOT_ASSESSED' : '';
      const body = {
        'company-id': companyID[0],
        'category-id': selectedSubCat?.id,
        'tier': activeTiers?.tier_constant,
        'response': activeTiers.tier_constant === 'TIER_1' ? ivcTierOneChoice : activeTiers.tier_constant === 'TIER_2' ? ivcTierTwoChoice : activeTiers.tier_constant === 'TIER_3' ? ivcTierThreeChoice : 'response' === undefined ? notAssessed : '',
        'points': totalPoints
      };
      if (ivcTierOneChoice === undefined) {
        setActiveTiers(tiers.filter((val) => val.sort_order === activeTiers.sort_order + 1)[0]);
      } else {
        const response = await request(true).post(`/admin/ivc`, {
          'company-id': companyID[0],
          'category-id': selectedSubCat?.id,
          'tier': activeTiers?.tier_constant,
          'response': assessment.response === undefined ? 'NOT_ASSESSED' : activeTiers.tier_constant === 'TIER_1' ? ivcTierOneChoice : activeTiers.tier_constant === 'TIER_2' ? ivcTierTwoChoice : activeTiers.tier_constant === 'TIER_3' ? ivcTierThreeChoice : '',
          'points': totalPoints
        });
        console.log('response', response);
        if (response.status == 200 && response.data.message == 'Answer successfully submitted.') {
          setTotalPoints(response.data.points);
          setTimeout(() => {
            console.log('Total Points', totalPoints);
          }
          , 1000);
        }
        setIVCTierOneChoice(null);
        setIVCTierTwoChoice(null);
        setIVCTierThreeChoice(null);
        // }
        if (activeTiers.sort_order !== 3 && tiers.length !== 1) {
          setActiveTiers(tiers.filter((val) => val.sort_order === activeTiers.sort_order + 1)[0]);
        } else {
          setTotalPoints(0);
          toast({
            status: 'success',
            title: 'Progress saved',
            position: 'top-left',
            description: 'Progress saved please move to next subcategory',
            duration: 6000,
            isClosable: true,
          });
          localStorage.removeItem('TIER_1');
          localStorage.removeItem('TIER_2');
          localStorage.removeItem('TIER_3');
        }
      }

      if (ivcTierTwoChoice === undefined) {
        setActiveTiers(tiers.filter((val) => val.sort_order === activeTiers.sort_order + 1)[0]);
      } else {
        const response = await request(true).post(`/admin/ivc`, {
          'company-id': companyID[0],
          'category-id': selectedSubCat?.id,
          'tier': activeTiers?.tier_constant,
          'response': assessment.response === undefined ? 'NOT_ASSESSED' : activeTiers.tier_constant === 'TIER_1' ? ivcTierOneChoice : activeTiers.tier_constant === 'TIER_2' ? ivcTierTwoChoice : activeTiers.tier_constant === 'TIER_3' ? ivcTierThreeChoice : '',
          'points': totalPoints
        });
        if (response.status == 200 && response.data.message == 'Answer successfully submitted.') {
          setTotalPoints(response.data.points);
          setTimeout(() => {
            console.log('Total Points', totalPoints);
          }
          , 1000);
        }
        setIVCTierOneChoice(null);
        setIVCTierTwoChoice(null);
        setIVCTierThreeChoice(null);
        // }
        if (activeTiers.sort_order !== 3 && tiers.length !== 1) {
          setActiveTiers(tiers.filter((val) => val.sort_order === activeTiers.sort_order + 1)[0]);
        } else {
          setTotalPoints(0);
          toast({
            status: 'success',
            title: 'Progress saved',
            position: 'top-left',
            description: 'Progress saved please move to next subcategory',
            duration: 6000,
            isClosable: true,
          });
          localStorage.removeItem('TIER_1');
          localStorage.removeItem('TIER_2');
          localStorage.removeItem('TIER_3');
        }
      }

      if (ivcTierThreeChoice === undefined) {
        setActiveTiers(tiers.filter((val) => val.sort_order === activeTiers.sort_order + 1)[0]);
      } else {
        const response = await request(true).post(`/admin/ivc`, {
          'company-id': companyID[0],
          'category-id': selectedSubCat?.id,
          'tier': activeTiers?.tier_constant,
          'response': assessment.response === undefined ? 'NOT_ASSESSED' : activeTiers.tier_constant === 'TIER_1' ? ivcTierOneChoice : activeTiers.tier_constant === 'TIER_2' ? ivcTierTwoChoice : activeTiers.tier_constant === 'TIER_3' ? ivcTierThreeChoice : '',
          'points': totalPoints
        });
        if (response.status == 200 && response.data.message == 'Answer successfully submitted.') {
          setTotalPoints(response.data.points);
          setTimeout(() => {
            console.log('Total Points', totalPoints);
          }
          , 1000);
        }
        setIVCTierOneChoice(null);
        setIVCTierTwoChoice(null);
        setIVCTierThreeChoice(null);
        // }
        if (activeTiers.sort_order !== 3 && tiers.length !== 1) {
          setActiveTiers(tiers.filter((val) => val.sort_order === activeTiers.sort_order + 1)[0]);
        } else {
          setTotalPoints(0);
          toast({
            status: 'success',
            title: 'Progress saved',
            position: 'top-left',
            description: 'Progress saved please move to next subcategory',
            duration: 6000,
            isClosable: true,
          });
          localStorage.removeItem('TIER_1');
          localStorage.removeItem('TIER_2');
          localStorage.removeItem('TIER_3');
        }
      }
      activeTiers?.sort_order === 3 && setFinish(true);
      tiers.length === 1 && setFinish(true);
      setBtnLoad(false);
    } catch (error) {
      setBtnLoad(false);
      return toast({
        status: 'error',
        title: 'Error',
        position: 'top-left',
        description: 'Something went wrong',
        duration: 6000,
        isClosable: true,
      });
    }
  };

  /**
   * Fetch questions and tier definitions from the backend based on selected subcategory.
   * Updates tier, question, and loading state.
   *
   * @param {boolean} type - Whether to update loading state after fetch
   * @returns {Promise<void>}
   */
  const getQuestions = async (type) => {
    try {
      const {data: res} = await request(true).post(`/questions?company_id=${currentCompany.id}`, {
        categoryIds: [selectedSubCat?.id],
      });

      const questions = res.questions;
      const tiersArray = Object.values(res.tiers);
      setTiers(tiersArray.filter((val) => val));
      setActiveTiers(tiersArray[0]);
      setQuestion(questions);
      setTierQuestions(questions.filter((val) => val.tier_id === tiersArray[0]?.id));
      type && setLoading(false);
    } catch (error) {
      type && setLoading(false);
      return toast({
        status: 'error',
        title: 'Error',
        position: 'top-left',
        description: 'Something went wrong',
        duration: 6000,
        isClosable: true,
      });
    }
  };


  // Set whether the user has added a comment
  const setDidCommentHandler = (didComment) => {
    setDidComment(didComment);
  };
  // Fetch questions when selectedSubCat changes
  useEffect(() => {
    getQuestions(1);
  }, [selectedSubCat]);

  // Update tier questions when activeTiers changes
  useEffect(() => {
    setTierQuestions(question.filter((val) => val.tier_id === activeTiers?.id));
  }, [activeTiers]);

  // Refetch questions when selectedSubCat changes (duplicate effect)
  useEffect(() => {
    getQuestions(1);
  }, [selectedSubCat]);

  return (
    <div
      className="padding-x-0 background-secondary border-left-1px w-col w-col-7"
      style={{width: '100%'}}
    >
      <div className="flex-row-middle flex-space-between padding-x-10 padding-y-4 border-bottom-1px height-20 background-color-white sticky-top-0">
        <div>
          <h6 className="margin-bottom-1">{name}</h6>
          <div className="text-small">{selectedSubCat?.name}</div>
        </div>
        <div className="flex-space-between flex-row-middle">
          <img src={avatars} loading="lazy" height="32" alt="" className="margin-right-3" />
          <a
            onClick={() => setShowModal(!showModal)}
            className="button-secondary button-small w-button"
          >
            Add member
          </a>
        </div>
      </div>
      {finish ? (
        <FinishAnswer moveToNext={moveToNext} endOfSubCat={endOfSubCat} />
      ) : selectedSubCat?.id ? (
        <>
          {loading ? (
            <Flex height="100%" width="100%" mb="10" justifyContent="center" alignItems="center">
              <Spinner />
            </Flex>
          ) : tiers.length <= 0 ? (
            <Flex height="100%" width="100%" mb="10" justifyContent="center" alignItems="center">
              <Spinner />
            </Flex>
          ) : (
            <>
              <div data-duration-in="300" data-duration-out="100" className="w-tabs">
                <div className="flex-row-middle padding-x-10 background-color-white border-bottom-1px sticky-top-0 sticky-80px w-tab-menu">
                  {tiers.map((val) => (
                    <a
                      key={nanoid()}
                      data-w-tab="Account"
                      onClick={() => setActiveTiers(val)}
                      className={`tab-link width-auto padding-x-4 w-inline-block w-tab-link ${activeTiers?.id === val.id && 'w--current'
                      }`}
                    >
                      <div className="text-small">{val.name}</div>
                    </a>
                  ))}
                </div>
              </div>
              <div className="padding-x-10 margin-top-8 margin-bottom-5">
                <div>
                  <div className="padding-bottom-5 border-bottom-1px">
                    <h4 className="margin-bottom-2">
                      {name} - {selectedSubCat?.name}
                    </h4>
                    <div className="text-base medium text-color-body-text">
                      {selectedSubCat?.sub_title}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="margin-top-5">{selectedSubCat?.description}</div>
                </div>
              </div>
              {selectedSubCat?.id ? (
                <>
                  <Descriptor
                    categoryId={selectedSubCat?.id}
                    parentId={selectedSubCat?.parent_id}
                    tierQuestions={tierQuestions}
                    activeTiers={activeTiers}
                    tierOneChoice={tierOneChoice}
                    setTierOneChoice={(val) => setTierOneChoice(val)}
                    tierTwoChoice={tierTwoChoice}
                    setTierTwoChoice={(val) => setTierTwoChoice(val)}
                    tierThreeChoice={tierThreeChoice}
                    setTierThreeChoice={(val) => setTierThreeChoice(val)}
                    ivcTierOneChoice={ivcTierOneChoice}
                    setIVCTierOneChoice={(val) => {
                      setIVCTierOneChoice(val); setIsFullyMet(val === 'FULLY_MET');
                    }}
                    ivcTierTwoChoice={ivcTierTwoChoice}
                    setIVCTierTwoChoice={(val) => {
                      setIVCTierTwoChoice(val); setIsFullyMet(val === 'FULLY_MET');
                    }}
                    ivcTierThreeChoice={ivcTierThreeChoice}
                    setIVCTierThreeChoice={(val) => {
                      setIVCTierThreeChoice(val); setIsFullyMet(val === 'FULLY_MET');
                    }}
                    cycleId={cycleId}
                  />{' '}
                  <Evidence categoryId={selectedSubCat?.id} parentId={selectedSubCat?.parent_id} tier={activeTiers?.tier_constant} />
                  <Comments categoryId={selectedSubCat?.id} parentId={selectedSubCat?.parent_id} tier={activeTiers?.tier_constant} didComment={setDidCommentHandler} />
                </>
              ) : (
                ''
              )}
              <div className="sticky-bottom-0">
                <div className="background-color-white height-16 flex-row-middle flex-justify-end border-top-1px padding-x-10">
                  <Button
                    onClick={goBack}
                    className="button-secondary button-small margin-right-3 w-button"
                  >
                    Previous
                  </Button>
                  {(isFullyMet || didComment) ? (
                    <Button isLoading={btnLoad} onClick={postAnswer} bg="#00B27A" color="white" >
                      {tiers.length === 1
                        ? 'save and continue'
                        : activeTiers?.sort_order === 3
                          ? 'save and continue'
                          : 'next'}
                    </Button>
                  ) : (
                    <Button isLoading={btnLoad} onClick={postAnswer} bg="#00B27A" color="white" disabled >
                      {tiers.length === 1
                        ? 'save and continue'
                        : activeTiers?.sort_order === 3
                          ? 'save and continue'
                          : 'next'}
                    </Button>
                  )
                  }

                </div>
              </div>
            </>
          )}
          <InviteMember showInviteModal={showModal} setShowInviteModal={setShowModal} />
        </>
      ) : (
        ''
      )}
    </div>
  );
};

Tab.propTypes = {
  name: proptypes.string,
  selectedSubCat: proptypes.any,
  finish: proptypes.any,
  setFinish: proptypes.any,
  subCategories: proptypes.any,
  setSelectedSubCat: proptypes.any,
  cycleId: proptypes.any,
};

export default Tab;
