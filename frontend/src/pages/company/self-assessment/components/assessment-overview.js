import React, {useEffect, useState} from 'react';
import avatars from 'assets/images/Avatar Group (24px).svg';
import {Text} from '@chakra-ui/react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import dropDownCompressed from 'assets/images/DropdownCompressed.svg';
import fullyMet from 'assets/images/Fullymet.svg';
import notMet from 'assets/images/Notmet.svg';

import dropDownExpanded from 'assets/images/dropdownExpanded.svg';
import proptypes from 'prop-types';
import {nanoid} from '@reduxjs/toolkit';
import {request} from 'common';
import {useSelector} from 'react-redux';
import {getCurrentCompany} from '../../../../utills/helpers';
import InviteMember from 'pages/company/settings/components/inviteMember';

/**
 * AssessmentOverview renders the list of assessment categories and subcategories.
 * It also displays evidence status by tier and allows the user to expand/collapse categories.
 *
 * @component
 * @param {Object} props - React component props
 * @param {Array<Object>} props.tabHeaders - Array of category headers passed to the component
 * @returns {JSX.Element} A panel displaying assessment overview and interactive subcategories
 */
const AssessmentOverview = ({tabHeaders}) => {
  const [categories, setCategories] = useState([]);
  const [cascade, setCascade] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [activeSubCat, setActiveSubCat] = useState(null);
  const [subCategory, setSubCategory] = useState([]);
  const [evidenceStatus, setEvidenceStatus] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const user = useSelector((state) => state.auth.user);

  // Set categories from props when tabHeaders changes
  useEffect(() => {
    setCategories(tabHeaders);
  }, [tabHeaders]);


  /**
   * Handles click events on category or subcategory items.
   * Fetches evidence and comment data for selected category when necessary.
   *
   * @param {string} tab - The name of the selected category tab
   * @param {boolean} type - Whether the item is a subcategory
   * @param {Object} subCategoryDetails - The selected subcategory details
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
      const body = {
        'company-id': user?.company?.id,
        'category-ids': categoryIds,
        'showUnapproved': 1
      };
      // Fetch evidence status data from API for selected categories
      const getEvidenceStatus = async () => {
        const {data} = await request(true).post(`/sat/get/answers`, body);
        setEvidenceStatus(data.responses);
      };
      getEvidenceStatus();

      // Fetch comment list data by category and tier from API
      const getComment = async () => {
        const currentCompany = getCurrentCompany();
        const {id: companyId} = currentCompany;
        await request(true).get(`/comments/list/category/${categoryIds}?company_id=${companyId}&tier=TIER_1`);
      };
      getComment();

      setCascade(true);
      setSubCategory(subCat);
      setActiveTab(tab);
    }
  };

  // Render the self-assessment layout with tabs and subcategories
  return (
    <div
      className="padding-x-0 background-secondary border-left-1px w-col w-col-7"
      style={{width: '70%'}}
    >
      <div className="flex-row-middle flex-space-between padding-x-10 padding-y-4 border-bottom-1px height-20 background-color-white sticky-top-0">
        <div>
          <Text fontWeight="bold" className="margin-bottom-1">
            Self Assessment
          </Text>
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
          {categories.map((val) => (
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
                        {evidenceStatus.length > 0 ? evidenceStatus.map((evidence) => subCat.id == evidence.category_id ? (
                          <div key={nanoid()}>
                            <div className="flex-row margin-right-4 padding-1">
                              <Tippy
                                content={
                                  evidence.value === 'NOT_MET'
                                    ? `Not met selected for ${evidence.tier}`
                                    : evidence.value === 'FULLY_MET'
                                      ? `Fully met selected for ${evidence.tier}`
                                      : evidence.value === 'PARTLY_MET'
                                        ? `Partly met selected for ${evidence.tier}`
                                        : evidence.value === 'MOSTLY_MET'
                                          ? `Mostly met selected for ${evidence.tier}`
                                          : `No evidence status selected for ${evidence.tier}`
                                }
                              >
                                <div className="text-base text-color-body-text">
                                  {evidence.tier === 'TIER_1' ? 'Tier 1' : ''}
                                  {evidence.tier === 'TIER_2' ? 'Tier 2' : ''}
                                  {evidence.tier === 'TIER_3' ? 'Tier 3' : ''}
                                </div>
                              </Tippy>
                              <img
                                src={(evidence.value === 'NOT_MET' || evidence.value === 'FULLY_MET' || evidence.value === 'PARTLY_MET' || evidence.value === 'MOSTLY_MET') ? fullyMet : notMet}
                                loading="lazy"
                                alt=""
                                className="margin-x-1"
                              />
                            </div>
                          </div>
                        ):(
                          <div key={nanoid()}>
                          </div>

                        )) :(
                          <div key={nanoid()} className="flex-row-middle">

                          </div>

                        )}

                      </div>

                    </div>
                  </div>
                ))
                : ''}
            </div>
          ))}
        </div>
      </div>
      {/* Modal component to invite a team member */}
      <InviteMember showInviteModal={showModal} setShowInviteModal={setShowModal} />
    </div>
  );
};

AssessmentOverview.propTypes = {
  tabHeaders: proptypes.any
};

export default AssessmentOverview;
