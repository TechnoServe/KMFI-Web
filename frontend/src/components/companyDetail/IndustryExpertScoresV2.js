import React, {useState} from 'react';
import propTypes from 'prop-types';
import {Text} from '@chakra-ui/react';
import {
  Stack,
  HStack,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  FormControl,
  FormLabel,
  FormHelperText,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Box,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  useDisclosure,
  Portal
} from '@chakra-ui/react';
import 'styles/webflow.css';
import 'styles/mfi-tns.webflow.css';
import 'styles/normalize.css';
import {FiEdit, FiRefreshCw, FiMoreVertical, FiInfo} from 'react-icons/fi';

import {request} from 'common';

/**
 * IndustryExpertScoresV2 allows input and computation of IEG scores for a given company and cycle.
 * It fetches the relevant categories and scores, shows a drawer for editing, and renders popovers for viewing.
 *
 * @param {Object} props - Component props
 * @param {Object} props.company - The company object with ID and name
 * @param {string|number} props.cycleId - The cycle ID to compute scores for
 * @returns {JSX.Element} Popover and drawer UI for IEG score input and computation
 */
const IndustryExpertScoresV2 = ({company, cycleId}) => {
  const companyId = company?.id;
  const {isOpen: isAlertDialogOpen, onOpen: onAlertDialiogOpen, onClose: onAlertDialogClose} = useDisclosure();
  const {isOpen: isDrawerOpen, onOpen: onDawerOpen, onClose: onDrawerClose} = useDisclosure();
  const cancelRef = React.useRef();
  const drawerTriggerRef = React.useRef();
  const [, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState([]);
  const toast = useToast();
  const [scores, setScores] = useState([
    {
      company_id: companyId,
      category_id: 'cLAomX2miF601colFBvC',
      cycle_id: cycleId,
      name: 'People Management Systems',
      type: 'IEG',
      value: 0,
      weight: 15
    },
    {
      company_id: companyId,
      category_id: 'Q9fYFc9CfTb9GIuJ1U0j',
      cycle_id: cycleId,
      name: 'Production, Continuous Impovement & Innovation',
      type: 'IEG',
      value: 0,
      weight: 25
    },
    {
      company_id: companyId,
      category_id: '1nct2tfnXhO3JDtJ27qn',
      cycle_id: cycleId,
      name: 'Procurement & Inputs Management',
      type: 'IEG',
      value: 0,
      weight: 25
    },
    {
      company_id: companyId,
      category_id: 'DDjEmOJlIbpkwOXgW5hq',
      cycle_id: cycleId,
      name: 'Public Engagement',
      type: 'IEG',
      value: 0,
      weight: 10
    },
    {
      company_id: companyId,
      category_id: '3dUyBma0JsHXcRPdwNyi',
      cycle_id: cycleId,
      name: 'Governance & Leadership Culture',
      type: 'IEG',
      value: 0,
      weight: 25
    }
  ]);


  /**
   * Sends a POST request to compute IEG scores for the given company and cycle.
   * Displays a success or error toast.
   *
   * @returns {Promise<void>}
   */
  const computeIEGScores = async () => {
    setLoading(true);
    try {
      const body = {
        'company-id': companyId,
        'cycle-id': cycleId,
        'assessment-type': 'IEG'
      };
      const res = await request(true).post('assessments/compute-scores', body);
      setLoading(false);
      onAlertDialogClose();
      return toast({
        status: 'success',
        title: 'Success',
        position: 'top-right',
        description: res.data.success,
        duration: 6000,
        isClosable: true,
      });
    } catch (error) {
      setLoading(false);
      console.log(error);
      return toast({
        status: 'error',
        title: 'Error',
        position: 'top-right',
        description: error.response.data.error,
        duration: 6000,
        isClosable: true,
      });
    }
  };

  /**
   * Updates the local score array with the new input value.
   *
   * @param {string|number} val - The new score input value
   * @param {number} id - Index of the score object in the array
   * @returns {void}
   */
  const onInputValueChange = (val, id) => {
    const newArr = [...scores];
    const value = Number(val);
    newArr[id]['value'] = value;
    setScores(newArr);
  };


  /**
   * Fetches assessment categories and the current IEG scores for the company and cycle.
   *
   * @returns {Promise<void>}
   */
  const getCategoriesAndScores = async () => {
    setLoading(true);
    try {
      const {
        data: {data: res},
      } = await request(true).get(`/questions/categories/modal`);
      setCategories(res);
      const {
        data: {data: res2},
      } = await request(true).get(`/company/ieg?cycle-id=${cycleId}&company-id=${company.id}`);
      setScore(res2);
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

  /**
   * Submits user-updated IEG scores to the backend and reloads the page on success.
   *
   * @param {Event} e - Form submit event
   * @returns {Promise<void>}
   */
  const setIEGScores = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const toSend = [];
      for (let i = 0; i < scores.length; i++) {
        const tr = {
          company_id: scores[i].company_id,
          category_id: scores[i].category_id,
          cycle_id: cycleId,
          type: 'IEG',
          value: scores[i].value,
          weight: scores[i].weight
        };
        toSend.push(tr);
      }
      await request(true).post(`assessments/ieg`, toSend);
      // setScores(res.data);
      localStorage.removeItem('company-list');
      setTimeout(function() {
        // body...
        location.reload();
      }, 2000);
      setLoading(false);
      return toast({
        status: 'success',
        title: 'Success',
        position: 'top-right',
        description: '',
        duration: 6000,
        isClosable: true,
      });
    } catch (error) {
      setLoading(false);
      console.log(error);
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

  // const unique = function getUniqueListBy(score, key) {
  //   return [...new Map(score.map((item) => [item.category[key], item])).values()];
  // };

  // const arr1 = unique(score, 'description');

  return (
    <>
      <Popover isLazy={true}>
        <HStack gap="0">
          <span fontSize="sm">{company?.computedScores?.find((item) => item.score_type === 'IEG')?.value}%</span>
          <PopoverTrigger>
            <IconButton size="xs" variant="ghost" rounded="full" onClick={() => getCategoriesAndScores()} aria-label="More Info" icon={<FiInfo />}/>
          </PopoverTrigger>
          <Menu>
            <MenuButton as={IconButton} aria-label="Options" icon={<FiMoreVertical />} variant="ghost" size="xs" />
            <MenuList>
              <MenuItem onClick={onDawerOpen} aria-label='Edit IEG' icon={<FiEdit strokeWidth="3"/>}>Edit</MenuItem>
              <MenuItem onClick={onAlertDialiogOpen} aria-label='Compute IEG Scores' icon={<FiRefreshCw strokeWidth="3" />}>Compute</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
        <Portal>
          <PopoverContent>
            <PopoverArrow />
            <PopoverHeader fontWeight="bold">IEG Scores</PopoverHeader>
            <PopoverCloseButton />
            <PopoverBody>
              {/* // Display loading skeletons or the actual list of score progress bars */}
              <Stack my="4" spacing="4">
                {loading && (
                  <Stack spacing={4}>
                    <SkeletonCircle size="10" isLoaded={!loading}/>
                    <SkeletonText noOfLines={10} spacing="4" isLoaded={!loading}/>
                  </Stack>
                )
                }


                {!loading && score?.map((item, i) => (
                  // Render individual IEG category score and progress bar
                  <Stat key={i} maxW="300px" size="sm">
                    <HStack justifyContent={'space-between'}>
                      <StatLabel flexGrow={1} maxW="80%" fontSize="sm" isTruncated title={item.category.name}>{item.category.name}</StatLabel>
                      <StatNumber>{item.value === 0 ? '' : item.value}%</StatNumber>
                    </HStack>
                    <StatHelpText fontSize="sm">Score: {item.score}</StatHelpText>
                    <Progress isAnimated={true} shape="pill" size="xs" value={item.value} max={item.weight} />
                  </Stat>
                ))}
              </Stack>

            </PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>
      <Drawer
        isOpen={isDrawerOpen}
        placement='right'
        onClose={onDrawerClose}
        finalFocusRef={drawerTriggerRef}
        size='sm'
      >
        <DrawerOverlay
          bg='blackAlpha.300'
          backdropFilter='blur(10px) hue-rotate(90deg) invert(70%)'
        />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Input IEG Scores</DrawerHeader>

          <DrawerBody>
            <Box >
              <Text mb={5}>Please provide company IEG details below.</Text>
              {/* // Render numeric input for each IEG score with a live weighted percentage display */}
              {scores.map((item, i) => (
                <FormControl key={i} my={4}>
                  <FormLabel>{item.name}</FormLabel>
                  <NumberInput
                    my={1}
                    defaultValue={0}
                    min="0"
                    max="100"
                    value={item.value}
                    step={1}
                    onChange={(value) => onInputValueChange(value, i)}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormHelperText>Weighted Score: {(item.value*(item.weight/100)).toFixed(2)}%</FormHelperText>
                </FormControl>
              ))}
            </Box>
          </DrawerBody>
          <DrawerFooter>
            <Button variant='outline' mr={3} onClick={onDrawerClose}>
            Cancel
            </Button>
            <Button isLoading={loading} onClick={setIEGScores}>Save</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* // Confirmation dialog before computing IEG results */}
      <AlertDialog
        isOpen={isAlertDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={onAlertDialogClose}
      >
        <AlertDialogOverlay
          bg='blackAlpha.300'
          backdropFilter='blur(10px) hue-rotate(90deg)'
        />
        <AlertDialogContent>
          <AlertDialogHeader fontSize='lg' fontWeight='bold'>
          Compute Results?
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text>Compute IEG Results for <strong>{company.company_name}</strong>?</Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button size='sm' mr={3} variant="outline" ref={cancelRef} onClick={onAlertDialogClose}>Cancel</Button>
            <Button size='sm' colorScheme="green" isLoading={loading} loadingText="Computing..." variant='solid' onClick={computeIEGScores}>Compute</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

IndustryExpertScoresV2.propTypes = {
  company: propTypes.any,
  cycleId: propTypes.any,
  // product: propTypes.any,
};

export default IndustryExpertScoresV2;
