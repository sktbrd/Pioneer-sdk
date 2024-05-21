import { ChevronLeftIcon, ChevronRightIcon, Search2Icon } from '@chakra-ui/icons';
import {
  Avatar, Box, Button, Flex, Input, InputGroup, InputLeftElement, Stack, Text, Spinner, Checkbox
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { Pubkey } from '../Pubkey'
import { Balance } from '../Balance'
const itemsPerPage = 10; // Define how many items you want per page

export function Classic({ usePioneer, onSelect, onClose, filters }:any) {
  const { state } = usePioneer();
  const { app } = state;
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(filters?.searchQuery || '' );
  const [hasPubkey, setHasPubkey] = useState<boolean>(filters?.hasPubkey || false);
  const [onlyOwned, setOnlyOwned] = useState<boolean>(filters?.onlyOwned || false);
  const [noTokens, setNoTokens] = useState<boolean>(filters?.noTokens || false);
  const [memoless, setMemoless] = useState<boolean>(filters?.memoless || false);
  const [integrations, setIntegrations] = useState(filters?.integrations || []);



  return (
    <Stack >
      {app?.assets.length === 0 ? (
        <Flex justifyContent="center" alignItems="center" height="100vh">
          <Spinner size="xl" />
          blockchains{app?.blockchains.length}
          Loading....
        </Flex>
      ) : (
        <>
          {app?.assets.map((asset:any, index:any) => (
            <Box key={index} p={4} mb={2} borderRadius="md">
              <Flex>
                <Avatar size='xl' src={asset.icon} />
                <Box ml={3}>
                  <Text fontWeight="bold">{asset.name}</Text>
                  {/*<Text fontWeight="bold">{asset.networkId}</Text>*/}
                  {/*<Text fontSize="sm">Symbol: {asset.symbol}</Text>*/}
                  {/*<Text fontSize="sm">CAIP: {asset.caip}</Text>*/}
                  {/*<Text fontSize="sm">Type: {asset.type}</Text>*/}
                  {/*<Text fontSize="sm">memoless: {asset.memoless?.toString()}</Text>*/}
                  {/*<Text fontSize="sm">intergrations: {asset.integrations?.join(', ')}</Text>*/}
                  {asset?.pubkeys && (
                    <>
                      {asset?.pubkeys.map((pubkey: any, index: any) => (
                        <Pubkey key={index} usePioneer={usePioneer} pubkey={pubkey} />
                      ))}
                    </>
                  )}
                  {asset?.balances && (
                    <>
                      {asset?.balances.map((balance: any, index: any) => (
                        <Balance key={index} usePioneer={usePioneer} balance={balance} />
                      ))}
                    </>
                  )}
                </Box>
                <Button ml="auto" onClick={() => onSelect(asset)}>
                  Select
                </Button>
              </Flex>
            </Box>
          ))}
        </>
      )}
    </Stack>
  );
}
export default Classic;
