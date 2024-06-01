import { AssetValue } from '@pioneer-platform/helpers';
import { ChainId, FeeOption, RPCUrl } from '@coinmasters/types';
import type { OfflineSigner } from '@cosmjs/proto-signing';
import type { SigningStargateClientOptions } from '@cosmjs/stargate';

import type { CosmosMaxSendableAmountParams } from './types.ts';

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
  from,
  toolbox,
  asset,
  feeOptionKey = FeeOption.Fast,
}: CosmosMaxSendableAmountParams): Promise<AssetValue> => {
  let tag = ' | estimateMaxSendableAmount | ';
  try {
    if (!from) throw Error('Unable to estimate max sendable amount without a valid from address');
    // Determine if asset is a string and convert to AssetValue, otherwise use it directly
    const assetEntity: AssetValue | undefined =
      typeof asset === 'string' ? await AssetValue.fromString(asset) : asset;
    //console.log(tag, 'assetEntity: ', assetEntity);
    //console.log(tag, 'from: ', from);
    // Retrieve balances for the account
    const balances = await toolbox.getBalance([{ address: from }]);
    //console.log(tag, 'balances: ', balances);
    if (balances.length === 0) throw Error('No balances found for the specified address');
    // Find the balance for the specified asset
    const balance = balances.find(({ symbol, chain }) =>
      asset
        ? symbol === assetEntity?.symbol
        : symbol === AssetValue.fromChainOrSignature(chain).symbol,
    );
    if (!balance) throw Error('No balances found for the specified symbol or chain  ');
    // Retrieve fees
    const fees = await toolbox.getFees();
    //console.log(tag, 'fees: ', fees);

    // If no balance for the asset, return zero amount of the asset
    if (!balance)
      return AssetValue.fromChainOrSignature(assetEntity?.chain || balances[0]?.chain, 0);

    // Subtract fees from the balance and return the result
    return balance.sub(fees[feeOptionKey]);
  } catch (e) {
    console.error(tag, 'estimateMaxSendableAmount; error: ', e);
    // Ensure a valid AssetValue is returned in case of an error to avoid runtime errors
    return AssetValue.fromChainOrSignature('MAYA', 0); // Adjust with a valid chain or handle appropriately
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
