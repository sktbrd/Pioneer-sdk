import { Box, Button, Flex, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

import { getWalletContent } from '../WalletIcon';
import { usePioneer } from '../../context';

export default function WalletList({ handleSelectClick }) {
  const [wallets, setWallets] = useState([]);
  const { state } = usePioneer();
  const { app, balances } = state;
  useEffect(() => {
    try {
      const storedWallets = localStorage.getItem('pairedWallets');
      if (storedWallets) {
        setWallets(JSON.parse(storedWallets));
      }
    } catch (e) {
      console.error('Failed to load wallets from local storage:', e);
    }
  }, []);

  handleSelectClick = (wallet: any) => {
    try {
      console.log("wallet: ",wallet)
      //set context
      app.setContext(wallet)

      //load pubkeys

      //load balances

    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      {wallets.map((wallet, index) => (
        <Box key={index}>
          <Flex alignItems="center" bg="black" borderRadius="md" boxShadow="sm" padding={2}>
            {getWalletContent(wallet.split(':')[0])}
            <Box ml={3}>
              <Text fontSize="sm">wallet: {wallet}</Text>
            </Box>
            <Button ml="auto" onClick={() => handleSelectClick(asset)} size="sm" variant="outline">
              Select
            </Button>
          </Flex>
        </Box>
      ))}
    </div>
  );
}
