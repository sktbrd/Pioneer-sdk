// src/walletFunctions.ts
//@ts-ignore
import { shortListSymbolToCaip, Chain } from '@pioneer-platform/pioneer-caip';

export const EXAMPLE_WALLET = (app: any) => ({
  shortListNameToCaip: async (params: { name: string }) => {
    if (!params.name) throw Error("No name provided");
    return shortListSymbolToCaip(Chain[params.name]);
  },
  setAssetContext: async (params: { caip: string }) => {
    if (!params.caip) throw Error("No caip provided");
    let result = await app.setAssetContext({
      caip: params.caip,
    });
    return result;
  },
  getMarketInfo: async (params: { caip: string }) => {
    if (!params.caip) throw Error("No caip provided");
    let result = await app.pioneer.MarketInfo({
      caip: params.caip,
    });
    return JSON.stringify(result.data);
  },
  getAddress: async (params: { network: any }) => {
    let pubkeys = app.pubkeys.filter((e: any) => e.networks.includes(params.network));
    if (pubkeys.length > 0) {
      return pubkeys[0].address || pubkeys[0].master;
    } else {
      throw Error("No pubkey found for " + params.network);
    }
  },
  getBalance: async (params: { network: any }) => {
    let balance = app.balances.filter((b: any) => b.networkId === params.network);
    return JSON.stringify(balance);
  }
});
