import { AssetValue, SwapKitNumber } from '@coinmasters/helpers';
import type { UTXOChain } from '@coinmasters/types';
import { Chain, FeeOption } from '@coinmasters/types';
import { HDKey } from '@scure/bip32';
import { address as btcLibAddress, payments, Psbt } from 'bitcoinjs-lib';
import * as coinSelect from 'coinselect';
import * as split from 'coinselect/split';
import type { ECPairInterface } from 'ecpair';
import { ECPairFactory } from 'ecpair';

import type { BlockchairApiType } from '../api/blockchairApi.ts';
import type {
  UTXOBaseToolboxParams,
  UTXOBuildTxParams,
  UTXOType,
  UTXOWalletTransferParams,
} from '../types/common.ts';
import {
  accumulative,
  calculateTxSize,
  compileMemo,
  getNetwork,
  getSeed,
  standardFeeRates,
} from '../utils/index.ts';

const createKeysForPath = async ({
  phrase,
  wif,
  derivationPath,
  chain,
}: {
  phrase?: string;
  wif?: string;
  derivationPath: string;
  chain: Chain;
}) => {
  if (!wif && !phrase) throw new Error('Either phrase or wif must be provided');

  const tinySecp = await import('tiny-secp256k1');
  const factory = ECPairFactory(tinySecp);
  const network = getNetwork(chain);

  if (wif) return factory.fromWIF(wif, network);

  const seed = getSeed(phrase as string);
  const master = HDKey.fromMasterSeed(seed, network).derive(derivationPath);

  if (!master.privateKey) {
    throw new Error('Could not get private key from phrase');
  }
  return factory.fromPrivateKey(Buffer.from(master.privateKey), { network });
};

const validateAddress = ({ address, chain }: { address: string } & UTXOBaseToolboxParams) => {
  try {
    //console.log(chain + ' validateAddress: ', address);
    btcLibAddress.toOutputScript(address, getNetwork(chain));
    return true;
  } catch (error) {
    return false;
  }
};

const getAddressFromKeys = ({ keys, chain }: { keys: ECPairInterface } & UTXOBaseToolboxParams) => {
  if (!keys) throw new Error('Keys must be provided');

  const method = Chain.Dogecoin === chain ? payments.p2pkh : payments.p2wpkh;
  const { address } = method({ pubkey: keys.publicKey, network: getNetwork(chain) });
  if (!address) throw new Error('Address not defined');

  return address;
};

const transfer = async ({
  signTransaction,
  from,
  memo,
  recipient,
  chain,
  apiClient,
  feeOptionKey,
  broadcastTx,
  feeRate,
  assetValue,
}: UTXOWalletTransferParams<Psbt, Psbt>) => {
  if (!from) throw new Error('From address must be provided');
  if (!recipient) throw new Error('Recipient address must be provided');
  // const txFeeRate = feeRate || (await getFeeRates(apiClient))[feeOptionKey || FeeOption.Fast];
  const txFeeRate = getDefaultTxFeeByChain(chain);
  const { psbt } = await buildTx({
    recipient,
    feeRate: txFeeRate,
    sender: from,
    fetchTxHex: chain === Chain.Dogecoin,
    chain,
    apiClient,
    assetValue,
    memo,
  });
  const signedPsbt = await signTransaction(psbt);
  signedPsbt.finalizeAllInputs(); // Finalise inputs
  // TX extracted and formatted to hex
  return broadcastTx(signedPsbt.extractTransaction().toHex());
};

const getPubkeyBalance = async function (pubkey: any, type: string, apiClient: BlockchairApiType) {
  try {
    console.log('getPubkeyBalance pubkey: ', pubkey);
    //console.log('getPubkeyBalance type: ', type);
    switch (type) {
      case 'pubkey':
      case 'zpub':
      case 'xpub':
        //console.log('pubkey.pubkey.xpub: ', pubkey.pubkey.xpub);
        // eslint-disable-next-line no-case-declarations
        const xpubBalance = await apiClient.getBalanceXpub(
          pubkey.pubkey.xpub || pubkey.xpub || pubkey.pubkey,
        );
        console.log(' | getPubkeyBalance | xpubBalance: ', xpubBalance);
        return xpubBalance;
      case 'address':
        // eslint-disable-next-line no-case-declarations
        const address = pubkey[type];
        //console.log('getPubkeyBalance address: ', address);
        // eslint-disable-next-line no-case-declarations
        const addressBalance = await apiClient.getBalance(address);
        //console.log('getPubkeyBalance: addressBalance: ', addressBalance);
        return addressBalance;
      default:
        throw new Error('Invalid pubkey type');
    }
  } catch (e) {
    console.error(e);
  }
};

