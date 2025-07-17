import React, {useState, useEffect} from 'react';
import dropDownCompressed from 'assets/images/DropdownCompressed.svg';
import dropDownExpanded from 'assets/images/dropdownExpanded.svg';
import propTypes from 'prop-types';
import {FaBars} from 'react-icons/fa';
import {useMediaQuery, Progress, Spinner, Flex, Stack} from '@chakra-ui/react';
import {nanoid} from '@reduxjs/toolkit';
import TabPane from './Tabpane';
import {isNumber} from 'validate.js';
import {useRef} from 'react';
import {BiArrowBack} from 'react-icons/bi';
import AssessmentOverview from './assessment-overview';
import {Link} from 'react-router-dom';
import {getCurrentCompany} from 'utills/helpers';

/**
 * Renders the Tabs component for navigating assessment categories and subcategories.
 *
 * @param {Object} props - The props for the component.
 * @param {ReactNode} props.children - TabPane children representing each category tab.
 * @param {number} props.progress - The overall assessment progress.
 * @param {Function} props.showSideBar - Callback to toggle sidebar.
 * @param {string} props.activeTab - Currently active category tab.
 * @param {Function} props.setActiveTab - Callback to set the active tab.
 * @param {Object} props.selectedSubCat - Currently selected subcategory.
 * @param {Function} props.setSelectedSubCat - Callback to set the selected subcategory.
 * @param {Function} props.setFinish - Callback to update finish state.
 * @param {string} props.cycleId - ID of the current assessment cycle.
 * @returns {JSX.Element} The rendered Tabs component.
 */
