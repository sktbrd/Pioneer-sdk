import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Switch,
  Text,
  Avatar,
} from '@chakra-ui/react';
import { NetworkIdToChain } from '@coinmasters/types';
//@ts-ignore
import { COIN_MAP_LONG } from '@pioneer-platform/pioneer-coins';

import { usePioneer } from '../../context';

export default function Blockchains() {
  const { state } = usePioneer();
  const { app } = state;

  const [enabledChains, setEnabledChains] = useState<string[]>([]);

  useEffect(() => {
    // Here, we could initialize the enabledChains based on app?.blockchains if needed
  }, [app?.blockchains]);

  const toggleChain = (chain: string) => {
    setEnabledChains(prev => prev.includes(chain) ? prev.filter(c => c !== chain) : [...prev, chain]);
  };

  const saveEnabledChains = () => {
    console.log('Enabled chains to save:', enabledChains);
    // Logic to update the global state or perform another action with enabledChains
  };

  const renderChain = (chain: string) => (
    <Flex alignItems="center" justifyContent="space-between" p={2} borderBottomWidth="1px" borderColor="gray.200">
      <Flex alignItems="center">
        <Avatar size="sm" src={`https://pioneers.dev/coins/${COIN_MAP_LONG[NetworkIdToChain[chain] as keyof typeof COIN_MAP_LONG]}.png`} mr={4} />
        <Text fontWeight="bold">{chain}</Text>
      </Flex>
      <Switch isChecked={enabledChains.includes(chain)} onChange={() => toggleChain(chain)} />
    </Flex>
  );

  // Group and sort chains by type
  const { UTXO, EVM, others } = app?.blockchains?.reduce((acc, chain) => {
    if (chain.startsWith('bip122:')) acc.UTXO.push(chain);
    else if (chain.startsWith('eip155:')) acc.EVM.push(chain);
    else acc.others.push(chain);
    return acc;
  }, { UTXO: [], EVM: [], others: [] }) || {};

  return (
    <Box>
      <Text fontSize="xl" mb={4}>UTXO Chains</Text>
      {UTXO.map(renderChain)}
      <Text fontSize="xl" my={4}>EVM Chains</Text>
      {EVM.map(renderChain)}
      <Text fontSize="xl" my={4}>Other Chains</Text>
      {others.map(renderChain)}
      <Button colorScheme="blue" onClick={saveEnabledChains} mt={4}>Continue/Update</Button>
    </Box>
  );
}