const getBalance = async ({ pubkeys, chain, apiClient }: { pubkeys: any[] } & any) => {
  console.log('getBalance pubkeys: ', pubkeys);
  //legacy support
  if (typeof pubkeys === 'string') {
    pubkeys = [{ address: pubkeys }];
  }
  let totalBalance = 0;
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < pubkeys.length; i++) {
    let pubkey = pubkeys[i];
    let type = '';
    if (pubkey.pubkey) {
      type = 'pubkey';
      console.log('pubkey: ', pubkey.pubkey);
    } else {
      type = 'address';
    }
    console.log('type: ', type);
    let balance = await getPubkeyBalance(pubkey, type, apiClient);
    if (typeof balance === 'object') balance = 0;
    console.log('BaseUTXO getPubkeyBalance balance: ', balance);
    totalBalance = totalBalance + balance;
  }
  //console.log(`BaseUTXO totalBalance:`, totalBalance);
  const asset = await AssetValue.fromChainOrSignature(chain, totalBalance);
  //console.log('BaseUTXO asset: ', asset);
  return [asset];
};

const getDefaultTxFeeByChain = (chain: Chain) => {
  switch (chain) {
    case Chain.Bitcoin:
      return 5;
    case Chain.Dogecoin:
      return 10000;
    case Chain.Dash:
      return 1;
    case Chain.Litecoin:
      return 1;
    default:
      return 2;
  }
};

const getFeeRates = async (apiClient: BlockchairApiType) =>
  standardFeeRates(await apiClient.getSuggestedTxFee());

// Create a function to transform an input into the desired output format
function transformInput(input) {
  const {
    txid,
    vout,
    value,
    address,
    height,
    confirmations,
    path,
    hex: txHex,
    tx,
    coin,
    network,
  } = input;

  return {
    address,
    hash: txid, // Rename txid to hash
    index: vout,
    value: parseInt(value),
    height,
    confirmations,
    path,
    txHex,
    tx,
    coin,
    network,
    witnessUtxo: {
      value: parseInt(input.tx.vout[0].value),
      script: Buffer.from(input.tx.vout[0].scriptPubKey.hex, 'hex'),
    },
  };
}

const getInputsAndTargetOutputs = async ({
  assetValue,
  recipient,
  memo,
  pubkeys,
  sender,
  fetchTxHex = false,
  apiClient,
  chain,
}: {
  assetValue: AssetValue;
  pubkeys: any[];
  recipient: string;
  memo?: string;
  sender: string;
  fetchTxHex?: boolean;
  apiClient: BlockchairApiType;
  chain: UTXOChain;
}) => {
  //get inputs by xpub
  console.log('pubkeys: ', pubkeys);
  //get balances for each pubkey
  for (let i = 0; i < pubkeys.length; i++) {
    let pubkey = pubkeys[i];
    console.log('1 pubkey: ', pubkey);
    console.log('2 pubkey: ', pubkey.pubkey);
    let balance = await apiClient.getBalanceXpub(pubkey.pubkey || pubkey.xpub || pubkey);
    console.log('balance: ', balance);
    pubkeys[i].balance = balance.toString();
  }
  //console.log('pubkeys: ', pubkeys);

  // select a single pubkey
  // choose largest balance
  let largestBalance = -Infinity; // Initialize with a very small value
  let pubkeyWithLargestBalance = null; // Initialize as null

  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < pubkeys.length; i++) {
    const pubkey = pubkeys[i];
    const balance = parseFloat(pubkey.balance);

    if (!isNaN(balance) && balance > largestBalance) {
      largestBalance = balance;
      pubkeyWithLargestBalance = pubkey;
    }
  }

  //console.log('The pubkey with the highest balance is:', pubkeyWithLargestBalance);

  // pubkeyWithLargestBalance
  console.log('pubkeyWithLargestBalance: ', pubkeyWithLargestBalance);
  let inputs = await apiClient.listUnspent({
    pubkey:
      pubkeyWithLargestBalance?.pubkey ||
      pubkeyWithLargestBalance?.xpub ||
      pubkeyWithLargestBalance,
    chain,
    apiKey: apiClient.apiKey,
  });
  console.log('inputs total: ', inputs);
  console.log('inputs total: ', inputs.length);

  console.log('inputs: ', inputs);
  //Use the map function to transform each input
  inputs = inputs.map(transformInput);

  // //console.log('sender: ', sender);
  // const inputs = await apiClient.scanUTXOs({
  //   address: sender,
  //   fetchTxHex,
  // });
  // //console.log('inputsMaster Inputs: ', inputs);

  //TODO do this again
  if (!validateAddress({ address: recipient, chain, apiClient })) {
    throw new Error('getInputsAndTargetOutputs Invalid address');
  }

  //1. add output amount and recipient to targets
  //2. add output memo to targets (optional)

  return {
    inputs,
    outputs: [
      { address: recipient, value: Number(assetValue.bigIntValue) },
      ...(memo ? [{ address: '', script: compileMemo(memo), value: 0 }] : []),
    ],
  };
};

