import React, {useState} from 'react';
import {Stack, Text, useToast, Flex, Button} from '@chakra-ui/react';
import governSelected from 'assets/images/GovernSelected.svg';
import governActive from 'assets/images/GovernActive.svg';
import sat from 'assets/images/sat.png';
import {useSelector} from 'react-redux';
import {request} from 'common';
import proptypes from 'prop-types';

const COMPANY_TIERS = {
  TIER_1: 'TIER_1',
  TIER_3: 'TIER_3',
};

/**
 * Introduction component renders a two-step onboarding view for the self-assessment tool.
 * Step 0 displays an introduction message and image; Step 1 allows the user to select a company tier.
 * Upon submission, the selected tier is saved via a backend API call.
 *
 * @component
 * @returns {JSX.Element} A two-step self-assessment intro and tier selection form.
 */
const Introduction = ({}) => {
  const toast = useToast();
  const user = useSelector((state) => state.auth.user);
  const [active, setActive] = useState(0);
  const [tier, setTier] = useState(null);
  const [loading, setLoading] = useState(false);

  // Posts the selected tier to the backend and updates loading state
  const postTier = async () => {
    setLoading(true);
    try {
      await request(true).post(`/company/set-tier`, {
        tier,
        'company-id': user.company.id,
      });
      setLoading(false);
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

  return (
    <Flex
      className="background-color-white container-480 padding-0 box-shadow-small rounded-large"
      style={{
        boxShadow: 'Shadow/small',
        width: 650,
        height: 580,
        border: '1px solid #1D1C361A',
      }}
      flexDirection="column"
    >
      {/* Main content area with conditional rendering for Step 0 and Step 1 */}
      <Stack flex="1" p="5">
        {active === 0 ? (
          <>
            {/* Step 0: Display introduction video and welcome message */}
            <Stack>
              <Stack height="250px">
                <img className="react-player" src={sat} alt="sat screen" width="100%" height="100%" />
              </Stack>
              <Stack>
                <Text className="text-base" fontWeight="700" fontSize="20px" pt="7" pb="2">
                  Welcome to the Self Assessment Tool
                </Text>
                <Text className="text-base">
                  The Self Assessment (SA) Tool is designed to enable your firm assess the
                  effectiveness of their quality management. The SA tool consists of indicators:
                  People Management Systems, Production, Continuous Impovement & Innovation, Procurement & Inputs Management, Public Engagement & Governance & Leadership Culture.{' '}
                </Text>
              </Stack>
            </Stack>
          </>
        ) : (
          <>
            {/* Step 1: Display tier selection options */}
            <Stack>
              <Text className="text-base" fontWeight="700" fontSize="20px" pt="7" pb="2">
                Select Scope
              </Text>{' '}
              <Text className="text-base" color="rgba(28, 29, 38, 0.6)">
                Please select your preferred scope according to your company’s size
              </Text>
              <Text className="text-base" color="#00B27A">
                Learn more
              </Text>
              <Flex pt="40px">
                {/* Card for Tier 1 selection */}
                <Stack
                  h="137px"
                  mr="5"
                  onClick={() => setTier(COMPANY_TIERS.TIER_1)}
                  p="3"
                  w="148px"
                  cursor="pointer"
                  border={
                    tier === COMPANY_TIERS.TIER_1
                      ? '1px solid #00B37A'
                      : '1px solid rgba(28, 29, 38, 0.6)'
                  }
                  borderRadius="8px"
                >
                  <img
                    src={tier === COMPANY_TIERS.TIER_1 ? governSelected : governActive}
                    loading="lazy"
                    width="24"
                    alt=""
                    className="margin-right-4"
                  />
                  <Text fontSize="13px" fontWeight="bold">
                    Abridged Version (Tier 1 Only)
                  </Text>
                  <Text fontSize="11px" color="rgba(28, 29, 38, 0.6)">
                    Assessment on just the essentials. Built for SMEs
                  </Text>
                </Stack>
                {/* Card for Tier 3 selection */}
                <Stack
                  h="137px"
                  mr="5"
                  onClick={() => setTier(COMPANY_TIERS.TIER_3)}
                  p="3"
                  w="148px"
                  cursor="pointer"
                  border={
                    tier === COMPANY_TIERS.TIER_3
                      ? '1px solid #00B37A'
                      : '1px solid rgba(28, 29, 38, 0.6)'
                  }
                  borderRadius="8px"
                >
                  <img
                    src={tier === COMPANY_TIERS.TIER_3 ? governSelected : governActive}
                    loading="lazy"
                    width="24"
                    alt=""
                    className="margin-right-4"
                  />
                  <Text fontSize="13px" fontWeight="bold">
                    Full Version (All Tiers)
                  </Text>
                  <Text fontSize="11px" color="rgba(28, 29, 38, 0.6)">
                    A complete self assesment, great for enterprises
                  </Text>
                </Stack>
              </Flex>
            </Stack>
          </>
        )}
      </Stack>
      {/* Footer with navigation dots and action button */}
      <Flex bg="#FAFAFA" h="64px" w="100%" p="4" justifyContent="space-between">
        <Flex pt="3" flexDirection="row">
          {[0, 1].map((val) => (
            <Stack
              key={val}
              cursor="pointer"
              onClick={() => setActive(val)}
              alignSelf="center"
              height="10px"
              mr="2"
              width="10px"
              borderRadius="100%"
              bg={active === val ? 'gray.900' : 'gray.200'}
            ></Stack>
          ))}
        </Flex>
        <Stack>
          {/* Button toggles between steps or submits the selected tier */}
          <Button
            _focus={{outline: 'none'}}
            onClick={() => (active === 0 ? setActive(1) : postTier())}
            bg="#00B27A"
            isLoading={active === 1 && loading}
            isDisabled={active === 1 && !tier}
            color="white"
            p="2"
            alignSelf="center"
          >
            {active === 0 ? 'next' : 'Begin Self Assessment'}
          </Button>
        </Stack>
      </Flex>
    </Flex>
  );
};

Introduction.propTypes = {
  getCompanyDetails: proptypes.any,
};

export default Introduction;
