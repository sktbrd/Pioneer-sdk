import { ChevronLeftIcon, ChevronRightIcon, Search2Icon } from '@chakra-ui/icons';
import {
  Avatar, Box, Button, Flex, Input, InputGroup, InputLeftElement, Stack, Text, Spinner
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { usePioneer } from '@coinmasters/pioneer-react';

const itemsPerPage = 10; // Define how many items you want per page

export default function Asset({ onSelect }:any) {
  const { state } = usePioneer();
  let { app } = state;
  const [allAssets, setAllAssets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        let assets = await app.getAssets();

        assets = assets.map((asset) => {
          const balanceObj = app.balances.find(balance => balance.caip === asset.caip);
          // Parse the valueUsd from balanceObj, or default to 0 if not present
          const valueUsd = balanceObj ? parseFloat(balanceObj.valueUsd) : 0;
          // Use the balance amount from balanceObj, or default to an empty string if not present
          const balance = balanceObj ? balanceObj.balance : '';
          return { ...asset, valueUsd, balance };
        });

        // Sort by valueUsd in descending order
        assets.sort((a, b) => b.valueUsd - a.valueUsd);

        setAllAssets(assets);
      } catch (e) {
        console.error(e);
      }
    };
    fetchAssets();
  }, [app]);



  // Filter assets based on search query
  const filteredAssets = allAssets.filter((asset: any) =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate total pages
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

  // Get current page assets
  const currentPageAssets = filteredAssets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle search change
  const handleSearchChange = (event: any) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle page change
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
          placeholder="Search assets (e.g., Bitcoin)..."
          value={searchQuery}
          type="text"
        />
      </InputGroup>
      {allAssets.length === 0 ? (
        <Flex justifyContent="center" alignItems="center" height="100vh">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <>
          {currentPageAssets.map((asset: any, index: number) => (
            <Box key={index} p={4} mb={2} borderRadius="md">
              <Flex align="center">
                <Avatar size='xl' src={asset.icon} />
                <Box ml={3}>
                  <Text fontWeight="bold">{asset.name}</Text>
                  <Text fontSize="sm">Symbol: {asset.symbol}</Text>
                  <Text fontSize="sm">CAIP: {asset.caip}</Text>
                  {/* Conditionally render the balance and valueUsd text */}
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