const buildTx = async ({
  assetValue,
  pubkeys,
  recipient,
  memo,
  feeRate,
  sender,
  isMax,
  fetchTxHex = false,
  apiClient,
  chain,
}: UTXOBuildTxParams): Promise<{
  psbt: Psbt;
  utxos: UTXOType[];
  inputs: UTXOType[];
}> => {
  const compiledMemo = memo ? compileMemo(memo) : null;

  console.log('Checkpoint buildTx');
  console.log('pubkeys: ', pubkeys);

  const inputsAndOutputs = await getInputsAndTargetOutputs({
    assetValue,
    pubkeys,
    recipient,
    memo,
    sender,
    fetchTxHex,
    apiClient,
    chain,
  });
  //Blockchairs Doge API recomendations are WAYY wrong
  if (chain === Chain.Dogecoin) feeRate = 100000;
  if (chain === Chain.BitcoinCash) feeRate = 100;
  console.log('inputsAndOutputs: ', inputsAndOutputs);
  // console.log('coinSelect: ', coinSelect);
  console.log('feeRate: ', feeRate);

  // Assuming inputsAndOutputs, feeRate, and isMax are defined elsewhere in your code
  let inputs: any[], outputs: any[];

  if (isMax) {
    console.log('isMax: detected!');
    inputsAndOutputs.outputs = inputsAndOutputs.outputs
      .filter((output) => output.address !== undefined)
      .map((output) => {
        const newOutput = { ...output };
        delete newOutput.value;
        return newOutput;
      });
    console.log('inputsAndOutputs: ', inputsAndOutputs);
    ({ inputs, outputs } = split.default(
      inputsAndOutputs.inputs,
      inputsAndOutputs.outputs,
      feeRate,
    ));
  } else {
    console.log('isMax: not detected!');
    //const { inputs, outputs } = accumulative({ ...inputsAndOutputs, feeRate, chain });
    //({ inputs, outputs } = accumulative({ ...inputsAndOutputs, feeRate, chain }));

    ({ inputs, outputs } = coinSelect.default(
      inputsAndOutputs.inputs,
      inputsAndOutputs.outputs,
      feeRate,
    ));
  }

  console.log('inputs: ', inputs);
  console.log('outputs: ', outputs);

  // .inputs and .outputs will be undefined if no solution was found
  if (!inputs || !outputs) throw new Error('Insufficient Balance for transaction');
  const psbt = new Psbt({ network: getNetwork(chain) }); // Network-specific

  if (chain === Chain.Dogecoin) psbt.setMaximumFeeRate(650000000);

  inputs.forEach((utxo: UTXOType) =>
    psbt.addInput({
      // @ts-ignore
      hash: utxo.hash,
      index: utxo.index,
      ...(!!utxo.witnessUtxo && chain !== Chain.Dogecoin && { witnessUtxo: utxo.witnessUtxo }),
      ...(chain === Chain.Dogecoin && {
        nonWitnessUtxo: utxo.txHex ? Buffer.from(utxo.txHex, 'hex') : undefined,
      }),
    }),
  );

  outputs.forEach((output: any) => {
    if (!output.address) {
      //an empty address means this is the change address
      output.address = sender;
    }
    if (!output.script) {
      psbt.addOutput(output);
    } else {
      //we need to add the compiled memo this way to
      //avoid dust error tx when accumulating memo output with 0 value
      if (compiledMemo) {
        psbt.addOutput({ script: compiledMemo, value: 0 });
      }
    }
  });

  return { psbt, utxos: inputsAndOutputs.inputs, inputs };
};

const getInputsOutputsFee = async ({
  assetValue,
  apiClient,
  chain,
  feeOptionKey = FeeOption.Fast,
  feeRate,
  fetchTxHex = false,
  memo,
  recipient,
  sender,
}: {
  assetValue: AssetValue;
  recipient: string;
  memo?: string;
  feeRate: number;
  sender: string;
  fetchTxHex?: boolean;
  apiClient: BlockchairApiType;
  chain: UTXOChain;
  feeOptionKey?: FeeOption;
  feeeRate?: number;
}) => {
  const inputsAndOutputs = await getInputsAndTargetOutputs({
    assetValue,
    recipient,
    memo,
    sender,
    fetchTxHex,
    apiClient,
    chain,
  });

  const feeRateWhole = feeRate ? Math.floor(feeRate) : (await getFeeRates(apiClient))[feeOptionKey];

  return accumulative({ ...inputsAndOutputs, feeRate: feeRateWhole, chain });
};

