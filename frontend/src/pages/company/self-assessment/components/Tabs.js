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
 * Tabs component renders the navigation and content structure for the self-assessment interface.
 * It handles tab selection, subcategory rendering, and progress display for the current company.
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - TabPane components that include tab name and content
 * @param {number} props.progress - Completion percentage of the self-assessment
 * @param {Function} props.showSideBar - Toggles visibility of the mobile sidebar
 * @param {string} props.activeTab - Currently selected tab/category name
 * @param {Function} props.setActiveTab - Setter for currently active tab
 * @param {Object} props.companyDetails - Information about the company
 * @param {Object} props.selectedSubCat - Currently selected subcategory under the active tab
 * @param {Function} props.setSelectedSubCat - Setter for selected subcategory
 * @param {Function} props.setFinish - Setter indicating completion of current subcategory
 * @param {boolean} props.finish - Flag for subcategory completion
 * @returns {JSX.Element} The rendered tab navigation and dynamic content panel
 */
const Tabs = (props) => {
  const {
    children,
    progress,
    showSideBar,
    activeTab,
    setActiveTab,
    companyDetails,
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

  // Extract headers and children content from TabPane components on mount
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

  // When activeTab changes, update subcategories and cascade state
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
   * Handle tab or subcategory click behavior. Determines how content is updated or cascaded.
   *
   * @param {string} tab - Name of the clicked tab
   * @param {number} type - Flag indicating whether it's a subcategory click
   * @param {Object} subCategoryDetails - Subcategory data passed on click
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

  // Render the sidebar (left) and tab content or overview (right)
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
                src={`https://ui-avatars.com/api/?background=random&name=${companyDetails?.company_name.trim()}$rounded=true`}
                loading="lazy"
                width="48"
                style={{borderRadius: '50%'}}
                alt=""
                className="rounded-large margin-right-4"
              />
              <div>
                <h6 className="margin-bottom-1">{companyDetails?.company_name}</h6>
              </div>
            </div>
          </div>
          <div className="height-20"></div>
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
                    <div className="flex-row-middle flex-space-between padding-4 border-bottom-1px">
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
                            onClick={() => isNumber(progress) && onClickTabItem(item)}
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
                            {val.name}
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
        <AssessmentOverview
          tabHeaders={tabHeader} onClickTabItems={onClickTabItem} progress={progress} />
      )}
    </Flex>
  );
};

// Validate that children are of type TabPane and define prop types
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
};

export default Tabs;
