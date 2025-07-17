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

/**
 * AddScoreDrawer is a drawer form component that allows users to input
 * and submit new product test scores for a given brand during a cycle.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls drawer visibility
 * @param {function} props.onClose - Callback function to close the drawer
 * @param {Object} props.productType - Product type object, includes aflatoxin toggle
 * @param {any} props.brandId - ID of the brand to associate test results with
 * @param {Array<Object>} props.productMicroNutrients - List of micronutrients to be scored
 * @param {any} props.companyId - ID of the company being tested
 * @param {any} props.cycleId - ID of the self-assessment cycle
 * @returns {JSX.Element} Drawer form for entering and saving product test scores
 */
const AddScoreDrawer = ({isOpen, onClose, productType, brandId, productMicroNutrients, companyId, cycleId}) => {
  const cancelRef = React.useRef();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [sampleCollectorName, setSampleCollectorName] = useState('');
  const [sampleCollectorLocation, setSampleCollectorLocation] = useState('');
  const [sampleBatchNumber, setSampleBatchNumber] = useState('');
  const [sampleSize, setSampleSize] = useState('');
  const [uniqueCode, setUniqueCode] = useState('');
  const [results, setResults] = useState(productMicroNutrients);
  const [aflatoxinValue, setAflatoxinValue] = useState(0);

  /**
   * Submits the form data to the backend to create a new product test entry.
   * Displays success or error toast notification.
   *
   * @returns {Promise<void>}
   */
  const handleAddScore = async () => {
    setLoading(true);
    try {
      const {data: res} = await request(true).post(`companies/${companyId}/products-tests`, {
        brand_id: brandId,
        company_id: companyId,
        cycle_id: cycleId,
        sample_production_date: startDate,
        sample_product_expiry_date: expiryDate,
        sample_collector_names: sampleCollectorName,
        sample_collection_location: sampleCollectorLocation,
        sample_batch_number: sampleBatchNumber,
        sample_size: sampleSize,
        unique_code: uniqueCode,
        scores: results,
        aflatoxinValue: aflatoxinValue
      });
      toast({
        title: 'Product test added successfully',
        status: 'success',
        duration: 5000,
        isClosable: true
      });
      onClose();
    } catch (error) {
      toast({
        title: 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles input changes for micronutrient values and updates local state.
   *
   * @param {Object} e - Input change event
   * @param {number} index - Index of the nutrient being updated
   * @returns {void}
   */
  const onInputChangeResults = (e, index) => {
    const {name, value} = e.target;
    const newResults = [...results];
    newResults[index].value = Number(value);
    setResults(newResults);
  };

  /**
   * Updates the aflatoxin value in component state.
   *
   * @param {number} value - Aflatoxin numeric value
   * @returns {void}
   */
  const onInputChangeAflatoxin = (value) => {
    setAflatoxinValue(value);
  };

  /**
   * Handles text input changes for sample details and updates state accordingly.
   *
   * @param {Object} e - Input change event
   * @returns {void}
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

  return (
    <Drawer
      isOpen={isOpen}
      placement="left"
      onClose={onClose}
      size="md"
    >
      <DrawerOverlay
        bg='blackAlpha.300'
        // backdropFilter='blur(10px) hue-rotate(90deg) invert(50%)'
        backdropFilter='auto'
        backdropInvert='80%'
        backdropBlur='2px'
      />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
                        Add Product Test
        </DrawerHeader>
        <DrawerBody>
          <Stack spacing={4}>
            {/* Render input for Sample Production Date */}
            <FormControl>
              <FormLabel>Sample Production Date</FormLabel>
              <Input type="text" name="sample_production_date" onChange={onInputChange} placeholder="MM/DD/YYY, MM/DD/YYY, MM/DD/YYY" />
            </FormControl>
            {/* Render input for Sample Product Expiry Date */}
            <FormControl>
              <FormLabel>Sample Product Expiry Date</FormLabel>
              <Input type="text" name="sample_product_expiry_date" onChange={onInputChange} placeholder="MM/DD/YYY, MM/DD/YYY, MM/DD/YYY" />
            </FormControl>
            {/* Render input for Sample Collector Names */}
            <FormControl>
              <FormLabel>Sample Collector Names</FormLabel>
              <Input type="text" name="sample_collector_names" onChange={onInputChange} placeholder="Name1, Name2, Name3" />
            </FormControl>
            {/* Render input for Sample Collection Location */}
            <FormControl>
              <FormLabel>Sample Collection Location</FormLabel>
              <Input type="text" name="sample_collection_location" onChange={onInputChange} placeholder="Location1, Location2,Location3" />
            </FormControl>
            {/* Render input for Sample Batch Number */}
            <FormControl>
              <FormLabel>Sample Batch Number</FormLabel>
              <Input type="text" name="sample_batch_number" onChange={onInputChange} placeholder="B1,B2,B3" />
            </FormControl>
            {/* Render input for Sample Size (SKU) */}
            <FormControl>
              <FormLabel>Sample Size (SKU)</FormLabel>
              <Input type="text" name="sample_size" onChange={onInputChange} placeholder="S1,S2,S3" />
            </FormControl>
            {/* Render input for Unique Code */}
            <FormControl>
              <FormLabel>Unique Code</FormLabel>
              <Input type="text" name="unique_code" onChange={onInputChange} />
            </FormControl>
            {/* Conditionally render aflatoxin input if required by productType */}
            {productType.aflatoxin && (
              <FormControl>
                <FormLabel>Aflatoxin Value</FormLabel>
                <NumberInput
                  defaultValue={0}
                  min={0}
                  onChange={onInputChangeAflatoxin}
                  inputMode='decimal'
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
            )}
            {/* Render dynamic input fields for each micronutrient with unit label */}
            <Stack spacing={4}>
              {productMicroNutrients.map((microNutrient, index) => (
                <Box key={index}>
                  <HStack spacing={4}>
                    <FormControl>
                      <FormLabel>
                        {microNutrient.name + '(' + microNutrient.unit + ')'}
                      </FormLabel>
                      <NumberInput
                        defaultValue={0}
                        min={0}
                        inputMode='decimal'
                      >
                        <NumberInputField onChange={(e) => onInputChangeResults(e, index)} />
                      </NumberInput>
                    </FormControl>
                  </HStack>
                </Box>
              ))}
            </Stack>
          </Stack>
        </DrawerBody>
        <DrawerFooter borderTopWidth="1px">
          {/* Cancel button closes the drawer */}
          <Button variant="outline" mr={3} onClick={onClose}>
                            Cancel
          </Button>
          {/* Save button triggers score submission */}
          <Button colorScheme="blue" onClick={handleAddScore} isLoading={loading}>
                            Save
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

AddScoreDrawer.propTypes = {
  isOpen: propTypes.bool,
  onClose: propTypes.func,
  productType: propTypes.any,
  brandId: propTypes.any,
  productMicroNutrients: propTypes.any,
  companyId: propTypes.any,
  cycleId: propTypes.any
};

export default AddScoreDrawer;
