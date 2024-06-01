import { AssetValue } from '@pioneer-platform/helpers';
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
        console.log('address: ', address);
        // const tokenBalances = await api.getBalance(address[0].address);
        // console.log('tokenBalances: ', tokenBalances);

        const evmGasTokenBalance = await provider.getBalance(address[0].address);
        //console.log('tokenBalances: ', tokenBalances);
        console.log('evmGasTokenBalance: ', evmGasTokenBalance);
        await AssetValue.loadStaticAssets();
        let assetStringGas = 'BASE.ETH';
        let gasTokenBalance = AssetValue.fromStringSync(assetStringGas, evmGasTokenBalance);
        gasTokenBalance.address = address[0].address;
        console.log('gasTokenBalance: ', gasTokenBalance);

        //pro token balances
        // The token's contract address
        const tokenAddress = '0xef743df8eda497bcf1977393c401a636518dd630';
        const userAddress = address[0].address;
        // The ERC-20 token ABI
        // The ERC-20 token ABI
        const ERC20_ABI = [
          {
            constant: true,
            inputs: [{ name: 'owner', type: 'address' }],
            name: 'balanceOf',
            outputs: [{ name: '', type: 'uint256' }],
            payable: false,
            stateMutability: 'view',
            type: 'function',
          },
        ];
        const { Contract } = await import('ethers');
        // Assuming `provider` is correctly initialized earlier in your code
        // Create an instance of a contract connected to the ERC-20 token
        const contract = new Contract(tokenAddress, ERC20_ABI, provider);

        // const contract = await baseToolbox.createContract(tokenAddress, ERC20_ABI, provider);
        console.log('contract: ', contract);
        if (!contract) throw new Error('Failed to create contract instance');

        // Replace 'address[0].address' with the actual wallet address you're querying
        const tokenBalanceBigNumber = await contract.balanceOf(userAddress);
        console.log('Token Balance (raw Big Number): ', tokenBalanceBigNumber.toString());

        // Process the token balance
        const assetStringToken = 'BASE.PRO-0XEF743DF8EDA497BCF1977393C401A636518DD630';
        let tokenAssetValue = AssetValue.fromStringSync(assetStringToken, tokenBalanceBigNumber);
        tokenAssetValue.address = userAddress;
        console.log('Token Asset Value: ', tokenAssetValue);

        //TODO get tokens from covalent

        let balances = [gasTokenBalance, tokenAssetValue];
        return balances;
      } catch (e) {
        console.log('getBalance error: ', e);
      }
    },
    // getBalance: (address: any, potentialScamFilter?: boolean) =>
    //   getBalance({ provider, api: null, address, chain: Chain.Avalanche, potentialScamFilter }),
  };
};
