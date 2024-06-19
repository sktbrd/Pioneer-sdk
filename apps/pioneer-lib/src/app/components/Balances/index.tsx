import { ChevronDownIcon, ChevronUpIcon, Search2Icon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
// @ts-ignore
import { COIN_MAP_LONG } from '@pioneer-platform/pioneer-coins';
import React, { useEffect, useState } from 'react';

import Balance from '../Balance';
import { getWalletBadgeContent } from '../WalletIcon';

export interface BalancesProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function Balances({ usePioneer, onSelect, networkId }: any) {
  const { state } = usePioneer();
  const { app } = state;
  const [currentPage, setCurrentPage] = useState([]);
  const [showOwnedAssets, setShowOwnedAssets] = useState(false);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const { isOpen, onOpen, onClose: onModalClose } = useDisclosure();
  const [selectedBalance, setSelectedBalance] = useState(null);

  const handleSelectClick = async (asset: any) => {
    try {
      onOpen();
      app.setAssetContext(asset);
      setSelectedBalance(asset);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchChange = (event: any) => {
    setSearch(event.target.value);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const filteredAssets = currentPage
    .filter((asset: any) => {
      if (networkId) {
        const matchesNetworkId = asset.networkId === networkId;
        console.log('match:' + matchesNetworkId + ` Asset ${asset.networkId}: Network ID matches: ${networkId}`);
        if (matchesNetworkId) console.log('Approved asset: ', asset.type);
        if (matchesNetworkId) console.log('Approved asset: ', asset);
        return matchesNetworkId;
      }
      return true;
    })
    .filter((asset: any) => asset.type === 'token')
    .filter((asset: any) => asset.ticker.toLowerCase().includes(search.toLowerCase()))
    .sort((a: any, b: any) => {
      const aValue = a.valueUsd ? parseFloat(a.valueUsd) : 0;
      const bValue = b.valueUsd ? parseFloat(b.valueUsd) : 0;
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

  const fetchPage = async () => {
    try {
      if (app && app.balances) {
        setShowOwnedAssets(true);
        setCurrentPage(app.balances);
        console.log('app.balances: ', app.balances);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPage();
  }, [app, app?.balances]);

  return (
    <div>
      <Modal isOpen={isOpen} onClose={onModalClose} size={'xxl'}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Balance Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedBalance && <Balance usePioneer={usePioneer} onClose={onModalClose} balance={selectedBalance} />}
          </ModalBody>
        </ModalContent>
      </Modal>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <Search2Icon color="gray.300" />
        </InputLeftElement>
        <Input onChange={handleSearchChange} placeholder="Bitcoin..." type="text" value={search} />
      </InputGroup>
      <Box>
        <Button onClick={toggleSortOrder} size="sm">
          Sort by Value {sortOrder === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </Button>
        <br />
        <br />
        {filteredAssets.map((asset: any, index: number) => (
          // eslint-disable-next-line react/no-array-index-key
          <Box key={index}>
            <Flex
              alignItems="center"
              bg="black"
              borderRadius="md"
              boxShadow="sm"
              padding={2}
            >
              <Avatar
                size="md"
                src={`https://pioneers.dev/coins/${COIN_MAP_LONG[asset?.chain as keyof typeof COIN_MAP_LONG]}.png`}
              >
                {getWalletBadgeContent(asset?.context.split(':')[0])}
              </Avatar>
              <Box ml={3}>
                <Text fontSize="sm">Asset: {asset?.ticker}</Text>
                <Text fontSize="sm">amount: {asset?.balance}</Text>
                <Text fontSize="sm">
                  Value USD:{' '}
                  {typeof asset?.valueUsd === 'string'
                    ? (+asset.valueUsd).toFixed(2).toLocaleString()
                    : ''}
                </Text>
              </Box>
              <Button
                ml="auto"
                onClick={() => handleSelectClick(asset)}
                size="sm"
                variant="outline"
              >
                Select
              </Button>
            </Flex>
          </Box>
        ))}
      </Box>
      <Flex justifyContent="space-between" mt={4}>
      </Flex>
    </div>
  );
}

export default Balances;
