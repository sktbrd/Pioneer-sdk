import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VStack,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

import Path from '../../components/Path';
import { usePioneer } from '../../context';
import Basic from '..//Basic';
import Blockchains from '../Blockchains';
import Paths from '../Paths';

export default function Settings() {
  const { state } = usePioneer();
  const { app } = state;
  const { isOpen, onOpen, onClose: onModalClose } = useDisclosure();
  const [selectedPubkey, setSelectedPubkey] = useState(null);
  const [copiedAddress, setCopiedAddress] = useState('');

  useEffect(() => {
    if (app?.blockchains) {
      console.log('app?.blockchains: ', app?.blockchains);
    }
  }, [app, app?.blockchains]);

  // const handlePubkeyClick = (pubkey) => {
  //   setSelectedPubkey(pubkey);
  //   onOpen();
  // };
  //
  // const handleCopy = (address) => {
  //   navigator.clipboard.writeText(address);
  //   setCopiedAddress(address);
  //   setTimeout(() => setCopiedAddress(''), 3000);
  // };

  const clearLocalStorage = (key: string) => {
    if (key === 'all') {
      localStorage.clear();
      // Reload the page to force restart the application
      window.location.reload();
    } else {
      const lastConnectedWallet = localStorage.getItem('lastConnectedWallet');
      if (key === 'walletCache' && lastConnectedWallet) {
        localStorage.removeItem(`${lastConnectedWallet}:balanceCache`);
        localStorage.removeItem(`${lastConnectedWallet}:pubkeyCache`);
      } else {
        localStorage.removeItem(key);
      }
    }
  };


  const onSelect = (pubkey: any) => {
    console.log('pubkey: ', pubkey);
  };

  return (
    <div>
      <Tabs>
        <TabList>
          <Tab>Context</Tab>
          <Tab>blockchains</Tab>
          <Tab>paths</Tab>
          <Tab>Settings</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Basic />
          </TabPanel>
          <TabPanel>
            <Blockchains onSelect={onSelect} />
          </TabPanel>
          <TabPanel>
            <Paths/>
          </TabPanel>
          <TabPanel>
            <VStack spacing={4}>
              <Button colorScheme="red" onClick={() => clearLocalStorage('all')}>Clear All Cache</Button>
              <Button onClick={() => clearLocalStorage('username')}>Clear Username</Button>
              <Button onClick={() => clearLocalStorage('queryKey')}>Clear Query Key</Button>
              <Button onClick={() => clearLocalStorage('pairedWallets')}>Clear Paired Wallets</Button>
              <Button onClick={() => clearLocalStorage('pioneerUrl')}>Clear Pioneer URL</Button>
              <Button onClick={() => clearLocalStorage('lastConnectWallet')}>Clear Last Connect Wallet</Button>
              <Button onClick={() => clearLocalStorage('lastWallet')}>Clear Last Wallet</Button>
              <Button onClick={() => clearLocalStorage('walletCache')}>Clear Wallet Cache</Button>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
      <Modal isOpen={isOpen} onClose={onModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Pubkey Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedPubkey && <Path onClose={onModalClose} path={selectedPubkey} />}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
