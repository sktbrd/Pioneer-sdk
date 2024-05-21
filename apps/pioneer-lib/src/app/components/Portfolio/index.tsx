import { Box, Center, Flex, Text, Spinner, Button } from '@chakra-ui/react';
import React, { useEffect, useState, useRef } from 'react';
import { PieChart } from 'react-minimal-pie-chart';

// Import the Balances and Assets components as needed
import Balances from '../../components/Balances';
import Assets from '../../components/Assets';
import Asset from '../../components/Asset';
import { usePioneer } from '@coinmasters/pioneer-react';

export function Portfolio({ usePioneer }: any) {
  const { state, showModal } = usePioneer();
  const { balances, app } = state;
  const [showAll, setShowAll] = useState(false);
  const [showAssetPage, setShowAssetPage] = useState(false);
  const [lastClickedBalance, setLastClickedBalance] = useState(null);
  const [totalValueUsd, setTotalValueUsd] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const chartRef = useRef<any>(null);

  const handleChartClick = (event: any) => {
    const canvas = chartRef.current;
    if (canvas) {
      const { left, top } = canvas.getBoundingClientRect();
      const x = event.clientX - left;
      const y = event.clientY - top;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY);
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < radius) {
        const angle = Math.atan2(dy, dx) + Math.PI / 2;
        let startAngle = 0;

        for (let i = 0; i < chartData.length; i++) {
          const endAngle = startAngle + (chartData[i].value / 100) * 2 * Math.PI;
          if (angle >= startAngle && angle < endAngle) {
            console.log(`Clicked on asset: ${chartData[i].title}`);
            return;
          }
          startAngle = endAngle;
        }
      }
    }
  };

  const handleLegendClick = (index: number) => {
    const clickedLegend = chartData[index].title;
    console.log(`Clicked on legend entry: ${clickedLegend}`);
    console.log(`Clicked on legend entry: ${chartData[index].caip}`);
    if (chartData[index].caip) {
      console.log('Clicked on legend entry:',chartData[index]);
      let result = app.setAssetContext(chartData[index]);
      console.log('result:', result);
      setShowAssetPage(true);
    }
  };

  const onSelect = (asset: any) => {
    console.log('Selected asset:', asset);
    let result = app.setAssetContext(asset);
    console.log('result:', asset);
    setShowAssetPage(true);
  }

  useEffect(() => {
    if (app && app?.assetContext) {
      console.log('Asset context:', app.assetContext);
      setShowAssetPage(true);
    } else {
      console.log('Asset context NULL');
      setShowAssetPage(false);
    }
  }, [app]);

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
      caip: balance.caip,
      context: balance.context,
      value: ((parseFloat(balance.valueUsd) / totalValue) * 100),
      percentage: ((parseFloat(balance.valueUsd) / totalValue) * 100).toFixed(2),
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    }));
    setChartData(chartData);
  };

  const onClose = () => {
    setShowAssetPage(false);
  }

  useEffect(() => {
    updateChart();
  }, [balances]);

  return (
    <Center>
      <Flex direction="column" align="center" justify="center" width="100%" maxWidth="1200px">
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
          <Center>
            <div>
              {showAssetPage ? (
                <>
                  <Asset usePioneer={usePioneer} asset={app?.assetContext} onClose={onClose}></Asset>
                </>
              ) : (
                <>
                  <br />
                  <Flex bottom="0" left="0" align="center">
                    <Box height="300px" width="300px" position="relative" onClick={handleChartClick}>
                      <PieChart
                        data={chartData}
                        // ref={chartRef}
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
                      <Center bottom="0" left="0" position="absolute" right="8" top="0">
                        <Text fontSize="lg" fontWeight="bold" textAlign="center">
                          Total Value: <br />{totalValueUsd.toFixed(2)}
                        </Text>
                      </Center>
                    </Box>
                    <Box ml="20px">
                      <Text fontWeight="bold" mb="10px">Legend</Text>
                      {chartData.map((entry, index) => (
                        <Flex
                          key={index}
                          align="center"
                          mb="5px"
                          onClick={() => handleLegendClick(index)}
                          style={{ cursor: 'pointer' }}  // Change cursor to pointer for better UX
                        >
                          <Box width="20px" height="20px" backgroundColor={entry.color} mr="10px" />
                          <Text
                            width="100px"
                            whiteSpace="nowrap"
                            overflow="hidden"
                            textOverflow="ellipsis"
                          >
                            {entry.title}: {entry.percentage}%
                          </Text>
                        </Flex>
                      ))}
                    </Box>
                  </Flex>
                  <Balances usePioneer={usePioneer} onSelect={onSelect}></Balances>
                </>
              )}
            </div>
          </Center>
        )}
      </Flex>
    </Center>
  );
}

export default Portfolio;
