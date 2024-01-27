import type { FixedNumber } from 'ethers';

import type { Chain, CosmosChain, EVMChain, UTXOChain } from './network.ts';
import type { WalletOption } from './wallet.ts';

type ConnectMethodNames =
  | 'connectEVMWallet'
  | 'connectKeplr'
  | 'connectKeystore'
  | 'connectKeepkey'
  | 'connectMetaMask'
  | 'connectLedger'
  | 'connectOkx'
  | 'connectTrezor'
  | 'connectWalletconnect'
  | 'connectXDEFI';

type ChainWallet = {
  address: string;
  balance: any[];
  walletType: WalletOption;
};

export type ConnectConfig = {
  stagenet?: boolean;
  /**
   * @required for AVAX & BSC
   */
  covalentApiKey?: string;
  /**
   * @required for ETH
   */
  ethplorerApiKey?: string;
  /**
   * @required for BTC, BCH, LTC, DOGE
   */
  blockchairApiKey?: string;
  /**
   * @deprecated - use blockchairApiKey instead
   */
  utxoApiKey?: string;
  /**
   * @required for Walletconnect
   */
  walletConnectProjectId?: string;
  /**
   * @optional for Trezor config
   */
  trezorManifest?: {
    email: string;
    appUrl: string;
  };
  /**
   * @optional for KeepKey config
   */
  keepkeyConfig?: {
    apiKey: string;
    pairingInfo: {
      name: string;
      imageUrl: string;
      basePath: string;
      url: string;
    };
  };
};

export type AddChainWalletParams = {
  chain: Chain;
  wallet: ChainWallet;
  walletMethods: any;
};

export type Witness = {
  value: number;
  script: Buffer;
};

export type FixedNumberish = string | number | FixedNumber;

type ApisType = { [key in UTXOChain]?: string | any } & {
  [key in EVMChain]?: string | any;
} & {
  [key in CosmosChain]?: string;
};

export type ConnectWalletParams = {
  addChain: (params: AddChainWalletParams) => void;
  config: ConnectConfig;
  rpcUrls: { [chain in Chain]?: string };
  apis: ApisType;
};

export type ExtendParams<WalletConnectMethodNames = ''> = {
  excludedChains?: Chain[];
  config?: ConnectConfig;
  rpcUrls?: { [chain in Chain]?: string };
  apis?: ApisType;
  wallets: {
    connectMethodName: ConnectMethodNames | WalletConnectMethodNames;
    connect: (params: ConnectWalletParams) => (...params: any) => Promise<any>;
  }[];
};

export enum QuoteMode {
  TC_SUPPORTED_TO_TC_SUPPORTED = 'TC-TC',
  TC_SUPPORTED_TO_ETH = 'TC-ERC20',
  TC_SUPPORTED_TO_AVAX = 'TC-ARC20',
  TC_SUPPORTED_TO_BSC = 'TC-BEP20',
  ETH_TO_TC_SUPPORTED = 'ERC20-TC',
  ETH_TO_ETH = 'ERC20-ERC20',
  ETH_TO_AVAX = 'ERC20-ARC20',
  ETH_TO_BSC = 'ERC20-BEP20',
  AVAX_TO_TC_SUPPORTED = 'ARC20-TC',
  AVAX_TO_ETH = 'ARC20-ERC20',
  AVAX_TO_AVAX = 'ARC20-ARC20',
  AVAX_TO_BSC = 'ARC20-BEP20',
  BSC_TO_TC_SUPPORTED = 'BEP20-TC',
  BSC_TO_ETH = 'BEP20-ERC20',
  BSC_TO_AVAX = 'BEP20-ARC20',
  BSC_TO_BSC = 'BEP20-BEP20',
  GAIA_TO_OSMO = 'OSMOSIS-IBC',
  MAYA_SUPPORTED_TO_MAYA_SUPPORTED = 'MAYA_SUPPORTED_TO_MAYA_SUPPORTED',
  CHANGELLY = 'CHANGELLY',
}

export type Asset = {
  chain: Chain;
  symbol: string;
  ticker: string;
  synth?: boolean;
};

export const OSMOSIS_SWAP = [QuoteMode.GAIA_TO_OSMO];

export const CENTRALIZED_SWAPPER = [QuoteMode.CHANGELLY]

export const AGG_SWAP = [QuoteMode.ETH_TO_ETH, QuoteMode.AVAX_TO_AVAX, QuoteMode.BSC_TO_BSC];

export const SWAP_IN = [
  QuoteMode.ETH_TO_TC_SUPPORTED,
  QuoteMode.ETH_TO_AVAX,
  QuoteMode.ETH_TO_BSC,
  QuoteMode.AVAX_TO_TC_SUPPORTED,
  QuoteMode.AVAX_TO_ETH,
  QuoteMode.AVAX_TO_BSC,
  QuoteMode.BSC_TO_TC_SUPPORTED,
  QuoteMode.BSC_TO_ETH,
  QuoteMode.BSC_TO_AVAX,
];

export const SWAP_OUT = [
  QuoteMode.TC_SUPPORTED_TO_TC_SUPPORTED,
  QuoteMode.TC_SUPPORTED_TO_ETH,
  QuoteMode.TC_SUPPORTED_TO_AVAX,
  QuoteMode.TC_SUPPORTED_TO_BSC,
];

export const UXTO_SWAP = [
  QuoteMode.MAYA_SUPPORTED_TO_MAYA_SUPPORTED,
];

export function classifySwap(quoteMode:QuoteMode) {
  if (AGG_SWAP.includes(quoteMode)) {
    return 'AGG_SWAP';
  }
  if (SWAP_IN.includes(quoteMode)) {
    return 'SWAP_IN';
  }
  if (SWAP_OUT.includes(quoteMode)) {
    return 'SWAP_OUT';
  }
  if (OSMOSIS_SWAP.includes(quoteMode)) {
    return 'OSMOSIS_SWAP';
  }
  if (CENTRALIZED_SWAPPER.includes(quoteMode)) {
    return 'CENTRALIZED_SWAPPER';
  }
  return null;
}
