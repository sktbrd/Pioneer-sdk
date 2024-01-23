import type { TransferParams } from '@coinmasters/toolbox-cosmos';
import { DEFAULT_COSMOS_FEE_MAINNET, GaiaToolbox } from '@coinmasters/toolbox-cosmos';
import { Chain, ChainId, DerivationPath, RPCUrl, ApiUrl } from '@coinmasters/types';
import { StargateClient } from '@cosmjs/stargate';
import type { KeepKeySdk } from '@keepkey/keepkey-sdk';
// @ts-ignore
import * as LoggerModule from "@pioneer-platform/loggerdog";
const log = LoggerModule.default();
import { bip32ToAddressNList } from '../helpers/coins.ts';

const TAG = " | cosmos | ";

export type SignTransactionTransferParams = {
  asset: string;
  amount: any;
  to: string;
  from: string;
  memo: string | undefined;
};

export const cosmosWalletMethods: any = async ({ sdk, api }: { sdk: KeepKeySdk; api: string }) => {
  let tag = TAG + " | cosmosWalletMethods | ";
  try {
    if (!api) api = ApiUrl.Cosmos;
    const { address: fromAddress } = (await sdk.address.cosmosGetAddress({
      address_n: bip32ToAddressNList(DerivationPath[Chain.Cosmos]),
    })) as { address: string };

    log.info("api: ", api);
    const toolbox = GaiaToolbox({ server: api });
    DEFAULT_COSMOS_FEE_MAINNET.amount[0].amount = String(await (async () => {
      try {
        return await toolbox?.getFeeRateFromThorswap?.(ChainId.Cosmos);
      } catch (error) {
        log.error("Cosmos Error getting fee rate:", error);
        return '500';
      }
    })() ?? '500');

    // Function to sign the transaction
    const signTransaction = async (input:any, isIbc = false) => {
      try {
        let responseSign;
        if (isIbc) {
          responseSign = await sdk.cosmos.cosmosSignAminoIbcTransfer(input);
        } else {
          responseSign = await sdk.cosmos.cosmosSignAmino(input);
        }
        return responseSign;
      } catch (e) {
        console.error(e);
        throw e;
      }
    };

    // Function to broadcast the transaction
    const broadcastTransaction = async (serializedTx:string) => {
      const decodedBytes = atob(serializedTx);
      const uint8Array = new Uint8Array(decodedBytes.length);
      for (let i = 0; i < decodedBytes.length; i++) {
        uint8Array[i] = decodedBytes.charCodeAt(i);
      }
      const client = await StargateClient.connect(RPCUrl.Cosmos);
      const response = await client.broadcastTx(uint8Array);
      return response.transactionHash;
    };

    // Transfer function
    const transfer = async ({ assetValue, recipient, memo }: TransferParams) => {
      const accountInfo = await toolbox.getAccount(fromAddress);
      const input = {
        signDoc: {
          fee: DEFAULT_COSMOS_FEE_MAINNET,
          memo: memo || '',
          sequence: accountInfo?.sequence.toString() ?? '',
          chain_id: ChainId.Cosmos,
          account_number: accountInfo?.accountNumber.toString() ?? '',
          msgs: [
            {
              value: { amount: [{ denom: 'uatom', amount: assetValue.getBaseValue('string') }], to_address: recipient, from_address: fromAddress },
              type: 'cosmos-sdk/MsgSend',
            },
          ],
        },
        signerAddress: fromAddress,
      };

      const signedTx = await signTransaction(input);
      return await broadcastTransaction(signedTx.serialized);
    };

    // Transfer IBC function
    const ibcTransfer = async (from:string, to:string, amount:string, sourceChannel:string) => {
      let tag = TAG+ " | transferIbc | "
      try {
        log.info("transferIbc: ",{from,to,amount,sourceChannel})
        const accountInfo = await toolbox.getAccount(fromAddress);
        if (!accountInfo) throw new Error("missing accountInfo");
        log.info(tag,"accountInfo: ",accountInfo)
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
        log.error(tag, "Error in transferIbc:", e);
        throw e;
      }
    };

    return { ...toolbox, getAddress: () => fromAddress, transfer, ibcTransfer };
  } catch (e) {
    log.error(tag, e);
    throw e;
  }
};
