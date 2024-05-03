import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, NumberInput, NumberInputField, NumberInputStepper,
  NumberIncrementStepper, NumberDecrementStepper, Text, Icon, Button, Divider, Flex,
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';

function SwapInput({ usePioneer, setAmountSelected, setInputAmount }: any) {
  const { state } = usePioneer();
  const { app } = state;
  const [depositAmount, setDepositAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState<any>(null);

  useEffect(() => {
    if (app?.assetContext?.priceUsd && app?.outboundAssetContext?.priceUsd) {
      let rate = app.assetContext.priceUsd / app.outboundAssetContext.priceUsd;
      setExchangeRate(rate || 0);
    }
  }, [app, app?.assetContext, app?.outboundAssetContext]);

  const handleDepositChange = (valueAsString: any) => {
    setDepositAmount(valueAsString);
    if (exchangeRate !== null) {
      setAmountSelected(true);
      const depositValue = parseFloat(valueAsString) || 0;
      setInputAmount(depositValue);
      const receiveValue = depositValue * exchangeRate;
      setReceiveAmount(receiveValue.toFixed(4));
    }
  };

  const handleReceiveChange = (valueAsString: any) => {
    setReceiveAmount(valueAsString);
    if (exchangeRate !== null) {
      setAmountSelected(true);
      const receiveValue = parseFloat(valueAsString) || 0;
      const depositValue = receiveValue / exchangeRate;
      setInputAmount(depositValue);
      setDepositAmount(depositValue.toFixed(4));
    }
  };

  const maxDeposit = () => {
    const maxBalance = app.assetContext.balance || 0;
    handleDepositChange(maxBalance.toString());
  };

  const renderUSDAmount = (amount: string, priceUsd: number) => {
    const numericAmount = parseFloat(amount) || 0;
    return isNaN(numericAmount) ? '$0 USD' : `$${(numericAmount * priceUsd).toFixed(2)} USD`;
  };

  return (
    <Flex direction="column" align="center">
      <Box borderRadius="lg" maxWidth="sm" padding={6} color="white" bg="gray.800" width="100%" mx="auto">
        <VStack spacing={4}>
          <Box width="full">
            <HStack justifyContent="space-between">
              <Text>Deposit</Text>
              <Icon as={ChevronRightIcon} />
            </HStack>
            <HStack width="full">
              <NumberInput variant="filled" value={depositAmount} onChange={(valueAsString) => handleDepositChange(valueAsString)} mb={2} w="70%">
                <NumberInputField placeholder="Enter native amount" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Button variant="outline" ml={2} w="40%">
                {renderUSDAmount(depositAmount, app?.assetContext?.priceUsd)}
              </Button>
            </HStack>
            <Text fontSize="sm" color="gray.500">{app?.assetContext?.name} on {app?.assetContext?.chain}</Text>
            <HStack justifyContent="space-between" mt={2}>
              <Text fontSize="xs" color="green.400">
                Balance: {parseFloat(app?.assetContext?.balance).toFixed(3)} (${parseFloat(app?.assetContext?.valueUsd).toFixed(0)} USD)
              </Text>
              <Button size="xs" colorScheme="green" onClick={maxDeposit}>Max</Button>
            </HStack>
          </Box>
          <Divider borderColor="gray.600" />
          <Box width="full">
            <HStack justifyContent="space-between">
              <Text>Receive</Text>
              <Icon as={ChevronRightIcon} />
            </HStack>
            <HStack width="full">
              <NumberInput variant="filled" value={receiveAmount} onChange={(valueAsString) => handleReceiveChange(valueAsString)} mb={2} w="70%">
                <NumberInputField placeholder="Enter native amount" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Button variant="outline" ml={2} w="40%">
                {renderUSDAmount(receiveAmount, app?.outboundAssetContext?.priceUsd)}
              </Button>
            </HStack>
            {app?.outboundAssetContext?.balance && (
              <HStack justifyContent="space-between">
                <Text></Text> {/* Empty text for alignment */}
                <HStack>
                  <Text fontSize="xs" color="green.400">
                    Balance: {parseFloat(app.outboundAssetContext.balance).toFixed(3)} (${parseFloat(app.outboundAssetContext.valueUsd).toFixed(0)} USD)
                  </Text>
                </HStack>
              </HStack>
            )}
            <Text fontSize="sm" color="gray.500">{app?.outboundAssetContext?.name} on {app?.outboundAssetContext?.chain}</Text>
            {app?.outboundAssetContext?.address && (
              <Text fontSize='xs'>{`address: ${app.outboundAssetContext.address}`}</Text>
            )}
            {app?.outboundAssetContext?.label && (
              <Text mt={2} fontSize='md'>{`Label: ${app.outboundAssetContext.label}`}</Text>
            )}
            {app?.outboundAssetContext?.context === 'external' && (
              <Text mt={2} fontStyle="italic">External</Text>
            )}
          </Box>
        </VStack>
      </Box>
    </Flex>
  );
}

export default SwapInput;
