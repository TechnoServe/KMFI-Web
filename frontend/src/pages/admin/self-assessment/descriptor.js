import React, {useState, useEffect} from 'react';
import propTypes from 'prop-types';
import {UnorderedList, ListItem, Text, Input, Button, Tooltip, useToast} from '@chakra-ui/react';
import {nanoid} from '@reduxjs/toolkit';
import {request} from 'common';
import deleteIcon from 'assets/images/delete-stop-svgrepo-com.svg';
import addIcon from 'assets/images/add-row-svgrepo-com.svg';

/**
 * Descriptor allows admins to view, update, add, and delete assessment descriptors (questions)
 * within a selected category and tier. It manages local state and triggers API updates.
 *
 * @component
 * @param {Object} props - Props passed to the component
 * @param {Object} props.activeTiers - Currently active tier object
 * @param {number|string} props.categoryId - Selected category ID
 * @param {Array} props.tierQuestions - Initial array of tier question objects
 * @returns {JSX.Element} A rendered admin interface for managing assessment descriptors
 */
export const conditions = [
  {value: 'NOT_MET', name: 'Not met'},
  {value: 'PARTLY_MET', name: 'Partly met'},
  {value: 'MOSTLY_MET', name: 'Mostly met'},
  {value: 'FULLY_MET', name: 'Fully met'},
];

