'use client';
import { AddIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  VStack
} from '@chakra-ui/react';
import { FeeOption, Chain } from '@coinmasters/types';
// import { COIN_MAP_LONG } from "@pioneer-platform/pioneer-coins";
import React, { useEffect, useState } from 'react';

import ErrorQuote from '../../components/ErrorQuote';
import Assets from '../../components/Assets';

import Pending from '../../components/Pending';
import Quotes from '../../components/Quotes';
import SignTransaction from '../../components/SignTransaction';
import PubkeyAdd from '../../components/PubkeyAdd';
import Wallets from '../../components/Wallets';
// import { usePioneer } from '@coinmasters/pioneer-react';

// import backgroundImage from "lib/assets/background/thorfox.webp"; // Adjust the path
// import ForkMeBanner from "lib/components/ForkMe";
import BeginSwap from './steps/BeginSwap'; // Updated import here
import CompleteSwap from './steps/CompleteSwap'; // Updated import here
import SelectAssets from './steps/SelectAssets';
import { useParams } from 'next/navigation';
import Quote from '../Quote';

const MODAL_STRINGS = {
  selectAsset: 'Select Asset',
  memolessWarning: 'Memoless Warning',
  pairWallet: 'Pair Wallet',
  addDestination: 'Add Destination',
  selectQuote: 'Select Quote',
  selectOutbound: 'Select Outbound',
  confirmTrade: 'Confirm Trade',
  pending: 'Show Pending',
  errorQuote: 'Error Quote',
};

