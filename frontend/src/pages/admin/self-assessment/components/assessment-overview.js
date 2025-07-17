import React, {useEffect, useState} from 'react';
import {Text} from '@chakra-ui/react';
// import {Text, Select} from '@chakra-ui/react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import dropDownCompressed from 'assets/images/DropdownCompressed.svg';
// import fileIcon from 'assets/images/FileIcon-Small.svg';
import fullyMet from 'assets/images/Fullymet.svg';
import notMet from 'assets/images/Notmet.svg';
// import commentIcon from 'assets/images/CommentIcon-Small.svg';
import dropDownExpanded from 'assets/images/dropdownExpanded.svg';
import proptypes from 'prop-types';
import {nanoid} from '@reduxjs/toolkit';
import {request} from 'common';
import {useSelector} from 'react-redux';
import {getCurrentCompany} from '../../../../utills/helpers';
import InviteMember from 'pages/company/settings/components/inviteMember';

/**
 * Renders the Self Assessment overview interface including category and subcategory lists
 * with evidence status icons and interaction handling.
 *
 * @component
 * @param {Object} props - React component props
 * @param {Array} props.tabHeaders - Array of category objects each with name, icon, and subCategories
 * @returns {JSX.Element} The rendered AssessmentOverview layout with interaction for evidence display
 */
