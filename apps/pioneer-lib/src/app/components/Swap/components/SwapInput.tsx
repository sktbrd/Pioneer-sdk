import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, NumberInput, NumberInputField, NumberInputStepper,
  NumberIncrementStepper, NumberDecrementStepper, Text, Icon, Button, Divider, Flex, FormControl, FormErrorMessage
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';

function SwapInput({ usePioneer, setAmountSelected, setInputAmount }: any) {
  const { state } = usePioneer();
  const { app } = state;
  const [depositAmount, setDepositAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState<any>(null);
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const getAssetBalance = (caip: string) => {
    return app?.balances?.find((balance: any) => balance.caip === caip);
  };

  useEffect(() => {
    updateExchangeRate();
  }, [app?.assetContext, app?.outboundAssetContext]);

  const updateExchangeRate = () => {
    const assetContextBalance = getAssetBalance(app?.assetContext?.caip);
    const outboundAssetContextBalance = getAssetBalance(app?.outboundAssetContext?.caip);

    if (assetContextBalance && outboundAssetContextBalance) {
      let rate = assetContextBalance.priceUsd / outboundAssetContextBalance.priceUsd;
      setExchangeRate(rate || 0);
      console.log(`Exchange Rate set: ${rate}`);
    } else {
      setExchangeRate(null);
      console.warn('Exchange Rate not set due to missing balance information.');
    }
  };

  const handleDepositChange = (valueAsString: any) => {
    console.log(`Deposit change: ${valueAsString}`);
    setDepositAmount(valueAsString);
    updateValidation(valueAsString, getAssetBalance(app?.assetContext?.caip)?.priceUsd);
  };

  const handleReceiveChange = (valueAsString: any) => {
    console.log(`Receive change: ${valueAsString}`);
    setReceiveAmount(valueAsString);
    updateValidation(valueAsString, getAssetBalance(app?.outboundAssetContext?.caip)?.priceUsd, true);
  };

  const updateValidation = (value: string, priceUsd: number, isReceive: boolean = false) => {
    console.log(`Update validation: value=${value}, priceUsd=${priceUsd}, isReceive=${isReceive}, exchangeRate=${exchangeRate}`);
    const numericValue = parseFloat(value) || 0;
    const usdValue = numericValue * priceUsd;
    const isValidAmount = usdValue >= 50;
    setIsValid(isValidAmount);
    setErrorMessage(isValidAmount ? '' : 'Amount must be at least $50 USD in value.');
    if (isValidAmount) {
      if (isReceive) {
        if (exchangeRate > 0) {
          const depositValue = numericValue / exchangeRate;
          setInputAmount(depositValue);
          setDepositAmount(depositValue.toFixed(4));
          console.log(`Set deposit value: ${depositValue}`);
        } else {
          console.warn('Invalid exchange rate for receive calculation.');
        }
      } else {
        if (exchangeRate > 0) {
          const receiveValue = numericValue * exchangeRate;
          setInputAmount(numericValue);
          setReceiveAmount(receiveValue.toFixed(4));
          console.log(`Set receive value: ${receiveValue}`);
        } else {
          console.warn('Invalid exchange rate for deposit calculation.');
        }
      }
    }
  };

  const renderUSDAmount = (amount: string, priceUsd: number) => {
    const numericAmount = parseFloat(amount) || 0;
    const usdValue = (numericAmount * priceUsd).toFixed(2);
    return isNaN(numericAmount) ? '$0 USD' : `$${parseFloat(usdValue).toLocaleString()} USD`;
  };

  const maxDeposit = () => {
    const maxBalance = getAssetBalance(app?.assetContext?.caip)?.balance || 0;
    console.log(`Max deposit: ${maxBalance}`);
    handleDepositChange(maxBalance.toString());
  };

  return (
    <Flex direction="column" align="center">
      <Box borderRadius="lg" maxWidth="sm" padding={4} color="white" bg="gray.800" width="100%" mx="auto">
        <VStack spacing={4}>
          <FormControl isInvalid={!isValid}>
            <Box width="full">
              <HStack justifyContent="space-between">
                <Text>Deposit</Text>
                <Icon as={ChevronRightIcon} />
              </HStack>
              <HStack width="full">
                <NumberInput variant="filled" value={depositAmount} onChange={handleDepositChange} mb={2} w="70%">
                  <NumberInputField placeholder="Enter native amount" borderColor={!isValid ? 'red.500' : 'gray.200'} />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Button variant="outline" ml={2} w="40%">
                  {renderUSDAmount(depositAmount, getAssetBalance(app?.assetContext?.caip)?.priceUsd)}
                </Button>
              </HStack>
              <FormErrorMessage>{errorMessage}</FormErrorMessage>
              <Text fontSize="sm" color="gray.500">{app?.assetContext?.name} on {app?.assetContext?.chain}</Text>
              <HStack justifyContent="space-between" mt={2}>
                <Text fontSize="xs" color="green.400">
                  Balance: {parseFloat(getAssetBalance(app?.assetContext?.caip)?.balance).toFixed(3)} (${parseFloat(getAssetBalance(app?.assetContext?.caip)?.valueUsd).toFixed(0)} USD)
                </Text>
                <Button size="xs" colorScheme="green" onClick={maxDeposit} isDisabled={!isValid}>Max</Button>
              </HStack>
            </Box>
          </FormControl>
          <Divider borderColor="gray.600" />
          <FormControl isInvalid={!isValid}>
            <Box width="full">
              <HStack justifyContent="space-between">
                <Text>Receive</Text>
                <Icon as={ChevronRightIcon} />
              </HStack>
              <HStack width="full">
                <NumberInput variant="filled" value={receiveAmount} onChange={handleReceiveChange} mb={2} w="70%">
                  <NumberInputField placeholder="Enter native amount" borderColor={!isValid ? 'red.500' : 'gray.200'} />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Button variant="outline" ml={2} w="40%">
                  {renderUSDAmount(receiveAmount, getAssetBalance(app?.outboundAssetContext?.caip)?.priceUsd)}
                </Button>
              </HStack>
              <FormErrorMessage>{errorMessage}</FormErrorMessage>
              <Text fontSize="sm" color="gray.500">{app?.outboundAssetContext?.name} on {app?.outboundAssetContext?.chain}</Text>
            </Box>
          </FormControl>
        </VStack>
      </Box>
    </Flex>
  );
}

export default SwapInput;
