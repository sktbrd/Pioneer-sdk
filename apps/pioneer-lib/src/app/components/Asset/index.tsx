import React, { useState, useEffect } from 'react';
import {
  VStack, Avatar, Box, Stack, Flex, Text, Button, Spinner, useColorModeValue, Badge,
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

  const formatBalance = (balance: string) => {
    const [integer, decimal] = balance.split('.');
    const largePart = decimal?.slice(0, 4);
    const smallPart = decimal?.slice(4, 8);
    return { integer, largePart, smallPart };
  };

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
                <Box>

                  {app.balances
                    .filter((balance: any) => balance.caip === asset.caip)
                    .map((balance: any, index: any) => {
                      const { integer, largePart, smallPart } = formatBalance(balance.balance);
                      return (
                        <Text key={index}>
                          <Text as="span" fontSize="lg">{integer}.{largePart}</Text>
                          <Text as="span" fontSize="xs">{smallPart}</Text>
                          <Box ml={3} flex="1">
                            <Badge ml={2} colorScheme="teal">({asset.symbol})</Badge>
                          </Box>
                        </Text>
                      );
                    })}
                </Box>

              </Flex>
              <Flex align="center" justifyContent="space-between" mb={4} width="100%">
                <VStack width="100%">
                  {app.pubkeys
                    .filter((pubkey: any) => {
                      if (asset?.networkId?.startsWith('eip155')) {
                        return pubkey.networks.some((networkId: any) => networkId.startsWith('eip155'));
                      }
                      return pubkey.networks.includes(asset.networkId);
                    })
                    .map((pubkey: any, index: any) => (
                      <Pubkey key={index} usePioneer={usePioneer} pubkey={pubkey} />
                    ))}
                </VStack>
              </Flex>
              <Flex align="center" justifyContent="space-between" mb={4} width="100%">
                <VStack width="100%">
                  {/*{app.balances*/}
                  {/*  .filter((balance: any) => balance.caip === asset.caip)*/}
                  {/*  .map((balance: any, index: any) => (*/}
                  {/*    <Balance key={index} usePioneer={usePioneer} balance={balance} />*/}
                  {/*  ))}*/}
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
