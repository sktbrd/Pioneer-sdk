import React, { useState } from 'react';
import {
  Avatar, Box, Stack, Flex, Text, Button, Collapse, IconButton,
  useColorModeValue, Badge, Table, Thead, Tbody, Tr, Th, Td
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { getWalletBadgeContent } from '../WalletIcon';
import { COIN_MAP_LONG } from '@pioneer-platform/pioneer-coins';

let TAG = " | Balance | ";

interface BalanceProps {
  onClose: () => void;
  balance: any;
}

export function Balance({ usePioneer, onClose, balance }: any) {
  const { state, hideModal, resetState } = usePioneer();
  const { app } = state;

  const [showAdvanced, setShowAdvanced] = useState(false);
  const data = typeof balance === 'object' && balance !== null ? balance : JSON.parse(balance || '{}');

  const balanceFormatted = balance.balance || 'N/A';
  const valueUsdFormatted = balance.valueUsd ? `$${parseFloat(balance.valueUsd).toFixed(2)}` : 'N/A';

  const handleModal = (action: string) => {
    app.setAssetContext(balance);
    onClose();
  };

  const handleCloseModal = () => {
    hideModal();
    resetState();
  };

  const formatBalance = (balance: string) => {
    const [integer, decimal] = balance.split('.');
    const largePart = decimal?.slice(0, 4);
    const smallPart = decimal?.slice(4, 8);
    return { integer, largePart, smallPart };
  };

  return (
    <Stack spacing={4}>
      <Flex alignItems="center">
        <Text fontSize="sm">Balance: {balanceFormatted}</Text>
        {balance.valueUsd ? (
          <Badge colorScheme="green" fontSize="sm">Value (USD): {valueUsdFormatted}</Badge>
        ) : null}
      </Flex>
    </Stack>
  );
}

export default Balance;
