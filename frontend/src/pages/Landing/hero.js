/**
 * LandingHero component displays the top section of the landing page,
 * including navigation, MFI information, company rankings, and video content.
 *
 * @returns {JSX.Element} The rendered landing hero section.
 */
import React, {useState, useEffect} from 'react';

import yemi from 'assets/images/Yemi-Osinbajo.svg';
import handlePoint from 'assets/images/Handle-point.svg';
import logo from 'assets/mfilogo.png';
import technoLogo from 'assets/images/TNS-Logo-RGB_Horizontal_Full-Color.svg';
import './landing.css';
import {Link} from 'react-router-dom';
import {Flex} from '@chakra-ui/react';
import dangote from 'assets/images/dangote-sugar.png';
import Honeywell from 'assets/company_images/honeywell.png';
import flourMills from 'assets/company_images/flourmills.jpg';
import raffles from 'assets/company_images/dufil.png';
import MFICOY from '../../Dummie/mfiScoreSheet';
import {Modal} from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import {request} from 'common';

const LandingHero = () => {
  // State for controlling the video modal
  const [open, setOpen] = useState(false);
  const onOpenModal = () => setOpen(true);
  const onCloseModal = () => setOpen(false);

  // State for storing list of brands and rankings
  const [brandsList, setBrandsList] = useState([]);
  const [, setBrandsRankingList] = useState([]);

  /**
   * Fetches a list of brands and sorts them by descending weight.
   * Updates the component state with the sorted list.
   *
   * @returns {Promise<void>}
   */
  const getBrandList = async () => {
    try {
      const {
        data: {data: res},
      } = await request().get(`/ranking-list?page-size=100`);
      setBrandsList(res.sort((a, b) => b.weight - a.weight));
    } catch (error) {
      console.error(error);
    }
  };

  // On mount, fetch brand data and reset local storage
  useEffect(() => {
    getBrandList();
    localStorage.removeItem('mfi');
  }, []);

  // When brands list is populated, take top 5 for display
  useEffect(() => {
    if (brandsList.length > 0) {
      setBrandsRankingList(brandsList.slice(0, 5));
    }
  }, [brandsList]);

  // Sort dummy MFI scores from highest to lowest and assign ranks
  const ranks = MFICOY.sort(function (a, b) {
    return b.overallScore - a.overallScore;
  });

  ranks.forEach(function (player, i, arr) {
    player.rank = i === 0 || player.overallScore != arr[i - 1].overallScore
      ? i + 1
      : arr[i - 1].rank;
  });

  // Filter ranks into top five positions
  const rankOne = ranks.filter((x) => x.rank === 1);
  const rankTwo = ranks.filter((x) => x.rank === 3);
  const rankThree = ranks.filter((x) => x.rank === 5);
  const rankFour = ranks.filter((x) => x.rank === 8);
  const rankFive = ranks.filter((x) => x.rank === 9);

  return (
    // Main hero container with fixed nav and intro content
    <div
      id="Hero"
      className="landing-page-hero-background wf-section"
      style={{display: 'flex', flexWrap: 'wrap'}}
    >
      {/* Navigation links for login and registration */}
      <div
        data-collapse="medium"
        data-animation="default"
        data-duration="400"
        role="banner"
        className="px-10 sm:px-2 background-color-white border-bottom-1px fixed-top w-nav"
      >
        <div className="flex-row-middle max-width-full w-container">
          <div className="width-full flex-row-middle flex-space-between padding-y-5">
            <div className="flex-row-middle w-nav-brand">
              <a href="#" style={{display: 'flex'}}>
                <img src={logo} loading="lazy" alt="" className="mr-6 w-32 sm:w-24" />
              </a>
              <a href="https://www.technoserve.org" target="_blank" rel="noreferrer">
                <div className="text-color-body-text text-xs">Powered by</div>
                <img src={technoLogo} loading="lazy" alt="" className="margin-top-1 w-32 sm:w-24" />
              </a>
            </div>
            <nav role="navigation" className="flex-row-middle w-nav-menu">
              <Link to="/login" style={{background: 'transparent', marginRight: 20}}>
                Login
              </Link>
              <Link to="/sign-up" className="button-secondary w-button">
                Register Your Company
              </Link>
            </nav>
          </div>
          <div className="w-nav-button">
            <div className="w-icon-nav-menu"></div>
          </div>
        </div>
      </div>
      <div
        className="flex-row padding-top-20 md:flex-col container-1280 margin-top-24"
        style={{display: 'flex', flexWrap: 'wrap'}}
      >
        <div className="width-1-2 md:w-full padding-right-10 md:pr-0">
          <h2 className="regularBoldTexts">
            Sharing Information to Create a Malnutrition-Free Nigeria
          </h2>
          <p className="text-base">
            The Micronutrient Fortification Index (MFI) shares information about the quality of
            staple food fortification in Nigeria. Employing current industry data, the MFI ranks
            food processing companies’ performance, providing consumers with important information
            about the brands they purchase and giving these companies an opportunity to demonstrate
            their commitment to meeting quality standards for fortifying their products with
            essential vitamins and minerals.
          </p>
          {/* <div className="margin-bottom-10 flex-row-middle sm:flex-col sm:items-start sm:space-y-4 margin-top-6"> */}
          <Link to="/public-index" className="button margin-right-5 w-button">
            View Index Details
          </Link>
          <button onClick={onOpenModal} href="#" className="button-secondary play w-button">
            Watch the video
          </button>
          {/* Embedded YouTube video shown in modal */}
          <Modal open={open} onClose={onCloseModal} center>
            <div className="p-8">
              <iframe
                width="560"
                height="315"
                src="https://www.youtube-nocookie.com/embed/UktJBwh6xt8"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </Modal>
          {/* Local fallback video player for promo content */}
          <div>
            <video controls autoPlay loop>
              <source src={require('assets/KMFI_HOWTOVIDEO_FINALcONVERTED.mp4').default}
                type='video/mp4' />
            </video>
          </div>
          {/* </div> */}
          <div className="padding-5 background-secondary rounded-large" style={{marginTop: '20px'}}>
            <div className="flex-row margin-bottom-4">
              <img src={yemi} loading="lazy" alt="" className="margin-right-4" />
              <div>
                <h6 className="weight-medium margin-bottom-1">
                  His Excellency Prof. Yemi Osinbajo
                </h6>
                <div className="text-small text-color-body-text">
                  Vice President, Federal Republic of Nigeria
                </div>
              </div>
            </div>
            <p className="text-small text-color-body-text margin-bottom-0">
              <a
                href="https://www.yemiosinbajo.ng/vp-osinbajo-participates-at-the-2020-nigeria-food-processing-nutrition-leadership-forum-on-03-12-2020/"
                target="_blank"
                rel="noreferrer"
              >
                “The use of this tool should be adopted by all companies involved in fortification
                and I believe it should be made available to stakeholders and shareholders alike.”
              </a>
            </p>
          </div>

        </div>
        <div className="width-1-2 md:w-full padding-left-10 md:pl-0 md:mt-8">
          <div className="handles md:hidden"></div>
          <div className="border-1px black rounded-large cartoon-shadow background-color-white flex-column-centered">
            <div className="handle-points">
              <img src={handlePoint} loading="lazy" alt="" />
              <img src={handlePoint} loading="lazy" alt="" />
            </div>
            <div className="flex-row-middle flex-space-between padding-5 width-full">
              <h6 className="margin-bottom-0 weight-medium">2021 MFI Rankings</h6>
              <div className="flex-row-middle margin-left-4">
                <div className="width-5 height-2 radius-small background-brand"></div>
                <div className="text-xs margin-left-2 text-color-body-text">Overall MFI Score</div>
              </div>
            </div>
            <div
              className="flex-row-middle flex-space-between padding-5 width-full"
              style={{marginTop: '-21px'}}
            >
              <h6 className="margin-bottom-0 weight-medium">Top 5 Participants</h6>
            </div>
            {/* Top 5 company rankings with visual progress bars */}
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
                  className="flex-row-middle flex-space-between padding-2  width-full" style={{paddingLeft: '102px', paddingRight: '26px'}}
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
                  className="flex-row-middle flex-space-between padding-2  width-full" style={{paddingLeft: '102px', paddingRight: '26px'}}
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
                  className="flex-row-middle flex-space-between padding-2  width-full" style={{paddingLeft: '102px', paddingRight: '26px'}}
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
                  className="flex-row-middle flex-space-between padding-2  width-full" style={{paddingLeft: '102px', paddingRight: '26px'}}
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
                  className="flex-row-middle flex-space-between padding-2  width-full" style={{paddingLeft: '102px', paddingRight: '26px'}}
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
            </>

          </div>
        </div>
      </div>
    </div>
  );
};
export default LandingHero;
