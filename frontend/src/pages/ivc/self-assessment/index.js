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
import propTypes from 'prop-types';

export const cats = [
  {
    category: 'People Management Systems',
    icon1: briefCaseActive,
    icon2: briefCaseSelected,
    component: Tab,
  },
  {
    category: 'Production, Continuous Impovement & Innovation',
    icon1: boxActive,
    icon2: boxSelected,
    component: Tab,
  },
  {
    category: 'Procurement & Inputs Management',
    icon1: truckActive,
    icon2: truckSelected,
    component: Tab,
  },
  {
    category: 'Public Engagement',
    icon1: publicActive,
    icon2: publicSelected,
    component: Tab,
  },
  {
    category: 'Governance & Leadership Culture',
    icon1: governActive,
    icon2: governSelected,
    component: Tab,
  },
];

/**
 * Renders the IVC Self-Assessment page with dynamic tabs based on fetched question categories.
 *
 * @param {Object} props - Component props.
 * @param {boolean} props.showSideBar - Flag to show/hide sidebar.
 * @param {Object} props.companyDetailsIVC - Company details for IVC assessment.
 * @param {string} props.cycleId - Current assessment cycle ID.
 * @returns {JSX.Element} The rendered IVC Assessment component.
 */
const IvcAssessment = ({showSideBar, companyDetailsIVC, cycleId}) => {
  // Chakra UI toast hook for displaying feedback messages
  const toast = useToast();
  // Controls loading spinner visibility while fetching category data
  const [loading, setLoading] = useState(true);
  // Placeholder state for tracking assessment progress (currently unused)
  const [progress] = useState(0);
  // Tracks the currently active category tab
  const [activeTab, setActiveTab] = useState(null);
  // Stores the structured category list for rendering tab components
  const [categories, setCategories] = useState([]);
  // Tracks the currently selected sub-category across all categories
  const [selectedSubCat, setSelectedSubCat] = useState({});
  // Indicates whether the assessment process has been completed
  const [finish, setFinish] = useState(false);

  /**
   * Fetches and maps question categories from the API, enhancing them with UI icons and components.
   *
   * @returns {Promise<void>} Resolves after categories are fetched and set in state.
   */
  const getCategories = async () => {
    try {
      const {data: res} = await request(true).post('/questions/categories', {
        sorted: 1,
      });
      const plainCategories = res.data;
      const category = [];
      // Exclude specific category by ID
      plainCategories
        .filter((val) => val.id !== 'mQ0t5QvDRNae05mc1XVw')
        .forEach((val) => {
          let ctegory = {};
          cats.forEach((cat) => {
            if (val.name === cat.category) {
              ctegory = {
                ...val,
                icon1: cat.icon1,
                icon2: cat.icon2,
                component: cat.component,
              };
            }
          });

          category.push(ctegory);
        });
      // Sort and store categories in state
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

  // Show spinner while loading; otherwise render tab layout
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
    <>
      <Tabs
        progress={progress}
        showSideBar={showSideBar}
        activeTab={activeTab}
        companyDetails={{}}
        setActiveTab={setActiveTab}
        finish={finish}
        setFinish={(val) => setFinish(val)}
        selectedSubCat={selectedSubCat}
        setSelectedSubCat={(val) => setSelectedSubCat(val)}
        companyDetailsIVC={companyDetailsIVC}
        cycleId={cycleId}
      >
        {categories.map(({component: Comp, name, icon2, icon1, id, children}) => (
          <TabPane
            name={name}
            categoryId={id}
            icon1={icon1}
            icon2={icon2}
            key={nanoid()}
            subCategories={children}
          >
            <Comp
              name={name}
              companyDetails={{}}
              categoryId={id}
              finish={finish}
              setFinish={(val) => setFinish(val)}
              selectedSubCat={selectedSubCat}
              subCategories={children}
              setSelectedSubCat={(val) => setSelectedSubCat(val)}
              cycleId={cycleId}
            />
          </TabPane>
        ))}
      </Tabs>

      {/* <UploadFileModal /> */}
    </>
  );
};

IvcAssessment.propTypes = {
  showSideBar: propTypes.any,
  companyDetailsIVC: propTypes.any,
  cycleId: propTypes.any,
};

export default IvcAssessment;
