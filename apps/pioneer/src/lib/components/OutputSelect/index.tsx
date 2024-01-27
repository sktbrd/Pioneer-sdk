import { Search2Icon } from '@chakra-ui/icons';
import {
  Avatar, Box, Button, Flex, Input, InputGroup, InputLeftElement,
  Spinner, Stack, Tab, TabList, TabPanel, TabPanels, Tabs, Text, AvatarBadge, Image,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { usePioneer } from '../../context';
import { COIN_MAP_LONG } from '@pioneer-platform/pioneer-coins';

const CHAINS_WITH_TOKENS = [
  'BTC',
  'ETH',
  'BSC',
  'AVAX',
  'ARB'
];

export default function OutputSelect({ onClose, onSelect }:any) {
  const { state } = usePioneer();
  const { app, balances, pubkeys } = state;
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const itemsPerPage = 6;
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isSubmitAddressModalOpen, setIsSubmitAddressModalOpen] = useState(false);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      if(app){
        let allTokens = await app.getAssets();
        console.log("allTokens: ", allTokens);
        setAssets(allTokens);
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAssets();
  }, [app]);

  const getFilteredAssets = () => {
    const selectedChain = CHAINS_WITH_TOKENS[selectedTab];
    return assets.filter(asset => {
      const isBTC = selectedChain === 'BTC';
      const isNative = asset.type === 'native';
      const matchesChain = asset.chain === selectedChain;
      const matchesSearch = !search || (asset.symbol && asset.symbol.toLowerCase().includes(search.toLowerCase()));

      return (isBTC && isNative) || (matchesChain && matchesSearch);
    }).slice(currentPageIndex * itemsPerPage, (currentPageIndex + 1) * itemsPerPage);
  };

  const handleTabChange = (index) => {
    setSelectedTab(index);
    setCurrentPageIndex(0);
    setSearch('');
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setCurrentPageIndex(0);
  };

  const handleSelectClick = (asset: any) => {
    console.log("asset: ", asset);
    console.log("pubkeys: ", pubkeys);
    // Find a pubkey whose networks array includes the asset's networkId
    let pubkey = pubkeys.find((pk: { networks: string | any[]; }) => pk.networks.includes(asset.networkId));
    console.log("pubkey: ", pubkey);
    if (pubkey) {
      // handle asset selection logic
      asset.address = pubkey.address || pubkey.master; // or pubkey.pubkey based on what you need
      onSelect(asset); // onSelect function to handle the selected asset
    } else {
      // If NOT found, force the user to add pubkey for networkId
      setSelectedAsset(asset);
      setIsSubmitAddressModalOpen(true);
    }
  };

  const renderChainTabs = () => {
    return CHAINS_WITH_TOKENS.map((chain, index) => (
      <Tab key={index}>
        <Avatar size="md" src={`https://pioneers.dev/coins/${COIN_MAP_LONG[chain]}.png`} />
      </Tab>
    ));
  };

  const renderChainPanels = () => {
    return CHAINS_WITH_TOKENS.map((_, index) => (
      <TabPanel key={index}>
        {isLoading ? (
          <Spinner />
        ) : (
          getFilteredAssets().map((asset, index) => (
            <Box key={index}>
              <Flex alignItems="center" bg="black" border="1px solid #fff"
                    borderRadius="md" boxShadow="sm" padding={2}>
                <Avatar size="md" src={`https://pioneers.dev/coins/${COIN_MAP_LONG[asset.ticker]}.png`}>
                  <AvatarBadge boxSize={'1.25em'}>
                    <Image rounded="full" src={`https://pioneers.dev/coins/${COIN_MAP_LONG[asset.chain]}.png`} />
                  </AvatarBadge>
                </Avatar>
                <Box ml={3}>
                  <Text fontSize="sm">Asset: {asset?.identifier}</Text>
                  <Text fontSize="sm">{asset?.name}</Text>
                </Box>
                <Button ml="auto" onClick={() => handleSelectClick(asset)}
                        size="sm" variant="outline">
                  Select
                </Button>
              </Flex>
            </Box>
          ))
        )}
      </TabPanel>
    ));
  };

  return (
    <Stack spacing={4}>
      {/* Submit Address Modal */}
      <Modal isOpen={isSubmitAddressModalOpen} onClose={() => setIsSubmitAddressModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Submit Custom Address</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Please submit the address for {selectedAsset?.name}:</Text>
            <Input placeholder="Enter address..." />
            <Text mt={4} color="red.500">
              Warning: This address is NOT controlled by Pioneer. You must verify that you can manage these funds outside of Pioneer.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={() => setIsSubmitAddressModalOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <Search2Icon color="gray.300" />
        </InputLeftElement>
        <Input onChange={handleSearchChange} placeholder="Search assets..." type="text" value={search} />
      </InputGroup>
      <Box>
        <Tabs onChange={handleTabChange}>
          <TabList>{renderChainTabs()}</TabList>
          <TabPanels>{renderChainPanels()}</TabPanels>
        </Tabs>
      </Box>
      <Flex justifyContent="space-between" mt={4}>
        <Button isDisabled={currentPageIndex === 0}
                onClick={() => setCurrentPageIndex(currentPageIndex - 1)}>
          Previous Page
        </Button>
        <Button isDisabled={getFilteredAssets().length < itemsPerPage}
                onClick={() => setCurrentPageIndex(currentPageIndex + 1)}>
          Next Page
        </Button>
      </Flex>
    </Stack>
  );
}
