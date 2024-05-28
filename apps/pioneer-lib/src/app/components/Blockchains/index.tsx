import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Switch,
  Text,
  Avatar,
  Select,
  useToast,
} from '@chakra-ui/react';
import { availableChainsByWallet, ChainToNetworkId, getChainEnumValue, NetworkIdToChain } from '@coinmasters/types';
//@ts-ignore
import { COIN_MAP_LONG } from '@pioneer-platform/pioneer-coins';

export function Blockchains({usePioneer, onSelect}: any) {
  const { state } = usePioneer();
  const { app } = state;

  const [allChains, setAllChains] = useState<string[]>([]);
  const [wallet, setWallet] = useState<string>('KEEPKEY');
  const [walletOptions, setWalletOptions] = useState<string[]>(Object.keys(availableChainsByWallet));
  const [enabledChains, setEnabledChains] = useState<string[]>([]);
  const [context, setContext] = useState(app?.context);
  const [contextType, setContextType] = useState(app?.contextType);
  const toast = useToast();

  useEffect(() => {
    if (app) {
      onStart();
      setContext(app.context);
      setContextType(app.contextType);
    }
  }, [wallet, app]);

  useEffect(() => {
    setEnabledChains(app?.blockchains || []);
  }, [app?.blockchains]);

  const onStart = async function() {
    if (wallet && app && typeof window !== 'undefined') {
      const walletType = wallet.split(':')[0];
      await app.setContextType(walletType);
      let blockchainsForContext = availableChainsByWallet[walletType.toUpperCase()] || [];
      let allByCaip = blockchainsForContext.map((chainStr:any) => {
        const chainEnum = getChainEnumValue(chainStr);
        return chainEnum ? ChainToNetworkId[chainEnum] : undefined;
      });
      setAllChains(allByCaip);
    }
  };

  const handleWalletChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    setWallet(event.target.value);
    const walletType = event.target.value.split(':')[0];
    if (app) {
      await app.setContextType(walletType);
    }
  };

  const selectAllChains = () => {
    setEnabledChains(allChains);
  };

  const unselectAllChains = () => {
    setEnabledChains([]);
  };

  const toggleChain = (chain: string) => {
    setEnabledChains(prev => prev.includes(chain) ? prev.filter(c => c !== chain) : [...prev, chain]);
  };

  const saveEnabledChains = () => {
    try {
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
      if (typeof window !== 'undefined') {
        window.localStorage.setItem("cache:blockchains:" + walletType, JSON.stringify(enabledChains));
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
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
  const { UTXO, EVM, others } = allChains.reduce((acc: any, chain: any) => {
    if (chain.startsWith('bip122:')) acc.UTXO.push(chain);
    else if (chain.startsWith('eip155:')) acc.EVM.push(chain);
    else acc.others.push(chain);
    return acc;
  }, { UTXO: [], EVM: [], others: [] });

  return (
    <Box>
      {/*<Flex justifyContent="space-between" mb={4}>*/}
      {/*  <Select placeholder="Select wallet" onChange={handleWalletChange}>*/}
      {/*    {walletOptions.map(option => (*/}
      {/*      <option key={option} value={option}>{option}</option>*/}
      {/*    ))}*/}
      {/*  </Select>*/}
      {/*  <Button colorScheme="green" onClick={selectAllChains}>Select All</Button>*/}
      {/*  <Button colorScheme="red" onClick={unselectAllChains}>Unselect All</Button>*/}
      {/*</Flex>*/}
      {/*{context && <Text fontSize="xl" my={4}>Current Context: {context}</Text>}*/}
      {/*{contextType && <Text fontSize="xl" my={4}>Context Type: {contextType}</Text>}*/}
      {UTXO.length > 0 && (
        <>
          <Text fontSize="xl" mb={4}>UTXO Chains</Text>
          {UTXO.map(renderChain)}
        </>
      )}
      {EVM.length > 0 && (
        <>
          <Text fontSize="xl" my={4}>EVM Chains</Text>
          {EVM.map(renderChain)}
        </>
      )}
      {others.length > 0 && (
        <>
          <Text fontSize="xl" my={4}>Other Chains</Text>
          {others.map(renderChain)}
        </>
      )}
      <Button colorScheme="blue" onClick={saveEnabledChains} mt={4}>Continue/Update</Button>
    </Box>
  );
}
export default Blockchains;
