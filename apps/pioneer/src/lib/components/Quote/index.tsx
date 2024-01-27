import { COIN_MAP_LONG } from '@pioneer-platform/pioneer-coins';

let quote = {"integration":"changelly","quote":{"steps":1,"complete":true,"meta":{"quoteMode":"CHANGELLY"},"id":"c5ul5u69scltqpom","amountOut":"0.29349565","inboundAddress":"bc1qzhzlqegga7rwc9xjm8cydcm3g2uhp35gxq48dd","tx":{"type":"transfer","chain":"bip122:000000000019d6689c085ae165831e93","txParams":{"address":"bc1qzhzlqegga7rwc9xjm8cydcm3g2uhp35gxq48dd","amount":"0.00171","memo":null}},"raw":{"id":"c5ul5u69scltqpom","apiExtraFee":"0.01","changellyFee":"0.4","payinExtraId":null,"amountExpectedFrom":"0.00171","status":"new","currencyFrom":"btc","currencyTo":"bch","amountTo":"0.00000000","amountExpectedTo":"0.29349565","payinAddress":"bc1qzhzlqegga7rwc9xjm8cydcm3g2uhp35gxq48dd","payoutAddress":"bitcoincash:qzfzukmpry8y4mdp6xz7cy65eagtwhajzvj749257p","createdAt":"2024-01-27T22:37:27.000Z","redirect":null,"kycRequired":false,"signature":null,"binaryPayload":null},"sellAsset":"bip122:000000000019d6689c085ae165831e93/slip44:0","sellAmount":"0.00171","buyAsset":"bip122:000000000000000000651ef99cb9fcbe/slip44:145","buyAmount":"0.29349565","proTokenEarned":7.155153,"proTokenEarnedUsd":7.155153,"sellAssetValueUsd":71.55153,"buyAssetValueUsd":71.430971297}}
import React from 'react';
import {
  Grid, Box, Flex, Text, Button, Image, VStack, useColorModeValue,
  HStack, Divider, IconButton, Stack, Badge, Avatar,
} from '@chakra-ui/react';
import { ExternalLinkIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { ChevronLeftIcon, CloseIcon } from '@chakra-ui/icons';
import ThorswapImage from '../../assets/png/thorswap.png';
import ChangellyImage from '../../assets/png/changelly.png';
import MayachainImage from '../../assets/png/mayachain.png';
import OsmosisImage from '../../assets/png/osmosis.png';
import { NetworkIdToChain } from '@coinmasters/types';
// @ts-ignore
import { caipToNetworkId } from '@pioneer-platform/pioneer-caip';

export const Quote: React.FC = () => {
  // Use actual values and image paths as needed
  const quoteData = {
    amountIn: '1.03356644',
    amountOut: '200.00000000',
    rate: '1 BCH = 193.50570301 WAVES',
    minerFee: '0.001 WAVES',
    fromAddress: '3P3ZS6rKMadPKxsB8gvPZ7XNCbJRnnerDKT',
    toAddress: '14LRpbGkPsu6V8q6iT3hUsN79AM5XibcK',
    integration: 'changelly'
  };
  const topBarBg = useColorModeValue('gray.100', 'gray.700'); // Change this color to match your design

  const integrationImages: { [key: string]: string } = {
    thorswap: ThorswapImage,
    changelly: ChangellyImage,
    mayachain: MayachainImage,
    osmosis: OsmosisImage,
  };

  const getAssetAvatar = (asset: string) => {
    const networkId = caipToNetworkId(asset);
    return `https://pioneers.dev/coins/${COIN_MAP_LONG[NetworkIdToChain[networkId]]}.png`;
  };

  const formatUSD = (amount: number) => `$${amount.toFixed(2)}`;
  function formatNumber(value: string): string {
    const number = parseFloat(value);
    let formattedNumber: string;

    if (number < 1) {
      // For small numbers, use toPrecision with up to 5 significant digits
      formattedNumber = number.toPrecision(5);
    } else {
      // Determine the number of decimal places based on the size of the number
      let decimalPlaces = 2;
      if (number >= 1000 && number < 10000) {
        decimalPlaces = 1;
      } else if (number >= 10000) {
        decimalPlaces = 0;
      }

      // Format the number with commas and the determined decimal places
      formattedNumber = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces
      }).format(number);
    }

    return formattedNumber;
  }

  const bg = useColorModeValue('white', 'gray.800');
  return (
    <Box bg={bg} borderRadius="lg" boxShadow="md" p={5}>
      <VStack spacing={4} align="stretch">
        <Flex justifyContent="space-between" alignItems="center">
          <IconButton
            aria-label="Back"
            icon={<ChevronLeftIcon />}
            variant="ghost"
          />
          <Text fontSize="lg" fontWeight="bold">Your Rate: {quoteData.rate}</Text>
          <IconButton
            aria-label="Close"
            icon={<CloseIcon />}
            variant="ghost"
          />
        </Flex>

        {/* Triple top bar */}
        <Grid templateColumns="repeat(3, 1fr)" gap={6} bg={topBarBg} p={3} >
          <Box w="100%" h="12" textAlign="center">
            <Text fontSize="sm">Deposit This</Text>
            <Flex align="center" justifyContent="flex-end">
              <Text isTruncated mr={2}>
                {`${formatNumber(quote.quote.sellAmount)} (${formatUSD(quote.quote.sellAssetValueUsd)} USD)`}
              </Text>
              {/*<Avatar size="xs" src={getAssetAvatar(quote.quote.sellAsset)} />*/}
            </Flex>
          </Box>
          <Box w="100%" h="12" textAlign="center">
            <Text fontSize="sm">To Get This</Text>
            <Flex align="center" justifyContent="flex-end">
              <Text isTruncated mr={2}>
                {`${formatNumber(quote.quote.buyAmount)} (${formatUSD(quote.quote.buyAssetValueUsd)} USD)`}
              </Text>
              {/*<Avatar size="xs" src={getAssetAvatar(quote.quote.buyAsset)} />*/}
            </Flex>
          </Box>
          <Box w="100%" h="12" textAlign="center">
            <Avatar src={integrationImages[quote.integration.toLowerCase()]} />
          </Box>
        </Grid>

        {/* Main content */}
        <VStack spacing={4} align="stretch">

          <HStack justifyContent="space-between" alignItems="center">
            {/*<Image boxSize="50px" src={BitcoinImage} alt="Bitcoin" />*/}
            <Text fontSize="2xl" fontWeight="bold">
              {quoteData.amountIn} BCH
            </Text>
            {/*<Image boxSize="30px" src={BitcoinImage} alt="Bitcoin" />*/}
            <Text fontSize="2xl" fontWeight="bold">
              {quoteData.amountOut} WAVES
            </Text>
            {/*<Image boxSize="50px" src={WavesImage} alt="Waves" />*/}
          </HStack>

          <Stack direction={{ base: 'column', md: 'row' }} justifyContent="space-between">
            <Badge p={2} colorScheme="blue" borderRadius="full">
              <Text fontSize="md">Miner Fee: {quoteData.minerFee}</Text>
            </Badge>
          </Stack>

          <VStack spacing={1}>
            <Text fontSize="md">{quoteData.fromAddress}</Text>
            <Text fontSize="md">{quoteData.toAddress}</Text>
          </VStack>

          <Flex align="center" justify="center">
            <Badge p={2} colorScheme="green" borderRadius="full">
              <HStack spacing={2}>
                <Text fontSize="md">I agree to the Terms</Text>
              </HStack>
            </Badge>
          </Flex>

          <Button colorScheme="blue" isFullWidth>
            Sign Transaction
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
};

export default Quote;
