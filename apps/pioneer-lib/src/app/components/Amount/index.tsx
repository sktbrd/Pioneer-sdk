
import {
  Stack,
  Flex,
  Text,
  Button,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  CircularProgress,
  CircularProgressLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper, NumberDecrementStepper, Slider, SliderTrack, SliderFilledTrack, SliderThumb,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import Asset from '../Asset';
let TAG = " | Amount | ";

export default function Amount({ usePioneer, onClose, asset, setInputAmount }: any) {
  // const router = useRouter();
  const minimumTradeAmountUSD = 10;
  const [isInputValid, setIsInputValid] = useState<boolean>(true);
  const [inputCurrency, setInputCurrency] = useState<'USD' | 'Native'>('USD');
  const [sliderValue, setSliderValue] = useState<any>(50);
  const { state, hideModal, resetState } = usePioneer();
  const [inputAmountNative, setInputAmountNative] = useState(0);
  const [inputAmountUsd, setInputAmountUsd] = useState(0);
  const { api, app, assets, context, assetContext, balances } = state;

  useEffect(() => {
    if (assetContext) {
      onSliderChange(sliderValue);
    }
  }, [assetContext]);

  const onSliderChange = (value: number) => {
    if (!assetContext) return;
    // console.log(value)
    setSliderValue(value);
    let newAmount;
    let newAmountUsd;
    newAmountUsd = (value / 100) * parseFloat(assetContext.valueUsd);
    newAmount = (value / 100) * parseFloat(assetContext.balance);
    setInputAmount(newAmount);
    setInputAmountNative(newAmount);
    setInputAmountUsd(newAmountUsd);

  };

  const updateInputAmount = (value: number) => {
    if (!assetContext) return;

    let newSliderValue;

    if (inputCurrency === 'Native') {
      // Input is in native currency.
      setInputAmount(value);
      setInputAmountNative(value); // Direct user input set as inputAmount.

      // Recalculate USD equivalent.
      const newAmountUsd = (value / parseFloat(assetContext.balance)) * parseFloat(assetContext.valueUsd);
      setInputAmountUsd(newAmountUsd);

      // Recalculate slider value based on percentage of total balance.
      newSliderValue = (value / parseFloat(assetContext.balance)) * 100;
    } else {
      // Input is in USD.
      setInputAmountUsd(value); // Direct user input set as inputAmountUsd.

      // Recalculate native currency equivalent.
      const newAmount = (value / parseFloat(assetContext.valueUsd)) * parseFloat(assetContext.balance);
      setInputAmountNative(newAmount);
      setInputAmount(newAmount);

      // Recalculate slider value based on percentage of total USD value.
      newSliderValue = (value / parseFloat(assetContext.valueUsd)) * 100;
    }

    setSliderValue(newSliderValue);
  };

  const toggleCurrency = () => {
    if (inputCurrency === 'USD') {
      setInputCurrency('Native');
    } else {
      setInputCurrency('USD');
    }
  };

  let onSelect = function(asset: any){
    console.log(TAG, "onSelect", asset);
  }

  return (
    <Stack spacing={4}>
      <div>
        <Asset onSelect={onSelect} onClose={onClose} asset={assetContext} />
      </div>
      <Text fontSize="md" mb="2">
        Select Amount To Trade:
      </Text>
      <CircularProgress value={sliderValue} color='green.400'>
        <CircularProgressLabel>{sliderValue}%</CircularProgressLabel>
      </CircularProgress>
      <Flex alignItems="center" direction="column">
        <Text fontSize="md" mb="2">
          Select Amount To Trade (in {inputCurrency}):
        </Text>
        <Flex justify="space-between" mb="2" width="100%">
          <Button
            onClick={() =>
              setInputAmountNative(
                parseFloat(assetContext?.balance || '0') -
                minimumTradeAmountUSD / assetContext?.priceUsd,
              )
            }
          >
            Max
          </Button>
        </Flex>
        <NumberInput
          errorBorderColor="red.500"
          // isInvalid={!isInputValid}
          onChange={(_, valueAsNumber) => setInputAmountNative(valueAsNumber)}
          maxW="200px"
          value={inputCurrency === 'USD' ? inputAmountUsd : inputAmountNative}
        >
          <NumberInputField borderColor={isInputValid ? 'inherit' : 'red.500'} />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <div>{inputCurrency === 'USD' ? (<>{inputAmountNative} ({assetContext.chain})</>):(<>{inputAmountUsd} (USD)</>)}</div>
        <Button onClick={toggleCurrency}>input as {inputCurrency}</Button>
        <Slider
          flex="1"
          focusThumbOnChange={false}
          mt="4"
          onChange={onSliderChange}
          value={sliderValue}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb boxSize="32px">{sliderValue}%</SliderThumb>
        </Slider>
      </Flex>
    </Stack>
  );
}
