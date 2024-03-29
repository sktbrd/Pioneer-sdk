import { Button, Table, TableContainer, Tbody, Td, Th, Thead, Tr, VStack } from '@chakra-ui/react';
import React, { useEffect, useState } from "react";

const Cache = () => {

  const clearLocalStorage = (key: string) => {
    if (typeof window !== 'undefined') {
      if (key === 'all') {
        window.localStorage.clear();
        // Reload the page to force restart the application
        window.location.reload();
      } else {
        const lastConnectedWallet = window.localStorage.getItem('lastConnectedWallet');
        if (key === 'walletCache' && lastConnectedWallet) {
          window.localStorage.removeItem(`${lastConnectedWallet}:balanceCache`);
          window.localStorage.removeItem(`${lastConnectedWallet}:pubkeyCache`);
        } else {
          window.localStorage.removeItem(key);
        }
      }
    }
  };

  return (
    <div>
      <VStack spacing={4}>
        <Button colorScheme="red" onClick={() => clearLocalStorage('all')}>Clear All Cache</Button>
        <Button onClick={() => clearLocalStorage('username')}>Clear Username</Button>
        <Button onClick={() => clearLocalStorage('queryKey')}>Clear Query Key</Button>
        <Button onClick={() => clearLocalStorage('pairedWallets')}>Clear Paired Wallets</Button>
        <Button onClick={() => clearLocalStorage('pioneerUrl')}>Clear Pioneer URL</Button>
        <Button onClick={() => clearLocalStorage('lastConnectWallet')}>Clear Last Connect Wallet</Button>
        <Button onClick={() => clearLocalStorage('lastWallet')}>Clear Last Wallet</Button>
        <Button onClick={() => clearLocalStorage('walletCache')}>Clear Wallet Cache</Button>
      </VStack>
    </div>
  );
};

export default Cache;
