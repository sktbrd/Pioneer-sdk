import {
  BaseDecimal,
  Chain,
  ChainId,
  ChainToHexChainId,
  type EVMChain,
  FeeOption,
  WalletOption,
} from '@coinmasters/types';
import { AssetValue, formatBigIntToSafeValue } from '@pioneer-platform/helpers';
//@ts-ignore
import { ChainToCaip, evmCaips } from '@pioneer-platform/pioneer-caip';
import type { BrowserProvider, Eip1193Provider, JsonRpcProvider } from 'ethers';

import type { CovalentApiType, EthplorerApiType, EVMMaxSendableAmountsParams } from './index.ts';
import { AVAXToolbox, BSCToolbox, ETHToolbox } from './index.ts';
const TAG = ' | EVM -helpers | ';

type NetworkParams = {
  chainId: ChainId;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
};

type ProviderRequestParams = {
  provider?: BrowserProvider;
  params?: any;
  method:
    | 'wallet_addEthereumChain'
    | 'wallet_switchEthereumChain'
    | 'eth_requestAccounts'
    | 'eth_sendTransaction'
    | 'eth_signTransaction';
};

const methodsToWrap = [
  // 'approve',
  // 'approvedAmount',
  // 'call',
  // 'sendTransaction',
  // 'transfer',
  // 'isApproved',
  // 'approvedAmount',
  // 'EIP1193SendTransaction',
  // 'getFeeData',
  // 'broadcastTransaction',
  // 'estimateCall',
  // 'estimateGasLimit',
  // 'estimateGasPrices',
  // 'createContractTxObject',
];

export const prepareNetworkSwitch = <T extends { [key: string]: (...args: any[]) => any }>({
  toolbox,
  chainId,
  provider = window.ethereum,
}: {
  toolbox: T;
  chainId: ChainId;
  provider?: BrowserProvider;
}) => {
  const wrappedMethods = methodsToWrap.reduce((object, methodName) => {
    if (!toolbox[methodName]) return object;
    const method = toolbox[methodName];

    return {
      ...object,
      [methodName]: wrapMethodWithNetworkSwitch<typeof method>(method, provider, chainId),
    };
  }, {});

  return { ...toolbox, ...wrappedMethods };
};

export const wrapMethodWithNetworkSwitch = <T extends (...args: any[]) => any>(
  func: T,
  provider: BrowserProvider,
  chainId: ChainId,
) =>
  (async (...args: any[]) => {
    try {
      await switchEVMWalletNetwork(provider, chainId);
    } catch (error) {
      throw new Error(`Failed to switch network: ${error}`);
    }
    return func(...args);
  }) as unknown as T;

const providerRequest = async ({ provider, params, method }: ProviderRequestParams) => {
  if (!provider?.send) throw new Error('Provider not found');

  const providerParams = params ? (Array.isArray(params) ? params : [params]) : [];
  return provider.send(method, providerParams);
};

export const addEVMWalletNetwork = (provider: BrowserProvider, networkParams: NetworkParams) =>
  providerRequest({ provider, method: 'wallet_addEthereumChain', params: [networkParams] });

export const switchEVMWalletNetwork = (provider: BrowserProvider, chainId = ChainId.EthereumHex) =>
  providerRequest({ provider, method: 'wallet_switchEthereumChain', params: [{ chainId }] });

