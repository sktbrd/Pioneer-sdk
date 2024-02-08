import type { DepositParam, TransferParams } from '@coinmasters/toolbox-cosmos';
import { MayachainToolbox } from '@coinmasters/toolbox-cosmos';
import type {} from '@coinmasters/types';
import { Chain, ChainId, DerivationPath } from '@coinmasters/types';
import type { KeepKeySdk } from '@keepkey/keepkey-sdk';

import { bip32ToAddressNList } from '../helpers/coins.ts';

type SignTransactionTransferParams = {
  asset: string;
  amount: any;
  to: string;
  from: string;
  memo: string | undefined;
};

type SignTransactionDepositParams = {
  asset: string;
  amount: any;
  from: string;
  memo: string | undefined;
};

export const mayachainWalletMethods: any = async ({ sdk }: { sdk: KeepKeySdk }) => {
  try {
    const toolbox = MayachainToolbox();
    const { address: fromAddress } = (await sdk.address.mayachainGetAddress({
      address_n: bip32ToAddressNList(DerivationPath[Chain.THORChain]),
    })) as { address: string };

    const signTransactionTransfer = async ({
      amount,
      asset,
      to,
      from,
      memo,
    }: SignTransactionTransferParams) => {
      try {
        const accountInfo = await toolbox.getAccount(from);
        // console.log('accountInfo: ', accountInfo);
        let account_number = accountInfo.result.value.account_number || '0';
        let sequence = accountInfo.result.value.sequence || '0';
        // console.log('account_number: ', account_number);
        // console.log('sequence: ', sequence);
        let payload: any = {
          signDoc: {
            account_number,
            chain_id: ChainId.Mayachain,
            fee: { gas: '500000000', amount: [] },
            msgs: [
              {
                value: {
                  amount: [{ denom: asset.toLowerCase(), amount: amount.toString() }],
                  to_address: to,
                  from_address: from,
                },
                type: 'mayachain/MsgSend' as const,
              },
            ],
            memo: memo || '',
            sequence,
          },
          signerAddress: from,
        }
        // console.log('payload: ', payload);
        console.log('payload: ', JSON.stringify(payload));
        const keepKeyResponse = await sdk.mayachain.mayachainSignAminoTransfer(payload);
        console.log('keepKeyResponse: ', keepKeyResponse);

        // Broadcast tx
        let resultBroadcast = await toolbox.sendRawTransaction(keepKeyResponse.serialized);
        console.log('Result broadcast: ', resultBroadcast);

        return resultBroadcast.txid;
      } catch (e) {
        console.error(e);
        throw e;
      }
    };

    const transfer = async ({ assetValue, recipient, memo }: TransferParams) =>
      signTransactionTransfer({
        from: fromAddress,
        to: recipient,
        asset: assetValue.symbol,
        amount: assetValue.getBaseValue('string'),
        memo,
      });

    const signTransactionDeposit = async ({
      amount,
      asset,
      memo = '',
    }: SignTransactionDepositParams) => {
      try {
        const accountInfo = await toolbox.getAccount(fromAddress);
        console.log('accountInfo: ', accountInfo);
        let account_number = accountInfo.result.value.account_number || '0';
        let sequence = accountInfo.result.value.sequence || '0';
        console.log('account_number: ', account_number);
        console.log('sequence: ', sequence);
        let payload: any = {
          signerAddress: fromAddress,
          signDoc: {
            memo: memo || '',
            sequence,
            source: '0',
            account_number,
            chain_id: ChainId.Mayachain,
            fee: { gas: '500000000', amount: [] },
            msgs: [
              {
                value: {
                  coins: [{ asset: 'MAYA.' + asset.toUpperCase(), amount: amount.toString() }],
                  memo: memo || '',
                  signer: fromAddress,
                },
                type: 'mayachain/MsgDeposit',
              },
            ],
          },
        };
        console.log('payload: ', payload);
        console.log('payload: ', JSON.stringify(payload));
        const keepKeyResponse = await sdk.mayachain.mayachainSignAminoDeposit(payload);
        console.log('keepKeyResponse.serialized: ', keepKeyResponse.serialized);
        // Broadcast tx
        let resultBroadcast = await toolbox.sendRawTransaction(keepKeyResponse.serialized);
        console.log('Result broadcast: ', resultBroadcast);

        return resultBroadcast;
      } catch (e) {
        console.error(e);
        throw e;
      }
    };

    const deposit = async ({ assetValue, memo }: DepositParam) =>
      signTransactionDeposit({
        memo,
        asset: assetValue.symbol,
        amount: assetValue.getBaseValue('string'),
        from: fromAddress,
      });

    return { ...toolbox, getAddress: () => fromAddress, transfer, deposit };
  } catch (e) {
    console.error(' | mayachain | ', e);
    throw e;
  }
};