const Descriptor = ({
  activeTiers,
  categoryId,
  tierQuestions}) => {
  const [question, setQuestion] = useState([]);
  const [btnLoad, setBtnLoading] = useState(false);
  const [newDescriptor, setNewDescriptor] = useState('');
  const toast = useToast();


  // Sync local state with prop when tierQuestions updates
  useEffect(() => {
    setQuestion(tierQuestions);
  }, [tierQuestions]);

  /**
   * Update a question's description value in state
   * @param {Object} e - Input change event
   * @param {Object} mQuestion - The question object to update
   * @returns {void}
   */
  const setDescription = async (e, mQuestion) => {
    const newState = question.map((obj) => {
      // 👇️ if id equals 2, update country property
      if (obj.id == mQuestion.id) {
        return {...obj, value: e.target.value};
      }

      // 👇️ otherwise return object as is
      return obj;
    });

    setQuestion(newState);
    setTimeout(function() {
      // body...
      document.getElementById(mQuestion.id).focus();
    }, 100);
  };

  /**
   * Update a question's sort order in state
   * @param {Object} e - Input change event
   * @param {Object} mQuestion - The question object to update
   * @returns {void}
   */
  const setSortOrder = async (e, mQuestion) => {
    const newState = question.map((obj) => {
      // 👇️ if id equals 2, update country property
      if (obj.id == mQuestion.id) {
        return {...obj, sort_order: parseInt(e.target.value)};
      }

      // 👇️ otherwise return object as is
      return obj;
    });

    setQuestion(newState);
    setTimeout(function() {
      // body...
      document.getElementById(mQuestion.id+'iSortOrder').focus();
    }, 100);
  };

  /**
   * Send updated questions to backend for persistence
   * @returns {Promise<void>}
   */
  const updateQuestion = async () => {
    setBtnLoading(true);
    try {
      const updateBody = {
        'questions-update': question.map((x) => {
          return {
            'id': x.id,
            'category-id': x.category_id,
            'sort-order': x.sort_order,
            'tier-id': x.tier_id,
            'value': x.value
          };
        })
      };
      await request(true).post(`/questions/update`, updateBody);
      setBtnLoading(false);
      return toast({
        status: 'success',
        title: 'Success',
        position: 'bottom-right',
        description: 'Questions Updated Successfully',
        duration: 6000,
        isClosable: true,
      });
    } catch (error) {
      console.log(error);
      setBtnLoading(false);
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
   * Add a new descriptor to the category and tier via API
   * @returns {Promise<void>}
   */
  const addNewDescriptor = async () => {
    setBtnLoading(true);
    try {
      const addBody = {
        'questions-add': true,
        'category-id': categoryId,
        'sort-order': 10,
        'tier-id': activeTiers.id,
        'value': newDescriptor
      };
      await request(true).post(`/questions/update`, addBody);
      setBtnLoading(false);
      setTimeout(function() {
        // body...
        location.reload();
      }, 1000);
      return toast({
        status: 'success',
        title: 'Success',
        position: 'bottom-right',
        description: 'Questions Added Successfully',
        duration: 6000,
        isClosable: true,
      });
    } catch (error) {
      console.log(error);
      setBtnLoading(false);
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
   * Delete a question from the current list via API
   * @param {number|string} id - ID of the question to delete
   * @returns {Promise<void>}
   */
  const deleteQuestion = async (id) => {
    setBtnLoading(true);
    try {
      const deleteBody = {
        'questions-delete': true,
        'id': id
      };
      await request(true).post(`/questions/update`, deleteBody);
      setBtnLoading(false);
      setTimeout(function() {
        // body...
        location.reload();
      }, 1000);
      return toast({
        status: 'success',
        title: 'Success',
        position: 'bottom-right',
        description: 'Questions Deleted Successfully',
        duration: 6000,
        isClosable: true,
      });
    } catch (error) {
      console.log(error);
      setBtnLoading(false);
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

  // Render UI for descriptor list, update, add and delete actions
  return (
    <div className="padding-x-10">
      <div className="padding-top-6 padding-bottom-4">
        <div className="text-sub-header">Evidence descriptor</div>
      </div>
      <div className="background-color-white border-1px rounded-large padding-5">
        <Text className="weight-medium" mb="3">
          Requirements
        </Text>
        {question.length > 0 ? (
          <UnorderedList role="list" className="padding-left-0 margin-bottom-5">
            {question.map((val) => {
              return (
                <ListItem key={nanoid()} className="text-small padding-bottom-4">
                  <div style={{display: 'flex', flexDirection: 'row'}}>
                    <div style={{flex: 'auto', marginRight: '5px', marginBottom: '0px'}} className="form-input small flex-row-middle flex-space-between">
                      <Input
                        id={val.id}
                        border="none"
                        height="2rem"
                        value={val.value}
                        _focus={{outline: 'none', border: 'none'}}
                        onChange={(e) => setDescription(e, val)}
                        className="text-small text-color-body-text"
                      />
                    </div>
                    <input
                      style={{padding: '5px 10px', marginRight: '5px', marginLeft: '5px', borderColor: 'green', borderWidth: '1px', borderStyle: 'solid', borderRadius: '5px', width: '50px'}}
                      type="number"
                      id={val.id + 'iSortOrder'}
                      value={val.sort_order}
                      onChange={(e) => setSortOrder(e, val)}/>
                    <Tooltip label='Delete'>
                      <Button
                        onClick={() => deleteQuestion(val.id)}
                        isLoading={btnLoad}
                        _focus={{outline: 'none'}}
                        p="2"
                        alignSelf="center"
                      >
                        <img
                          src={deleteIcon}
                          loading="lazy"
                          width="24"
                          alt=""
                        />
                      </Button>
                    </Tooltip>

                  </div>

                </ListItem>
              );
            })}

          </UnorderedList>
        ) : (
          ''
        )}
        <Button
          _focus={{outline: 'none'}}
          isDisabled={question.length == 0}
          isLoading={btnLoad}
          onClick={updateQuestion}
          bg="#00B27A"
          color="white"
          p="2"
          alignSelf="center"
        >
          Update Descriptor
        </Button>
        <div className="padding-top-4 padding-bottom-4">
          <div className="text-sub-header">Add New Descriptor</div>
        </div>

        <div style={{display: 'flex', flexDirection: 'row', marginBottom: '10px'}}>
          <div style={{flex: 'auto', marginRight: '5px', marginBottom: '0px'}} className="form-input small flex-row-middle flex-space-between">
            <Input
              id="newDescriptor"
              border="none"
              height="2rem"
              value={newDescriptor}
              _focus={{outline: 'none', border: 'none'}}
              onChange={(e) => setNewDescriptor(e.target.value)}
              className="text-small text-color-body-text"
            />
          </div>
          <Tooltip label='Add'>
            <Button
              isLoading={btnLoad}
              _focus={{outline: 'none'}}
              p="2"
              alignSelf="center"
              onClick={addNewDescriptor}
            >
              <img
                src={addIcon}
                loading="lazy"
                width="24"
                alt=""
              />
            </Button>
          </Tooltip>

        </div>

      </div>
    </div>
  );
};

Descriptor.propTypes = {
  activeTiers: propTypes.any,
  categoryId: propTypes.any,
  tierQuestions: propTypes.any,
  parentId: propTypes.any
};

export default Descriptor;
