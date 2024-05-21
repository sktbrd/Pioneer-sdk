import {
  Avatar,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Input,
  Spinner,
  Text,
  VStack,
  Tooltip,
  Select,
  useToast,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import { AssetValue, Chain } from '@coinmasters/core';
// @ts-ignore
import { COIN_MAP_LONG } from '@pioneer-platform/pioneer-coins';
import React, { useCallback, useEffect, useState, useMemo } from 'react';

import Assets from '../Assets';
import { getWalletBadgeContent } from '../WalletIcon';

export function Transfer({ usePioneer, onClose }: any): JSX.Element {
  const toast = useToast();
  const { state, setIntent, connectWallet } = usePioneer();
  const { app, assetContext, balances, context } = state;
  const [isPairing, setIsPairing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [isMax, setisMax] = useState(false);
  const [inputAmount, setInputAmount] = useState('');
  const [sendAmount, setSendAmount] = useState<any | undefined>();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [memo, setMemo] = useState('');

  const [recipient, setRecipient] = useState('');
  const [walletType, setWalletType] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [modalType, setModalType] = useState('');

  const [selectedBalanceIndex, setSelectedBalanceIndex] = useState(0);
  const [availableBalances, setAvailableBalances] = useState<any[]>([]);

  useEffect(() => {
    if(assetContext && assetContext.icon){
      setAvatarUrl(assetContext.icon);
    }
    // if (assetContext && COIN_MAP_LONG[assetContext.chain as keyof typeof COIN_MAP_LONG]) {
    //   const newAvatarUrl = `https://pioneers.dev/coins/${COIN_MAP_LONG[assetContext.chain as keyof typeof COIN_MAP_LONG]}.png`;
    //   setAvatarUrl(newAvatarUrl);
    // }
  }, [assetContext]);

  useEffect(() => {
    if (context) {
      setWalletType(context.split(':')[0]);
    }
  }, [context, app]);

  useEffect(() => {
    setIsPairing(false);
  }, [app, app?.context]);

  useEffect(() => {
    if (balances && assetContext) {
      const assetBalances = balances.filter((balance: any) => balance.symbol === assetContext.symbol);
      setAvailableBalances(assetBalances);
    }
  }, [balances, assetContext]);

  const handleInputChange = (value: string) => {
    setInputAmount(value);
    if (!assetContext) return;
    setSendAmount('');
  };

  const handleSend = useCallback(async () => {
    try {
      if (!inputAmount) alert('You MUST input an amount to send!');
      if (!recipient) alert('You MUST input a recipient to send to!');
      setIntent(
        'transfer:' +
        assetContext.chain +
        ':' +
        assetContext.symbol +
        ':' +
        inputAmount +
        ':' +
        recipient,
      );
      const walletInfo = await app.swapKit.getWalletByChain(assetContext.chain);

      if (!walletInfo) {
        let walletType = app.context.split(':')[0];
        connectWallet(walletType.toUpperCase());
        setTimeout(() => {
          handleSend();
        }, 3000);
      } else {
        setIsSubmitting(true);
        //TODO move this lookup to pioneer-coins caipToThorchain
        const assetString:any = `${assetContext.chain}.${assetContext.symbol}`;
        console.log('assetString', assetString)
        await AssetValue.loadStaticAssets();
        const assetValue = await AssetValue.fromIdentifier(assetString, parseFloat(inputAmount));
        let sendPayload: any = {
          assetValue,
          memo: '',
          recipient,
        }
        if(!assetValue) alert('Unrecognized asset')
        if (isMax) sendPayload.isMax = true
        const txHash = await app.swapKit.transfer(sendPayload);
        if (typeof window !== 'undefined') {
          window.open(
            `${app.swapKit.getExplorerTxUrl(assetContext.chain, txHash as string)}`,
            '_blank',
          );
        }
      }
    } catch (e: any) {
      console.error(e);
      toast({
        title: 'Error',
        description: e.toString(),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [assetContext, inputAmount, app, recipient, sendAmount, toast]);

  const onSelect = async function (asset: any) {
    try {
      await app.setAssetContext(asset);
      setModalType('');
    } catch (e) {
      console.error(e);
    }
  };

  const setMaxAmount = async function () {
    try {
      const walletInfo = await app.swapKit.getWalletByChain(assetContext.chain);
      setisMax(true);
      if (!walletInfo) {
        let blockchains = [assetContext.networkId]
        app.setBlockchains(blockchains)
        let walletType = app.context.split(':')[0];
        await connectWallet(walletType.toUpperCase());
      } else {
        let pubkeys = await app.pubkeys
        pubkeys = pubkeys.filter((pubkey: any) => pubkey.networks.includes(assetContext.networkId));
        let estimatePayload: any = {
          feeRate: 10,
          pubkeys,
          memo,
          recipient,
        }
        let maxSpendable = await app.swapKit.estimateMaxSendableAmount({ chain: assetContext.chain, params: estimatePayload })
        setInputAmount(maxSpendable.getValue('string'))
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formattedBalance = useMemo(() => {
    if (!availableBalances[selectedBalanceIndex]?.balance) return '0.00';
    const balance = parseFloat(availableBalances[selectedBalanceIndex]?.balance);
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(balance);
  }, [availableBalances, selectedBalanceIndex]);

  return (
    <VStack align="start" borderRadius="md" p={6} spacing={5}>
      <Heading as="h1" mb={4} size="lg">
        Send Crypto!
      </Heading>

      {isPairing ? (
        <Box>
          <Text mb={2}>
            Connecting to {context}...
            <Spinner size="xl" />
            Please check your wallet to approve the connection.
          </Text>
        </Box>
      ) : (
        <div>
          <Flex align="center" direction={{ base: 'column', md: 'row' }} gap={20}>
            <Box>
              <Avatar size="xxl" src={avatarUrl}>
                {getWalletBadgeContent(walletType, '8em')}
              </Avatar>
            </Box>
            <Box>
              <Text mb={2}>Asset: {assetContext?.name || 'N/A'}</Text>
              <Text mb={2}>Chain: {assetContext?.chain || 'N/A'}</Text>
              <Text mb={4}>Symbol: {assetContext?.symbol || 'N/A'}</Text>
            </Box>
          </Flex>
          <br />
          <Grid gap={10} templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }} w="full">
            <FormControl>
              <FormLabel>Recipient:</FormLabel>
              <Input
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Address"
                value={recipient}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Input Amount:</FormLabel>
              <Input
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="0.0"
                value={inputAmount}
              />
            </FormControl>
          </Grid>
          {/*<Flex justify="space-between" align="center" mt="4">*/}
          {/*  <Button*/}
          {/*    variant="ghost"*/}
          {/*    rightIcon={showAdvanced ? <ChevronUpIcon /> : <ChevronDownIcon />}*/}
          {/*    onClick={() => setShowAdvanced(!showAdvanced)}*/}
          {/*  >*/}
          {/*    Advanced*/}
          {/*  </Button>*/}
          {/*</Flex>*/}
          {/*{showAdvanced && (*/}
          {/*  <FormControl>*/}
          {/*    <FormLabel>*/}
          {/*      Memo:*/}
          {/*      <Tooltip label="Optional memo to include with your transaction for reference." aria-label="A tooltip for memo input">*/}
          {/*        <InfoOutlineIcon ml="2" />*/}
          {/*      </Tooltip>*/}
          {/*    </FormLabel>*/}
          {/*    <Input placeholder="Enter memo (optional)" value={memo} onChange={(e) => setMemo(e.target.value)} />*/}
          {/*  </FormControl>*/}
          {/*)}*/}
          <br />
          {availableBalances.length > 1 && (
            <FormControl>
              <FormLabel>Select Balance:</FormLabel>
              <Select onChange={(e) => setSelectedBalanceIndex(Number(e.target.value))} value={selectedBalanceIndex}>
                {availableBalances.map((balance, index) => (
                  <option key={index} value={index}>
                    {balance.balance} ({balance.symbol})
                  </option>
                ))}
              </Select>
            </FormControl>
          )}
          <Text mt={4}>
            Selected Balance:
            <Text as='b'>{formattedBalance}
              ({availableBalances[selectedBalanceIndex]?.symbol})
            </Text>
          </Text>
          <Button onClick={setMaxAmount} size={'sm'}>MAX</Button>
        </div>
      )}

      <Button
        colorScheme="green"
        w="full"
        mt={4}
        onClick={handleSend}
      >
        {isSubmitting ? <Spinner size="xs" /> : 'Send'}
      </Button>
      <Button onClick={onClose}>Go Back</Button>
    </VStack>
  );
};

export default Transfer;
