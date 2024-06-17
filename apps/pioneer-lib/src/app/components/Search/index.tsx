import React, { useState } from 'react';
import {
  Box,
  Button,
  Text,
  Input,
  VStack,
  Flex
} from '@chakra-ui/react';
//AI-sdk module
// let ai = require('@pioneer-platform/pioneer-ollama')
// ai.init()
//zod module




export function Search({ usePioneer, networkId }: any) {
  const { state } = usePioneer();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([{ foo: 'bar' }]);

  const handleSearch = () => {
    // let response = await ai.respond(messages)
    // console.log("response: ",response)
    // Mock search results
    setResults([{ foo: 'bar' }, { foo: 'baz' }]);
  };

  return (
    <div>
      <Flex direction="column" align="center" mt={4}>
        <Flex mb={4} width="100%" maxWidth="600px">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter search query"
            flex="1"
            mr={2}
          />
          <Button onClick={handleSearch}>
            Search
          </Button>
        </Flex>
        <VStack align="stretch" width="100%" maxWidth="600px">
          {results.map((result, index) => (
            <Box key={index} p={4} borderWidth="1px" borderRadius="lg" width="100%">
              <Text>{result.foo}</Text>
            </Box>
          ))}
        </VStack>
      </Flex>
    </div>
  );
}

export default Search;