export const getWeb3WalletMethods = async ({
  ethereumWindowProvider,
  chain,
  covalentApiKey,
  ethplorerApiKey,
}: {
  ethereumWindowProvider: Eip1193Provider | undefined;
  chain: Chain;
  covalentApiKey?: string;
  ethplorerApiKey?: string;
}) => {
  if (!ethereumWindowProvider) throw new Error('Requested web3 wallet is not installed');

  if (
    (chain !== Chain.Ethereum && !covalentApiKey) ||
    (chain === Chain.Ethereum && !ethplorerApiKey)
  ) {
    throw new Error(`Missing API key for ${chain} chain`);
  }

  const { BrowserProvider } = await import('ethers');

  const provider = new BrowserProvider(ethereumWindowProvider, 'any');

  const toolboxParams = {
    provider,
    signer: await provider.getSigner(),
    ethplorerApiKey: ethplorerApiKey as string,
    covalentApiKey: covalentApiKey as string,
  };

  const toolbox =
    chain === Chain.Ethereum
      ? ETHToolbox(toolboxParams)
      : chain === Chain.Avalanche
        ? AVAXToolbox(toolboxParams)
        : BSCToolbox(toolboxParams);

  try {
    chain !== Chain.Ethereum &&
      (await addEVMWalletNetwork(
        provider,
        (
          toolbox as ReturnType<typeof AVAXToolbox> | ReturnType<typeof BSCToolbox>
        ).getNetworkParams(),
      ));
  } catch (error) {
    throw new Error(`Failed to add/switch ${chain} network: ${chain}`);
  }
  return prepareNetworkSwitch<typeof toolbox>({
    toolbox: { ...toolbox },
    chainId: ChainToHexChainId[chain],
    provider,
  });
};

export const estimateMaxSendableAmount = async function ({
  toolbox,
  from,
  caip,
  memo = '',
  feeOptionKey = FeeOption.Fastest,
  assetValue,
  abi,
  funcName,
  funcParams,
  contractAddress,
  txOverrides,
}: EVMMaxSendableAmountsParams) {
  let tag = TAG + ' | estimateMaxSendableAmount | ';
  try {
    console.log(tag, 'checkpoint ');
    console.log(tag, 'from: ', from);
    console.log(tag, 'caip: ', caip);
    if (!from) throw new Error('Missing from address');
    if (!caip) throw new Error('Missing caip');
    const balanceData = await toolbox.getBalance({ address: from });
    if (!balanceData) return 0;
    console.log(tag, 'balanceData: ', balanceData);

    //caip is the chain address identifier protocol
    console.log(tag, 'caip: ', caip);

    //if token, then return token balance
    let isNative = function (caip: string): boolean {
      const evmValues = Object.values(evmCaips);
      return evmValues.includes(caip);
    };
    let native = isNative(caip);
    if (native) {
      // const balance = balanceData.find
      console.log(tag, 'Native detected!');
    } else {
      console.log(tag, 'Token detected!');
    }
    //if native asset then return gasToken balance

    const fees = (await toolbox.estimateGasPrices())[feeOptionKey];
    console.log(tag, 'fees: ', fees);

    //TODO this makes no sense to me. If you are sending native token, its not a smart contract fee
    //and if you are sending a token the fee amount of the gass asset has nothing to do with the token max sendable amount

    //TODO verify enough gasAsset for token transfer!
    // if ([abi, funcName, funcParams, contractAddress].some((param) => !param)) {
    //   throw new Error('Missing required parameters for smart contract estimateMaxSendableAmount');
    // }
    //
    // const gasLimit =
    //   abi && funcName && funcParams && contractAddress
    //     ? await toolbox.estimateCall({
    //         contractAddress,
    //         abi,
    //         funcName,
    //         funcParams,
    //         txOverrides,
    //       })
    //     : await toolbox.estimateGasLimit({
    //         from,
    //         recipient: from,
    //         memo,
    //         assetValue,
    //       });
    // //console.log(tag, 'gasLimit: ', gasLimit);
    //
    // const isFeeEIP1559Compatible = 'maxFeePerGas' in fees;
    // const isFeeEVMLegacyCompatible = 'gasPrice' in fees;
    //
    // if (!isFeeEVMLegacyCompatible && !isFeeEIP1559Compatible)
    //   throw new Error('Could not fetch fee data');
    //
    // const fee =
    //   gasLimit *
    //   (isFeeEIP1559Compatible
    //     ? fees.maxFeePerGas! + (fees.maxPriorityFeePerGas! || 1n)
    //     : fees.gasPrice!);

    // const maxSendableAmount = SwapKitNumber.fromBigInt(balance.getBaseValue('bigint'));
    // //console.log(tag, 'fee: ', fee);
    //
    // return AssetValue.fromChainOrSignature(balance.chain, maxSendableAmount.getValue('string'));
    return balanceData;
  } catch (e) {
    console.error(tag, 'e: ', e);
    throw e;
  }
};

