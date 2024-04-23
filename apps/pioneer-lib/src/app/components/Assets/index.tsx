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
  const [memoless, setMemoless] = useState<boolean>(filters?.memoless || false);
  const [integrations, setIntegrations] = useState<any>(filters?.integrations || false);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        console.log("rendering assets!")
        if(app && app.assets){
          console.log("app: ", app)
          console.log("app.assets: ", app.assets.length)
          let assets = app.assets
          assets.sort((a: any, b: any) => b.valueUsd - a.valueUsd);
          console.log("assets: ", app.assets.length)
          setAllAssets(assets);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchAssets();
  }, [app, app?.assets, onlyOwned, hasPubkey, noTokens]);

  const filteredAssets = allAssets.filter((asset: any) => {
    const assetName = asset.name ? asset.name.toLowerCase() : '';
    const normalizedSearchQuery = searchQuery ? searchQuery.toLowerCase() : '';
    const isAssetContext = app.assetContext && asset.caip === app.assetContext.caip;
    const hasRequiredIntegration = !integrations || integrations.length === 0 ||
      (asset?.integrations && integrations?.some((integration: any) => asset?.integrations.includes(integration)));

    return assetName.includes(normalizedSearchQuery) &&
      (!onlyOwned || (onlyOwned && asset.balance && parseFloat(asset.balance) > 0)) &&
      (!noTokens || (noTokens && asset.type !== 'token')) &&
      (memoless === null || (memoless === true && asset.memoless)) &&
      (!hasPubkey || (hasPubkey && asset.pubkey)) &&
      hasRequiredIntegration &&
      !isAssetContext;
  });

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
        <Checkbox isChecked={memoless} onChange={(e) => setMemoless(e.target.checked)}>Memoless</Checkbox>
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
                  <Text fontWeight="bold">{asset.networkId}</Text>
                  <Text fontSize="sm">Symbol: {asset.symbol}</Text>
                  <Text fontSize="sm">CAIP: {asset.caip}</Text>
                  <Text fontSize="sm">Type: {asset.type}</Text>
                  <Text fontSize="sm">memoless: {asset?.memoless?.toString()}</Text>
                  <Text fontSize="sm">intergrations: {asset?.integrations?.toString()}</Text>
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
