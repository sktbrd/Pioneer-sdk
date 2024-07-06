import type { ChainId } from '@coinmasters/types';
import { ChainIdToChain } from '@coinmasters/types';
import { formatBigIntToSafeValue, RequestClient } from '@pioneer-platform/helpers';
// @ts-ignore
import { thorchainToCaip } from '@pioneer-platform/pioneer-caip';

type CovalentBalanceResponse = {
  address: string;
  updated_at: string;
  next_updated_at: string;
  quote_currency: string;
  items: {
    contract_decimals: number;
    contract_name: string;
    contract_ticker_symbol: string;
    contract_address: string;
    supports_erc: null | any[];
    logo_url: string;
    last_transferred_at: string;
    native_token: boolean;
    type: string;
    balance: number;
    balance_24h: number;
    quote_rate: number;
    quote_rate_24h: number;
    quote: number;
    quote_24h: number;
  }[];
};
type AddressObject = {
  address: string;
};

export const covalentApi = ({ apiKey, chainId }: { apiKey: string; chainId: ChainId }) => ({
  getBalance: async (address: any) => {
    try {
      const { data } = await RequestClient.get<{ data: CovalentBalanceResponse }>(
        `https://api.covalenthq.com/v1/${chainId}/address/${address}/balances_v2/`,
        { searchParams: { key: apiKey } },
      );

      const balances = [];
      const items = data?.items || [];

      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (let i = 0; i < items.length; i++) {
        const {
          balance,
          contract_decimals,
          contract_ticker_symbol,
          contract_address,
          native_token,
        } = items[i];
        //console.log('item: ', items[i]);

        const caip = thorchainToCaip(
          `${contract_ticker_symbol}${native_token ? '' : `-${contract_address}`}`,
        );

        // If thorchainToCaip does not return a value, skip this item
        if (!caip) {
          console.error('Error Unknown balance! :', items[i]);
          continue;
        }

        balances.push({
          value: formatBigIntToSafeValue({ value: BigInt(balance), decimal: contract_decimals }),
          decimal: contract_decimals,
          chain: ChainIdToChain[chainId],
          symbol: `${contract_ticker_symbol}${native_token ? '' : `-${contract_address}`}`,
          caip,
        });
      }

      return balances;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return [];
    }
  },
});

// export const covalentApi = ({ apiKey, chainId }: { apiKey: string; chainId: ChainId }) => ({
//   getBalance: async (address: any) => {
//     //console.log('address: ', address);
//     //console.log('address: ', address);
//     // console.log(
//     //   'URL: ',
//     //   `https://api.covalenthq.com/v1/${chainId}/address/${address}/balances_v2/`,
//     // );
//     const { data } = await RequestClient.get<{ data: CovalentBalanceResponse }>(
//       `https://api.covalenthq.com/v1/${chainId}/address/${address}/balances_v2/`,
//       { searchParams: { key: apiKey } },
//     );
//     //console.log('data: ', data);
//     return (data?.items || []).map(
//       ({ balance, contract_decimals, contract_ticker_symbol, contract_address, native_token }) => ({
//         value: formatBigIntToSafeValue({ value: BigInt(balance), decimal: contract_decimals }),
//         decimal: contract_decimals,
//         chain: ChainIdToChain[chainId],
//         symbol: `${contract_ticker_symbol}${native_token ? '' : `-${contract_address}`}`,
//         caip: thorchainToCaip(
//           `${contract_ticker_symbol}${native_token ? '' : `-${contract_address}`}`,
//         ),
//       }),
//     );
//   },
// });

export type CovalentApiType = ReturnType<typeof covalentApi>;
