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

    const signTransactionTransfer = async ({
                                             amount,
                                             asset,
                                             to,
                                             from,
                                             memo,
                                           }: SignTransactionTransferParams) => {
      try {
        const accountInfo = await toolbox.getAccount(from);
        let account_number = accountInfo.result.value.account_number || '0';
        let sequence = accountInfo.result.value.sequence || '0';
        let payload: any = {
          signDoc: {
            account_number,
            chain_id: ChainId.Mayachain,
            fee: {
              gas: '500000000',
              amount: [
                {
                  amount: '0',
                  denom: 'cacao',
                },
              ],
            },
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
        };
        const keepKeyResponse = await sdk.mayachain.mayachainSignAminoTransfer(payload);

        let resultBroadcast = await toolbox.sendRawTransaction(keepKeyResponse.serialized);

        return resultBroadcast.txid;
      } catch (e) {
        console.error(e);
        throw e;
      }
    };

    const transfer = async ({ assetValue, recipient, memo }: TransferParams) => {
      const fromAddress = await getAddress();
      return signTransactionTransfer({
        from: fromAddress,
        to: recipient,
        asset: assetValue.symbol,
        amount: assetValue.getBaseValue('string'),
        memo,
      });
    };

    const signTransactionDeposit = async ({
                                            amount,
                                            asset,
                                            memo = '',
                                          }: SignTransactionDepositParams) => {
      try {
        const fromAddress = await getAddress();
        const accountInfo = await toolbox.getAccount(fromAddress);
        let account_number = accountInfo.result.value.account_number || '0';
        let sequence = accountInfo.result.value.sequence || '0';
        let payload: any = {
          signerAddress: fromAddress,
          signDoc: {
            memo: memo || '',
            sequence,
            source: '0',
            account_number,
            chain_id: ChainId.Mayachain,
            fee: {
              gas: '500000000',
              amount: [
                {
                  amount: '0',
                  denom: 'cacao',
                },
              ],
            },
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
        const keepKeyResponse = await sdk.mayachain.mayachainSignAminoDeposit(payload);
        let resultBroadcast = await toolbox.sendRawTransaction(keepKeyResponse.serialized);

        return resultBroadcast;
      } catch (e) {
        console.error(e);
        throw e;
      }
    };

    const deposit = async ({ assetValue, memo }: DepositParam) => {
      const fromAddress = await getAddress();
      return signTransactionDeposit({
        memo,
        asset: assetValue.symbol,
        amount: assetValue.getBaseValue('string'),
        from: fromAddress,
      });
    };

    const getAddress = async () => {
      const { address } = (await sdk.address.mayachainGetAddress({
        address_n: bip32ToAddressNList(DerivationPath[Chain.THORChain]),
      })) as { address: string };
      return address;
    };

    const getPubkeys = async () => ({ type: 'address', pubkey: await getAddress() });

    return { ...toolbox, getAddress, getPubkeys, transfer, deposit };
  } catch (error: any) {
    console.error(' | mayachain | ', error);
    throw error;
  }
};
