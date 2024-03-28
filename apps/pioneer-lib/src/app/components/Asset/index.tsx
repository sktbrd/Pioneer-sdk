import React, { useState } from 'react';
import {
  Avatar, Box, Stack, Flex, Text, Button, Collapse, IconButton, Spinner,
  useColorModeValue, Badge, Table, Thead, Tbody, Tr, Th, Td
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { getWalletBadgeContent } from '../WalletIcon';
// import { usePioneer } from '@coinmasters/pioneer-react';
import { COIN_MAP_LONG } from '@pioneer-platform/pioneer-coins';
import Basic from '@/app/components/Basic';
// import { useRouter } from 'next/router';

let TAG = " | asset | ";

interface AssetProps {
  onClose: () => void;
  usePioneer: () => any;
  onSelect: (asset: any) => void;
  asset: any;
}

export function Asset({ usePioneer, onClose, onSelect, asset }: AssetProps) {
  // const router = useRouter();
  const { state, hideModal, resetState } = usePioneer();
  const { api, app, assets, context } = state;

  const [showAdvanced, setShowAdvanced] = useState(false);
  const data = typeof asset === 'object' && asset !== null ? asset : JSON.parse(asset || '{}');

  const assetFormatted = asset ? (asset.balance || 'N/A') : 'N/A';
  const valueUsdFormatted = asset && asset.valueUsd ? `$${asset.valueUsd}` : 'N/A';

  const handleModal = (action: string) => {
    console.log("asset: ", asset);
    // router.push(`/intent/${action}`);
    onClose();
  };

  const handleCloseModal = () => {
    hideModal();
    resetState();
  };

  return (
    <Stack spacing={4}>
      {asset ? (<>
        <Flex align="center">
          <Avatar size='xl' src={asset.icon} />
          <Box ml={3}>
            <Text fontWeight="bold">{asset.name}</Text>
            <Text fontSize="sm">Symbol: {asset.symbol}</Text>
            <Text fontSize="sm">CAIP: {asset.caip}</Text>
            <Text fontSize="sm">Type: {asset.type}</Text>
            <Text fontSize="sm">priceUsd: {asset.priceUsd}</Text>
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
      </>) : (<>
        No asset selected
        <Spinner></Spinner>
      </>)}
      <div>
      </div>
    </Stack>
  );
}
export default Asset;
