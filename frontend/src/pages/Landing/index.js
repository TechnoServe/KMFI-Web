import React from 'react';
import otunba from 'assets/images/otunba.png';
import osagie from 'assets/images/osagie.png';
import fman from 'assets/images/fman.jpg';
import consumer from 'assets/images/lbs.jpg';
import mfiPillar from 'assets/images/mfi-pillar-image.png';
import coatOfArm from 'assets/images/coat_of_arms_of_nigeria.png';
import satTool from 'assets/images/Self-Assesment-Tool-(SAT).png';
import iegTool from 'assets/images/Industry-Expert-Group-Illustration.png';
import periodic from 'assets/images/Product-Quality-Testing-Illustration.png';
import avatar from 'assets/images/AvatarMFI-Benefits.svg';
import checkGreen from 'assets/images/Check-green.svg';
import LandingFooter from './footer';
import LandingHero from './hero';
import {Text, Flex} from '@chakra-ui/react';
import './landing.css';
import {Link} from 'react-router-dom';

const Landing = () => {
  return (
    <div>
      <LandingHero />
      <Flex flex={1} className="mt-40 md:mt-20 sm:flex-col" flexWrap="wrap">
        <Flex
          flex={1}
          minWidth="350px"
          background="#1E1F24"
          className="p-20 md:-p-10 sm:p-5"
          textAlign="center"
          flexDirection="column"
        >
          <Text
            className="text-color-body-text margin-bottom-2 text-align-center css-wcg9pd"
            color="rgba(255, 255, 255, 0.8)"
          >
            What is the MFI?
          </Text>
          <Text className="text-align-center regularBoldTexts" color="white">
            The MFI Components
          </Text>
          <Text
            className="text-lg leading-loose text-color-body-text text-align-center portrait-text-align-left"
            color="rgba(255, 255, 255, 0.8)"
          >
            The MFI solution is built around a framework, known as{' '}
            <a
              href="https://technoserve.gitbook.io/mfi-by-technoserve/the-4pg-framework"
              target="_blank"
              rel="noreferrer"
              style={{textDecoration: 'underline', fontWeight: 'bold'}}
            >
              the 4PG
            </a>
            , which emphasizes the core elements of sustainable business practices and commitment
            towards ensuring access to high quality and fortified foods. These factors are
            incorporated into the 3 component scores of the MFI system.
          </Text>
        </Flex>
        <Flex flex={1}>
          <img src={mfiPillar} loading="lazy" className="object-contain" alt="" />
        </Flex>
      </Flex>
      <div className="container-1280 margin-bottom-10 wf-section">
        <div className="grid-2-columns padding-y-20 flex-row-middle">
          <div className="portrait-margin-bottom-6">
            <h3 className=" regularBoldTexts">Self-Assessment Tool (SAT)</h3>
            <p className="text-base margin-bottom-6 tablet-text-small">
              Core to the MFI is a self-assessment tool that participating companies will own and
              update at intervals with the option of completing a full or abridged version. The SAT
              will enable companies to assess the salient elements of their quality management
              systems, values, and governance
            </p>
            <a
              href="https://technoserve.gitbook.io/mfi-by-technoserve/the-self-assessment-tool-sat"
              target="_blank"
              rel="noreferrer"
              className="button-secondary w-button"
            >
              Learn More
            </a>
          </div>
          <div>
            <img
              src={satTool}
              loading="lazy"
              alt=""
              sizes="(max-width: 479px) 90vw, (max-width: 767px) 45vw, (max-width: 991px) 46vw, 41vw"
              srcSet={`${satTool} 500w, ${satTool} 800w`}
            />
          </div>
        </div>
      </div>
      <div className="container-1280 margin-bottom-10 wf-section" style={{background: '#FAFAFA'}}>
        <div className="grid-2-columns padding-y-20 flex-row-middle">
          <div>
            <img
              src={periodic}
              loading="lazy"
              alt=""
              sizes="(max-width: 479px) 90vw, (max-width: 767px) 45vw, (max-width: 991px) 46vw, 41vw"
              srcSet={`${periodic} 500w, ${periodic} 800w`}
            />
          </div>
          <div className="portrait-margin-bottom-6">
            <h3 className="portrait-width-8-12 regularBoldTexts">Product Quality Testing</h3>
            <p className="text-base margin-bottom-6 tablet-text-small">
              Periodic product quality testing of brands is conducted to measure whether the levels
              of vitamins and minerals meet national fortification standards. Assays of product
              samples are carried out at top rated laboratories.
            </p>
            <a
              href="https://technoserve.gitbook.io/mfi-by-technoserve/product-quality-testing"
              target="_blank"
              rel="noreferrer"
              className="button-secondary w-button"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>

      <div className="container-1280 margin-bottom-12 wf-section">
        <div className="grid-2-columns padding-y-20 flex-row-middle">
          <div className="portrait-margin-bottom-6">
            <h3 className="portrait-width-8-12 regularBoldTexts">Industry Expert Group (IEG)</h3>
            <p className="text-base margin-bottom-6 tablet-text-small">
              Additional insights are gathered about the performance of participating companies
              through a moderated discussion, amongst a range of selected external stakeholders and
              industry experts (The IEG), about their 4PG results.
            </p>
            <a
              href="https://technoserve.gitbook.io/mfi-by-technoserve/the-industry-expert-group-ieg"
              target="_blank"
              rel="noreferrer"
              className="button-secondary w-button"
            >
              Learn More
            </a>
          </div>
          <div>
            <img src={iegTool} loading="lazy" alt="" />
          </div>
        </div>
      </div>
      <div className="container-1280 wf-section">
        <h3 className="text-align-center regularBoldTexts">What Does The MFI Mean For You?</h3>
        <div className="grid-2-columns padding-y-20 flex-row-middle">
          <div
            id="w-node-_855a4303-1e25-6fbc-f147-bc8376bc6383-da9fef06"
            className="benefits-image industry"
          >
            <div className="padding-5 border-1px black cartoon-shadow radius-large width-10-12 background-color-white portrait-width-full tablet-width-full">
              <div className="flex-row margin-bottom-4">
                <img src={fman} loading="lazy" alt="" className="margin-right-4 w-10 h-10" />
                <div>
                  <h6 className="weight-medium margin-bottom-1">Industry Leader</h6>
                  <div className="text-small text-color-body-text">
                    Flour Milling Association of Nigeria, (FMAN)
                  </div>
                </div>
              </div>
              <p className="text-xs text-color-1 tablet-text-small">
                The next level of action for FMAN is that we envisage industry-wide application of
                the MFI. Over time, participating companies will be able to market to consumers who
                will become more discerning and preferences develop for products that meet quality &
                fortification standards
              </p>
            </div>
          </div>
          <div className="portrait-margin-top-4">
            <div className="padding-bottom-4 border-bottom-1px padding-left-8">
              <img src={avatar} loading="lazy" alt="" className="margin-bottom-4" />
              <h4 className="weight-medium semiBoldTexts">Industry</h4>
            </div>
            <div className="padding-top-5">
              <div className="flex-row flex-align-start">
                <img
                  src={checkGreen}
                  loading="lazy"
                  alt=""
                  className="padding-top-1 margin-right-4"
                />
                <p className="text-base">
                  The MFI provides an avenue for industry players to demonstrate their commitment to
                  government regulation and standards by adopting its tools and processes.
                </p>
              </div>
              <div className="flex-row flex-align-start">
                <img
                  src={checkGreen}
                  loading="lazy"
                  alt=""
                  className="padding-top-1 margin-right-4"
                />
                <p className="text-base">
                  Marketing to Consumer Preferences: Over time, consumers become more discerning and
                  preferences develop for products that meet quality &amp; fortification standards
                </p>
              </div>
              <div className="flex-row flex-align-start">
                <img
                  src={checkGreen}
                  loading="lazy"
                  alt=""
                  className="padding-top-1 margin-right-4"
                />
                <p className="text-base">
                  The MFI platform enhances industry’s interaction with government by providing a
                  stronger and collective voice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="background-secondary wf-section">
        <div className="container-1280 background-secondary">
          <div className="grid-2-columns padding-y-20 flex-row-middle">
            <div>
              <div className="padding-bottom-4 border-bottom-1px padding-left-8">
                <img src={avatar} loading="lazy" alt="" className="margin-bottom-4" />
                <h4 className="weight-medium semiBoldTexts">Consumers</h4>
              </div>
              <div className="padding-top-5">
                <div className="flex-row flex-align-start">
                  <img
                    src={checkGreen}
                    loading="lazy"
                    alt=""
                    className="padding-top-1 margin-right-4"
                  />
                  <p className="text-base">
                    Consumers will have the ability to make better purchasing decisions of staple
                    foods by accessing information that will categorize and rank company performance
                    based on their participation on the index.
                    <br />
                  </p>
                </div>
              </div>
            </div>
            <div
              id="w-node-ed7065b9-6a6f-2763-d329-dfd64964e852-da9fef06"
              className="benefits-image industry"
            >
              <div className="padding-5 border-1px black cartoon-shadow radius-large width-10-12 background-color-white portrait-width-full tablet-width-full">
                <div className="flex-row margin-bottom-4">
                  <img src={consumer} loading="lazy" alt="" className="margin-right-4 w-10 h-10" />
                  <div>
                    <h6 className="weight-medium margin-bottom-1">Consumer</h6>
                    <div className="text-small text-color-body-text">Lagos Business School</div>
                  </div>
                </div>
                <p className="text-xs text-color-1 tablet-text-small">
                  Lagos Business School is glad to support the MFI, it is a timely initiative that
                  will strengthen the links between consumer health, national nutrition priorities,
                  and the achievement of the Sustainable Development Goals (SDGs) in Nigeria.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container-1280 wf-section">
        <div className="grid-2-columns padding-y-20 flex-row-middle">
          <div
            id="w-node-a72db297-3eed-8901-be0a-fbfad992b040-da9fef06"
            className="benefits-image industry block"
          >
            <img src={coatOfArm} loading="lazy" alt="" className="margin-bottom-4 w-10 h-10" />
            <div className="padding-5 border-1px black cartoon-shadow radius-large width-full background-color-white portrait-width-full tablet-width-full">
              <div className="flex-row items-start margin-bottom-4">
                <img
                  src={otunba}
                  loading="lazy"
                  alt=""
                  className="margin-right-4 h-10 w-10 rounded-full"
                />
                <div>
                  <h6 className="weight-medium margin-bottom-1">
                    Hon. Minister Otunba Adeniyi Adebayo
                  </h6>
                  <div className="text-xs text-color-body-text">
                    Federal Ministry of Industry, Trade, & Investment
                  </div>
                </div>
              </div>
              <p className="text-xs text-color-1 tablet-text-small">
                The nutritional well-being of our citizens; and the economic health of our food
                industry remain integral priorities of the federal government.
              </p>
            </div>
            <div className="padding-5 border-1px black cartoon-shadow radius-large width-full mt-8 background-color-white portrait-width-full tablet-width-full">
              <div className="flex-row items-start margin-bottom-4">
                <img
                  src={osagie}
                  loading="lazy"
                  alt=""
                  className="margin-right-4 h-10 w-10 rounded-full"
                />
                <div>
                  <h6 className="weight-medium margin-bottom-1">Hon. Minister Osagie Ehanire</h6>
                  <div className="text-xs text-color-body-text">Federal Ministry of Health</div>
                </div>
              </div>
              <p className="text-xs text-color-1 tablet-text-small">
                It is important that we continue to leverage the respective strengths of industry
                executives to implement effective and sustainable strategies in addition to the
                federal government’s ability to provide guidance in the context of an enabling
                environment.
              </p>
            </div>
          </div>
          <div>
            <div className="padding-bottom-4 border-bottom-1px padding-left-8">
              <img src={avatar} loading="lazy" alt="" className="margin-bottom-4" />
              <h4 className="weight-medium semiBoldTexts">Government/Regulatory Bodies</h4>
            </div>
            <div className="padding-top-5">
              <div className="flex-row flex-align-start">
                <img
                  src={checkGreen}
                  loading="lazy"
                  alt=""
                  className="padding-top-1 margin-right-4"
                />
                <p className="text-base">
                  MFI provides government with information that is relevant to improving the
                  operating landscape.
                </p>
              </div>
              <div className="flex-row flex-align-start">
                <img
                  src={checkGreen}
                  loading="lazy"
                  alt=""
                  className="padding-top-1 margin-right-4"
                />
                <p className="text-base">
                  MFI is also an avenue for government to share information and resources with
                  users.
                </p>
              </div>
              <div className="flex-row flex-align-start">
                <img
                  src={checkGreen}
                  loading="lazy"
                  alt=""
                  className="padding-top-1 margin-right-4"
                />
                <p className="text-base">
                  Government can leverage MFI learnings to generate effective policies for the
                  nutrition sector.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container-1280 margin-bottom-10 wf-section">
        <div className="footer-cta-background">
          <div className="width-1-2 flex-column-centered portrait-width-full tablet-width-9-12">
            <Text className="text-align-center text-color-4 margin-bottom-10 boldTexts">
              Register your company and be part of the solution to ensuring improved health and
              nutrition through industry leadership
            </Text>
            <Link to="/sign-up" className="button w-button">
              Register Your Company
            </Link>
          </div>
        </div>
      </div>
      <LandingFooter />
    </div>
  );
};

export default Landing;
