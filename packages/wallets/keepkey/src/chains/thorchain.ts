import type { DepositParam, TransferParams } from '@coinmasters/toolbox-cosmos';
import { ThorchainToolboxPioneer } from '@coinmasters/toolbox-cosmos';
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

export const thorchainWalletMethods: any = async ({ sdk }: { sdk: KeepKeySdk }) => {
  try {
    const toolbox = ThorchainToolboxPioneer();

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
        const keepKeyResponse = await sdk.thorchain.thorchainSignAminoTransfer({
          signDoc: {
            account_number,
            chain_id: ChainId.THORChain,
            fee: { gas: '500000000', amount: [] },
            msgs: [
              {
                value: {
                  amount: [{ denom: asset.split('.')[0].toLowerCase(), amount: amount.toString() }],
                  to_address: to,
                  from_address: from,
                },
                type: 'thorchain/MsgSend' as const,
              },
            ],
            memo: memo || '',
            sequence,
          },
          signerAddress: from,
        });

        let txid = await toolbox.sendRawTransaction(keepKeyResponse.serialized);
        return txid.txid;
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
        //console.log(' | signTransactionDeposit | asset: ', asset);
        const fromAddress = await getAddress();
        const accountInfo = await toolbox.getAccount(fromAddress);
        let account_number = accountInfo.result.value.account_number || '0';
        let sequence = accountInfo.result.value.sequence || '0';
        let signPayload: any = {
          signerAddress: fromAddress,
          signDoc: {
            sequence,
            source: '0',
            memo: memo || '',
            account_number,
            chain_id: ChainId.THORChain,
            fee: {
              gas: '500000000',
              amount: [
                {
                  amount: '0',
                  denom: 'rune',
                },
              ],
            },
            msgs: [
              {
                value: {
                  coins: [{ asset, amount: amount.toString() }],
                  memo: memo || '',
                  signer: fromAddress,
                },
                type: 'thorchain/MsgDeposit',
              },
            ],
          },
        };
        //console.log('signPayload: ', signPayload);
        //console.log('signPayload: ', JSON.stringify(signPayload));
        const keepKeyResponse = await sdk.thorchain.thorchainSignAminoDeposit(signPayload);
        //console.log('keepKeyResponse: ', keepKeyResponse);
        let txid = await toolbox.sendRawTransaction(keepKeyResponse.serialized);
        return txid.txid;
      } catch (error: any) {
        console.error(error);
        throw error;
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
      const { address } = (await sdk.address.thorchainGetAddress({
        address_n: bip32ToAddressNList(DerivationPath[Chain.THORChain]),
      })) as { address: string };
      return address;
    };

    const getPubkeys = async () => ({ type: 'address', pubkey: await getAddress() });

    return { ...toolbox, getAddress, getPubkeys, transfer, deposit };
  } catch (error) {
    throw error;
  }
};
