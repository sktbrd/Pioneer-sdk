import type { TransferParams } from '@coinmasters/toolbox-cosmos';
import { OsmosisToolbox } from '@coinmasters/toolbox-cosmos';
import { Chain, ChainId, DerivationPath } from '@coinmasters/types';
import type { KeepKeySdk } from '@keepkey/keepkey-sdk';

import { bip32ToAddressNList } from '../helpers/coins.ts';

export type SignTransactionTransferParams = {
  asset: string;
  amount: any;
  to: string;
  from: string;
  memo: string | undefined;
};

const DEFAULT_OSMO_FEE_MAINNET = {
  amount: [{ denom: 'uosmo', amount: '3500' }],
  gas: '500000',
};

export const osmosisWalletMethods: any = async ({ sdk, api }: { sdk: KeepKeySdk; api: string }) => {
  let tag = ' | osmosisWalletMethods | ';
  try {
    const { address: fromAddress } = (await sdk.address.osmosisGetAddress({
      address_n: bip32ToAddressNList(DerivationPath[Chain.Osmosis]),
    })) as { address: string };

    const toolbox = OsmosisToolbox({ server: api });
    DEFAULT_OSMO_FEE_MAINNET.amount[0].amount = String(
      //@ts-ignore
      '3500',
    );

    const signTransactionTransfer = async ({
      amount,
      to,
      from,
      memo = '',
    }: SignTransactionTransferParams) => {
      try {
        console.log(tag, 'fromAddress: ', fromAddress);
        let accountInfo = await toolbox.getAccount(fromAddress);
        console.log('accountInfo: ', accountInfo);
        let { sequence, account_number } = accountInfo.account; // Corrected path
        console.log('sequence: ', sequence);
        console.log('account_number: ', account_number);

        let unSignedTx = {
          signerAddress: fromAddress,
          signDoc: {
            fee: DEFAULT_OSMO_FEE_MAINNET,
            memo: memo || '',
            sequence: sequence || '0',
            chain_id: ChainId.Osmosis,
            account_number: account_number || '0',
            msgs: [
              {
                value: { amount: [{ denom: 'uosmo', amount }], to_address: to, from_address: from },
                type: 'cosmos-sdk/MsgSend',
              },
            ],
          },
        };
        console.log('unSignedTx: ', unSignedTx);
        console.log('unSignedTx: ', JSON.stringify(unSignedTx));
        const keepKeySignedTx = await sdk.osmosis.osmosisSignAmino(unSignedTx);
        console.log('keepKeySignedTx: ', keepKeySignedTx);
        console.log('keepKeySignedTx: ', JSON.stringify(keepKeySignedTx));

        let resultBroadcast = await toolbox.sendRawTransaction(keepKeySignedTx.serialized);
        console.log('resultBroadcast: ', resultBroadcast);

        return resultBroadcast.txid;
      } catch (e) {
        console.error(e);
        throw e;
      }
    };

    const transfer = ({ assetValue, recipient, memo }: TransferParams) =>
      signTransactionTransfer({
        from: fromAddress,
        to: recipient,
        asset: 'uosmo',
        amount: assetValue.getBaseValue('string'),
        memo,
      });

    return { ...toolbox, getAddress: () => fromAddress, transfer };
  } catch (e) {
    console.error(e);
    throw e;
  }
};
