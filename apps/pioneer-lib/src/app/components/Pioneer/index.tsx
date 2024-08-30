import {
  Box,
  Flex,
  Text,
  Spinner,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  VStack,
  Center,
  Avatar,
  Heading,
  Grid,
  GridItem,
  AvatarGroup,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import { FaWallet, FaLock, FaDollarSign } from 'react-icons/fa';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { FaChartPie, FaPaperPlane, FaInbox, FaExchangeAlt, FaCog, FaRegMoneyBillAlt, FaDownload } from 'react-icons/fa';

import Charts from '../../components/Charts';
import Balances from '../Balances';
import Onboarding from '../Onboarding';
import AssetSelect from '../AssetSelect';
import Assets from '../../components/Assets';
import Blockchains from '../Blockchains';
import Transfer from '../Transfer';
import Receive from '../Receive';
import Swap from '../Swap';
import Wallets from '../Wallets';
import Settings from '../Settings';
import Pubkeys from '../Pubkeys';
import Paths from '../Paths';
import BlockchainWizard from '../BlockchainWizzard';
import KeepKey from '../../components/KeepKey';
import { NetworkIdToChain } from '@coinmasters/types';
import { COIN_MAP_LONG } from '@pioneer-platform/pioneer-coins';

ChartJS.register(ArcElement, Tooltip, Legend);

export function Pioneer({ usePioneer }: any) {
  const { state, hideModal, showModal, connectWallet, resetState } = usePioneer();
  const { app, assets, blockchains, balances, context, openModal } = state;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isWalletPaired, setIsWalletPaired] = useState(false);
  const [showAllWallets, setShowAllWallets] = useState(false);
  const [modalShowClose, setModalShowClose] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSwitchingWallet, setIsSwitchingWallet] = useState(false);
  const [walletsAvailable, setWalletsAvailable] = useState([]);
  const [walletType, setWalletType] = useState('');
  const [pioneerImage, setPioneerImage] = useState('');
  const [isPioneer, setIsPioneer] = useState(false);
  const [modalType, setModalType] = useState('');

  useEffect(() => {
    if (balances.length > 0) {
      setIsWalletPaired(true);
      setIsSyncing(false);
      setIsSwitchingWallet(false);
    }
  }, [balances]);

  const onStart = async function () {
    try {
      console.log('onStart');
      if (app && app.wallets) {
        setWalletsAvailable(app.wallets);
        connectWallet('KEEPKEY');
      }
      if (app && app.isPioneer) {
        console.log('app.isPioneer: ', app.isPioneer);
        setIsPioneer(true);
        setPioneerImage(app.isPioneer);
      }
      if (typeof window !== 'undefined') {
        const pioneerCache = window.localStorage.getItem('isPioneer');
        if (pioneerCache) {
          setIsPioneer(true);
          setPioneerImage(pioneerCache);
        }
      }
      if (balances && balances.length > 0) {
        console.log('balances: ', balances);
        setIsWalletPaired(true);
        setIsSwitchingWallet(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    onStart();
  }, [app, app?.wallets, app?.isPioneer]);

  useEffect(() => {
    if (context && app.isPioneer) {
      console.log('context: ', context);
      setWalletType(context.split(':')[0]);
      setPioneerImage(app.isPioneer);
    }
  }, [context, app, app?.isPioneer]);

  const handleWalletClick = async (wallet: string) => {
    setIsSwitchingWallet(true);
    resetState();

    console.log('Wallet not found! needs to pair now!');
    setIsSyncing(true);
    onOpen();
    setWalletType(wallet);
    setModalType(wallet);
    setModalShowClose(false);
    setIsSwitchingWallet(false);
  };

  useEffect(() => {
    if (openModal) {
      setModalType(openModal.toUpperCase());
      onOpen();
    } else {
      hideModal();
      onClose();
    }
  }, [openModal]);

  const onSelect = () => {
    console.log('onSelect called');
  };

  const handleSidebarItemClick = (index: any) => {
    setSelectedTab(index);
  };

  const closeModal = () => {
    onClose();
    hideModal();
  };

  const modalSelected = async function (modalType: string) {
    try {
      setModalType(modalType);
      onOpen();
    } catch (e) {
      console.error(e);
    }
  };

  if (!app) {
    return (
      <Center height="100vh">
        <Spinner size="xl" />
        <Text ml={4}>Loading...</Text>
      </Center>
    );
  }

  return (
    <Flex direction="column" height="100vh">
      <Modal isOpen={isOpen} onClose={() => closeModal()} size="xl">
        <ModalOverlay />
        <ModalContent bg="black">
          <ModalHeader>{modalType}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {modalType === 'KEEPKEY' && <KeepKey usePioneer={usePioneer} onClose={closeModal} />}
            {modalType === 'BLOCKCHAINS' && <Blockchains usePioneer={usePioneer} modalSelected={modalSelected} />}
            {modalType === 'BLOCKCHAIN_WIZZARD' && <BlockchainWizard usePioneer={usePioneer} />}
            {modalType === 'TRANSFER' && <Transfer usePioneer={usePioneer} />}
            {modalType === 'SELECT' && <AssetSelect usePioneer={usePioneer} onlyOwned onClose={onClose} />}
            {modalType === 'RECEIVE' && <Receive usePioneer={usePioneer} />}
            {modalType === 'WALLETS' && <Wallets usePioneer={usePioneer} handleWalletClick={handleWalletClick} />}
            {modalType === 'PORTFOLIO' && <Charts usePioneer={usePioneer} />}
            {modalType === 'SWAP' && <Swap usePioneer={usePioneer} />}
            {modalType === 'SETTINGS' && <Settings usePioneer={usePioneer} handleWalletClick={handleWalletClick} />}
            {modalType === 'TREZOR' && <div>Trezor TODO</div>}
            {modalType === 'XDEFI' && <div>Xdefi TODO</div>}
            {modalType === 'ONBOARDING' && (
              <Onboarding usePioneer={usePioneer} onClose={onClose} setModalType={setModalType} setWalletType={setWalletType} />
            )}
          </ModalBody>
          <ModalFooter>
            {modalShowClose && (
              <Button colorScheme="blue" onClick={onClose}>
                Close
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Flex width="100%" justifyContent="space-between">
        {/* Left-aligned content */}
        <Box flex="1" onClick={() => modalSelected('BLOCKCHAINS')}>
          <Flex direction="column" align="flex-start">
            <Avatar size="md" src={'https://pioneers.dev/coins/pioneerMan.png'} mb="2" />
            <AvatarGroup size="2xs" max={4}>
              {app?.blockchains.slice(0, 4).map((chain: any, index: any) => {
                const chainKey = NetworkIdToChain[chain];
                //@ts-ignore
                const imageUrl = `https://pioneers.dev/coins/${COIN_MAP_LONG[chainKey] || 'pioneer'}.png`;
                return (
                  <Avatar
                    key={index}
                    src={imageUrl}
                    name={chainKey}
                    onClick={() => modalSelected('SETTINGS')}
                  />
                );
              })}
              {app?.blockchains.length > 4 && (
                <Text pl="3" alignSelf="center">
                  +{app.blockchains.length - 4}
                </Text>
              )}
            </AvatarGroup>
          </Flex>
        </Box>

        {/* Center-aligned content */}
        <Box flex="1" textAlign="center">
          <Flex direction="column" align="center">
            <Avatar size="sm" src={app?.assetContext?.icon} mb="2" />
            <Text noOfLines={1}>{app?.assetContext?.name}</Text>
          </Flex>
        </Box>

        {/* Right-aligned content */}
        <Box flex="1" textAlign="right">
          <IconButton
            isRound
            aria-label="Settings"
            icon={<FaCog />}
            onClick={() => modalSelected('SETTINGS')}
            size="md"
          />
        </Box>
      </Flex>

      <Flex align="center" justify="center" width="100%">
        <Charts usePioneer={usePioneer} />
      </Flex>

      <Box display="flex" justifyContent="center" maxH="300px" overflowY="auto" width="100%">
        <Flex align="center" justify="center" width="100%">
          <Flex justify="center" direction="column" m={2}>
            <IconButton
              aria-label="Portfolio"
              colorScheme="green"
              icon={<FaDollarSign />}
              onClick={() => modalSelected('PORTFOLIO')}
              rounded="full"
              size="md"
              variant="solid"
            />
            <Text fontSize="xs">Portfolio</Text>
          </Flex>
          <Flex align="center" direction="column" m={2}>
            <IconButton
              aria-label="Send"
              colorScheme="green"
              icon={<FaPaperPlane />}
              onClick={() => modalSelected('TRANSFER')}
              rounded="full"
              size="md"
              variant="solid"
            />
            <Text fontSize="xs">Send</Text>
          </Flex>
          <Flex align="center" direction="column" m={2}>
            <IconButton
              aria-label="Receive"
              colorScheme="green"
              icon={<FaDownload />}
              onClick={() => modalSelected('RECEIVE')}
              rounded="full"
              size="md"
              variant="solid"
            />
            <Text fontSize="xs">Receive</Text>
          </Flex>
        </Flex>
      </Box>

      <Tabs index={selectedTab} onChange={(index) => setSelectedTab(index)}>
        <TabList>
          <Tab>Assets</Tab>
          <Tab>Blockchains</Tab>
          <Tab>Paths</Tab>
          <Tab>Pubkeys</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Assets usePioneer={usePioneer} onClose={() => console.log('onClose called')} />
          </TabPanel>
          <TabPanel>
            <Blockchains usePioneer={usePioneer} onSelect={() => console.log('onSelect called')} />
          </TabPanel>
          <TabPanel>
            <Paths usePioneer={usePioneer} />
          </TabPanel>
          <TabPanel>
            <Pubkeys usePioneer={usePioneer} />
          </TabPanel>
        </TabPanels>
      </Tabs>

    </Flex>
  );
}

export default Pioneer;
