import { Box, Button, Flex, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

import KeepKey from '../../components/KeepKey';
import Ledger from '../../components/Ledger';
import MetaMask from '../../components/MetaMask';
import Evm from '../../components/Evm';
import WalletConnect from '../../components/WalletConnect';
import { getWalletContent } from '../WalletIcon';
import { availableChainsByWallet, ChainToNetworkId, getChainEnumValue } from '@coinmasters/types';

export function Wallets({ usePioneer, handleWalletClick }:any) {
  const { state, showModal, hideModal } = usePioneer();
  const { app } = state;
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState('');

  // Load wallets from app state
  useEffect(() => {
    const walletTypes = state?.app?.wallets?.map((wallet:any) => wallet.type.toLowerCase());
    setWallets(walletTypes || []);
  }, [state?.app?.wallets]);

  const handleWalletSelect = (wallet:any) => {
    const walletType = wallet.split(':')[0].toUpperCase();
    console.log("walletType: ", walletType)
    let blockchainsForContext = availableChainsByWallet[walletType.toUpperCase()] || [];
    let allByCaip = blockchainsForContext.map((chainStr:any) => {
      const chainEnum = getChainEnumValue(chainStr);
      return chainEnum ? ChainToNetworkId[chainEnum] : undefined;
    });
    console.log("allByCaip: ", allByCaip)
    app.setBlockchains(allByCaip);
    app.setContextType(walletType);
    showModal(walletType)
    handleWalletClick(walletType);
  };

  const renderWalletDetails = (walletType:any) => {
    switch (walletType) {
      case 'keepkey':
        return <KeepKey usePioneer={usePioneer} onClose={hideModal}/>;
      case 'ledger':
        return <Ledger usePioneer={usePioneer} onClose={hideModal}/>;
      case 'coinbase_web':
        return <Evm usePioneer={usePioneer} walletType={walletType} onClose={hideModal}/>;
      case 'trustwallet_web':
        return <Evm usePioneer={usePioneer} walletType={walletType} onClose={hideModal}/>;
      case 'brave':
        return <Evm usePioneer={usePioneer} walletType={walletType} onClose={hideModal} />;
      case 'metamask':
        return <Evm usePioneer={usePioneer} walletType={walletType} onClose={hideModal}/>;
      case 'walletconnect':
        return <WalletConnect usePioneer={usePioneer} onClose={hideModal}/>;
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
