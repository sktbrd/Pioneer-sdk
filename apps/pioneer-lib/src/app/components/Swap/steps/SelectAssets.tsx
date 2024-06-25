'use client';
import { ArrowUpDownIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Spinner,
  Text,
} from '@chakra-ui/react';
// @ts-ignore
import { COIN_MAP_LONG } from '@pioneer-platform/pioneer-coins';
import React, { useEffect, useState } from 'react';
import SwapInput from '../components/SwapInput';
import Asset from '../../Asset';
import Amount from '../../Amount';
// @ts-ignore

const labelStyles = {
  mt: '2',
  ml: '-2.5',
  fontSize: 'sm',
};

interface BeginSwapProps {
  openModal: any; // Replace 'any' with the actual type of 'openModal'
  handleClick: any; // Replace 'any' with the actual type of 'handleClick'
  selectedButton: any; // Replace 'any' with the actual type of 'selectedButton',
  setIsContinueVisable: any,
  setInputAmount: any,
  sliderValue: any,
  setSliderValue: any,
}

const BeginSwap: any = ({
  usePioneer,
  openModal,
  setIsContinueVisable,
  setInputAmount,
  setAmountSelected,
  memoless,
  setMemoless,
}: any) => {
  const { state } = usePioneer();
  const [assetConfirmed, setAssetsConfirmed] = useState(false);
  const { app } = state;
  const [assetContext, setAssetContext] = useState<any>(null);
  const [outputQuote, setOutputQuote] = useState<any>(null);
  const [outboundAssetContext, setOutboundAssetContext] = useState<any>(null);

  useEffect(() => {
    if (app?.assetContext) setAssetContext(app?.assetContext);
    if (app?.outboundAssetContext) setOutboundAssetContext(app?.outboundAssetContext);
    calculateQuote();
  }, [app, app?.assets, app?.assetContext, app?.outboundAssetContext]);


  const switchAssets = function () {
    const currentInput = assetContext;
    const currentOutput = outboundAssetContext;
    console.log('currentInput: ', currentInput);
    console.log('currentOutput: ', currentOutput);
    console.log('Switching assets!');
    app.setOutboundAssetContext(currentInput);
    app.setAssetContext(currentOutput);
  };

  const calculateQuote = () => {
    if (app?.assetContext?.priceUsd && app?.outboundAssetContext?.priceUsd) {
      const rate = app.assetContext.priceUsd / app.outboundAssetContext.priceUsd;
      setOutputQuote(`1 ${app.assetContext.name} ≈ ${rate.toFixed(4)} ${app.outboundAssetContext.name}`);
    }
  };

  const onClickOutbound = () => {
    if(app)app.setOutboundAssetContext();
    openModal('Select Outbound')
  }

  const onClickInput = () => {
    if(app)app.setAssetContext();
    openModal('Select Asset')
  }

  return (
    <div>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        p="4" // Padding around the text
        border="1px solid #ccc" // Change the color and thickness as needed
        borderRadius="md" // Rounded corners
        m="4" // Margin around the box
        width="auto" // Adjust width based on content or set a specific width
      > {outputQuote} </Box>
      <Flex justifyContent="center" mx="auto" p="2rem">
        <HStack maxWidth="35rem" width="100%">
          {/* Asset selection box */}
          <Box
            _hover={{ color: 'rgb(128,128,128)' }}
            alignItems="center"
            border="1px solid #fff"
            borderRadius="8px"
            display="flex"
            flexDir="column"
            h="200px" // Ensure uniform height
            justifyContent="space-between"
            overflowY="auto"
            p="4"
            w="200px" // Ensure sufficient width
            onClick={() => onClickInput()}
          >
            {!assetContext ? (
              <Spinner color="blue.500" size="lg" />
            ) : (
              <>
                <Avatar
                  size="xl"
                  src={assetContext?.icon}
                />
                <Text noOfLines={1}>{assetContext?.name}</Text>
              </>
            )}
          </Box>
          <ArrowUpDownIcon boxSize="2rem" color="white" onClick={switchAssets} />
          {/* Outbound asset selection box */}
          <Box
            _hover={{ color: 'rgb(128,128,128)' }}
            alignItems="center"
            border="1px solid #fff"
            borderRadius="8px"
            display="flex"
            flexDirection="column"
            h="200px" // Ensure uniform height
            justifyContent="space-between"
            overflowY="auto"
            p="4"
            w="200px" // Ensure sufficient width
            onClick={() => onClickOutbound()}
          >
            {!outboundAssetContext ? (
              <Spinner color="blue.500" size="lg" />
            ) : (
              <>
                <Avatar
                  size="xl"
                  src={outboundAssetContext.icon}
                />
                <Text noOfLines={1}>{outboundAssetContext.name}</Text>
              </>
            )}
          </Box>
        </HStack>
      </Flex>
      <SwapInput usePioneer={usePioneer} setAmountSelected={setAmountSelected} setInputAmount={setInputAmount}></SwapInput>
      {/*{(app?.outboundAssetContext && app?.outboundAssetContext.address) &&(*/}
      {/*  <>*/}
      {/*    <Button onClick={() => confirmAssetSelection(true)}>Confirm</Button>*/}
      {/*  </>*/}
      {/*)}*/}
    </div>
  );
};

export default BeginSwap;
