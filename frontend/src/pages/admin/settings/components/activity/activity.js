import React, {useState, useEffect} from 'react';
import {Container, Text, Box, Divider, useToast, Flex, Spinner, Button, Select, Spacer} from '@chakra-ui/react';
import InputField from 'components/customInput';
import {CSVLink} from 'react-csv';
import PropTypes from 'prop-types';
import 'styles/webflow.css';
import 'styles/mfi-tns.webflow.css';
import 'styles/normalize.css';
import {request} from 'common';
import {formatDate} from 'utills/helpers';
// import {useAuth} from 'hooks/user-auth';
import {usePagination} from 'components/useDashboardPagination';

const Activities = ({uid}) => {
  const [input, setInput] = useState('');
  const [activities, setActivities] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortActivities, setSortActivities] = useState('');
  const toast = useToast();
  const {PaginationButtons, allIndustryScores} = usePagination(activities);

  useEffect(() => {
    const getActivities = async () => {
      setLoading(true);
      const url = 'company/activities?page-size=50&uid=' + uid;

      try {
        const res = await request(true).get(url);
        setActivities(res.data);
        setData(res.data);
        setSortActivities(res.data);
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
    getActivities();
  }, []);


  useEffect(() => {
    setActivities([]);
    data.filter((val) => {
      if (val.company?.company_name.toLowerCase().includes(input.toLowerCase())) {
        setActivities((activities) => [...activities, val]);
      }
    });
  }, [input]);


  const sortIt = (sortBy) => (a, b) => {
    if (a[sortBy] > b[sortBy]) {
      return 1;
    } else if (a[sortBy] < b[sortBy]) {
      return -1;
    }
    return 0;
  };

  const sortDesc = (sortBy) => (a, b) => {
    if (a[sortBy] < b[sortBy]) {
      return 1;
    } else if (a[sortBy] > b[sortBy]) {
      return -1;
    }
    return 0;
  };


  const sortActivity = (e) => {
    const index = e.nativeEvent.target.selectedIndex;
    if (e.target.value === 'created_at' || e.target.value === 'company_name') {
      const sorted = [...sortActivities].sort(sortIt(e.target.value));
      setCompanies(sorted);
    }

    if (e.target.value === 'company_name' && e.nativeEvent.target[index].text === 'A-Z, Bottom - Top') {
      const sorted = [...sortCompanies].sort(sortDesc(e.target.value));
      setCompanies(sorted);
    }
    ;
  };

  const headers = [
    {label: 'Company Name', key: 'company_name'},
    {label: 'Action', key: 'action'},
    {label: 'Date', key: 'created_at'},

  ];

  const dataCSV = activities?.map((item) => (
    {
      company_name: item?.company ? item?.company?.company_name:'NO company Assigned',
      action: item?.action,
      created_at: item?.created_at
    }
  ));

  return (
    <div>
      {
        <>
          <Box bg="#fff" fontFamily="DM Sans">
            <Container maxW="container.xl" border="1px" borderColor="gray.200">
              <Flex
                direction="row"
                justify="space-between"
                alignItems="center"
                p="1rem"
              >
                <Text fontSize="1.25rem" fontWeight="700" lineHeight="1.6275rem">
              Activity Log
                </Text>
                <CSVLink
                  data={dataCSV}
                  headers={headers}
                  target="_blank"
                >
                  <Button
                    colorScheme="teal"
                    loadingText="Downloading"
                    w="8.3125rem"
                    marginRight="0.5rem"
                    bg="#00B27A"
                    fontSize="13px"
                    color="#ffffff"
                  >
                Download CSV
                  </Button>
                </CSVLink>
              </Flex>
            </Container>
            <Divider borderWidth="1px" />

            <Container maxW="container.xl" border="1px" borderColor="gray.200">
              <Flex
                direction="row"
                justify="space-between"
                alignItems="center"
                p="1rem"
                width="100%"
              >
                <InputField
                  placeholder="Search"
                  name="search"
                  onChange={(e) => setInput(e.target.value)}
                  bg="rgba(44,42,100,0.03)"
                  variant="filled"
                  width="31.25rem"
                />

                <Flex direction="row" justify="space-between" width="16rem">
                  <Select size='md' style={{marginTop: '9px', marginLeft: '5px'}} placeholder="Sort" onChange={sortActivity}>
                    <option value="created_at">Date added</option>
                    <option value="company_name">A-Z, Top - Bottom</option>
                    <option value="company_name">A-Z, Bottom - Top</option>
                  </Select>
                  <Spacer />
                </Flex>
              </Flex>
            </Container>
          </Box>

          <Container
            maxW="container.xl"
            border="1px solid gray.200"
            className="background-color-4"
            p="2.5rem"
            height="100vh"
            fontFamily="DM Sans"
          >
            <Text
              fontFamily="DM Sans"
              fontWeight="500"
              fontSize="0.875rem"
              fontStyle="normal"
              color="#1C1D26"
              my="1.5rem"
            >
          Showing {allIndustryScores?.length} Activity Logs
            </Text>
            <div className="table border-1px rounded-large mb-16">
              <div className="table-header padding-x-5 padding-y-4 all-caps text-xs letters-looser border-bottom-1px">
                <div className="flex-child-grow width-64">Company Name</div>
                <div className="flex-child-grow width-40 margin-right-2">Action</div>
                <div className="flex-child-grow width-40">Date</div>
              </div>
              {loading ? (
                <Flex height="100%" width="100%" mb="10" justifyContent="center" alignItems="center">
                  <Spinner />
                </Flex>
              ) :

                allIndustryScores?.map((activity) => (
                  <>
                    <div className="table-body background-color-white rounded-large">
                      <Box className="flex-row-middle flex-align-baseline width-full tablet-flex-column p-6">
                        <div className="flex-child-grow width-64 tablet-margin-bottom-2">
                          <div className="flex-row-middle flex-align-baseline width-full tablet-flex-column">
                            <div className="flex-child-grow width-64 tablet-margin-bottom-2">
                              <div className="weight-medium text-color-1 uppercase">{activity.company?activity?.company?.company_name:'NO company Assigned'} </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-child-grow width-40 margin-right-2 flex-align-center tablet-width-full tablet-margin-bottom-2">
                          <span className="table-responsive-header all-caps text-xs letters-looser">Action </span>
                          {activity.action}
                        </div>
                        <div className="flex-child-grow width-40 margin-right-2 flex-align-center tablet-width-full">
                          <span className="table-responsive-header all-caps text-xs letters-looser">Date</span>
                          {formatDate(new Date(activity.created_at))}
                        </div>
                      </Box>
                    </div>
                    <Divider bg="#000000" border="1px" borderColor="#FAFAFA" />
                  </>
                ))}

            </div>
            <PaginationButtons />
          </Container>
        </>

      }
    </div >

  );
};

Activities.propTypes = {
  uid: PropTypes.any
};


export default Activities;
