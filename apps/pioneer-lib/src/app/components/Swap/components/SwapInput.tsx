import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text,
  Icon,
  Button,
  Divider,
  Flex,
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';

function SwapInput({ usePioneer, setAmountSelected }:any) {
  const { state, hideModal, resetState } = usePioneer();
  const { app } = state;
  const [depositAmount, setDepositAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState(null);

  // Calculate exchange rate from the app context
  useEffect(() => {
    if (app?.assetContext?.priceUsd && app?.outboundAssetContext?.priceUsd) {
      let rate = app.assetContext.priceUsd / app.outboundAssetContext.priceUsd;
      console.log("rate: ",rate)
      rate = 1/rate
      setExchangeRate(rate);
    } else {
      console.log("input: ",app?.assetContext?.priceUsd)
      console.log("output: ",app?.outboundAssetContext?.priceUsd)
    }
  }, [app, app?.assetContext, app?.outboundAssetContext]);

  const handleDepositChange = (valueAsString) => {
    console.log("valueAsString: ", valueAsString);
    setDepositAmount(valueAsString);
    if (exchangeRate !== null) {
      setAmountSelected(true)
      const depositValue = parseFloat(valueAsString) || 0;
      const receiveValue = depositValue / exchangeRate;
      setReceiveAmount(receiveValue.toFixed(4));
    }
  };

  const handleReceiveChange = (valueAsString) => {
    setReceiveAmount(valueAsString);
    if (exchangeRate !== null) {
      amountSelected(true)
      const receiveValue = parseFloat(valueAsString) || 0;
      const depositValue = receiveValue * exchangeRate;
      setDepositAmount(depositValue.toFixed(4));
    }
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
            <NumberInput
              placeholder="0.00"
              variant="filled"
              mb={2}
              value={depositAmount}
              onChange={(_, valueAsNumber) => handleDepositChange(valueAsNumber.toString())}
              _placeholder={{ color: 'gray.500' }}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Text fontSize="sm" color="gray.500">{app?.assetContext?.name} on {app?.assetContext?.chain}</Text>
          </Box>
          <Divider borderColor="gray.600" />
          <Box width="full">
            <HStack justifyContent="space-between">
              <Text>Receive</Text>
              <Icon as={ChevronRightIcon} />
            </HStack>
            <NumberInput
              placeholder="0.00"
              variant="filled"
              mb={2}
              value={receiveAmount}
              onChange={(_, valueAsNumber) => handleReceiveChange(valueAsNumber.toString())}
              _placeholder={{ color: 'gray.500' }}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Text fontSize="sm" color="gray.500">{app?.outboundAssetContext?.name} on {app?.outboundAssetContext?.chain}</Text>
          </Box>
        </VStack>
      </Box>
    </Flex>
  );
}

export default SwapInput;
