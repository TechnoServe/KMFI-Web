import React, {useEffect, useState} from 'react';
import avatars from 'assets/images/Avatar Group (24px).svg';
import {Text} from '@chakra-ui/react';
import dropDownCompressed from 'assets/images/DropdownCompressed.svg';
import Tippy from '@tippyjs/react';

import fullyMet from 'assets/images/Fullymet.svg';
import notMet from 'assets/images/Notmet.svg';

import dropDownExpanded from 'assets/images/dropdownExpanded.svg';
import proptypes from 'prop-types';
import {nanoid} from '@reduxjs/toolkit';
import {request} from 'common';
import {getCurrentCompany} from '../../../../utills/helpers';
import InviteMember from 'pages/company/settings/components/inviteMember';

/**
 * Component to render the assessment overview section.
 * Displays categories and subcategories with company and IVC responses.
 *
 * @param {Object} props - Component props.
 * @param {Array} props.tabHeaders - Array of tab/category headers.
 * @param {string|number} props.cycleId - Current assessment cycle ID.
 * @returns {JSX.Element} The rendered AssessmentOverview component.
 */
const AssessmentOverview = ({tabHeaders, cycleId}) => {
  // Stores list of categories/tabs
  const [categories, setCategories] = useState([]);

  // Controls expansion of subcategories
  const [cascade, setCascade] = useState(false);

  // Currently active tab/category
  const [activeTab, setActiveTab] = useState(null);

  // Currently active subcategory
  const [activeSubCat, setActiveSubCat] = useState(null);

  // List of subcategories under active category
  const [subCategory, setSubCategory] = useState([]);

  // Company responses for each category/tier
  const [evidenceStatus, setEvidenceStatus] = useState([]);

  // IVC responses for each category/tier
  const [evidenceIVCStatus, setEvidenceIVCStatus] = useState([]);

  // Controls display of "Invite Member" modal
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setCategories(tabHeaders);
  }, [tabHeaders]);

  /**
   * Handles logic when a category or subcategory is clicked.
   * Fetches evidence and comment data for the selected tab.
   *
   * @param {string} tab - The selected tab/category name.
   * @param {boolean} [type] - Whether it is a subcategory selection.
   * @param {Object} [subCategoryDetails] - Subcategory data object.
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
      const currentCompany = getCurrentCompany();
      const {id: companyId} = currentCompany;
      const body = {
        'company-id': companyId,
        'category-ids': categoryIds,
        'cycle-ids': cycleId,
        'showUnapproved': 1,
        'showUnpublished': true
      };
      // Evidence Status
      const getEvidenceStatus = async () => {
        const {data} = await request(true).post(`/sat/get/answers`, body);

        const {
          data: {responses: ivcResponses},
        } = await request(true).post(`/sat/get/ivc/answers`, body);

        setEvidenceStatus(data.responses);
        setEvidenceIVCStatus(ivcResponses);
      };
      getEvidenceStatus();

      // Comments
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

  /**
   * Checks if company has a matching answer for a specific tier/category/value.
   *
   * @param {string} tier - The tier to match (e.g. "TIER_1").
   * @param {string|number} categoryId - The category ID to match.
   * @param {string} value - The value to match (e.g. "FULLY_MET").
   * @returns {boolean} True if a matching record exists, false otherwise.
   */
  const getCompanyAnswer = (tier, categoryId, value) => {
    for (let i = 0; i < evidenceStatus.length; i++) {
      const data = evidenceStatus[i];
      if (data.tier == tier && data.category_id == categoryId && data.value == value) return true;
    }
    return false;
  };

  // Evidence Status
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
                      <div className="flex-column-middle">
                        <div className="flex-row-middle">
                          <div className="flex-row margin-right-4 padding-1">
                            <div className="text-base text-color-body-text">Tier 1</div>
                            <img style={{visibility: 'hidden'}} src={fullyMet} loading="lazy" alt=""className="margin-x-1"/>
                          </div>
                          <div className="flex-row margin-right-4 padding-1">
                            <div className="text-base text-color-body-text">Tier 2</div>
                            <img style={{visibility: 'hidden'}} src={fullyMet} loading="lazy" alt=""className="margin-x-1"/>
                          </div>
                          <div className="flex-row margin-right-4 padding-1">
                            <div className="text-base text-color-body-text">Tier 3</div>
                            <img style={{visibility: 'hidden'}} src={fullyMet} loading="lazy" alt=""className="margin-x-1"/>
                          </div>
                        </div>
                        <div className="flex-row-middle">
                          {evidenceStatus.length > 0 ? evidenceStatus.map((evidence) => subCat.id == evidence.category_id ? (
                            <div key={nanoid()}>
                              <div className="flex-row margin-right-4 padding-1">
                                <Tippy
                                  content={
                                    evidence.value === 'NOT_MET'
                                      ? `Company selected not met for ${evidence.tier}`
                                      : evidence.value === 'FULLY_MET'
                                        ? `Company selected fully met for ${evidence.tier}`
                                        : evidence.value === 'PARTLY_MET'
                                          ? `Company selected partly met for ${evidence.tier}`
                                          : evidence.value === 'MOSTLY_MET'
                                            ? `Company selected mostly met for ${evidence.tier}`
                                            : `Company selected no evidence status for ${evidence.tier}`
                                  }
                                >
                                  <div className="text-base text-color-body-text">
                                    {evidence.value}
                                  </div>
                                </Tippy>
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
                        <div key={nanoid()} className="flex-row-middle">
                          {/* //IVC */}
                          {evidenceIVCStatus.length > 0 ? evidenceIVCStatus.map((evidence) => subCat.id == evidence.category_id ? (
                            <div key={nanoid()}>
                              <div className="flex-column margin-right-4 padding-1">
                                <Tippy
                                  content={
                                    evidence.value === 'NOT_MET'
                                      ? `IVC selected not met for ${evidence.tier}`
                                      : evidence.value === 'FULLY_MET'
                                        ? `IVC selected fully met for ${evidence.tier}`
                                        : evidence.value === 'PARTLY_MET'
                                          ? `IVC selected partly met for ${evidence.tier}`
                                          : evidence.value === 'MOSTLY_MET'
                                            ? `IVC selected mostly met for ${evidence.tier}`
                                            : `IVC selected no evidence status for ${evidence.tier}`
                                  }
                                >
                                  <div className="text-base text-color-body-text">
                                    {evidence.value}
                                  </div>
                                </Tippy>
                                {getCompanyAnswer(evidence.tier, evidence.category_id, evidence.value) ? (
                                  <img
                                    style={{width: '40px', height: '40px', margin: '0px auto'}}
                                    src={fullyMet}
                                    loading="lazy"
                                    alt=""
                                  />
                                ):(
                                  <img
                                    style={{width: '40px', height: '40px', margin: '0px auto'}}
                                    src={notMet}
                                    loading="lazy"
                                    alt=""
                                  />
                                )
                                }

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

                      <a href="#" className="button-secondary button-small w-button">
                        View
                      </a>
                    </div>
                  </div>
                ))
                : ''}
            </div>
          ))}
        </div>
      </div>
      <InviteMember showInviteModal={showModal} setShowInviteModal={setShowModal} />
    </div>
  );
};

AssessmentOverview.propTypes = {
  tabHeaders: proptypes.any,
  cycleId: proptypes.any,
};

export default AssessmentOverview;
