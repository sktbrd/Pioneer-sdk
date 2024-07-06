import { ChainId, FeeOption, RPCUrl } from '@coinmasters/types';
import type { OfflineSigner } from '@cosmjs/proto-signing';
import type { SigningStargateClientOptions } from '@cosmjs/stargate';
import type { AssetValue } from '@pioneer-platform/helpers';

import type { CosmosMaxSendableAmountParams } from './types.ts';
const TAG = ' | COSMOS | UTILS | ';
const headers =
  typeof window !== 'undefined'
    ? ({} as { [key: string]: string })
    : { referer: 'https://sk.thorswap.net', referrer: 'https://sk.thorswap.net' };

export const DEFAULT_COSMOS_FEE_MAINNET = {
  amount: [{ denom: 'uatom', amount: '500' }],
  gas: '200000',
};

export const getDenom = (symbol: string, isThorchain = false) =>
  isThorchain ? symbol.toLowerCase() : symbol;

export const createStargateClient = async (url: string) => {
  const { StargateClient } = await import('@cosmjs/stargate');

  return StargateClient.connect({ url, headers });
};

export const createSigningStargateClient = async (
  url: string,
  signer: any,
  options: SigningStargateClientOptions = {},
) => {
  const { SigningStargateClient, GasPrice } = await import('@cosmjs/stargate');

  return SigningStargateClient.connectWithSigner({ url, headers }, signer, {
    gasPrice: GasPrice.fromString('0.0003uatom'),
    ...options,
  });
};

export const createOfflineStargateClient = async (
  wallet: OfflineSigner,
  registry?: SigningStargateClientOptions,
) => {
  const { SigningStargateClient } = await import('@cosmjs/stargate');
  return SigningStargateClient.offline(wallet, registry);
};

export const getRPC = (chainId: ChainId, stagenet?: boolean) => {
  switch (chainId) {
    case ChainId.Cosmos:
      return RPCUrl.Cosmos;
    case ChainId.Binance:
      return RPCUrl.Binance;
    case ChainId.Kujira:
      return RPCUrl.Kujira;
    case ChainId.Osmosis:
      return RPCUrl.Osmosis;
    case ChainId.THORChain:
      return stagenet ? RPCUrl.THORChainStagenet : RPCUrl.THORChain;
    case ChainId.Maya:
      return stagenet ? RPCUrl.MayaStagenet : RPCUrl.Maya;

    default:
      return RPCUrl.Cosmos;
  }
};

export const estimateMaxSendableAmount = async ({
  pubkeys,
  from,
  toolbox,
  asset,
  feeOptionKey = FeeOption.Fast,
}: CosmosMaxSendableAmountParams): Promise<AssetValue> => {
  let tag = TAG + ' | estimateMaxSendableAmount | ';
  try {
    //console.log(tag, 'pubkeys: ', pubkeys);
    if (!pubkeys || pubkeys.length === 0) throw new Error('No pubkeys provided');

    // console.log(tag, 'assetEntity: ', assetEntity);
    //console.log(tag, 'from: ', from);
    // Retrieve balances for the account
    const balance: any = await toolbox.getBalance(pubkeys[0]);
    //console.log(tag, 'balance: ', balance);

    //TODO  Retrieve fees
    // const fees = await toolbox.getFees();
    // console.log(tag, 'fees: ', fees);
    //
    // //max send
    // let newAmount = balance.balance - fees[feeOptionKey];
    // await AssetValue.loadStaticAssets();
    // let outputBalance = AssetValue.fromStringSync(balance.identifier, newAmount);

    return balance;
  } catch (e) {
    console.error(tag, 'estimateMaxSendableAmount; error: ', e);
    throw e;
  }
};

// export const estimateMaxSendableAmount = async ({
//   from,
//   toolbox,
//   asset,
//   feeOptionKey = FeeOption.Fast,
// }: CosmosMaxSendableAmountParams): Promise<AssetValue> => {
//   const assetEntity = typeof asset === 'string' ? await AssetValue.fromString(asset) : asset;
//   const balances = await toolbox.getBalance(from);
//   const balance = balances.find(({ symbol, chain }) =>
//     asset
//       ? symbol === assetEntity?.symbol
//       : symbol === AssetValue.fromChainOrSignature(chain).symbol,
//   );
//
//   const fees = await toolbox.getFees();
//
//   if (!balance) return AssetValue.fromChainOrSignature(assetEntity?.chain || balances[0]?.chain, 0);
//
//   return balance.sub(fees[feeOptionKey]);
// };
