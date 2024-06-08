import { BaseDecimal, FeeOption } from '@coinmasters/types';
import { AssetValue, SwapKitNumber } from '@pioneer-platform/helpers';
import { Chain, ChainToCaip } from '@pioneer-platform/pioneer-caip/lib';

//https://pioneers.dev/api/v1/getAccountInfo/osmosis/
const PIONEER_API_URI = 'https://pioneers.dev';
// const PIONEER_API_URI = 'http://localhost:9001';
const TAG = ' | mayachain-toolbox | ';

const getAccount = async (address: string): Promise<any> => {
  const url = `${PIONEER_API_URI}/api/v1/getAccountInfo/mayachain/${address}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error(`${TAG} Error in getAccount:`, error);
    throw error;
  }
};

const getBalance = async (pubkey: any) => {
  let tag = TAG + ' | getBalance | ';
  try {
    let address;
    if (Array.isArray(pubkey)) {
      address = pubkey[0].address;
    } else {
      address = pubkey.address;
    }

    const balancesEndpoint = `${PIONEER_API_URI}/api/v1/ibc/balances/mayachain/${address}`;
    console.log(tag, 'URL:', balancesEndpoint);

    const response = await fetch(balancesEndpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const balances = await response.json();
    console.log(tag, 'Balances raw:', balances);

    await AssetValue.loadStaticAssets();
    for (let i = 0; i < balances.length; i++) {
      const balance = balances[i];
      if (balance.denom.toUpperCase() === 'CACAO') {
        const identifier = `MAYA.${balance.denom.toUpperCase()}`;
        const assetValue = AssetValue.fromStringSync(identifier, balance.amount.toString());
        assetValue.caip = ChainToCaip[Chain.Mayachain];
        balances[i] = assetValue;
      }
    }

    // return balances.map((balance: any) => {
    //   const identifier = `MAYA.${balance.denom.toUpperCase()}`;
    //   const assetValue = AssetValue.fromStringSync(identifier, balance.amount.toString());
    //   return assetValue;
    // });

    console.log(tag, 'Balances final:', balances);
    return balances[0];
  } catch (e) {
    console.error('Error fetching balances:', e);
    return [];
  }
};

const sendRawTransaction = async (tx: any, sync: boolean = true) => {
  let tag = TAG + ' | sendRawTransaction | ';
  try {
    let output: any = {};
    const payload = {
      tx_bytes: tx,
      mode: sync ? 'BROADCAST_MODE_SYNC' : 'BROADCAST_MODE_ASYNC',
    };

    const urlRemote = `https://mayanode.mayachain.info/cosmos/tx/v1beta1/txs`;

    const response = await fetch(urlRemote, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.tx_response.txhash) {
      output.txid = result.tx_response.txhash;
      output.success = true;
    } else {
      output.success = false;
      output.error = 'No txhash found in response';
    }
    return output;
  } catch (e) {
    console.error(tag + 'Error in sendRawTransaction:', e);
    throw e;
  }
};

const getFees = async () => {
  let tag = TAG + ' | getFees | ';
  try {
    let fee: SwapKitNumber;
    let isThorchain = false;
    fee = new SwapKitNumber({ value: isThorchain ? 0.02 : 1, decimal: BaseDecimal['MAYA'] });

    return { [FeeOption.Average]: fee, [FeeOption.Fast]: fee, [FeeOption.Fastest]: fee };
  } catch (e) {
    console.error(tag + 'Error in getFees:', e);
    throw e;
  }
};

export const MayachainToolbox = (): any => {
  return {
    getAccount,
    getBalance,
    getFees,
    sendRawTransaction,
  };
};
