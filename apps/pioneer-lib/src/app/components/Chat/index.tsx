import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  HStack,
  Input,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  Card,
  Avatar
} from '@chakra-ui/react';
import { useInferenceChat } from './inference';
import Basic from '../Basic';
import Portfolio from '../Portfolio';
import Pioneer from '../Pioneer';
import Charts from '../Charts';
import Asset from '../Asset';
import Transfer from '../Transfer';
import Swap from '../Swap';
import Settings from '../Settings';
import { Index } from './Copy';

const PIONEER_CHAT_STATES = [
  'Not connected to wallet',
  'Connected to wallet locally (paths/pubkeys)',
  'Connected to wallet remotely (balances/transactions)',
  'Get Quests',
  'Select quests',
  'Perform quest',
  'Review quest'
];

export function Chat({ usePioneer, networkId }: any) {
  const { state, connectWallet } = usePioneer();
  const { app, assets, blockchains } = state;
  const [isPioneer, setIsPioneer] = useState(false);
  const [pioneerImage, setPioneerImage] = useState('');
  const [pioneerState, setPioneerState] = useState(0);
  const { conversation, input, setInput, submitMessage, selectedComponent } = useInferenceChat(usePioneer);
  const [loading, setLoading] = useState(false);

  const logState = () => {
    console.log('pioneerState:', pioneerState);
    console.log('app:', app);
    console.log('app?.paths:', app?.paths);
    console.log('app?.pubkeys:', app?.pubkeys);
    console.log('app?.balances:', app?.balances);
    console.log('assets:', assets);
    console.log('blockchains:', blockchains);
  };

  const onStart = async () => {
    try {
      console.log('onStart called');
      await app?.setAssetContext(null);
      await connectWallet('KEEPKEY');
      await app.getPubkeys();
      await app.getBalances();
    } catch (e) {
      console.error('onStart error:', e);
    }
  };

  useEffect(() => {
    onStart();
  }, [app]);

  useEffect(() => {
    onStart();
  }, [app, app?.assetContext]);

  const checkOfflineWallet = async () => {
    try {
      console.log('checkOfflineWallet called');
      if (app?.paths.length > 0 && app?.pubkeys.length > 0) {
        setPioneerState(1);
        console.log('pioneerState set to 1');
      }
    } catch (e) {
      console.error('checkOfflineWallet error:', e);
    }
  };

  useEffect(() => {
    checkOfflineWallet();
  }, [app, app?.paths, app?.pubkeys, assets]);

  const checkOnlineWallet = async () => {
    try {
      console.log('checkOnlineWallet called');
      if (app?.balances.length > 0) {
        setPioneerState(2);
        console.log('pioneerState set to 2');
      }

      //getPioneer
      let ethPubkey = app.pubkeys.filter((e: any) => e.networks.includes('eip155:*'));
      console.log('ethPubkey:', ethPubkey);
      let ethAddress = ethPubkey[0].address;
      console.log('ethAddress:', ethAddress);
      let pioneerInfo = await app.pioneer.GetPioneer({address: ethAddress});
      pioneerInfo = pioneerInfo.data
      console.log('pioneerInfo:', pioneerInfo);
      if (pioneerInfo.isPioneer) {
        setPioneerState(3);
        console.log('pioneerState set to 3');
        setIsPioneer(true)
        setPioneerImage(pioneerInfo.image)
      }
    } catch (e) {
      console.error('checkOnlineWallet error:', e);
    }
  };

  useEffect(() => {
    checkOnlineWallet();
  }, [app, app?.paths, app?.balances, blockchains]);

  useEffect(() => {
    logState();
  }, [pioneerState, app, app?.paths, app?.pubkeys, app?.balances, assets, blockchains]);

  const renderComponent = () => {
    switch (selectedComponent) {
      case 'Asset':
        return <Asset usePioneer={usePioneer} />;
      case 'Transfer':
        return <Transfer usePioneer={usePioneer} />;
      case 'Swap':
        return <Swap usePioneer={usePioneer} />;
      case 'Pioneer':
        return <Pioneer usePioneer={usePioneer} />;
      case 'Portfolio':
        return <Charts usePioneer={usePioneer} />;
      default:
        return <div></div>;
    }
  };

  const onClose = async () => {
    console.log("onClose");
    await app?.setAssetContext(null);
    console.log('app.assetContext', app?.assetContext);
  };

  const handleSubmitMessage = async (message: string) => {
    setLoading(true);
    await app?.setAssetContext(null);
    await submitMessage(message);
    setLoading(false);
  };

  const handleNextState = () => {
    setPioneerState((prev) => (prev + 1) % PIONEER_CHAT_STATES.length);
  };

  return (
    <div>
      <Text>pioneerState: ({pioneerState}) {PIONEER_CHAT_STATES[pioneerState]}</Text>
      {renderComponent()}

      {pioneerState === 0 && (
        <div>Connect Wallet to continue...</div>
      )}

      {pioneerState >= 2 && (
        isPioneer ? (
            <div>
              <Avatar src={pioneerImage} size={'xl'}></Avatar>
              <Tabs>
                <TabList>
                  <Tab>Chat</Tab>
                  <Tab>Settings</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <Box>
                      {conversation.slice(-10).map((msg: any, index: any) => (
                        <div key={index}>
                          <Card key={index}>
                            <Box p={4}>
                              <Text>{msg.role === 'user' ? 'User' : 'Assistant'}: {msg.content}</Text>
                            </Box>
                          </Card>
                          <br />
                        </div>
                      ))}
                    </Box>
                    <br />
                    <HStack spacing={4}>
                      <Input
                        placeholder="Type your message here..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                      />
                      <Button onClick={() => handleSubmitMessage(input)} disabled={loading}>
                        {loading ? <Spinner size="sm" /> : 'Send'}
                      </Button>
                    </HStack>
                    {app && app.assetContext && (
                      <Asset usePioneer={usePioneer} onClose={onClose} asset={app?.assetContext} />
                    )}
                  </TabPanel>
                  <TabPanel>
                    <Settings usePioneer={usePioneer} />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </div>
        ) : (
          <>Buy an NFT<Index></Index></>
        )
      )}
    </div>
  );
}

export default Chat;
