import { BaseDecimal, Chain, ChainId, ChainToExplorerUrl } from '@coinmasters/types';
import { AssetValue, formatBigIntToSafeValue } from '@pioneer-platform/helpers';
//@ts-ignore
import { ChainToCaip } from '@pioneer-platform/pioneer-caip';
import type { BrowserProvider, JsonRpcProvider, Signer } from 'ethers';

// import type { CovalentApiType } from '../api/covalentApi.ts';
// import { covalentApi } from '../api/covalentApi.ts';
// import { getBalance } from '../index.ts';
import { BaseEVMToolbox } from './BaseEVMToolbox.ts';
const TAG = ' | evm/base.ts | ';

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
      let tag = TAG + ' | getBalance | ';
      try {
        console.log(tag, 'address: ', address);
        // const tokenBalances = await api.getBalance(address[0].address);
        // console.log('tokenBalances: ', tokenBalances);
        const evmGasTokenBalance = await provider.getBalance(address[0].address);
        console.log(tag, 'evmGasTokenBalance: ', evmGasTokenBalance);
        let safeValue = formatBigIntToSafeValue({
          value: evmGasTokenBalance,
          decimal: BaseDecimal['BASE'] || 18,
        });

        //console.log('tokenBalances: ', tokenBalances);
        console.log(tag, 'evmGasTokenBalance safeValue: ', safeValue);
        //safe

        await AssetValue.loadStaticAssets();
        //@ts-ignore
        let gasTokenBalance = AssetValue.fromChainOrSignature(Chain.Base, safeValue);
        gasTokenBalance.caip = ChainToCaip['BASE'];
        console.log(tag, 'gasTokenBalance: ', gasTokenBalance);
        console.log(tag, 'gasTokenBalance: ', gasTokenBalance.getValue('string'));
        //pro token balances

        // The token's contract address
        const tokenAddress = '0xef743df8eda497bcf1977393c401a636518dd630';
        const userAddress = address[0].address;
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
        console.log(tag, 'contract: ', contract);
        if (!contract) throw new Error('Failed to create contract instance');

        // Replace 'address[0].address' with the actual wallet address you're querying
        const tokenBalanceBigNumber = await contract.balanceOf(userAddress);
        console.log(tag, 'Token Balance (raw Big Number): ', tokenBalanceBigNumber.toString());

        // Process the token balance
        // const assetStringToken = 'BASE.PRO-0XEF743DF8EDA497BCF1977393C401A636518DD630';
        // let tokenAssetValue = AssetValue.fromStringSync(assetStringToken, tokenBalanceBigNumber);
        // tokenAssetValue.address = '0xef743df8eda497bcf1977393c401a636518dd630';
        // tokenAssetValue.caip = 'eip155:8453/erc20:0xef743df8eda497bcf1977393c401a636518dd630';
        // console.log(tag, 'Token Asset Value: ', tokenAssetValue);

        //TODO get tokens from covalent
        let balances = [gasTokenBalance];
        // let balances = [gasTokenBalance, tokenAssetValue];
        console.log(tag, 'balances: ', balances);
        return balances;
      } catch (e) {
        console.log('getBalance error: ', e);
        throw e;
      }
    },
    // getBalance: (address: any, potentialScamFilter?: boolean) =>
    //   getBalance({ provider, api: null, address, chain: Chain.Avalanche, potentialScamFilter }),
  };
};
