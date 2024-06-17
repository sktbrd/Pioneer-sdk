import type { TransferParams } from '@coinmasters/toolbox-cosmos';
import { DEFAULT_COSMOS_FEE_MAINNET, GaiaToolbox } from '@coinmasters/toolbox-cosmos';
import { ApiUrl, Chain, ChainId, DerivationPath, RPCUrl } from '@coinmasters/types';
import { StargateClient } from '@cosmjs/stargate';
import type { KeepKeySdk } from '@keepkey/keepkey-sdk';

// @ts-ignore
// import * as LoggerModule from "@pioneer-platform/loggerdog";
// const log = LoggerModule.default();
import { bip32ToAddressNList } from '../helpers/coins.ts';

const TAG = ' | cosmos | ';

export type SignTransactionTransferParams = {
  asset: string;
  amount: any;
  to: string;
  from: string;
  memo: string | undefined;
};

export const cosmosWalletMethods: any = async ({ sdk, api }: { sdk: KeepKeySdk; api: string }) => {
  let tag = TAG + ' | cosmosWalletMethods | ';
  try {
    console.time('cosmosWalletMethods - total time');

    if (!api) api = ApiUrl.Cosmos;

    console.time('GaiaToolbox initialization');
    const toolbox = GaiaToolbox({ server: api });
    console.timeEnd('GaiaToolbox initialization');

    console.time('Setting DEFAULT_COSMOS_FEE_MAINNET amount');
    // DEFAULT_COSMOS_FEE_MAINNET.amount[0].amount = String(
    //   (await (async () => {
    //     console.time('Fetching fee rate');
    //     try {
    //       const feeRate = await toolbox?.getFeeRateFromThorswap?.(ChainId.Cosmos);
    //       console.timeEnd('Fetching fee rate');
    //       return feeRate;
    //     } catch (error) {
    //       console.timeEnd('Fetching fee rate');
    //       //log.error("Cosmos Error getting fee rate:", error);
    //       return '1000';
    //     }
    //   })()) ?? '1000',
    // );
    console.timeEnd('Setting DEFAULT_COSMOS_FEE_MAINNET amount');

    // Function to sign the transaction
    const signTransaction = async (input: any, isIbc = false) => {
      console.time('signTransaction');
      try {
        let responseSign;
        if (isIbc) {
          responseSign = await sdk.cosmos.cosmosSignAminoIbcTransfer(input);
        } else {
          responseSign = await sdk.cosmos.cosmosSignAmino(input);
        }
        console.timeEnd('signTransaction');
        return responseSign;
      } catch (e) {
        console.timeEnd('signTransaction');
        console.error(e);
        throw e;
      }
    };

    // Function to broadcast the transaction
    const broadcastTransaction = async (serializedTx: string) => {
      console.time('broadcastTransaction');
      console.log(tag, 'serializedTx: ', serializedTx);
      const response = await toolbox.broadcast(serializedTx);
      console.timeEnd('broadcastTransaction');
      return response;
    };

    // Transfer function
    const transfer = async ({ assetValue, recipient, memo }: TransferParams) => {
      console.time('transfer');
      const fromAddress = await getAddress();
      const accountInfo = await toolbox.getAccount(fromAddress);
      const input = {
        signDoc: {
          fee: DEFAULT_COSMOS_FEE_MAINNET,
          memo: memo || '',
          sequence: (accountInfo?.sequence).toString() ?? '',
          chain_id: ChainId.Cosmos,
          account_number: accountInfo?.accountNumber.toString() ?? '',
          msgs: [
            {
              value: {
                amount: [{ denom: 'uatom', amount: assetValue.getBaseValue('string') }],
                to_address: recipient,
                from_address: fromAddress,
              },
              type: 'cosmos-sdk/MsgSend',
            },
          ],
        },
        signerAddress: fromAddress,
      };

      const signedTx = await signTransaction(input);
      const result = await broadcastTransaction(signedTx.serialized);
      console.timeEnd('transfer');
      return result;
    };

    // Transfer IBC function
    const ibcTransfer = async (from: string, to: string, amount: string, sourceChannel: string) => {
      console.time('ibcTransfer');
      let tag = TAG + ' | transferIbc | ';
      try {
        //log.info("transferIbc: ",{from,to,amount,sourceChannel})
        const fromAddress = await getAddress();
        const accountInfo = await toolbox.getAccount(fromAddress);
        if (!accountInfo) throw new Error('missing accountInfo');

        //log.info(tag,"accountInfo: ",accountInfo)
        // const input = {
        //   signDoc: {
        //     account_number: accountInfo.accountNumber.toString(),
        //     chain_id: ChainId.Cosmos,
        //     fee: DEFAULT_COSMOS_FEE_MAINNET,
        //     memo: '',
        //     msg: [
        //       {
        //         type: "cosmos-sdk/MsgTransfer",
        //         value: {
        //           receiver: to,
        //           sender: from,
        //           source_channel: sourceChannel,
        //           source_port: "transfer",
        //           timeout_height: {
        //             revision_height: (parseInt(accountInfo?.height) + 10000).toString(),
        //             revision_number: "1"
        //           },
        //           token: {
        //             amount: amount,
        //             denom: "uatom"
        //           }
        //         }
        //       }
        //     ],
        //     sequence: accountInfo.sequence.toString()
        //   },
        //   signerAddress: fromAddress,
        // };
        //
        // const signedTx = await signTransaction(input, true);
        // return await broadcastTransaction(signedTx.serialized);
      } catch (e) {
        //log.error(tag, "Error in transferIbc:", e);
        throw e;
      } finally {
        console.timeEnd('ibcTransfer');
      }
    };

    const getAddress = async () => {
      console.time('getAddress');
      const { address } = (await sdk.address.cosmosGetAddress({
        address_n: bip32ToAddressNList(DerivationPath[Chain.Cosmos]),
      })) as { address: string };
      console.timeEnd('getAddress');
      return address;
    };

    const getPubkeys = async () => ({ type: 'address', pubkey: await getAddress() });

    console.timeEnd('cosmosWalletMethods - total time');
    return { ...toolbox, getAddress, getPubkeys, transfer, ibcTransfer };
  } catch (error: any) {
    console.error(error);
    throw error;
  }
};
