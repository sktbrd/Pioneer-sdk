import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Flex,
  Text,
  VStack,
  Input,
  useToast,
  IconButton,
} from '@chakra-ui/react';
import { WalletOption, availableChainsByWallet, Chain } from '@coinmasters/types';
import { CopyIcon } from '@chakra-ui/icons';
// Assuming AssetValue is used somewhere else
import { AssetValue } from '@pioneer-platform/helpers';
//@ts-ignore
import { COIN_MAP_LONG } from '@pioneer-platform/pioneer-coins';

const Context = ({ usePioneer, openModal, setAssetContext }: any) => {
  const toast = useToast();
  const { state, connectWallet } = usePioneer();
  const { app, assetContext, balances, context } = state;
  const [currentAssetContext, setCurrentAssetContext] = useState(app?.assetContext || { icon: 'https://pioneers.dev/coins/ethereum.png', name: 'Ethereum' });
  const [address, setAddress] = useState('');

  useEffect(() => {
    // Update the assetContext whenever state.app.assetContext changes
    if (app?.assetContext) {
      setCurrentAssetContext(app?.assetContext);
    } else {
      setCurrentAssetContext({ icon: 'https://pioneers.dev/coins/ethereum.png', name: 'Ethereum' });
    }
  }, [app?.assetContext]);

  useEffect(() => {
    // Fetch the address based on the current asset context
    const fetchAddress = async () => {
      try {
        if (currentAssetContext.name === 'Ethereum') {
          if(app && app.swapKit) {
            let fromAddress = await app.swapKit.getAddress(Chain.Ethereum);
            setAddress(fromAddress);
          }
        } else {
          if (currentAssetContext.pubkeys && currentAssetContext.pubkeys.length > 0) {
            const initialAddress = currentAssetContext.pubkeys[0].address || currentAssetContext.pubkeys[0].master;
            setAddress(initialAddress);
          } else {
            setAddress(currentAssetContext.address || '');
          }
        }
      } catch (error) {
        toast({
          title: 'Error fetching address',
          description: 'There was an error fetching the address',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchAddress();
  }, [currentAssetContext, app, app?.swapKit]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    toast({
      title: 'Address copied',
      description: `${currentAssetContext.name} address copied to clipboard`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const getEllipsisAddress = (addr: string, start: number = 6, end: number = 4) => {
    if (!addr) return '';
    return addr.length > start + end ? `${addr.slice(0, start)}...${addr.slice(-end)}` : addr;
  };

  const clearAssetContext = async () => {
    app.setAssetContext();
    setAssetContext();
    setCurrentAssetContext({ icon: 'https://pioneers.dev/coins/ethereum.png', name: 'Ethereum' });
    setAddress(await app.swapkit.getAddress('ETH'));
  };

  return (
    <VStack align="start" borderRadius="md" p={6} spacing={5} width="100%">
      <Flex flex="1" textAlign="center" align="center" width="100%">
        <Box
          onClick={clearAssetContext}
          cursor="pointer"
          bg="gray.100"
          p={1}
          borderRadius="full"
          _hover={{ bg: 'gray.200' }}
          transition="background-color 0.2s"
        >
          <Avatar size="md" src={currentAssetContext?.icon} mb="2" />
        </Box>
        <Box flex="1" />
        <Flex align="center" width="100%">
          <Input
            value={getEllipsisAddress(address)}
            isReadOnly
            placeholder="Address"
            size="sm"
            width="120px"
            mr={2}
            sx={{
              whiteSpace: 'nowrap',
            }}
          />
          <IconButton
            onClick={copyToClipboard}
            icon={<CopyIcon />}
            aria-label="Copy address"
            size="sm"
          />
        </Flex>
      </Flex>
    </VStack>
  );
};

export default Context;
