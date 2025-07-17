import React, {useRef, useState, useEffect} from 'react';
import ReactToPrint from 'react-to-print';
import {Link} from 'react-router-dom';
import logo from 'assets/images/I-Logo-Placeholder-white.svg';
// import PieChart from './admin/dashboard/component/pie-chart';
import PublicPieChart from '../pages/public-pie';
import Performance from './admin/dashboard/component/performance';
import {Text, Flex} from '@chakra-ui/react';
import 'styles/normalize.css';
import 'styles/webflow.css';
import 'styles/mfi-tns.webflow.css';
// import lorem from 'assets/images/lorem.png';
// import devon from 'assets/images/devons-kings.png';
// import notes from 'assets/images/notes.png';
// import {useHistory} from 'react-router-dom';

// import {IoChevronForward} from 'react-icons/io5';
import dangote from 'assets/images/dangote-sugar.png';
import Honeywell from 'assets/company_images/honeywell.png';
import flourMills from 'assets/company_images/flourmills.jpg';
import raffles from 'assets/company_images/dufil.png';
import crownFlour from 'assets/company_images/crownflour.jpg';
import pzWilmar from 'assets/company_images/wilmar.jpg';
import grandCereal from 'assets/company_images/grand.png';
import premiumEdibleOil from 'assets/company_images/premiumOil.png';
// import prima from 'assets/company_images/dufilPrima.jpg';
import kingsFlour from 'assets/company_images/kings.png';
import sunolaOil from 'assets/company_images/sunola.jpg';
import appleAndPears from 'assets/company_images/appleandpears.jpg';
import bua from 'assets/company_images/bua.png';
import golden from 'assets/company_images/golden.png';

import {request} from 'common';
// import Loader from 'components/circular-loader';
import {Spinner} from '@chakra-ui/react';
import MFICOY from '../Dummie/mfiScoreSheet';
// import ProgressChart from './admin/dashboard/component/progress-chart';

