import { Box, Center, Flex, Text, Spinner, Button } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { PieChart } from 'react-minimal-pie-chart';

// Import the Balances and Assets components as needed
import Balances from '../../components/Balances';
import Assets from '../../components/Assets';

export function Portfolio({ usePioneer, onSelect }: any) {
  const { state, showModal } = usePioneer();
  const { balances, app } = state;
  const [showAll, setShowAll] = useState(false);
  const [lastClickedBalance, setLastClickedBalance] = useState(null);
  const [totalValueUsd, setTotalValueUsd] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);

  const handleChartClick = (event: any, data: any, dataIndex: any) => {
    const clickedAsset = chartData[dataIndex].title;
    console.log(`Clicked on asset: ${clickedAsset}`);
  };

  useEffect(() => {
    if (balances && balances.length > 0) {
      const largestBalance = balances.reduce(
        (max: any, balance: any) => (balance.valueUsd > max.valueUsd ? balance : max),
        balances[0],
      );
      setLastClickedBalance(largestBalance);
    }
  }, [balances]);

  const updateChart = () => {
    setShowAll(false);

    const filteredBalances = showAll
      ? balances
      : balances.filter((balance: any) => parseFloat(balance.valueUsd) >= 10);

    filteredBalances.sort((a: any, b: any) => parseFloat(b.valueUsd) - parseFloat(a.valueUsd));

    const totalValue = filteredBalances.reduce(
      (acc: any, balance: any) => acc + parseFloat(balance.valueUsd),
      0,
    );
    setTotalValueUsd(totalValue);

    const chartData = filteredBalances.map((balance: any) => ({
      title: balance.symbol,
      value: parseFloat(balance.valueUsd),
      percentage: ((parseFloat(balance.valueUsd) / totalValue) * 100).toFixed(2),
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    }));
    setChartData(chartData);
  };

  useEffect(() => {
    updateChart();
  }, [balances]);

  return (
    <Flex direction="column" align="center" justify="center">
      {balances.length === 0 ? (
        <Center mt="20px">
          assets: {app?.assets?.length}
          pubkeys: {app?.pubkeys?.length}
          balances: {app?.balances?.length}
          {app?.pubkeys?.length === 0 ? (
            <Button colorScheme="blue">Pair Wallets</Button>
          ) : (
            <>
              <Spinner mr="3" />
              <Text>Loading Wallet Balances...</Text>
            </>
          )}
        </Center>
      ) : (
        <div>
          <br />
          <Flex bottom="0" left="0" align="center">
            <Box height="300px" width="300px" position="relative">
              <PieChart
                data={chartData}
                onClick={handleChartClick}
                animate
                radius={42}
                lineWidth={20}
                segmentsShift={(index) => (index === 0 ? 6 : 0)}
                label={({ dataEntry }) => `${dataEntry.percentage} %`}
                labelPosition={112}
                labelStyle={{
                  fontSize: '5px',
                  fontFamily: 'sans-serif',
                }}
              />
              <Center bottom="0" left="0" position="absolute" right="0" top="0">
                <Text fontSize="lg" fontWeight="bold" textAlign="center">
                  Total Value: {totalValueUsd.toFixed(2)}
                </Text>
              </Center>
            </Box>
            <Box ml="20px">
              <Text fontWeight="bold" mb="10px">Legend</Text>
              {chartData.map((entry, index) => (
                <Flex key={index} align="center" mb="5px">
                  <Box width="20px" height="20px" backgroundColor={entry.color} mr="10px" />
                  <Text>{entry.title}: {entry.percentage}%</Text>
                </Flex>
              ))}
            </Box>
          </Flex>
        </div>
      )}
    </Flex>
  );
}

export default Portfolio;
