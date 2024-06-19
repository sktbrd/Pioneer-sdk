import type { EVMChain } from '@coinmasters/types';
import { ChainToChainId, ChainToRPC } from '@coinmasters/types';
import { JsonRpcProvider, Network } from 'ethers';
const TAG = ' | evm/provider.ts | ';

export const getProvider = (chain: EVMChain, customUrl?: string) => {
  let tag = TAG + ' | getProvider | ';
  try {
    const providerUrl = customUrl || ChainToRPC[chain];
    console.log(tag, 'network', chain);
    console.log(tag, 'network', chain);
    console.log(tag, 'networkId: ', ChainToChainId[chain]);
    console.log(tag, 'chainId: ', ChainToChainId[chain].replace('eip155:', ''));
    console.log(tag, 'providerUrl: ', providerUrl);
    if (!providerUrl) {
      throw new Error('No providerUrl found for chain: ' + chain);
    }
    const network = new Network(chain, ChainToChainId[chain].replace('eip155:', ''));
    console.log('network', network);
    const provider = new JsonRpcProvider(providerUrl);

    provider._detectNetwork().catch((error) => {
      console.error(`Failed to connect to RPC at ${providerUrl}:`, error);
    });

    return provider;
  } catch (e) {
    console.error(tag, e);
    throw e;
  }
};

// export const getProvider = (chain: EVMChain, customUrl?: string) => {
//   return new JsonRpcProvider(customUrl || ChainToRPC[chain]);
// };
