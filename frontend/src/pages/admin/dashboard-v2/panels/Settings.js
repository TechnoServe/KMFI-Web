import React from 'react';
import {
  Box,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Switch,
  Input,
  VStack,
  Button,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';

const settingsData = [
  {company: 'FlourCo Ltd', memberType: 'Premium', category: 'Large'},
  {company: 'NutriMills', memberType: 'Standard', category: 'Medium'},
  {company: 'AgriFoods', memberType: 'Basic', category: 'Small'},
];

const keysData = [
  {key: 'PMS', meaning: 'People Management Systems'},
  {key: 'PCII', meaning: 'Production, Continuous Impovement & Innovation'},
  {key: 'PIM', meaning: 'Procurement & Input Management'},
  {key: 'PE', meaning: 'Public Engagement'},
  {key: 'GLC', meaning: 'Governance & Leadership Culture'},
  {key: 'IEG', meaning: 'Independent Expert Group'},
  {key: 'SAT', meaning: 'Self Assessment Tool - Unverified'},
  {key: '(V)', meaning: 'Verified*'},
  {key: '(U)', meaning: 'Unverified'},
];

const micronutrientStandards = [
  {category: 'Wheat Flour', nutrient: 'Vitamin A (mg/kg)', min: '0.5', max: '1.4'},
  {category: 'Wheat Flour', nutrient: 'Vitamin B3 (Niacin) (mg/kg)', min: '30', max: '-'},
  {category: 'Wheat Flour', nutrient: 'Iron (mg/kg)', min: '20', max: '-'},
  {category: 'Maize Flour', nutrient: 'Vitamin A (mg/kg)', min: '0.5', max: '1.4'},
  {category: 'Maize Flour', nutrient: 'Vitamin B3 (Niacin) (mg/kg)', min: '14.9', max: '-'},
  {category: 'Maize Flour', nutrient: 'Iron (mg/kg)', min: '21', max: '-'},
  {category: 'Edible Oils', nutrient: 'Vitamin A (mg/kg)', min: '20', max: '40'},
  {category: 'Aflatoxin', nutrient: 'Aflatoxin Contaminant Threshold (ppb)', min: '-', max: '10'},
];

const vitAScoringBands = [
  {flour: '100% to 375%', oils: '100% to 200%', score: '30%'},
  {flour: '80% - 99%', oils: '80% - 99%', score: '25%'},
  {flour: '51% - 79% or up to. 10% over Max: 376% - 413%', oils: '51% - 79% or up to. 10% over Max: 201% - 220%', score: '15%'},
  {flour: '31% - 50% or 11-20% over Max: 414% - 450%', oils: '31% - 50% or 11-20% over Max: 221% - 240%', score: '10%'},
  {flour: 'Below 31% or in excess of 20% of Max: >450%', oils: 'Below 31% or in excess of 20% of Max: >240%', score: '0%'},
];

const vitB3ScoringBands = [
  {flour: '≥ 100%', score: '30%'},
  {flour: '80% - 99%', score: '25%'},
  {flour: '51% - 79%', score: '15%'},
  {flour: '31% - 50%', score: '10%'},
  {flour: '≤ 31%', score: '0%'},
];

const ironScoringBands = [
  {wheat: '≥ 100%', maize: '≥ 100%', score: '30%'},
  {wheat: '80% - 99%', maize: '80% - 99%', score: '25%'},
  {wheat: '51% - 79%', maize: '51% - 79%', score: '15%'},
  {wheat: '31% - 50%', maize: '31% - 50%', score: '10%'},
  {wheat: 'Below 31%', maize: 'Below 31%', score: '0%'},
];

const aflatoxinScoringBands = [
  {ppb: '≤ 10 PPB', percent: '≤ 100%', score: '30%'},
  {ppb: '10.1 - 12 PPB', percent: '101% - 120%', score: '20%'},
  {ppb: '12.1 - 15 PPB', percent: '121% - 150%', score: '10%'},
  {ppb: '15.1 - 20 PPB', percent: '151% - 200%', score: '5%'},
  {ppb: '> 20 PPB', percent: '> 200%', score: '0%'},
];

const overallFortificationBandings = [
  {band: '100% and above', score: '20%', narrative: 'Fully Fortified'},
  {band: '80% - 99%', score: '', narrative: 'Adequately Fortified'},
  {band: '51% - 79%', score: '10% - 19.9%', narrative: 'Partly Fortified'},
  {band: '31% - 50%', score: '5% - 9.9%', narrative: 'Inadequately Fortified'},
  {band: 'Below 31%', score: '0% - 4.9%', narrative: 'Not Fortified'},
];


const Settings = () => {
  const toast = useToast();

  const handleSave = () => {
    toast({
      title: 'Settings saved.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Dashboard Settings
      </Heading>
      <Text mb={6}>Adjust preferences related to dashboard behavior and alerts.</Text>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Company Name</Th>
            <Th>Member Type</Th>
            <Th>KMFI Category</Th>
          </Tr>
        </Thead>
        <Tbody>
          {settingsData.map((item, index) => (
            <Tr key={index}>
              <Td>{item.company}</Td>
              <Td>{item.memberType}</Td>
              <Td>{item.category}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Heading size="md" mt={10} mb={4}>
        Key Terminology
      </Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Key</Th>
            <Th>Meaning</Th>
          </Tr>
        </Thead>
        <Tbody>
          {keysData.map((item, index) => (
            <Tr key={index}>
              <Td>{item.key}</Td>
              <Td>{item.meaning}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Heading size="md" mt={10} mb={4}>
        MICRONUTRIENT STANDARDS KEY
      </Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Category</Th>
            <Th>Nutrient</Th>
            <Th>Min. Values (100%)</Th>
            <Th>Max. Values</Th>
          </Tr>
        </Thead>
        <Tbody>
          {micronutrientStandards.map((item, index) => (
            <Tr key={index}>
              <Td>{item.category}</Td>
              <Td>{item.nutrient}</Td>
              <Td>{item.min}</Td>
              <Td>{item.max}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Heading size="md" mt={10} mb={4}>
        VIT A - Scoring Bands
      </Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Wheat & Maize Flour</Th>
            <Th>Edible Oils</Th>
            <Th>Weighted Scores</Th>
          </Tr>
        </Thead>
        <Tbody>
          {vitAScoringBands.map((row, index) => (
            <Tr key={index}>
              <Td>{row.flour}</Td>
              <Td>{row.oils}</Td>
              <Td>{row.score}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Heading size="md" mt={10} mb={4}>
        VIT B3 - Scoring Bands
      </Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Wheat & Maize Flour</Th>
            <Th>Weighted Scores</Th>
          </Tr>
        </Thead>
        <Tbody>
          {vitB3ScoringBands.map((row, index) => (
            <Tr key={index}>
              <Td>{row.flour}</Td>
              <Td>{row.score}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Heading size="md" mt={10} mb={4}>
        Iron - Scoring Bands
      </Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Wheat Flour</Th>
            <Th>Maize Flour</Th>
            <Th>Weighted Scores</Th>
          </Tr>
        </Thead>
        <Tbody>
          {ironScoringBands.map((row, index) => (
            <Tr key={index}>
              <Td>{row.wheat}</Td>
              <Td>{row.maize}</Td>
              <Td>{row.score}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Heading size="md" mt={10} mb={4}>
        Aflatoxin Contaminant Score
      </Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Maize Flour Max Permitted (PPB)</Th>
            <Th>% of Max</Th>
            <Th>Score</Th>
          </Tr>
        </Thead>
        <Tbody>
          {aflatoxinScoringBands.map((row, index) => (
            <Tr key={index}>
              <Td>{row.ppb}</Td>
              <Td>{row.percent}</Td>
              <Td>{row.score}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Heading size="md" mt={10} mb={4}>
        Overall Fortification Score Bandings
      </Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Bandings</Th>
            <Th>Weighted Scores</Th>
            <Th>Narrative Score</Th>
          </Tr>
        </Thead>
        <Tbody>
          {overallFortificationBandings.map((row, index) => (
            <Tr key={index}>
              <Td>{row.band}</Td>
              <Td>{row.score}</Td>
              <Td>{row.narrative}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default Settings;
