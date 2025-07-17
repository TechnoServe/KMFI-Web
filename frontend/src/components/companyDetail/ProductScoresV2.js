import React from 'react';
import propTypes from 'prop-types';
import 'styles/webflow.css';
import 'styles/mfi-tns.webflow.css';
import 'styles/normalize.css';
import {
  Flex,
  Text,
  Menu,
  MenuButton,
  IconButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Popover,
  PopoverContent,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  Stack,
  SkeletonCircle,
  SkeletonText,
  Progress,
  useToast,
  Box,
  Link,
  Button
} from '@chakra-ui/react';
import {nanoid} from '@reduxjs/toolkit';
import {MdMoreVert} from 'react-icons/md';
// import {
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalCloseButton,
// } from '@chakra-ui/react';
import ProductModalHeaderV2 from 'components/productTestingScores/testingScoreModalV2';
import AddScoreDrawer from 'components/productTestingScores/addScoreDrawer';
import {useProductTestingPagination} from 'components/useProductTestingPagination';
import {FiEdit, FiFilePlus, FiInfo, FiPlus} from 'react-icons/fi';
import {request} from 'common';

const ProductScoreCardV2 = ({company, cycleId}) => {
  const {onOpen: onPopoverOpen, onClose: onPopoverClose, isOpen: isPopoverOpen} = useDisclosure();
  const [loading, setLoading] = React.useState(false);
  const [loadingMicro, setLoadingMicro] = React.useState(false);
  // const [brandID, setBrandID] = useState();
  const {PreviousButton, NextButton, brands} = useProductTestingPagination(company?.brands);
  const [productTests, setProductTests] = React.useState([]);
  const [productType, setProductType] = React.useState({});
  const [productMicroNutrients, setProductMicroNutrients] = React.useState([]);
  const toast = useToast();
  const {isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose} = useDisclosure();

  const getBrandProductTests = async (brandId, productTypeId) => {
    setLoading(true);
    onPopoverOpen();
    try {
      const {data: res} = await request(true).get(`/company/brands/product-tests?id=${brandId}&cycle-id=${cycleId}`);
      const {data: res2} = await request(true).get(`/company/brands/product-type?id=${productTypeId}`);
      setProductTests(res);
      setProductType(res2);
    } catch (error) {
      console.log(error);
      toast({
        title: 'An error occurred.',
        description: 'Unable to fetch product tests',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  const fetchProductMicroNutrients = (productTypeId) => {
    setLoadingMicro(true);
    return request()
      .get(`/product-micro-nutrients?id=${productTypeId}`)
      .then(async ({data: list}) => {
        // setProductMicroNutrients(Array.isArray(list) ? list : [list]);
        const productMicroNutrients = await fetchProductMicroNutrient(Array.isArray(list) ? list : [list]);
        setProductMicroNutrients(productMicroNutrients);
        setLoadingMicro(false);
        setTimeout(() => {
          onDrawerOpen();
        }, 500);
        return list;
      });
  };
  const fetchProductMicroNutrient = async (productMicroNutrient) => {
    const {data: list} = await request().get(`/product-micro-nutrient?id=${productType.id}`);
    const microNutrients = Array.isArray(list) ? list : [list];
    return productMicroNutrient.map((item) => {
      const microNutrient = microNutrients.find((x) => x.micro_nutrient_id === item.id);
      return {
        ...item,
        product_micro_nutrient_id: microNutrient?.id,
        value: 0
      };
    });
  };

  return (
    <>
      <Flex key={nanoid()} alignItems="center" >
        <PreviousButton />
        <Link flexGrow="1" maxWidth="200px" onClick={() => getBrandProductTests(brands[0]?.id, brands[0]?.product_type)}>
          <Text textAlign={'center'} fontSize="md" isTruncated casing="uppercase">
            {brands[0]?.name}
          </Text>
        </Link>
        <NextButton />
      </Flex>
      <Popover
        isLazy
        isOpen={isPopoverOpen}
        onClose={onPopoverClose}
        onOpen={onPopoverOpen}
        autoFocus={false}
        returnFocusOnClose={false}
        closeOnBlur={false}
      >
        <PopoverContent>
          <PopoverArrow />
          <PopoverHeader fontWeight={'bold'}>
            Product Testing Scores
          </PopoverHeader>
          <PopoverCloseButton />
          <PopoverBody px={0}>
            {loading && (
              <Stack px={3} spacing={4}>
                <SkeletonCircle size="10" isLoaded={!loading} />
                <SkeletonText noOfLines={10} spacing="4" isLoaded={!loading} />
              </Stack>
            )}
            {!loading && productType && (
              <Stack px={0} >
                <Box px={3}>
                  <Text flexGrow="1" maxWidth="210px" isTruncated>{brands[0]?.name}</Text>
                  <Text as='sup'>{productType?.name}</Text>
                  <Button
                    size='xs'
                    variant='solid'
                    aria-label='Add Score'
                    title='Add Score'
                    leftIcon={<FiPlus />}
                    onClick={() => fetchProductMicroNutrients(productType?.id)}
                    float={'right'}
                    isLoading={loadingMicro}
                  >
                    Add Score
                  </Button>
                </Box>

                <ProductModalHeaderV2 key={nanoid()} productTests={productTests} productType={productType} cycleId={cycleId} />
              </Stack>

            )}
          </PopoverBody>
        </PopoverContent>
      </Popover>
      {isDrawerOpen && (
        <AddScoreDrawer
          isOpen={isDrawerOpen}
          onClose={onDrawerClose}
          productType={productType}
          brandId={brands[0]?.id}
          productMicroNutrients={productMicroNutrients}
          companyId={company?.id}
          cycleId={cycleId}
        />
      )}
    </>
  );
};

ProductScoreCardV2.propTypes = {
  company: propTypes.any,
  cycleId: propTypes.any,
};

export default ProductScoreCardV2;
