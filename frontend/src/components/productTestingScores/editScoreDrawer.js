import React, {useState} from 'react';
import propTypes from 'prop-types';
import {Flex, Text} from '@chakra-ui/react';
import {request} from 'common';
import * as XLSX from 'xlsx';
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
import FORTIFY_CONFIG from '../../config/fortification.json';

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
const EditScoreDrawer = ({selectedProduct, cycleId, productType, brandName, isOpen, onClose}) => {
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

  const onDownloadEditedScore = () => {
    try {
      const payload = {
        brand_name: brandName || selectedProduct?.brand_name,
        brand_id: selectedProduct?.brand_id,
        company_id: selectedProduct?.company_id,
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
          name: r?.microNutrient?.name || r?.name,
          unit: r?.microNutrient?.unit,
          expected_value: r?.microNutrient?.expected_value,
          value: r?.value
        }))
      };

      // Use config to generate fortification outputs
      const pTypeName = getProductTypeName(payload.product_type);
      const fortifiedRows = (payload.results || []).map((r) => {
        const origName = (r?.name || '').trim();
        const name = normalizeNutrientName(origName);
        // Aflatoxin special-case (not per product type)
        if (/aflatoxin/i.test(name)) {
          const thr = FORTIFY_CONFIG.standards.Aflatoxin.threshold;
          const pct = toPercent(r.value, thr);
          const {band, score} = resolveBand('Aflatoxin', 'default', pct);
          const pctRounded = (pct == null) ? null : Math.round(pct * 100) / 100;
          return {name: origName, unit: r.unit, min: '-', max: thr, measured: r.value, percent: pctRounded, band, score};
        }
        // Standards for this product type & nutrient
        const std = (FORTIFY_CONFIG.standards[pTypeName] || {})[name];
        const min = (std && typeof std.min === 'number') ? std.min : (typeof r.expected_value === 'number' ? r.expected_value : null);
        const max = (std && (typeof std.max === 'number')) ? std.max : null;
        const rawPct = min != null ? toPercent(r.value, min) : null;
        const pct = (rawPct == null) ? null : Math.round(rawPct * 100) / 100;
        const nutrientKey = name;
        const {band, score} = resolveBand(nutrientKey, pTypeName, rawPct);
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
          <DrawerHeader>Edit Product Testing Scores for {brandName}</DrawerHeader>
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
            <Button mr={3} onClick={onDownloadEditedScore} isLoading={false}>
              Download Excel
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
  brandName: propTypes.string,
  isOpen: propTypes.any,
  onClose: propTypes.any
};

export default EditScoreDrawer;
