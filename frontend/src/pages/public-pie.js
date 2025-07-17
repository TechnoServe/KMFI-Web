/* eslint-disable react/prop-types */
import React, {useState, useEffect} from 'react';
import {Pie} from 'react-chartjs-2';
import {Spinner} from '@chakra-ui/react';
import {request} from 'common';

/**
 * Renders a pie chart showing industry breakdown of product types (Wheat Flour, Edible Oil, Maize Flour).
 * Fetches company ranking data and computes the total count of each product type.
 * @param {Object} props - React component props.
 * @param {string[]} props.bg - Array of background colors used for each pie chart segment.
 * @returns {JSX.Element} Rendered pie chart component with loading spinner.
 */
const PublicPieChart = ({bg}) => {
  const [spinning, setSpinning] = useState(false);
  const [edibleOil, setEdibleOil] = useState();
  const [wheatFlour, setWheatFlour] = useState();
  const [maizeFlour, setMaizeFlour] = useState();

  const getCompanies = async () => {
    // Start spinner while fetching data
    try {
      setSpinning(true);
      // Fetch top 50 company rankings from backend
      const {
        data: {data: res},
      } = await request().get(`/ranking-list?page-size=50`);

      // Exclude a specific company by ID from the results
      const filteredResponse = res.filter((x) => x.id !== 'akpQPiE0sFH2iwciggHd');

      // Extract and count the number of products of specific type for each company
      const dataEdibleOil = filteredResponse?.map((product) => product?.brands.map((item) => item?.productType).filter((x) => x.name === 'Edible Oil').map((x) => x?.name).length);

      // Extract and count the number of products of specific type for each company
      const dataWheatFlour = filteredResponse?.map((product) => product?.brands.map((item) => item?.productType).filter((x) => x.name === 'Wheat Flour').map((x) => x?.name).length);

      // Extract and count the number of products of specific type for each company
      const dataMaizeFlour = filteredResponse?.map((product) => product?.brands.map((item) => item?.productType).filter((x) => x.name === 'Maize Flour').map((x) => x?.name).length);

      // Sum up the total count of each product type
      setEdibleOil(dataEdibleOil.reduce(function (accumulator, currentValue) {
        return accumulator + currentValue;
      }, 0));
      // Sum up the total count of each product type
      setWheatFlour(dataWheatFlour.reduce(function (accumulator, currentValue) {
        return accumulator + currentValue;
      }, 0));
      // Sum up the total count of each product type
      setMaizeFlour(dataMaizeFlour.reduce(function (accumulator, currentValue) {
        return accumulator + currentValue;
      }, 0));
      // Stop spinner after processing is complete
      setSpinning(false);
    } catch (error) {
      // Log any error that occurs during the fetch
      console.log({error});
    }
  };

  useEffect(() => {
    getCompanies();
  }, []);

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

  const options = {
    plugins: {
      legend: {
        display: true,
        position: 'right',
      },
    },
    responsive: false,
  };

  return (
    <>

      {
        // Show spinner if data is still loading
        (spinning && <Spinner />) ||
        // Render pie chart after data has loaded
        <Pie data={data3} options={options} />
      }
    </>

  );
};
export default PublicPieChart;
