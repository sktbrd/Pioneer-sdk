import {
  Box,
  Flex,
  Text,
  Spinner,
  VStack,
  Center,
  Heading,
  Grid,
  GridItem,
  Image
} from '@chakra-ui/react';
import { FaWallet, FaLock } from 'react-icons/fa';
import React, { useEffect, useState } from 'react';

export function Setup({ usePioneer }: any) {
  const { state, connectWallet } = usePioneer();
  const { app, assets } = state;
  const [isConnecting, setIsConnecting] = useState(false);

  const onStart = async function () {
    if (app && app.pairWallet && !isConnecting) {
      console.log('App loaded... connecting');
      await connectWallet('KEEPKEY');
      setIsConnecting(true);

      await app.getPubkeys();
      await app.getBalances();
    } else {
      console.log('App not loaded yet... cannot connect');
    }
  };

  useEffect(() => {
    onStart();
  }, [app, app?.assetContext, assets]);

  if (!app) {
    return (
      <Center height="100vh">
        <Spinner size="xl" />
        <Text ml={4}>Loading...</Text>
      </Center>
    );
  }

  return (
    <Flex direction="column" height="100vh" backgroundColor={app.theme === 'light' ? '#eee' : '#222'}>
      <Box textAlign="center" p={5} background="linear-gradient(90deg, #ff6a00, #ee0979)" color="white">
        <Image src="https://pioneers.dev/coins/pioneerMan.png" alt="Pioneer" boxSize="100px" mx="auto" />
        <Heading as="h1" size="xl" mt={4}>
          Welcome to Pioneer
        </Heading>
        <Text fontSize="lg" mt={2}>
          A wallet for self-custodial humans. All your crypto & NFTs. 10+ chains.
        </Text>
      </Box>
      <Grid templateColumns="repeat(3, 1fr)" gap={6} p={5} mt={10}>
        <GridItem>
          <VStack spacing={4} align="center">
            <Box as={FaWallet} boxSize="150px" color="gray.600" />
            <Text>Create New Wallet</Text>
          </VStack>
        </GridItem>
        <GridItem>
          <VStack spacing={4} align="center">
            <Box as={FaLock} boxSize="150px" color="gray.600" />
            <Text>Import Existing Wallet</Text>
          </VStack>
        </GridItem>
        <GridItem>
          <VStack spacing={4} align="center">
            <Image src="https://pioneers.dev/coins/keepkey.png" alt="Connect KeepKey" boxSize="150px" />
            <Text>Connect KeepKey</Text>
          </VStack>
        </GridItem>
      </Grid>
    </Flex>
  );
}

export default Setup;
