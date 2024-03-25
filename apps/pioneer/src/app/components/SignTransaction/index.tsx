import {
  Avatar,
  Button,
  Card,
  CardHeader, Flex,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td, Text,
  Th,
  Thead,
  Tr, VStack,
} from '@chakra-ui/react';
import { FeeOption, NetworkIdToChain, WalletOption } from '@coinmasters/types';
// @ts-ignore
import { caipToNetworkId } from '@pioneer-platform/pioneer-caip';
import {
  COIN_MAP_LONG,
  getPaths,
  // @ts-ignore
} from '@pioneer-platform/pioneer-coins';
// @ts-ignore
import { useEffect, useState } from 'react';

// @ts-ignore
import { usePioneer } from '@coinmasters/pioneer-react';
// Adjust the import path according to your file structure

let ChangellyImage = '/png/changelly.png'
let MayachainImage = '/png/mayachain.png'
let OsmosisImage = '/png/osmosis.png'
let ThorswapImage = '/png/thorswap.png'

export default function SignTransaction({ onClose, quote }: any) {
  const { state, connectWallet } = usePioneer();
  const { app, assetContext, outboundAssetContext } = state;
  // const [totalNetworkFees, setTotalNetworkFees] = useState('');
  // const [inputFeeAsset, setInputFeeAsset] = useState('');
  // const [outputFeeAsset, setOutputFeeAsset] = useState('');
  // const [inputFee, setInputFee] = useState('');
  // const [inputFeeUSD, setInputFeeUSD] = useState('');
  // const [outputFee, setOutputFee] = useState('');
  // const [outputFeeUSD, setOutputFeeUSD] = useState('');
  const [isPairing, setIsPairing] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [txHash, setTxHash] = useState<string>('');

  const integrationImages: { [key: string]: string } = {
    thorswap: ThorswapImage,
    changelly: ChangellyImage,
    mayachain: MayachainImage,
    osmosis: OsmosisImage,
  };


  const formatUSD = (amount?: number) => {
    if (typeof amount === 'number' && !isNaN(amount)) {
      return `$${amount.toFixed(2)}`;
    } else {
      // Handle the case where amount is not set or invalid
      return `$0.00`;
    }
  };

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

  const HandleSwap = async () => {
    // const inputChain = assetContext?.chain;
    console.log('outboundAssetContext: ', outboundAssetContext);


    const outputChain = outboundAssetContext?.chain;
    if (!assetContext || !outboundAssetContext || !app || !app?.swapKit) return;

    const address = app?.swapKit.getAddress(outputChain);
    console.log('address: ', address);

    console.log('quote: ', quote);
    let swapObj = {
      route: quote.quote.route,
      recipient: address,
      feeOptionKey: FeeOption.Fast,
    }
    console.log('swapObj: ', swapObj);
    const txHashResult = await app?.swapKit.swap(swapObj);
    console.log('txHash: ', txHashResult);
    setTxHash(txHashResult);
    onClose();
  };

  const approveTransaction = async () => {
    // verify context of input asset
    const walletInfo = await app.swapKit.getWalletByChain(assetContext.chain);
    console.log('walletInfo: ', walletInfo);
    if (!walletInfo) {
      setIsPairing(true);
      console.log('assetContext: ', assetContext);
      const contextType = assetContext.context.split(':')[0];
      console.log('contextType: ', contextType);
      //set blockchains to just ETH + tx chain for speed
      let blockchain = caipToNetworkId(quote.quote.sellAsset);
      let blockchains = [blockchain];
      let paths = getPaths(blockchains);

      app.setPaths(paths);

      let pairObj = {
        type:WalletOption.KEEPKEY,
        blockchains
      }
      const resultInit = await app.pairWallet(pairObj)
      console.log('pair result: ', resultInit);
    } else {
      console.log('Approving TX');
      setIsApproved(true);
      await HandleSwap(); // Note: Added 'await' to ensure handleSwap completes before proceeding.
    }
  };

  // start the context provider
  useEffect(() => {
    if (app) console.log('Wallets changed: ', app.wallets);
  }, [app, app?.wallets]);

  // start the context provider
  useEffect(() => {
    setIsPairing(false);
  }, [app, app?.context]);

  useEffect(() => {
    console.log("quote: ", quote);
  }, [quote]);

  // start the context provider
  // useEffect(() => {
  //   setFees();
  // }, [route]);

  const getAssetAvatar = (asset: string) => {
    const networkId = caipToNetworkId(asset);
    return `https://pioneers.dev/coins/${COIN_MAP_LONG[NetworkIdToChain[networkId] as keyof typeof COIN_MAP_LONG]}.png`;
  };

  // Function to render transaction details as a table
  const renderTxDetails = (data: any) => {
    const renderValue = (value: any): JSX.Element | string => {
      if (Array.isArray(value)) {
        return (
          <ul>
            {value.map((item, index) => (
              <li key={index}>{renderValue(item)}</li>
            ))}
          </ul>
        );
      } else if (typeof value === 'object' && value !== null) {
        return (
          <Table size="sm">
            <Tbody>
              {Object.entries(value).map(([key, val], index) => (
                <Tr key={index}>
                  <Td>{key}</Td>
                  <Td>{renderValue(val)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        );
      } else {
        return value !== null ? value.toString() : '';
      }
    };

    const renderRow = (key: string, value: any) => (
      <Tr key={key}>
        <Td>{key}</Td>
        <Td>{renderValue(value)}</Td>
      </Tr>
    );

    const rows = [];

    for (const key in data) {
      rows.push(renderRow(key, data[key]));
    }

    return (
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Field</Th>
            <Th>Value</Th>
          </Tr>
        </Thead>
        <Tbody>{rows}</Tbody>
      </Table>
    );
  };

  return (
    <Stack spacing={4}>
      {isPairing ? (
        <div>
          <Spinner size="xl" />
          <Card>
            <CardHeader>
              Pairing and Syncing Wallet... wallet:{assetContext.context} <br />
            </CardHeader>
          </Card>
        </div>
      ) : (
        <div>
          {isApproved ? (
            <div>
              You Must Sign the Transaction on your device! ... <br />
              <Spinner size="xl" />
            </div>
          ) : (
            <div>
              <Avatar size={'xl'} src={app?.assetContext?.icon} />
              <VStack align="flex-end" flex="1" minW="0">
                <Text fontWeight="bold" isTruncated>{quote.integration}</Text>
                <Flex align="center" justifyContent="flex-end">
                  <Text isTruncated mr={2}>
                    {`${formatNumber(quote.quote.sellAmount)} (${formatUSD(quote.quote.sellAssetValueUsd)} USD)`}
                  </Text>
                  <Avatar size="xs" src={getAssetAvatar(quote.quote.sellAsset)} />
                </Flex>
                <Flex align="center" justifyContent="flex-end">
                  <Text isTruncated mr={2}>
                    {`${formatNumber(quote.quote.buyAmount)} (${formatUSD(quote.quote.buyAssetValueUsd)} USD)`}
                  </Text>
                  <Avatar size="xs" src={getAssetAvatar(quote.quote.buyAsset)} />
                </Flex>
                <Text isTruncated>PRO: {formatNumber(quote.quote.proTokenEarned)} ({formatUSD(quote.quote.proTokenEarnedUsd)} USD)</Text>
                <Text isTruncated>Total Value OUT: {formatUSD(quote.quote.buyAssetValueUsd + quote.quote.proTokenEarnedUsd)}</Text>
              </VStack>
              <Button onClick={approveTransaction}>SIGN TRANSACTION</Button>
            </div>
          )}
        </div>
      )}
    </Stack>
  );
}
