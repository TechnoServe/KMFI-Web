import React, {useState} from 'react';
import propTypes from 'prop-types';
import {Flex, Text} from '@chakra-ui/react';
import {request} from 'common';
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
  Portal,
  Input
} from '@chakra-ui/react';
import 'styles/webflow.css';
import 'styles/mfi-tns.webflow.css';
import 'styles/normalize.css';
import {FiEdit, FiRefreshCw, FiMoreVertical, FiInfo} from 'react-icons/fi';

/**
 * EditScoreDrawer allows users to edit and update existing product testing scores
 * through a drawer form interface.
 *
 * @param {Object} props - Component props
 * @param {Object} props.selectedProduct - Product data object selected for editing
 * @param {string|number} props.cycleId - ID of the current assessment cycle
 * @param {Object} props.productType - Metadata for the product type (includes aflatoxin flag)
 * @param {boolean} props.isOpen - Drawer visibility flag
 * @param {Function} props.onClose - Callback to close the drawer
 * @returns {JSX.Element} The drawer form to update product testing scores
 */
const EditScoreDrawer = ({selectedProduct, cycleId, productType, isOpen, onClose}) => {
  const cancelRef = React.useRef();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [info, setInfo] = useState(null);
  const [startDate, setStartDate] = useState(selectedProduct?.sample_production_date);
  const [expiryDate, setExpiryDate] = useState(selectedProduct?.sample_product_expiry_date);
  const [sampleCollectorName, setSampleCollectorName] = useState(selectedProduct?.sample_collector_names);
  const [sampleCollectorLocation, setSampleCollectorLocation] = useState(selectedProduct?.sample_collection_location);
  const [sampleBatchNumber, setSampleBatchNumber] = useState(selectedProduct?.sample_batch_number);
  const [sampleSize, setSampleSize] = useState(selectedProduct?.sample_size);
  const [uniqueCode, setUniqueCode] = useState(selectedProduct?.unique_code);
  const [results, setResults] = useState(selectedProduct?.results ? selectedProduct.results : []);
  const [aflatoxinValue, setAflatoxinValue] = useState(productType?.aflatoxin ? selectedProduct?.aflatoxinValue : 0);

  /**
   * Handle change for aflatoxin input field.
   *
   * @param {number} value - New aflatoxin value input by user
   */
  const onInputChangeAflatoxin = (value) => {
    setAflatoxinValue(value);
  };

  /**
   * Update micronutrient result values in state.
   *
   * @param {Object} e - Change event
   * @param {number} index - Index of the result item being edited
   */
  const onInputChangeResults = (e, index) => {
    const {name, value} = e.target;
    const newResults = [...results];
    newResults[index].value = Number(value);
    setResults(newResults);
  };

  /**
   * Append an empty result input block to the result list.
   */
  const onAddResult = () => {
    setResults([...results, {name: '', value: ''}]);
  };

  /**
   * Remove a result input block from the result list.
   *
   * @param {number} index - Index of the result to remove
   */
  const onRemoveResult = (index) => {
    const newResults = results.filter((result, i) => i !== index);
    setResults(newResults);
  };

  /**
   * Handle general input field changes and update corresponding state.
   *
   * @param {Object} e - Input change event
   */
  const onInputChange = (e) => {
    const {name, value} = e.target;
    switch (name) {
      case 'sample_production_date':
        setStartDate(value);
        break;
      case 'sample_product_expiry_date':
        setExpiryDate(value);
        break;
      case 'sample_collector_names':
        setSampleCollectorName(value);
        break;
      case 'sample_collection_location':
        setSampleCollectorLocation(value);
        break;
      case 'sample_batch_number':
        setSampleBatchNumber(value);
        break;
      case 'sample_size':
        setSampleSize(value);
        break;
      case 'unique_code':
        setUniqueCode(value);
        break;
      default:
        break;
    }
  };

  /**
   * Refresh product testing score data from server and update UI state.
   */
  const onRefresh = () => {
    setLoadingRefresh(true);
    request()
      .get(`/product-testing-scores/${selectedProduct.id}`)
      .then(({data}) => {
        setEdibleOil(data.edible_oil);
        setMaizeFlour(data.maize_flour);
        setWheatFlour(data.wheat_flour);
        setAflatoxinValue(data.aflatoxin);
        setLoadingRefresh(false);
      })
      .catch((error) => {
        setLoadingRefresh(false);
        toast({
          title: 'Error',
          description: error.response.data.message,
          status: 'error',
          duration: 9000,
          isClosable: true
        });
      });
  };

  /**
   * Submit updated product testing data to the backend API.
   */
  const onEdit = () => {
    setLoading(true);
    const data = {
      sample_production_date: startDate,
      sample_product_expiry_date: expiryDate,
      sample_collector_names: sampleCollectorName,
      sample_collection_location: sampleCollectorLocation,
      sample_batch_number: sampleBatchNumber,
      sample_size: sampleSize,
      unique_code: uniqueCode,
      scores: results,
      aflatoxinValue: aflatoxinValue,
      update: true,
      update_id: selectedProduct.id,
      company_id: selectedProduct.company_id,
      cycle_id: cycleId,
      brand_id: selectedProduct.brand_id
    };
    request(true)
      .post(`companies/${selectedProduct.company_id}/products-tests`, data)
      .then(() => {
        setLoading(false);
        toast({
          title: 'Success',
          description: 'Product testing scores updated successfully',
          status: 'success',
          duration: 9000,
          isClosable: true
        });
        onClose();
      })
      .catch((error) => {
        setLoading(false);
        toast({
          title: 'Error',
          description: error.response.data.message,
          status: 'error',
          duration: 9000,
          isClosable: true
        });
      });
  };

  /**
   * Delete the current product testing score entry from the backend.
   */
  const onDelete = () => {
    setLoadingDelete(true);
    request()
      .delete(`/product-testing-scores/${selectedProduct.id}`)
      .then(() => {
        setLoadingDelete(false);
        toast({
          title: 'Success',
          description: 'Product testing scores deleted successfully',
          status: 'success',
          duration: 9000,
          isClosable: true
        });
        onClose();
      })
      .catch((error) => {
        setLoadingDelete(false);
        toast({
          title: 'Error',
          description: error.response.data.message,
          status: 'error',
          duration: 9000,
          isClosable: true
        });
      });
  };

  return (
    <>
      {/* Blur effect overlay for drawer background */}
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        placement="left"
        size="md"
        finalFocusRef={cancelRef}
      >
        <DrawerOverlay
          bg='blackAlpha.300'
          // backdropFilter='blur(10px) hue-rotate(90deg) invert(50%)'
          backdropFilter='auto'
          backdropInvert='80%'
          backdropBlur='2px'
        />
        {/* Main content block for the drawer */}
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Edit Product Testing Scores</DrawerHeader>
          <DrawerBody>
            <Stack spacing={4}>
              {/* Input field for Sample Production Date */}
              <FormControl id="sample_production_date">
                <FormLabel>Sample Production Date</FormLabel>
                <Input
                  defaultValue={startDate}
                  onChange={onInputChange}
                  name="sample_production_date"
                />
              </FormControl>
              {/* Input field for Sample Product Expiry Date */}
              <FormControl id="sample_product_expiry_date">
                <FormLabel>Sample Product Expiry Date</FormLabel>
                <Input
                  defaultValue={selectedProduct?.sample_product_expiry_date}
                  onChange={onInputChange}
                  name="sample_product_expiry_date"
                />
              </FormControl>
              {/* Input field for Sample Collector Names */}
              <FormControl id="sample_collector_names">
                <FormLabel>Sample Collector Names</FormLabel>
                <Input
                  defaultValue={selectedProduct?.sample_collector_names}
                  onChange={onInputChange}
                  name="sample_collector_names"
                />
              </FormControl>
              {/* Input field for Sample Collection Location */}
              <FormControl id="sample_collection_location">
                <FormLabel>Sample Collection Location</FormLabel>
                <Input
                  defaultValue={selectedProduct?.sample_collection_location}
                  onChange={onInputChange}
                  name="sample_collection_location"
                />
              </FormControl>
              {/* Input field for Sample Batch Number */}
              <FormControl id="sample_batch_number">
                <FormLabel>Sample Batch Number</FormLabel>
                <Input
                  defaultValue={selectedProduct?.sample_batch_number}
                  onChange={onInputChange}
                  name="sample_batch_number"
                />
              </FormControl>
              {/* Input field for Sample Size */}
              <FormControl id="sample_size">
                <FormLabel>Sample Size</FormLabel>
                <Input
                  defaultValue={selectedProduct?.sample_size}
                  onChange={onInputChange}
                  name="sample_size"
                />
              </FormControl>
              {/* Input field for Unique Code */}
              <FormControl id="unique_code">
                <FormLabel>Unique Code</FormLabel>
                <Input
                  defaultValue={selectedProduct?.unique_code}
                  onChange={onInputChange}
                  name="unique_code"
                />
              </FormControl>
              {productType?.aflatoxin && (
              // Input field for Aflatoxin
                <FormControl id="aflatoxin">
                  <FormLabel>Aflatoxin (ppb)</FormLabel>
                  <NumberInput
                    defaultValue={aflatoxinValue}
                    onChange={onInputChangeAflatoxin}
                    name="aflatoxin"
                    inputMode='decimal'
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
              )}
              {/* Render micronutrient value input fields dynamically */}
              {selectedProduct?.results.map((result, index) => (
                <FormControl id="value" key={index}>
                  <FormLabel>{result.microNutrient.name + '(' + result.microNutrient.unit + ')'}</FormLabel>
                  <NumberInput
                    defaultValue={result.value}
                    inputMode='decimal'
                  >
                    <NumberInputField onChange={(e) => onInputChangeResults(e, index)}
                      name={result.microNutrient.name} />
                    <FormHelperText size='sm'>Expected Value: {result.microNutrient.expected_value}</FormHelperText>
                  </NumberInput>
                </FormControl>
              ))}
            </Stack>
          </DrawerBody>
          <DrawerFooter>
            {/* Cancel button to close the drawer */}
            <Button variant="outline" mr={3} onClick={onClose}>
                        Cancel
            </Button>
            {/* Save button to submit edited data */}
            <Button colorScheme="blue" onClick={onEdit} isLoading={loading}>
                        Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

EditScoreDrawer.propTypes = {
  selectedProduct: propTypes.any,
  cycleId: propTypes.any,
  productType: propTypes.any,
  isOpen: propTypes.any,
  onClose: propTypes.any
};

export default EditScoreDrawer;
