/* eslint-disable react/prop-types */
import React, {useState, useEffect} from 'react';
import {Pie} from 'react-chartjs-2';
import {Spinner} from '@chakra-ui/react';
import PropTypes from 'prop-types';

// import MFICOY from '../../../../Dummie/mfiScoreSheet';

/**
 * PieChart component visualizes the industry breakdown of products
 * (Wheat Flour, Edible Oil, Maize Flour) using a pie chart.
 *
 * @param {Object} props - Component props
 * @param {Array<string>} props.bg - Array of background colors for chart segments
 * @param {Object} props.response - API response object containing company and product data
 * @returns {JSX.Element} A rendered Pie chart with industry breakdown or a spinner during loading
 */
const PieChart = ({bg, response}) => {
  const [spinning, setSpinning] = useState(false);
  const [edibleOil, setEdibleOil] = useState();
  const [wheatFlour, setWheatFlour] = useState();
  const [maizeFlour, setMaizeFlour] = useState();

  const getCompanies = async () => {
    try {
      // Begin loading state while data is processed
      setSpinning(true);

      const filteredResponse = response?.data?.filter((x) => x.id !== 'akpQPiE0sFH2iwciggHd');

      // Extract count of product types for Edible Oil
      const dataEdibleOil = filteredResponse?.map((product) => product?.brands.map((item) => item?.productType).filter((x) => x.name === 'Edible Oil').map((x) => x?.name).length);

      // Extract count of product types for Wheat Flour
      const dataWheatFlour = filteredResponse?.map((product) => product?.brands.map((item) => item?.productType).filter((x) => x.name === 'Wheat Flour').map((x) => x?.name).length);

      // Extract count of product types for Maize Flour
      const dataMaizeFlour = filteredResponse?.map((product) => product?.brands.map((item) => item?.productType).filter((x) => x.name === 'Maize Flour').map((x) => x?.name).length);

      // Aggregate total count for each product type
      setEdibleOil(dataEdibleOil?.reduce(function (accumulator, currentValue) {
        return accumulator + currentValue;
      }, 0));
      // Aggregate total count for each product type
      setWheatFlour(dataWheatFlour?.reduce(function (accumulator, currentValue) {
        return accumulator + currentValue;
      }, 0));
      // Aggregate total count for each product type
      setMaizeFlour(dataMaizeFlour?.reduce(function (accumulator, currentValue) {
        return accumulator + currentValue;
      }, 0));
      // Stop loading state after data aggregation
      setSpinning(false);
    } catch (error) {
      // return toast({
      //   status: 'error',
      //   title: 'Error',
      //   position: 'top-right',
      //   description: 'Something went wrong',
      //   duration: 6000,
      //   isClosable: true,
      // });
    }
  };

  // Fetch and update product type data when relevant state changes
  useEffect(() => {
    getCompanies();
  }, [maizeFlour, wheatFlour, edibleOil]);

  // Chart data configuration for pie chart visualization
  const data3 = {
    labels: ['Wheat Flour', 'Edible Oil', 'Maize Flour'],
    datasets: [
      {
        label: 'Industry Breakdown',
        data: [wheatFlour, edibleOil, maizeFlour],
        backgroundColor: bg,
        hoverOffset: 4,
      },
    ],
  };

  // Pie chart options including legend positioning
  const options = {
    plugins: {
      legend: {
        display: true,
        position: 'right',
      },
    },
    responsive: false,
  };

  // Render spinner while loading or the pie chart if data is ready
  return (
    <>

      {(spinning && <Spinner />) || <Pie data={data3} options={options} />}
    </>

  );
};
PieChart.propTypes = {
  response: PropTypes.any,
};
export default PieChart;
