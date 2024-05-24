/*
    E2E testing

 */
//@ts-ignore
import { getPaths } from '@pioneer-platform/pioneer-coins';

require("dotenv").config()
require('dotenv').config({path:"../../.env"});
require('dotenv').config({path:"./../../.env"});
require("dotenv").config({path:'../../../.env'})
require("dotenv").config({path:'../../../../.env'})

const TAG  = " | intergration-test | "
import { WalletOption, availableChainsByWallet, Chain } from '@coinmasters/types';
import { AssetValue } from '@coinmasters/core';
// console.log(process.env['BLOCKCHAIR_API_KEY'])
// if(!process.env['VITE_BLOCKCHAIR_API_KEY']) throw Error("Failed to load env vars! VITE_BLOCKCHAIR_API_KEY")
// if(!process.env['VITE_BLOCKCHAIR_API_KEY']) throw Error("Failed to load env vars!")
const log = require("@pioneer-platform/loggerdog")()
let assert = require('assert')
let SDK = require('@coinmasters/pioneer-sdk')
let wait = require('wait-promise');
let {ChainToNetworkId} = require('@pioneer-platform/pioneer-caip');
let sleep = wait.sleep;

let BLOCKCHAIN = ChainToNetworkId['BTC']
console.log("BLOCKCHAIN: ",BLOCKCHAIN)
let ASSET = 'BTC'
let MIN_BALANCE = process.env['MIN_BALANCE_DASH'] || "0.004"
let TEST_AMOUNT = process.env['TEST_AMOUNT'] || "0.005"
let spec = process.env['URL_PIONEER_SPEC'] || 'https://pioneers.dev/spec/swagger.json'
let wss = process.env['URL_PIONEER_SOCKET'] || 'wss://pioneers.dev'
let FAUCET_BITCOIN_ADDRESS = process.env['FAUCET_BITCOIN_ADDRESS']
if(!FAUCET_BITCOIN_ADDRESS) throw Error("Need Faucet Address!")
let FAUCET_ADDRESS = FAUCET_BITCOIN_ADDRESS

console.log("spec: ",spec)
console.log("wss: ",wss)

let txid:string
let IS_SIGNED: boolean


