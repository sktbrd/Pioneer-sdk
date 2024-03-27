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
import Asset from '../../Asset';
import Amount from '../../Amount';
// @ts-ignore
import { usePioneer } from '@coinmasters/pioneer-react';

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
  openModal,
  setIsContinueVisable,
  setInputAmount
}: any) => {
  const { state } = usePioneer();
  const [assetConfirmed, setAssetsConfirmed] = useState(false);
  const { assetContext, outboundAssetContext, app, balances } = state;

  const switchAssets = function () {
    const currentInput = assetContext;
    const currentOutput = outboundAssetContext;
    console.log('currentInput: ', currentInput);
    console.log('currentOutput: ', currentOutput);
    console.log('Switching assets!');
    app.setOutboundAssetContext(currentInput);
    app.setAssetContext(currentOutput);
  };

  //
  const confirmAssetSelection = async function(isConfirmed: boolean){
    setAssetsConfirmed(true)
    setIsContinueVisable(true);
  }

  let onSelect = function (asset: any) {
    console.log('asset: ',asset)
  }

  let onClose = function () {
    console.log('onClose: ')
  }

  return (
    <div>
      <Flex alignItems="center" bg="black" justifyContent="center" mx="auto" p="2rem">
        <HStack maxWidth="35rem" spacing={4} width="100%">
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
            onClick={() => openModal('Select Asset')}
          >
            {!assetContext ? (
              <Spinner color="blue.500" size="lg" />
            ) : (
              <>
                <Avatar
                  size="xl"
                  src={assetContext.icon}
                />
                <Text noOfLines={1}>{assetContext.name}</Text>
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
            onClick={() => openModal('Select Outbound')}
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
      {assetConfirmed ? (<>
        <Amount setInputAmount={setInputAmount} asset={app?.assetContext} ></Amount>
      </>) : (
        <>
          <Asset onClose={onClose} onSelect={onSelect} asset={app?.assetContext} ></Asset>
          <Asset onClose={onClose} onSelect={onSelect} asset={app?.outboundAssetContext} ></Asset>
          Confirm Asset Selection
          <Button onClick={() => confirmAssetSelection(true)}>Confirm</Button>
        </>
      )}
    </div>
  );
};

export default BeginSwap;
