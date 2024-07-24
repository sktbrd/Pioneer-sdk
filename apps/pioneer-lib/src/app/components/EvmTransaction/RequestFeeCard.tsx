import React, { useState, useEffect, Fragment } from 'react';
import {
  FormControl,
  RadioGroup,
  Radio,
  Text,
  Alert,
  Button,
  AlertTitle,
  Box,
  Switch,
  Heading,
  Input
} from '@chakra-ui/react';
// import { JsonRpcProvider } from "ethers";

let EIP155_CHAINS = {
  'eip155:1': {
    chainId: 1,
    name: 'Ethereum',
    logo: '/chain-logos/eip155-1.png',
    rgb: '99, 125, 234',
    rpc: 'https://eth.llamarpc.com',
    namespace: 'eip155'
  },
  'eip155:43114': {
    chainId: 43114,
    name: 'Avalanche C-Chain',
    logo: '/chain-logos/eip155-43113.png',
    rgb: '232, 65, 66',
    rpc: 'https://api.avax.network/ext/bc/C/rpc',
    namespace: 'eip155'
  },
  'eip155:137': {
    chainId: 137,
    name: 'Polygon',
    logo: '/chain-logos/eip155-137.png',
    rgb: '130, 71, 229',
    rpc: 'https://polygon-rpc.com/',
    namespace: 'eip155'
  },
  'eip155:10': {
    chainId: 10,
    name: 'Optimism',
    logo: '/chain-logos/eip155-10.png',
    rgb: '235, 0, 25',
    rpc: 'https://mainnet.optimism.io',
    namespace: 'eip155'
  },
  'eip155:324': {
    chainId: 324,
    name: 'zkSync Era',
    logo: '/chain-logos/eip155-324.svg',
    rgb: '242, 242, 242',
    rpc: 'https://mainnet.era.zksync.io/',
    namespace: 'eip155'
  },
  'eip155:8453': {
    chainId: 8453,
    name: 'Base',
    logo: '/chain-logos/base.png',
    rgb: '242, 242, 242',
    rpc: 'https://mainnet.base.org',
    namespace: 'eip155'
  },
  'eip155:42161': {
    chainId: 42161,
    name: 'Arbitrum',
    logo: '/chain-logos/arbitrum.png',
    rgb: '4, 100, 214',
    rpc: 'https://api.zan.top/node/v1/arb/one/public',
    namespace: 'eip155'
  },
  'eip155:100': {
    chainId: 100,
    name: 'Gnosis',
    logo: '/chain-logos/gnosis.png',
    rgb: '33, 186, 69',
    rpc: 'https://api.zan.top/node/v1/arb/one/public',
    namespace: 'eip155'
  }
};

