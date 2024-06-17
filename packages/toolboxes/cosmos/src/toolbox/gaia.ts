import { type AssetValue, SwapKitNumber } from '@pioneer-platform/helpers';
import { ApiUrl, BaseDecimal, ChainId, DerivationPath } from '@coinmasters/types';
import type { OfflineDirectSigner } from '@cosmjs/proto-signing';
import type { Account } from '@cosmjs/stargate';

import { CosmosClient } from '../cosmosClient.ts';
import type { GaiaToolboxType } from '../index.ts';
import type { TransferParams } from '../types.ts';

import { BaseCosmosToolbox, getFeeRateFromThorswap } from './BaseCosmosToolbox.ts';

export const GaiaToolbox = ({ server }: { server?: string } = {}): GaiaToolboxType => {
  console.time('CosmosClient instantiation');
  const clientStartTime = new Date().toISOString();
  console.log(`CosmosClient instantiation start: ${clientStartTime}`);

  const client = new CosmosClient({
    server: server || ApiUrl.Cosmos,
    chainId: ChainId.Cosmos,
  });

  const clientEndTime = new Date().toISOString();
  console.log(`CosmosClient instantiation end: ${clientEndTime}`);
  console.timeEnd('CosmosClient instantiation');

  const baseToolbox: {
    validateAddress: (address: string) => Promise<boolean>;
    getAddressFromMnemonic: (phrase: string) => Promise<string>;
    getAccount: (address: string) => Promise<Account | null>;
    getBalance: (address: string, potentialScamFilter?: boolean) => Promise<AssetValue[]>;
    transfer: (params: TransferParams) => Promise<string>;
    getSigner: (phrase: string) => Promise<OfflineDirectSigner>;
    getSignerFromPrivateKey: (privateKey: Uint8Array) => Promise<OfflineDirectSigner>;
    getPubKeyFromMnemonic: (phrase: string) => Promise<string>;
  } = BaseCosmosToolbox({
    decimal: BaseDecimal.GAIA,
    derivationPath: DerivationPath.GAIA,
    client,
  });

  const getFees = async () => {
    console.time('getFees');
    const startTime = new Date().toISOString();
    console.log(`getFees start: ${startTime}`);

    const baseFee = (await getFeeRateFromThorswap(ChainId.Cosmos)) || 500;

    const endTime = new Date().toISOString();
    console.log(`getFees end: ${endTime}`);
    console.timeEnd('getFees');

    return {
      type: 'base',
      average: SwapKitNumber.fromBigInt(BigInt(baseFee), BaseDecimal.GAIA),
      fast: SwapKitNumber.fromBigInt((BigInt(baseFee) * 15n) / 10n, BaseDecimal.GAIA),
      fastest: SwapKitNumber.fromBigInt(BigInt(baseFee) * 2n, BaseDecimal.GAIA),
    };
  };

  const transfer = async (params: TransferParams) => {
    console.time('transfer');
    const startTime = new Date().toISOString();
    console.log(`transfer start: ${startTime}`);

    const gasFees = await getFees();

    const result = await baseToolbox.transfer({
      ...params,
      fee: params.fee || {
        amount: [
          {
            denom: 'uatom',
            amount: gasFees[params.feeOptionKey || 'fast'].getBaseValue('string') || '1000',
          },
        ],
        gas: '200000',
      },
    });

    const endTime = new Date().toISOString();
    console.log(`transfer end: ${endTime}`);
    console.timeEnd('transfer');

    return result;
  };

  return {
    ...baseToolbox,
    getFees,
    transfer,
  };
};
