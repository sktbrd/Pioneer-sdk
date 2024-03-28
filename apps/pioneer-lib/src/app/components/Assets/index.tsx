import { ChevronLeftIcon, ChevronRightIcon, Search2Icon } from '@chakra-ui/icons';
import {
  Avatar, Box, Button, Flex, Input, InputGroup, InputLeftElement, Stack, Text, Spinner, Checkbox
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
// import Asset from '@/app/components/Asset';

const itemsPerPage = 10; // Define how many items you want per page

export interface AssetsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  usePioneer: any;
  children?: React.ReactNode;
}

export function Assets({ usePioneer, onSelect, onClose, filters }: any) {
  const { state } = usePioneer();
  const { app } = state;
  const [allAssets, setAllAssets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasPubkey, setHasPubkey] = useState<boolean>(filters?.hasPubkey || false);
  const [onlyOwned, setOnlyOwned] = useState<boolean>(filters?.onlyOwned || false);
  const [noTokens, setNoTokens] = useState<boolean>(filters?.noTokens || false);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        let assets = await app.getAssets();

        //pubkeys
        console.log("app.pubkeys: ", app.pubkeys);
        console.log("assets: ", assets);
        assets = assets.map((asset: any) => {
          // Find the corresponding balance object for the asset
          const balanceObj = app.balances.find((balance: any) => balance.caip === asset.caip);
          const valueUsd = balanceObj ? parseFloat(balanceObj.valueUsd) : 0;
          const balance = balanceObj ? balanceObj.balance : '';

          // Attempt to find a corresponding pubkey object that includes the asset's networkId
          const pubkeyObj = app.pubkeys.find((pubkey: any) => pubkey.networks.includes(asset.networkId));

          // Extract the pubkey value if the pubkeyObj is found
          const pubkey = pubkeyObj ? pubkeyObj.pubkey : null;

          // Set the asset's address to pubkey.master or pubkey.address if available
          const address = pubkeyObj ? (pubkeyObj.master || pubkeyObj.address) : null;

          // Return the enriched asset object, including balance, valueUsd, pubkey, and the new address
          return { ...asset, valueUsd, balance, pubkey, address };
        });


        // Sort by valueUsd in descending order
        assets.sort((a: any, b: any) => b.valueUsd - a.valueUsd);

        setAllAssets(assets);
      } catch (e) {
        console.error(e);
      }
    };
    fetchAssets();
  }, [app, onlyOwned, noTokens]);

  const filteredAssets = allAssets.filter((asset: any) =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (!onlyOwned || (onlyOwned && asset.balance && parseFloat(asset.balance) > 0)) &&
    (!noTokens || (noTokens && asset.type !== 'token')) &&
    (!hasPubkey || (hasPubkey && asset.pubkey))
  );

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

  const currentPageAssets = filteredAssets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearchChange = (event: any) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleChangePage = (direction: any) => {
    setCurrentPage(prev => direction === 'next' ? Math.min(prev + 1, totalPages) : Math.max(prev - 1, 1));
  };

  return (
    <Stack spacing={4}>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <Search2Icon color="gray.300" />
        </InputLeftElement>
        <Input
          onChange={handleSearchChange}
          placeholder="Search assets..."
          value={searchQuery}
          type="text"
        />
      </InputGroup>

      <Flex justify="space-between">
        <Checkbox isChecked={hasPubkey} onChange={(e) => setHasPubkey(e.target.checked)}>has Pubkey</Checkbox>
        <Checkbox isChecked={onlyOwned} onChange={(e) => setOnlyOwned(e.target.checked)}>Only Owned</Checkbox>
        <Checkbox isChecked={noTokens} onChange={(e) => setNoTokens(e.target.checked)}>Exclude Tokens</Checkbox>
      </Flex>

      {allAssets.length === 0 ? (
        <Flex justifyContent="center" alignItems="center" height="100vh">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <>
          {currentPageAssets.map((asset: any, index: any) => (
            <Box key={index} p={4} mb={2} borderRadius="md">
              <Flex align="center">
                <Avatar size='xl' src={asset.icon} />
                <Box ml={3}>
                  <Text fontWeight="bold">{asset.name}</Text>
                  <Text fontSize="sm">Symbol: {asset.symbol}</Text>
                  <Text fontSize="sm">CAIP: {asset.caip}</Text>
                  <Text fontSize="sm">Type: {asset.type}</Text>
                  {asset.address && (
                    <Text fontSize="sm">Address: {asset.address}</Text>
                  )}
                  {asset.balance && asset.valueUsd > 0 && (
                    <Text fontSize="sm">Balance: {asset.balance} ({parseFloat(asset.valueUsd).toFixed(2)} USD)</Text>
                  )}
                </Box>
                <Button ml="auto" onClick={() => onSelect(asset)}>
                  Select
                </Button>
              </Flex>
            </Box>
          ))}
          <Flex justifyContent="center" mt={4}>
            <Button onClick={() => handleChangePage('prev')} isDisabled={currentPage <= 1} leftIcon={<ChevronLeftIcon />}>
              Prev
            </Button>
            <Text mx={4} alignSelf="center">
              Page {currentPage} of {totalPages}
            </Text>
            <Button onClick={() => handleChangePage('next')} isDisabled={currentPage >= totalPages} rightIcon={<ChevronRightIcon />}>
              Next
            </Button>
          </Flex>
        </>
      )}
    </Stack>
  );
}
export default Assets;
