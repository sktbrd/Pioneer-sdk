import { RequestClient } from '@swapkit/helpers';
import { type UTXOChain } from '@swapkit/types';

const baseUrlPioneer = () => `https://pioneers.dev/api/v1`;

const getXpubData = async ({ pubkey, chain }: any) => {
  try {
    const url = `/utxo/getBalance/${chain}/${pubkey}`;
    let response = await RequestClient.get<any>(`${baseUrlPioneer()}${url}`);
    if (!response) response = 0;
    return response;
  } catch (error) {
    return {
      utxo: [],
      address: {
        balance: 0,
        transaction_count: 0,
      },
    };
  }
};

const listUnspent = async ({ pubkey, chain }: any) => {
  try {
    const url = `/listUnspent/${chain}/${pubkey}`;
    let response = await RequestClient.get<any>(`${baseUrlPioneer()}${url}`);
    return response;
  } catch (error) {
    return {
      utxo: [],
      address: {
        balance: 0,
        transaction_count: 0,
      },
    };
  }
};

const getUnconfirmedBalanceXpub = async ({ pubkey, chain, apiKey }: any) => {
  return await getXpubData({ pubkey, chain, apiKey });
};

export const pioneerApi = ({ apiKey, chain }: { apiKey?: string; chain: UTXOChain }) => ({
  listUnspent: (pubkey: string) => listUnspent({ chain, pubkey, apiKey }),
  // getNewAddress: (pubkey: string) => getNewAddress({ pubkey, chain, apiKey }),
  // getChangeAddress: (pubkey:string) => getChangeAddress({chain,pubkey}),
  getBalance: (pubkey: string) => getUnconfirmedBalanceXpub({ pubkey, chain, apiKey }),
});

export type BlockchairApiType = ReturnType<typeof pioneerApi>;
