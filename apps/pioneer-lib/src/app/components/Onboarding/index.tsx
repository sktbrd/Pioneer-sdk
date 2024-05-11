'use-client';
import { CheckIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import Blockchains from '../../components/BlockchainsConfigure';
import Wallets from '../../components/Wallets';
import { getWalletContent } from '../../components/WalletIcon';

export default function Onboarding({ onClose, setModalType, setWalletType, usePioneer }: any) {
  const { state, showModal } = usePioneer();
  const { app } = state;
  const [server, setServer] = useState('https://pioneers.dev/spec/swagger.json');
  const [showWalletSelection, setShowWalletSelection] = useState(false);
  const [showServerSelection, setShowServerSelection] = useState(true);
  const [showBlockchainSelection, setShowBlockchainSelection] = useState(false);
  const [showAllWallets, setShowAllWallets] = useState(false);
  const [walletsAvailable, setWalletsAvailable] = useState([]);

  const onStartApp = async function () {
    try {
      //console.log('onStart');
      if (app && app.wallets) {
        setWalletsAvailable(app.wallets);
      }
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    onStartApp();
  }, [app, app?.wallets, app?.isPioneer]);

  let checkStartup = async function () {
      if (typeof window !== 'undefined') {
        let pioneerUrl = window.localStorage.getItem('pioneerUrl');
        console.log("pioneerUrl: ", pioneerUrl)
        if (pioneerUrl) {
          showModal('WALLETS')
        }
    }
  };

  useEffect(() => {
    checkStartup();
  }, []);

  const handleServerChange = (event: any) => {
    setServer(event.target.value);
  };

  const handleSubmit = async () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('pioneerUrl', server);
      console.log('Server:', server);
      checkStartup();
    }
  };

  const isDefaultServer = server === 'https://pioneers.dev/spec/swagger.json';

  const toggleShowAllWallets = () => {
    setShowAllWallets(!showAllWallets);
  };


  // Server Selection UI
  const ServerSelectionUI = () => (
    <Stack spacing={4}>
      <Flex alignItems="center">
        <Avatar size="xl" src='/png/pioneerMan.png' />
        <Text fontStyle="italic" ml={4} textAlign="right">
          Welcome to the Pioneer Platform, this application is powered by the pioneer-sdk. for more information visit
          <Link isExternal color="blue.500" href="https://pioneers.dev/docs">
            {' '}
            pioneers.dev
          </Link>
        </Text>
      </Flex>

      <InputGroup>
        <Input onChange={handleServerChange} placeholder="Enter server URL" value={server} />
        {isDefaultServer && <InputRightElement ><CheckIcon color="green.500" /></InputRightElement>}
      </InputGroup>

      <Button colorScheme="blue" onClick={handleSubmit}>
        Next
      </Button>

      <Box>
      </Box>
    </Stack>
  );

  // Wallet Selection UI
  const WalletSelectionUI = () => (
    <Stack spacing={4}>
      <Text>Connect your Wallet...</Text>
      <SimpleGrid columns={3} spacing={2}>
        <Wallets></Wallets>
      </SimpleGrid>
      <Button colorScheme="blue" mt={2} onClick={toggleShowAllWallets} size="sm">
        {showAllWallets ? 'Hide Wallets' : 'Show All Wallets'}
      </Button>
      <Text color="blue.500" cursor="pointer" mb={2} mt={4}>
        I dont have a wallet
      </Text>
      <Button colorScheme="green">Create New Wallet</Button>
    </Stack>
  );

  // Blockchain Selection UI
  const BlockchainSelectionUI = () => (
    <Stack spacing={4}>
      <Blockchains />
    </Stack>
  );

  if (showServerSelection) {
    return <ServerSelectionUI />;
  } else if (showBlockchainSelection) {
    return <BlockchainSelectionUI />;
  } else if (showWalletSelection) {
    return <WalletSelectionUI />;
  } else {
    // Default or a fallback UI if needed
    return <Text>Please select an option to get started.</Text>;
  }
}
