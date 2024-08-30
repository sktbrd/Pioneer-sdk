/*
    Portfolio component
 */

import { Box, Center, Flex, Text, Spinner, Button } from '@chakra-ui/react';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';

// Adjust the import path according to your file structure
import Balances from '../../components/Balances';
import Assets from '../../components/Assets';

// Register the necessary plugins for Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

export function Charts({usePioneer}: any) {
  const { state, showModal } = usePioneer();
  const { app } = state;
  const balances = app.balances || [];
  const [showAll, setShowAll] = useState(false);
  const [lastClickedBalance, setLastClickedBalance] = useState(null);
  const [activeSegment, setActiveSegment] = useState(null);
  const [totalValueUsd, setTotalValueUsd] = useState(0);
  const [chartData, setChartData] = useState({
    datasets: [],
    labels: [],
  });

  const handleChartClick = (event: any, elements: any) => {
    if (elements.length > 0) {
      const elementIndex = elements[0].index;
      const clickedAsset = balances[elementIndex];
    }
  };

  const options: any = {
    responsive: true,
    onClick: handleChartClick,
    cutout: '75%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {},
    },
    maintainAspectRatio: false,
  };

  // Initialize lastClickedBalance with the largest asset
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

    const chartData = filteredBalances.map(
      (balance: any) => (parseFloat(balance.valueUsd) / totalValue) * 100,
    );
    const chartLabels = filteredBalances.map((balance: any) => balance.symbol);

    const chartColors = filteredBalances.map(
      () => `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    );
    const dataSet: any = {
      datasets: [
        {
          data: chartData,
          backgroundColor: chartColors,
          hoverBackgroundColor: chartColors.map((color: any) => `${color}B3`),
          borderColor: 'white',
          borderWidth: 2,
        },
      ],
      labels: chartLabels,
    };
    setChartData(dataSet);
  };

  let onSelect = (balance: any) => {
    console.log('balance: ', balance);
  };

  let onClose = (param: any) => {
    console.log('param: ', param);
  };

  useEffect(() => {
    updateChart();
  }, [balances]);

  return (
    <Flex direction="column" align="center" justify="center">
      {/* Balances Component or Loading Spinner */}
      {balances.length === 0 ? (
        <Center mt="20px">
          assets: {app?.assets?.length}
          pubkeys: {app?.pubkeys?.length}
          balances: {app?.balances?.length}

          {app?.pubkeys?.length === 0 ? (
            <Button colorScheme="blue">
              Pair Wallets
            </Button>
          ) : (
            <>
              <Spinner mr="3" />
              <Text>Loading Wallet Balances...</Text>
            </>
          )}
        </Center>
      ) : (
        <div>
          {/* Doughnut Chart */}
          <Center bottom="0" left="0">
            <Box height="100px" width="100px" position="relative">
              <Doughnut data={chartData} options={options} />
            </Box>
              <Center>
            <Text fontSize="lg" fontWeight="bold" >
              Total Value:
              <br/>{totalValueUsd.toFixed(2)}
            </Text>
              </Center>
          </Center>
        </div>
      )}
    </Flex>
  );
}

export default Charts;
