/*
  KeepKey UTXO Chain
      -High level UTXO methods for KeepKey
 */
import type { BaseUTXOToolbox, UTXOToolbox, UTXOTransferParams } from '@coinmasters/toolbox-utxo';
import {
  BCHToolbox,
  BTCToolbox,
  DASHToolbox,
  DOGEToolbox,
  LTCToolbox,
  ZCASHToolbox,
} from '@coinmasters/toolbox-utxo';
import type { UTXOChain } from '@coinmasters/types';
import { Chain, DerivationPath, FeeOption } from '@coinmasters/types';
import { xpubConvert } from '@pioneer-platform/pioneer-coins';
import { toCashAddress } from 'bchaddrjs';
import type { Psbt } from 'bitcoinjs-lib';

import { bip32ToAddressNList, ChainToKeepKeyName } from '../helpers/coins.ts';
const TAG = ' | kk-utxo | ';
type Params = {
  sdk: any;
  chain: UTXOChain;
  apiKey?: string;
  apiClient?: ReturnType<typeof BaseUTXOToolbox>['apiClient'];
};

interface psbtTxOutput {
  address: string;
  script: Uint8Array;
  value: number;
  change?: boolean; // Optional, assuming it indicates if the output is a change
}
interface ExtendedPsbt extends Psbt {
  txOutputs: psbtTxOutput[];
}
interface KeepKeyInputObject {
  addressNList: number[];
  scriptType: string;
  amount: string;
  vout: number;
  txid: string;
  hex: string;
}

const getToolbox = ({ chain, apiClient, apiKey }: Omit<Params, 'sdk'>) => {
  switch (chain) {
    case Chain.Bitcoin:
      return { toolbox: BTCToolbox({ apiClient, apiKey }), segwit: true };
    case Chain.Litecoin:
      return { toolbox: LTCToolbox({ apiClient, apiKey }), segwit: true };
    case Chain.Dash:
      return { toolbox: DASHToolbox({ apiClient, apiKey }), segwit: false };
    case Chain.Zcash:
      return { toolbox: ZCASHToolbox({ apiClient, apiKey }), segwit: false };
    case Chain.Dogecoin:
      return { toolbox: DOGEToolbox({ apiClient, apiKey }), segwit: false };
    case Chain.BitcoinCash:
      return { toolbox: BCHToolbox({ apiClient, apiKey }), segwit: false };
  }
};

export const utxoWalletMethods = async ({
  sdk,
  paths,
  chain,
  apiKey,
  apiClient,
}: Params): Promise<
  UTXOToolbox & {
    getAddress: () => string;
    signTransaction: (
      psbt: ExtendedPsbt,
      inputs: KeepKeyInputObject[],
      memo?: string,
    ) => Promise<string>;
    transfer: (params: UTXOTransferParams) => Promise<string>;
  }
