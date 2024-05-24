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
import { AssetValue } from '@coinmasters/core';
const log = require("@pioneer-platform/loggerdog")()
let assert = require('assert')
let SDK = require('@coinmasters/pioneer-sdk')
let wait = require('wait-promise');
let {ChainToNetworkId, ChainToCaip} = require('@pioneer-platform/pioneer-caip');
let sleep = wait.sleep;
import {
    getPaths,
    // @ts-ignore
} from '@pioneer-platform/pioneer-coins';
let BLOCKCHAIN = ChainToNetworkId['ARB']
let ASSET = 'ARB'
let MIN_BALANCE = process.env['MIN_BALANCE_DOGE'] || "1.0004"
let TEST_AMOUNT = process.env['TEST_AMOUNT'] || "0.005"
let spec = process.env['URL_PIONEER_SPEC'] || 'https://pioneers.dev/spec/swagger.json'
let wss = process.env['URL_PIONEER_SOCKET'] || 'wss://pioneers.dev'
let FAUCET_ETH_ADDRESS = process.env['FAUCET_ETH_ADDRESS']
if(!FAUCET_ETH_ADDRESS) throw Error("Need Faucet Address!")
let FAUCET_ADDRESS = FAUCET_ETH_ADDRESS



console.log("spec: ",spec)
console.log("wss: ",wss)

let txid:string
let IS_SIGNED: boolean


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

        log.info(tag,"BLOCKCHAIN: ",BLOCKCHAIN)
        assert(BLOCKCHAIN)
        let blockchains = [BLOCKCHAIN]
        let paths = getPaths(blockchains)
        paths = paths.concat(pathsCustom)
        log.info("paths: ",paths.length)

        let config:any = {
            username,
            queryKey,
            spec,
            keepkeyApiKey:process.env.KEEPKEY_API_KEY,
            wss,
            paths,
            blockchains,
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
        // //log.info(tag,"walletKeepKey: ",keepkeyWallet)
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

        // log.info(tag,"app.assetsMap: ",app.assetsMap)
        log.info(tag,"app.assets: ",app.assets)
        let asset = app.assets.filter((b:any) => b.networkId === ChainToNetworkId[Chain.Arbitrum])
        log.info(tag,"asset: ",asset)
        assert(asset[0])
        assert(asset[0].caip)

        // //connect
        assert(app.blockchains)
        assert(app.blockchains[0])
        log.info(tag,"blockchains: ",blockchains)
        let pairObject = {
            type:WalletOption.KEEPKEY,
            blockchains
        }
        resultInit = await app.pairWallet(pairObject)
        log.info(tag,"resultInit: ",resultInit)

        // // log.info(tag,"app.assetsMap: ",app.assetsMap)
        // log.info(tag,"app.assets: ",app.assets)
        // let asset = app.assets.filter((b:any) => b.caip === ChainToCaip[Chain.Arbitrum])
        // log.info(tag,"asset: ",asset)
        // assert(asset[0])
        // assert(asset[0].caip)
        // assert(asset[0].ticker)

        //check pairing
        // //context should match first account
        let context = await app.context
        log.info(tag,"context: ",context)
        assert(context)

        //get osmo paths
        assert(app.paths)
        assert(app.paths[0])



        log.info(tag,"pubkeys: ",app.pubkeys)
        assert(app.pubkeys)
        assert(app.pubkeys[0])


        // await app.getBalances()
        log.info(tag,"balances: ",app.balances)
        log.info(tag,"balances: ",app.balances.length)
        let balance = app.balances.filter((b:any) => b.networkId === BLOCKCHAIN)
        log.info(tag,"*** balance: ",balance[0])

        assert(balance[0])
        assert(balance[0].caip)
        assert(balance[0].ticker)
        //verify balances

        //
        // await app.getAssets()
        log.info(tag,"assets: ",app.assets)
        log.info(tag,"assets: ",app.assets.length)
        log.info(tag,"caip: ",Chain.Arbitrum)
        log.info(tag,"caip: ",ChainToCaip[Chain.Arbitrum])
        // let asset = app.assets.filter((b:any) => b.caip === ChainToCaip[Chain.Arbitrum])
        // log.info(tag,"asset: ",asset)
        // assert(asset[0])
        // assert(asset[0].caip)
        // assert(asset[0].ticker)

        await app.setAssetContext(asset[0])
        log.info(tag,"assetContext: ",app.assetContext)
        assert(app.assetContext.name)
        assert(app.assetContext.chain)
        assert(app.assetContext.caip)
        assert(app.assetContext.icon)


        // create assetValue
        const assetString = `${ASSET}.ETH`;
        console.log('assetString: ', assetString);
        await AssetValue.loadStaticAssets();
        log.info("TEST_AMOUNT: ",TEST_AMOUNT)
        log.info("TEST_AMOUNT: ",typeof(TEST_AMOUNT))
        const assetValue = AssetValue.fromStringSync(assetString, parseFloat(TEST_AMOUNT));
        log.info("assetValue: ",assetValue)
        assert(assetValue)
        //send
        let sendPayload = {
            assetValue,
            memo: '',
            recipient: FAUCET_ADDRESS,
        }
        log.info("sendPayload: ",sendPayload)
        const txHash = await app.swapKit.transfer(sendPayload);
        log.info("txHash: ",txHash)
        assert(txHash)


    } catch (e) {
        log.error(e)
        //process
        process.exit(666)
    }
}
test_service()
