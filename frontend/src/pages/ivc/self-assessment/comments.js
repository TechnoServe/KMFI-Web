/**
 * Comments Component
 * Allows users to view, post, and delete comments related to a specific category and tier.
 * Integrates mentions of company members using react-mentions.
 */
import React, {useEffect, useState} from 'react';
import {nanoid} from '@reduxjs/toolkit';
import propTypes from 'prop-types';
import {request} from 'common';
import {MentionsInput, Mention} from 'react-mentions';
import MentionWrapperStyle from '../../company/self-assessment/MentionWrapperStyle';
import TextMentionStyle from '../../company/self-assessment/TextMentionStyle';
import {
  Input,
  Stack,
  Text,
  ListItem,
  UnorderedList,
  useToast,
  Flex,
  Spinner,
  Button,
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
dayjs.extend(calendar);
import {getCurrentCompany} from '../../../utills/helpers';
import {useAuth} from 'hooks/user-auth';

/**
 * Renders and manages a comment section for a given category and tier.
 *
 * @param {Object} props - Component props.
 * @param {string|number} props.categoryId - ID of the category for which to load comments.
 * @param {string} [props.tier='TIER_1'] - Tier level for filtering comments.
 * @param {Function} props.didComment - Callback indicating if the current user has commented.
 * @returns {JSX.Element} Comment section component.
 */
const Comments = ({categoryId, tier = 'TIER_1', didComment}) => {
  const toast = useToast();
  // State for storing comments fetched from the server
  const [comments, setCom] = useState(null);
  // Boolean to control loading spinner while fetching comments
  const [loading, setLoading] = useState();
  // Boolean to control button loading state when posting comment
  const [btnLoad, setBtnLoading] = useState(false);
  // Text content of the comment input field
  const [content, setContent] = useState('');
  const currentCompany = getCurrentCompany();
  const {id: companyId} = currentCompany;
  // List of company members used for @mentions
  const [users, setUsers] = useState([]);
  const {user} = useAuth();

  /**
   * Fetches comments for the selected category and tier.
   * Optionally sets the loading state.
   *
   * @param {boolean} type - Whether to set the loading spinner during fetch.
   * @returns {Promise<void>}
   */
  const getComment = async (type) => {
    type && setLoading(true);
    try {
      const {data: res} = await request(true).get(`/comments/list/category/${categoryId}?company_id=${companyId}&tier=${tier}`);
      fetchCompanyMembers();
      setCom(res);
      type && setLoading(false);
      didComment(res.filter((x) => x.user_id === user.id).length > 0);
    } catch (error) {
      fetchCompanyMembers();
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
   * Fetches all company members for the mentions dropdown.
   *
   * @returns {Promise<void>}
   */
  const fetchCompanyMembers = async () => {
    try {
      const data = await request(true).get(
        `company/${companyId}/members`
      );
      if (data?.data) {
        data?.data.map((x) => {
          x.display = x.full_name;
        }
        );
      }

      setUsers(data?.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  // Refetch comments when categoryId or tier changes
  useEffect(() => {
    getComment(1);
  }, [categoryId, tier]);

  /**
   * Sends a new comment to the server.
   *
   * @returns {Promise<void>}
   */
  const postComment = async () => {
    setBtnLoading(true);
    try {
      const body = {
        ids: content.match(/[^(]+(?=\))/g),
        content,
        category_id: categoryId,
        company_id: companyId,
        tier
      };
      await request(true).post(`/comments`, body);
      setContent('');
      getComment();
      setBtnLoading(false);
    } catch (error) {
      setBtnLoading(false);
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
   * Deletes a comment by ID.
   *
   * @param {string|number} id - The ID of the comment to delete.
   * @returns {Promise<void>}
   */
  const deleteComment = async (id) => {
    try {
      await request(true).delete(`/comments/${id}`);
      getComment();
    } catch (error) {
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

  return (
    <div className="padding-x-10 padding-bottom-6 padding-top-6">
      <div className="padding-5 rounded-large background-secondary-2">
        <div>
          <div className="flex-row-middle flex-space-between margin-bottom-5">
            <h6 className="margin-bottom-0 weight-medium">Comments</h6>
          </div>
        </div>
        <div>
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
        ) : comments && comments.length > 0 ? (
          comments.map(({content, created_at: createdAt, user_id: userId, user, id}) => (
            <div key={nanoid()}>
              <div className="flex-row border-bottom-1px" style={{marginTop: 5, paddingTop: 5}}>
                <img
                  src={`https://ui-avatars.com/api/?background=random&name=${user?.full_name}`}
                  loading="lazy"
                  alt=""
                  className="width-9 height-9 rounded-full margin-right-4"
                />
                <div>
                  <div className="flex-row-middle">
                    <div>
                      <div className="flex-row-middle">
                        <div className="text-base medium margin-right-2">
                          {user?.full_name || 'N/A'}
                        </div>
                        <div className="text-tiny text-align-left uppercase text-color-body-text">
                          {dayjs(createdAt).calendar(null, {
                            sameDay: 'h:mm A', // The same day ( Today at 2:30 AM )
                            nextDay: '[tomorrow at] h:mm A', // The next day ( Tomorrow at 2:30 AM )
                            nextWeek: 'dddd [at] h:mm A', // The next week ( Sunday at 2:30 AM )
                            lastDay: '[yesterday at] h:mm A', // The day before ( Yesterday at 2:30 AM )
                            lastWeek: '[last] dddd [at] h:mm A', // Last week ( Last Monday at 2:30 AM )
                            sameElse: 'DD/MM/YYYY', // Everything else ( 17/10/2011 )
                          })}
                        </div>
                        {userId === user?.id ? (
                          <Stack
                            _hover={{cursor: 'pointer'}}
                            onClick={() => deleteComment(id)}
                            ml="3"
                          >
                            <div className="text-small text-danger">Delete</div>
                          </Stack>
                        ) : (
                          ''
                        )}
                      </div>
                      <div className="text-small text-color-body-text">
                        {userId === user?.id ? user?.user_type?.value : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="text-small margin-top-3 margin-bottom-5">
                    {/* <span className="text-small margin-top-3 margin-bottom-5"> */}
                    <MentionsInput
                      disabled
                      style={MentionWrapperStyle}
                      placeholder="Leave a reply..."
                      value={content}
                      a11ySuggestionsListLabel="Company Members"
                    >
                      <Mention style={TextMentionStyle} data={users} />
                    </MentionsInput>
                    {/* </span> */}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <Stack mb="10">
            <Text color="rgba(28, 29, 38, 0.6)">
              Use this section to communicate and collaborate with your team members
            </Text>
            <UnorderedList px="10" color="rgba(28, 29, 38, 0.6)">
              <ListItem>Share files with the team</ListItem>
              <ListItem>Tag anyone with the @</ListItem>
            </UnorderedList>
          </Stack>
        )}
        <div className="form-input small flex-row-middle flex-space-between">
          <MentionsInput
            style={MentionWrapperStyle}
            border="none !important"
            _focus={{outline: 'none', border: 'none !important'}}
            placeholder="Leave a reply..."
            value={content}
            singleLine
            a11ySuggestionsListLabel="Company Members"
            onChange={(e) => setContent(e.target.value)}
          >
            <Mention style={TextMentionStyle} data={users} />
          </MentionsInput>
        </div>
        <Button
          _focus={{outline: 'none'}}
          isDisabled={content.length < 3}
          isLoading={btnLoad}
          onClick={postComment}
          bg="#00B27A"
          color="white"
          p="2"
          alignSelf="center"
        >
          Send
        </Button>
      </div>
    </div>
  );
};

Comments.propTypes = {
  categoryId: propTypes.any,
  parentId: propTypes.any,
  tier: propTypes.any,
  didComment: propTypes.func,
};

export default Comments;
