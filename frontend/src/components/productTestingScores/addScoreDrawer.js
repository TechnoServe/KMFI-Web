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

import * as XLSX from 'xlsx';
import FORTIFY_CONFIG from '../../config/fortification.json';

// ---- Export helpers (shared logic with Edit drawer) ----------------------
const sanitizeFilename = (str) => (str || 'export')
  .toString()
  .replace(/[^a-z0-9\-_. ]/gi, '_')
  .replace(/\s+/g, '_')
  .substring(0, 80);

const getProductTypeName = (pt) => (typeof pt === 'string' ? pt : (pt?.name || ''));

// Normalize micronutrient names to match config keys
const normalizeNutrientName = (raw) => {
  const s = (raw || '').toString().trim();
  if (!s) return '';
  if (/(^|\b)aflatoxin(\b|\W)/i.test(s)) return 'Aflatoxin';
  if (/iron/i.test(s)) return 'Iron';
  if (/(^|\b)vit(amin)?\s*a(\b|\W)/i.test(s)) return 'Vitamin A';
  if (/(niacin|vit(amin)?\s*b\s*\(?\s*niacin\s*\)?|vit(amin)?\s*b\s*3)/i.test(s)) return 'Vitamin B3';
  return s;
};

const toPercent = (value, base) => {
  const v = Number(value); const b = Number(base);
  if (!isFinite(v) || !isFinite(b) || b === 0) return null;
  return (v / b) * 100;
};

const resolveBand = (nutrient, productTypeName, percent) => {
  if (percent == null) return {band: 'N/A', score: 0};
  const rulesByType = FORTIFY_CONFIG.bands[nutrient];
  const rules = rulesByType?.[productTypeName] || rulesByType?.default || [];
  for (const r of rules) {
    if (percent >= r.min && percent <= r.max) return {band: r.label, score: r.score};
  }
  return {band: 'N/A', score: 0};
};

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
const AddScoreDrawer = ({isOpen, onClose, productType, brandId, brandName, productMicroNutrients, companyId, cycleId}) => {
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

  const onDownloadEditedScore = () => {
    try {
      const payload = {
        brand_name: brandName,
        brand_id: brandId,
        company_id: companyId,
        product_type: productType?.name || productType,
        cycle_id: cycleId,
        unique_code: uniqueCode,
        sample_production_date: startDate,
        sample_product_expiry_date: expiryDate,
        sample_collector_names: sampleCollectorName,
        sample_collection_location: sampleCollectorLocation,
        sample_batch_number: sampleBatchNumber,
        sample_size: sampleSize,
        aflatoxinValue: productType?.aflatoxin ? aflatoxinValue : undefined,
        results: (results || []).map((r) => ({
          name: r?.name,
          unit: r?.unit,
          expected_value: r?.expected_value,
          value: r?.value
        }))
      };

      const pTypeName = getProductTypeName(payload.product_type);
      const fortifiedRows = (payload.results || []).map((r) => {
        const origName = (r?.name || '').trim();
        const name = normalizeNutrientName(origName);
        // Aflatoxin special handling
        if (/aflatoxin/i.test(name)) {
          const thr = FORTIFY_CONFIG.standards.Aflatoxin.threshold;
          const pct = toPercent(r.value, thr);
          const {band, score} = resolveBand('Aflatoxin', 'default', pct);
          const pctRounded = (pct == null) ? null : Math.round(pct * 100) / 100;
          return {name: origName, unit: r.unit, min: '-', max: thr, measured: r.value, percent: pctRounded, band, score};
        }
        // Standards lookup with fallback to expected_value
        const std = (FORTIFY_CONFIG.standards[pTypeName] || {})[name];
        const min = (std && typeof std.min === 'number') ? std.min : (typeof r.expected_value === 'number' ? r.expected_value : null);
        const max = (std && (typeof std.max === 'number')) ? std.max : null;
        const rawPct = min != null ? toPercent(r.value, min) : null;
        const pct = (rawPct == null) ? null : Math.round(rawPct * 100) / 100;
        const {band, score} = resolveBand(name, pTypeName, rawPct);
        return {name: origName, unit: r.unit, min, max, measured: r.value, percent: pct, band, score};
      });

      const avgScore = (() => {
        const scores = fortifiedRows.map((r) => r.score).filter((s) => typeof s === 'number' && isFinite(s));
        return scores.length ? (scores.reduce((a, b)=>a+b, 0) / scores.length) : null;
      })();

      const sheetData = [
        ['Field', 'Value'],
        ['Brand Name', payload.brand_name],
        ['Brand ID', payload.brand_id],
        ['Company ID', payload.company_id],
        ['Product Type', pTypeName],
        ['Cycle ID', payload.cycle_id],
        ['Unique Code', payload.unique_code],
        ['Sample Production Date', payload.sample_production_date],
        ['Sample Product Expiry Date', payload.sample_product_expiry_date],
        ['Sample Collector Names', payload.sample_collector_names],
        ['Sample Collection Location', payload.sample_collection_location],
        ['Sample Batch Number', payload.sample_batch_number],
        ['Sample Size', payload.sample_size],
        ['Average Weighted Score', avgScore],
        [],
        ['Micronutrient Results (Configured Standards & Bands)'],
        ['Name', 'Unit', 'Min (100%)', 'Max', 'Measured', '% of Expected', 'Band', 'Weighted Score'],
        ...fortifiedRows.map((r) => [r.name, r.unit, r.min, r.max ?? '-', r.measured, r.percent, r.band, r.score])
      ];

      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Edited Score');

      const filename = `${sanitizeFilename(payload.brand_name)}_${sanitizeFilename(payload.unique_code || 'score')}_${sanitizeFilename(String(cycleId))}.xlsx`;
      XLSX.writeFile(wb, filename);
    } catch (err) {
      toast({
        title: 'Download failed',
        description: err?.message || 'Could not create the Excel file.',
        status: 'error',
        duration: 7000,
        isClosable: true
      });
    }
  };

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
                        Add Product Test for {brandName}
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
          <Button variant="outline" mr={3} onClick={onClose}>
                            Cancel
          </Button>
          <Button mr={3} onClick={onDownloadEditedScore}>
                            Download Excel
          </Button>
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
  brandName: propTypes.string,
  productMicroNutrients: propTypes.any,
  companyId: propTypes.any,
  cycleId: propTypes.any
};

export default AddScoreDrawer;
