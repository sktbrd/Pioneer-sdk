import { RPCUrl } from '@coinmasters/types';
import { AssetValue, RequestClient } from '@pioneer-platform/helpers';
import { ChainToCaip } from '@pioneer-platform/pioneer-caip';
import { ec as EC } from 'elliptic';
//https://pioneers.dev/api/v1/getAccountInfo/osmosis/
const PIONEER_API_URI = 'https://pioneers.dev';
// const PIONEER_API_URI = 'http://localhost:9001';
const TAG = ' | osmosis-toolbox | ';

const getAccount = async (address: string): Promise<any> => {
  let tag = TAG + ' | getAccount | ';
  try {
    //console.log(tag, 'address: ', address);
    const url = `${PIONEER_API_URI}/api/v1/getAccountInfo/osmosis/${address}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch account info: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching account info for address ${address}: `, error);
    throw error;
  }
};

// const getTransferFee = async () => {
//   const feesArray = await getRequest<BNBFees>(`${BINANCE_MAINNET_API_URI}/api/v1/fees`);
//
//   const [transferFee] = feesArray.filter(isTransferFee);
//   if (!transferFee) throw new Error('failed to get transfer fees');
//
//   return transferFee;
// };

const getBalance = async (pubkey: any) => {
  let tag = TAG + ' | getBalance | ';
  try {
    //console.log(tag, 'pubkey: ', pubkey);
    let address;
    if (Array.isArray(pubkey)) {
      address = pubkey[0].address;
    } else {
      address = pubkey.address;
    }
    //console.log('URL: ', `${PIONEER_API_URI}/api/v1/ibc/balances/osmosis/${address[0].address}`);
    //BROKE? why?
    // const balancesOsmo: any = await RequestClient.get(
    //   `${PIONEER_API_URI}/api/v1/ibc/balances/osmosis/${pubkey.address}`,
    // );

    const response = await fetch(
      `${PIONEER_API_URI}/api/v1/ibc/balances/osmosis/${address}`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch balances: ${response.statusText}`);
    }

    const balancesOsmo = await response.json();
    //console.log('balancesOsmo: ', balancesOsmo);
    let balanceOsmo: any;
    await AssetValue.loadStaticAssets();
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < balancesOsmo.length; i++) {
      let balance = balancesOsmo[i];
      if (balance.asset === 'OSMO') {
        let identifier = 'OSMO.' + balance.asset;
        balanceOsmo = AssetValue.fromStringSync(identifier, balance.balance);
        balanceOsmo.caip = ChainToCaip['OSMO'];
      }
    }

    return balanceOsmo;
  } catch (e) {
    console.error(tag, 'Error: ', e);
    throw e;
  }
};

// const getBalances = async (pubkey: any) => {
//   let tag = TAG + ' | getBalance | ';
//   try {
//     console.log(tag, 'pubkey: ', pubkey);
//     console.log('address: ', pubkey.address);
//     //console.log('URL: ', `${PIONEER_API_URI}/api/v1/ibc/balances/osmosis/${address[0].address}`);
//     const balancesOsmo: any = await RequestClient.get(
//       `${PIONEER_API_URI}/api/v1/ibc/balances/osmosis/${pubkey.address}`,
//     );
//
//     console.log('balanceOsmo: ', balancesOsmo);
//     let balances: any = [];
//     await AssetValue.loadStaticAssets();
//     for (let i = 0; i < balancesOsmo.length; i++) {
//       let balance = balancesOsmo[i];
//       //console.log('balance: ', balance);
//       let identifier = 'OSMO.' + balance.asset;
//       const assetValueNativeOsmo = AssetValue.fromStringSync(identifier, balance.balance);
//
//       if (assetValueNativeOsmo) {
//         //console.log('assetValueNativeOsmo: ', assetValueNativeOsmo);
//         balances.push(assetValueNativeOsmo);
//         //console.log('balances: ', balances);
//       } else {
//         console.error('Failed to get assetValueNative: ' + identifier);
//       }
//     }
//
//     return null;
//   } catch (e) {
//     console.error(tag, 'Error: ', e);
//     throw e;
//   }
// };

// const getFees = async () => {
//   let singleTxFee: SwapKitNumber | undefined = undefined;
//
//   try {
//     singleTxFee = new SwapKitNumber({
//       value: (await getFeeRateFromThorswap(ChainId.Binance)) || (await getFeeRateFromThorchain()),
//       decimal: 8,
//     });
//   } catch (error) {
//     console.error(error);
//   }
//
//   if (!singleTxFee) {
//     const transferFee = await getTransferFee();
//     singleTxFee = new SwapKitNumber({
//       value: transferFee.fixed_fee_params.fee,
//       decimal: 8,
//     });
//   }
//
//   return {
//     [FeeOption.Average]: singleTxFee,
//     [FeeOption.Fast]: singleTxFee,
//     [FeeOption.Fastest]: singleTxFee,
//   };
// };

export const getFees = async () => {
  return String(
    //@ts-ignore
    '3500',
  );
};

// const getFeeRateFromThorchain = async () => {
//   const respData = await getRequest(`${ApiUrl.ThornodeMainnet}/thorchain/inbound_addresses`);
//   if (!Array.isArray(respData)) throw new Error('bad response from Thornode API');
//
//   const chainData = respData.find(
//     (elem) => elem.chain === Chain.Binance && typeof elem.gas_rate === 'string',
//   ) as { chain: Chain; gas_rate: string };
//
//   return Number(chainData?.gas_rate || 0);
// };

const sendRawTransaction = async (tx, sync = true) => {
  let tag = TAG + ' | sendRawTransaction | ';
  let output = {};

  try {
    // Construct payload
    let payload = {
      tx_bytes: tx,
      mode: sync ? 'BROADCAST_MODE_SYNC' : 'BROADCAST_MODE_ASYNC',
    };

    // Define the URL for broadcasting transactions
    let urlRemote = `${RPCUrl.Osmosis}/cosmos/tx/v1beta1/txs`;
    //console.log(tag, 'urlRemote: ', urlRemote);

    // Sending the transaction using fetch
    let response = await fetch(urlRemote, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to broadcast transaction: ${response.statusText}`);
    }

    let result = await response.json();
    //console.log(tag, '** Broadcast ** REMOTE: result: ', result);

    // Handle the response
    if (result.tx_response.txhash) {
      output.txid = result.tx_response.txhash;
      output.success = true;
    } else {
      output.success = false;
      output.error = 'No txhash found in response';
    }
  } catch (error) {
    console.error(tag, 'Error in broadcasting transaction: ', error);
    output.success = false;
    output.error = error.toString();
  }

  return output;
};

