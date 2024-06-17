import type { TransferParams } from '@coinmasters/toolbox-cosmos';
import { OsmosisToolbox } from '@coinmasters/toolbox-cosmos';
import { Chain, ChainId, DerivationPath } from '@coinmasters/types';
import type { KeepKeySdk } from '@keepkey/keepkey-sdk';

// @ts-ignore
import { bip32ToAddressNList } from '../helpers/coins.ts';
const TAG = ' | osmosis | ';

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
    // @ts-ignore
    const toolbox = OsmosisToolbox({ server: api });
    DEFAULT_OSMO_FEE_MAINNET.amount[0].amount = String('3500');

    const signTransactionTransfer = async ({
                                             amount,
                                             to,
                                             from,
                                             memo = '',
                                           }: SignTransactionTransferParams) => {
      try {
        const fromAddress = await getAddress();
        let accountInfo = await toolbox.getAccount(fromAddress);
        let { sequence, account_number } = accountInfo.account; // Corrected path

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

        const keepKeySignedTx = await sdk.osmosis.osmosisSignAmino(unSignedTx);

        let resultBroadcast = await toolbox.sendRawTransaction(keepKeySignedTx.serialized);

        return resultBroadcast.txid;
      } catch (error: any) {
        console.error(error);
        throw error;
      }
    };

    const transfer = async ({ assetValue, recipient, memo }: TransferParams) => {
      const fromAddress = await getAddress();
      return signTransactionTransfer({
        from: fromAddress,
        to: recipient,
        asset: 'uosmo',
        amount: assetValue.getBaseValue('string'),
        memo,
      });
    };

    const build_swap_tx = async (
      from: string,
      tokenIn: string,
      tokenOut: string,
      amountIn: string,
      amountOutMin: string,
    ) => {
      try {
        const fromAddress = await getAddress();
        let accountInfo = await toolbox.getAccount(fromAddress);
        let { sequence, account_number } = accountInfo.account; // Corrected path

        const amountInBaseUnits = Number(amountIn) * Math.pow(10, 6); // Assuming amountIn is in OSMO which has 6 decimal places
        const amountInBaseUnitsString = amountInBaseUnits.toFixed(0); // Convert to string without decimals

        const amountOutMinBaseUnits = Number(amountOutMin) * Math.pow(10, 6); // Assuming amountIn is in OSMO which has 6 decimal places
        const amountOutMinBaseUnitsString = amountOutMinBaseUnits.toFixed(0); // Convert to string without decimals

        let tx = {
          account_number: account_number,
          chain_id: 'osmosis-1',
          fee: {
            amount: [
              {
                amount: '2291',
                denom: 'uatom',
              },
            ],
            gas: '100000',
          },
          memo: 'memo',
          msg: [
            {
              type: 'osmosis/gamm/swap-exact-amount-in',
              value: {
                routes: [
                  {
                    pool_id: '1',
                    token_out_denom: tokenOut,
                  },
                ],
                sender: from,
                token_in: {
                  amount: amountInBaseUnitsString,
                  denom: tokenIn,
                },
                token_out_min_amount: amountOutMinBaseUnitsString,
              },
            },
          ],
          sequence: sequence,
        };

        return tx;
      } catch (e) {
        console.error(e);
        throw e;
      }
    };

    const sendSwapTx = async (swapParams: any) => {
      try {
        if (!swapParams.senderAddress) throw new Error('missing senderAddress');
        if (!swapParams.tokenIn) throw new Error('missing tokenIn');
        if (!swapParams.tokenOut) throw new Error('missing tokenOut');
        if (!swapParams.amountIn) throw new Error('missing amountIn');
        if (!swapParams.amountOutMin) throw new Error('missing amountOutMin');

        let tx: any = await build_swap_tx(
          swapParams.senderAddress,
          swapParams.tokenIn,
          swapParams.tokenOut,
          swapParams.amountIn,
          swapParams.amountOutMin,
        );

        let signableTx = {
          signerAddress: swapParams.senderAddress,
          signDoc: {
            fee: tx.fee,
            memo: tx.memo,
            sequence: tx.sequence,
            chain_id: 'osmosis-1',
            account_number: tx.account_number,
            msgs: tx.msg,
          },
        };

        const keepKeySignedTx = await sdk.osmosis.osmoSignAminoSwap(signableTx);

        let resultBroadcast = await toolbox.sendRawTransaction(keepKeySignedTx.serialized);

        return resultBroadcast.txid;
      } catch (e) {
        console.error('Error in sendSwapTx: ', e);
        throw e;
      }
    };

    const getAddress = async () => {
      const { address } = (await sdk.address.osmosisGetAddress({
        address_n: bip32ToAddressNList(DerivationPath[Chain.Osmosis]),
      })) as { address: string };
      return address;
    };

    const getPubkeys = async () => ({ type: 'address', pubkey: await getAddress() });

    return { ...toolbox, getAddress, getPubkeys, transfer, sendSwapTx };
  } catch (error: any) {
    console.error(error);
    throw error;
  }
};
