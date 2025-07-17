import React, {useEffect, useState} from 'react';
import propTypes from 'prop-types';
import Loader from 'components/circular-loader';
import 'styles/webflow.css';
import 'styles/mfi-tns.webflow.css';
import 'styles/normalize.css';
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Container,
  Flex,
  Spacer,
  Text,
  Badge,
  Divider,
  Box,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useToast
} from '@chakra-ui/react';
import ChevronLeft from 'assets/images/Chevron-Left.svg';
import {request} from 'common';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import {nanoid} from '@reduxjs/toolkit';


const ProductModalHeader = ({productTest, uniqueBrands}) => {
  console.log('productTest', productTest);
  const {isOpen, onOpen, onClose} = useDisclosure();
  const {isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose} = useDisclosure();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [startDate, setStartDate] = useState(selectedProduct?.sample_production_date);
  const [expiryDate, setExpiryDate] = useState(selectedProduct?.sample_product_expiry_date);
  const [sampleCollectorName, setSampleCollectorName] = useState(selectedProduct?.sample_collector_names);
  const [sampleCollectorLocation, setSampleCollectorLocation] = useState(selectedProduct?.sample_collection_location);
  const [sampleBatchNumber, setSampleBatchNumber] = useState(selectedProduct?.sample_batch_number);
  const [sampleSize, setSampleSize] = useState(selectedProduct?.sample_size);
  const [uniqueCode, setUniqueCode] = useState(selectedProduct?.unique_code);
  const [activeCycle, setActiveCycle] = useState({});
  const [productList, setProductList] = useState([]);
  const [productTests, setProductTests] = useState(selectedProduct?.results);
  const [productMicroNutrients, setProductMicroNutrients] = useState([]);
  const [productMicroNutrient, setProductMicroNutrient] = useState([]);
  const [btnLoad, setBtnLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [edibleOil, setEdibleOil] = useState([]);
  const [maizeFlour, setMaizeFlour] = useState([]);
  const [wheatFlour, setWheatFlour] = useState([]);
  const [aflatoxinValue, setAflatoxinValue] = useState(0);

  const [newEdibleOil, setNewEdibleOil] = useState();
  const [newMaizeFlour, setNewMaizeFlour] = useState();
  const [newWheatFlour, setNewWheatFlour] = useState();

  const [show, setShow] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  console.log('uniqueBrands', uniqueBrands);

  useEffect(() => {
    const fetchCurrentCycle = async () => {
      try {
        const data = await request(true).get(
          `admin/active-cycle`
        );
        setActiveCycle(data.data);
      } catch (error) {
      }
    }; fetchCurrentCycle();

    const fetchProductTypesList = () => {
      return request()
        .get('/product-type-list')
        .then(({data: list}) => {
          setProductList(list);
          return list;
        });
    };
    fetchProductTypesList();

    const fetchProductMicroNutrients = () => {
      return request()
        .get(`/product-micro-nutrients?id=${uniqueBrands.productType.id}`)
        .then(({data: list}) => {
          setProductMicroNutrients(Array.isArray(list)?list:[list]);
          fetchProductMicroNutrient(Array.isArray(list)?list:[list]);
          return list;
        });
    };
    fetchProductMicroNutrients();

    const fetchProductMicroNutrient = (pmn) => {
      return request()
        .get(`/product-micro-nutrient?id=${uniqueBrands.productType.id}`)
        .then(({data: list}) => {
          const mData = Array.isArray(list)?list:[list];
          const arr = [];

          for (let j = 0; j < pmn.length; j++) {
            const obj = {
              name: pmn[j].name,
              expected_value: pmn[j].expected_value,
              unit: pmn[j].unit,
              product_micro_nutrient_id: mData[j].id,
              value: 0
            };
            arr.push(obj);
          }


          console.log('MRR ', arr);
          setProductMicroNutrient(arr);

          switch (uniqueBrands.productType.name) {
            case 'Edible Oil': setEdibleOil(arr); break;
            case 'Maize Flour': setMaizeFlour(arr); break;
            case 'Wheat Flour': setWheatFlour(arr); break;
          }
          return list;
        });
    };
  }, []);


  const toast = useToast();

  const onInputChangeMaizeFlour = (evt) => {
    const newArr = [...maizeFlour];
    const value = evt.target.value;
    newArr[evt.target.dataset.id][evt.target.name] = value;
    setMaizeFlour(newArr);
    setNewMaizeFlour(newArr.map((x) => x.value));
    setNewEdibleOil(0);
    setNewWheatFlour(0);
  };

  const onInputChangeEdibleOil = (evt) => {
    const newArr = [...edibleOil];
    const value = evt.target.value;
    newArr[evt.target.dataset.id][evt.target.name] = value;
    setEdibleOil(newArr);
    setNewEdibleOil(newArr.map((x) => x.value));
    setNewMaizeFlour(0);
    setNewWheatFlour(0);
  };

  const onInputChangeWheatFlour = (evt) => {
    const newArr = [...wheatFlour];
    const value = evt.target.value;
    newArr[evt.target.dataset.id][evt.target.name] = value;
    setWheatFlour(newArr);
    setNewWheatFlour(newArr.map((x) => x.value));
    setNewMaizeFlour(0);
    setNewEdibleOil(0);
  };
  const onInputChangeAflatoxin = (evt) => {
    const value = evt.target.value;
    setAflatoxinValue(value);
  };


  /**
   * Sends a POST request to add or update a product testing score for a given brand.
   *
   * @param {boolean} update - If true, updates an existing test entry; otherwise, creates a new one.
   * @returns {Promise<void>} A Promise that resolves when the API request is complete and toast is shown.
   */
  const setProductTestingScore = async (update = false) => {
    // Start loading state indicators
    setLoading(true);
    setBtnLoading(true);
    try {
      // Extract company ID from the product test brands
      const companyId = productTest?.brands.map((x) => x.company_id);
      // Prepare request payload with all relevant sample and score data
      const body = {
        unique_code: uniqueCode,
        sample_batch_number: sampleBatchNumber,
        brand_id: uniqueBrands.id,
        sample_collector_names: sampleCollectorName,
        sample_production_date: startDate,
        sample_size: sampleSize,
        cycle_id: activeCycle.id,
        scores: newEdibleOil.length >= 1 ? edibleOil : newWheatFlour.length >= 1 ? wheatFlour : newMaizeFlour.length >= 1 ? maizeFlour : '',
        company_id: companyId[0],
        sample_collection_location: sampleCollectorLocation,
        sample_product_expiry_date: expiryDate,
        aflatoxinValue: aflatoxinValue,
        update: update,
        update_id: selectedProduct ? selectedProduct.id : ''
      };

      // Submit product test data to the backend
      await request(true).post(`companies/${companyId[0]}/products-tests`, body);
      setLoading(false);
      setBtnLoading(false);
      // Clear cached company list
      localStorage.removeItem('company-list');
      // Reload page after 1 second to reflect updated data
      setTimeout(function() {
        // body...
        location.reload();
      }, 1000);
      // Show success notification
      return toast({
        status: 'success',
        title: 'Success',
        position: 'top-right',
        description: 'Product Test Added Successfully',
        duration: 10000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      // Stop loading state and show error toast if request fails
      setBtnLoading(false);
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
   * Deletes a specific micronutrient test entry from the backend by its ID.
   *
   * @returns {Promise<void>} A Promise that resolves when the deletion is completed and a toast is displayed.
   */
  const deleteMicronutrientScore = async () => {
    try {
      // Send DELETE request to remove micronutrient score
      await request(true).delete(`admin/micronutrient/${toDelete}`);
      // Reload page after 1 second to refresh UI
      setTimeout(() => {
        location.reload();
      }, 1000);
      // Show toast notification for success or error
      return toast({
        status: 'success',
        title: 'Success',
        position: 'top-right',
        description: 'Product Test Deleted Successfully',
        duration: 10000,
        isClosable: true,
      });
    } catch (error) {
      // Show toast notification for success or error
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

  console.log('productList', productList);
  console.log('productMicroNutrients', productMicroNutrients);
  console.log('productMicroNutrient', productMicroNutrient);

  return (
    <div className="text-medium m-4"><h1 className="my-4">Product Testing Details <span className="text-color-body-text">- Scores</span></h1>

      <div className="w-layout-grid grid">
        <div className="flex-row-middle flex-align-start">
          <div className="background-color-white border-1px box-shadow-large rounded-large w-full">
            <div className="flex-row-middle flex-space-between padding-5">
              <div>
                <h6 className="margin-bottom-0 weight-medium margin-bottom-1">Product Testing Scores</h6>
                <div className="text-small text-color-body-texpt">{uniqueBrands.name}</div>
                <div className="text-small text-color-body-texpt">{uniqueBrands.productType.name}</div>
              </div>
              <div>
                <Button className="button-secondary button-small margin-right-3 w-button focus:outline-none" onClick={onOpen}>Add Score</Button>
              </div>
            </div>
            <div data-duration-in="300" data-duration-out="100" className="w-tabs">

              <div>
                <Tabs className="w-tabs">
                  <TabList className="padding-x-10 border-bottom-1px flex-row-middle background-color-white sticky-top-0 flex-space-around w-tab-menu">
                    <Tab className="tab-link w-inline-block w-tab-link focus:outline-none">
                      <div className="text-small">Scores</div>
                    </Tab>
                  </TabList>

                  <TabPanels className="w-tab-content">
                    <TabPanel>

                      {uniqueBrands.productTests.map((brand) => (
                        <>
                          <Container bgColor="#FAFAFA" height="10rem" p="1rem" my=".75rem">
                            <Flex alignItems="center">
                              <div
                                style={{zIndex: '1000', position: 'absolute', top: '10px'}}
                                data-w-id="96da7984-2260-4962-0d48-c3b889abade4"
                                className={`background-color-white border-1px padding-top-4 box-shadow-large rounded-large width-80 remove-dropdown ${show ? '' : 'hide'
                                }`}
                              >
                                <h6 className="padding-left-4">Are you sure?</h6>
                                <div className="text-small margin-bottom-4 padding-left-4">This data cannot be recovered</div>
                                <div className="flex-row flex-space-between">
                                  <div className="padding-y-3 padding-x-4 flex-justify-end background-secondary">
                                    <a
                                      onClick={() => setShow(!show)}
                                      className="button-primary button-small w-button"
                                    >
                Cancel
                                    </a>
                                  </div>
                                  <div className="padding-y-3 padding-x-4 flex-justify-end background-secondary">
                                    {loading? (
                                      <Loader />
                                    ) : (
                                      <a
                                        onClick={(event) => {
                                          event.preventDefault();
                                          deleteMicronutrientScore();
                                        }}
                                        href="#!"
                                        className="button-danger button-small w-button"
                                      >
                  Confirm remove
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Text fontFamily="DM Sans" fontSize="1rem" fontWeight="500" color="#1E1F24">

                                {moment(brand?.results[0]?.created_at).format('MMMM Do YYYY')}
                              </Text>
                              <Spacer />


                              <Badge borderRadius=".25rem" className="padding-x-3 padding-y-2 rounded-large"
                                bgColor={brand?.fortification?.message === 'Fully Fortified' ? 'rgba(82, 108, 219, 0.1)' :
                                  brand?.fortification?.message === 'Adequately Fortified' ? 'rgba(82, 108, 219, 0.1)' : 'rgba(44, 42, 100, 0.03)'} >
                                <Flex alignItems="center">
                                  <Text className="text-small text-color-body-text weight-medium" textTransform="capitalize">

                                    {
                                      brand?.results.map((x) => x.percentage_compliance).every((el) => el >= 80) ? 'Fully Fortified' : brand?.results.map((x) => x.percentage_compliance).every((el) => el <= 30) ? 'Not Fortified' :
                                        brand?.results.map((x) => x.percentage_compliance).some((el) => el >= 51) ? 'Adequately Fortified' : brand?.results.map((x) => x.percentage_compliance).some((el) => el >= 31) ? 'Inadequately Fortified' : ''}

                                  </Text>
                                </Flex>
                              </Badge>
                              <div onClick={() => {
                                setSelectedProduct(brand);
                                setSampleCollectorName(brand.sample_collector_names);
                                setSampleCollectorLocation(brand.sample_collection_location);
                                setSampleBatchNumber(brand.sample_batch_number);
                                setSampleSize(brand.sample_size);
                                setStartDate(brand.sample_production_date);
                                setExpiryDate(brand.sample_product_expiry_date);
                                setUniqueCode(brand.unique_code);
                                setProductTests(brand.results);
                                switch (uniqueBrands.productType.name) {
                                  case 'Edible Oil': setEdibleOil(brand.results); setNewEdibleOil(brand.results); break;
                                  case 'Maize Flour': setMaizeFlour(brand.results); setNewMaizeFlour(brand.results); setAflatoxinValue(brand.aflatoxinValue); break;
                                  case 'Wheat Flour': setWheatFlour(brand.results); setNewWheatFlour(brand.results); break;
                                }
                              }} className="flex justify-end" style={{marginLeft: '5px'}}>
                                <Button className="button-secondary button-small margin-right-3 w-button focus:outline-none" onClick={onViewOpen}>History</Button>
                              </div>
                              <div onClick={() => {
                                setToDelete(brand.id);
                              }} className="flex justify-end" style={{marginLeft: '2px'}}>
                                <Button onClick={() => setShow(!show)} className="button-secondary button-small margin-right-3 w-button focus:outline-none red">X</Button>
                              </div>
                            </Flex>
                            <Divider my="0.75rem" />
                            <Flex>
                              {brand?.results?.map((nutrient) => (
                                <Box key={nanoid()} style={{marginRight: '25px'}}>
                                  <>
                                    <Text
                                      fontFamily="DM Sans"
                                      fontSize=".875rem"
                                      mb=".35rem"
                                      fontWeight="500"
                                      color="rgba(28, 29, 38, 0.6)" className="text-small"

                                    >
                                      {nutrient?.microNutrient?.name}
                                    </Text>

                                    <Text fontFamily="DM Sans" className="text-medium text-color-blue">
                                      {nutrient?.value}
                                    </Text>
                                  </>
                                </Box>
                              ))}
                              {uniqueBrands.productType.aflatoxin &&
                                <Box key={nanoid()} style={{marginRight: '25px'}}>
                                  <>
                                    <Text
                                      fontFamily="DM Sans"
                                      fontSize=".875rem"
                                      mb=".35rem"
                                      fontWeight="500"
                                      color="rgba(28, 29, 38, 0.6)" className="text-small"

                                    >
                                      Aflatoxin
                                    </Text>

                                    <Text fontFamily="DM Sans" className="text-medium text-color-blue">
                                      {brand.aflatoxinValue}
                                    </Text>
                                  </>
                                </Box>
                              }
                              <Spacer />
                            </Flex>
                          </Container>

                        </>
                      ))}

                    </TabPanel>

                  </TabPanels>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isViewOpen} onClose={onViewClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <div className="background-color-white border-1px box-shadow-large rounded-large width-128 h-screen overflow-scroll">
            <ModalHeader>
              <Container>
                <Flex>
                  <Button className="background-secondary-2 padding-y-2 padding-x-3 rounded-large" onClick={onViewClose}>
                    <img src={ChevronLeft} width="16" alt="chevron left" className="margin-right-1" />
                    <p className="text-small"> Back </p>
                  </Button>
                  {/* <Spacer /> */}
                  <Text className="margin-top-2" fontFamily="DM Sans" fontSize="1rem" color="#030303">
                    <h6 className="margin-bottom-0 weight-medium margin-bottom-1 ml-20">View Scores</h6>
                  </Text>
                </Flex>
                <Box my="1rem">
                  <FormControl id="collector">
                    <FormLabel color="#1e1f24" fontSize="0.875rem" fontFamily="DM Sans">Sample Collector Name(s) </FormLabel>
                    <Input
                      type="text"
                      border="1px solid rgba(29, 28, 54, 0.1)"
                      borderRadius="6px"
                      fontSize="14px"
                      height="3.25rem"
                      className="form-input w-input"
                      value={sampleCollectorName}
                      placeholder="Name1, Name2, Name3"
                      name="sampleCollectorName"
                      data-name="sampleCollectorName"
                      onChange={(e) => setSampleCollectorName(e.target.value)}
                    />
                  </FormControl>

                  <FormControl id="location" my="0.5rem">
                    <FormLabel
                      color="#1e1f24"
                      fontSize="0.875rem"
                      fontFamily="DM Sans">Sample Collector Location(s) </FormLabel>
                    <Input
                      type="text"
                      name="sampleCollectorLocation"
                      data-name="sampleCollectorLocation"
                      border="1px solid rgba(29, 28, 54, 0.1)"
                      borderRadius="6px"
                      fontSize="14px"
                      height="3.25rem"
                      className="form-input w-input"
                      value={sampleCollectorLocation}
                      placeholder="Location1, Location2,Location3"
                      onChange={(e) => setSampleCollectorLocation(e.target.value)}
                    />
                  </FormControl>

                  <div className="w-layout-grid grid-4">
                    <div>
                      <label htmlFor="email-4" className="form-label">Sample Batch Number(s)</label>
                      <input
                        type="text"
                        className="form-input w-input"
                        maxLength="256"
                        name="sampleBatchNumber"
                        data-name="sampleBatchNumber"
                        placeholder="B1,B2,B3"
                        id="email-3"
                        required=""
                        value={sampleBatchNumber}
                        onChange={(e) => setSampleBatchNumber(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="email-4" className="form-label">Sample Size (SKU)</label>
                      <input
                        type="text"
                        className="form-input w-input"
                        maxLength="256"
                        name="sampleSize"
                        data-name="sampleSize"
                        placeholder="S1,S2,S3"
                        id="email-3"
                        required=""
                        value={sampleSize}
                        onChange={(e) => setSampleSize(e.target.value)}
                      />
                    </div>
                  </div>

                  <FormControl id="sampleProductionDate" my="0.5rem">
                    <FormLabel
                      color="#1e1f24"
                      fontSize="0.875rem"
                      fontFamily="DM Sans">Sample Production Date(s) </FormLabel>
                    <Input
                      type="text"
                      border="1px solid rgba(29, 28, 54, 0.1)"
                      borderRadius="6px"
                      fontSize="14px"
                      height="3.25rem"
                      className="form-input w-input"
                      name="startDate"
                      data-name="startDate"
                      value={startDate}
                      placeholder="MM/DD/YYY, MM/DD/YYY, MM/DD/YYY"
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </FormControl>

                  <FormControl id="sampleExpiryDate" my="0.5rem">
                    <FormLabel
                      color="#1e1f24"
                      fontSize="0.875rem"
                      fontFamily="DM Sans">Sample Expiry Date(s) </FormLabel>
                    <Input
                      type="text"
                      border="1px solid rgba(29, 28, 54, 0.1)"
                      borderRadius="6px"
                      fontSize="14px"
                      height="3.25rem"
                      className="form-input w-input"
                      value={expiryDate}
                      name="expiryDate"
                      data-name="expiryDate"
                      placeholder="MM/DD/YYY, MM/DD/YYY, MM/DD/YYY"
                      onChange={(e) => setExpiryDate(e.target.value)}
                    />
                  </FormControl>

                  <FormControl id="location" my="0.5rem">
                    <FormLabel color="#1e1f24" fontSize="0.875rem" fontFamily="DM Sans">Unique Code </FormLabel>
                    <Input
                      type="text"
                      border="1px solid rgba(29, 28, 54, 0.1)"
                      borderRadius="6px"
                      fontSize="14px"
                      height="3.25rem"
                      className="form-input w-input"
                      value={uniqueCode}
                      name="uniqueCode"
                      data-name="uniqueCode"
                      onChange={(e) => setUniqueCode(e.target.value)}
                    />
                  </FormControl>

                  {uniqueBrands.productType.name === 'Edible Oil' &&
                    <Box>
                      <div className="padding-bottom-6 border-bottom-1px"><label htmlFor="email-4" className="form-label">Micronutrients-{uniqueBrands.productType.name}</label>
                        <div className="w-layout-grid grid-4-columns padding-4 rounded-large background-secondary">
                          {productTests?.map((item, i) => (

                            <div style={{width: '90px'}} key={i}>
                              <label style={{height: '45px'}} htmlFor="value" className="form-label small">{item.name + '(' + item.expected_value + ')'}</label>
                              <input
                                style={{width: '90px'}}
                                type="text"
                                className="form-input margin-bottom-0 w-input"
                                name="value"
                                placeholder=""
                                required=""
                                data-id={i}
                                value={item.value ? item.value : ''}
                                onChange={onInputChangeEdibleOil}
                              />
                              <label htmlFor="value" className="form-label small">({item.unit})</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Box>
                  }

                  {uniqueBrands.productType.name === 'Maize Flour' &&
                  <div>
                    <Box>
                      <div className="padding-bottom-6 border-bottom-1px"><label htmlFor="email-4" className="form-label">Micronutrients-{uniqueBrands.productType.name}</label>
                        <div className="w-layout-grid grid-4-columns padding-4 rounded-large background-secondary">
                          {productTests?.map((item, i) => (
                            <div style={{width: '90px'}} key={i}>
                              <label style={{height: '45px'}} htmlFor="value" className="form-label small">{item.name + '(' + item.expected_value + ')'}</label>
                              <input
                                style={{width: '90px'}}
                                type="text"
                                className="form-input margin-bottom-0 w-input"
                                name="value"
                                placeholder=""
                                required=""
                                data-id={i}
                                value={item.value ? item.value : ''}
                                onChange={onInputChangeMaizeFlour}
                              />
                              <label htmlFor="value" className="form-label small">({item.unit})</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Box>
                    {uniqueBrands.productType.aflatoxin &&
                      <Box>
                        <div className="padding-bottom-6 border-bottom-1px"><label htmlFor="email-4" className="form-label">Aflatoxin</label>
                          <div className="w-layout-grid grid-4-columns padding-4 rounded-large background-secondary">
                            <div style={{width: '90px'}} key="aflatoxin">
                              <label htmlFor="value" className="form-label small">(ppb)({uniqueBrands.productType.aflatoxin_max_permitted})</label>
                              <input
                                style={{width: '90px'}}
                                type="text"
                                className="form-input margin-bottom-0 w-input"
                                name="value"
                                placeholder=""
                                required=""
                                data-id="aflatoxin"
                                value={aflatoxinValue}
                                onChange={onInputChangeAflatoxin}
                              />
                            </div>

                          </div>
                        </div>
                      </Box>
                    }
                  </div>
                  }
                  {uniqueBrands.productType.name === 'Wheat Flour' &&
                    <Box>
                      <div className="padding-bottom-6 border-bottom-1px"><label htmlFor="email-4" className="form-label">Micronutrients-{uniqueBrands.productType.name}</label>
                        <div className="w-layout-grid grid-4-columns padding-4 rounded-large background-secondary">
                          {productTests?.map((item, i) => (
                            <div style={{width: '90px'}} key={i}>
                              <label style={{height: '45px'}} htmlFor="value" className="form-label small">{item.name + '(' + item.expected_value + ')'}</label>
                              <input
                                style={{width: '90px'}}
                                type="text"
                                className="form-input margin-bottom-0 w-input"
                                name="value"
                                placeholder=""
                                required=""
                                data-id={i}
                                value={item.value ? item.value : ''}
                                onChange={onInputChangeWheatFlour}
                              />
                              <label htmlFor="value" className="form-label small">({item.unit})</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Box>
                  }


                </Box>


              </Container>
              <div className="padding-y-3 padding-x-4 flex-justify-end background-secondary rounded-large bottom sticky-bottom-0 border-top-1px">
                <a onClick={onViewClose} href="#" className="button-secondary button-small margin-right-3 w-button">Cancel</a>
                <Button
                  isLoading={btnLoad}
                  _focus={{outline: 'none'}}
                  p="2"
                  alignSelf="center"
                  onClick={() => setProductTestingScore(true)}
                >Save</Button>
              </div>
            </ModalHeader>

            <ModalCloseButton style={{position: 'absolute', right: '0', background: '#fff', borderRadius: '50%', left: '100%'}} className="box-shadow-large" />
          </div>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <div className="background-color-white border-1px box-shadow-large rounded-large w-full h-screen mt-4 overflow-scroll">
            <ModalHeader>
              <Container>
                <Flex>
                  <Button className="background-secondary-2 padding-y-2 padding-x-3 rounded-large" onClick={onClose}>
                    <img src={ChevronLeft} width="16" alt="chevron left" className="margin-right-1" />
                    <p className="text-small"> Back </p>
                  </Button>
                  {/* <Spacer /> */}
                  <Text className="margin-top-2" fontFamily="DM Sans" fontSize="1rem" color="#030303">
                    <h6 className="margin-bottom-0 weight-medium margin-bottom-1 ml-20">Add Scores</h6>
                  </Text>
                </Flex>
                <Box my="1rem">
                  <FormControl id="collector">
                    <FormLabel color="#1e1f24" fontSize="0.875rem" fontFamily="DM Sans">Sample Collector Name(s) </FormLabel>
                    <Input
                      type="text"
                      border="1px solid rgba(29, 28, 54, 0.1)"
                      borderRadius="6px"
                      fontSize="14px"
                      height="3.25rem"
                      className="form-input w-input"
                      placeholder="Name1, Name2, Name3"
                      onChange={(e) => setSampleCollectorName(e.target.value)}
                    />
                  </FormControl>

                  <FormControl id="location" my="0.5rem">
                    <FormLabel
                      color="#1e1f24"
                      fontSize="0.875rem"
                      fontFamily="DM Sans">Sample Collector Location(s) </FormLabel>
                    <Input
                      type="text"
                      border="1px solid rgba(29, 28, 54, 0.1)"
                      borderRadius="6px"
                      fontSize="14px"
                      height="3.25rem"
                      className="form-input w-input"
                      placeholder="Location1, Location2,Location3"
                      onChange={(e) => setSampleCollectorLocation(e.target.value)}
                    />
                  </FormControl>

                  <div className="w-layout-grid grid-4">
                    <div>
                      <label htmlFor="email-4" className="form-label">Sample Batch Number(s)</label>
                      <input
                        type="text"
                        className="form-input w-input"
                        maxLength="256"
                        name="email-3"
                        data-name="Email 3"
                        placeholder="B1,B2,B3"
                        id="email-3"
                        required=""
                        onChange={(e) => setSampleBatchNumber(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="email-4" className="form-label">Sample Size (SKU)</label>
                      <input
                        type="text"
                        className="form-input w-input"
                        maxLength="256"
                        name="email-3"
                        data-name="Email 3"
                        placeholder="S1,S2,S3"
                        id="email-3"
                        required=""
                        onChange={(e) => setSampleSize(e.target.value)}
                      />
                    </div>
                  </div>
                  <FormControl id="sampleProductionDate">
                    <FormLabel color="#1e1f24" fontSize="0.875rem" fontFamily="DM Sans">Sample Production Date(s) </FormLabel>
                    <Input
                      type="text"
                      border="1px solid rgba(29, 28, 54, 0.1)"
                      borderRadius="6px"
                      fontSize="14px"
                      height="3.25rem"
                      className="form-input w-input"
                      placeholder="MM/DD/YYY, MM/DD/YYY, MM/DD/YYY"
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </FormControl>
                  <FormControl id="sampleExpiryDate">
                    <FormLabel color="#1e1f24" fontSize="0.875rem" fontFamily="DM Sans">Sample Product Expiry Date(s) </FormLabel>
                    <Input
                      type="text"
                      border="1px solid rgba(29, 28, 54, 0.1)"
                      borderRadius="6px"
                      fontSize="14px"
                      height="3.25rem"
                      className="form-input w-input"
                      placeholder="MM/DD/YYY, MM/DD/YYY, MM/DD/YYY"
                      onChange={(e) => setExpiryDate(e.target.value)}
                    />
                  </FormControl>

                  <FormControl id="location" my="0.5rem">
                    <FormLabel color="#1e1f24" fontSize="0.875rem" fontFamily="DM Sans">Unique Code </FormLabel>
                    <Input
                      type="text"
                      border="1px solid rgba(29, 28, 54, 0.1)"
                      borderRadius="6px"
                      fontSize="14px"
                      height="3.25rem"
                      className="form-input w-input"
                      onChange={(e) => setUniqueCode(e.target.value)}
                    />
                  </FormControl>


                  {uniqueBrands.productType.name === 'Edible Oil' &&
                    <Box>
                      <div className="padding-bottom-6 border-bottom-1px"><label htmlFor="email-4" className="form-label">Micronutrients-{uniqueBrands.productType.name}</label>
                        <div className="w-layout-grid grid-4-columns padding-4 rounded-large background-secondary">
                          {productMicroNutrient?.map((item, i) => (

                            <div style={{width: '90px'}} key={i}>
                              <label style={{height: '45px'}} htmlFor="value" className="form-label small">{item.name + '(' + item.expected_value + ')'}</label>
                              <input
                                style={{width: '90px'}}
                                type="text"
                                className="form-input margin-bottom-0 w-input"
                                name="value"
                                placeholder=""
                                required=""
                                data-id={i}
                                value={item.value ? item.value : ''}
                                onChange={onInputChangeEdibleOil}
                              />
                              <label htmlFor="value" className="form-label small">({item.unit})</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Box>
                  }


                  {uniqueBrands.productType.name === 'Maize Flour' &&
                  <div>
                    <Box>
                      <div className="padding-bottom-6 border-bottom-1px"><label htmlFor="email-4" className="form-label">Micronutrients-{uniqueBrands.productType.name}</label>
                        <div className="w-layout-grid grid-4-columns padding-4 rounded-large background-secondary">
                          {productMicroNutrient?.map((item, i) => (
                            <div style={{width: '90px'}} key={i}>
                              <label style={{height: '45px'}} htmlFor="value" className="form-label small">{item.name + '(' + item.expected_value + ')'}</label>
                              <input
                                style={{width: '90px'}}
                                type="text"
                                className="form-input margin-bottom-0 w-input"
                                name="value"
                                placeholder=""
                                required=""
                                data-id={i}
                                value={item.value ? item.value : ''}
                                onChange={onInputChangeMaizeFlour}
                              />
                              <label htmlFor="value" className="form-label small">({item.unit})</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Box>
                    {uniqueBrands.productType.aflatoxin &&
                      <Box>
                        <div className="padding-bottom-6 border-bottom-1px"><label htmlFor="email-4" className="form-label">Aflatoxin</label>
                          <div className="w-layout-grid grid-4-columns padding-4 rounded-large background-secondary">
                            <div style={{width: '90px'}} key="aflatoxin">
                              <label htmlFor="value" className="form-label small">(ppb)({uniqueBrands.aflatoxin_max_permitted})</label>
                              <input
                                style={{width: '90px'}}
                                type="text"
                                className="form-input margin-bottom-0 w-input"
                                name="value"
                                placeholder=""
                                required=""
                                data-id="aflatoxin"
                                value={aflatoxinValue}
                                onChange={onInputChangeAflatoxin}
                              />
                            </div>

                          </div>
                        </div>
                      </Box>
                    }
                  </div>
                  }
                  {uniqueBrands.productType.name === 'Wheat Flour' &&
                    <Box>
                      <div className="padding-bottom-6 border-bottom-1px"><label htmlFor="email-4" className="form-label">Micronutrients-{uniqueBrands.productType.name}</label>
                        <div className="w-layout-grid grid-4-columns padding-4 rounded-large background-secondary">
                          {productMicroNutrient?.map((item, i) => (
                            <div style={{width: '90px'}} key={i}>
                              <label style={{height: '45px'}} htmlFor="value" className="form-label small">{item.name + '(' + item.expected_value + ')'}</label>
                              <input
                                style={{width: '90px'}}
                                type="text"
                                className="form-input margin-bottom-0 w-input"
                                name="value"
                                placeholder=""
                                required=""
                                data-id={i}
                                value={item.value ? item.value : ''}
                                onChange={onInputChangeWheatFlour}
                              />
                              <label htmlFor="value" className="form-label small">({item.unit})</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Box>
                  }
                </Box>


              </Container>
              <div className="padding-y-3 padding-x-4 flex-justify-end background-secondary rounded-large bottom sticky-bottom-0 border-top-1px">
                <a onClick={onClose} className="button-secondary button-small margin-right-3 w-button">Cancel</a>
                <Button
                  isLoading={btnLoad}
                  _focus={{outline: 'none'}}
                  p="2"
                  alignSelf="center"
                  onClick={() => setProductTestingScore(false)}
                >Save</Button>
              </div>
            </ModalHeader>

            <ModalCloseButton style={{position: 'absolute', right: '0', background: '#fff', borderRadius: '50%', left: '100%'}} className="box-shadow-large" />
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
};

ProductModalHeader.propTypes = {

  productTest: propTypes.any,
  uniqueBrands: propTypes.any
};

export default ProductModalHeader;