// const sendRawTransaction = async (tx, sync = true) => {
//   let tag = TAG + ' | sendRawTransaction | ';
//   let output = {};
//
//   try {
//     // Construct payload
//     let payload = {
//       tx_bytes: tx,
//       mode: sync ? 'BROADCAST_MODE_SYNC' : 'BROADCAST_MODE_ASYNC',
//     };
//
//     // Define the URL for broadcasting transactions
//     let urlRemote = `${RPCUrl.Osmosis}/cosmos/tx/v1beta1/txs`;
//     //console.log(tag, 'urlRemote: ', urlRemote);
//
//     // Sending the transaction using RequestClient
//     let result = await RequestClient.post(urlRemote, {
//       body: JSON.stringify(payload),
//       headers: {
//         'content-type': 'application/json', // Assuming JSON content type is required
//       },
//     });
//     //console.log(tag, '** Broadcast ** REMOTE: result: ', result);
//
//     // Handle the response
//     if (result.tx_response.txhash) {
//       output.txid = result.tx_response.txhash;
//       output.success = true;
//     } else {
//       output.success = false;
//       output.error = 'No txhash found in response';
//     }
//   } catch (error) {
//     console.error(tag, 'Error in broadcasting transaction: ', error);
//     output.success = false;
//     output.error = error.toString();
//   }
//
//   return output;
// };

// const prepareTransaction = async (
//   msg: any,
//   address: string,
//   sequence: string | number | null = null,
//   memo = '',
// ) => {
//   const account = await getAccount(address);
//   if (sequence !== 0 && !sequence && address) {
//     sequence = account.sequence;
//   }
//
//   return new BNBTransaction({
//     accountNumber: account.account_number,
//     chainId: ChainId.Binance,
//     memo: memo,
//     msg,
//     sequence: typeof sequence !== 'number' ? parseInt(sequence!) : sequence,
//     source: 0,
//   });
// };

// const decodeAddress = (value: string) => Buffer.from(bech32.fromWords(bech32.decode(value).words));

// const createTransactionAndSignMsg = async ({
//   from,
//   recipient,
//   assetValue,
//   memo,
// }: TransferParams) => {
//   const accCode = decodeAddress(from);
//   const toAccCode = decodeAddress(recipient);
//
//   const coin = {
//     denom: getDenom(assetValue.symbol).toUpperCase(),
//     amount: assetValue.baseValueNumber,
//   };
//
//   const msg = {
//     inputs: [{ address: accCode, coins: [coin] }],
//     outputs: [{ address: toAccCode, coins: [coin] }],
//     aminoPrefix: AminoPrefix.MsgSend,
//   };
//
//   const signMsg = {
//     inputs: [{ address: from, coins: [coin] }],
//     outputs: [{ address: recipient, coins: [coin] }],
//   };
//
//   const transaction = await prepareTransaction(msg, from, null, memo);
//
//   return { transaction, signMsg };
// };

// const transfer = async (params: TransferParams): Promise<string> => {
//   const { transaction, signMsg } = await createTransactionAndSignMsg(params);
//   const hex = Buffer.from(params.privkey as Uint8Array).toString('hex');
//   const signedTx = await transaction.sign(hex, signMsg);
//
//   const res = await sendRawTransaction(signedTx.serialize(), true);
//
//   return res[0]?.hash;
// };

// const createKeyPair = async (phrase: string) => {
//   const { Bip39, EnglishMnemonic, Slip10, Slip10Curve, stringToPath } = await import(
//     '@cosmjs/crypto'
//   );
//
//   const derivationPath = stringToPath(`${DerivationPath.BNB}/0`);
//   const mnemonicChecked = new EnglishMnemonic(phrase);
//   const seed = await Bip39.mnemonicToSeed(mnemonicChecked);
//
//   const { privkey } = Slip10.derivePath(Slip10Curve.Secp256k1, seed, derivationPath);
//
//   return privkey;
// };

export const getPublicKey = (publicKey: string) => {
  const ec = new EC('secp256k1');
  const keyPair = ec.keyFromPublic(publicKey, 'hex');
  return keyPair.getPublic();
};

export const OsmosisToolbox = (): any => {
  return {
    // transfer: (params: TransferParams) => transfer(params),
    getAccount,
    getBalance,
    // getFees,
    sendRawTransaction,
  };
};
