import React, { useState, useEffect } from 'react';
import {
  Box, Button, Flex, FormControl, FormLabel, Input, useToast, Avatar, Menu, MenuButton, MenuList, MenuItem, HStack, Text
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { COIN_MAP_LONG, getPaths } from '@pioneer-platform/pioneer-coins';
import { availableChainsByWallet, ChainToNetworkId, getChainEnumValue, NetworkIdToChain } from '@coinmasters/types';
import Path from '../../components/Path';
import StepTwo from './StepTwo';

const StepIndicator = ({ steps, currentStep }:any) => (
  <HStack spacing={4} justify="center" mb={6}>
    {steps.map((step:any, index:any) => (
      <Box
        key={index}
        p={2}
        borderRadius="full"
        bg={currentStep === index + 1 ? "blue.500" : "gray.200"}
        color={currentStep === index + 1 ? "white" : "gray.400"}
        display="flex"
        alignItems="center"
        justifyContent="center"
        width={8}
        height={8}
      >
        {index + 1}
      </Box>
    ))}
  </HStack>
);

const PathWizard = ({ usePioneer, networkId }:any) => {
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(networkId ? 2 : 1);
  const [allChains, setAllChains] = useState([]);
  const [selectedChain, setSelectedChain] = useState(networkId || '');
  const [path, setPath] = useState<any>({});
  const [pathName, setPathName] = useState('');

  const onStart = async () => {
    if (typeof window !== 'undefined') {
      const lastConnectedWallet = window.localStorage.getItem('lastConnectedWallet');
      if (lastConnectedWallet) {
        const walletType = lastConnectedWallet.split(':')[0];
        let blockchainsForContext = availableChainsByWallet[walletType.toUpperCase()];
        let allByCaip = blockchainsForContext.map((chainStr:any) => {
          const chainEnum = getChainEnumValue(chainStr);
          return chainEnum ? ChainToNetworkId[chainEnum] : undefined;
        }).filter(Boolean);
        setAllChains(allByCaip);
      }
    }
  };

  useEffect(() => {
    onStart();
  }, []);

  useEffect(() => {
    console.log("path: ", path);
  }, [path]);

  const getPathForChain = async () => {
    try {
      let defaultPath = getPaths([selectedChain]);
      console.log('defaultPath: ', defaultPath[0]);
      setPath(defaultPath[0]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (currentStep === 2) {
      getPathForChain();
    }
  }, [currentStep, selectedChain]);

  const nextStep = () => setCurrentStep(currentStep < 3 ? currentStep + 1 : currentStep);
  const prevStep = () => setCurrentStep(currentStep > 1 ? currentStep - 1 : currentStep);

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      const lastConnectedWallet = window.localStorage.getItem('lastConnectedWallet');
      if (!lastConnectedWallet) {
        return;
      }

      const walletType = lastConnectedWallet.split(':')[0];
      const existingPathsStr = window.localStorage.getItem(walletType + ':paths:add');
      const existingPaths = existingPathsStr ? JSON.parse(existingPathsStr) : [];

      const isDuplicate = existingPaths.some((existingPath:any) =>
        JSON.stringify(existingPath.addressNList) === JSON.stringify(path.addressNList)
      );

      if (!isDuplicate) {
        existingPaths.push(path);
        window.localStorage.setItem(walletType + ':paths:add', JSON.stringify(existingPaths));

        toast({
          title: "Path Created",
          description: "Your new path has been saved successfully.",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
        window.location.reload();
      } else {
        toast({
          title: "Duplicate Path",
          description: "This path already exists and was not added again.",
          status: "info",
          duration: 9000,
          isClosable: true,
        });
      }
    }
  };

  return (
    <Box p={4}>
      <Flex direction="column" align="center" justify="center">
        <StepIndicator steps={['Select Blockchain', 'Customize Path', 'Name and Save']} currentStep={currentStep} />

        {currentStep === 1 && (
          <FormControl>
            <FormLabel>Select Blockchain</FormLabel>
            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                {selectedChain || 'Select Blockchain'}
              </MenuButton>
              <MenuList>
                {allChains.map((chain) => (
                  <MenuItem key={chain} minH="40px" onClick={() => setSelectedChain(chain)}>
                    <Avatar
                      size="xs"
                      src={`https://pioneers.dev/coins/${COIN_MAP_LONG[NetworkIdToChain[chain as keyof typeof NetworkIdToChain] as keyof typeof COIN_MAP_LONG]}.png`}
                      mr={3}
                    />
                    <Text>{chain}</Text>
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </FormControl>
        )}

        {currentStep === 2 && (
          <StepTwo
            usePioneer={usePioneer}
            networkId={networkId}
            entry={path}
            onEntryChange={(updatedEntry:any) => setPath(updatedEntry)}
          />
        )}

        {currentStep === 3 && (
          <FormControl>
            <FormLabel>Name Your Path</FormLabel>
            <Input placeholder="Path name" value={pathName} onChange={(e) => setPathName(e.target.value)} />

            <Path usePioneer={usePioneer} path={path} />

            <Button mt={4} colorScheme="blue" onClick={handleSave}>Save</Button>
          </FormControl>
        )}

        <HStack spacing={4} mt={6}>
          <Button leftIcon={<ChevronLeftIcon />} onClick={prevStep} isDisabled={currentStep === 1}>
            Back
          </Button>
          <Button rightIcon={<ChevronRightIcon />} onClick={nextStep} isDisabled={currentStep === 3}>
            Next
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default PathWizard;
