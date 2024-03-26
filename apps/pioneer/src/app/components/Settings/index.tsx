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
import { usePioneer } from '@coinmasters/pioneer-react';
import Basic from '..//Basic';
import Blockchains from '../Blockchains';
import Paths from '../Paths';
import Pubkeys from '../Pubkeys';
import Cache from '../Storage';

export default function Settings() {
  const { state } = usePioneer();
  const { app } = state;
  const { isOpen, onOpen, onClose: onModalClose } = useDisclosure();

  useEffect(() => {
    if (app?.blockchains) {
      //console.log('app?.blockchains: ', app?.blockchains);
    }
  }, [app, app?.blockchains]);


  const onSelect = (pubkey: any) => {
    //console.log('blockchain: ', pubkey);
  };

  return (
    <div>
      <Tabs>
        <TabList>
          <Tab>Context</Tab>
          <Tab>blockchains</Tab>
          <Tab>paths</Tab>
          <Tab>pubkeys</Tab>
          <Tab>cache</Tab>
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
            <Pubkeys/>
          </TabPanel>
          <TabPanel>
            <Cache/>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}
