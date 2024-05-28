import React, { useState, useEffect } from 'react';
import {
  VStack, Avatar, Box, Stack, Flex, Text, Button, Spinner, useColorModeValue
} from '@chakra-ui/react';
import { Pubkey } from '../Pubkey';
import { Balance } from '../Balance';
import { Transfer } from '../Transfer';
import { Receive } from '../Receive';

const Card = ({ children }: any) => (
  <Box
    border="1px solid"
    borderColor={useColorModeValue('gray.200', 'gray.700')}
    borderRadius="lg"
    overflow="hidden"
    bg={useColorModeValue('white', 'gray.800')}
    width="100%"
  >
    {children}
  </Box>
);

const CardBody = ({ children }: any) => (
  <Box p={4}>
    {children}
  </Box>
);

export function Asset({ usePioneer, onClose, asset }: any) {
  const [activeTab, setActiveTab] = useState<'send' | 'receive' | null>(null);

  const { state } = usePioneer();
  const { app } = state;

  const clearAssetContext = () => {
    app.setAssetContext(null);
    onClose();
  };

  useEffect(() => {
    if (asset) {
      console.log('asset:', asset);
    }
  }, [asset]);

  return (
    <Stack spacing={4} width="100%">
      <Card>
        <CardBody>
          {activeTab === null && asset ? (
            <>
              <Flex align="center" justifyContent="space-between" mb={4}>
                <Avatar size='xl' src={asset.icon} />
                <Box ml={3} flex="1">
                  <Text fontSize="lg" fontWeight="bold">{asset.name}</Text>
                  <Text fontSize="md" color="gray.500">{asset.symbol}</Text>
                </Box>
              </Flex>
              <Flex align="center" justifyContent="space-between" mb={4} width="100%">
                <VStack width="100%">
                  {app.pubkeys
                    .filter((pubkey: any) => pubkey.networks.includes(asset.networkId))
                    .map((pubkey: any, index: any) => (
                      <Pubkey key={index} usePioneer={usePioneer} pubkey={pubkey} />
                    ))}
                </VStack>
              </Flex>
              <Flex align="center" justifyContent="space-between" mb={4} width="100%">
                <VStack width="100%">
                  {app.balances
                    .filter((balance: any) => balance.caip === asset.caip)
                    .map((balance: any, index: any) => (
                      <Balance key={index} usePioneer={usePioneer} balance={balance} />
                    ))}
                </VStack>
              </Flex>
              <VStack spacing={2}>
                <Button size="sm" onClick={() => setActiveTab('send')}>
                  Send {asset.name}
                </Button>

                <Button size="sm" onClick={() => setActiveTab('receive')}>
                  Receive {asset.name}
                </Button>
              </VStack>
            </>
          ) : activeTab === 'send' ? (
            <Transfer usePioneer={usePioneer} onClose={() => setActiveTab(null)} />
          ) : activeTab === 'receive' ? (
            <Receive usePioneer={usePioneer} onClose={() => setActiveTab(null)} />
          ) : (
            <Flex justifyContent="center" p={5}>
              <Text>No asset selected</Text>
              <Spinner ml={4} />
            </Flex>
          )}
        </CardBody>
      </Card>
    </Stack>
  );
}

export default Asset;
