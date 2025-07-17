import React, {useEffect, useState} from 'react';
import {nanoid} from '@reduxjs/toolkit';
import propTypes from 'prop-types';
import {request} from 'common';
import {MentionsInput, Mention} from 'react-mentions';
import MentionWrapperStyle from './MentionWrapperStyle';
import TextMentionStyle from './TextMentionStyle';
import {
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

/**
 * Comments component displays and manages threaded comments tied to a specific
 * assessment category, company, cycle, and tier.
 * It supports user mentions, comment submission, and comment deletion.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.categoryId - ID of the assessment category
 * @param {string} props.companyId - ID of the company
 * @param {Object} props.cycle - The current assessment cycle
 * @param {string} [props.tier='TIER_1'] - Assessment tier (default is 'TIER_1')
 * @returns {JSX.Element} The rendered Comments component
 */
const Comments = ({categoryId, companyId, cycle, tier = 'TIER_1'}) => {
  const toast = useToast();
  const [comments, setCom] = useState(null);
  const [loading, setLoading] = useState();
  const [btnLoad, setBtnLoading] = useState(false);
  const [content, setContent] = useState('');
  const [users, setUsers] = useState([]);

  // Fetches all comments for the current category, company, cycle, and tier
  const getComment = async (type) => {
    type && setLoading(true);
    try {
      const {data: res} = await request(true).get(`/comments/list/category/${categoryId}?company_id=${companyId}&cycle_id=${cycle.id}&tier=${tier}`);
      fetchCompanyMembers();
      setCom(res);
    } catch (error) {
      fetchCompanyMembers();
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
  // Fetches the list of members in the company for mention tagging
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

  // Load comments on category or tier change
  useEffect(() => {
    getComment(1);
  }, [categoryId, tier]);

  // Posts a new comment to the backend and refreshes the comment list
  const postComment = async () => {
    setBtnLoading(true);
    try {
      const body = {
        cycle: cycle.id,
        ids: content.match(/[^(]+(?=\))/g),
        content,
        category_id: categoryId,
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
  // Deletes a comment by its ID and refreshes the comment list
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
        {/* Display loading spinner, comments list, or placeholder instructions */}
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

                  <p className="text-small margin-top-3 margin-bottom-5">
                    {/* <span className="text-span">@Benjamin Godswill</span>  */}
                    <MentionsInput
                      disabled
                      style={MentionWrapperStyle}
                      placeholder="Leave a reply..."
                      value={content}
                      a11ySuggestionsListLabel="Company Members"
                    >
                      <Mention style={TextMentionStyle} data={users} />
                    </MentionsInput>
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <Stack mb="10">
            <Text color="rgba(28, 29, 38, 0.6)">
              Use this field for:
              <br />
              a. Capturing comments and context relating to the attached evidence, such as to
              highlight a specific section.
              <br />
              b. Explaining the context of your selected response where there is no documentation to
              attach as evidence.
              <br />
              c. Collaborations between members of the company team responsible for MFI inputs;
              document sharing or tagging individuals (@name of individual) for further action.
            </Text>
            <UnorderedList px="10" color="rgba(28, 29, 38, 0.6)">
              <ListItem>Share files with your team</ListItem>
              <ListItem>Tag anyone with @</ListItem>
            </UnorderedList>
          </Stack>
        )}
        {/* Input field for new comment with user mentions */}
        <div className="form-input small flex-row-middle flex-space-between">
          <MentionsInput
            style={MentionWrapperStyle}
            placeholder="Leave a reply..."
            value={content}
            singleLine
            a11ySuggestionsListLabel="Company Members"
            onChange={(e) => setContent(e.target.value)}
          >
            <Mention style={TextMentionStyle} data={users} />
          </MentionsInput>
        </div>
        {/* Submit button for posting a comment */}
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
  companyId: propTypes.any,
  cycle: propTypes.any,
  tier: propTypes.any,
};

export default Comments;
