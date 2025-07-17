import React, {useEffect, useState} from 'react';
// import DatePicker from 'react-datepicker';
import propTypes from 'prop-types';
import 'styles/webflow.css';
import 'styles/mfi-tns.webflow.css';
import 'styles/normalize.css';
import {
  Tabs,
  Container,
  Flex,
  Spacer,
  Text,
  Badge,
  Separator,
  Box,
  Button,
  Input,
  Stack,
  VStack,
  HStack,
  AbsoluteCenter,
  IconButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Icon,
  Avatar,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';

import {request} from 'common';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import {nanoid} from '@reduxjs/toolkit';
import {FiAward, FiEdit, FiEye, FiTrash, FiMoreHorizontal} from 'react-icons/fi';
import {useDisclosure} from '@chakra-ui/react';
import EditScoreDrawer from './editScoreDrawer';

/**
 * ProductModalHeaderV2 displays a list of micronutrient test results for multiple brands.
 * Each accordion panel shows summary data and options to edit or delete test entries.
 *
 * @param {Object} props - Component props
 * @param {Array<Object>} props.productTests - List of test results grouped by brand
 * @param {Array<Object>} props.uniqueBrands - Unused but provided list of brand metadata
 * @param {Object} props.productType - Metadata about the product, includes aflatoxin toggle
 * @param {string} props.cycleId - ID of the current assessment cycle
 * @returns {JSX.Element} Accordion-style UI with edit/delete controls and results display
 */
const ProductModalHeaderV2 = ({productTests, uniqueBrands, productType, cycleId}) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [btnLoad, setBtnLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [show, setShow] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const {isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose} = useDisclosure();
  const {isOpen: isOpenEdit, onOpen: onOpenEdit, onClose: onCloseEdit} = useDisclosure();
  const {isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete} = useDisclosure();
  const cancelRef = React.useRef();

  /**
   * Returns a Chakra UI color name based on MFI score thresholds.
   *
   * @param {number} score - MFI score between 0–30
   * @returns {string} Color name for Chakra Progress colorScheme
   */
  const getBarColor = (score) => {
    if (score >= 30) {
      return 'green';
    }
    if (score >= 25) {
      return 'blue';
    }
    if (score >= 15) {
      return 'yellow';
    }
    if (score >= 10) {
      return 'orange';
    }
    return 'red';
  };
  /**
   * Determines fortification compliance rating from test result percentages.
   *
   * @param {Array<Object>} results - List of micronutrient result objects
   * @returns {{score: string, color: string}} Compliance level and badge color
   */
  const getCompliance = (results) => {
    return results?.map((x) => x.percentage_compliance).every((el) => el >= 80) ? {score: 'Fully Fortified', color: 'green'}
      : results?.map((x) => x.percentage_compliance).some((el) => el >= 51) ? {score: 'Adequately Fortified', color: 'blue'}
        : results?.map((x) => x.percentage_compliance).some((el) => el >= 31) ? {score: 'Inadequately Fortified', color: 'orange'}
          : results?.map((x) => x.percentage_compliance).every((el) => el <= 30) ? {score: 'Not Fortified', color: 'red'}
            :
            '';
  };

  /**
   * Opens the drawer for editing the selected product's test results.
   *
   * @param {Object} product - Selected product test data
   */
  const openDrawer = (product) => {
    setSelectedProduct(product);

    setTimeout(() => {
      onDrawerOpen();
    }, 500
    );
  };

  /**
   * Opens confirmation dialog for deleting a product test result.
   *
   * @param {Object} product - Selected product test to delete
   */
  const openDelete = (product) => {
    setToDelete(product);
    setTimeout(() => {
      onOpenDelete();
    }, 500);
  };

  /**
   * Sends DELETE request to remove a product test record from the backend.
   *
   * @returns {Promise<void>}
   */
  const deleteProduct = async () => {
    setBtnLoading(true);
    try {
      const {data: res} = await request(true).delete(`admin/micronutrient/${toDelete.id}`);
      onCloseDelete();
      window.location.reload();
    } catch (error) {
      console.log(error);
    } finally {
      setBtnLoading(false);
    }
  };


  return (
    <>
      {/* Accordion section with brand test results and edit/delete menu */}
      <Stack my="4">
        <Accordion borderWidth={0} borderStyle={'none'} variant="plain" defaultIndex={[0]} allowToggle index={currentIndex} onChange={(index) => setCurrentIndex(index)}>
          {productTests?.map((brand, index) => (
            <AccordionItem key={index} id={index} borderWidth={0} borderStyle={'none'}>
              <h2>
                <AccordionButton spacing={4} px={3} _expanded={{bg: 'gray.100'}} _focus={{boxShadow: 'none'}} _hover={{bg: 'gray.100'}}>
                  {/* <AccordionIcon /> */}
                  <Flex flex='1'>
                    <Avatar size={'sm'} icon={<FiAward fontSize={'16px'}/>} bg={getCompliance(brand?.results).color + '.100'} />
                    <VStack ml='3' flex='1' alignItems='space-between'>
                      <HStack flex='1' justifyContent='space-between' w='100%' pr={1}>
                        <Text fontWeight='bold'>
                          {/* <Badge colorScheme={getCompliance(brand?.results).color} variant='subtle' fontSize={'sm'} fontWeight='bold'>
                          {getCompliance(brand?.results).score}
                        </Badge> */}
                          {getCompliance(brand?.results).score}
                        </Text>
                        <Text fontWeight='bold'>{productType.aflatoxin ? (brand?.fortification.overallKMFIWeightedScore.toFixed(2)) : (brand?.fortification.score.toFixed(2))}%</Text>
                      </HStack>
                      <Text as='sup' textAlign={'left'} title={moment(brand?.results[0]?.created_at).format('MMMM Do YYYY')} >{moment(brand?.results[0]?.created_at).format('MMM Do')}</Text>
                    </VStack>
                  </Flex>
                </AccordionButton>
              </h2>
              <AccordionPanel>
                <Menu>
                  <MenuButton isRound as={IconButton} aria-label="Options" icon={<FiMoreHorizontal />} variant="ghost" size="xs" minWidth={7} ml={'-8px'} mt={'-11px'} />
                  <MenuList>
                    <MenuItem aria-label='Edit Score' value="edit" icon={<FiEdit strokeWidth="3" />} onClick={() => openDrawer(brand)}>Edit</MenuItem>
                    <MenuItem aria-label='Delete Score' value="delete" color="red" icon={<FiTrash color='red' />} onClick={() => openDelete(brand)}>Delete</MenuItem>
                  </MenuList>
                </Menu>
                <Stack mb="4">
                  {/* Individual micronutrient test breakdown using Chakra UI Stat */}
                  {brand?.results?.map((nutrient) => (
                    <Stat key={nanoid()} size="sm">
                      <HStack>
                        <StatLabel flex="1">{nutrient?.microNutrient?.name}</StatLabel>
                        <StatNumber>{nutrient.mfiScore.toFixed(2)}%</StatNumber>
                      </HStack>

                      <StatHelpText fontSize="xs" mb="2">Value: {nutrient?.value} | % Compliance: {nutrient?.percentage_compliance}%</StatHelpText>
                      <Progress size="xs" hasStripe isAnimated max={30} value={nutrient.mfiScore} colorScheme={getBarColor(nutrient.mfiScore)} />
                    </Stat>
                  ))}
                  {/* Optional Aflatoxin section (if productType supports it) */}
                  {productType.aflatoxin &&
                  <Stat key={nanoid()} size="sm">
                    <HStack>
                      <StatLabel flex="1">Aflatoxin</StatLabel>
                      <StatNumber>{brand.aflatoxinScore?.toFixed(2)}%</StatNumber>
                    </HStack>

                    <StatHelpText fontSize="xs" mb="2">Value: {brand.aflatoxinValue?.toFixed(2)} | % Compliance: {brand?.aflatoxin_percent_of_max?.toFixed(2) * 100}%</StatHelpText>
                    <Progress size="xs" hasStripe isAnimated max={30} value={brand.aflatoxinScore} colorScheme={getBarColor(brand.aflatoxinScore)} />
                  </Stat>
                  }
                  <Spacer />
                </Stack>

              </AccordionPanel>

            </AccordionItem>
          ))}
        </Accordion>
      </Stack>

      {/* Edit drawer for updating selected test result */}
      {isDrawerOpen &&
      <EditScoreDrawer isOpen={isDrawerOpen} onClose={onDrawerClose} selectedProduct={selectedProduct} productType={productType} cycleId={cycleId} />
      }
      {/* AlertDialog to confirm deletion of selected test result */}
      <AlertDialog
        isOpen={isOpenDelete}
        leastDestructiveRef={cancelRef}
        onClose={onCloseDelete}
        onOpen={onOpenDelete}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Delete Product Test Result
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? You can&apos;t undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onCloseDelete}>
                Cancel
              </Button>
              <Button colorScheme='red' ml={3} onClick={deleteProduct} isLoading={btnLoad}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

ProductModalHeaderV2.propTypes = {
  productTests: propTypes.any,
  uniqueBrands: propTypes.any,
  productType: propTypes.any,
  cycleId: propTypes.any
};

export default ProductModalHeaderV2;
