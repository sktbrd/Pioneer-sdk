import React, { useState, useEffect } from 'react';
import {
  VStack, Avatar, Box, Stack, Flex, Text, Button, Spinner, Collapse, Badge, Card, CardBody, Heading, Tabs, TabList, TabPanels, Tab, TabPanel
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';

import { Transfer } from '../Transfer';
import { Receive } from '../Receive';
import { Paths } from '../Paths';
import Balances from '../Balances';

export function Asset({ usePioneer, onClose, asset }: any) {
  const [activeTab, setActiveTab] = useState<'send' | 'receive' | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [balances, setBalances] = useState([]);

  const { state } = usePioneer();
  const { app } = state;

  const clearAssetContext = () => {
    app.setAssetContext(null);
    onClose();
  };

  useEffect(() => {
    if (asset) {
      console.log('asset:', asset);
      console.log('pubkeys:', app.pubkeys);
      console.log('paths:', app.paths);
    }
  }, [asset]);

  const formatBalance = (balance: string) => {
    const [integer, decimal] = balance.split('.');
    const largePart = decimal?.slice(0, 4);
    const smallPart = decimal?.slice(4, 8);
    return { integer, largePart, smallPart };
  };

  const openUrl = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <Stack spacing={4} width="100%">
      <Card>
        <CardBody>
          {activeTab === null && asset ? (
            <>
              <Box textAlign="center">
                <Badge>caip: {asset.caip}</Badge>
              </Box>
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
              <Flex direction="column" align="center" mb={4} width="100%">
                <Button my={2} size="md" variant="outline" width="100%" onClick={() => setActiveTab('send')}>
                  Send {asset.name}
                </Button>
                <Button my={2} size="md" variant="outline" width="100%" onClick={() => setActiveTab('receive')}>
                  Receive {asset.name}
                </Button>
                {app.pubkeys
                  .filter((pubkey: any) => {
                    if (asset?.networkId?.startsWith('eip155')) {
                      return pubkey.networks.some((networkId: any) => networkId.startsWith('eip155'));
                    }
                    return pubkey.networks.includes(asset.networkId);
                  })
                  .map((pubkey: any, index: any) => (
                    <Button
                      key={index}
                      my={2}
                      size="md"
                      variant="outline"
                      width="100%"
                      onClick={() => openUrl(pubkey.type === 'address' ? asset.explorerAddressLink + '/' + pubkey.address : asset.explorerXpubLink + '/' + pubkey.pubkey)}
                    >
                      View Transaction History
                    </Button>
                  ))}
              </Flex>



              {showAdvanced && (
                <div>
                  <Heading as="h3" size="md" mb={4}>Accounts</Heading>
                  <Tabs mt={4} onChange={(index) => {
                  }}>
                    <TabList>
                      <Tab>Accounts</Tab>
                      <Tab>Paths</Tab>
                      {showAdvanced && asset.networkId.includes('eip155') && (
                        <>
                          <Tab>Tokens</Tab>
                          <Tab>NFTs</Tab>
                        </>
                      )}
                    </TabList>

                    <TabPanels>
                      <TabPanel>
                        <VStack spacing={4} width="100%" align="center">
                          {app.pubkeys
                            .filter((pubkey: any) => {
                              if (asset?.networkId?.startsWith('eip155')) {
                                return pubkey.networks.some((networkId: any) => networkId.startsWith('eip155'));
                              }
                              return pubkey.networks.includes(asset.networkId);
                            })
                            .map((pubkey: any, index: any) => (
                              <Card key={index} width="100%" maxWidth="600px" borderWidth="1px" borderRadius="lg" boxShadow="md">
                                <CardBody>
                                  <Text fontWeight="bold" mb={2}>{pubkey.note}</Text>
                                  <Text mb={2}>Path: <Badge>{pubkey.pathMaster}</Badge></Text>
                                  <Text fontWeight="bold" mb={2}>Address: {pubkey.master || pubkey.address}</Text>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openUrl(pubkey.type === 'address' ? asset.explorerAddressLink + '/' + pubkey.address : asset.explorerXpubLink + '/' + pubkey.pubkey)}
                                  >
                                    View Transaction History
                                  </Button>
                                </CardBody>
                              </Card>
                            ))}
                        </VStack>
                      </TabPanel>
                      <TabPanel>
                        <Paths usePioneer={usePioneer} networkId={app?.assetContext?.networkId}/>
                      </TabPanel>
                      {showAdvanced && asset.networkId.includes('eip155') && (
                        <>
                          <TabPanel>
                            <Balances usePioneer={usePioneer} networkId={app?.assetContext?.networkId}/>
                          </TabPanel>
                          <TabPanel>
                            <Text>NFTs content</Text>
                          </TabPanel>
                        </>
                      )}
                    </TabPanels>
                  </Tabs>
                </div>
              )}

              <Flex justify="flex-end" mt={2}>
                <Text
                  fontSize="sm"
                  color="blue.500"
                  cursor="pointer"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  Advanced {showAdvanced ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </Text>
              </Flex>
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
