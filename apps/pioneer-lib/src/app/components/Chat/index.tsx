import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  HStack,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Flex,
  IconButton,
  Card,
  useClipboard,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
} from '@chakra-ui/react';
import { useInferenceChat } from './inference';
// @ts-ignore

import Basic from '../Basic';
import Portfolio from '../Portfolio';
import Pioneer from '../Pioneer';
import Charts from '../Charts';
import Asset from '../Asset';
import Transfer from '../Transfer';
import Swap from '../Swap';

export function Chat({ usePioneer, networkId }: any) {
  const { state } = usePioneer();
  const { app } = state;

  const { conversation, input, setInput, submitMessage, selectedComponent } = useInferenceChat(usePioneer);

  const [loading, setLoading] = useState(false);

  let onStart = async function () {
    try{
      await app?.setAssetContext(null);
    }catch(e){
      console.error(e);
    }
  }
  useEffect(() => {
    onStart();
  }, [app]);

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

  return (
    <div>
      <br />
      {renderComponent()}

      <Tabs>
        <TabList>
          <Tab>Chat</Tab>
          <Tab>Basic Component</Tab>
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
              <Asset usePioneer={usePioneer} onClose={onClose} asset={app?.assetContext}/>
            )}
          </TabPanel>
          <TabPanel>
            <Basic usePioneer={usePioneer}/>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}

export default Chat;