const Page = () => {
  const [brandList, setBrandList] = useState([]);
  const [spinning, setSpinning] = useState(false);
  // const [brandRank, setRanking] = useState();
  const [mfiScore, setMfiScore] = useState([]);
  const [filteredData, setFilteredData] = useState();
  // const history = useHistory();

  const componentRef = useRef();

  useEffect(() => {
    setMfiScore(localStorage.getItem('mfi') ? JSON.parse(localStorage.getItem('mfi')) || null : 78);
  }, []);

  const getCompanies = async () => {
    try {
      setSpinning(true);
      const {
        data: {data: res},
      } = await request().get(`/ranking-list?page-size=50`);
      const filteredResponse = res.filter((x) => x.id !== 'akpQPiE0sFH2iwciggHd');

      setFilteredData(filteredResponse);
      const brands = filteredResponse.map((x) => x.brands.map((x) => x.name).length);
      setBrandList((brands.reduce((accum, item) => accum + item, 0)));

      setSpinning(false);
    } catch (error) {
      console.log({error});
    }
  };

  console.log('brandList', brandList);
  console.log('filteredData', filteredData);

  useEffect(() => {
    getCompanies();
  }, []);


  const ranks = MFICOY.sort(function (a, b) {
    return b.overallScore - a.overallScore;
  });

  ranks.forEach(function (player, i, arr) {
    player.rank = i === 0 || player.overallScore != arr[i - 1].overallScore
      ? i + 1
      : arr[i - 1].rank;
  });

  const rankOne = ranks.filter((x) => x.rank === 1);
  const rankTwo = ranks.filter((x) => x.rank === 3);
  const rankThree = ranks.filter((x) => x.rank === 5);
  const rankFour = ranks.filter((x) => x.rank === 8);
  const rankFive = ranks.filter((x) => x.rank === 9);
  const rankSix = ranks.filter((x) => x.rank === 10);
  const rankSeven = ranks.filter((x) => x.rank === 15);
  const rankEight = ranks.filter((x) => x.rank === 17);
  const rankNine = ranks.filter((x) => x.rank === 19);
  const rankTen = ranks.filter((x) => x.rank === 20);
  const rankEleven = ranks.filter((x) => x.rank === 21);
  const rankTwelve = ranks.filter((x) => x.rank === 23);
  const rankThirteen = ranks.filter((x) => x.rank === 24);
  const rankFourteen = ranks.filter((x) => x.rank === 25);
  const rankFifteen = ranks.filter((x) => x.rank === 26);
  const rankSixteen = ranks.filter((x) => x.rank === 29);
  const rankSeventeen = ranks.filter((x) => x.rank === 30);
  const rankEighteen = ranks.filter((x) => x.rank === 31);

  console.log('rankEleven', rankEleven);
  console.log('rankTwelve', rankTwelve);
  console.log('rankThirteen', rankThirteen);
  console.log('rankNine', rankNine);
  console.log('rankTen', rankTen);
  console.log('ranks', ranks);

  const topBrands = [...ranks].sort((a, b) => b - a).slice(0, 14);
  // const result = topBrands.reduce(function (r, a) {
  //   r[a.companyName] = r[a.companyName] || [];
  //   r[a.companyName].push(a);
  //   return r;
  // }, Object.create(null));

  console.log('topBrands', topBrands);
  //   var topValues = [...result].sort((a,b) => b-a).slice(0,5);
  // // [...values] will create shallow copy
  // console.log(topValues);


  // const buttonRouter = () => {
  //   history.push('/');
  // };

  return (
    <div>
      <div className="background-image">
        <div
          data-collapse="medium"
          data-animation="default"
          data-duration="400"
          role="banner"
          className="padding-x-10 background-color-transparent border-bottom-1px-white w-nav"
        >
          <div className="flex-row-middle max-width-full w-container">
            <div className="width-full flex-row-middle flex-space-between padding-y-5">
              <a href="/" className="w-nav-brand">
                <img src={logo} loading="lazy" alt="" style={{objectFit: 'contain'}} />
              </a>
              <nav role="navigation" className="flex-row-middle w-nav-menu">
                <Link
                  to="/login"
                  className="transparent-button-white secondary margin-right-4 w-button"
                >
                  Login
                </Link>{' '}
                <Link to="/sign-up" className="transparent-button-white w-button">
                  Sign Up
                </Link>
              </nav>
            </div>
            <div className="w-nav-button">
              <div className="w-icon-nav-menu"></div>
            </div>
          </div>
        </div>
        <div className="padding-y-16 flex-row-centered">
          <div className="width-10-12 flex-column-centered">
            <Text
              className="text-color-4 text-align-center margin-bottom-6"
              fontSize="50px"
              fontWeight="700"
            >
              Micronutrient <br />
              Fortification Index
            </Text>
            {/* <a href={PieChart} className="button-secondary on-image w-button" download>
                Download now
              </a> */}
            {/* <ReactToPrint
                trigger={() => <button href={PieChart} className="button-secondary on-image w-button" download>
                  Download now
                </button>}
                content={() => componentRef.current}
              /> */}
            <ReactToPrint
              trigger={() => {
                return <button className="button-secondary on-image w-button" download>
                  Download now
                </button>;
              }}
              content={() => componentRef.current}
            />
          </div>
        </div>
      </div>
      <div>
        <div className="padding-y-10 container-1280 padding-x-10" ref={componentRef}>
          <div className="px-5">
            <Flex flexWrap="wrap">
              <Flex flexDirection="column" mr={['none', '25px']}>
                <div
                  className="background-color-white border-1px rounded-large padding-5 box-shadow-large"
                  style={{width: 330, marginBottom: 10}}
                >
                  <Text
                    className="margin-bottom-1 weight-medium"
                    fontSize="18px"
                    fontWeight="700"
                  >
                    Total Brands
                  </Text>
                  <Text
                    className="margin-bottom-2 weight-medium"
                    fontSize="44px"
                    fontWeight="700"
                  >
                    {(spinning && <Spinner />) || brandList}
                  </Text>
                  {/*
                    <div className="text-small margin-bottom-5">
                      <span className="text-color-green">+23.12%</span> From Alpha Assessment
                    </div>
                    <ProgressChart size={Number(80)} range={74} />
                    <div className="flex-row-middle margin-top-4">
                      <div className="flex-row-middle">
                        <div className="width-5 height-2 background-color-blue-light rounded-small"></div>
                        <div className="text-xs margin-left-2 text-color-1">Current Assessment</div>
                      </div>
                      <div className="flex-row-middle margin-left-4">
                        <div className="width-5 height-2 background-color-blue radius-small"></div>
                        <div className="text-xs margin-left-2 text-color-1">June Assessment</div>
                      </div>
                    </div>
                    */}
                </div>
                <div
                  className="background-color-white border-1px rounded-large padding-5 box-shadow-large"
                  style={{width: 330, marginBottom: 10}}
                >
                  <Text
                    className="margin-bottom-5 weight-medium"
                    fontSize="18px"
                    fontWeight="700"
                  >
                    Brands By Food Vehicle Breakdown
                  </Text>
                  <div className="flex-row-middle">
                    <PublicPieChart
                      bg={[
                        '#526CDB',
                        'rgba(82, 108, 219, 0.75)',
                        'rgba(82, 108, 219, 0.5)',
                        'rgba(79, 104, 212, 0.25)',
                      ]}
                    />
                  </div>
                </div>
                <div
                  className="background-color-white border-1px rounded-large padding-5 box-shadow-large"
                  style={{width: 330, marginBottom: 10}}
                >
                  <Text
                    className="margin-bottom-2 weight-medium"
                    fontSize="18px"
                    fontWeight="700"
                  >
                    Average Score for{' '}
                    <span className="text-color-body-text underline">all industries</span>
                  </Text>
                  <Text
                    className="margin-bottom-2 weight-medium"
                    fontSize="44px"
                    fontWeight="700"
                  >
                    {mfiScore}%
                  </Text>

                  {/*
                    <div className="text-small margin-bottom-5">
                      <span className="text-color-green">+23.12%</span> From Alpha Assessment
                    </div>
                    <ProgressChart size={Number(80)} range={74} />
                    <div className="flex-row-middle margin-top-4">
                      <div className="flex-row-middle">
                        <div className="width-5 height-2 background-color-blue-light rounded-small"></div>
                        <div className="text-xs margin-left-2 text-color-1">Current Assessment</div>
                      </div>
                      <div className="flex-row-middle margin-left-4">
                        <div className="width-5 height-2 background-color-blue radius-small"></div>
                        <div className="text-xs margin-left-2 text-color-1">June Assessment</div>
                      </div>
                    </div>
                    */}
                </div>
              </Flex>
              <div className="width-1-0 padding-left-1" style={{flex: 1}}>
                <div className="border-1px rounded-large box-shadow-large background-color-white flex-column-centered">
                  <div className="flex-row-middle flex-space-between padding-5 width-full">
                    <h6 className="margin-bottom-0 weight-medium">All Brand Rankings</h6>
                    <div className="flex-row-middle margin-left-4">
                      <div
                        className="width-5 height-2 radius-small"
                        style={{background: '#00b37a'}}
                      ></div>
                      <div className="text-xs margin-left-2 text-color-body-text">
                        Overall MFI Score
                      </div>
                    </div>
                  </div>


                  <>
                    {/* one */}
                    <div
                      className="flex-row-middle flex-space-between padding-2  width-full"

                    >
                      <div className="flex-row margin-right-4 flex-row-middle">
                        <h5 style={{paddingRight: '16px', fontWeight: 'bold'}}>{rankOne[0].brandId === 1 && rankOne[0].rank === 1 ? 1 : ''})</h5>
                        <img
                          src={rankOne[0].companyName === 'Raffles Oil LFTZ Enterprise'
                            ? raffles : ''}
                          loading="lazy"
                          alt=""
                          className="margin-right-4 w-12 h-12 rounded-full"
                          style={{objectFit: 'contain'}}
                        />
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-high" style={{fontWeight: 'bold'}} >
                            {rankOne[0].companyName}
                          </div>
                        </Flex>
                      </div>
                    </div>


                    {rankOne.map((x) =>
                      <div
                        key={x.id}
                        className="flex-row-middle flex-space-between padding-2  width-full" style={{paddingLeft: '128px', paddingRight: '26px'}}
                      >
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium">
                            {x.brands}
                          </div>
                        </Flex>
                        <div className="height-2 rounded-full background-hover width-6-12">
                          <div
                            className="height-2 rounded-full width-2-3"
                            style={{background: '#00b37a', width: `${x.overallScore}%`}}
                          ></div>
                        </div>
                      </div>
                    )}


                    {/* two */}
                    <div
                      className="flex-row-middle flex-space-between padding-2 border-top-1px width-full "
                    >
                      <div className="flex-row margin-right-4 flex-row-middle">
                        <h5 style={{paddingRight: '16px', fontWeight: 'bold'}}>{rankTwo[0].brandId === 3 && rankTwo[0].rank === 3 ? 2 : ''})</h5>
                        <img
                          src={rankTwo[0].companyName === 'Flour Mills of Nigeria Plc'
                            ? flourMills : ''}
                          loading="lazy"
                          alt=""
                          className="margin-right-4 w-12 h-12 rounded-full"
                          style={{objectFit: 'contain'}}
                        />
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium" style={{fontWeight: 'bold'}}>
                            {rankTwo[0].companyName}
                          </div>
                        </Flex>
                      </div>
                    </div>


                    {rankTwo.map((x) =>
                      <div
                        key={x.id}
                        className="flex-row-middle flex-space-between padding-2  width-full" style={{paddingLeft: '128px', paddingRight: '26px'}}
                      >
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium">
                            {x.brands}
                          </div>
                        </Flex>
                        <div className="height-2 rounded-full background-hover width-6-12">
                          <div
                            className="height-2 rounded-full width-2-3"
                            style={{background: '#00b37a', width: `${x.overallScore}%`}}
                          ></div>
                        </div>
                      </div>
                    )}


                    {/* Three */}
                    <div
                      className="flex-row-middle flex-space-between padding-2 border-top-1px width-full "
                    >
                      <div className="flex-row margin-right-4 flex-row-middle">
                        <h5 style={{paddingRight: '16px', fontWeight: 'bold'}}>{rankThree[0].brandId === 5 && rankThree[0].rank === 5 ? 3 : ''})</h5>
                        <img
                          src={rankThree[0].companyName === 'Flour Mills of Nigeria Plc'
                            ? flourMills : ''}
                          loading="lazy"
                          alt=""
                          className="margin-right-4 w-12 h-12 rounded-full"
                          style={{objectFit: 'contain'}}
                        />
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium" style={{fontWeight: 'bold'}}>
                            {rankThree[0].companyName}
                          </div>
                        </Flex>
                      </div>
                    </div>


                    {rankThree.map((x) =>
                      <div
                        key={x.id}
                        className="flex-row-middle flex-space-between padding-2  width-full" style={{paddingLeft: '128px', paddingRight: '26px'}}
                      >
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium">
                            {x.brands}
                          </div>
                        </Flex>
                        <div className="height-2 rounded-full background-hover width-6-12">
                          <div
                            className="height-2 rounded-full width-2-3"
                            style={{background: '#00b37a', width: `${x.overallScore}%`}}
                          ></div>
                        </div>
                      </div>
                    )}


                    {/* Four */}
                    <div
                      className="flex-row-middle flex-space-between padding-2 border-top-1px width-full "
                    >
                      <div className="flex-row margin-right-4 flex-row-middle">
                        <h5 style={{paddingRight: '16px', fontWeight: 'bold'}}>{rankFour[0].brandId === 8 && rankFour[0].rank === 8 ? 4 : ''})</h5>
                        <img
                          src={rankFour[0].companyName === 'Dangote Sugar Refinery Plc'
                            ? dangote : ''}
                          loading="lazy"
                          alt=""
                          className="margin-right-4 w-12 h-12 rounded-full"
                          style={{objectFit: 'contain'}}
                        />
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium" style={{fontWeight: 'bold'}}>
                            {rankFour[0].companyName}
                          </div>
                        </Flex>
                      </div>
                    </div>


                    {rankFour.map((x) =>
                      <div
                        key={x.id}
                        className="flex-row-middle flex-space-between padding-2  width-full" style={{paddingLeft: '128px', paddingRight: '26px'}}
                      >
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium">
                            {x.brands}
                          </div>
                        </Flex>
                        <div className="height-2 rounded-full background-hover width-6-12">
                          <div
                            className="height-2 rounded-full width-2-3"
                            style={{background: '#00b37a', width: `${x.overallScore}%`}}
                          ></div>
                        </div>
                      </div>
                    )}


                    {/* Five */}
                    <div
                      className="flex-row-middle flex-space-between padding-2 border-top-1px width-full "
                    >
                      <div className="flex-row margin-right-4 flex-row-middle">
                        <h5 style={{paddingRight: '16px', fontWeight: 'bold'}}>{rankFive[0].brandId === 9 && rankFive[0].rank === 9 ? 5 : ''})</h5>
                        <img
                          src={rankFive[0].companyName === 'Honeywell Flour Mills Plc'
                            ? Honeywell : ''}
                          loading="lazy"
                          alt=""
                          className="margin-right-4 w-12 h-12 rounded-full"
                          style={{objectFit: 'contain'}}
                        />
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium" style={{fontWeight: 'bold'}}>
                            {rankFive[0].companyName}
                          </div>
                        </Flex>
                      </div>
                    </div>


                    {rankFive.map((x) =>
                      <div
                        key={x.id}
                        className="flex-row-middle flex-space-between padding-2  width-full" style={{paddingLeft: '128px', paddingRight: '26px'}}
                      >
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium">
                            {x.brands}
                          </div>
                        </Flex>
                        <div className="height-2 rounded-full background-hover width-6-12">
                          <div
                            className="height-2 rounded-full width-2-3"
                            style={{background: '#00b37a', width: `${x.overallScore}%`}}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Six */}
                    <div
                      className="flex-row-middle flex-space-between padding-2 border-top-1px width-full "
                    >
                      <div className="flex-row margin-right-4 flex-row-middle">
                        <h5 style={{paddingRight: '16px'}}>{rankSix[0].brandId === 10 && rankSix[0].rank === 10 ? 6 : ''})</h5>
                        <img
                          src={rankSix[0].companyName === 'Crown Flour Mills Ltd'
                            ? crownFlour : ''}
                          loading="lazy"
                          alt=""
                          className="margin-right-4 w-12 h-12 rounded-full"
                          style={{objectFit: 'contain'}}
                        />
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium" style={{fontWeight: 'bold'}}>
                            {rankSix[0].companyName}
                          </div>
                        </Flex>
                      </div>
                    </div>


                    {rankSix.map((x) =>
                      <div
                        key={x.id}
                        className="flex-row-middle flex-space-between padding-2  width-full" style={{paddingLeft: '128px', paddingRight: '26px'}}
                      >
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium">
                            {x.brands}
                          </div>
                        </Flex>
                        <div className="height-2 rounded-full background-hover width-6-12">
                          <div
                            className="height-2 rounded-full width-2-3"
                            style={{background: '#00b37a', width: `${x.overallScore}%`}}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Seven */}
                    <div
                      className="flex-row-middle flex-space-between padding-2 border-top-1px width-full "
                    >
                      <div className="flex-row margin-right-4 flex-row-middle">
                        <h5 style={{paddingRight: '16px'}}>{rankSeven[0].brandId === 15 && rankSeven[0].rank === 15 ? 7 : ''})</h5>
                        <img
                          src={rankSeven[0].companyName === 'PZ Wilmar Food Ltd'
                            ? pzWilmar : ''}
                          loading="lazy"
                          alt=""
                          className="margin-right-4 w-12 h-12 rounded-full"
                          style={{objectFit: 'contain'}}
                        />
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium" style={{fontWeight: 'bold'}}>
                            {rankSeven[0].companyName}
                          </div>
                        </Flex>
                      </div>
                    </div>


                    {rankSeven.map((x) =>
                      <div
                        key={x.id}
                        className="flex-row-middle flex-space-between padding-2  width-full" style={{paddingLeft: '128px', paddingRight: '26px'}}
                      >
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium">
                            {x.brands}
                          </div>
                        </Flex>
                        <div className="height-2 rounded-full background-hover width-6-12">
                          <div
                            className="height-2 rounded-full width-2-3"
                            style={{background: '#00b37a', width: `${x.overallScore}%`}}
                          ></div>
                        </div>
                      </div>
                    )}


                    {/* Eight */}
                    <div
                      className="flex-row-middle flex-space-between padding-2 border-top-1px width-full "
                    >
                      <div className="flex-row margin-right-4 flex-row-middle">
                        <h5 style={{paddingRight: '16px'}}>{rankEight[0].brandId === 17 && rankEight[0].rank === 17 ? 8 : ''})</h5>
                        <img
                          src={rankEight[0].companyName === 'Dufil Prima Foods Plc'
                            ? raffles : ''}
                          loading="lazy"
                          alt=""
                          className="margin-right-4 w-12 h-12 rounded-full"
                          style={{objectFit: 'contain'}}
                        />
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium" style={{fontWeight: 'bold'}}>
                            {rankEight[0].companyName}
                          </div>
                        </Flex>
                      </div>
                    </div>


                    {rankEight.map((x) =>
                      <div
                        key={x.id}
                        className="flex-row-middle flex-space-between padding-2  width-full" style={{paddingLeft: '128px', paddingRight: '26px'}}
                      >
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium">
                            {x.brands}
                          </div>
                        </Flex>
                        <div className="height-2 rounded-full background-hover width-6-12">
                          <div
                            className="height-2 rounded-full width-2-3"
                            style={{background: '#00b37a', width: `${x.overallScore}%`}}
                          ></div>
                        </div>
                      </div>
                    )}


                    {/* Nine */}
                    <div
                      className="flex-row-middle flex-space-between padding-2 border-top-1px width-full "
                    >
                      <div className="flex-row margin-right-4 flex-row-middle">
                        <h5 style={{paddingRight: '16px'}}>{rankNine[0].brandId === 19 && rankNine[0].rank === 19 ? 9 : ''})</h5>
                        <img
                          src={rankNine[0].companyName === 'Crown Flour Mills Ltd'
                            ? crownFlour : ''}
                          loading="lazy"
                          alt=""
                          className="margin-right-4 w-12 h-12 rounded-full"
                          style={{objectFit: 'contain'}}
                        />
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium" style={{fontWeight: 'bold'}}>
                            {rankNine[0].companyName}
                          </div>
                        </Flex>
                      </div>
                    </div>


                    {rankNine.map((x) =>
                      <div
                        key={x.id}
                        className="flex-row-middle flex-space-between padding-2  width-full" style={{paddingLeft: '128px', paddingRight: '26px'}}
                      >
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium">
                            {x.brands}
                          </div>
                        </Flex>
                        <div className="height-2 rounded-full background-hover width-6-12">
                          <div
                            className="height-2 rounded-full width-2-3"
                            style={{background: '#00b37a', width: `${x.overallScore}%`}}
                          ></div>
                        </div>
                      </div>
                    )}


                    {/* Ten */}
                    <div
                      className="flex-row-middle flex-space-between padding-2 border-top-1px width-full "
                    >
                      <div className="flex-row margin-right-4 flex-row-middle">
                        <h5 style={{paddingRight: '16px'}}>{rankTen[0].brandId === 20 && rankTen[0].rank === 20 ? 10 : ''})</h5>
                        <img
                          src={rankTen[0].companyName === 'Grand Cereals Ltd'
                            ? grandCereal : ''}
                          loading="lazy"
                          alt=""
                          className="margin-right-4 w-12 h-12 rounded-full"
                          style={{objectFit: 'contain'}}
                        />
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium" style={{fontWeight: 'bold'}}>
                            {rankTen[0].companyName}
                          </div>
                        </Flex>
                      </div>
                    </div>


                    {rankTen.map((x) =>
                      <div
                        key={x.id}
                        className="flex-row-middle flex-space-between padding-2  width-full" style={{paddingLeft: '128px', paddingRight: '26px'}}
                      >
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium">
                            {x.brands}
                          </div>
                        </Flex>
                        <div className="height-2 rounded-full background-hover width-6-12">
                          <div
                            className="height-2 rounded-full width-2-3"
                            style={{background: '#00b37a', width: `${x.overallScore}%`}}
                          ></div>
                        </div>
                      </div>
                    )}


                    {/* Eleven */}
                    <div
                      className="flex-row-middle flex-space-between padding-2 border-top-1px width-full "
                    >
                      <div className="flex-row margin-right-4 flex-row-middle">
                        <h5 style={{paddingRight: '16px'}}>{rankEleven[0]?.brandId === 21 && rankEleven[0].rank === 21 ? 11 : ''})</h5>
                        <img
                          src={rankEleven[0]?.companyName === 'Premium Edible Oils Ltd'
                            ? premiumEdibleOil : ''}
                          loading="lazy"
                          alt=""
                          className="margin-right-4 w-12 h-12 rounded-full"
                          style={{objectFit: 'contain'}}
                        />
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium" style={{fontWeight: 'bold'}}>
                            {rankEleven[0].companyName}
                          </div>
                        </Flex>
                      </div>
                    </div>


                    {rankEleven.map((x) =>
                      <div
                        key={x.id}
                        className="flex-row-middle flex-space-between padding-2  width-full" style={{paddingLeft: '128px', paddingRight: '26px'}}
                      >
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium">
                            {x.brands}
                          </div>
                        </Flex>
                        <div className="height-2 rounded-full background-hover width-6-12">
                          <div
                            className="height-2 rounded-full width-2-3"
                            style={{background: '#00b37a', width: `${x.overallScore}%`}}
                          ></div>
                        </div>
                      </div>
                    )}


                    {/* Twelve */}
                    <div
                      className="flex-row-middle flex-space-between padding-2 border-top-1px width-full "
                    >
                      <div className="flex-row margin-right-4 flex-row-middle">
                        <h5 style={{paddingRight: '16px'}}>{rankTwelve[0].brandId === 23 && rankTwelve[0].rank === 23 ? 12 : ''})</h5>
                        <img
                          src={rankTwelve[0].companyName === 'Dufil Prima Foods Plc'
                            ? raffles : ''}
                          loading="lazy"
                          alt=""
                          className="margin-right-4 w-12 h-12 rounded-full"
                          style={{objectFit: 'contain'}}
                        />
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium" style={{fontWeight: 'bold'}}>
                            {rankTwelve[0].companyName}
                          </div>
                        </Flex>
                      </div>
                    </div>


                    {rankTwelve.map((x) =>
                      <div
                        key={x.id}
                        className="flex-row-middle flex-space-between padding-2  width-full" style={{paddingLeft: '128px', paddingRight: '26px'}}
                      >
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium">
                            {x.brands}
                          </div>
                        </Flex>
                        <div className="height-2 rounded-full background-hover width-6-12">
                          <div
                            className="height-2 rounded-full width-2-3"
                            style={{background: '#00b37a', width: `${x.overallScore}%`}}
                          ></div>
                        </div>
                      </div>
                    )}


                    {/* Thirteen */}
                    <div
                      className="flex-row-middle flex-space-between padding-2 border-top-1px width-full "
                    >
                      <div className="flex-row margin-right-4 flex-row-middle">
                        <h5 style={{paddingRight: '16px'}}>{rankThirteen[0].brandId === 24 && rankThirteen[0].rank === 24 ? 13 : ''})</h5>
                        <img
                          src={rankThirteen[0].companyName === 'Kings Flour Mill Ltd'
                            ? kingsFlour : ''}
                          loading="lazy"
                          alt=""
                          className="margin-right-4 w-12 h-12 rounded-full"
                          style={{objectFit: 'contain'}}
                        />
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium" style={{fontWeight: 'bold'}}>
                            {rankThirteen[0].companyName}
                          </div>
                        </Flex>
                      </div>
                    </div>


                    {rankThirteen.map((x) =>
                      <div
                        key={x.id}
                        className="flex-row-middle flex-space-between padding-2  width-full" style={{paddingLeft: '128px', paddingRight: '26px'}}
                      >
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium">
                            {x.brands}
                          </div>
                        </Flex>
                        <div className="height-2 rounded-full background-hover width-6-12">
                          <div
                            className="height-2 rounded-full width-2-3"
                            style={{background: '#00b37a', width: `${x.overallScore}%`}}
                          ></div>
                        </div>
                      </div>
                    )}


                    {/* Fourteen */}
                    <div
                      className="flex-row-middle flex-space-between padding-2 border-top-1px width-full "
                    >
                      <div className="flex-row margin-right-4 flex-row-middle">
                        <h5 style={{paddingRight: '16px'}}>{rankFourteen[0].brandId === 25 && rankFourteen[0].rank === 25 ? 14 : ''})</h5>
                        <img
                          src={rankFourteen[0].companyName === 'Sunola Foods Ltd'
                            ? sunolaOil : ''}
                          loading="lazy"
                          alt=""
                          className="margin-right-4 w-12 h-12 rounded-full"
                          style={{objectFit: 'contain'}}
                        />
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium" style={{fontWeight: 'bold'}}>
                            {rankFourteen[0].companyName}
                          </div>
                        </Flex>
                      </div>
                    </div>


                    {rankFourteen.map((x) =>
                      <div
                        key={x.id}
                        className="flex-row-middle flex-space-between padding-2  width-full" style={{paddingLeft: '128px', paddingRight: '26px'}}
                      >
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium">
                            {x.brands}
                          </div>
                        </Flex>
                        <div className="height-2 rounded-full background-hover width-6-12">
                          <div
                            className="height-2 rounded-full width-2-3"
                            style={{background: '#00b37a', width: `${x.overallScore}%`}}
                          ></div>
                        </div>
                      </div>
                    )}


                    {/* Fifteen */}
                    <div
                      className="flex-row-middle flex-space-between padding-2 border-top-1px width-full "
                    >
                      <div className="flex-row margin-right-4 flex-row-middle">
                        <h5 style={{paddingRight: '16px'}}>{rankFifteen[0].brandId === 26 && rankFifteen[0].rank === 26 ? 15 : ''})</h5>
                        <img
                          src={rankFifteen[0].companyName === 'Apple & Pears Ltd'
                            ? appleAndPears : ''}
                          loading="lazy"
                          alt=""
                          className="margin-right-4 w-12 h-12 rounded-full"
                          style={{objectFit: 'contain'}}
                        />
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium" style={{fontWeight: 'bold'}}>
                            {rankFifteen[0].companyName}
                          </div>
                        </Flex>
                      </div>
                    </div>


                    {rankFifteen.map((x) =>
                      <div
                        key={x.id}
                        className="flex-row-middle flex-space-between padding-2  width-full" style={{paddingLeft: '128px', paddingRight: '26px'}}
                      >
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium">
                            {x.brands}
                          </div>
                        </Flex>
                        <div className="height-2 rounded-full background-hover width-6-12">
                          <div
                            className="height-2 rounded-full width-2-3"
                            style={{background: '#00b37a', width: `${x.overallScore}%`}}
                          ></div>
                        </div>
                      </div>
                    )}


                    {/* Sixteen */}
                    <div
                      className="flex-row-middle flex-space-between padding-2 border-top-1px width-full "
                    >
                      <div className="flex-row margin-right-4 flex-row-middle">
                        <h5 style={{paddingRight: '16px'}}>{rankSixteen[0].brandId === 29 && rankSixteen[0].rank === 29 ? 16 : ''})</h5>
                        <img
                          src={rankSixteen[0].companyName === 'BUA Foods Plc'
                            ? bua : ''}
                          loading="lazy"
                          alt=""
                          className="margin-right-4 w-12 h-12 rounded-full"
                          style={{objectFit: 'contain'}}
                        />
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium" style={{fontWeight: 'bold'}}>
                            {rankSixteen[0].companyName}
                          </div>
                        </Flex>
                      </div>
                    </div>


                    {rankSixteen.map((x) =>
                      <div
                        key={x.id}
                        className="flex-row-middle flex-space-between padding-2  width-full" style={{paddingLeft: '128px', paddingRight: '26px'}}
                      >
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium">
                            {x.brands}
                          </div>
                        </Flex>
                        <div className="height-2 rounded-full background-hover width-6-12">
                          <div
                            className="height-2 rounded-full width-2-3"
                            style={{background: '#00b37a', width: `${x.overallScore}%`}}
                          ></div>
                        </div>
                      </div>
                    )}


                    {/* Seventeen */}
                    <div
                      className="flex-row-middle flex-space-between padding-2 border-top-1px width-full "
                    >
                      <div className="flex-row margin-right-4 flex-row-middle">
                        <h5 style={{paddingRight: '16px'}}>{rankSeventeen[0].brandId === 30 && rankSeventeen[0].rank === 30 ? 17 : ''})</h5>
                        <img
                          src={rankSeventeen[0].companyName === 'Golden Oil Industries Ltd'
                            ? golden : ''}
                          loading="lazy"
                          alt=""
                          className="margin-right-4 w-12 h-12 rounded-full"
                          style={{objectFit: 'contain'}}
                        />
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium" style={{fontWeight: 'bold'}}>
                            {rankSeventeen[0].companyName}
                          </div>
                        </Flex>
                      </div>
                    </div>


                    {rankSeventeen.map((x) =>
                      <div
                        key={x.id}
                        className="flex-row-middle flex-space-between padding-2  width-full" style={{paddingLeft: '128px', paddingRight: '26px'}}
                      >
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium">
                            {x.brands}
                          </div>
                        </Flex>
                        <div className="height-2 rounded-full background-hover width-6-12">
                          <div
                            className="height-2 rounded-full width-2-3"
                            style={{background: '#00b37a', width: `${x.overallScore}%`}}
                          ></div>
                        </div>
                      </div>
                    )}


                    {/* Eighteen */}
                    <div
                      className="flex-row-middle flex-space-between padding-2 border-top-1px width-full "
                    >
                      <div className="flex-row margin-right-4 flex-row-middle">
                        <h5 style={{paddingRight: '16px'}}>{rankEighteen[0].brandId === 31 && rankEighteen[0].rank === 31 ? 18 : ''})</h5>
                        <img
                          src={rankEighteen[0].companyName === 'Sunola Foods Ltd'
                            ? sunolaOil : ''}
                          loading="lazy"
                          alt=""
                          className="margin-right-4 w-12 h-12 rounded-full"
                          style={{objectFit: 'contain'}}
                        />
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium" style={{fontWeight: 'bold'}}>
                            {rankEighteen[0].companyName}
                          </div>
                        </Flex>
                      </div>
                    </div>


                    {rankEighteen.map((x) =>
                      <div
                        key={x.id}
                        className="flex-row-middle flex-space-between padding-2  width-full" style={{paddingLeft: '128px', paddingRight: '26px'}}
                      >
                        <Flex
                          flexDirection="column"
                        >
                          <div className="text-small weight-medium">
                            {x.brands}
                          </div>
                        </Flex>
                        <div className="height-2 rounded-full background-hover width-6-12">
                          <div
                            className="height-2 rounded-full width-2-3"
                            style={{background: '#00b37a', width: `${x.overallScore}%`}}
                          ></div>
                        </div>
                      </div>
                    )}


                    {/* Blur */}
                    {/* {
                      [{
                        score: '69.38',
                        hue: 30,
                      },
                       {
                         score: '69.36',
                         hue: 0,
                       },
                       {
                         score: '68.34',
                         hue: 120,
                       },
                       {
                         score: '68.34',
                         hue: 60,
                       },
                       {
                         score: '66.27',
                         hue: 20,
                       },
                       {
                         score: '58.18',
                         hue: 120,
                       },
                       {
                         score: '58.18',
                         hue: 60,
                       },
                       {
                         score: '51.36',
                         hue: 90,
                       },
                       {
                         score: '48.18',
                         hue: 50,
                       },
                       {
                         score: '44.98',
                         hue: 30,
                       }].map((x) =>
                        <>
                          <div
                            key={x.score}
                            className="flex-row-middle flex-space-between padding-2 border-top-1px width-full "
                          >
                            <div className="flex-row margin-right-4 flex-row-middle">
                              <img
                                src={devon}
                                loading="lazy"
                                alt=""
                                className="margin-right-4 w-12 h-12 rounded-full"
                                style={{
                                  'filter': `blur(8px) hue-rotate(${x.hue}deg)`,
                                  'objectFit': 'contain'
                                }}
                              />
                              <Flex
                                flexDirection="column"
                                style={{filter: 'blur(8px)'}}
                              >
                                <div className="text-small weight-medium">
                                  {result['Dangote Sugar Refinery Plc'][0].companyName}
                                </div>
                              </Flex>
                            </div>
                          </div>


                          <div
                            className="flex-row-middle flex-space-between padding-2  width-full" style={{paddingLeft: '73px', paddingRight: '26px'}}
                          >
                            <Flex
                              flexDirection="column"
                              style={{filter: 'blur(8px)'}}
                            >
                              <div className="text-small weight-medium">
                                Devon Kings
                              </div>
                            </Flex>
                            <div className="height-2 rounded-full background-hover width-6-12">
                              <div
                                className="height-2 rounded-full width-2-3"
                                style={{background: '#00b37a', width: `${x.score}%`}}
                              ></div>
                            </div>
                          </div>
                        </>
                      )} */}

                  </>


                </div>
              </div>
            </Flex>
          </div>

          <div className="container-1280 margin-bottom-10 wf-section">
            <Performance name={'MFI Brands - Performance by Fortified Staple Food Vehicle'} />
          </div>
          <div className="container-1280 margin-bottom-10 wf-section">
            <div className="footer-cta-background">
              <div className="width-1-2 flex-column-centered portrait-width-full tablet-width-9-12">
                <Text className="text-align-center text-color-4 margin-bottom-10 boldTexts">
                  Register your company and be part of the solution to ensuring improved health
                  and nutrition through industry leadership
                </Text>
                <Link to="/sign-up" className="button w-button">
                  Register Your Company
                </Link>
              </div>
            </div>
          </div>
          <div className="border-top-1px margin-top-10 padding-top-5 flex-space-between">
            <div className="text-xs text-color-body-text">
              © Copyright MFI. All rights reserved
            </div>
            <div className="text-xs text-color-body-text">Powered by <a href=" https://www.technoserve.org/" target="_blank">TechnoServe</a></div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Page;
