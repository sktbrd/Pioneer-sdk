import { Button, Table, TableContainer, Tbody, Td, Th, Thead, Tr, VStack } from '@chakra-ui/react';


const Cache = () => {

  const clearLocalStorage = (key: string) => {
    if (key === 'all') {
      localStorage.clear();
      // Reload the page to force restart the application
      window.location.reload();
    } else {
      const lastConnectedWallet = localStorage.getItem('lastConnectedWallet');
      if (key === 'walletCache' && lastConnectedWallet) {
        localStorage.removeItem(`${lastConnectedWallet}:balanceCache`);
        localStorage.removeItem(`${lastConnectedWallet}:pubkeyCache`);
      } else {
        localStorage.removeItem(key);
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
