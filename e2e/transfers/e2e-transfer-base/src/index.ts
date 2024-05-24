/*
    E2E testing

 */

require("dotenv").config()
require('dotenv').config({path:"../../.env"});
require('dotenv').config({path:"./../../.env"});
require("dotenv").config({path:'../../../.env'})
require("dotenv").config({path:'../../../../.env'})

const TAG  = " | intergration-test | "
import { WalletOption, availableChainsByWallet, Chain } from '@coinmasters/types';
import { AssetValue, formatBigIntToSafeValue, isGasAsset } from '@coinmasters/core';
const log = require("@pioneer-platform/loggerdog")()
let assert = require('assert')
let SDK = require('@coinmasters/pioneer-sdk')
let wait = require('wait-promise');
let {ChainToNetworkId, ChainToCaip} = require('@pioneer-platform/pioneer-caip');
let sleep = wait.sleep;

let BLOCKCHAIN = ChainToNetworkId['BASE']
if(!BLOCKCHAIN) throw Error("unknown Chain! "+BLOCKCHAIN)
let ASSET = 'BASE'
let MIN_BALANCE = process.env['MIN_BALANCE_DOGE'] || "1.0004"
let TEST_AMOUNT = process.env['TEST_AMOUNT'] || "0.05"
let spec = process.env['URL_PIONEER_SPEC'] || 'https://pioneers.dev/spec/swagger.json'
let wss = process.env['URL_PIONEER_SOCKET'] || 'wss://pioneers.dev'
let FAUCET_BASE_ADDRESS = process.env['FAUCET_BASE_ADDRESS']
if(!FAUCET_BASE_ADDRESS) throw Error("Need Faucet Address!")
let FAUCET_ADDRESS = FAUCET_BASE_ADDRESS
import {
    getPaths,
    // @ts-ignore
} from '@pioneer-platform/pioneer-coins';
console.log("spec: ",spec)
console.log("wss: ",wss)

let txid:string
let IS_SIGNED: boolean


//TEST MODE
let WALLET_SEED:any
// let TEST_MODE = 'KEEPKEY'
let TEST_MODE = 'KEYSTORE'
if(TEST_MODE == "KEYSTORE"){
    WALLET_SEED=process.env['WALLET_SEED']
    if(!WALLET_SEED) throw Error("Failed to load env vars! WALLET_SEED")
}
log.info("TEST_MODE: ",TEST_MODE)

const test_service = async function (this: any) {
    let tag = TAG + " | test_service | "
    try {
        console.log(tag,' CHECKPOINT 1');
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
        let pathsCustom:any = [
        ]

        let config:any = {
            username,
            queryKey,
            spec,
            keepkeyApiKey:process.env.KEEPKEY_API_KEY,
            wss,
            paths:pathsCustom,
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

        // console.log(tag,' CHECKPOINT 2');
        // console.log(tag,' config: ',config);
        let app = new SDK.SDK(spec,config)
        const walletsVerbose: any = [];
        const { keepkeyWallet } = await import("@coinmasters/wallet-keepkey");
        const { keystoreWallet } = await import("@coinmasters/wallet-keystore");
        //log.info(tag,"walletKeepKey: ",keepkeyWallet)
        const walletKeepKey = {
            type: WalletOption.KEEPKEY,
            icon: "https://pioneers.dev/coins/keepkey.png",
            chains: availableChainsByWallet[WalletOption.KEEPKEY],
            wallet: keepkeyWallet,
            status: "offline",
            isConnected: false,
        };
        const walletKeystore:any = {
            type: WalletOption.KEYSTORE,
            icon: "https://pioneers.dev/coins/keepkey.png",
            chains: availableChainsByWallet[WalletOption.KEYSTORE],
            wallet: keystoreWallet,
            status: "offline",
            isConnected: false,
        };
        walletsVerbose.push(walletKeystore);
        walletsVerbose.push(walletKeepKey);

        let resultInit = await app.init(walletsVerbose, {})
        // log.info(tag,"resultInit: ",resultInit)
        log.info(tag,"wallets: ",app.wallets.length)

        let blockchains = [BLOCKCHAIN, ChainToNetworkId['ETH']]
        //get paths for wallet
        let paths = getPaths(blockchains)
        log.info("paths: ",paths.length)
        app.setPaths(paths)

        // //connect
        // assert(blockchains)
        // assert(blockchains[0])
        log.info(tag,"blockchains: ",blockchains)
        let pairObject:any
        if(TEST_MODE == "KEYSTORE"){
            pairObject = {
                type: WalletOption.KEYSTORE,
                seed: WALLET_SEED,
                blockchains
            }
        } else {
            //assume KK
            pairObject = {
                type:WalletOption.KEEPKEY,
                blockchains
            }
        }
        assert(pairObject)
        log.info(tag,"pairObject: ",pairObject)
        resultInit = await app.pairWallet(pairObject)
        log.info(tag,"resultInit: ",resultInit)

        //check pairing
        // //context should match first account
        let context = await app.context
        log.info(tag,"context: ",context)
        assert(context)

        //
        await app.getPubkeys()
        log.info(tag,"pubkeys: ",app.pubkeys)
        assert(app.pubkeys)
        assert(app.pubkeys[0])
        // let pubkey = app.pubkeys.filter((e:any) => e.symbol === ASSET)
        // log.info(tag,"pubkey: ",pubkey)
        // assert(pubkey.length > 0)
        //verify pubkeys


        await app.getBalances()
        log.info(tag,"balances: ",app.balances)
        log.info(tag,"balances: ",app.balances.length)
        let balance = app.balances.filter((b:any) => b.networkId === BLOCKCHAIN)
        log.info(tag,"balance: ",balance[0])
        log.info(tag,"balance: ",balance[0])

        assert(balance[0])
        assert(balance[0].caip)
        assert(balance[0].ticker)

        //
        await app.getAssets()
        log.info(tag,"assets: ",app.assets.length)
        log.info(tag,"caip: ",ChainToCaip[BLOCKCHAIN])
        let asset = app.assets.filter((b:any) => b.caip === ChainToCaip[Chain.Base])
        log.info(tag,"asset: ",asset)
        assert(asset[0])
        assert(asset[0].caip)
        assert(asset[0].ticker)

        await app.setAssetContext(asset[0])
        log.info(tag,"assetContext: ",app.assetContext)
        assert(app.assetContext)
        assert(app.assetContext.caip)
        assert(app.assetContext.ticker)



        // assert(balance.length > 0)
        //verify balances

        // create assetValue

        await AssetValue.loadStaticAssets();
        const assetStringToken = 'BASE.ETH';
        let assetValue = AssetValue.fromStringSync(assetStringToken, TEST_AMOUNT);
        // let assetValue = AssetValue.fromChainOrSignature(
        //   Chain.Base,
        //   TEST_AMOUNT,
        // );
        log.info(tag,"assetValue: ",assetValue)
        assert(assetValue)

        //send
        // let sendPayload = {
        //     assetValue,
        //     memo: '',
        //     recipient: FAUCET_ADDRESS,
        // }
        // log.info("sendPayload: ",sendPayload)
        // const txHash = await app.swapKit.transfer(sendPayload);
        // log.info("txHash: ",txHash)
        // assert(txHash)


    } catch (e) {
        log.error(e)
        //process
        process.exit(666)
    }
}
test_service()
