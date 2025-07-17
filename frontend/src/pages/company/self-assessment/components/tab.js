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
import {useSelector} from 'react-redux';

/**
 * Tab component renders the UI and logic for a self-assessment subcategory.
 * It handles tier navigation, answer posting, and dynamic loading of questions and descriptors.
 *
 * @component
 * @param {Object} props - Component properties
 * @param {string} props.name - Title name of the assessment
 * @param {Object} props.selectedSubCat - The currently selected subcategory
 * @param {Function} props.setSelectedSubCat - Setter for selected subcategory
 * @param {Object} props.companyDetails - Details of the logged-in company
 * @param {boolean} props.finish - Whether the subcategory is completed
 * @param {Function} props.setFinish - Setter for subcategory completion
 * @param {Array} props.subCategories - List of all subcategories
 * @returns {JSX.Element} Rendered Tab UI with tier questions, evidence, and comments
 */
const Tab = ({
  name,
  selectedSubCat,
  setSelectedSubCat,
  companyDetails,
  finish,
  subCategories,
  setFinish
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
  const [totalPoints, setTotalPoints] = useState(0);
  const cycle = useSelector((state) => state.auth.cycle);


  // Move to the next subcategory or mark end if it's the last one
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

  // Navigate to the previous tier within the current subcategory
  const goBack = () => {
    setActiveTiers(tiers.filter((val) => val.sort_order === activeTiers.sort_order - 1)[0]);
  };

  // Submit the selected answer for the current tier and handle navigation/toast
  const postAnswer = async () => {
    setBtnLoad(true);
    try {
      // Build the payload based on selected tier and points
      const body = {
        'response': activeTiers.tier_constant === 'TIER_1' ? tierOneChoice : activeTiers.tier_constant === 'TIER_2' ? tierTwoChoice : activeTiers.tier_constant === 'TIER_3' ? tierThreeChoice : null,
        'category-id': selectedSubCat?.id,
        'tier': activeTiers?.tier_constant,
        'company-id': companyDetails.id,
        'points': totalPoints
      };
      const response = await request(true).post(`/sat/answers`, body);
      console.log('response', response);
      if (response.status == 200 && response.data.message == 'Answer successfully submitted.') {
        setTimeout(() => {
          console.log('Total Points', totalPoints);
        }
        , 1000);
      }

      setTierOneChoice(null);
      setTierTwoChoice(null);
      setTierThreeChoice(null);
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
      } +
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


  // Fetch all questions and tiers for the selected subcategory
  const getQuestions = async (type) => {
    try {
      const {data: res} = await request(true).post(`/questions?company_id=${companyDetails.id}`, {
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

  // Load questions when the selected subcategory changes
  useEffect(() => {
    getQuestions(1);
  }, [selectedSubCat]);

  // Filter and update questions when the active tier changes
  useEffect(() => {
    setTierQuestions(question.filter((val) => val.tier_id === activeTiers?.id));
  }, [activeTiers]);

  // Load questions when the selected subcategory changes
  useEffect(() => {
    getQuestions(1);
  }, [selectedSubCat]);

  // Main component UI including title, tier tabs, descriptors, and footer buttons
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
                  />{' '}
                  <Evidence categoryId={selectedSubCat?.id} parentId={selectedSubCat?.parent_id} companyId={companyDetails.id} tier={activeTiers?.tier_constant} />
                  <Comments categoryId={selectedSubCat?.id} parentId={selectedSubCat?.parent_id} companyId={companyDetails.id} cycle={cycle} tier={activeTiers?.tier_constant}/>
                </>
              ) : (
                ''
              )}
              <div className="sticky-bottom-0">
                <div className="background-color-white height-16 flex-row-middle flex-justify-end border-top-1px padding-x-10">
                  {/* Navigation buttons to go to the previous tier or post the current answer */}
                  <Button
                    disabled={activeTiers?.name === 'Tier 1'}
                    onClick={goBack}
                    className="button-secondary button-small margin-right-3 w-button"

                  >
                    Previous
                  </Button>
                  <Button isLoading={btnLoad} onClick={postAnswer} bg="#00B27A" color="white">
                    {tiers.length === 1
                      ? 'save and continue'
                      : activeTiers?.sort_order === 3
                        ? 'save and continue'
                        : 'Next'}
                  </Button>
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
  categoryId: proptypes.any,
  selectedSubCat: proptypes.any,
  companyDetails: proptypes.any,
  finish: proptypes.any,
  setFinish: proptypes.any,
  subCategories: proptypes.any,
  setSelectedSubCat: proptypes.any
};

export default Tab;