export const estimateMaxSendableAmount = async ({
  pubkeys,
  feeRate,
  feeOptionKey = FeeOption.Fast,
  recipient,
  memo,
  chain,
  apiClient,
}: {
  pubkeys: any[];
  feeRate?: number;
  feeOptionKey?: FeeOption;
  recipient: string;
  memo?: string;
  chain: Chain;
  apiClient: any;
}): Promise<AssetValue> => {
  let utxos = [];
  for (let pubkey of pubkeys) {
    const utxoSet = await apiClient.listUnspent({
      pubkey: pubkey.pubkey || pubkey.xpub || pubkey,
      chain,
      apiKey: apiClient.apiKey,
    });
    utxos = utxos.concat(utxoSet.map(transformInput));
  }
  if (utxos.length === 0) throw new Error('No UTXOs found for the provided pubkeys');

  let effectiveFeeRate = getDefaultTxFeeByChain(chain);

  // Start with the total balance of all UTXOs as the initial sendable amount
  let totalInputValue = utxos.reduce((acc, utxo) => acc + utxo.value, 0);

  let maxSendableValue = totalInputValue;
  let estimatedFee;
  let tryCount = 0;
  let success = false;

  // Try to find a viable sendable amount by reducing the sendable value until it works or a limit is reached
  while (!success && tryCount < 100) {
    // Prevent infinite loops
    const estimatedTxSize = utxos.length * 148 + 2 * 34 + 10; // Basic estimation, adjust as needed
    estimatedFee = estimatedTxSize * effectiveFeeRate;
    maxSendableValue = totalInputValue - estimatedFee;

    if (maxSendableValue <= 0) {
      throw new Error('Insufficient funds for transaction after accounting for fees');
    }

    // Simulate a transaction to check if the selection works
    const { inputs, outputs } = coinSelect.default(
      utxos,
      [{ address: recipient, value: maxSendableValue }],
      effectiveFeeRate,
    );

    if (inputs && outputs) {
      success = true; // A viable set of inputs and outputs was found
    } else {
      totalInputValue -= estimatedFee; // Reduce the total input value and try again
      tryCount++;
    }
  }

  if (!success) {
    throw new Error('Unable to find a viable transaction amount after multiple attempts');
  }

  return AssetValue.fromChainOrSignature(chain, maxSendableValue);
};

// export const estimateMaxSendableAmount = async ({
//   pubkeys,
//   feeRate,
//   feeOptionKey = FeeOption.Fast,
//   recipient,
//   memo,
//   chain,
//   apiClient,
// }: {
//   pubkeys: any[];
//   feeRate?: number;
//   feeOptionKey?: FeeOption;
//   recipient: string;
//   memo?: string;
//   chain: Chain;
//   apiClient: any;
// }): Promise<AssetValue> => {
//   console.log('pubkeys: ', pubkeys);
//   // Fetch the actual UTXOs for the provided pubkeys
//   let utxos = [];
//   for (let pubkey of pubkeys) {
//     const utxoSet = await apiClient.listUnspent({
//       pubkey: pubkey.pubkey || pubkey.xpub || pubkey,
//       chain,
//       apiKey: apiClient.apiKey,
//     });
//     console.log('utxoSet: ', utxoSet);
//     // Assuming transformInput is a function that formats each UTXO correctly
//     utxos = utxos.concat(utxoSet.map(transformInput));
//   }
//   if(utxos.length === 0) throw new Error('No UTXOs found for the provided pubkeys');
//
//   // Calculate the total available balance from the UTXOs
//   const totalInputValue = utxos.reduce((acc, utxo) => acc + utxo.value, 0);
//   console.log('totalInputValue: ', totalInputValue);
//
//   // Determine the effective fee rate
//   // const effectiveFeeRate = feeRate
//   //   ? Math.ceil(feeRate)
//   //   : (await getFeeRates(apiClient))[feeOptionKey];
//   let effectiveFeeRate = getDefaultTxFeeByChain(chain);
//   console.log('totalInputValue: ', totalInputValue);
//
//
//   // Estimate the size of the transaction. Assuming 148 bytes per input and 34 bytes per output, plus 10 bytes overhead
//   const estimatedTxSize = utxos.length * 148 + 2 * 34 + 10; // Adjust based on your actual needs
//
//   // Calculate the estimated fee for the transaction
//   const estimatedFee = estimatedTxSize * effectiveFeeRate;
//
//   // Calculate the maximum sendable amount by subtracting the estimated fee from the total UTXO balance
//   const maxSendableValue = totalInputValue - estimatedFee;
//
//   // Ensure maxSendableValue is not negative
//   if (maxSendableValue < 0) {
//     throw new Error('Insufficient funds for transaction after accounting for fees');
//   }
//
//   // Return the maximum sendable amount as an AssetValue
//   return AssetValue.fromChainOrSignature(chain, maxSendableValue);
// };

