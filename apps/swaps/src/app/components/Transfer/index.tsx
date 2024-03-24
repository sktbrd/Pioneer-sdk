/*
    Transfer
      This component is used to send crypto to another address.
 */
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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useDisclosure,
  useToast,
  VStack,
  Tooltip,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import { AssetValue, Chain } from '@coinmasters/core';
let {ChainToNetworkId} = require('@pioneer-platform/pioneer-caip');
// @ts-ignore
import { COIN_MAP_LONG } from '@pioneer-platform/pioneer-coins';
// import { Chain } from '@pioneer-platform/types';
import { useCallback, useEffect, useState } from 'react';

// import AssetSelect from '../../components/AssetSelect';
import Assets from '../Assets';
import { usePioneer } from '@coinmasters/pioneer-react';
import { getWalletBadgeContent } from '../WalletIcon';

const Transfer = () => {
  const toast = useToast();
  const { state, setIntent, connectWallet } = usePioneer();
  const { app, assetContext, balances, context } = state;
  const { isOpen, onOpen, onClose } = useDisclosure(); // Add disclosure for modal
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
  const [modalType, setModalType] = useState(''); // Add state for modal type

  // Update avatar URL when assetContext changes
  useEffect(() => {
    if (assetContext && COIN_MAP_LONG[assetContext.chain as keyof typeof COIN_MAP_LONG]) {
      const newAvatarUrl = `https://pioneers.dev/coins/${COIN_MAP_LONG[assetContext.chain as keyof typeof COIN_MAP_LONG]}.png`;
      setAvatarUrl(newAvatarUrl);
    }
  }, [assetContext]);

  useEffect(() => {
    if (context) {
      console.log('context: ', context);
      setWalletType(context.split(':')[0]);
    }
  }, [context, app]);

  // start the context provider
  useEffect(() => {
    setIsPairing(false);
  }, [app, app?.context]);

  const handleInputChange = (value: string) => {
    setInputAmount(value);
    if (!assetContext) return;
    setSendAmount('');
  };

  const handleSend = useCallback(async () => {
    try {
      if (!inputAmount) alert('You MUST input an amount to send!');
      if (!recipient) alert('You MUST input a recipient to send to!');
      // @TODO Validate Address!
      // verify is connected
      // const isContextExist = app.wallets.some((wallet: any) => wallet.context === context);
      // console.log("isContextExist: ", isContextExist);
      // //get context of swapkit
      // let swapKitContext = await getSwapKitContext();
      // console.log("swapKitContext: ", swapKitContext);
      console.log('assetContext: ', assetContext);
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
        //get wallet for context
        let walletType = app.context.split(':')[0];
        console.log('Wallet not connected, opening modal for: ', walletType);
        //open wallet for context

        connectWallet(walletType.toUpperCase());
        setTimeout(() => {
          console.log('Retrying wallet connection...');
          handleSend();
        }, 3000);
        // pairWallet();
      } else {
        setIsSubmitting(true);
        // create assetValue
        const assetString = `${assetContext.chain}.${assetContext.symbol}`;
        console.log('assetString: ', assetString);
        await AssetValue.loadStaticAssets();
        // @ts-ignore
        const assetValue = await AssetValue.fromIdentifier(assetString, parseFloat(inputAmount));
        console.log('assetValue: ', assetValue);

        // modify assetVaule for input
        let sendPayload:any = {
          assetValue,
          memo: '',
          recipient,
        }
        if(isMax) sendPayload.isMax = true
        // let assetValue;
        console.log("sendPayload: ", sendPayload)
        const txHash = await app.swapKit.transfer(sendPayload);
        window.open(
          `${app.swapKit.getExplorerTxUrl(assetContext.chain, txHash as string)}`,
          '_blank',
        );
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

  // Function to show modal with a specific type
  const showModalWithType = (type: any) => {
    setModalType(type);
    onOpen();
  };

  const onSelect = async function (asset: any) {
    try {
      console.log('onSelect: ', asset);
      onClose();
      setModalType('');
    } catch (e) {
      console.error(e);
    }
  };


  const setMaxAmount = async function () {
    try {
      const walletInfo = await app.swapKit.getWalletByChain(assetContext.chain);
      console.log('walletInfo: ', walletInfo);
      setisMax(true);
      if(!walletInfo){
        console.log("app.context: ",app.context)
        console.log("aassetContext: ",assetContext)
        console.log("aassetContext.chain: ",assetContext.chain)
        console.log("aassetContext.networkId: ",assetContext.networkId)
        //set blockchains to JUST input asset
        let blockchains = [assetContext.networkId]
        console.log("new blockchains: ",blockchains)
        app.setBlockchains(blockchains)

        //walletType
        let walletType = app.context.split(':')[0];
        console.log('Wallet not connected, opening modal for: ', walletType);

        //connect wallet
        await connectWallet(walletType.toUpperCase());
      } else {

        console.log('onSetMax: ');
        let pubkeys = await app.pubkeys
        console.log("pubkeys: ",pubkeys)
        //filter by chain
        pubkeys = pubkeys.filter((pubkey: any) => pubkey.networks.includes(assetContext.networkId));

        //send
        let estimatePayload:any = {
          feeRate: 10,
          pubkeys,
          memo,
          recipient,
        }
        console.log("app.swapKit: ",app.swapKit)
        console.log("app.swapKit: ",app.estimateMaxSendableAmount)
        //verify amount is < max spendable
        let maxSpendable = await app.swapKit.estimateMaxSendableAmount({chain:assetContext.chain, params:estimatePayload})
        console.log("maxSpendable: ",maxSpendable)
        console.log("maxSpendable: ",maxSpendable.getValue('string'))
        setInputAmount(maxSpendable.getValue('string'))
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <VStack align="start" borderRadius="md" p={6} spacing={5}>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setModalType('');
        }}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Choose Asset</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {modalType === 'SELECT' && (
              <div>
                <Assets onClose={onClose} nSelect={onSelect} filters={{onlyOwned: false, noTokens: false, hasPubkey:true }}/>
              </div>
            )}
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>
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
              <Button
                colorScheme="blue"
                isDisabled={!balances}
                onClick={() => showModalWithType('SELECT')}
              >
                Change Asset
              </Button>
            </Box>
          </Flex>
          <br />
          <Grid
            gap={10}
            templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
            w="full"
          >
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
          <Flex justify="space-between" align="center" mt="4">
            <Button
              variant="ghost"
              rightIcon={showAdvanced ? <ChevronUpIcon /> : <ChevronDownIcon />}
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              Advanced
            </Button>
          </Flex>
          {showAdvanced && (
            <FormControl>
              <FormLabel>
                Memo:
                <Tooltip label="Optional memo to include with your transaction for reference." aria-label="A tooltip for memo input">
                  <InfoOutlineIcon ml="2" />
                </Tooltip>
              </FormLabel>
              <Input placeholder="Enter memo (optional)" value={memo} onChange={(e) => setMemo(e.target.value)} />
            </FormControl>
          )}
          <br />
          <Text>
            Available Balance: {assetContext?.balance} ({assetContext?.symbol})
          </Text>
          <Button onClick={setMaxAmount} size={'sm'}>MAX</Button>
        </div>
      )}

      <Button
        colorScheme="green"
        w="full"
        mt={4}
        // isLoading={isSubmitting}
        onClick={handleSend}
      >
        {isSubmitting ? <Spinner size="xs" /> : 'Send'}
      </Button>
    </VStack>
  );
};

export default Transfer;
