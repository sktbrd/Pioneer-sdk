import { AssetValue, formatBigIntToSafeValue } from '@coinmasters/helpers';
import { BaseDecimal, Chain, ChainId, ChainToExplorerUrl } from '@coinmasters/types';
import type { BrowserProvider, JsonRpcProvider, Signer } from 'ethers';

// import type { CovalentApiType } from '../api/covalentApi.ts';
// import { covalentApi } from '../api/covalentApi.ts';
// import { getBalance } from '../index.ts';
import { BaseEVMToolbox } from './BaseEVMToolbox.ts';

export const getNetworkParams = () => ({
  chainId: ChainId.Base,
  chainName: 'Base Network',
  nativeCurrency: { name: 'Avalanche', symbol: Chain.Avalanche, decimals: BaseDecimal.AVAX },
  // Use external rpc URL so wallets don't throw warning to user
  rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
  blockExplorerUrls: [ChainToExplorerUrl[Chain.Avalanche]],
});

export const BASEToolbox = ({
  api,
  provider,
  signer,
  covalentApiKey,
}: {
  api?: null;
  covalentApiKey: string;
  signer: Signer;
  provider: JsonRpcProvider | BrowserProvider;
}) => {
  const baseToolbox = BaseEVMToolbox({ provider, signer });

  return {
    ...baseToolbox,
    getNetworkParams,
    async getBalance(address: any) {
      try {
        // const tokenBalances = await api.getBalance(address[0].address);
        // console.log('tokenBalances: ', tokenBalances);

        const evmGasTokenBalance = await provider.getBalance(address[0].address);
        //console.log('tokenBalances: ', tokenBalances);
        //console.log('evmGasTokenBalance: ', evmGasTokenBalance);
        let gasTokenBalance = AssetValue.fromChainOrSignature(
          Chain.Base,
          formatBigIntToSafeValue({
            value: evmGasTokenBalance,
            decimal: 18,
          }),
        );
        gasTokenBalance.address = address[0].address;
        //get tokens

        let balances = [gasTokenBalance];
        return balances;
      } catch (e) {
        //console.log('getBalance error: ', e);
      }
    },
    // getBalance: (address: any, potentialScamFilter?: boolean) =>
    //   getBalance({ provider, api: null, address, chain: Chain.Avalanche, potentialScamFilter }),
  };
};
