import { AssetValue, RequestClient } from '@coinmasters/helpers';
import { Chain, RPCUrl } from '@coinmasters/types';

const PIONEER_API_URI = 'https://pioneers.dev';
// const PIONEER_API_URI = 'http://127.0.0.1:9001';

const getAccount = (address: string): Promise<any> =>
  RequestClient.get<any>(`${PIONEER_API_URI}/api/v1/getAccountInfo/ripple/${address}`);

const getBalance = async (address: any[]) => {
  //console.log(address);

  let balanceBase = await RequestClient.get(
    `${PIONEER_API_URI}/api/v1/getPubkeyBalance/ripple/${address[0].address}`,
  );
  //console.log('balance: ', balanceBase);
  //console.log('balance: ', typeof balanceBase);
  if (balanceBase && balanceBase.error) balanceBase = '0';
  await AssetValue.loadStaticAssets();
  const assetValueNative = AssetValue.fromChainOrSignature(Chain.Ripple, balanceBase);
  assetValueNative.address = address[0].address;
  assetValueNative.type = 'Native';
  //console.log('assetValueNative: ', assetValueNative);
  let balances = [assetValueNative];
  //console.log('balances: ', balances);

  return balances;
};

const sendRawTransaction = async (tx, sync = true) => {
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
    //console.log(tag, 'RPCUrl.Ripple: ', RPCUrl.Ripple);
    // Define the URL for broadcasting transactions
    let urlRemote = `${RPCUrl.Ripple}/`;
    //console.log(tag, 'urlRemote: ', urlRemote);

    // Sending the transaction using RequestClient
    let result = await RequestClient.post(urlRemote, {
      body: JSON.stringify(payload),
      headers: {
        'content-type': 'application/json', // Assuming JSON content type is required
      },
    });
    //console.log(tag, '** Broadcast ** REMOTE: result: ', result);

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
    // transfer: (params: TransferParams) => transfer(params),
    getAccount,
    getBalance,
    // // getFees,
    sendRawTransaction,
  };
};
