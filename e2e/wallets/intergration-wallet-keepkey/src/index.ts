/*
    E2E testing

 */

require("dotenv").config()
require('dotenv').config({path:"../../.env"});
require('dotenv').config({path:"./../../.env"});
require("dotenv").config({path:'../../../.env'})
require("dotenv").config({path:'../../../../.env'})

const TAG  = " | intergration-test | "
import { WalletOption, availableChainsByWallet, getChainEnumValue } from '@coinmasters/types';
import { AssetValue } from '@coinmasters/core';
console.log(process.env['BLOCKCHAIR_API_KEY'])
if(!process.env['VITE_BLOCKCHAIR_API_KEY']) throw Error("Failed to load env vars! VITE_BLOCKCHAIR_API_KEY")
if(!process.env['VITE_BLOCKCHAIR_API_KEY']) throw Error("Failed to load env vars!")
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
        const queryKey = "sdk:pair-keepkey:"+Math.random();
        log.info(tag,"queryKey: ",queryKey)
        assert(queryKey)

        const username = "user:"+Math.random()
        assert(username)

        //add custom path
        let pathsAdd:any = [
        ]

        let config:any = {
            username,
            queryKey,
            spec,
            keepkeyApiKey:process.env.KEEPKEY_API_KEY,
            paths:pathsAdd,
            // @ts-ignore
            ethplorerApiKey:
            // @ts-ignore
              process.env.VITE_ETHPLORER_API_KEY || 'EK-xs8Hj-qG4HbLY-LoAu7',
            // @ts-ignore
            covalentApiKey:
            // @ts-ignore
              process.env.VITE__COVALENT_API_KEY || 'cqt_rQ6333MVWCVJFVX3DbCCGMVqRH4q',
            // @ts-ignore
            utxoApiKey: process.env.VITE_BLOCKCHAIR_API_KEY,
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
        console.time('start2init');
        let resultInit = await app.init(walletsVerbose, {})
        console.timeEnd('start2init');
        // log.info(tag,"resultInit: ",resultInit)
        log.info(tag,"wallets: ",app.wallets.length)

        const AllChainsSupported = availableChainsByWallet['KEEPKEY'];
        let blockchains = AllChainsSupported.map(
          // @ts-ignore
          (chainStr: any) => ChainToNetworkId[getChainEnumValue(chainStr)],
        );

        //get paths for wallet
        let paths = getPaths(blockchains)
        log.info("paths: ",paths.length)
        // @ts-ignore
        //HACK only use 1 path per chain
        //TODO get user input (performance or find all funds)
        let optimized:any = [];
        blockchains.forEach((network: any) => {
            const pathForNetwork = paths.filter((path: { network: any; }) => path.network === network).slice(-1)[0];
            if (pathForNetwork) {
                optimized.push(pathForNetwork);
            }
        });
        log.info("optimized: ", optimized.length);
        app.setPaths(optimized)
        // //connect
        // assert(blockchains)
        // assert(blockchains[0])
        log.info(tag,"blockchains: ",blockchains.length)
        console.time('start2paired');
        resultInit = await app.pairWallet('KEEPKEY',blockchains)
        console.timeEnd('start2paired'); // End timing for pairing
        log.debug(tag,"resultInit: ",resultInit)

        //check pairing
        // //context should match first account
        let context = await app.context
        log.info(tag,"context: ",context)
        assert(context)
        
        // console.time('start2getPubkeys');
        // await app.getPubkeys()
        // console.timeEnd('start2getPubkeys');
        // log.info(tag,"pubkeys: ",app.pubkeys.length)
        // assert(app.pubkeys)
        // assert(app.pubkeys[0])


        // await app.getBalances()
        // log.info(tag,"balances: ",app.balances)


        console.timeEnd('start2end');

        console.log("************************* TEST PASS *************************")
    } catch (e) {
        log.error(e)
        //process
        process.exit(666)
    }
}
test_service()
