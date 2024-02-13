/*
    E2E testing

 */

require("dotenv").config()
require('dotenv').config({path:"../../.env"});
require('dotenv').config({path:"./../../.env"});
require("dotenv").config({path:'../../../.env'})
require("dotenv").config({path:'../../../../.env'})

const TAG  = " | intergration-test | "
import { WalletOption, availableChainsByWallet, getChainEnumValue, Chain } from '@coinmasters/types';
import { AssetValue } from '@coinmasters/core';

const log = require("@pioneer-platform/loggerdog")()
let assert = require('assert')
let SDK = require('@coinmasters/pioneer-sdk')
let wait = require('wait-promise');
let {ChainToNetworkId} = require('@pioneer-platform/pioneer-caip');
let sleep = wait.sleep;
import {
    getPaths,
    // @ts-ignore
} from '@pioneer-platform/pioneer-coins';
let spec = process.env['VITE_PIONEER_URL_SPEC'] || 'https://pioneers.dev/spec/swagger.json'

console.log("spec: ",spec)

let txid:string
let IS_SIGNED: boolean

const test_service = async function (this: any) {
    let tag = TAG + " | test_service | "
    try {
        //(tag,' CHECKPOINT 1');
        console.time('start2build');
        console.time('start2broadcast');
        console.time('start2end');
        //if force new user
        // const queryKey = "sdk:pair-keepkey:"+Math.random();
        // log.info(tag,"queryKey: ",queryKey)
        // assert(queryKey)
        //
        // const username = "user:"+Math.random()
        // assert(username)
        //
        // //add custom path
        // let pathsAdd:any = [
        // ]
        //
        // let config:any = {
        //     username,
        //     queryKey,
        //     spec,
        //     keepkeyApiKey:process.env.KEEPKEY_API_KEY,
        //     paths:pathsAdd,
        //     // @ts-ignore
        //     ethplorerApiKey:
        //     // @ts-ignore
        //       process.env.VITE_ETHPLORER_API_KEY || 'EK-xs8Hj-qG4HbLY-LoAu7',
        //     // @ts-ignore
        //     covalentApiKey:
        //     // @ts-ignore
        //       process.env.VITE__COVALENT_API_KEY || 'cqt_rQ6333MVWCVJFVX3DbCCGMVqRH4q',
        //     // @ts-ignore
        //     utxoApiKey: process.env.VITE_BLOCKCHAIR_API_KEY,
        //     // @ts-ignore
        //     walletConnectProjectId:
        //     // @ts-ignore
        //       process.env.VITE_WALLET_CONNECT_PROJECT_ID || '18224df5f72924a5f6b3569fbd56ae16',
        // };
        //
        // //console.log(tag,' CHECKPOINT 2');
        // //console.log(tag,' config: ',config);
        // let app = new SDK.SDK(spec,config)
        // const walletsVerbose: any = [];
        // const { keepkeyWallet } = await import("@coinmasters/wallet-keepkey");
        // //log.info(tag,"walletKeepKey: ",keepkeyWallet)
        // const walletKeepKey = {
        //     type: WalletOption.KEEPKEY,
        //     icon: "https://pioneers.dev/coins/keepkey.png",
        //     chains: availableChainsByWallet[WalletOption.KEEPKEY],
        //     wallet: keepkeyWallet,
        //     status: "offline",
        //     isConnected: false,
        // };
        // walletsVerbose.push(walletKeepKey);
        // console.time('start2init');
        // let resultInit = await app.init(walletsVerbose, {})
        // console.timeEnd('start2init');
        // // log.info(tag,"resultInit: ",resultInit)
        // log.info(tag,"wallets: ",app.wallets.length)
        //
        // // const AllChainsSupported = availableChainsByWallet['KEEPKEY'];
        // const AllChainsSupported = [Chain.Ethereum];
        // let blockchains = AllChainsSupported.map(
        //   // @ts-ignore
        //   (chainStr: any) => ChainToNetworkId[getChainEnumValue(chainStr)],
        // );
        //
        // //get paths for wallet
        // let paths = getPaths(blockchains)
        // log.info("paths: ",paths.length)
        // // @ts-ignore
        // //HACK only use 1 path per chain
        // //TODO get user input (performance or find all funds)
        // let optimized:any = [];
        // blockchains.forEach((network: any) => {
        //     const pathForNetwork = paths.filter((path: { network: any; }) => path.network === network).slice(-1)[0];
        //     if (pathForNetwork) {
        //         optimized.push(pathForNetwork);
        //     }
        // });
        // log.info("optimized: ", optimized.length);
        // app.setPaths(optimized)
        // // //connect
        // // assert(blockchains)
        // // assert(blockchains[0])
        // log.info(tag,"blockchains: ",blockchains.length)
        // console.time('start2paired');
        // resultInit = await app.pairWallet('KEEPKEY',blockchains)
        // console.timeEnd('start2paired'); // End timing for pairing
        // log.debug(tag,"resultInit: ",resultInit)
        //
        // //check pairing
        // // //context should match first account
        // let context = await app.context
        // log.info(tag,"context: ",context)
        // assert(context)
        //
        // console.time('start2getPubkeys');
        // await app.getPubkeys()
        // console.timeEnd('start2getPubkeys');
        // log.info(tag,"pubkeys: ",app.pubkeys.length)
        // assert(app.pubkeys)
        // assert(app.pubkeys[0])
        //
        // console.time('start2getBalances');
        // await app.getBalances()
        // log.info(tag,"balances: ",app.balances.length)
        // console.timeEnd('start2getBalances');
        //
        // //setAssetContext
        // let allAssets = await app.getAssets()
        //
        // for(let i = 0; i < allAssets.length; i++){
        //     let asset = allAssets[i]
        //     console.log("asset: ",asset)
        // }
        //
        //test AssetValue
        // let assetValue = AssetValue.fromChainOrSignature(
        //   Chain.Base,
        //   "0.001",
        // );
        // console.log("assetValue: ",assetValue)
        // if(assetValue.ticker !== 'ETH') throw Error("Invalid ticker for BASE!")


        // let assetValue = AssetValue.fromChainOrSignature(
        //   Chain.Mayachain,
        //   "0.001",
        // );
        // console.log("assetValue: ",assetValue)
        // if(assetValue.ticker !== 'CACAO') throw Error("Invalid ticker for MAYA!")
        // if(assetValue.chain !== 'MAYA') throw Error("Invalid chain for MAYA!")

        // let assetString = 'MAYA.CACAO'
        //
        // await AssetValue.loadStaticAssets();
        // const assetValue = AssetValue.fromStringSync(assetString, parseFloat("0.001"));
        // console.log("assetValue: ",assetValue)

        // let assetString = 'ETH.ETH'
        //
        // await AssetValue.loadStaticAssets();
        // const assetValue = AssetValue.fromStringSync(assetString, parseFloat("0.001"));
        // console.log("assetValue: ",assetValue)

        // let assetString = 'BASE.ETH'
        let assetString = 'BASE.PRO-0XEF743DF8EDA497BCF1977393C401A636518DD630'

        await AssetValue.loadStaticAssets();
        const assetValue = AssetValue.fromStringSync(assetString, parseFloat("0.001"));
        console.log("assetValue: ",assetValue)

        //verify it set
        
        //get all outputs available
        
        //search for output

        console.log("************************* TEST PASS *************************")
    } catch (e) {
        log.error(e)
        //process
        process.exit(666)
    }
}
test_service()
