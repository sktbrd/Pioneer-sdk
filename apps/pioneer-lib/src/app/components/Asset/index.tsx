import React, { useState, useEffect } from 'react';
import {
  VStack, Avatar, Box, Stack, Flex, Text, Heading, useColorModeValue, Spinner, Button, Divider, Stat, StatLabel, StatNumber, SimpleGrid, IconButton
} from '@chakra-ui/react';
import { ChevronLeftIcon, RepeatIcon } from '@chakra-ui/icons';
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
  >
    {children}
  </Box>
);

const CardHeader = ({ children }: any) => (
  <Box bg={useColorModeValue('gray.50', 'gray.900')} px={4} py={2}>
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
              <Flex align="center" justifyContent="space-between" mb={4}>
              {asset?.pubkeys && (
                <>
                  {asset?.pubkeys.map((pubkey: any, index: any) => (
                    <Pubkey key={index} usePioneer={usePioneer} pubkey={pubkey} />
                  ))}
                </>
              )}
              </Flex>
              <Flex align="center" justifyContent="space-between" mb={4}>
              {asset?.balances && (
                <>
                  {asset?.balances.map((balance: any, index: any) => (
                    <Balance key={index} usePioneer={usePioneer} balance={balance} />
                  ))}
                </>
              )}
              </Flex>
              <VStack spacing={2}>
                <Button size="sm" onClick={() => setActiveTab('send')}>
                  Send Bitcoin
                </Button>

                <Button size="sm" onClick={() => setActiveTab('receive')}>
                  Receive Bitcoin
                </Button>

                {/*<Button size="sm" onClick={() => console.log('Transactions')}>*/}
                {/*  Transactions*/}
                {/*</Button>*/}
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