> => {
  if (!apiKey) throw new Error('UTXO API key not found');
  const { toolbox, segwit } = getToolbox({ chain, apiClient, apiKey });

  const scriptType = segwit ? 'p2sh' : 'p2pkh';
  if (!ChainToKeepKeyName[chain]) throw Error('ChainToKeepKeyName: unknown chain: ' + chain);
  // const addressInfo = {
  //   coin: ChainToKeepKeyName[chain],
  //   script_type: scriptType,
  //   address_n: bip32ToAddressNList(DerivationPath[chain]),
  // };
  // //console.log('addressInfo: ', addressInfo);
  // const { address: walletAddress } = await sdk.address.utxoGetAddress(addressInfo);

  const getAddress = async (customAddressInfo?: any) => {
    let tag = TAG + ' | getAddress | ';
    const defaultAddressInfo = {
      coin: ChainToKeepKeyName[chain],
      script_type: scriptType,
      address_n: bip32ToAddressNList(DerivationPath[chain]),
    };
    const addressInfo = customAddressInfo || defaultAddressInfo;
    //console.log(tag, 'addressInfo: ', addressInfo.coin);
    //console.log(tag, 'addressInfo: ', addressInfo.script_type);
    const { address: walletAddress } = await sdk.address.utxoGetAddress(addressInfo);
    return walletAddress as string;
  };

  // @ts-ignore
  const _getPubkeys = async (paths: any) => {
    let tag = TAG + ' | _getPubkeys | ';
    try {
      //console.log(tag, 'Checkpoint 1');
      if (!paths || !paths.length) return [];
      console.time('getPubkeys Duration' + chain); // Starts the timer
      let pubkeys = await Promise.all(
        paths.map(async (path: any) => {
          if (!path.addressNList) throw new Error('addressNList not found in path: FATAL');
          if (path.type === 'address') return;
          //console.log(tag, 'path: ', path.note);
          // if (path.script_type === 'p2wpkh' && path.coin !== 'Bitcoin') return;
          // Marked as async to use await inside
          // Create the path query for public key retrieval
          const pathQuery = {
            symbol: 'BTC',
            coin: 'Bitcoin',
            script_type: 'p2pkh',
            address_n: path.addressNList,
            showDisplay: false,
          };

          // Get the public key
          //console.log(tag, 'pathQuery: ', pathQuery);
          const pubkeyResponse = await sdk.system.info.getPublicKey(pathQuery);
          //console.log(tag, 'pubkeyResponse: ', pubkeyResponse);
          if (!pubkeyResponse) throw new Error('Failed to get response from keepkey: FATAL');
          if (!pubkeyResponse.xpub)
            throw new Error('Failed to get correct response from keepkey: FATAL');

          // Create the address info query for master address retrieval
          const addressInfo = {
            coin: ChainToKeepKeyName[chain],
            script_type: path.script_type, // Assuming paths should be path if it's within map
            address_n: path.addressNListMaster,
          };

          // Get the master address
          //console.log(tag, 'addressInfo: ', addressInfo);
          const addressMaster = await sdk.address.utxoGetAddress(addressInfo);
          /*
               NOTE: formatting xpub to ypub or zpub is required because Blockbook assumes paths based on encoding.
               paths 44/48/84
           */
          if (path.script_type === 'p2wpkh') {
            //convert xpub to zpub
            pubkeyResponse.xpub = xpubConvert(pubkeyResponse.xpub, 'zpub');
            if (!pubkeyResponse.xpub) throw Error('Failed to format xpub to zpub: FATAL');
            //console.log(tag, 'converted to zpub: pubkeyResponse.xpub: ', pubkeyResponse.xpub);
          }

          if (path.script_type === 'p2sh-p2wpkh') {
            //convert xpub to ypub
            pubkeyResponse.xpub = xpubConvert(pubkeyResponse.xpub, 'ypub');
            if (!pubkeyResponse.xpub) throw Error('Failed to format xpub to ypub: FATAL');
            //console.log(tag, 'converted to ypub: pubkeyResponse.xpub: ', pubkeyResponse.xpub);
          }

          // Combine the original path object with the xpub and master from the responses
          return {
            ...path, // Contains all fields from the original path
            xpub: pubkeyResponse.xpub, // Adds the xpub field from the response
            master: addressMaster.address, // Adds the master address from the response
            address: addressMaster.address, // Adds the master address from the response
          };
        }),
      );
      pubkeys = pubkeys.filter((pubkey: any) => pubkey !== null && pubkey !== undefined);
      console.timeEnd('getPubkeys Duration' + chain); // Ends the timer and logs the duration

      return pubkeys;
    } catch (error: any) {
      console.error(error);
      console.timeEnd('getPubkeys Duration' + chain); // Ensure the timer is ended in case of error
    }
  };
  // const pubkeys = await _getPubkeys(paths);
  const getPubkeys = async (paths) => _getPubkeys(paths);

  const signTransaction = async (psbt: Psbt, inputs: KeepKeyInputObject[], memo: string = '') => {
    //console.log('psbt.txOutputs: ', psbt.txOutputs);
    let walletAddress = await getAddress();

    const outputs = psbt.txOutputs
      .map((output) => {
        const { value, address, change } = output as psbtTxOutput;

        let outputAddress = address;

        if (chain === Chain.BitcoinCash && address) {
          outputAddress = toCashAddress(address);
          // outputAddress = (toolbox as ReturnType<typeof BCHToolbox>).stripPrefix(address);
        }

        if (change || address === walletAddress) {
          return {
            addressNList: addressInfo.address_n,
            isChange: true,
            addressType: 'change',
            amount: value,
            scriptType,
          };
        } else {
          if (outputAddress) {
            return { address: outputAddress, amount: value, addressType: 'spend' };
          } else {
            return null;
          }
        }
      })
      .filter(Boolean);

    function removeNullAndEmptyObjectsFromArray(arr: any[]): any[] {
      return arr.filter(
        (item) => item !== null && typeof item === 'object' && Object.keys(item).length !== 0,
      );
    }
    //console.log({
    //   coin: ChainToKeepKeyName[chain],
    //   inputs,
    //   outputs: removeNullAndEmptyObjectsFromArray(outputs),
    //   version: 1,
    //   locktime: 0,
    // });
    try {
      let signPayload = {
        coin: ChainToKeepKeyName[chain],
        inputs,
        outputs: removeNullAndEmptyObjectsFromArray(outputs),
        version: 1,
        locktime: 0,
        opReturnData: memo,
      };
      //console.log('signPayload: ', JSON.stringify(signPayload));
      const responseSign = await sdk.utxo.utxoSignTransaction(signPayload);
      //console.log('responseSign: ', responseSign);
      return responseSign.serializedTx;
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  };

  const transfer = async ({
    from,
    recipient,
    feeOptionKey,
    feeRate,
    memo,
    ...rest
  }: UTXOTransferParams) => {
    if (!from) throw new Error('From address must be provided');
    if (!recipient) throw new Error('Recipient address must be provided');
    const tag = TAG + ' | transfer | ';
    try {
      const { psbt, inputs: rawInputs } = await toolbox.buildTx({
        ...rest,
        pubkeys: await getPubkeys(paths),
        memo,
        feeOptionKey,
        recipient,
        feeRate: feeRate || (await toolbox.getFeeRates())[feeOptionKey || FeeOption.Fast],
        sender: from,
        fetchTxHex: chain,
      });

      //console.log(tag, 'rawInputs: ', rawInputs);

      // Create a Set to track unique txid and index pairs
      const uniqueInputSet = new Set();
      const uniqueInputs = rawInputs.filter(({ hash, index }) => {
        const key = `${hash}:${index}`;
        if (uniqueInputSet.has(key)) {
          return false;
        } else {
          uniqueInputSet.add(key);
          return true;
        }
      });

      const inputs = uniqueInputs.map(({ value, index, hash, txHex, path, scriptType }) => ({
        addressNList: bip32ToAddressNList(path),
        scriptType: scriptType === 'p2sh' ? 'p2wpkh' : scriptType || 'p2pkh',
        amount: value.toString(),
        vout: index,
        txid: hash,
        hex: txHex || '',
      }));

      //console.log(tag, 'transfer inputs: ', inputs);
      const txHex = await signTransaction(psbt, inputs, memo);
      //console.log(tag, 'txHex: ', txHex);
      return await toolbox.broadcastTx(txHex);
    } catch (error: any) {
      console.error('Transfer error:', error);
      throw new Error('Transfer transaction failed');
    }
  };

  // const transfer = async ({
  //   from,
  //   recipient,
  //   feeOptionKey,
  //   feeRate,
  //   memo,
  //   ...rest
  // }: UTXOTransferParams) => {
  //   if (!from) throw new Error('From address must be provided');
  //   if (!recipient) throw new Error('Recipient address must be provided');
  //   const tag = TAG + ' | transfer | ';
  //   try {
  //     const { psbt, inputs: rawInputs } = await toolbox.buildTx({
  //       ...rest,
  //       pubkeys: await getPubkeys(paths),
  //       memo,
  //       feeOptionKey,
  //       recipient,
  //       feeRate: feeRate || (await toolbox.getFeeRates())[feeOptionKey || FeeOption.Fast],
  //       sender: from,
  //       fetchTxHex: chain,
  //     });
  //
  //     console.log(tag, 'rawInputs: ', rawInputs);
  //     const inputs = rawInputs.map(({ value, index, hash, txHex, path, scriptType }) => ({
  //       addressNList: bip32ToAddressNList(path),
  //       scriptType: scriptType === 'p2sh' ? 'p2wpkh' : scriptType || 'p2pkh',
  //       amount: value.toString(),
  //       vout: index,
  //       txid: hash,
  //       hex: txHex || '',
  //     }));
  //
  //     console.log(tag, 'transfer inputs: ', inputs);
  //     const txHex = await signTransaction(psbt, inputs, memo);
  //     console.log(tag, 'txHex: ', txHex);
  //     return await toolbox.broadcastTx(txHex);
  //   } catch (error: any) {
  //     console.error('Transfer error:', error);
  //     throw new Error('Transfer transaction failed');
  //   }
  // };

  // const transfer = async ({
  //   from,
  //   recipient,
  //   feeOptionKey,
  //   feeRate,
  //   memo,
  //   ...rest
  // }: UTXOTransferParams) => {
  //   if (!from) throw new Error('From address must be provided');
  //   if (!recipient) throw new Error('Recipient address must be provided');
  //   //select paths
  //   console.log("pubkeys: ", pubkeys);
  //   const { psbt, inputs: rawInputs } = await toolbox.buildTx({
  //     ...rest,
  //     pubkeys: await getPubkeys(),
  //     memo,
  //     feeOptionKey,
  //     recipient,
  //     feeRate: feeRate || (await toolbox.getFeeRates())[feeOptionKey || FeeOption.Fast],
  //     sender: from,
  //     fetchTxHex: chain,
  //   });
  //   //console.log('rawInputs: ', rawInputs);
  //   const inputs = rawInputs.map(({ value, index, hash, txHex, path, scriptType }) => ({
  //     addressNList: bip32ToAddressNList(path),
  //     // p2sh was showing on native segwit and wrong, replace. If no scriptType, default to p2pkh (non-segwit)
  //     scriptType: scriptType === 'p2sh' ? 'p2wpkh' : scriptType || 'p2pkh',
  //     amount: value.toString(),
  //     vout: index,
  //     txid: hash,
  //     hex: txHex || '',
  //   }));
  //   //console.log('transfer inputs: ', inputs);
  //   const txHex = await signTransaction(psbt, inputs, memo);
  //   //console.log('txHex: ', txHex);
  //   return toolbox.broadcastTx(txHex);
  // };

  return {
    ...toolbox,
    getPubkeys,
    // getInputsForPubkey,
    getAddress,
    signTransaction,
    transfer,
  };
};
