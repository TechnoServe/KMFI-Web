import React from 'react';
import {Table, Thead, Tbody, Tr, Th, Td, Tooltip, Badge, Box} from '@chakra-ui/react';
import {TriangleUpIcon, TriangleDownIcon} from '@chakra-ui/icons';
import {fmt2, fmtPct2, getPercentForBand, getBandLabel, getBandColorScheme} from './helpers';
import PropTypes from 'prop-types';

export const WheatTable = ({rows, sortConfig, requestSort}) => (
  <Table variant="striped" colorScheme="gray" size="sm">
    <Thead>
      <Tr>
        {[
          ['company', 'Company'],
          ['brand', 'Brand'],
          ['size', 'Size'],
          ['vitA', 'Vit. A Results (Mg/Kg)'],
          ['vitACompliance', '% Compliance'],
          ['score1', 'MFI Score 1'],
          ['vitB3', 'Vit. B3 Results (Mg/Kg)'],
          ['vitB3Compliance', '% Compliance'],
          ['score2', 'MFI Score 2'],
          ['iron', 'Iron Results (Mg/Kg)'],
          ['ironCompliance', '% Compliance'],
          ['score3', 'MFI Score 3'],
          ['overall', 'Overall MFI Fortification Result (Average)'],
          ['band', 'Band'],
        ].map(([key, label]) => (
          <Th key={key} onClick={() => requestSort(key)} cursor="pointer" userSelect="none">
            <Box display="inline-flex" alignItems="center" gap={1}>
              {label} {sortConfig.key === key ? (sortConfig.direction === 'asc' ? <TriangleUpIcon /> : <TriangleDownIcon />) : null}
            </Box>
          </Th>
        ))}
      </Tr>
    </Thead>
    <Tbody>
      {rows.map((row, i) => (
        <Tr key={i}>
          <Td maxW="240px" position="sticky" left={0} bg="white" zIndex={1}>
            <Tooltip label={row.company} hasArrow>
              <Box as="span" display="inline-block" maxW="240px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                {row.company}
              </Box>
            </Tooltip>
          </Td>
          <Td>{row.brand}</Td>
          <Td>{row.size}</Td>
          <Td>{fmt2(row.vitA)}</Td>
          <Td>{fmtPct2(row.vitACompliance)}</Td>
          <Td color={row.score1 >= 28 ? 'green.500' : row.score1 >= 22 ? 'orange.500' : 'red.500'}>{fmt2(row.score1)}</Td>
          <Td>{fmt2(row.vitB3)}</Td>
          <Td>{fmtPct2(row.vitB3Compliance)}</Td>
          <Td color={row.score2 >= 28 ? 'green.500' : row.score2 >= 22 ? 'orange.500' : 'red.500'}>{fmt2(row.score2)}</Td>
          <Td>{fmt2(row.iron)}</Td>
          <Td>{fmtPct2(row.ironCompliance)}</Td>
          <Td color={row.score3 >= 28 ? 'green.500' : row.score3 >= 22 ? 'orange.500' : 'red.500'}>{fmt2(row.score3)}</Td>
          <Td>{fmt2(row.overall)}</Td>
          <Td>
            {(() => {
              const pct = getPercentForBand(row);
              const label = getBandLabel(pct);
              const cs = getBandColorScheme(label);
              return <Badge colorScheme={cs}>{label}</Badge>;
            })()}
          </Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
);

WheatTable.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  sortConfig: PropTypes.shape({
    key: PropTypes.string,
    direction: PropTypes.oneOf(['asc', 'desc'])
  }).isRequired,
  requestSort: PropTypes.func.isRequired,
};

export const MaizeTable = ({rows, sortConfig, requestSort}) => (
  <Table variant="striped" colorScheme="yellow" size="sm">
    <Thead>
      <Tr>
        {[
          ['company', 'Company'],
          ['brand', 'Brand'],
          ['size', 'Size'],
          ['vitA', 'Vit. A Results (Mg/Kg)'],
          ['vitACompliance', '% Compliance'],
          ['score1', 'MFI Score 1'],
          ['vitB3', 'Vit. B3 Results (Mg/Kg)'],
          ['vitB3Compliance', '% Compliance'],
          ['score2', 'MFI Score 2'],
          ['iron', 'Iron Results'],
          ['ironCompliance', '% Compliance'],
          ['score3', 'MFI Score 3'],
          ['overall', 'Overall MFI Result (Avg) - 20%'],
          ['aflatoxinScore', 'Aflatoxin Contaminant Score'],
          ['percentOfMax', '% of Max.'],
          ['kmfiAflatoxin', 'KMFI Aflatoxin Score - 10%'],
          ['weightedScore', 'Overall KMFI Score - Weighted'],
          ['band', 'Band'],
        ].map(([key, label]) => (
          <Th key={key} onClick={() => requestSort(key)} cursor="pointer" userSelect="none">
            <Box display="inline-flex" alignItems="center" gap={1}>
              {label} {sortConfig.key === key ? (sortConfig.direction === 'asc' ? <TriangleUpIcon /> : <TriangleDownIcon />) : null}
            </Box>
          </Th>
        ))}
      </Tr>
    </Thead>
    <Tbody>
      {rows.map((row, i) => (
        <Tr key={i}>
          <Td maxW="240px" position="sticky" left={0} bg="white" zIndex={1}>
            <Tooltip label={row.company} hasArrow>
              <Box as="span" display="inline-block" maxW="240px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                {row.company}
              </Box>
            </Tooltip>
          </Td>
          <Td>{row.brand}</Td>
          <Td>{row.size}</Td>
          <Td>{fmt2(row.vitA)}</Td>
          <Td>{fmtPct2(row.vitACompliance)}</Td>
          <Td color={row.score1 >= 28 ? 'green.500' : row.score1 >= 22 ? 'orange.500' : 'red.500'}>{fmt2(row.score1)}</Td>
          <Td>{fmt2(row.vitB3)}</Td>
          <Td>{fmtPct2(row.vitB3Compliance)}</Td>
          <Td color={row.score2 >= 28 ? 'green.500' : row.score2 >= 22 ? 'orange.500' : 'red.500'}>{fmt2(row.score2)}</Td>
          <Td>{fmt2(row.iron)}</Td>
          <Td>{fmtPct2(row.ironCompliance)}</Td>
          <Td color={row.score3 >= 28 ? 'green.500' : row.score3 >= 22 ? 'orange.500' : 'red.500'}>{fmt2(row.score3)}</Td>
          <Td>{fmt2(row.overall)}</Td>
          <Td>{fmt2(row.aflatoxinScore)}</Td>
          <Td>{row.percentOfMax != null ? `${fmt2(row.percentOfMax)}%` : '—'}</Td>
          <Td>{fmt2(row.kmfiAflatoxin)}</Td>
          <Td>{fmt2(row.weightedScore)}</Td>
          <Td>
            {(() => {
              const pct = getPercentForBand(row);
              const label = getBandLabel(pct);
              const cs = getBandColorScheme(label);
              return <Badge colorScheme={cs}>{label}</Badge>;
            })()}
          </Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
);

MaizeTable.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  sortConfig: PropTypes.shape({
    key: PropTypes.string,
    direction: PropTypes.oneOf(['asc', 'desc'])
  }).isRequired,
  requestSort: PropTypes.func.isRequired,
};

export const OilTable = ({rows, sortConfig, requestSort}) => (
  <Table variant="striped" colorScheme="yellow" size="sm">
    <Thead>
      <Tr>
        {[
          ['company', 'Company'],
          ['brand', 'Brand'],
          ['size', 'Size'],
          ['vitA', 'Vit. A Results (Mg/Kg)'],
          ['vitACompliance', '% Compliance (Vit A)'],
          ['score1', 'MFI Score (Vit A)'],
          ['overall', 'Overall MFI Fortification Result (Average)'],
          ['band', 'Band'],
        ].map(([key, label]) => (
          <Th key={key} onClick={() => requestSort(key)} cursor="pointer" userSelect="none">
            <Box display="inline-flex" alignItems="center" gap={1}>
              {label} {sortConfig.key === key ? (sortConfig.direction === 'asc' ? <TriangleUpIcon /> : <TriangleDownIcon />) : null}
            </Box>
          </Th>
        ))}
      </Tr>
    </Thead>
    <Tbody>
      {rows.map((row, i) => (
        <Tr key={i}>
          <Td maxW="240px" position="sticky" left={0} bg="white" zIndex={1}>
            <Tooltip label={row.company} hasArrow>
              <Box as="span" display="inline-block" maxW="240px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                {row.company}
              </Box>
            </Tooltip>
          </Td>
          <Td>{row.brand}</Td>
          <Td>{row.size}</Td>
          <Td>{fmt2(row.vitA)}</Td>
          <Td>{fmtPct2(row.vitACompliance)}</Td>
          <Td color={row.score1 >= 28 ? 'green.500' : row.score1 >= 22 ? 'orange.500' : 'red.500'}>{fmt2(row.score1)}</Td>
          <Td>{fmt2(row.overall)}</Td>
          <Td>
            {(() => {
              const pct = getPercentForBand(row);
              const label = getBandLabel(pct);
              const cs = getBandColorScheme(label);
              return <Badge colorScheme={cs}>{label}</Badge>;
            })()}
          </Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
);

OilTable.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  sortConfig: PropTypes.shape({
    key: PropTypes.string,
    direction: PropTypes.oneOf(['asc', 'desc'])
  }).isRequired,
  requestSort: PropTypes.func.isRequired,
};