const Tabs = (props) => {
  const {
    children,
    progress,
    showSideBar,
    activeTab,
    setActiveTab,
    selectedSubCat,
    setSelectedSubCat,
    setFinish,
    cycleId
  } = props;
  const [mobile] = useMediaQuery('(min-width: 800px)');
  const tabRef = useRef();
  const [childContent, setChildConent] = useState({});
  const [tabHeader, setTabHeader] = useState([]);
  const [loading] = useState(false);
  const [cascade, setCascade] = useState(false);
  const [subCategory, setSubCategory] = useState([]);

  // Extract tab headers and their child content when component mounts or props change
  useEffect(() => {
    const headers = [];
    const childCnt = {};
    React.Children.forEach(children, (element) => {
      if (!React.isValidElement(element)) return;
      const {...rest} = element.props;
      headers.push({...rest});
      childCnt[element.props.name] = element.props.children;
    });
    tabRef.current = headers;
    setTabHeader(headers);
    setChildConent({...childCnt});
  }, [props, children]);

  // Automatically set active tab and subcategory details when activeTab changes
  useEffect(() => {
    const value = activeTab;
    const active = tabRef.current.filter((val) => val.name === value)[0];
    if (active) {
      setActiveTab(active?.name);
      setCascade(true);
      setSubCategory(active?.subCategories);
      setSelectedSubCat(active?.subCategories[0]);
    }
  }, [activeTab, tabRef]);

  /**
   * Handles user clicking on a tab or subcategory tab.
   *
   * @param {string} tab - Name of the category tab.
   * @param {number} type - Indicates if it's a subcategory click (1) or not.
   * @param {Object} subCategoryDetails - The subcategory object being selected.
   */
  const onClickTabItem = (tab, type, subCategoryDetails) => {
    if (tab === activeTab && !type) {
      setCascade(!cascade);
      setFinish(false);
    } else if (tab === activeTab && type) {
      setCascade(true);
      setFinish(false);
      setSelectedSubCat(subCategoryDetails);
      return;
    } else {
      const subCat = tabHeader.filter((val) => val.name === tab)[0].subCategories;
      setCascade(true);
      setSubCategory(subCat);
      setFinish(false);
      setSelectedSubCat(subCat[0]);
      setActiveTab(tab);
    }
  };


  // Retrieve current company info from local storage to display in sidebar
  const currentCompany = JSON.parse(localStorage.getItem('company'));
  return (
    <Flex>
      <Stack className="padding-0 background-color-4 height-viewport-full overflow-scroll sticky-top-0">
        <div
          className="padding-0 background-color-4 height-viewport-full overflow-scroll sticky-top-0 w-col w-col-3"
          style={{
            width: 360,
          }}
        >
          <div className="fixed background-color-4 width-full">
            <div className="flex-row-middle padding-x-5 padding-y-4 border-bottom-1px height-20 width-full">
              <button
                onClick={() => showSideBar()}
                style={{marginRight: 5, display: mobile ? 'none' : ''}}
              >
                {' '}
                <FaBars />{' '}
              </button>
              <img
                src={`https://ui-avatars.com/api/?background=random&name=${currentCompany.company_name}$rounded=true`}
                loading="lazy"
                width="48"
                style={{borderRadius: '50%'}}
                alt=""
                className="rounded-large margin-right-4"
              />
              <div>
                <h6 className="margin-bottom-1">{currentCompany.company_name}</h6>
                {/* <div className="text-small">Nigeria - Sugar</div> */}
              </div>
            </div>
          </div>
          <div className="height-20"></div>
          <Flex
            className="margin-x-5  rounded-large box-shadow-small margin-bottom-2 margin-top-5"
            bg="rgba(0, 0, 0, 0.05)"
          >
            <div className="flex-row-middle padding-4 flex-space-between">
              <Link to="/admin/companies-index">
                <Stack bg="white" borderRadius="50%" mr={4}>
                  <BiArrowBack size={25} />
                </Stack>
              </Link>
              <div className="text-base weight-bold">Back to index</div>
            </div>
          </Flex>
          <div className="padding-bottom-10">
            {progress > 0 ? (
              <>
                <div className="padding-top-6 padding-bottom-4 padding-left-5">
                  <div className="text-sub-header">OVERALL PROGRESS</div>
                </div>
                <div className="margin-x-5 background-color-white rounded-large box-shadow-small margin-bottom-2">
                  <div className="flex-row-middle flex-space-between padding-4">
                    <div className="height-2 width-9-12 rounded-full background-hover">
                      <Progress
                        className="height-2 rounded-full background-brand"
                        colorScheme="whatsapp"
                        color="#00b37a"
                        size="sm"
                        value={progress}
                      />
                    </div>
                    <div className="text-base weight-bold">{progress}%</div>
                  </div>
                </div>
              </>
            ) : (
              ''
            )}
            <div className="padding-top-6 padding-bottom-4 padding-left-5">
              <div className="text-sub-header">CATEGORIES</div>
            </div>
            <div className="margin-x-5 background-color-white rounded-large box-shadow-small">
              {tabHeader.map(({name: item, icon1, icon2}) => {
                // Render each tab header with icon, name, score and dropdown
                return (
                  <Stack
                    key={nanoid()}
                    style={
                      isNumber(progress)
                        ? null
                        : {
                            pointerEvents: 'none',

                            /* for "disabled" effect */
                            opacity: 0.5,
                            background: '`#CCC`',
                          }
                    }
                  >
                    <div onClick={() => isNumber(progress) && onClickTabItem(item)} className="flex-row-middle flex-space-between padding-4 border-bottom-1px">
                      <div className="flex-row-middle">
                        <img
                          src={activeTab === item && cascade ? icon2 : icon1}
                          loading="lazy"
                          width="24"
                          alt=""
                          className="margin-right-4"
                        />
                        <div
                          className={`text-base medium ${activeTab === item && cascade ? 'text-color-green' : ''
                          }`}
                        >
                          {getCurrentCompany().satScores.map(((obj) => obj.name === item ? item + ' ' + (obj.score.toFixed(2) + '%') : ''))}
                        </div>
                      </div>
                      <div className="width-10 height-10 flex-justify-center flex-row-middle">
                        {loading && activeTab === item ? (
                          <Spinner />
                        ) : (
                          <div
                            style={{
                              paddding: 10,
                              cursor: 'pointer',
                              background: '#FAFAFA',
                              borderRadius: '100%',
                            }}
                            onClick={() => isNumber(progress) && onClickTabItem(item)}
                          >
                            <img
                              src={
                                activeTab === item && cascade
                                  ? dropDownExpanded
                                  : dropDownCompressed
                              }
                              loading="lazy"
                              width="30"
                              height="30"
                              alt="drop"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Render subcategories under active category tab */}
                    {activeTab === item && cascade
                      ? subCategory.map((val) => (
                        <div
                          key={nanoid()}
                          onClick={() => isNumber(progress) && onClickTabItem(item, 1, val)}
                          className="flex-row-middle flex-space-between padding-x-4 padding-y-3 background-secondary"
                          style={
                            selectedSubCat?.id === val.id ? {backgroundColor: 'darkgray'} : {}
                          }
                        >
                          <div className="text-small weight-medium text-color-body-text">
                            {val.name}
                          </div>
                        </div>
                      ))
                      : ''}
                  </Stack>
                );
              })}
            </div>
          </div>
        </div>
      </Stack>

      {activeTab ? (
        Object.keys(childContent).map((key) => {
          // Render content of the currently active tab
          if (key === activeTab) {
            return (
              <Stack flex="1" key={key}>
                {childContent[key]}
              </Stack>
            );
          } else {
            return null;
          }
        })
      ) : (
        // If no tab is active, show assessment overview
        <AssessmentOverview tabHeaders={tabHeader} cycleId={cycleId} />
      )}
    </Flex>
  );
};

Tabs.propTypes = {
  children: function (props, propName, componentName) {
    const prop = props[propName];

    let error = null;
    React.Children.forEach(prop, function (child) {
      if (child.type !== TabPane) {
        error = new Error('`' + componentName + '` children should be of type `TabPane`.');
      }
    });
    return error;
  },
  progress: propTypes.any,
  setSelectedSubCat: propTypes.any,
  companyDetails: propTypes.any,
  selectedSubCat: propTypes.any,
  showSideBar: propTypes.any,
  activeTab: propTypes.any,
  setActiveTab: propTypes.any,
  finish: propTypes.any,
  setFinish: propTypes.any,
  cycleId: propTypes.any,

};

export default Tabs;
