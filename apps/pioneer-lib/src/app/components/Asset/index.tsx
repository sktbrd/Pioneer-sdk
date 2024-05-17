import React, { useState, useEffect } from 'react';
import {
  Avatar, Box, Stack, Flex, Text, Heading, useColorModeValue, Spinner, Button, Divider, Stat, StatLabel, StatNumber, SimpleGrid
} from '@chakra-ui/react';
import { Pubkey } from '../Pubkey';
import { Balance } from '../Balance';

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
  const [showManualAddressForm, setShowManualAddressForm] = useState(false);

  const { state, showModal } = usePioneer();
  const { balances, app } = state;

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
        <CardHeader>
          <Heading size='md'><Text fontWeight="bold">{asset?.name} Asset Page</Text></Heading>
        </CardHeader>
        <CardBody>
          {asset ? (
            <>
              <Flex align="center" justifyContent="space-between" mb={4}>
                <Avatar size='xl' src={asset.icon} />
                <Box ml={3} flex="1">
                  <Text fontSize="lg" fontWeight="bold">{asset.name}</Text>
                  <Text fontSize="md" color="gray.500">{asset.symbol}</Text>
                </Box>
              </Flex>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                <Stat>
                  <StatLabel>CAIP</StatLabel>
                  <StatNumber>{asset.caip}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Type</StatLabel>
                  <StatNumber>{asset.type}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Price USD</StatLabel>
                  <StatNumber>${parseFloat(asset.priceUsd).toFixed(2)}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Address</StatLabel>
                  <StatNumber>{asset.address}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Network</StatLabel>
                  <StatNumber>{asset.networkName}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Decimals</StatLabel>
                  <StatNumber>{asset.decimals}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Explorer</StatLabel>
                  <StatNumber>
                    <a href={`${asset.explorerAddressLink}${asset.address}`} target="_blank" rel="noopener noreferrer">
                      {asset.explorer}
                    </a>
                  </StatNumber>
                </Stat>
              </SimpleGrid>

              {asset.pubkeys && asset.pubkeys.length > 0 && (
                <>
                  <Heading size="sm" mb={2}>Public Keys</Heading>
                  {asset.pubkeys.map((pubkey: any, index: any) => (
                    <Pubkey key={index} usePioneer={usePioneer} pubkey={pubkey} />
                  ))}
                  <Divider my={4} />
                </>
              )}

              {asset.balances && asset.balances.length > 0 && (
                <>
                  <Heading size="sm" mb={2}>Balances</Heading>
                  {asset.balances.map((balance: any, index: any) => (
                    <Balance key={index} usePioneer={usePioneer} balance={balance} />
                  ))}
                </>
              )}

              <Button
                mt={4}
                borderRadius="full"
                colorScheme="gray"
                onClick={() => clearAssetContext()}
              >
                Clear Asset Context
              </Button>
            </>
          ) : (
            <Flex justifyContent="center" p={5}>
              <Text>No asset selected</Text>
              <Spinner ml={4} />
              <Button
                mt={2}
                borderRadius="full"
                colorScheme="gray"
                onClick={() => clearAssetContext()}
              >
                Clear Asset Context
              </Button>
            </Flex>
          )}
        </CardBody>
      </Card>
    </Stack>
  );
}

export default Asset;
