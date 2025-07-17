import React, {useState} from 'react';
import {useToast, Text, Button, Tooltip, Input} from '@chakra-ui/react';
import {useAuth} from 'hooks/user-auth';
import {request} from 'common';
import Loader from 'components/circular-loader';
import addIcon from 'assets/images/add-row-svgrepo-com.svg';

const GlobalTool = () => {
  const {user} = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState();
  const [cycleName, setCycleName] = useState();
  const [cycleDescription, setCycleDescription] = useState();
  const [startDate, setStartDate] = useState();
  const [indexName, setIndexName] = useState();
  const [indexShortName, setIndexShortName] = useState();
  const [satCategories, updateSATCategories] = useState([]);
  const [satCategorySortOrder, setSatCategorySortOrder] = useState();
  const [satCategoryName, setSatCategoryName] = useState();
  const [satCategoryWeight, setSatCategoryWeight] = useState();
  const [fullTierSATValidatedWeight, setFullTierSATValidatedWeight] = useState();
  const [fullTierSATUnvalidatedWeight, setFullTierSATUnvalidatedWeight] = useState();
  const [abridgedTierSATUnvalidatedWeight, setAbridgedTierSATUnvalidatedWeight] = useState();
  const [abridgedTierSATValidatedWeight, setAbridgedTierSATValidatedWeight] = useState();
  const [micronutrients, updateMicronutrients] = useState([]);
  const [micronutrientName, setMicronutrientName] = useState();
  const [micronutrientExpectedValue, setMicronutrientExpectedValue] = useState();
  const [micronutrientUnit, setMicronutrientUnit] = useState();
  const [productTypeName, setproductTypeName] = useState();
  const [aflatoxin, setAflatoxin] = useState();
  const [afatoxinLimit, setAflatoxinLimit] = useState();
  const [linkedmicronutrient, setMicronutrient] = useState({});
  const [productTestingOverallWeight, setProductTestingOverallWeight] = useState();
  const [iegCategories, updateIEGCategories] = useState([]);
  const [iegCategorySortOrder, setIegCategorySortOrder] = useState();
  const [iegCategoryName, setIegCategoryName] = useState();
  const [iegCategoryWeight, setIegCategoryWeight] = useState();
  const [iegOverallWeight, setIegOverallWeight] = useState();

  const createNewFI = async (e) => {
    console.log(aflatoxin);
    console.log(linkedmicronutrient);
    e.preventDefault();
    setLoading(true);
    try {
      await request(true).put('admin/new-fi', {
        'country': country,
        'cycleName': cycleName,
        'cycleName': cycleName,
        'cycleDescription': cycleDescription,
        'startDate': startDate,
        'indexName': indexName,
        'indexShortName': indexShortName,
      });
      setLoading(false);
      return toast({
        status: 'success',
        title: 'Success',
        position: 'top-right',
        description: 'Fortification Index Created',
        duration: 6000,
        isClosable: true,
      });
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

  const addSatCategory = () => {
    console.log(satCategories);
    const satCategory = {
      'sort_rder': satCategorySortOrder,
      'name': satCategoryName,
      'weight': satCategoryWeight
    };
    updateSATCategories((categories) => [...categories, satCategory]);
  };
  const addNewMicroNutrient = () => {
    console.log(micronutrients);
    const newMicronutrient = {
      'name': micronutrientName,
      'expected_value': micronutrientExpectedValue,
      'unit': micronutrientUnit
    };
    updateMicronutrients((micronutrients) => [...micronutrients, newMicronutrient]);
  };
  const addNewProductType = () => {
    console.log(productTypes);
    const newProductType = {
      'name': productTypeName,
      'aflatoxin': aflatoxin,
      'aflatoxin_limit': afatoxinLimit,
      'linked_micronutrient': linkedmicronutrient
    };
    updateProductTypes((productTypes) => [...productTypes, newProductType]);
  };
  const addIegCategory = () => {
    console.log(iegCategories);
    const iegCategory = {
      'sort_rder': iegCategorySortOrder,
      'name': iegCategoryName,
      'weight': iegCategoryWeight
    };
    updateIEGCategories((categories) => [...categories, iegCategory]);
  };


  return (
    <>
      <div data-w-tab="SaTool" className="w-tab-pane w--tab-active">
        <div className="padding-x-10 padding-y-10 w-container">
          <Text className="text-align-left" fontSize="20px" fontWeight="700">
            Deploy New Region
          </Text>

          <form className="margin-top-10 margin-bottom-0 w-form">
            <div className="text-small weight-medium text-color-body-text" style={{paddingBottom: '15px'}}>
              Fortification Index Name
            </div>
            <input
              placeholder='Kenya Millers Fortification Index'
              onChange={(e) => setIndexName(e.target.value)}
              type="text"
              className="form-input margin-bottom-4 w-input"
              maxLength="30"
              name="indexName"
              data-name="indexName"
              id="indexName"
              disabled={user?.admin_user?.role?.value === 'basic_admin' || user?.admin_user?.role?.value === 'super_admin'}
            />
            <div className="text-small weight-medium text-color-body-text" style={{paddingBottom: '15px'}}>
              Fortification Index Short Name
            </div>
            <input
              placeholder='KMFI'
              onChange={(e) => setIndexShortName(e.target.value)}
              type="text"
              className="form-input margin-bottom-4 w-input"
              maxLength="30"
              name="indexShortName"
              data-name="indexShortName"
              id="indexShortName"
              disabled={user?.admin_user?.role?.value === 'basic_admin' || user?.admin_user?.role?.value === 'super_admin'}
            />
            <div className="text-small weight-medium text-color-body-text" style={{paddingBottom: '15px'}}>
              Country
            </div>
            <select name="countries" className="small w-input" onChange={setCountry}>
              <option value="Nigeria">Nigeria</option>
              <option value="India">India</option>
              <option value="Kenya">Kenya</option>
              <option value="Tanzania">Tanzania</option>
              <option value="Ethiopia">Ethiopia</option>
              <option value="Pakistan">Pakistan</option>
              <option value="Bangladesh">Bangladesh</option>
              <option value="Indonesia">Indonesia</option>
            </select>
            <div className="text-small weight-medium text-color-body-text" style={{paddingBottom: '15px'}}>
              Cycle Start Date
            </div>
            <input
              onChange={(e) => setStartDate(e.target.value)}
              type="date"
              className="form-input margin-bottom-4 w-input"
              maxLength="256"
              name="startDate"
              data-name="startDate"
              id="startDate"
              disabled={user?.admin_user?.role?.value === 'basic_admin' || user?.admin_user?.role?.value === 'super_admin'}
            />
            <div className="text-small weight-medium text-color-body-text" style={{paddingBottom: '15px'}}>
              Cycle Name
            </div>
            <input
              onChange={(e) => setCycleName(e.target.value)}
              type="text"
              className="form-input margin-bottom-4 w-input"
              maxLength="30"
              name="cycleName"
              data-name="cycleName"
              id="cycleName"
              disabled={user?.admin_user?.role?.value === 'basic_admin' || user?.admin_user?.role?.value === 'super_admin'}
            />
            <div className="text-small weight-medium text-color-body-text" style={{paddingBottom: '15px'}}>
              Cycle Description
            </div>
            <input
              onChange={(e) => setCycleDescription(e.target.value)}
              type="text"
              className="form-input margin-bottom-4 w-input"
              maxLength="100"
              name="cycleDescription"
              data-name="cycleDescription"
              id="cycleDescription"
              disabled={user?.admin_user?.role?.value === 'basic_admin' || user?.admin_user?.role?.value === 'super_admin'}
            />
            <Text className="text-align-left" fontSize="20px" fontWeight="700">
            SAT
            </Text>
            <div className="text-small weight-medium text-color-body-text" style={{paddingBottom: '15px'}}>
              SAT Categories
            </div>
            <div style={{display: 'flex', flexDirection: 'row', marginBottom: '10px'}}>
              <div style={{flex: 'auto', marginRight: '5px', marginBottom: '0px', minWidth: '150px'}} className="form-input small flex-row-middle flex-space-between">
                <Input
                  placeholder='Category Name'
                  id="satCategoryName"
                  border="none"
                  height="2rem"
                  value={satCategoryName}
                  _focus={{outline: 'none', border: 'none'}}
                  onChange={(e) => setSatCategoryName(e.target.value)}
                  className="text-small text-color-body-text"
                />
              </div>
              <div style={{flex: 'auto', marginRight: '5px', marginBottom: '0px'}} className="form-input small flex-row-middle flex-space-between">
                <Input
                  type="number" step="0.1" min="0" max="1"
                  placeholder='Weight'
                  id="satCategoryWeight"
                  border="none"
                  height="2rem"
                  value={satCategoryWeight}
                  _focus={{outline: 'none', border: 'none'}}
                  onChange={(e) => setSatCategoryWeight(e.target.value)}
                  className="text-small text-color-body-text"
                />
              </div>
              <input
                placeholder='Sort Order'
                style={{padding: '5px 10px', marginRight: '5px', marginLeft: '5px', borderColor: 'green', borderWidth: '1px', borderStyle: 'solid', borderRadius: '5px', width: '70px'}}
                type="number"
                min="0"
                id='satCategorySortOrder'
                value={satCategorySortOrder}
                onChange={(e) => setSatCategorySortOrder(e.target.value)}/>
              <Tooltip label='Add'>
                <Button
                  isLoading={loading}
                  _focus={{outline: 'none'}}
                  p="2"
                  alignSelf="center"
                  onClick={addSatCategory}
                >
                  <img
                    src={addIcon}
                    loading="lazy"
                    width="24"
                    alt=""
                  />
                </Button>
              </Tooltip>
            </div>
            <div className="text-small weight-medium text-color-body-text" style={{paddingBottom: '15px'}}>
              SAT Overall Weightings
            </div>
            <div style={{display: 'flex', flexDirection: 'row', marginBottom: '10px'}}>
              <div style={{flex: 'auto', marginRight: '5px', marginBottom: '0px'}} className="form-input small flex-row-middle flex-space-between">
                <Input
                  placeholder='Full Tier SAT Validated (%)'
                  id="fullTierSATValidatedWeight"
                  border="none"
                  height="2rem"
                  type='number'
                  min='1'
                  max='100'
                  value={fullTierSATValidatedWeight}
                  _focus={{outline: 'none', border: 'none'}}
                  onChange={(e) => setFullTierSATValidatedWeight(e.target.value)}
                  className="text-small text-color-body-text"
                />
              </div>
            </div>
            <div style={{display: 'flex', flexDirection: 'row', marginBottom: '10px'}}>
              <div style={{flex: 'auto', marginRight: '5px', marginBottom: '0px'}} className="form-input small flex-row-middle flex-space-between">
                <Input
                  required
                  placeholder='Full Tier SAT Unvalidated (%)'
                  id="fullTierSATUnvalidatedWeight"
                  border="none"
                  height="2rem"
                  type='number'
                  min='1'
                  max='100'
                  value={fullTierSATUnvalidatedWeight}
                  _focus={{outline: 'none', border: 'none'}}
                  onChange={(e) => setFullTierSATUnvalidatedWeight(e.target.value)}
                  className="text-small text-color-body-text"
                />
              </div>
            </div>
            <div style={{display: 'flex', flexDirection: 'row', marginBottom: '10px'}}>
              <div style={{flex: 'auto', marginRight: '5px', marginBottom: '0px'}} className="form-input small flex-row-middle flex-space-between">
                <Input
                  required
                  placeholder='Abridged Tier SAT Validated (%)'
                  id="abridgedTierSATValidatedWeight"
                  border="none"
                  height="2rem"
                  type='number'
                  min='1'
                  max='100'
                  value={abridgedTierSATValidatedWeight}
                  _focus={{outline: 'none', border: 'none'}}
                  onChange={(e) => setAbridgedTierSATValidatedWeight(e.target.value)}
                  className="text-small text-color-body-text"
                />
              </div>
            </div>
            <div style={{display: 'flex', flexDirection: 'row', marginBottom: '10px'}}>
              <div style={{flex: 'auto', marginRight: '5px', marginBottom: '0px'}} className="form-input small flex-row-middle flex-space-between">
                <Input
                  required
                  placeholder='Abridged Tier SAT Unvalidated (%)'
                  id="abridgedTierSATUnvalidatedWeight"
                  border="none"
                  height="2rem"
                  type='number'
                  min='1'
                  max='100'
                  value={abridgedTierSATUnvalidatedWeight}
                  _focus={{outline: 'none', border: 'none'}}
                  onChange={(e) => setAbridgedTierSATUnvalidatedWeight(e.target.value)}
                  className="text-small text-color-body-text"
                />
              </div>
            </div>
            <Text className="text-align-left" fontSize="20px" fontWeight="700">
            Product Testing / Analytical Methods of Quality Testing
            </Text>
            <div className="text-small weight-medium text-color-body-text" style={{paddingBottom: '15px'}}>
              Micronutrients
            </div>
            <div style={{display: 'flex', flexDirection: 'row', marginBottom: '10px'}}>
              <div style={{flex: 'auto', marginRight: '5px', marginBottom: '0px'}} className="form-input small flex-row-middle flex-space-between">
                <Input
                  placeholder='Name'
                  id="micronutrientName"
                  border="none"
                  height="2rem"
                  value={micronutrientName}
                  _focus={{outline: 'none', border: 'none'}}
                  onChange={(e) => setMicronutrientName(e.target.value)}
                  className="text-small text-color-body-text"
                />
              </div>
              <div style={{flex: 'auto', marginRight: '5px', marginBottom: '0px'}} className="form-input small flex-row-middle flex-space-between">
                <Input
                  type="number" step="0.1" min="1"
                  placeholder='Expected Value'
                  id="micronutrientExpectedValue"
                  border="none"
                  height="2rem"
                  value={micronutrientExpectedValue}
                  _focus={{outline: 'none', border: 'none'}}
                  onChange={(e) => setMicronutrientExpectedValue(e.target.value)}
                  className="text-small text-color-body-text"
                />
              </div>
              <div style={{flex: 'auto', marginRight: '5px', marginBottom: '0px'}} className="form-input small flex-row-middle flex-space-between">
                <Input
                  placeholder='Unit'
                  id="MicronutrientUnit"
                  border="none"
                  height="2rem"
                  value={micronutrientUnit}
                  _focus={{outline: 'none', border: 'none'}}
                  onChange={(e) => setMicronutrientUnit(e.target.value)}
                  className="text-small text-color-body-text"
                />
              </div>
              <Tooltip label='Add'>
                <Button
                  isLoading={loading}
                  _focus={{outline: 'none'}}
                  p="2"
                  alignSelf="center"
                  onClick={addNewMicroNutrient}
                >
                  <img
                    src={addIcon}
                    loading="lazy"
                    width="24"
                    alt=""
                  />
                </Button>
              </Tooltip>
            </div>
            <div className="text-small weight-medium text-color-body-text" style={{paddingBottom: '15px'}}>
              Product Types
            </div>
            <div style={{display: 'flex', flexDirection: 'row', marginBottom: '10px'}}>
              <div style={{flex: 'auto', marginRight: '5px', marginBottom: '0px', minWidth: '212px'}} className="form-input small flex-row-middle flex-space-between">
                <Input
                  placeholder='Name'
                  id="productTypeName"
                  border="none"
                  height="2rem"
                  value={productTypeName}
                  _focus={{outline: 'none', border: 'none'}}
                  onChange={(e) => setproductTypeName(e.target.value)}
                  className="text-small text-color-body-text"
                />
              </div>
              <div style={{flex: 'auto', marginRight: '5px', marginBottom: '0px', minWidth: '140px'}} className="flex-row-middle flex-space-between">
                <select name="linkedmicronutrient" className="small w-input" onChange={setMicronutrient}>
                  <option value="0">Micronutrient</option>
                  {micronutrients.map((micronutrient, index) => (
                    <option key={index} value={index}>{micronutrient.name}</option>
                  ))}
                </select>
              </div>
              <div style={{flex: 'auto', marginRight: '5px', marginBottom: '0px', minWidth: '120px'}} className="flex-row-middle flex-space-between">
                <select name="aflatoxin" className="small w-input" onChange={setAflatoxin}>
                  <option value="0">NO Aflatoxin</option>
                  <option value="Yes">Yes Aflatoxin</option>
                </select>
              </div>
              <div style={{flex: 'auto', marginRight: '5px', marginBottom: '0px'}} className="form-input small flex-row-middle flex-space-between">
                <Input
                  placeholder='Aflatoxin Limit'
                  id="afatoxinLimit"
                  border="none"
                  height="2rem"
                  value={afatoxinLimit}
                  _focus={{outline: 'none', border: 'none'}}
                  onChange={(e) => setAflatoxinLimit(e.target.value)}
                  className="text-small text-color-body-text"
                />
              </div>

              <Tooltip label='Add'>
                <Button
                  isLoading={loading}
                  _focus={{outline: 'none'}}
                  p="2"
                  alignSelf="center"
                  onClick={addNewProductType}
                >
                  <img
                    src={addIcon}
                    loading="lazy"
                    width="24"
                    alt=""
                  />
                </Button>
              </Tooltip>
            </div>
            <div style={{display: 'flex', flexDirection: 'row', marginBottom: '10px'}}>
              <Button
                isLoading={loading}
                _focus={{outline: 'none'}}
                p="2"
                alignSelf="center"
                onClick={addNewProductType}
              >
                  Add another Analytical Method
              </Button>
            </div>

            <div className="text-small weight-medium text-color-body-text" style={{paddingBottom: '15px'}}>
              P.T Overall Weightings
            </div>
            <div style={{display: 'flex', flexDirection: 'row', marginBottom: '10px'}}>
              <div style={{flex: 'auto', marginRight: '5px', marginBottom: '0px'}} className="form-input small flex-row-middle flex-space-between">
                <Input
                  placeholder='20%'
                  id="productTestingOverallWeight"
                  border="none"
                  height="2rem"
                  type='number'
                  min='1'
                  max='100'
                  value={productTestingOverallWeight}
                  _focus={{outline: 'none', border: 'none'}}
                  onChange={(e) => setProductTestingOverallWeight(e.target.value)}
                  className="text-small text-color-body-text"
                />
              </div>
            </div>
            <Text className="text-align-left" fontSize="20px" fontWeight="700">
            I.E.G
            </Text>
            <div className="text-small weight-medium text-color-body-text" style={{paddingBottom: '15px'}}>
              Categories
            </div>
            <div style={{display: 'flex', flexDirection: 'row', marginBottom: '10px'}}>
              <div style={{flex: 'auto', marginRight: '5px', marginBottom: '0px', minWidth: '150px'}} className="form-input small flex-row-middle flex-space-between">
                <Input
                  placeholder='Category Name'
                  id="iegCategoryName"
                  border="none"
                  height="2rem"
                  value={iegCategoryName}
                  _focus={{outline: 'none', border: 'none'}}
                  onChange={(e) => setIegCategoryName(e.target.value)}
                  className="text-small text-color-body-text"
                />
              </div>
              <div style={{flex: 'auto', marginRight: '5px', marginBottom: '0px'}} className="form-input small flex-row-middle flex-space-between">
                <Input
                  type="number" step="0.1" min="0" max="1"
                  placeholder='Weight'
                  id="iegCategoryWeight"
                  border="none"
                  height="2rem"
                  value={iegCategoryWeight}
                  _focus={{outline: 'none', border: 'none'}}
                  onChange={(e) => setIegCategoryWeight(e.target.value)}
                  className="text-small text-color-body-text"
                />
              </div>
              <input
                placeholder='Sort Order'
                style={{padding: '5px 10px', marginRight: '5px', marginLeft: '5px', borderColor: 'green', borderWidth: '1px', borderStyle: 'solid', borderRadius: '5px', width: '70px'}}
                type="number"
                min="0"
                id='iegCategorySortOrder'
                value={iegCategorySortOrder}
                onChange={(e) => setIegCategorySortOrder(e.target.value)}/>
              <Tooltip label='Add'>
                <Button
                  isLoading={loading}
                  _focus={{outline: 'none'}}
                  p="2"
                  alignSelf="center"
                  onClick={addIegCategory}
                >
                  <img
                    src={addIcon}
                    loading="lazy"
                    width="24"
                    alt=""
                  />
                </Button>
              </Tooltip>
            </div>
            <div className="text-small weight-medium text-color-body-text" style={{paddingBottom: '15px'}}>
              I.E.G Overall Weightings
            </div>
            <div style={{display: 'flex', flexDirection: 'row', marginBottom: '10px'}}>
              <div style={{flex: 'auto', marginRight: '5px', marginBottom: '0px'}} className="form-input small flex-row-middle flex-space-between">
                <Input
                  placeholder='20%'
                  id="iegOverallWeight"
                  border="none"
                  height="2rem"
                  type='number'
                  min='1'
                  max='100'
                  value={iegOverallWeight}
                  _focus={{outline: 'none', border: 'none'}}
                  onChange={(e) => setIegOverallWeight(e.target.value)}
                  className="text-small text-color-body-text"
                />
              </div>
            </div>
            <div className="margin-top-10">
              <button
                type="submit"
                onClick={createNewFI}
                className="button w-button"
                style={{outline: 'none', backgroundColor: '#ECECEF', color: '#9696A6'}}
              >
                {(loading && <Loader />) || <span style={{color: '#9696A6'}}>Create new Fortification Index</span>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default GlobalTool;
