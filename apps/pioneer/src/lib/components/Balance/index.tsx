import React, { useState } from 'react';
import {
  Avatar, Box, Stack, Flex, Text, Button, Collapse, IconButton,
  useColorModeValue, Badge, Table, Thead, Tbody, Tr, Th, Td
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { getWalletBadgeContent } from '../WalletIcon';
import { usePioneer } from '../../context';
// @ts-ignore
import { COIN_MAP_LONG } from '@pioneer-platform/pioneer-coins';
let TAG = " | Balance | "
export default function Balance({ onClose, balance }: any) {
  const { state } = usePioneer();
  const { app } = state;

  const [showAdvanced, setShowAdvanced] = useState(false);
  const data = typeof balance === 'object' && balance !== null ? balance : JSON.parse(balance || '{}');

  // Directly use balance properties, handle undefined or null
  const balanceFormatted = balance.balance || 'N/A';
  const valueUsdFormatted = balance.valueUsd ? `$${balance.valueUsd}` : 'N/A';

  let openPage = () => {
    let tag = TAG + " | openPage | "
    try{
      // openPage
      console.log("openPage")

      //

    }catch(e){
      console.error(e)
    }
  }

  return (
    <Stack spacing={4}>
      <Flex alignItems="center">
        <Avatar
          size="md"
          src={`https://pioneers.dev/coins/${COIN_MAP_LONG[balance?.chain]}.png`}
          mr={4}
        >
          {getWalletBadgeContent(balance?.context.split(':')[0])}
        </Avatar>
        <Box border="1px" borderColor={useColorModeValue('gray.200', 'gray.700')} borderRadius="md" p={4} flexGrow={1}>
          <Badge colorScheme="blue" mb={2}>{balance.ticker || 'N/A'}</Badge>
          <Text fontSize="lg">Balance: {balanceFormatted}</Text>
          <Text fontSize="lg">Value (USD): {valueUsdFormatted}</Text>
        </Box>
        <Box ml={4}>
          <Button colorScheme="blue" size="lg">Send</Button>
          <Button colorScheme="green" size="lg">Receive</Button>
          <Button colorScheme="purple" size="lg">Swap</Button>
        </Box>
      </Flex>
      <Collapse in={showAdvanced} animateOpacity>
        <Box border="1px" borderColor={useColorModeValue('gray.200', 'gray.700')} borderRadius="md" p={4}>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Key</Th>
                <Th>Value</Th>
              </Tr>
            </Thead>
            <Tbody>
              {Object.entries(data as Record<string, unknown>).map(([key, value]) => (
                <Tr key={key}>
                  <Td>{key}</Td>
                  <Td>
                    {typeof value === 'string'
                      ? value
                      : typeof value === 'number'
                        ? value.toString()
                        : typeof value === 'boolean'
                          ? value.toString()
                          : value === null
                            ? 'null'
                            : typeof value === 'object'
                              ? JSON.stringify(value)
                              : 'Unsupported Type'}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Collapse>
      <Box alignSelf="flex-end">
        <IconButton
          icon={<ChevronDownIcon />}
          onClick={() => setShowAdvanced(!showAdvanced)}
          aria-label="Show Advanced"
        />
      </Box>
    </Stack>
  );
}
