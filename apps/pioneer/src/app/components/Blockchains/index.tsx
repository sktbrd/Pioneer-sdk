import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Switch,
  Text,
  Avatar,
  useToast, // Import useToast
} from '@chakra-ui/react';
import { availableChainsByWallet, ChainToNetworkId, getChainEnumValue, NetworkIdToChain } from '@coinmasters/types';
//@ts-ignore
import { COIN_MAP_LONG } from '@pioneer-platform/pioneer-coins';

import { usePioneer } from '@coinmasters/pioneer-react';

export default function Blockchains({onSelect}: any) {
  const { state } = usePioneer();
  const { app } = state;

  const [allChains, setAllChains] = useState<string[]>([]);
  const [wallet, setWallet] = useState<string>('');
  const [enabledChains, setEnabledChains] = useState<string[]>([]);
  const toast = useToast(); // Initialize useToast

  let onStart = async function(){
    try{
      const lastConnectedWallet = localStorage.getItem('lastConnectedWallet');
      setWallet(lastConnectedWallet || '');
      if(lastConnectedWallet){
        console.log('lastConnectedWallet: ', lastConnectedWallet);
        await app.setContext(lastConnectedWallet);
        //get wallet type
        const walletType = lastConnectedWallet.split(':')[0];
        console.log('walletType: ', walletType);
        //set blockchains
        let blockchainsForContext = availableChainsByWallet[walletType.toUpperCase()];
        let allByCaip = blockchainsForContext.map((chainStr: any) => {
          const chainEnum = getChainEnumValue(chainStr);
          return chainEnum ? ChainToNetworkId[chainEnum] : undefined;
        });
        setAllChains(allByCaip)
      }
    }catch(e){
      console.error(e)
    }
  }
  useEffect(() => {
    onStart();
  }, []);

  useEffect(() => {
    // Initialize the enabledChains based on app?.blockchains if needed
    setEnabledChains(app?.blockchains || []);
  }, [app?.blockchains]);

  const toggleChain = (chain: string) => {
    setEnabledChains(prev => prev.includes(chain) ? prev.filter(c => c !== chain) : [...prev, chain]);
  };

  const selectAllChains = () => {
    setEnabledChains(allChains);
  };

  const unselectAllChains = () => {
    setEnabledChains([]);
  };

  const saveEnabledChains = () => {
    try{
      if (enabledChains.length === 0) {
        toast({
          title: 'Error',
          description: "At least one blockchain must be selected.",
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      console.log('Enabled chains to save:', enabledChains);
      app.setBlockchains(enabledChains);
      let walletType = wallet.split(':')[0];
      localStorage.setItem("cache:blockchains:"+walletType, JSON.stringify(enabledChains));
      // Logic to update the global state or perform another action with enabledChains
      // Reload the page to force restart the application
      window.location.reload();
    }catch(e){
      console.error(e)
    }
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
  const { UTXO, EVM, others } = allChains?.reduce((acc:any, chain:any) => {
    if (chain.startsWith('bip122:')) acc.UTXO.push(chain);
    else if (chain.startsWith('eip155:')) acc.EVM.push(chain);
    else acc.others.push(chain);
    return acc;
  }, { UTXO: [], EVM: [], others: [] }) || {};

  return (
    <Box>
      <Flex justifyContent="space-between" mb={4}>
        <Button colorScheme="green" onClick={selectAllChains}>Select All</Button>
        <Button colorScheme="red" onClick={unselectAllChains}>Unselect All</Button>
      </Flex>
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
