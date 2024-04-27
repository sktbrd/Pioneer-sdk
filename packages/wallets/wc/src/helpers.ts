import type { EVMChain } from '@coinmasters/types';
import { Chain } from '@coinmasters/types';

import {
  ARBITRUM_ONE_MAINNET_ID,
  AVALACHE_MAINNET_ID,
  BINANCE_MAINNET_ID,
  BSC_MAINNET_ID,
  COSMOS_HUB_MAINNET_ID,
  ETHEREUM_MAINNET_ID,
  KUJIRA_MAINNET_ID,
  MAYACHAIN_MAINNET_ID,
  OPTIMISM_MAINNET_ID,
  POLYGON_MAINNET_ID,
  THORCHAIN_MAINNET_ID,
} from './constants.ts';

export const getAddressFromAccount = (account: string) => {
  try {
    return account.split(':')[2];
  } catch (error) {
    throw new Error('Invalid WalletConnect account');
  }
};

export const getAddressByChain = (
  chain: EVMChain,
  accounts: string[],
): string =>
  getAddressFromAccount(
    accounts.find((account) => account.startsWith(chainToChainId(chain))) || '',
  );

export const chainToChainId = (chain: Chain) => {
  switch (chain) {
    case Chain.Avalanche:
      return AVALACHE_MAINNET_ID;
    case Chain.BinanceSmartChain:
      return BSC_MAINNET_ID;
    case Chain.Ethereum:
      return ETHEREUM_MAINNET_ID;
    case Chain.THORChain:
      return THORCHAIN_MAINNET_ID;
    case Chain.Arbitrum:
      return ARBITRUM_ONE_MAINNET_ID;
    case Chain.Optimism:
      return OPTIMISM_MAINNET_ID;
    case Chain.Polygon:
      return POLYGON_MAINNET_ID;
    default:
      return '';
  }
};
