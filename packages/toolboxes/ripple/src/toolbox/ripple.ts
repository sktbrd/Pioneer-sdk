import { Chain, RPCUrl } from '@coinmasters/types';
import { AssetValue } from '@pioneer-platform/helpers';
//@ts-ignore
// eslint-disable-next-line import/no-extraneous-dependencies
import { ChainToCaip } from '@pioneer-platform/pioneer-caip';

const PIONEER_API_URI = 'https://pioneers.dev';
// const PIONEER_API_URI = 'http://127.0.0.1:9001';

const getAccount = async (address: string): Promise<any> => {
  const url = `${PIONEER_API_URI}/api/v1/getAccountInfo/ripple/${address}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching account info: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`getAccount error: `, error);
    throw error;
  }
};

const getBalance = async (pubkeys: any) => {
  try {
    let address;
    if (Array.isArray(pubkeys)) {
      address = pubkeys[0].address;
    } else {
      address = pubkeys.address;
    }

    const url = `${PIONEER_API_URI}/api/v1/getPubkeyBalance/ripple/${address}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching balance: ${address}`);
    }
    let balanceBase = await response.json();

    if (balanceBase && balanceBase.error) balanceBase = '0';
    await AssetValue.loadStaticAssets();
    const assetValueNative = AssetValue.fromChainOrSignature(Chain.Ripple, balanceBase);
    assetValueNative.pubkey = address;
    assetValueNative.type = 'Native';
    assetValueNative.caip = ChainToCaip['XRP'];

    return assetValueNative;
  } catch (error) {
    console.error(`getBalance error: `, error);
    throw error;
  }
};

const sendRawTransaction = async (tx: any, sync = true) => {
  let tag = ' | sendRawTransaction | ';
  let output = {};
  try {
    const buffer = Buffer.from(tx, 'base64');
    const bufString = buffer.toString('hex');

    // Construct payload
    let payload = {
      method: 'submit',
      id: 2,
      command: 'submit',
      fail_hard: true,
      params: [
        {
          tx_blob: bufString,
        },
      ],
    };

    // Define the URL for broadcasting transactions
    let urlRemote = `${RPCUrl.Ripple}/`;

    // Sending the transaction using fetch
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

    return result;
  } catch (error) {
    console.error(tag, 'Error in broadcasting transaction: ', error);
    output.success = false;
    output.error = error.toString();
  }

  return output;
};

export const RippleToolbox = (): any => {
  return {
    getAccount,
    getBalance,
    sendRawTransaction,
  };
};
