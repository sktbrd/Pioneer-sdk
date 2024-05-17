import React, { useEffect, useState } from 'react';
import {
  Box, Stack, Avatar, Table, Thead, Tbody, Tr, Th, Td, Text, Button, Collapse, IconButton
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import {
  getWalletBadgeContent,
  getWalletContent,
  pioneerImagePng,
} from '../WalletIcon';

export function Pubkey({ usePioneer, pubkey }: any) {
  const { state } = usePioneer();
  const { app } = state;
  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = () => setShowDetails(!showDetails);

  return (
    <Stack>
      <Box display="flex" alignItems="center">
        {getWalletContent(pubkey.context.split(":")[0])}
        <Box ml={3}>
          <Text fontWeight="bold">Address: {pubkey.master || pubkey.address}</Text>
          {/*<IconButton*/}
          {/*  icon={showDetails ? <ChevronUpIcon /> : <ChevronDownIcon />}*/}
          {/*  onClick={toggleDetails}*/}
          {/*  aria-label="Toggle details"*/}
          {/*/>*/}
        </Box>
      </Box>
      {/*<Collapse in={showDetails} animateOpacity>*/}
      {/*  <Table variant="simple" mt={4}>*/}
      {/*    <Thead>*/}
      {/*      <Tr>*/}
      {/*        <Th>Key</Th>*/}
      {/*        <Th>Value</Th>*/}
      {/*      </Tr>*/}
      {/*    </Thead>*/}
      {/*    <Tbody>*/}
      {/*      /!*{Object.entries(data).map(([key, value]) => (*!/*/}
      {/*      /!*  <Tr key={key}>*!/*/}
      {/*      /!*    <Td>{key}</Td>*!/*/}
      {/*      /!*    <Td>{typeof value === 'object' ? JSON.stringify(value) : value}</Td>*!/*/}
      {/*      /!*  </Tr>*!/*/}
      {/*      /!*))}*!/*/}
      {/*    </Tbody>*/}
      {/*  </Table>*/}
      {/*</Collapse>*/}
    </Stack>
  );
}

export default Pubkey;