export function Swap({usePioneer}:any): JSX.Element {
  const { state } = usePioneer();
  const { txid } = useParams<{ txid?: string }>();
  const { app, assetContext, outboundAssetContext, blockchainContext } = state;
  // tabs
  const [tabIndex, setTabIndex] = useState(0);
  // steps
  const [step, setStep] = useState(0);
  const [modalType, setModalType] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [route, setRoute] = useState(null);
  const [quoteId, setQuoteId] = useState('');
  const [memoless, setMemoless] = useState<any>(null);
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState<any>({});
  const [integrations, setIntegrations] = useState<any>(null);
  const [inputAmount, setInputAmount] = useState(0);
  const [txHash, setTxHash] = useState(null);
  const [amountSelected, setAmountSelected] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0); // New state for current route index
  const [selectedButton, setSelectedButton] = useState('quick'); // Initial selected button is "Quick"
  const [isContinueDisabled, setIsContinueDisabled] = useState(true); // Initial continue button is disabled
  const [isContinueVisable, setIsContinueVisable] = useState(false); // Initial continue button is disabled
  const [quotesData, setQuotesData] = useState<typeof Quote[]>([]);
  const [showGoBack, setShowGoBack] = useState(false);
  const [continueButtonContent, setContinueButtonContent] = useState('Continue'); // Initial continue button content is "Continue"

  useEffect(() => {
    if (app && app.balances.length > 0) {
      for(let i = 0; i < app.balances.length; i++) {
        let balance = app.balances[i];
        console.log('balance: ', balance);
        console.log('balance: ', balance.balance);
        //TODO first highest value is input
        //second highest value is output
      }
    }
  }, [app, app.assetsMap, app.balances]);

  useEffect(() => {
    if (app && step === 0) {
      setIsContinueDisabled(false);
    }
  }, [app, assetContext, blockchainContext, outboundAssetContext, step]);

  useEffect(() => {
    if (step === 0) {
      setShowGoBack(false);
      setIsContinueVisable(true);
    }
    if (step === 1) {
      setIsContinueDisabled(true);
      setIsContinueVisable(false);
      // setContinueButtonContent('Accept Route');
    }
  }, [step]);

  const openModal = (type: any) => {
    setModalType(type);
    onOpen();
  };

  useEffect(() => {
    //console.log("**** inputAmount: ", inputAmount);
  }, [inputAmount]);

  useEffect(() => {
    if(!app?.assetContext?.balance) setMemoless(true);
    if(app?.assetContext?.integrations) setIntegrations(app.assetContext.integrations);
  }, [app, app?.assetContext, app?.assetContext?.balance]);

  const fetchQuote = async () => {
    // try {
    //   //console.log('sliderValue: ', sliderValue);
    //   let senderAddress
    //   if(!memoless){
    //     senderAddress = assetContext.address;
    //     if(senderAddress.indexOf('bitcoincash:') > -1) senderAddress = senderAddress.replace('bitcoincash:', '');
    //   }
    //
    //   let recipientAddress = app.outboundAssetContext.address;
    //   let ethPubkey = app.pubkeys.find((pubkey: any) => pubkey.networks.includes('eip155:1'));
    //   let trader
    //   if(ethPubkey){
    //     trader = ethPubkey.address
    //     console.log("trader: ",trader)
    //   }
    //
    //   if(!inputAmount || inputAmount <= 0) {
    //     throw Error('Invalid amount!');
    //   }
    //
    //
    //   //get receiver context
    //   if(recipientAddress.indexOf('bitcoincash:') > -1) recipientAddress = recipientAddress.replace('bitcoincash:', '');
    //
    //   //get USDvauleIn if < 50 throw error
    //   const usdValue = parseFloat(swap?.sellAmount) * swap?.sellAsset?.priceUsd;
    //   if(usdValue < 50)  alert('Trades under 50 USD are high risk and have low success rates. currently not supported. Please try again with a higher amount.');
    //
    //   const entry:any = {
    //     affiliate: '0x658DE0443259a1027caA976ef9a42E6982037A03',
    //     sellAsset: app.assetContext,
    //     // @ts-ignore
    //     sellAmount: parseFloat(inputAmount).toPrecision(8),
    //     buyAsset: app.outboundAssetContext,
    //     recipientAddress,
    //     slippage: '3',
    //   };
    //   if(senderAddress) entry.senderAddress = senderAddress
    //   if(trader) entry.trader = trader;
    //   if(memoless) entry.memoless = true;
    //   console.log('entry: ', entry);
    //   console.log('entry: ', JSON.stringify(entry));
    //   try {
    //     let result = await app.pioneer.Quote(entry);
    //     result = result.data;
    //     console.log('Quote result: ', result);
    //
    //     if (result && result.length > 0) {
    //       setQuotesData(result);
    //       openModal(MODAL_STRINGS.selectQuote);
    //     } else {
    //       alert('No routes found!');
    //     }
    //
    //     // if error, render Error
    //     if (result && result.error) {
    //       openModal(MODAL_STRINGS.errorQuote);
    //       setError(result);
    //     }
    //   } catch (e) {
    //     openModal(MODAL_STRINGS.errorQuote);
    //     setError(`Invalid request: ${e}`);
    //   }
    // } catch (e: any) {
    //   console.error('ERROR: ', e);
    //   // alert(`Failed to get quote! ${e.message}`);
    // }
  };

  let handleQuoteSelection = function (quote: any) {
    //console.log('handleQuoteSelection: ', quote);
    setQuoteId(quote.id);
    if(quote && quote.quote)setQuote(quote);
    onClose();
  };

  // start the context provider
  useEffect(() => {
    if (txid) {
      //console.log('Set txid: ', txid);
      // set the txid
      // @ts-ignore
      setTxHash(txid);
      setStep(2);
    } else {
      // check pending
      if (typeof window !== 'undefined') {
        const pendingTransactions = JSON.parse(window.localStorage.getItem('pendingTransactions') ?? '[]');
        console.log("pendingTransactions: ", pendingTransactions);
        //console.log('pendingTransactions: ', pendingTransactions);
        if (pendingTransactions && pendingTransactions.length > 0) {
          // openModal(MODAL_STRINGS.pending);
        }
      }
    }
  }, []);

  // // start the context provider
  useEffect(() => {
    if (amountSelected) {
      console.log('amountSelected: ', amountSelected);
      if(memoless && app?.outboundAssetContext?.address && step == 0){
        console.log("Showing continue button")
        setIsContinueVisable(true);
        setIsContinueDisabled(false)
      }
    }
  }, [amountSelected, isContinueVisable]);

  const handleClickContinue = () => {
    try {
      if (step === 0) {
        fetchQuote();
        setStep((prevStep) => prevStep + 1);
        setShowGoBack(true);
        setIsContinueVisable(false)
        return;
      }
      if (step === 1) {
        const swapParams = {
          recipient: assetContext.address,
          feeOptionKey: FeeOption.Fast,
        };
        //console.log('swapParams: ', swapParams);
        // fetchQuote();
        openModal(MODAL_STRINGS.confirmTrade);
      }
      if (step === 1) {
        // check if confirmed
        // if confirmed
        // setStep((prevStep) => prevStep + 1)
      }
    } catch (e) {
      console.error(e);
    }
  };

  // start the context provider
  useEffect(() => {
    if (step === 1 && txHash) {
      setShowGoBack(false);
      // check if confirmed
      // if confirmed
      setStep((prevStep) => prevStep + 1);
    }
  }, [txHash]);

  const goBack = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <SelectAssets
            usePioneer={usePioneer}
            openModal={openModal}
            setInputAmount={setInputAmount}
            setIsContinueVisable={setIsContinueVisable}
            memoless={memoless}
            setMemoless={setMemoless}
            setAmountSelected={setAmountSelected}
          />
        );
      case 1:
        return <BeginSwap usePioneer={usePioneer} setTxHash={setTxHash} onAcceptSign={onAcceptSign} quote={quote} memoless={memoless}/>;
      case 2:
        return <CompleteSwap usePioneer={usePioneer} quoteId={quoteId} route={route} txHash={txHash} />;
      default:
        return null;
    }
  };

  let onSelectOutput = async function (asset: any) {
    //console.log('onSelectOutput');
    if(app?.assetContext && app?.assetContext.caip === asset.caip) {
      alert('Must select a different asset! input === output');
    } else {
      await app.setOutboundAssetContext(asset);
      onClose();
    }
  };

  let onSelect = async function (asset:any) {
    //console.log('onSelect',asset);
    await app.setAssetContext(asset);
    onClose();
  };

  let onAcceptSign: any = function () {
    //console.log('onAcceptSign');
    openModal(MODAL_STRINGS.confirmTrade);
  };

  let handleWalletClick = async function (wallet: any) {
    console.log('handleWalletClick: ', wallet);
    // await app.setWalletContext(wallet);
    // onClose();
  }

  return (
    <Box>
      {/* <ForkMeBanner /> */}
      <Modal isOpen={isOpen} onClose={() => onClose()} size="xl">
        <ModalOverlay />
        <ModalContent bg="black">
          <ModalHeader>{modalType}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Render content based on modalType */}
            {modalType === MODAL_STRINGS.pairWallet && (
              <div>
                <Wallets usePioneer={usePioneer} handleWalletClick={handleWalletClick}/>
              </div>
            )}
            {modalType === MODAL_STRINGS.selectAsset && (
              <div>
                <Assets usePioneer={usePioneer} filters={{onlyOwned: !memoless, hasPubkey: !memoless, noTokens: false, memoless, integrations}} onClose={onClose} onSelect={onSelect} />
              </div>
            )}
            {modalType === MODAL_STRINGS.selectOutbound && (
              <div>
                <Assets usePioneer={usePioneer} filters={{onlyOwned: false, hasPubkey: false, noTokens: false, memoless, integrations}} onClose={onClose} onSelect={onSelectOutput} />
              </div>
            )}
            {modalType === MODAL_STRINGS.addDestination && (
              <div>
                <PubkeyAdd usePioneer={usePioneer} onClose={onClose} setIsContinueVisable={setIsContinueVisable}> </PubkeyAdd>
              </div>
            )}
            {modalType === MODAL_STRINGS.selectQuote && (
              <div>
                <Quotes
                  Quotes={quotesData}
                  onClose={onClose}
                  onSelectQuote={handleQuoteSelection}
                />
              </div>
            )}
            {modalType === MODAL_STRINGS.confirmTrade && (
              <div>
                <SignTransaction
                  usePioneer={usePioneer}
                  onClose={onClose}
                  quote={quote}
                  setTxHash={setTxHash}
                />
              </div>
            )}
            {modalType === MODAL_STRINGS.memolessWarning && (
              <div>
                Warning: This trade is memoless. Are you sure you want to continue?
                Pairing a wallet will enable a greater access to protocols for swapping
              </div>
            )}
            {modalType === MODAL_STRINGS.errorQuote && (
              <div>
                <ErrorQuote error={error} onClose={onClose} />
              </div>
            )}
            {modalType === MODAL_STRINGS.pending && (
              <div>
                <Pending usePioneer={usePioneer} setTxHash={setTxHash} onClose={onClose} />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Box bg="black" mx="auto">
        {renderStepContent()}
      </Box>
      <Flex alignItems="center" bg="black" flexDirection="column" mx="auto">
        {(app?.outboundAssetContext && !app?.outboundAssetContext?.address && amountSelected) && (
          <Box
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            boxShadow="sm"
          >
          <VStack spacing={4} align="stretch">
            <Flex justifyContent="flex-end" alignItems="center">
              <Box flex="1" textAlign="left" mr={2}>To continue...</Box>
            </Flex>
            <Flex justifyContent="flex-end">
              <Button
                size="sm"
                colorScheme="red"
                onClick={() => openModal(MODAL_STRINGS.addDestination)}
              >
                Add A Destination Address
              </Button>
            {/*{memoless && (*/}
            {/*    <Button*/}
            {/*      size="sm"*/}
            {/*      colorScheme="blue"*/}
            {/*      onClick={() => console.log('Pair Wallet Clicked')}*/}
            {/*    >*/}
            {/*      Pair Wallet*/}
            {/*    </Button>*/}
            {/*)}*/}
            </Flex>
          </VStack>
          </Box>
        )}
        {!amountSelected && (<>
          <Box>
            <Text fontSize="sm" color="gray.500" textAlign="center">
              {`How much would you like to trade?`}
            </Text>
          </Box>
        </>)}

        {showGoBack && (
          <div>
            <Button onClick={goBack}>Go Back</Button>
          </div>
        )}
        {isContinueVisable && (
          <Button
            colorScheme="blue"
            isDisabled={isContinueDisabled}
            leftIcon={<AddIcon />}
            mt={4}
            onClick={() => handleClickContinue()}
          >
            {continueButtonContent}
          </Button>
        )}
      </Flex>
    </Box>
  );
};

export default Swap;
