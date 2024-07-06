import { RPCUrl } from '@coinmasters/types';
import { AssetValue } from '@pioneer-platform/helpers';
import { ChainToCaip } from '@pioneer-platform/pioneer-caip';
const TAG = ' | thorchain-PIONEER | ';
const PIONEER_API_URI = 'https://pioneers.dev';
// const PIONEER_API_URI = 'http://localhost:9001';

const getAccount = async (address: string): Promise<any> => {
  const url = `${PIONEER_API_URI}/api/v1/getAccountInfo/thorchain/${address}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching account info: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`${TAG} getAccount error: `, error);
    throw error;
  }
};

const getBalance = async (pubkey: any, chain: string) => {
  let tag = TAG + ' | getBalance | ';
  try {
    //console.log(tag, 'pubkey: ', pubkey);
    let address;
    if (Array.isArray(pubkey)) {
      address = pubkey[0].address;
    } else {
      address = pubkey.address;
    }
    //console.log(tag, 'address: ', address);

    const url = `${PIONEER_API_URI}/api/v1/getPubkeyBalance/thorchain/${address}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching balance: ${response.statusText}`);
    }
    const balancesNative = await response.json();

    await AssetValue.loadStaticAssets();
    let identifier = 'THOR.RUNE';
    const assetValueNativeNative: any = AssetValue.fromStringSync(identifier, balancesNative);
    assetValueNativeNative.identifier = identifier;
    assetValueNativeNative.caip = ChainToCaip['THOR'];

    return assetValueNativeNative;
  } catch (error) {
    console.error(`${tag} getBalance error: `, error);
    throw error;
  }
};

const sendRawTransaction = async (tx: any, sync = true) => {
  let tag = TAG + ' | sendRawTransaction | ';
  try {
    let output: any = {};
    let payload = {
      tx_bytes: tx,
      mode: sync ? 'BROADCAST_MODE_SYNC' : 'BROADCAST_MODE_ASYNC',
    };

    let urlRemote = `${RPCUrl.THORChain}/cosmos/tx/v1beta1/txs`;
    const response = await fetch(urlRemote, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'content-type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error broadcasting transaction: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.tx_response && result.tx_response.txhash) {
      output.txid = result.tx_response.txhash;
      output.success = true;
    } else {
      output.success = false;
      output.error = 'No txhash found in response';
    }
    return output;
  } catch (error) {
    console.error(`${tag} sendRawTransaction error: `, error);
    throw error;
  }
};

export const ThorchainToolboxPioneer = (): any => {
  return {
    getAccount,
    getBalance,
    sendRawTransaction,
  };
};
