import { Chain, ChainToExplorerUrl } from '@coinmasters/types';

export const getExplorerTxUrl = ({ chain, txHash }: { txHash: string; chain: Chain }) => {
  const baseUrl = ChainToExplorerUrl[chain];

  switch (chain) {
    case Chain.Binance:
    case Chain.Dash:
    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Mayachain:
    case Chain.Kujira:
    case Chain.THORChain:
      return `${baseUrl}/tx/${txHash.startsWith('0x') ? txHash.slice(2) : txHash}`;

    case Chain.Arbitrum:
    case Chain.Avalanche:
    case Chain.BinanceSmartChain:
    case Chain.Base:
    case Chain.Ethereum:
    case Chain.Optimism:
    case Chain.Polygon:
      return `${baseUrl}/tx/${txHash.startsWith('0x') ? txHash : `0x${txHash}`}`;
    case Chain.Ripple:
    case Chain.Osmosis:
      return `${baseUrl}/tx/${txHash}`;
    case Chain.Cosmos:
      return `${baseUrl}/transactions/${txHash}`;
    case Chain.Dogecoin:
      return `${baseUrl}/transaction/${txHash.toLowerCase()}`;
    case Chain.Litecoin:
      return `${baseUrl}/${txHash}`;

    default:
      throw new Error(`Unsupported chain: ${chain}`);
  }
};

export const getExplorerAddressUrl = ({ chain, address }: { address: string; chain: Chain }) => {
  const baseUrl = ChainToExplorerUrl[chain];

  switch (chain) {
    case Chain.Arbitrum:
    case Chain.Avalanche:
    case Chain.Binance:
    case Chain.BinanceSmartChain:
    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Ripple:
    case Chain.Dogecoin:
    case Chain.Ethereum:
    case Chain.Mayachain:
    case Chain.Optimism:
    case Chain.Polygon:
    case Chain.Kujira:
    case Chain.THORChain:
      return `${baseUrl}/address/${address}`;
    case Chain.Osmosis:
    case Chain.Cosmos:
      return `${baseUrl}/account/${address}`;
    case Chain.Litecoin:
      return `${baseUrl}/${address}`;

    default:
      throw new Error(`Unsupported chain: ${chain}`);
  }
};
