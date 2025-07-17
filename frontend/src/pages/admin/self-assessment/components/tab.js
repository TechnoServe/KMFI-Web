import React, {useState, useEffect} from 'react';
import {request} from 'common';
import proptypes from 'prop-types';
import Descriptor from '../descriptor';
import {useToast, Flex, Spinner, Button, Input} from '@chakra-ui/react';
import {nanoid} from '@reduxjs/toolkit';
import FinishAnswer from './finish-answer';

/**
 * Tab component that manages and renders the tiered question/answer UI within the self-assessment admin page.
 * Allows editing of sub-category and parent category metadata, handles navigation between tiers, and submits responses.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.mParent - The currently selected parent category
 * @param {number} props.mWeight - The weight assigned to the current parent category
 * @param {Array} props.parentCategories - List of all parent categories for selection
 * @param {string} props.name - Name of the parent category
 * @param {Object} props.selectedSubCat - The currently selected sub-category
 * @param {Function} props.setSelectedSubCat - Function to update selected sub-category
 * @param {boolean} props.finish - Flag indicating whether current sub-category is finished
 * @param {Array} props.subCategories - All sub-categories under the current parent
 * @param {Function} props.setFinish - Function to toggle finished state
 * @returns {JSX.Element}
 */
const Tab = ({
  mParent,
  mWeight,
  parentCategories,
  name,
  selectedSubCat,
  setSelectedSubCat,
  finish,
  subCategories,
  setFinish,
}) => {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [question, setQuestion] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [tierQuestions, setTierQuestions] = useState([]);
  const [activeTiers, setActiveTiers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [endOfSubCat, setEndOfSubCat] = useState(false);
  const [btnLoad, setBtnLoad] = useState(false);
  // const [choice, setChoice] = useState(null);
  const [tierOneChoice, setTierOneChoice] = useState(null);
  const [tierTwoChoice, setTierTwoChoice] = useState(null);
  const [tierThreeChoice, setTierThreeChoice] = useState(null);
  const [subCatName, setSubCatName] = useState(null);
  const [subTitle, setSubTitle] = useState(null);
  const [description, setDescription] = useState(null);
  const [parent, setParent] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const [weight, setWeight] = useState(null);
  const [mName, setName] = useState(null);

  /**
   * Move to the next sub-category in the list.
   * Sets finish flag and handles last sub-category check.
   */
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

  /**
   * Move to the previous tier in the sequence.
   */
  const goBack = () => {
    setActiveTiers(tiers.filter((val) => val.sort_order === activeTiers.sort_order - 1)[0]);
  };

  /**
   * Posts the selected answers for the current tier and moves to the next tier.
   * Displays toast for success/failure.
   *
   * @returns {Promise<void>}
   */
  const postAnswer = async () => {
    setBtnLoad(true);
    try {
      setTierOneChoice(null);
      setTierTwoChoice(null);
      setTierThreeChoice(null);
      if (activeTiers.sort_order !== 3 && tiers.length !== 1) {
        setActiveTiers(tiers.filter((val) => val.sort_order === activeTiers.sort_order + 1)[0]);
        // console.log('setChoice', tiers.filter((val) => val.sort_order === activeTiers.sort_order + 1)[0]);
      } else {
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


  /**
   * Fetches questions and tiers based on selected sub-category.
   * Updates local state with the question/tier data.
   *
   * @param {boolean} type - If true, shows loading spinner
   * @returns {Promise<void>}
   */
  const getQuestions = async (type) => {
    try {
      const {data: res} = await request(true).post(`/questions/admin`, {
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

  useEffect(() => {
    setName(name); // Sync prop name to local mName state
  }, [name]);

  useEffect(() => {
    setWeight(mWeight); // Sync prop mWeight to local weight state
  }, [mWeight]);

  useEffect(() => {
    setParent(selectedSubCat?.parent_id); // Update parent ID when selected sub-category changes
  }, [selectedSubCat?.parent_id]);

  useEffect(() => {
    setSortOrder(selectedSubCat?.sort_order); // Update sort order when selected sub-category changes
  }, [selectedSubCat?.sort_order]);

  useEffect(() => {
    setSubCatName(selectedSubCat?.name); // Update name when selected sub-category changes
  }, [selectedSubCat?.name]);

  useEffect(() => {
    setSubTitle(selectedSubCat?.sub_title); // Update subtitle when selected sub-category changes
  }, [selectedSubCat?.sub_title]);

  useEffect(() => {
    setDescription(selectedSubCat?.description); // Update description when selected sub-category changes
  }, [selectedSubCat?.description]);

  useEffect(() => {
    setCategories(parentCategories); // Update dropdown options when parentCategories change
  }, [parentCategories]);

  useEffect(() => {
    getQuestions(1); // Reload questions when sub-category changes
  }, [selectedSubCat]);

  useEffect(() => {
    setTierQuestions(question.filter((val) => val.tier_id === activeTiers?.id)); // Sync tierQuestions when activeTiers changes
  }, [activeTiers]);

  useEffect(() => {
    getQuestions(1); // Reload questions when sub-category changes
  }, [selectedSubCat]);

  /**
   * Handles parent category change event from dropdown.
   *
   * @param {Event} evt - Change event from select element
   */
  const onParentChange = (evt) => {
    setParent(evt.target.value);
  };

  /**
   * Sends update request for sub-category details to backend.
   * Triggers reload and shows toast.
   *
   * @returns {Promise<void>}
   */
  const updateCategory = async () => {
    setBtnLoad(true);
    try {
      const updateBody = {
        'id': selectedSubCat?.id,
        'sort-order': sortOrder,
        'parent-id': parent,
        'sub-cat-name': subCatName,
        'sub-title': subTitle,
        'description': description

      };
      await request(true).post(`/questions/category/update`, updateBody);
      setBtnLoad(false);
      setTimeout(function() {
        // body...
        location.reload();
      }, 1000);
      return toast({
        status: 'success',
        title: 'Success',
        position: 'bottom-right',
        description: 'Category Updated Successfully',
        duration: 6000,
        isClosable: true,
      });
    } catch (error) {
      console.log(error);
      setBtnLoad(false);
      return toast({
        status: 'error',
        title: 'Error',
        position: 'bottom-right',
        description: 'Something went wrong',
        duration: 6000,
        isClosable: true,
      });
    }
  };

  /**
   * Sends update request for parent category name and weight.
   * Triggers reload and shows toast.
   *
   * @returns {Promise<void>}
   */
  const updateParentCategory = async () => {
    setBtnLoad(true);
    try {
      const updateBody = {
        'id': mParent?.id,
        'weight': weight,
        'name': mName,
      };
      await request(true).post(`/questions/category/parent/update`, updateBody);
      setBtnLoad(false);
      setTimeout(function() {
        // body...
        location.reload();
      }, 1000);
      return toast({
        status: 'success',
        title: 'Success',
        position: 'bottom-right',
        description: 'Parent category Updated Successfully',
        duration: 6000,
        isClosable: true,
      });
    } catch (error) {
      console.log(error);
      setBtnLoad(false);
      return toast({
        status: 'error',
        title: 'Error',
        position: 'bottom-right',
        description: 'Something went wrong',
        duration: 6000,
        isClosable: true,
      });
    }
  };

  return (
    <div
      className="padding-x-0 background-secondary border-left-1px w-col w-col-7"
      style={{width: '100%'}}
    >
      <div className="flex-row-middle flex-space-between padding-x-10 padding-y-4 border-bottom-1px height-20 background-color-white sticky-top-0">
        <div className="margin-bottom-1 flex-space-between flex-row-middle">
          <input
            style={{padding: '5px 10px', marginRight: '10px', marginLeft: '10px', borderColor: 'green', borderWidth: '1px', borderStyle: 'solid', borderRadius: '5px'}}
            type="text"
            id="iName"
            value={mName}
            onChange={(e) => setName(e.target.value)}/>
          <h6> - Weight: </h6>
          <input
            style={{padding: '5px 10px', marginRight: '10px', marginLeft: '10px', borderColor: 'green', borderWidth: '1px', borderStyle: 'solid', borderRadius: '5px'}}
            type="number"
            id="iWeight"
            value={weight}
            onChange={(e) => setWeight(parseInt(e.target.value))}/>
          <Button
            _focus={{outline: 'none'}}
            isLoading={btnLoad}
            onClick={updateParentCategory}
            bg="#00B27A"
            color="white"
            p="2"
            alignSelf="center"
          >
            Update Category & Weight
          </Button>
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
                    <div>
                      <label htmlFor="parent" className="form-label">
                      Parent
                      </label>
                      <select
                        name="parent"
                        className="small w-input"
                        style={{width: 300}}
                        value={parent}
                        onChange={onParentChange}
                        required
                      >
                        {categories.map((i) => {
                          return (i.name==name) ? (
                            <option selected key={i.id} value={i.id} >
                              {i.name}
                            </option>
                          ) :
                              (<option key={i.id} value={i.id} >
                                {i.name}
                              </option>);
                        }

                        )}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="iSortOrder" className="form-label">
                      Sort Order
                      </label>
                      <input
                        style={{padding: '10px'}}
                        type="number"
                        id="iSortOrder"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(parseInt(e.target.value))}/>
                    </div>
                    <div>
                      <label htmlFor="iSubCatName" className="form-label">
                      Name
                      </label>
                      <div className="form-input small flex-row-middle flex-space-between">
                        <Input
                          id="iSubCatName"
                          border="none"
                          height="2rem"
                          value={subCatName}
                          onChange={(e) => setSubCatName(e.target.value)}
                          _focus={{outline: 'none', border: 'none'}}
                          className="text-small text-color-body-text"
                        />
                      </div>
                    </div>

                    <div className="text-base medium text-color-body-text">
                      <label htmlFor="iSubTitle" className="form-label">
                      Sub Title
                      </label>
                      <div className="form-input small flex-row-middle flex-space-between">
                        <Input
                          id="iSubTitle"
                          border="none"
                          height="2rem"
                          value={subTitle}
                          onChange={(e) => setSubTitle(e.target.value)}
                          _focus={{outline: 'none', border: 'none'}}
                          className="text-small text-color-body-text"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="margin-top-5">
                    <label htmlFor="iDescription" className="form-label">
                  Description
                    </label>
                    <textarea
                      style={{padding: '10px'}}
                      onChange={(e) => setDescription(e.target.value)}
                      id="iDescription"
                      name="iDescription"
                      rows="4"
                      cols="80">
                      {description}
                    </textarea>
                  </div>
                </div>
                <Button
                  _focus={{outline: 'none'}}
                  isLoading={btnLoad}
                  onClick={updateCategory}
                  bg="#00B27A"
                  color="white"
                  p="2"
                  alignSelf="center"
                >
                  Update Category
                </Button>
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
                </>
              ) : (
                ''
              )}
              <div className="sticky-bottom-0">
                <div className="background-color-white height-16 flex-row-middle flex-justify-end border-top-1px padding-x-10">
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
        </>
      ) : (
        ''
      )}
    </div>
  );
};

Tab.propTypes = {
  mParent: proptypes.any,
  mWeight: proptypes.any,
  parentCategories: proptypes.any,
  name: proptypes.string,
  categoryId: proptypes.any,
  selectedSubCat: proptypes.any,
  finish: proptypes.any,
  setFinish: proptypes.any,
  subCategories: proptypes.any,
  setSelectedSubCat: proptypes.any,
};

export default Tab;
