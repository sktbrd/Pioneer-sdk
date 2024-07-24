import {
  Box,
  Button,
  Flex,
  Text,
  Input,
  VStack,
  SimpleGrid,
  Avatar,
} from "@chakra-ui/react";
import { useState } from "react";

const mockData = {
  assets: [{ id: 1, name: "Asset 1", description: "Description of Asset 1" }],
  networks: [{ id: 1, name: "Network 1", description: "Description of Network 1" }],
  caips: [{ id: 1, name: "CAIP 1", description: "Description of CAIP 1" }],
  nodes: [{ id: 1, name: "Node 1", description: "Description of Node 1" }],
  dapps: [{ id: 1, name: "DApp 1", description: "Description of DApp 1" }],
};

export function Search({usePioneer}: any) {
  const { state } = usePioneer();
  const { app, assetContext, context } = state;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = () => {
    const searchResults = [];
    Object.keys(mockData).forEach((key) => {
      searchResults.push(...mockData[key].filter((item) => item.name.toLowerCase().includes(query.toLowerCase())));
    });
    setResults(searchResults);
  };

  return (
    <Box>
      <Flex justify="center" mt={4} mb={4}>
        <VStack spacing={4}>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
          />
          <Button onClick={handleSearch}>Search</Button>
        </VStack>
      </Flex>

      <Flex justify="center" mt={4}>
        <SimpleGrid columns={{ sm: 1, md: 2, lg: 3 }} spacing={4}>
          {results.map((result) => (
            <Box key={result.id} borderWidth="1px" borderRadius="lg" overflow="hidden" p={4}>
              <Avatar name={result.name} />
              <Text mt={2} fontWeight="bold">{result.name}</Text>
              <Text>{result.description}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Flex>
    </Box>
  );
}

export default Search;