// export const estimateMaxSendableAmount = async ({
//   pubkeys,
//   feeRate,
//   feeOptionKey = FeeOption.Fast,
//   recipient,
//   memo,
//   chain,
//   apiClient,
// }: {
//   pubkeys: any[];
//   feeRate?: number;
//   feeOptionKey?: FeeOption;
//   recipient: string;
//   memo?: string;
//   chain: Chain;
//   apiClient: any;
// }): Promise<AssetValue> => {
//   console.log('pubkeys: ', pubkeys);
//
//
//   const effectiveFeeRate = feeRate
//     ? Math.ceil(feeRate)
//     : (await getFeeRates(apiClient))[feeOptionKey];
//
//   console.log('effectiveFeeRate: ', effectiveFeeRate);
//
//   // Simulate transaction to estimate size and fee
//   // Placeholder values for inputs and outputs since actual implementation may vary
//   const txSizeEstimation = calculateTxSize({
//     inputs: [], // This would be based on actual UTXO selection logic
//     outputs: [
//       { address: recipient, value: 0 }, // Placeholder, actual calculation needed
//       ...(memo ? [{ address: recipient, script: compileMemo(memo), value: 0 }] : []),
//     ],
//     feeRate: effectiveFeeRate,
//   });
//
//   console.log('txSizeEstimation: ', txSizeEstimation);
//   const fee = AssetValue.fromChainOrSignature(
//     chain,
//     (txSizeEstimation * effectiveFeeRate) / 10000000,
//   );
//
//   console.log('fee: ', fee);
//   console.log('totalBalance: ', totalBalance);
//
//   console.log('fee: ', fee.toString());
//   console.log('totalBalance: ', totalBalance.toString());
//
//   console.log('fee: ', fee.getValue('string'));
//   console.log('totalBalance: ', totalBalance[0].getValue('string'));
//
//   // Adjusting for correct subtraction of BigInt values
//   const maxSendableValue = totalBalance[0].getValue('string') - fee.getValue('string');
//   console.log('maxSendableValue: ', maxSendableValue);
//
//   // Ensure the AssetValue is constructed correctly with bigIntValue
//   const maxSendableAmount = AssetValue.fromChainOrSignature(chain, maxSendableValue);
//
//   return maxSendableAmount;
// };

export const BaseUTXOToolbox = (
  baseToolboxParams: UTXOBaseToolboxParams & { broadcastTx: (txHex: string) => Promise<string> },
) => ({
  accumulative,
  apiClient: baseToolboxParams.apiClient,
  broadcastTx: baseToolboxParams.broadcastTx,
  calculateTxSize,
  buildTx: (params: any) => buildTx({ ...params, ...baseToolboxParams }),
  getAddressFromKeys: (keys: ECPairInterface) => getAddressFromKeys({ keys, ...baseToolboxParams }),
  validateAddress: (address: string) => validateAddress({ address, ...baseToolboxParams }),

  createKeysForPath: (params: any) => createKeysForPath({ ...params, ...baseToolboxParams }),

  getPrivateKeyFromMnemonic: async ({
    phrase,
    derivationPath,
  }: {
    phrase: string;
    derivationPath: string;
  }) => (await createKeysForPath({ phrase, derivationPath, ...baseToolboxParams })).toWIF(),

  getBalance: (pubkeys: any[]) => getBalance({ pubkeys, ...baseToolboxParams }),

  getFeeRates: () => getFeeRates(baseToolboxParams.apiClient),

  transfer: (params: any) => transfer({ ...params, ...baseToolboxParams }),

  getInputsOutputsFee: (params: any) => getInputsOutputsFee({ ...params, ...baseToolboxParams }),

  getFeeForTransaction: async (params: any) =>
    new SwapKitNumber({
      value: (await getInputsOutputsFee({ ...params, ...baseToolboxParams })).fee,
      decimal: 8,
    }),

  estimateMaxSendableAmount: async (params: any) =>
    estimateMaxSendableAmount({ ...params, ...baseToolboxParams }),
});
