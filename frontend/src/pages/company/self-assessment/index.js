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
import EmptyTab from './components/empty-tab';
import {useSelector} from 'react-redux';
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


console.log(cats);

/**
 * Renders the Self-Assessment interface which loads SAT categories
 * and displays them as tabbed components per company tier and status.
 *
 * @component
 * @param {Object} props - React component props
 * @param {boolean} props.showSideBar - Controls whether the sidebar is shown
 * @returns {JSX.Element} Self-Assessment view (locked, loading, tabs, or fallback)
 */
const selfAssessment = ({showSideBar}) => {
  // const user = useSelector((state) => state.auth.user);
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.auth.user);
  const cycle = useSelector((state) => state.auth.cycle);
  const locked = cycle?.locked;
  const [progress] = useState(0);
  const [activeTab, setActiveTab] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedSubCat, setSelectedSubCat] = useState({});
  const [finish, setFinish] = useState(false);

  // Fetch assessment categories, map them to icons, and update state
  const getCategories = async () => {
    try {
      const {data: res} = await request(true).post('/questions/categories', {
        sorted: 1,
      });

      const plainCategories = res.data;
      // Exclude the category with ID 'mQ0t5QvDRNae05mc1XVw' from display
      const category = [];
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
      console.error(error);
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
  // On component mount, fetch assessment categories
  useEffect(() => {
    getCategories();
  }, []);

  // Display locked message, spinner, tabs interface, or fallback view
  return locked ? (
    <Flex
      height="100%"
      width="100%"
      justifyContent="center"
      alignItems="center
    "
    >
      <h1>Sorry SAT has been locked!</h1>
    </Flex>
  ) : loading ? (
    <Flex
      height="100%"
      width="100%"
      justifyContent="center"
      alignItems="center
    "
    >
      <Spinner />
    </Flex>
  ) : user.company?.tier ? (
    <>
      <Tabs
        progress={progress}
        showSideBar={showSideBar}
        activeTab={activeTab}
        companyDetails={user.company}
        setActiveTab={setActiveTab}
        finish={finish}
        setFinish={(val) => setFinish(val)}
        selectedSubCat={selectedSubCat}
        setSelectedSubCat={(val) => setSelectedSubCat(val)}
      >
        {/* Map each category into a TabPane containing its associated Tab component */}
        {categories.map(({component: Comp, name, icon2, icon1, id, children}) => (
          <TabPane
            name={name}
            categoryId={id}
            icon1={icon1}
            icon2={icon2}
            key={nanoid()}
            subCategories={children}
          >
            {/* Render category-specific tab component inside the TabPane */}
            <Comp
              name={name}
              companyDetails={user.company}
              categoryId={id}
              finish={finish}
              setFinish={(val) => setFinish(val)}
              selectedSubCat={selectedSubCat}
              subCategories={children}
              setSelectedSubCat={(val) => setSelectedSubCat(val)}
            />
          </TabPane>
        ))}
      </Tabs>
    </>
  ) : (
    <Flex flex="1" minHeight="90vh" className="padding-0 background-color-white">
      <EmptyTab progress={null} />
    </Flex>
  );
};

export default selfAssessment;
