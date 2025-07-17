import React from 'react';
import PageLayout from './Layout';
import {Container, Text, Box, Divider, Stack} from '@chakra-ui/react';
import {IconContext} from 'react-icons';
import {FiStar} from 'react-icons/fi';
import dummieData from 'Dummie/data.js';
import CompanyNameCard from 'components/companyDetail/companyNameDetail';
import ProductScoreCard from 'components/companyDetail/ProductScores';
import IndustryExpertScores from 'components/companyDetail/IndustryExpertScores';
import 'styles/webflow.css';
import 'styles/mfi-tns.webflow.css';
import 'styles/normalize.css';

/**
 * Companies page displays a summary table of all companies and their performance scores,
 * including self-assessment, validation, industry expert scores, and product testing results.
 *
 * @component
 * @returns {JSX.Element} A page layout containing a styled table of company scorecards
 */
const Companies = () => {
  // Render main page layout with a styled container and company table
  return (
    <PageLayout>
      <Container
        maxW="container.xl"
        border="1px solid gray.200"
        className="background-color-4"
        p="1.5rem"
        height="100vh"
        fontFamily="DM Sans"
      >
        {/* Header showing the number of companies displayed */}
        <Text
          fontFamily="DM Sans"
          fontWeight="500"
          fontSize="0.875rem"
          fontStyle="normal"
          color="#1C1D26"
          my="1.5rem"
        >
          Showing {dummieData.length} Companies
        </Text>
        {/* Table wrapper for headers and dynamic rows */}
        <Stack className="table border-1px rounded-large mb-16" bg="">
          {/* Table header row with column labels */}
          <div className="table-header padding-x-5 padding-y-4 all-caps text-xs letters-looser border-bottom-1px">
            <div className="flex-child-grow width-64">Company Name</div>
            <div className="flex-child-grow width-40 margin-right-2">Self Assessment</div>
            <div className="flex-child-grow width-40 margin-right-2">Validated Score</div>
            <div className="flex-child-grow width-40 margin-right-4">
              Industry Expert Group Scores
            </div>
            <div className="flex-child-grow">Product Testing Scores</div>
            <div className="width-10"></div>
          </div>
          {/* Render each company row using mapped dummy data */}
          {dummieData?.map((item) => (
            <>
              <div className="table-body background-color-white rounded-large">
                {/* Company row container with conditional background color for starred companies */}
                <Box
                  className="flex-row-middle flex-align-baseline width-full tablet-flex-column p-6"
                  bg={item?.star ? '#EEF1FC' : '#FFFFFF'}
                >
                  <div className="flex-child-grow width-64 tablet-margin-bottom-2">
                    {/* Component rendering the company's name and details */}
                    <CompanyNameCard companyDetail={item?.company_detail} />
                  </div>
                  <div className="flex-child-grow width-40 margin-right-2 flex-align-center tablet-width-full tablet-margin-bottom-2">
                    <span className="table-responsive-header all-caps text-xs letters-looser">
                      Self assessment{' '}
                    </span>{' '}
                    {/* Render self-assessment score */}
                    {item?.self_assessment_scores}
                  </div>
                  <div className="flex-child-grow width-40 margin-right-2 flex-align-center tablet-width-full">
                    <span className="table-responsive-header all-caps text-xs letters-looser">
                      Validated Score
                    </span>
                    {/* Render validated consultant score */}
                    {item?.validating_consultant_scores}
                  </div>
                  {/* Component for displaying industry expert scores */}
                  <IndustryExpertScores score={item?.industry_expert_group_scores} />

                  {/* Component for displaying product testing score and status */}
                  <ProductScoreCard
                    product={item?.product_testing_score?.product}
                    status={item?.product_testing_score?.status}
                    effect="Details"
                  />

                  <div className="width-10 tablet-absolute-top-right tablet-margin-4">
                    {/* Star icon indicator for company highlight; styled based on boolean flag */}
                    <IconContext.Provider
                      value={{
                        color: item?.star ? '#00B27A' : '#9696A6',
                        className: 'global-class-name',
                        style: {fill: item?.star ? '#526CDB' : '#FFFFFF'},
                      }}
                    >
                      <div>
                        <FiStar />
                      </div>
                    </IconContext.Provider>
                  </div>
                </Box>
              </div>
              {/* Divider between table rows */}
              <Divider bg="#000000" border="1px" borderColor="#FAFAFA" />
            </>
          ))}
        </Stack>
      </Container>
    </PageLayout>
  );
};

export default Companies;
