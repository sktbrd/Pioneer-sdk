import { Chain } from '@coinmasters/types';
import { formatBigIntToSafeValue, RequestClient } from '@pioneer-platform/helpers';

import type { AddressInfo } from '../types/ethplorer-api-types.ts';
const baseUrl = 'https://api.ethplorer.io';

export const ethplorerApi = (apiKey = 'freekey') => ({
  getBalance: async (address: string) => {
    try {
      // Assuming RequestClient.get is correctly implemented elsewhere
      const { tokens = [] } = await RequestClient.get<AddressInfo>(
        `${baseUrl}/getAddressInfo/${address}`,
        { searchParams: { apiKey } },
      );
      //console.log('tokens: ', tokens);

      const tokenBalances = [];
      for (const token of tokens) {
        const {
          tokenInfo: { symbol, decimals, address: tokenAddress },
          rawBalance,
        } = token;
        tokenBalances.push({
          chain: Chain.Ethereum,
          symbol: tokenAddress ? `${symbol}-${tokenAddress}` : symbol,
          value: formatBigIntToSafeValue({
            value: BigInt(rawBalance),
            decimal: parseInt(decimals),
          }),
          decimal: parseInt(decimals) || 0,
        });
      }
      //console.log('tokenBalances: ', tokenBalances);
      return tokenBalances;
    } catch (error) {
      console.error(`Error fetching balance: ${error}`);
      // Depending on your use case, you might want to rethrow the error or handle it differently
      throw error;
    }
  },
});

export type EthplorerApiType = ReturnType<typeof ethplorerApi>;
