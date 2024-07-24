import { Box, Flex, Text, Spinner, Tabs, TabList, Tab, TabPanels, TabPanel, VStack, Center } from '@chakra-ui/react';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { FaChartPie, FaPaperPlane, FaInbox, FaExchangeAlt } from 'react-icons/fa';

import Charts from '../../components/Charts';
import Balances from '../../components/Balances';
import Assets from '../../components/Assets';
import Blockchains from '../Blockchains';
import Transfer from '../Transfer';
import Receive from '../Receive';
import Swap from '../Swap';
import Wallets from '../Wallets';
import Pubkeys from '../Pubkeys';
import Paths from '../Paths';

ChartJS.register(ArcElement, Tooltip, Legend);

export function Portfolio({ usePioneer }: any) {
  const { state, showModal, connectWallet } = usePioneer();
  const { app, assets, blockchains } = state;
  const [showAll, setShowAll] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);

  let onStart = async function () {
    if (app && app.pairWallet && !isConnecting) {
      console.log('App loaded... connecting');
      await connectWallet('KEEPKEY');
      setIsConnecting(true);

      await app.getPubkeys();
      await app.getBalances();
    } else {
      console.log('App not loaded yet... cannot connect');
    }
  };

  useEffect(() => {
    onStart();
  }, [app, app?.assetContext, assets]);

  const onSelect = () => {
    console.log('onSelect called');
  };

  const handleSidebarItemClick = (index: any) => {
    setSelectedTab(index);
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
    <Flex direction="row" height="100vh">
      <Box width="250px" bg="gray.700" color="white" p={5}>
        <VStack align="start" spacing={5}>
          <Text fontSize="xl" onClick={() => handleSidebarItemClick(0)}>Portfolio</Text>
          <Text fontSize="xl" onClick={() => handleSidebarItemClick(1)}>Send</Text>
          <Text fontSize="xl" onClick={() => handleSidebarItemClick(2)}>Receive</Text>
          <Text fontSize="xl" onClick={() => handleSidebarItemClick(3)}>Swap</Text>
        </VStack>
      </Box>

      <Flex direction="column" align="flex-start" justify="flex-start" flex="1" p={5}>
        <Tabs index={selectedTab} onChange={(index) => setSelectedTab(index)}>
          <TabPanels>
            <TabPanel>
              <Flex direction="column" width="100%">
                <Charts usePioneer={usePioneer} />
                <Box display="flex" justifyContent="center" maxH="300px" overflowY="auto" width="100%">
                  <Tabs width="100%">
                    <TabList>
                      <Tab><FaChartPie />Assets</Tab>
                      <Tab><FaChartPie />Blockchains</Tab>
                      <Tab><FaChartPie />Paths</Tab>
                      <Tab><FaChartPie />Pubkeys</Tab>
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
                </Box>
              </Flex>
            </TabPanel>
            <TabPanel>
              <Transfer usePioneer={usePioneer} />
            </TabPanel>
            <TabPanel>
              <Receive usePioneer={usePioneer} />
            </TabPanel>
            <TabPanel>
              <Swap usePioneer={usePioneer} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Flex>
    </Flex>
  );
}

export default Portfolio;