const AssessmentOverview = ({tabHeaders}) => {
  const [categories, setCategories] = useState([]);
  const [cascade, setCascade] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [activeSubCat, setActiveSubCat] = useState(null);
  const [subCategory, setSubCategory] = useState([]);
  const [evidenceStatus, setEvidenceStatus] = useState([]);
  const [showModal, setShowModal] = useState(false);
  // const cycle = 'xIO8ABl5Q7jmwwPK4wAg';
  // const [selectedCycle] = useState(cycle);
  // const [cycles, setCycles] = useState([]);

  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    // Initialize categories from props
    setCategories(tabHeaders);
  }, [tabHeaders]);

  /**
   * Handles clicks on category or subcategory tabs.
   * Toggles subcategory dropdown and fetches evidence/comment data.
   *
   * @param {string} tab - Category name clicked
   * @param {boolean} type - Indicates if subcategory was directly clicked
   * @param {Object} subCategoryDetails - Subcategory metadata for active setting
   */
  const onClickTabItem = (tab, type, subCategoryDetails) => {
    if (tab === activeTab && !type) {
      setCascade(!cascade);
    } else if (tab === activeTab && type) {
      setCascade(true);
      setActiveSubCat(subCategoryDetails.name);
      return;
    } else {
      const subCat = categories.filter((val) => val.name === tab)[0].subCategories;
      const categoryIds = subCat.map((x) => x.id);
      // const categoryId = categoryIds[0];
      const body = {
        'company-id': user?.company?.id,
        'category-ids': [categoryIds[0]],
        'showUnapproved': 1
      };
      // Fetch evidence status for the selected category
      const getEvidenceStatus = async () => {
        const {data} = await request(true).post(`/sat/get/answers`, body);
        setEvidenceStatus(data.responses);
      };
      getEvidenceStatus();

      // Fetch category-level comments from the server
      const getComment = async () => {
        const currentCompany = getCurrentCompany();
        const {id: companyId} = currentCompany;
        await request(true).get(`/comments/list/category/${categoryIds}?company_id=${companyId}`);
      };
      getComment();

      setCascade(true);
      setSubCategory(subCat);
      setActiveTab(tab);
    }
  };

  // Main container layout including title and category list with evidence icons
  return (
    <div
      className="padding-x-0 background-secondary border-left-1px w-col w-col-7"
      style={{width: '70%'}}
    >
      <div className="flex-row-middle flex-space-between padding-x-10 padding-y-4 border-bottom-1px height-20 background-color-white sticky-top-0">
        <div style={{display: 'contents'}}>
          <Text fontWeight="bold" className="margin-bottom-1" style={{width: '12em'}}>
            Self Assessment
          </Text>
          {/* Start  */}
          {/* <Select size='md' style={{width: 'auto', float: 'inline-end', margin: '0 10px 0 0'}} name="cycles" id="cycles" onChange={onClickTabItem}>
            {
              cycles?.map((x) => (
                (selectedCycle == x.id || x.active) ? (
                  <option selected key={x.id} value={x.id}>{x.name} Cycle</option>
                ) : (
                  <option key={x.id} value={x.id}>{x.name} Cycle</option>
                )
              ))
            }
          </Select> */}
          {/* End */}
        </div>
      </div>
      {/* start assessment overview */}
      <div className="padding-x-10 padding-top-8 padding-bottom-5">
        <Text
          fontSize="1.4rem"
          lineHeight={1.1}
          fontWeight="bold"
          className="weight-medium margin-bottom-2"
        >
          Assessment Overview
        </Text>
        <Text
          className="text-base text-color-body-text"
          color="rgba(28, 29, 38, 0.6)"
          fontSize="1rem"
        >
          Get started by entering a category.
        </Text>
      </div>
      <div className="padding-x-10 padding-bottom-10">
        <div className="border-1px rounded-large">
          {/* Loop through each main category and render a toggleable subcategory list */}
          {categories?.map((val) => (
            <div key={nanoid()}>
              <div
                onClick={() => onClickTabItem(val.name)}
                className="padding-x-4 background-secondary padding-y-3 flex-space-between cursor-click"
              >
                <div className="flex-row-middle">
                  <img
                    src={val.icon1}
                    loading="lazy"
                    width="16"
                    alt=""
                    className="margin-right-2 margin-bottom-1"
                  />
                  <div className="text-small weight-medium text-color-body-text">{val.name}</div>
                </div>
                <img
                  src={activeTab === val.name && cascade ? dropDownExpanded : dropDownCompressed}
                  loading="lazy"
                  alt=""
                />
              </div>
              {activeTab === val.name && cascade
                ? subCategory.map((subCat) => (
                  // Render each subcategory with associated evidence tiers
                  <div
                    key={nanoid()}
                    className={`padding-4 grid-2-columns border-bottom-1px ${activeSubCat === subCat.name
                      ? 'cursor-click background-color-blue-lighter'
                      : ''
                    }`}
                  >

                    <div>
                      <div className="text-base medium">{subCat.name}</div>
                    </div>

                    <div
                      id="w-node-_212c762e-30ec-edff-fed5-6c5419fe4e93-bc3a0a40"
                      className="flex-space-between flex-row-middle"
                    >
                      <div className="flex-row-middle">
                        {evidenceStatus.map((evidence) => (
                          <div key={nanoid()}>
                            {/* Tooltip wrapper displaying explanation of evidence status */}
                            <div className="flex-row margin-right-4 padding-1">
                              <Tippy
                                content={
                                  evidence.value === 'NOT_MET'
                                    ? `No evidence status selected for ${evidence.tier}`
                                    : evidence.value === 'FULLY_MET'
                                      ? `Fully met selected for ${evidence.tier}`
                                      : evidence.value === 'PARTLY_MET'
                                        ? `Partly met selected for ${evidence.tier}`
                                        : evidence.value === 'MOSTLY_MET'
                                          ? `Mostly met selected for ${evidence.tier}`
                                          : ''
                                }
                              >
                                <div className="text-base text-color-body-text">
                                  {evidence.tier === 'TIER_1' ? 'Tier 1' : ''}
                                  {evidence.tier === 'TIER_2' ? 'Tier 2' : ''}
                                  {evidence.tier === 'TIER_3' ? 'Tier 3' : ''}
                                </div>
                              </Tippy>
                              <img
                                src={evidence.value === 'NOT_MET' ? notMet : fullyMet}
                                loading="lazy"
                                alt=""
                                className="margin-x-1"
                              />
                            </div>
                          </div>
                        ))}
                        {/*
                        <div className="flex-row margin-right-4 padding-1">
                          <img src={fileIcon} loading="lazy" alt="" className="margin-right-1" />
                          <div className="text-base text-color-body-text">2</div>
                        </div>
                        {comment && comment.map((com) => (
                        <div className="flex-row padding-1 rounded-large">
                          <img
                            src={commentIcon}
                            loading="lazy"
                            alt=""
                            className="margin-right-1"
                            />
                          <div className="text-base text-color-body-text">5</div>
                        </div>
                        ))}
                        */}
                      </div>
                      {/* <div key={nanoid()} onClick={() => {
                        isNumber(progress) && onClickTabItems(activeTab, 1, subCat);
                      }} className="button-secondary button-small w-button">
                        View
                      </div> */}
                    </div>
                  </div>
                ))
                : ''}
            </div>
          ))}
        </div>
      </div>
      {/* Modal for inviting new company members, shown conditionally */}
      <InviteMember showInviteModal={showModal} setShowInviteModal={setShowModal} />
    </div>
  );
};

AssessmentOverview.propTypes = {
  tabHeaders: proptypes.any
};

export default AssessmentOverview;
