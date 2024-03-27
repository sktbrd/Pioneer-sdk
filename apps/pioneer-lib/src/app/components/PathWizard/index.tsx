import React, { useState, useEffect } from 'react';
import {
  Box, Button, Flex, FormControl, FormLabel, Input, Stack, useToast, Avatar, Heading,
  Menu, MenuButton, MenuList, MenuItem, HStack, Icon, Text, useDisclosure, Select, Tooltip, Collapse, Textarea
} from '@chakra-ui/react';
import { COIN_MAP_LONG, getPaths, addressNListToBIP32, bip32ToAddressNList } from '@pioneer-platform/pioneer-coins';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, InfoOutlineIcon, ChevronUpIcon } from '@chakra-ui/icons';
// import { usePioneer } from '@coinmasters/pioneer-react';
import { availableChainsByWallet, ChainToNetworkId, getChainEnumValue, NetworkIdToChain } from '@coinmasters/types';
import Path from '../../components/Path';

const StepIndicator = ({ steps, currentStep }:any) => (
  <HStack spacing={4} justify="center" mb={6}>
    {steps.map((step: any, index: any) => (
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

const BIP32Description = () => (
  <Box mb={6}>
    <Text mb={4}>A BIP32 path specifies a unique hierarchy for deriving cryptographic keys from a master seed. Each segment of the path has a specific purpose:</Text>
    {/*<Text><b>purpose</b> - Indicates the high-level purpose of this key hierarchy, often tied to a standard like BIP44.</Text>*/}
    {/*<Text><b>coin_type</b> - Identifies the cryptocurrency to which the keys belong, ensuring separation between chains.</Text>*/}
    {/*<Text><b>account</b> - Separates keys into logical groupings that can represent accounts.</Text>*/}
    {/*<Text><b>change</b> - Differentiates between keys used for receiving transactions and keys used for change in transactions.</Text>*/}
    {/*<Text><b>address_index</b> - Identifies individual addresses within the account and change categories.</Text>*/}
  </Box>
);

const StepTwo = ({ entry, onEntryChange }: any) => {
  const [type, setType] = useState(entry.type);
  const { isOpen, onToggle } = useDisclosure();
  const [isPathValid, setIsPathValid] = useState(true);

  // Assuming bip32ToAddressNList is imported or defined elsewhere
  const handlePathChange = (e:any) => {
    const newPath = e.target.value;
    try {
      // Assuming bip32ToAddressNList converts a BIP32 path to an addressNList format
      const newAddressNList = bip32ToAddressNList(newPath);

      // Update both addressNList and addressNListMaster based on the converted value
      // For addressNListMaster, append the additional segments (0, 0) for the master key derivation
      onEntryChange({
        ...entry,
        addressNList: newAddressNList,
        addressNListMaster: [...newAddressNList, 0, 0], // Appends 0'/0' at the end for the master
        path: newPath
      });
      setIsPathValid(true); // Path is valid
    } catch (error) {
      console.error("Error converting BIP32 path to addressNList:", error);
      setIsPathValid(false); // Path is invalid but keep it in the form for user to edit
    }
  };

  return (
    <Box>
      {/*<BIP32Description />*/}
      <FormControl isInvalid={!isPathValid}>
        <FormLabel>Primary BIP32 Path</FormLabel>
        <Input
          name="path"
          // Safely handle the conversion with a check or default value
          value={entry.path || (entry.addressNList ? addressNListToBIP32(entry.addressNList) : '')}
          onChange={handlePathChange}
          placeholder="m/44'/0'/0'/0/0"
          borderColor={isPathValid ? "green.500" : undefined} // Use borderColor for valid paths
        />
        {!isPathValid && (
          <Text color="red.500" mt={2}>
            Not a valid BIP32 path. Please correct the path.
          </Text>
        )}
      </FormControl>

      <Flex alignItems="center" mt={4}>
        <Text flexShrink={0}>Advanced</Text>
        <ChevronDownIcon
          onClick={onToggle}
          // icon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          aria-label="Toggle advanced JSON edit"
          ml={2}
        />
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <Box mt={4} p={4} border="1px" borderColor="gray.300">
          <Textarea
            value={JSON.stringify(entry, null, 2)}
            onChange={(e) => onEntryChange(JSON.parse(e.target.value))}
            h="200px"
          />
        </Box>
      </Collapse>
    </Box>
  );
};

const PathWizard = () => {
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [allChains, setAllChains] = useState([]);
  const [selectedChain, setSelectedChain] = useState('');
  const [path, setPath] = useState<any>({});
  const [pathName, setPathName] = useState('');

  const onStart = async () => {
    const lastConnectedWallet = localStorage.getItem('lastConnectedWallet');
    if (lastConnectedWallet) {
      const walletType = lastConnectedWallet.split(':')[0];
      let blockchainsForContext = availableChainsByWallet[walletType.toUpperCase()];
      let allByCaip = blockchainsForContext.map((chainStr:any) => {
        const chainEnum = getChainEnumValue(chainStr);
        return chainEnum ? ChainToNetworkId[chainEnum] : undefined;
      }).filter(Boolean);
      setAllChains(allByCaip);
    }
  };

  useEffect(() => {
    onStart();
  }, []);

  useEffect(() => {
    console.log("path: ", path);
  }, [path]);

  let getPathForChain = async function(){
    try{
      let defaultPath = getPaths([selectedChain])
      console.log('defaultPath: ', defaultPath[0]);
      setPath(defaultPath[0]); // Update your state accordingly
      //

    }catch(e){
      console.error(e)
    }
  }

  useEffect(() => {
    if (currentStep === 2) {
      getPathForChain();
    }
  }, [currentStep, selectedChain]); // Ensure this effect depends on both currentStep and selectedChain


  const nextStep = () => setCurrentStep(currentStep < 3 ? currentStep + 1 : currentStep);
  const prevStep = () => setCurrentStep(currentStep > 1 ? currentStep - 1 : currentStep);

  const handleSave = () => {
    const lastConnectedWallet = localStorage.getItem('lastConnectedWallet');
    if (!lastConnectedWallet) {
      // Handle the case where there is no last connected wallet, if necessary
      return;
    }

    const walletType = lastConnectedWallet.split(':')[0];

    // Retrieve the existing paths array from localStorage, or initialize it as an empty array if not present
    const existingPathsStr = localStorage.getItem(walletType + ':paths:add');
    const existingPaths = existingPathsStr ? JSON.parse(existingPathsStr) : [];

    // Check if a path with the same addressNList already exists
    const isDuplicate = existingPaths.some((existingPath: any) =>
      JSON.stringify(existingPath.addressNList) === JSON.stringify(path.addressNList)
    );

    if (!isDuplicate) {
      // Push the new path into the array if it's not a duplicate
      existingPaths.push(path);

      // Save the updated array back to localStorage
      localStorage.setItem(walletType + ':paths:add', JSON.stringify(existingPaths));

      toast({
        title: "Path Created",
        description: "Your new path has been saved successfully.",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
      window.location.reload();
    } else {
      // Optionally notify the user that the path was not added because it's a duplicate
      toast({
        title: "Duplicate Path",
        description: "This path already exists and was not added again.",
        status: "info",
        duration: 9000,
        isClosable: true,
      });
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
                      src={`https://pioneers.dev/coins/${COIN_MAP_LONG[NetworkIdToChain[chain] as keyof typeof COIN_MAP_LONG]}.png`} // Modify this line according to your mapping of chains to images
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
            entry={path}
            onEntryChange={(updatedEntry: any) => setPath(updatedEntry)}
          />
        )}

        {currentStep === 3 && (
          <FormControl>
            <FormLabel>Name Your Path</FormLabel>
            <Input placeholder="Path name" value={pathName} onChange={(e) => setPathName(e.target.value)} />

            rewview:
            <Path path={path} />

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