const test_service = async function (this: any) {
    let tag = TAG + " | test_service | "
    try {
        //(tag,' CHECKPOINT 1');
        console.time('start2paired');
        console.time('start2build');
        console.time('start2broadcast');
        console.time('start2end');
        //if force new user
        const queryKey = "sdk:pair-keepkey:"+Math.random();
        log.info(tag,"queryKey: ",queryKey)
        // const queryKey = "key:66fefdd6-7ea9-48cf-8e69-fc74afb9c45412"
        assert(queryKey)

        const username = "user:"+Math.random()
        assert(username)

        //add custom path
        let blockchains = [BLOCKCHAIN]

        //get paths for wallet
        let paths = getPaths(blockchains)
        // let paths = []

        // paths.push({
        //     note:"Bitcoin account 1 Native Segwit (Bech32)",
        //     blockchain: 'bitcoin',
        //     symbol: 'BTC',
        //     symbolSwapKit: 'BTC',
        //     network: 'bip122:000000000019d6689c085ae165831e93',
        //     script_type:"p2wpkh", //bech32
        //     available_scripts_types:['p2pkh','p2sh','p2wpkh','p2sh-p2wpkh'],
        //     type:"zpub",
        //     addressNList: [0x80000000 + 84, 0x80000000 + 0, 0x80000000 + 1],
        //     addressNListMaster: [0x80000000 + 84, 0x80000000 + 0, 0x80000000 + 1, 0, 0],
        //     curve: 'secp256k1',
        //     showDisplay: false // Not supported by TrezorConnect or Ledger, but KeepKey should do it
        // })

        // paths.push({
        //     note:"Bitcoin account 1 legacy",
        //     networks: ['bip122:000000000019d6689c085ae165831e93'],
        //     script_type:"p2pkh",
        //     available_scripts_types:['p2pkh','p2sh','p2wpkh','p2sh-p2wpkh'],
        //     type:"xpub",
        //     addressNList: [0x80000000 + 44, 0x80000000 + 0, 0x80000000 + 1],
        //     addressNListMaster: [0x80000000 + 44, 0x80000000 + 0, 0x80000000 + 1, 0, 0],
        //     curve: 'secp256k1',
        //     showDisplay: false // Not supported by TrezorConnect or Ledger, but KeepKey should do it
        // })

        let config:any = {
            username,
            queryKey,
            spec,
            keepkeyApiKey:process.env.KEEPKEY_API_KEY,
            wss,
            paths,
            // @ts-ignore
            ethplorerApiKey:
            // @ts-ignore
              process.env.VITE_ETHPLORER_API_KEY || 'EK-xs8Hj-qG4HbLY-LoAu7',
            // @ts-ignore
            covalentApiKey:
            // @ts-ignore
              process.env.VITE__COVALENT_API_KEY || 'cqt_rQ6333MVWCVJFVX3DbCCGMVqRH4q',
            // @ts-ignore
            utxoApiKey: process.env.VITE_BLOCKCHAIR_API_KEY || 'B_s9XK926uwmQSGTDEcZB3vSAmt5t2',
            // @ts-ignore
            walletConnectProjectId:
            // @ts-ignore
              process.env.VITE_WALLET_CONNECT_PROJECT_ID || '18224df5f72924a5f6b3569fbd56ae16',
        };

        //console.log(tag,' CHECKPOINT 2');
        //console.log(tag,' config: ',config);
        let app = new SDK.SDK(spec,config)
        const walletsVerbose: any = [];
        const { keepkeyWallet } = await import("@coinmasters/wallet-keepkey");
        //log.info(tag,"walletKeepKey: ",keepkeyWallet)
        const walletKeepKey = {
            type: WalletOption.KEEPKEY,
            icon: "https://pioneers.dev/coins/keepkey.png",
            chains: availableChainsByWallet[WalletOption.KEEPKEY],
            wallet: keepkeyWallet,
            status: "offline",
            isConnected: false,
        };
        walletsVerbose.push(walletKeepKey);

        let resultInit = await app.init(walletsVerbose, {})
        // log.info(tag,"resultInit: ",resultInit)
        log.info(tag,"wallets: ",app.wallets.length)

        //paths
        let paths2 = app.paths
        console.assert(paths2)
        log.info(tag,"paths2: ",paths2)
        log.info(tag,"paths2[0]: ",paths2[0])
        log.info(tag,"paths2[0].addressNList: ",paths2[0].addressNList)

        // //connect
        // assert(blockchains)
        // assert(blockchains[0])
        log.info(tag,"blockchains: ",blockchains)
        let pairObject = {
            type:WalletOption.KEEPKEY,
            blockchains
        }
        resultInit = await app.pairWallet(pairObject)
        log.info(tag,"resultInit: ",resultInit)

        log.info(tag,"app.assets: ",app.assets)
        log.info(tag,"app.pubkeys: ",app.pubkeys)
        let asset = app.assets.filter((b:any) => b.networkId === ChainToNetworkId[Chain.Bitcoin])
        log.info(tag,"asset: ",asset)
        assert(asset[0])
        assert(asset[0].caip)
        assert(asset[0].pubkeys)
        assert(asset[0].pubkeys[0])
        //verify pubkey


        //assets
        await app.setAssetContext(asset[0])
        log.info(tag,"assetContext: ",app.assetContext)
        assert(app.assetContext.name)
        assert(app.assetContext.chain)
        assert(app.assetContext.caip)
        assert(app.assetContext.icon)

        //check pairing
        // //context should match first account
        let context = await app.context
        log.info(tag,"context: ",context)
        assert(context)
        assert(app.paths)
        assert(app.paths[0])

        assert(app.pubkeys)
        assert(app.pubkeys[0])
        log.info(tag,"balances: ",app.balances)
        log.info(tag,"balances: ",app.balances.length)
        // let balance = app.balances.filter((b:any) => b.networkId === BLOCKCHAIN)
        // log.info(tag,"*** balance: ",balance[0])
        // assert(balance[0])
        // assert(balance[0].caip)

        //get wallet for chain
        // let walletSwapkit = await app.swapKit.getWalletByChain('BTC')
        // log.info("walletSwapkit: ",walletSwapkit)

        let assets = app.assets
        log.info(tag,"assets: ",assets)
        log.info(tag,"assets[0].pubkeys[0]: ",assets[0].pubkeys[0])
        assert(assets)
        assert(assets[0])
        assert(assets[0].caip)
        assert(assets[0].pubkeys)
        assert(assets[0].pubkeys[0])

        //TODO view inputs for pubkeys

        //TODO verify inputs


        // create assetValue
        const assetString = `${ASSET}.${ASSET}`;
        console.log('assetString: ', assetString);
        await AssetValue.loadStaticAssets();
        log.info("TEST_AMOUNT: ",TEST_AMOUNT)
        log.info("TEST_AMOUNT: ",typeof(TEST_AMOUNT))
        const assetValue = AssetValue.fromStringSync(assetString, parseFloat(TEST_AMOUNT));
        log.info("assetValue: ",assetValue)
        assert(assetValue)


        //send
        // let estimatePayload:any = {
        //     feeRate: 10,
        //     pubkeys,
        //     memo: '',
        //     recipient: FAUCET_ADDRESS,
        // }
        // log.info("estimatePayload: ",estimatePayload)
        // //verify amount is < max spendable
        // let maxSpendable = await app.swapKit.estimateMaxSendableAmount({chain:Chain.Bitcoin, params:estimatePayload})
        // log.info("maxSpendable: ",maxSpendable)
        // log.info("maxSpendable: ",maxSpendable.getValue('string'))

        //send
        // let sendPayload = {
        //     // assetValue,
        //     assetValue:maxSpendable,
        //     isMax: true,
        //     memo: '',
        //     recipient: FAUCET_ADDRESS,
        //     noBroadcast: true,
        // }
        // log.info("sendPayload: ",sendPayload)
        // const txHash = await app.swapKit.transfer(sendPayload);
        // log.info("txHash: ",txHash)
        // assert(txHash)

        console.log("************************* TEST PASS *************************")
    } catch (e) {
        log.error(e)
        //process
        process.exit(666)
    }
}
test_service()
