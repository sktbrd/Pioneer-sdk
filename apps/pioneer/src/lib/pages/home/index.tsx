/*
    Pioneer Template
 */

import { useDisclosure } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import Balances from '../../components/Balances';
import Basic from '../../components/Basic';
import Blockchains from '../../components/Blockchains';
import Earn from '../../components/Earn';
import Loan from '../../components/Loan';
import Paths from '../../components/Paths';
// import OutputSelect from "lib/components/OutputSelect";
// import BlockchainSelect from "lib/components/BlockchainSelect";
// import WalletSelect from "lib/components/WalletSelect";
import Pending from '../../components/Pending';
import Pubkeys from '../../components/Pubkeys';
import Swap from '../../components/Swap';
import Track from '../../components/Track';
import Transfer from '../../components/Transfer';
import { usePioneer } from '../../context';

import { initWallets } from './setup';

const Home = () => {
  const { txid } = useParams<{ txid?: string }>();
  const { intent } = useParams<{ intent?: string }>();
  const { state, onStart } = usePioneer();
  const { pubkeyContext, app } = state;
  const [address, setAddress] = useState('');
  const [modalType, setModalType] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();

  // start the context provider
  useEffect(() => {}, [intent]);

  // start the context provider
  useEffect(() => {
    initWallets(onStart);
  }, []);

  useEffect(() => {
    if (pubkeyContext) setAddress(pubkeyContext?.master || pubkeyContext?.pubkey || pubkeyContext);
  }, [pubkeyContext]);

  const openModal = (type: any) => {
    setModalType(type);
    onOpen();
  };

  const onSelect = async (blockchain: any) => {
    // select asset
    console.log('blockchain: ', blockchain);
    // open blockchain modal
    // connect wallet with just this blockchain
    try {
      await app.pairWallet('KEEPKEY', ['eip155:1', blockchain]);
      await app.getPubkeys();
      await app.getBalances();
    } catch (error) {
      console.error('Error in onSelect:', error);
      // Handle or report error
    }
  };

  /*
      Pioneer Intent Format
  
   */

  // Function to determine which component to render based on intent
  const renderComponent = () => {
    console.log('intent: ', intent);
    let params = intent.split(':');
    let intentType = params[0];
    //parse intent and get props
    let txHash = params[1];
    switch (intentType) {
      case 'track':
        return <Track txHash={txHash} />;
      case 'basic':
        return <Basic />;
      case 'blockchains':
        return <Blockchains onSelect={onSelect} />;
      case 'paths':
        return <Paths />;
      case 'pubkeys':
        return <Pubkeys />;
      case 'balances':
        return <Balances />;
      case 'pending':
        return <Pending />;
      case 'transfer':
        return <Transfer openModal={openModal} />;
      case 'swaps':
        return <Swap />;
      case 'earn':
        return <Earn />;
      case 'loan':
        return <Loan />;
      // Add additional cases as necessary
      default:
        return <div>No valid intent selected</div>;
    }
  };

  return (
    <div>
      {intent && (
        <div>
          intent: {intent}
          {renderComponent()}
        </div>
      )}
      {/*<Modal isOpen={isOpen} onClose={() => onClose()} size="xl">*/}
      {/*  <ModalOverlay />*/}
      {/*  <ModalContent>*/}
      {/*    <ModalHeader>{modalType}</ModalHeader>*/}
      {/*    <ModalCloseButton />*/}
      {/*    <ModalBody>*/}
      {/*      /!* Render content based on modalType *!/*/}
      {/*      /!* {modalType === "Select wallet" && ( *!/*/}
      {/*      /!*  <div> *!/*/}
      {/*      /!*    <WalletSelect onClose={onClose}></WalletSelect> *!/*/}
      {/*      /!*  </div> *!/*/}
      {/*      /!* )} *!/*/}
      {/*      {modalType === 'Select Asset' && (*/}
      {/*        <div>*/}
      {/*          <AssetSelect onlyOwned onClose={onClose} />*/}
      {/*        </div>*/}
      {/*      )}*/}
      {/*      /!* {modalType === "Select Blockchain" && ( *!/*/}
      {/*      /!*  <div> *!/*/}
      {/*      /!*    <BlockchainSelect onClose={onClose}></BlockchainSelect> *!/*/}
      {/*      /!*  </div> *!/*/}
      {/*      /!* )} *!/*/}
      {/*      /!* {modalType === "View Address" && ( *!/*/}
      {/*      /!*  <div> *!/*/}
      {/*      /!*    {JSON.stringify(pubkeyContext)} address: {address} *!/*/}
      {/*      /!*  </div> *!/*/}
      {/*      /!* )} *!/*/}
      {/*      /!* {modalType === "Select Outbound" && ( *!/*/}
      {/*      /!*  <div> *!/*/}
      {/*      /!*    <OutputSelect onClose={onClose} onlyOwned={false}></OutputSelect> *!/*/}
      {/*      /!*  </div> *!/*/}
      {/*      /!* )} *!/*/}
      {/*    </ModalBody>*/}
      {/*    <ModalFooter>*/}
      {/*      <Button colorScheme="blue" onClick={onClose}>*/}
      {/*        Close*/}
      {/*      </Button>*/}
      {/*    </ModalFooter>*/}
      {/*  </ModalContent>*/}
      {/*</Modal>*/}
      {/*{address}*/}
      {/*<Tabs>*/}
      {/*  <TabList>*/}
      {/*    <Tab>Context</Tab>*/}
      {/*    <Tab>blockchains</Tab>*/}
      {/*    <Tab>paths</Tab>*/}
      {/*    <Tab>pubkeys</Tab>*/}
      {/*    <Tab>balances</Tab>*/}
      {/*    <Tab>Pending</Tab>*/}
      {/*    <Tab>Transfer</Tab>*/}
      {/*    <Tab>Swaps</Tab>*/}
      {/*    <Tab>Earn</Tab>*/}
      {/*    <Tab>Borrow</Tab>*/}
      {/*  </TabList>*/}

      {/*  <TabPanels>*/}
      {/*    <TabPanel>*/}
      {/*      <Basic />*/}
      {/*    </TabPanel>*/}
      {/*    <TabPanel>*/}
      {/*      <Blockchains onSelect={onSelect} />*/}
      {/*    </TabPanel>*/}
      {/*    <TabPanel>*/}
      {/*      <Paths />*/}
      {/*    </TabPanel>*/}
      {/*    <TabPanel>*/}
      {/*      <Pubkeys />*/}
      {/*    </TabPanel>*/}
      {/*    <TabPanel>*/}
      {/*      <Balances />*/}
      {/*    </TabPanel>*/}
      {/*    <TabPanel>*/}
      {/*      <Pending />*/}
      {/*    </TabPanel>*/}
      {/*    <TabPanel>*/}
      {/*      <Transfer openModal={openModal} />*/}
      {/*    </TabPanel>*/}
      {/*    <TabPanel>*/}
      {/*      <Swap />*/}
      {/*    </TabPanel>*/}
      {/*    <TabPanel>*/}
      {/*      <Earn />*/}
      {/*    </TabPanel>*/}
      {/*    <TabPanel>*/}
      {/*      <Loan />*/}
      {/*    </TabPanel>*/}
      {/*  </TabPanels>*/}
      {/*</Tabs>*/}
    </div>
  );
};

export default Home;
