import { AssetValue, RequestClient } from '@coinmasters/helpers';
import { RPCUrl } from '@coinmasters/types';
import { ec as EC } from 'elliptic';
//https://pioneers.dev/api/v1/getAccountInfo/osmosis/
const PIONEER_API_URI = 'https://pioneers.dev';
const TAG = ' | osmosis-toolbox | ';
const getAccount = (address: string): Promise<any> => {
  // Construct the URL
  const url = `${PIONEER_API_URI}/api/v1/getAccountInfo/osmosis/${address}`;

  // Log the URL
  console.log(`Requesting URL: ${url}`);

  // Make the request
  return RequestClient.get<any>(url);
};

// const getTransferFee = async () => {
//   const feesArray = await getRequest<BNBFees>(`${BINANCE_MAINNET_API_URI}/api/v1/fees`);
//
//   const [transferFee] = feesArray.filter(isTransferFee);
//   if (!transferFee) throw new Error('failed to get transfer fees');
//
//   return transferFee;
// };

const getBalance = async (address: any[]) => {
  //console.log(address)
  try {
    const balanceOsmo = await RequestClient.get(
      `${PIONEER_API_URI}/api/v1/getPubkeyBalance/osmosis/${address[0].address}`,
    );
    console.log('balanceOsmo: ', balanceOsmo);
    await AssetValue.loadStaticAssets();
    const assetValueNativeOsmo = AssetValue.fromStringSync('OSMO.OSMO', balanceOsmo);
    //console.log("assetValueNativeOsmo: ", assetValueNativeOsmo)
    let balances = [assetValueNativeOsmo];
    //console.log("balances: ", balances)
    //TODO get token balances

    return balances;
  } catch (e) {
    return [];
  }
};

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
    console.log(tag, 'urlRemote: ', urlRemote);

    // Sending the transaction using RequestClient
    let result = await RequestClient.post(urlRemote, {
      body: JSON.stringify(payload),
      headers: {
        'content-type': 'application/json', // Assuming JSON content type is required
      },
    });
    console.log(tag, '** Broadcast ** REMOTE: result: ', result);

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
