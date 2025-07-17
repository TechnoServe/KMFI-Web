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
import AssessmentOverview from './assessment-overview';

/**
 * Tabs component for managing and rendering a tabbed interface in the admin self-assessment UI.
 * Displays categories and sub-categories with support for responsive layout and progress tracking.
 *
 * @component
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - TabPane components passed as children
 * @param {number} props.progress - Progress percentage for the overall assessment
 * @param {Function} props.showSideBar - Function to toggle sidebar visibility
 * @param {string} props.activeTab - Name of the currently active tab
 * @param {Function} props.setActiveTab - Function to update the active tab
 * @param {Object} props.selectedSubCat - Currently selected sub-category object
 * @param {Function} props.setSelectedSubCat - Function to update selected sub-category
 * @param {boolean} props.finish - Indicates if the current sub-category is complete
 * @param {Function} props.setFinish - Function to toggle completion status
 * @returns {JSX.Element} A responsive tabbed interface with category navigation and content area
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
  } = props;
  const [mobile] = useMediaQuery('(min-width: 800px)');
  const tabRef = useRef();
  const [childContent, setChildConent] = useState({});
  const [tabHeader, setTabHeader] = useState([]);
  const [loading] = useState(false);
  const [cascade, setCascade] = useState(false);
  const [subCategory, setSubCategory] = useState([]);

  // Extract headers and child content from TabPane children when component mounts or props change
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
  // On activeTab change, update internal state and set sub-categories for the selected tab
  useEffect(() => {
    const value = activeTab;
    // const value = activeTab || 'Personnel';
    const active = tabRef.current.filter((val) => val.name === value)[0];


    if (active) {
      setActiveTab(active?.name);
      setCascade(true);
      setSubCategory(active?.subCategories);
      setSelectedSubCat(active?.subCategories[0]);
    }
  }, [activeTab, tabRef]);

  /**
   * Handles clicks on main tab items and sub-category items.
   * Toggles cascade or changes selected tab/sub-category.
   *
   * @param {string} tab - The name of the clicked tab
   * @param {number} type - Indicator if the click was on a sub-category
   * @param {Object} subCategoryDetails - Optional sub-category object to set
   */
  const onClickTabItem = (tab, type, subCategoryDetails) => {
    if (tab === activeTab && !type) {
      setCascade(!cascade);
      setFinish(false);
    } else if (tab === activeTab && type) {
      setCascade(true);
      setFinish(false);
      setSelectedSubCat(subCategoryDetails);
      console.log('subCategoryDetails', subCategoryDetails);
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

  // Render the full layout with sidebar (left) and tab content (right)
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
            </div>
          </div>
          <div className="height-20"></div>
          <div className="padding-bottom-10">
            {/* Display progress bar if any progress has been made */}
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
              {/* Loop through each tab item and render the clickable sidebar list */}
              {tabHeader.map(({name: item, icon1, icon2}) => {
                return (
                  <Stack
                    key={nanoid()}
                    style={
                      isNumber(progress) ?
                        null :
                          {
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
                          {item}
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

                          >
                            <img
                              src={
                                activeTab === item && cascade ?
                                  dropDownExpanded :
                                  dropDownCompressed
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
                    {/* If the tab is active and cascade is true, show the list of sub-categories */}
                    {activeTab === item && cascade ?
                      subCategory.map((val) => (

                        <div
                          key={nanoid()}
                          onClick={() => {
                            isNumber(progress) && onClickTabItem(item, 1, val);
                          }}
                          className="flex-row-middle flex-space-between padding-x-4 padding-y-3 background-secondary"
                          style={
                            selectedSubCat?.id === val.id ? {backgroundColor: 'darkgray'} : {}
                          }
                        >
                          <div className="text-small weight-medium text-color-body-text">
                            {val.name + '(' +val.sort_order+ ')'}
                          </div>
                        </div>
                      )) :
                      ''}
                  </Stack>
                );
              })}
            </div>
          </div>
        </div>
      </Stack>
      {/* Render content associated with the currently active tab */}
      {activeTab ? (
        Object.keys(childContent).map((key) => {
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
        // Show assessment overview if no active tab is selected
        <AssessmentOverview
          tabHeaders={tabHeader} onClickTabItems={onClickTabItem} progress={progress} />
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
  selectedSubCat: propTypes.any,
  showSideBar: propTypes.any,
  activeTab: propTypes.any,
  setActiveTab: propTypes.any,
  finish: propTypes.any,
  setFinish: propTypes.any,
};

export default Tabs;
