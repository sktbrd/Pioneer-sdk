import { Box, Button, Flex, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

import KeepKey from '../../components/KeepKey';
import Ledger from '../../components/Ledger';
import MetaMask from '../../components/MetaMask';
import WalletConnect from '../../components/WalletConnect';
import { getWalletContent } from '../WalletIcon';

export function Wallets({ usePioneer, handleWalletClick }:any) {
  const { state } = usePioneer();
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState('');

  // Load wallets from app state
  useEffect(() => {
    const walletTypes = state?.app?.wallets?.map((wallet:any) => wallet.type.toLowerCase());
    setWallets(walletTypes || []);
  }, [state?.app?.wallets]);

  const handleWalletSelect = (wallet:any) => {
    const walletType = wallet.split(':')[0].toUpperCase();
    handleWalletClick(walletType);
  };

  const renderWalletDetails = (walletType:any) => {
    switch (walletType) {
      case 'keepkey':
        return <KeepKey />;
      case 'ledger':
        return <Ledger />;
      case 'metamask':
        return <MetaMask />;
      case 'walletconnect':
        return <WalletConnect />;
      default:
        return <Text>No specific details available for this wallet type.</Text>;
    }
  };

  // When a wallet is selected, render its details
  if (selectedWallet) {
    return <div>{renderWalletDetails(selectedWallet)}</div>;
  }

  // Render the list of all available wallets
  return (
    <div>
      {wallets.map((wallet:any, index:any) => (
        <Box key={index}>
          <Flex alignItems="center" bg="black" borderRadius="md" boxShadow="sm" padding={2}>
            {getWalletContent(wallet.split(':')[0])}
            <Box ml={3}>
              <Text fontSize="sm">Wallet: {wallet}</Text>
            </Box>
            <Button
              ml="auto"
              onClick={() => handleWalletSelect(wallet)}
              size="sm"
              variant="outline"
            >
              Select
            </Button>
          </Flex>
        </Box>
      ))}
    </div>
  );
}

export default Wallets;