const RequestFeeCard = ({ data, updateFeeData, chainId }: any) => {
  const [selectedFee, setSelectedFee] = useState('');
  const [customFee, setCustomFee] = useState('');
  const [dappProvidedFee, setDappProvidedFee] = useState(false);
  const [displayFee, setDisplayFee] = useState('');
  const [feeWarning, setFeeWarning] = useState(false);
  const [isEIP1559, setIsEIP1559] = useState(false);
  const [fees, setFees] = useState<any>({
    dappSuggested: '',
    networkRecommended: ''
  });

  const getFee = async () => {
    try {
      // const network = chainId;
      // const rpcUrl = EIP155_CHAINS[network].rpc;
      // const provider = new JsonRpcProvider(rpcUrl);
      // const feeData = await provider.getFeeData();
      //
      // const networkRecommendedFee = feeData.gasPrice
      //   ? (BigInt(feeData.gasPrice.toString()) / BigInt(1e9)).toString()
      //   : '';
      //
      // setFees((prevFees: any) => ({
      //   ...prevFees,
      //   networkRecommended: networkRecommendedFee,
      // }));

      setFeeWarning(false);
    } catch (e) {
      console.error('Error fetching fee data:', e);
    }
  };

  useEffect(() => {
    // if (!data.maxPriorityFeePerGas && !data.maxFeePerGas && !data.gasPrice) {
    //   getFee();
    //   setDappProvidedFee(false);
    //   setSelectedFee('networkRecommended');
    // } else {
    //   const dappFee = data.gasPrice
    //     ? (BigInt(data.gasPrice.toString()) / BigInt(1e9)).toString()
    //     : '';
    //   const networkFee = fees.networkRecommended;
    //
    //   setDappProvidedFee(true);
    //   setFees((prevFees: any) => ({
    //     ...prevFees,
    //     dappSuggested: dappFee,
    //   }));
    //   if (networkFee && BigInt(dappFee) < BigInt(networkFee)) {
    //     setFeeWarning(true);
    //   }
    //   setSelectedFee('dappSuggested');
    // }
  }, [data, fees.networkRecommended]);

  useEffect(() => {
    if (selectedFee === 'custom') {
      setDisplayFee(customFee + ' Gwei');
    } else {
      setDisplayFee(fees[selectedFee] + ' Gwei');
    }
  }, [selectedFee, customFee, fees]);

  const handleFeeChange = (event: any) => {
    setSelectedFee(event.target.value);
  };

  const handleCustomFeeChange = (event: any) => {
    setCustomFee(event.target.value);
  };

  const handleSubmit = () => {
    let selectedFeeData;
    const feeInGwei = selectedFee === 'custom' ? customFee : fees[selectedFee];

    if (isEIP1559) {
      const baseFeeInWei = BigInt(feeInGwei) * BigInt(1e9);
      const priorityFeeInWei = BigInt(2 * 1e9);
      const maxFeeInWei = baseFeeInWei + priorityFeeInWei;

      selectedFeeData = {
        gasPrice: baseFeeInWei.toString(),
        maxFeePerGas: maxFeeInWei.toString(),
        maxPriorityFeePerGas: priorityFeeInWei.toString()
      };
    } else {
      const gasPriceInWei = BigInt(feeInGwei) * BigInt(1e9);
      selectedFeeData = {
        gasPrice: gasPriceInWei.toString(),
        maxFeePerGas: gasPriceInWei.toString(),
        maxPriorityFeePerGas: gasPriceInWei.toString()
      };
    }

    const feeDataHex = {
      gasPrice: `0x${BigInt(selectedFeeData.gasPrice).toString(16)}`,
      maxFeePerGas: `0x${BigInt(selectedFeeData.maxFeePerGas).toString(16)}`,
      maxPriorityFeePerGas: `0x${BigInt(selectedFeeData.maxPriorityFeePerGas).toString(16)}`
    };

    updateFeeData(feeDataHex);
  };

  return (
    <Fragment>
      {!dappProvidedFee && (
        <Text fontSize="sm" fontStyle="italic" mt={2}>
          Please select a fee option below:
        </Text>
      )}

      {feeWarning && (
        <Alert status="warning" borderRadius="md" mb={2}>
          <AlertTitle>Warning</AlertTitle>
          Dapp suggested fee is lower than the network recommended fee.
        </Alert>
      )}

      <FormControl as="fieldset">
        <RadioGroup name="fee" value={selectedFee} onChange={handleFeeChange}>
          {dappProvidedFee && (
            <Radio value="dappSuggested">
              DApp Suggested Fee ({fees.dappSuggested} Gwei)
            </Radio>
          )}
          {fees.networkRecommended && (
            <Radio value="networkRecommended">
              Network Recommended Fee ({fees.networkRecommended} Gwei)
            </Radio>
          )}
          <Radio value="custom">Custom Fee</Radio>
        </RadioGroup>
        {selectedFee === 'custom' && (
          <Input
            variant="outline"
            value={customFee}
            onChange={handleCustomFeeChange}
            fullWidth
            margin="normal"
            type="number"
            bg="white"
            color="black"
            mt={2}
          />
        )}
      </FormControl>
      <Heading as="h6" size="sm" mt={4}>
        Current Fee: {displayFee}
      </Heading>
      <Box display="flex" alignItems="center" mt={4} justifyContent="space-between">
        <Button colorScheme="green" onClick={handleSubmit}>
          Submit Fee
        </Button>
        <Box display="flex" alignItems="center">
          <Text fontSize="sm" fontStyle="italic" mr={2}>
            Use EIP-1559:
          </Text>
          <Switch
            id="isEIP1559"
            isChecked={isEIP1559}
            onChange={() => setIsEIP1559(!isEIP1559)}
            colorScheme={isEIP1559 ? 'blue' : 'gray'}
          />
        </Box>
      </Box>
    </Fragment>
  );
};

export default RequestFeeCard;
