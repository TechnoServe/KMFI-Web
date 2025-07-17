import React, {useState, useEffect} from 'react';
import {Flex, useToast, Spinner} from '@chakra-ui/react';
import {request} from 'common';
import Tab from './components/tab';
import briefCaseSelected from 'assets/images/fi_briefcaseSelected.svg';
import boxActive from 'assets/images/fi_boxActive.svg';
import truckActive from 'assets/images/fi_truckActive.svg';
import governActive from 'assets/images/GovernActive.svg';
import publicActive from 'assets/images/fi_globeActive.svg';
import briefCaseActive from 'assets/images/fi_briefcaseActive.svg';
import boxSelected from 'assets/images/fi_boxSelected.svg';
import truckSelected from 'assets/images/fi_truckSelected.svg';
import governSelected from 'assets/images/GovernSelected.svg';
import Tabs from './components/Tabs';
import TabPane from './components/Tabpane';
import publicSelected from 'assets/images/fi_globeSelected.svg';
import {nanoid} from '@reduxjs/toolkit';
// import UploadFileModal from './components/upload-file-modal';

export const cats = [
  {
    // category: 'Personnel',
    pointer: 1,
    icon1: briefCaseActive,
    icon2: briefCaseSelected,
    // component: Tab,
  },
  {
    // category: 'Production',
    pointer: 2,
    icon1: boxActive,
    icon2: boxSelected,
    // component: Tab,
  },
  {
    // category: 'Procurement & Suppliers',
    pointer: 3,
    icon1: truckActive,
    icon2: truckSelected,
    // component: Tab,
  },
  {
    // category: 'Public Engagement',
    pointer: 4,
    icon1: publicActive,
    icon2: publicSelected,
    // component: Tab,
  },
  {
    // category: 'Governance',
    pointer: 5,
    icon1: governActive,
    icon2: governSelected,
    // component: Tab,
  },
];

// console.log('here3');

/**
 * SelfAssessment page component for the admin view.
 * It fetches assessment categories, initializes icons and component mappings,
 * and displays them inside a tabbed interface.
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.showSideBar - Whether to show the sidebar navigation
 * @returns {JSX.Element} The rendered self-assessment page UI
 */
const selfAssessment = ({showSideBar}) => {
  // State to manage initial loading spinner visibility
  const [loading, setLoading] = useState(true);
  // Currently active top-level tab
  const [activeTab, setActiveTab] = useState(null);
  // State to store formatted assessment categories
  const [categories, setCategories] = useState([]);
  // Track selected subcategory object for tab navigation
  const [selectedSubCat, setSelectedSubCat] = useState({});
  const [finish, setFinish] = useState(false);
  const [progress] = useState(0);
  // const [subTab, setSubTab] = useState(null);
  const toast = useToast();

  /**
   * Fetches assessment categories from the API and maps each one to a display icon and Tab component.
   * Updates state with formatted categories and manages loading spinner.
   *
   * @returns {Promise<void>}
   */
  const getCategories = async () => {
    try {
      const {data: res} = await request(true).post('/questions/categories', {
        sorted: 1,
      });
      const plainCategories = res.data;
      const category = [];
      // Filter out excluded category and match each with icon/component info from `cats` array
      plainCategories
        .filter((val) => val.id !== 'mQ0t5QvDRNae05mc1XVw')
        .forEach((val) => {
          let ctegory = {};
          cats.forEach((cat) => {
            if (val.pointer === cat.pointer) {
              ctegory = {
                ...val,
                category: val.name,
                icon1: cat.icon1,
                icon2: cat.icon2,
                component: Tab,
                t: val
              };
            }
          });

          category.push(ctegory);
        });
      setCategories(category.sort((a, b) => a.sort_order - b.sort_order));
      setLoading(false);
    } catch (error) {
      setLoading(false);
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

  // Load categories once on component mount
  useEffect(() => {
    getCategories();
  }, []);

  // Render loading spinner or tab interface based on loading state
  return loading ? (
    <Flex
      height="100%"
      width="100%"
      justifyContent="center"
      alignItems="center
    "
    >
      <Spinner />
    </Flex>
  ) : (
    // Render main tab container with state and handlers passed as props
    <Tabs
      progress={progress}
      showSideBar={showSideBar}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      finish={finish}
      setFinish={(val) => setFinish(val)}
      selectedSubCat={selectedSubCat}
      setSelectedSubCat={(val) => setSelectedSubCat(val)}
    >
      {
        // Loop through categories to create each top-level tab pane
        categories.map(({component: Comp, name, icon2, icon1, id, children, weight, t}) => (
          <TabPane
            name={name}
            categoryId={id}
            icon1={icon1}
            icon2={icon2}
            key={nanoid()}
            subCategories={children}
          >
            <Comp
              mParent={t}
              mWeight={weight}
              parentCategories={categories}
              name={name}
              categoryId={id}
              finish={finish}
              setFinish={(val) => setFinish(val)}
              selectedSubCat={selectedSubCat}
              subCategories={children}
              setSelectedSubCat={(val) => setSelectedSubCat(val)}
            />
          </TabPane>
        ))
      }
    </Tabs>
  );
};

export default selfAssessment;
