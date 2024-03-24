import { ChevronLeftIcon, ChevronRightIcon, Search2Icon } from '@chakra-ui/icons';
import {
  Avatar, Box, Button, Flex, Input, InputGroup, InputLeftElement, Stack, Text
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { usePioneer } from '@coinmasters/pioneer-react';

const itemsPerPage = 10; // Define how many items you want per page

export default function Asset({ onSelect }) {
  const { state } = usePioneer();
  let { app } = state;
  const [allAssets, setAllAssets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        let assets = await app.getAssets(); // Assuming this fetches all assets
        setAllAssets(assets);
      } catch (e) {
        console.error(e);
      }
    };
    fetchAssets();
  }, [app]);

  // Filter assets based on search query
  const filteredAssets = allAssets.filter(asset =>
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
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle page change
  const handleChangePage = (direction) => {
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
      {currentPageAssets.map((asset, index) => (
        <Box key={index} p={4} mb={2} borderRadius="md">
          <Flex align="center">
            <Avatar src={asset.icon} />
            <Box ml={3}>
              <Text fontWeight="bold">{asset.name}</Text>
              <Text fontSize="sm">Symbol: {asset.symbol}</Text>
              <Text fontSize="sm">CAIP: {asset.caip}</Text>
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
    </Stack>
  );
}
