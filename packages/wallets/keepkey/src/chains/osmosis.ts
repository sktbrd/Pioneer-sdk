/*
    Osmosis SDK
        -Highlander
 */
import type { TransferParams } from '@coinmasters/toolbox-cosmos';
import { OsmosisToolbox } from '@coinmasters/toolbox-cosmos';
import { Chain, ChainId, DerivationPath } from '@coinmasters/types';
import type { KeepKeySdk } from '@keepkey/keepkey-sdk';

// @ts-ignore
// import * as LoggerModule from "@pioneer-platform/loggerdog";
// const log = LoggerModule.default();
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
    const { address: fromAddress } = (await sdk.address.osmosisGetAddress({
      address_n: bip32ToAddressNList(DerivationPath[Chain.Osmosis]),
    })) as { address: string };

    // @ts-ignore
    const toolbox = OsmosisToolbox({ server: api });
    DEFAULT_OSMO_FEE_MAINNET.amount[0].amount = String(
      //@ts-ignore
      '3500',
    );

    //sign tx swap
    // @ts-ignore
    const build_swap_tx = async function (
      from: string,
      tokenIn: string,
      tokenOut: string,
      amountIn: string,
      amountOutMin: string,
    ) {
      let tag = TAG + ' | build_swap_tx | ';
      try {
        //get account info
        let accountInfo = await toolbox.getAccount(fromAddress);
        //log.info(tag,'accountInfo: ', accountInfo);
        let { sequence, account_number } = accountInfo.account; // Corrected path
        //log.info(tag,'sequence: ', sequence);
        //log.info(tag,'account_number: ', account_number);
        if (!sequence) throw new Error('missing sequence');
        if (!account_number) throw new Error('missing account_number');
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
        //log.error(e)
      }
    };

    let sendSwapTx = async function (swapParams: any) {
      try {
        //console.log('swapParams: ', swapParams);
        if (!swapParams.senderAddress) throw new Error('missing senderAddress');
        if (!swapParams.tokenIn) throw new Error('missing tokenIn');
        if (!swapParams.tokenOut) throw new Error('missing tokenOut');
        if (!swapParams.amountIn) throw new Error('missing amountIn');
        if (!swapParams.amountOutMin) throw new Error('missing amountOutMin');
        // Build tx
        let tx: any = await build_swap_tx(
          swapParams.senderAddress,
          swapParams.tokenIn,
          swapParams.tokenOut,
          swapParams.amountIn,
          swapParams.amountOutMin,
        );
        //console.log('Built transaction: ', tx);

        // Prepare the transaction for signing
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
        //console.log('Signable transaction: ', signableTx);
        //console.log('Signable transaction: ', JSON.stringify(signableTx));
        // Sign Tx with KeepKey
        const keepKeySignedTx = await sdk.osmosis.osmoSignAminoSwap(signableTx);
        //console.log('Signed transaction: ', keepKeySignedTx);

        // Broadcast tx
        let resultBroadcast = await toolbox.sendRawTransaction(keepKeySignedTx.serialized);
        //console.log('Result broadcast: ', resultBroadcast);

        // Return txid
        return resultBroadcast.txid;
      } catch (e) {
        console.error('Error in sendSwapTx: ', e);
        throw e;
      }
    };

    //@TODO
    //deleggate

    //redelegate

    //undeletegate

    //withdrrawal

    //osmo lp add

    //osmo lp remove

    //osmo redelegate

    const signTransactionTransfer = async ({
      amount,
      to,
      from,
      memo = '',
    }: SignTransactionTransferParams) => {
      try {
        //console.log(tag, 'fromAddress: ', fromAddress);
        let accountInfo = await toolbox.getAccount(fromAddress);
        //console.log('accountInfo: ', accountInfo);
        let { sequence, account_number } = accountInfo.account; // Corrected path
        //console.log('sequence: ', sequence);
        //console.log('account_number: ', account_number);

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
        //console.log('unSignedTx: ', unSignedTx);
        //console.log('unSignedTx: ', JSON.stringify(unSignedTx));
        // @ts-ignore
        const keepKeySignedTx = await sdk.osmosis.osmosisSignAmino(unSignedTx);
        //console.log('keepKeySignedTx: ', keepKeySignedTx);
        //console.log('keepKeySignedTx: ', JSON.stringify(keepKeySignedTx));

        let resultBroadcast = await toolbox.sendRawTransaction(keepKeySignedTx.serialized);
        //console.log('resultBroadcast: ', resultBroadcast);

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

    return { ...toolbox, getAddress: () => fromAddress, transfer, sendSwapTx };
  } catch (e) {
    console.error(e);
    throw e;
  }
};