// export const estimateMaxSendableAmount = async ({
//   toolbox,
//   from,
//   memo = '',
//   feeOptionKey = FeeOption.Fastest,
//   assetValue,
//   abi,
//   funcName,
//   funcParams,
//   contractAddress,
//   txOverrides,
// }: EVMMaxSendableAmountsParams): Promise<AssetValue> => {
//   const balance = (await toolbox.getBalance(from)).find(({ symbol, chain }) =>
//     assetValue
//       ? symbol === assetValue.symbol
//       : symbol === AssetValue.fromChainOrSignature(chain)?.symbol,
//   );
//
//   const fees = (await toolbox.estimateGasPrices())[feeOptionKey];
//
//   if (!balance) return AssetValue.fromChainOrSignature(assetValue.chain, 0);
//
//   if (assetValue && (balance.chain !== assetValue.chain || balance.symbol !== assetValue?.symbol)) {
//     return balance;
//   }
//
//   if ([abi, funcName, funcParams, contractAddress].some((param) => !param)) {
//     throw new Error('Missing required parameters for smart contract estimateMaxSendableAmount');
//   }
//
//   const gasLimit =
//     abi && funcName && funcParams && contractAddress
//       ? await toolbox.estimateCall({
//           contractAddress,
//           abi,
//           funcName,
//           funcParams,
//           txOverrides,
//         })
//       : await toolbox.estimateGasLimit({
//           from,
//           recipient: from,
//           memo,
//           assetValue,
//         });
//
//   const isFeeEIP1559Compatible = 'maxFeePerGas' in fees;
//   const isFeeEVMLegacyCompatible = 'gasPrice' in fees;
//
//   if (!isFeeEVMLegacyCompatible && !isFeeEIP1559Compatible)
//     throw new Error('Could not fetch fee data');
//
//   const fee =
//     gasLimit *
//     (isFeeEIP1559Compatible
//       ? fees.maxFeePerGas! + (fees.maxPriorityFeePerGas! || 1n)
//       : fees.gasPrice!);
//   const maxSendableAmount = SwapKitNumber.fromBigInt(balance.getBaseValue('bigint')).sub(
//     fee.toString(),
//   );
//
//   return AssetValue.fromChainOrSignature(balance.chain, maxSendableAmount.getValue('string'));
// };

export const addAccountsChangedCallback = (callback: () => void) => {
  window.ethereum?.on('accountsChanged', () => callback());
  window.xfi?.ethereum.on('accountsChanged', () => callback());
};

export const getETHDefaultWallet = () => {
  const { isTrust, isBraveWallet, __XDEFI, overrideIsMetaMask, selectedProvider } =
    window?.ethereum || {};
  if (isTrust) return WalletOption.TRUSTWALLET_WEB;
  if (isBraveWallet) return WalletOption.BRAVE;
  if (overrideIsMetaMask && selectedProvider?.isCoinbaseWallet) return WalletOption.COINBASE_WEB;
  if (__XDEFI) WalletOption.XDEFI;
  return WalletOption.METAMASK;
};

export const isDetected = (walletOption: WalletOption) => {
  return listWeb3EVMWallets().includes(walletOption);
};

const listWeb3EVMWallets = () => {
  const metamaskEnabled = window?.ethereum && !window.ethereum?.isBraveWallet;
  const xdefiEnabled = window?.xfi || window?.ethereum?.__XDEFI;
  const braveEnabled = window?.ethereum?.isBraveWallet;
  const trustEnabled = window?.ethereum?.isTrust || window?.trustwallet;
  const coinbaseEnabled =
    (window?.ethereum?.overrideIsMetaMask &&
      window?.ethereum?.selectedProvider?.isCoinbaseWallet) ||
    window?.coinbaseWalletExtension;

  const wallets = [];
  if (metamaskEnabled) wallets.push(WalletOption.METAMASK);
  if (xdefiEnabled) wallets.push(WalletOption.XDEFI);
  if (braveEnabled) wallets.push(WalletOption.BRAVE);
  if (trustEnabled) wallets.push(WalletOption.TRUSTWALLET_WEB);
  if (coinbaseEnabled) wallets.push(WalletOption.COINBASE_WEB);
  if (okxMobileEnabled()) wallets.push(WalletOption.OKX_MOBILE);

  return wallets;
};

