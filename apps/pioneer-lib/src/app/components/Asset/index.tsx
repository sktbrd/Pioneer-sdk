import React, { useState } from 'react';
import {
  Avatar, Box, Stack, Flex, Text, Heading, useColorModeValue, Spinner, Button, AvatarGroup, Divider, Input
} from '@chakra-ui/react';

const Card = ({ children }:any) => (
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

const CardHeader = ({ children }:any) => (
  <Box bg={useColorModeValue('gray.50', 'gray.900')} px={4} py={2}>
    {children}
  </Box>
);

const CardBody = ({ children }:any) => (
  <Box p={4}>
    {children}
  </Box>
);

export function Asset({ asset }:any) {
  const [showManualAddressForm, setShowManualAddressForm] = useState(false);

  return (
    <Stack spacing={4} width="100%">
      <Card>
        <CardHeader>
          <Heading size='md'><Text fontWeight="bold">{asset?.name}</Text></Heading>
        </CardHeader>
        <CardBody>
          {asset ? (
            <Flex align="center" justifyContent="space-between">
              <Avatar size='xl' src={asset.icon} />
              <Box ml={3} flex="1">
                <Text fontSize="sm">Symbol: {asset.symbol}</Text>
                <Text fontSize="sm" textAlign="right">CAIP: {asset.caip}</Text>
                <Text fontSize="sm">Type: {asset.type}</Text>
                <Text fontSize="sm">Price USD: ${parseFloat(asset.priceUsd).toFixed(2)}</Text>
                {asset.address ? (
                  <Text fontSize="sm">Address: {asset.address}</Text>
                ) : (
                  <>
                    <Flex mt={2} justifyContent="flex-end" alignItems="center">
                      <AvatarGroup size="md" max={3}>
                        {/*<Avatar name="Wallet 1" src="" />*/}
                        {/*<Avatar name="Wallet 2" src="" />*/}
                        {/*<Avatar name="Wallet 3" src="" />*/}
                      </AvatarGroup>
                      {/*<Button*/}
                      {/*  ml={2}*/}
                      {/*  colorScheme="blue"*/}
                      {/*  borderRadius="full"*/}
                      {/*  onClick={() => setShowManualAddressForm(!showManualAddressForm)}*/}
                      {/*>*/}
                      {/*  Pair Wallet*/}
                      {/*</Button>*/}
                    </Flex>
                    {/*{showManualAddressForm && (*/}
                    {/*  <>*/}
                    {/*    <Input*/}
                    {/*      placeholder="Enter address manually"*/}
                    {/*      size="md"*/}
                    {/*      mt={2}*/}
                    {/*    />*/}
                    {/*    <Button mt={2} colorScheme="teal">Submit Address</Button>*/}
                    {/*  </>*/}
                    {/*)}*/}
                    <Divider my={2} />
                    <Text fontSize="sm" color="red.500" mt={2}>No address found</Text>
                    {/*<Button*/}
                    {/*  mt={2}*/}
                    {/*  borderRadius="full"*/}
                    {/*  colorScheme="gray" // Ensure no green colors*/}
                    {/*  onClick={() => setShowManualAddressForm(true)}*/}
                    {/*>*/}
                    {/*  Add Address Manually*/}
                    {/*</Button>*/}
                  </>
                )}
                {asset.balance && asset.valueUsd > 0 && (
                  <Text fontSize="sm">Balance: {asset.balance} (${parseFloat(asset.valueUsd).toFixed(2)} USD)</Text>
                )}
              </Box>
            </Flex>
          ) : (
            <Flex justifyContent="center" p={5}>
              No asset selected
              <Spinner ml={4} />
            </Flex>
          )}
        </CardBody>
      </Card>
    </Stack>
  );
}

export default Asset;
