import { ChevronLeftIcon, ChevronRightIcon, Search2Icon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Text,
  Spinner,
  Checkbox,
  IconButton,
  Badge,
  Card,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { Asset } from '../Asset';
import { Pubkey } from '../Pubkey';
import { Balance } from '../Balance';

const itemsPerPage = 10; // Define how many items you want per page

export function Assets({ usePioneer, onSelect, onClose, filters }: any) {
  const { state } = usePioneer();
  const { app, assets } = state;
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [assetContext, setAssetContext] = useState(app?.assetContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasPubkey, setHasPubkey] = useState<boolean>(filters?.hasPubkey || false);
  const [onlyOwned, setOnlyOwned] = useState<boolean>(filters?.onlyOwned || false);
  const [noTokens, setNoTokens] = useState<boolean>(filters?.noTokens || false);
  const [memoless, setMemoless] = useState<boolean>(filters?.memoless || false);
  const [integrations, setIntegrations] = useState(filters?.integrations || []);

  useEffect(() => {
    setAssetContext(app?.assetContext);
  }, [app, app?.assetContext]);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        if (app) {
          const filterParams = {
            searchQuery,
            hasPubkey,
            onlyOwned,
            noTokens,
            memoless,
            integrations
          };
          const assets = await app.getAssets(filterParams);
          const sortedAssets = assets.sort((a: any, b: any) => {
            const balanceA = app.balances.find((balance: any) => balance.caip === a.caip);
            const balanceB = app.balances.find((balance: any) => balance.caip === b.caip);

            const valueUsdA = balanceA?.valueUsd || 0;
            const valueUsdB = balanceB?.valueUsd || 0;

            return valueUsdB - valueUsdA;
          });
          setFilteredAssets(sortedAssets);
        }
      } catch (e) {
        console.error('Error fetching assets:', e);
      }
    };
    fetchAssets();
  }, [app, searchQuery, hasPubkey, onlyOwned, noTokens, memoless, integrations]);

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

  const formatBalance = (balance: string) => {
    console.log("balance: ", balance);
    const [integer, decimal] = balance.split('.');
    const largePart = decimal?.slice(0, 4);
    const smallPart = decimal?.slice(4, 8);
    return { integer, largePart, smallPart };
  };

  const formatUsd = (valueUsd: any) => {
    if (valueUsd == null) return null;
    return valueUsd.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <Stack spacing={1}>

      {assetContext ? (
        <Flex justifyContent="center" alignItems="center" height="100vh">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <>
          {currentPageAssets.map((asset: any, index: any) => (
            <Card key={index} borderRadius="md" p={1} mb={1} width="100%">
              <Flex align="center" width="100%">
                <Avatar src={asset.icon} />
                <Box ml={3} flex="1" minWidth="0">
                  <Text fontWeight="bold" isTruncated>{asset.name}</Text>
                  {app.balances
                    .filter((balance: any) => balance.caip === asset.caip)
                    .map((balance: any, index: any) => {
                      const { integer, largePart, smallPart } = formatBalance(balance.balance);
                      return (
                        <Text key={index}>
                          {integer}.
                          <Text as="span" fontSize="lg">{largePart}</Text>
                          {largePart === '0000' && (
                            <Text as="span" fontSize="xs">{smallPart}</Text>
                          )}
                          <Badge ml={2} colorScheme="teal">{asset.symbol}</Badge>
                          <br/>
                          <Badge colorScheme="green">USD {formatUsd(balance.valueUsd)}</Badge>
                        </Text>
                      );
                    })}
                </Box>
                <Button ml="auto" onClick={() => onSelect(asset)} size='xs'>
                  Select
                </Button>
              </Flex>
            </Card>
          ))}
          <Flex justifyContent="center" mt={4}>
            <Button onClick={() => handleChangePage('prev')} isDisabled={currentPage <= 1} size='sm' leftIcon={<ChevronLeftIcon />}>
              Prev
            </Button>
            <Text mx={4} alignSelf="center">
              Page {currentPage} of {totalPages}
            </Text>
            <Button onClick={() => handleChangePage('next')} isDisabled={currentPage >= totalPages} size='sm' rightIcon={<ChevronRightIcon />}>
              Next
            </Button>
          </Flex>
        </>
      )}

      {/*<InputGroup>*/}
      {/*  <InputLeftElement pointerEvents="none">*/}
      {/*    <Search2Icon color="gray.300" />*/}
      {/*  </InputLeftElement>*/}
      {/*  <Input*/}
      {/*    onChange={handleSearchChange}*/}
      {/*    placeholder="Search assets..."*/}
      {/*    value={searchQuery}*/}
      {/*    type="text"*/}
      {/*  />*/}
      {/*</InputGroup>*/}

      {/*<Flex justify="space-between">*/}
      {/*  <Checkbox isChecked={memoless} onChange={(e) => setMemoless(e.target.checked)}>Memoless</Checkbox>*/}
      {/*  <Checkbox isChecked={hasPubkey} onChange={(e) => setHasPubkey(e.target.checked)}>Has Pubkey</Checkbox>*/}
      {/*  <Checkbox isChecked={onlyOwned} onChange={(e) => setOnlyOwned(e.target.checked)}>Only Owned</Checkbox>*/}
      {/*  <Checkbox isChecked={noTokens} onChange={(e) => setNoTokens(e.target.checked)}>Exclude Tokens</Checkbox>*/}
      {/*</Flex>*/}

    </Stack>
  );
}

export default Assets;