export const okxMobileEnabled = () => {
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod|ios/i.test(ua);
  const isAndroid = /android|XiaoMi|MiuiBrowser/i.test(ua);
  const isMobile = isIOS || isAndroid;
  const isOKApp = /OKApp/i.test(ua);

  return isMobile && isOKApp;
};

export const isWeb3Detected = () => typeof window.ethereum !== 'undefined';
export const toHexString = (value: bigint) => (value > 0n ? `0x${value.toString(16)}` : '0x0');

export const getBalance = async ({
  provider,
  api,
  pubkey,
  chain,
}: {
  provider: JsonRpcProvider | BrowserProvider;
  api: CovalentApiType | EthplorerApiType;
  address: { address: string }[]; // Updated type for address
  chain: EVMChain;
}) => {
  let tag = TAG + ' | getBalance | ';
  try {
    console.log(tag, 'pubkey: ', pubkey);

    let address;
    if (Array.isArray(pubkey)) {
      address = pubkey[0].address;
    } else {
      address = pubkey.address;
    }

    console.log(tag, 'EVM toolbox getBalance: ', address);

    // const tokenBalances = await api.getBalance(pubkey.address).catch((e) => {
    //   console.error(`Error fetching token balances for address ${pubkey.address}:`, e);
    //   return []; // Return an empty array on failure to allow processing to continue
    // });

    const evmGasTokenBalance = await provider.getBalance(address).catch((e) => {
      console.error(`Error fetching gas token balance for address ${address}:`, e);
      return BigInt(0); // Return 0 on failure
    });

    console.log(tag, 'chain: ', chain);
    console.log(tag, 'evmGasTokenBalance: ', evmGasTokenBalance.toString());
    let safeValue = formatBigIntToSafeValue({
      value: evmGasTokenBalance,
      decimal: BaseDecimal[chain] || 18,
    });
    console.log('safeValue: ', safeValue);
    //@ts-ignore
    let gasTokenBalance = AssetValue.fromChainOrSignature(chain, safeValue);
    gasTokenBalance.isGasAsset = true; // Marking it as gas asset
    gasTokenBalance.caip = ChainToCaip[chain];
    console.log(tag, 'gasTokenBalance: ', gasTokenBalance);

    // let balances: any = [];
    // balances.push(gasTokenBalance);

    //
    // // eslint-disable-next-line @typescript-eslint/prefer-for-of
    // for (let i = 0; i < tokenBalances.length; i++) {
    //   let tokenBalance = tokenBalances[i];
    //   if (tokenBalance.symbol && tokenBalance.chain && tokenBalance.chain === chain) {
    //     try {
    //       console.log(tag, 'tokenBalance: ', tokenBalance);
    //       let tokenString = `${tokenBalance.chain}.${tokenBalance.symbol.toUpperCase()}`;
    //       console.log(tag, 'tokenString: ', tokenString);
    //       console.log(tag, 'tokenBalance.value: ', tokenBalance.value);
    //       if (tokenString.includes('HTTPS://')) {
    //         console.log('Spam detected: ', tokenString);
    //       } else {
    //         let formattedBalance = AssetValue.fromIdentifierSync(
    //           //@ts-ignore
    //           tokenString,
    //           tokenBalance.value,
    //         );
    //         if (formattedBalance.ticker && formattedBalance.ticker !== 'undefined') {
    //           // formattedBalance.address = address[0].address;
    //           balances.push(formattedBalance);
    //         } else {
    //           console.error('Missing ticker for:', tokenBalance);
    //         }
    //       }
    //     } catch (error) {
    //       console.error(`Error formatting balance for token ${tokenBalance.symbol}:`, error);
    //     }
    //   } else {
    //     console.log('Mismatched chain or missing token data:', { chain, tokenBalance });
    //   }
    // }
    //
    // console.log(tag, ' final: balances: ', balances);

    return gasTokenBalance;
  } catch (error) {
    console.error('Unexpected error in getBalance:', error);
    throw error;
  }
};
