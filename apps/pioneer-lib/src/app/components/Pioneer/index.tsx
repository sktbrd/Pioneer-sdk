'use client';
import {
  Avatar,
  AvatarBadge,
  Box,
  Button,
  Card,
  CardBody,
  CircularProgress,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
  Spacer,
  Spinner,
  Stack,
  AvatarGroup,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { FaCog, FaDownload, FaExchangeAlt, FaPaperPlane, FaRegMoneyBillAlt } from 'react-icons/fa';
import { availableChainsByWallet, ChainToNetworkId, getChainEnumValue, NetworkIdToChain } from '@coinmasters/types';
//@ts-ignore
import { COIN_MAP_LONG } from '@pioneer-platform/pioneer-coins';
import AssetSelect from '../../components/AssetSelect';
import Assets from '../../components/Assets';
import KeepKey from '../../components/KeepKey';
import Ledger from '../../components/Ledger';
import Evm from '../../components/Evm';
import WalletConnect from '../../components/WalletConnect';
import MetaMask from '../../components/MetaMask';
// import MiddleEllipsis from '../../components/MiddleEllipsis';
import Asset from '../../components/Asset';
import Blockchains from '../../components/Blockchains';
import BlockchainWizard from '../../components/BlockchainWizzard';
import Onboarding from '../../components/Onboarding';
import Portfolio from '../../components/Portfolio';
import Receive from '../../components/Receive';
import Settings from '../../components/Settings';
import Balances from '../../components/Balances';
import Swap from '../../components/Swap';
import Transfer from '../../components/Transfer';
import Wallets from '../../components/Wallets';
import {
  getWalletBadgeContent,
  getWalletContent,
  pioneerImagePng,
} from '../WalletIcon';
import { usePioneer } from '@coinmasters/pioneer-react';
// import { usePioneer } from '@coinmasters/pioneer-react';

export interface PioneerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function Pioneer({ children, usePioneer }: any): JSX.Element {
  const { state, hideModal, resetState, connectWallet } = usePioneer();
  const { api, app, balances, context, openModal } = state;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isWalletPaired, setIsWalletPaired] = useState(false);
  const [showAllWallets, setShowAllWallets] = useState(false);
  const [modalShowClose, setModalShowClose] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [modalType, setModalType] = useState('');
  //const [pairedWallets, setPairedWallets] = useState([]);
  const [walletsAvailable, setWalletsAvailable] = useState([]);
  const [walletType, setWalletType] = useState('');
  const [pioneerImage, setPioneerImage] = useState('');
  // const [context, setContext] = useState('');
  const [isPioneer, setIsPioneer] = useState(false);
  const [isSwitchingWallet, setIsSwitchingWallet] = useState(false);

  useEffect(() => {
    if (openModal) {
      setModalType(openModal.toUpperCase());
      onOpen();
    } else {
      hideModal();
      onClose();
    }
  }, [openModal]);

  const toggleShowAllWallets = (e: any) => {
    e.stopPropagation();
    setShowAllWallets(!showAllWallets);
  };

  useEffect(() => {
    if (context) {
      console.log('context: ', context);
      setWalletType(context.split(':')[0]);
    }
  }, [context, app]);

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
        //find last connected wallet

        //if keepkey available, use keepkey
        connectWallet('KEEPKEY')
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

  const modalSelected = async function (modalType: string) {
    try {
      setModalType(modalType);
      onOpen();
    } catch (e) {
      console.error(e);
    }
  };

  const avatarContent = api ? (
    getWalletBadgeContent(walletType)
  ) : (
    <AvatarBadge bg="red.500" boxSize="1em">
      <CircularProgress isIndeterminate color="white" size="1em" />
    </AvatarBadge>
  );

  const closeModal = () => {
    onClose();
    hideModal();
  };

  const onConnectPress = async () => {
    try {
      setIsSyncing(true);
      setModalShowClose(true);
      let pioneerUrl = window.localStorage.getItem('pioneerUrl');
      if (balances.length === 0 && !pioneerUrl) {
        setModalType('ONBOARDING');
        onOpen();
      } else {
        setModalType('WALLETS');
        onOpen();
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div>
      <Modal isOpen={isOpen} onClose={() => closeModal()} size="xl">
        <ModalOverlay />
        <ModalContent bg="black">
          <ModalHeader>{modalType}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Render content based on modalType */}
            {modalType === 'KEEPKEY' && (
              <div>
                <KeepKey usePioneer={usePioneer} onClose={closeModal} />
              </div>
            )}
            {modalType === 'METAMASK' && (
              <div>
                <MetaMask usePioneer={usePioneer} onClose={onClose} />
              </div>
            )}
            {modalType === 'LEDGER' && (
              <div>
                <Ledger usePioneer={usePioneer} />
              </div>
            )}
            {modalType === 'EVM' && (
              <div>
                <Evm usePioneer={usePioneer} />
              </div>
            )}
            {modalType === 'WALLETCONNECT' && (
              <div>
                <WalletConnect usePioneer={usePioneer} />
              </div>
            )}
            {modalType === 'BLOCKCHAINS' && (
              <div>
                <Blockchains usePioneer={usePioneer} modalSelected={modalSelected}/>
              </div>
            )}
            {modalType === 'BLOCKCHAIN_WIZZARD' && (
              <div>
                <BlockchainWizard usePioneer={usePioneer}/>
              </div>
            )}
            {modalType === 'TRANSFER' && (
              <div>
                <Transfer usePioneer={usePioneer} />
              </div>
            )}
            {modalType === 'SELECT' && (
              <div>
                <AssetSelect usePioneer={usePioneer} onlyOwned onClose={onClose} />
              </div>
            )}
            {modalType === 'RECEIVE' && (
              <div>
                <Receive usePioneer={usePioneer}/>
              </div>
            )}
            {modalType === 'WALLETS' && (
              <div>
                <Wallets usePioneer={usePioneer} handleWalletClick={handleWalletClick} />
              </div>
            )}
            {modalType === 'PORTFOLIO' && (
              <div>
                <Portfolio usePioneer={usePioneer}/>
              </div>
            )}
            {modalType === 'SWAP' && (
              <div>
                <Swap usePioneer={usePioneer}/>
              </div>
            )}
            {modalType === 'SETTINGS' && (
              <div>
                <Settings usePioneer={usePioneer} handleWalletClick={handleWalletClick}/>
              </div>
            )}
            {modalType === 'TREZOR' && <div>Trezor TODO</div>}
            {modalType === 'XDEFI' && <div>Xdefi TODO</div>}
            {modalType === 'ONBOARDING' && (
              <Onboarding
                usePioneer={usePioneer}
                onClose={onClose}
                setModalType={setModalType}
                setWalletType={setWalletType}
              />
            )}
          </ModalBody>
          <ModalFooter>
            {modalShowClose ? (
              <div>
                <Button colorScheme="blue" onClick={onClose}>
                  Close
                </Button>
              </div>
            ) : (
              <div />
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
      {!isWalletPaired ? (
        <Button onClick={() => onConnectPress()} colorScheme="blue" borderRadius="full">
          {isSyncing ? (
            <Spinner />
          ) : (
            'Connect Wallet'
          )}
        </Button>
      ) : (
        <Menu closeOnSelect={false}>
          <MenuButton as={Button} cursor="pointer" minW={100} rounded="full" variant="link">
            <Avatar size="md">
              {isSwitchingWallet ? (
                <Box display="inline-block" position="relative">
                  <Avatar size="md" src={pioneerImage} />
                  <CircularProgress
                    isIndeterminate
                    color="green.500"
                    left="50%"
                    position="absolute"
                    size="1.25em"
                    top="50%"
                    transform="translate(-50%, -50%)"
                  />
                </Box>
              ) : (
                <Avatar size="md" src='/png/pioneer.png'>
                  {avatarContent}
                </Avatar>
              )}
            </Avatar>
          </MenuButton>
          <MenuList>
            <MenuItem>
                  {/* Left-aligned content */}
                  <Box flex="1"
                       onClick={() => modalSelected('BLOCKCHAINS')}>
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
            </MenuItem>
            <MenuItem>
              <Flex align="center" justify="center" width="100%">
                <Portfolio usePioneer={usePioneer} />
              </Flex>
            </MenuItem>
            <MenuItem>
              <Flex align="center" justify="center" width="100%">
                  <Flex justify="center" direction="column" m={2}>
                    <IconButton
                      aria-label="Portfolio"
                      colorScheme="green"
                      icon={<FaRegMoneyBillAlt />}
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
            </MenuItem>
            <MenuItem>
              <Box display="flex" justifyContent="center" maxH="300px" overflowY="auto">
                <Tabs justifyContent="center">
                  <TabList justifyContent="center">
                    <Tab>Assets</Tab>
                    <Tab>NFTs</Tab>
                    <Tab>Activity</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                      <Assets usePioneer={usePioneer} onClose={onClose} />
                    </TabPanel>
                    <TabPanel>
                      <Box>
                        <Text>NFTs content</Text>
                      </Box>
                    </TabPanel>
                    <TabPanel>
                      <Text>History</Text>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
            </MenuItem>
          </MenuList>
        </Menu>
      )}
    </div>
  );
};

export default Pioneer;
