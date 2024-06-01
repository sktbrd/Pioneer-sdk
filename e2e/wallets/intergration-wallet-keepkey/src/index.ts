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
import { AssetValue } from '@pioneer-platform/helpers';
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

const DB = require('@coinmasters/pioneer-db');
console.log("DB: ",DB)

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

        const txDB = new DB.DB({ });
        await txDB.init();


        //add custom path
        // let pathsAdd:any = [
        // ]

        const AllChainsSupported = availableChainsByWallet['KEEPKEY'];
        // let blockchains = AllChainsSupported.map(
        //   // @ts-ignore
        //   (chainStr: any) => ChainToNetworkId[getChainEnumValue(chainStr)],
        // );
        let blockchains = [ChainToNetworkId['ETH'],ChainToNetworkId['BASE']]
        //get paths for wallet
        console.time('getPaths');
        let paths = getPaths(blockchains)
        log.info("paths: ",paths.length)


        let config:any = {
            username,
            queryKey,
            spec,
            keepkeyApiKey:process.env.KEEPKEY_API_KEY || '',
            blockchains,
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
        console.time('start2init');
        let resultInit = await app.init(walletsVerbose, {})
        console.timeEnd('start2init');

        let assets = await app.assetsMap
        log.info(tag,"assets:",assets)
        assert(assets)

        log.info(tag,"resultInit: ",resultInit)
        log.info(tag,"wallets: ",app.wallets)



        // let txsCache = await txDB.getAllTransactions()
        // let pubkeysCache = await txDB.getPubkeys({})
        // if(!pubkeysCache) pubkeysCache = []
        // assert(pubkeysCache)
        // log.info(tag,"pubkeysCache: ",pubkeysCache)
        //
        // if(pubkeysCache.length == 0){
        //     log.info(tag,"DB empty: ",pubkeysCache)
        //     //add mm to pubkeys
        //     let pubkeysMM = [
        //       {"type":"address",
        //           "master":"0xe6F612699AA300d4C61571a101f726B4c59D0577",
        //           "address":"0xe6F612699AA300d4C61571a101f726B4c59D0577",
        //           "pubkey":"0xe6F612699AA300d4C61571a101f726B4c59D0577","context":"metamask:device.wallet","contextType":"metamask",
        //           "networks":["eip155:1","eip155:8453"]
        //       }
        //       ]
        //     let saved = await txDB.createPubkey(pubkeysMM[0])
        //     pubkeysCache = await txDB.getPubkeys({})
        // }
        // log.info(tag,"pubkeysCache: ",pubkeysCache)
        // assert(pubkeysCache)

        // let pubkeysCache:any = []
        // //load pubkeys
        // console.time('loadPubkeyCache');
        // await app.loadPubkeyCache(pubkeysCache)
        // console.timeEnd('loadPubkeyCache');

        log.info(tag,"app: ",app)

        // let pubkeys = app.pubkeys
        // log.info(tag,"app.pubkeys: ",pubkeys)
        // assert(pubkeys)
        // if(pubkeys.length == 0) throw Error("Failed to load pubkey cache")



        // //connect
        // assert(blockchains)
        // assert(blockchains[0])
        // log.info(tag,"blockchains: ",blockchains.length)
        // console.time('start2paired');
        // let pairObject = {
        //     type:WalletOption.KEEPKEY,
        //     blockchains
        // }
        // console.time('pairWallet');
        // resultInit = await app.pairWallet(pairObject)
        // console.timeEnd('pairWallet');
        // console.timeEnd('start2paired'); // End timing for pairing
        // log.debug(tag,"resultInit: ",resultInit)
        //
        // //check pairing
        // // //context should match first account
        // let context = await app.context
        // log.info(tag,"context: ",context)
        // assert(context)

        console.time('start2getPubkeys');
        //init start2end: 9.129s

        //With getPubkeys
        // await app.getPubkeys()
        // console.timeEnd('start2getPubkeys');
        // log.info(tag,"***** pubkeys: ",app.pubkeys)
        // log.info(tag,"***** pubkeys: ",app.pubkeys.length)
        // assert(app.pubkeys)
        // assert(app.pubkeys[0])
        //if(app.pubkeys.length !== 2) throw Error("Failed to get ALL pubkeys")
        // let assetinfoIn = app.pubkeys.find((asset: { caip: any }) => asset.caip === ASSET_IN)
        // assert(assetinfoIn)


        // console.time('start2getBalances');
        // await app.getBalances()
        // log.info(tag,"*** balances: ",app.balances)
        // // log.info(tag,"balances: ",app.balances.length)
        // console.timeEnd('start2getBalances');
        // console.timeEnd('start2end');



        //get assets
        //filter for pubkeys
        // let filterForPubkey = {
        //     hasPubkey: true,
        //     onlyOwned: true,
        //     noTokens: false,
        //     // searchQuery:"",
        //     // memoless:true,
        //     // integrations: ['thorswap'],
        //     // networks: ['eip155:1']
        // }
        // let assetsFiltered6 = await app.getAssets(filterForPubkey)
        // log.info(tag,"assetsFiltered: (with pubkey)",assetsFiltered6.length)
        // //verify balances are in assets


        //Pre OPT
        //start2end: 17.147s
        //start2end: 18.052s

        //Post OPT
        //start2end: 1.664s

        //query username by address
        // log.info("pubkeys: ",JSON.stringify(app.pubkeys))

        console.log("************************* TEST PASS *************************")
    } catch (e) {
        log.error(e)
        //process
        process.exit(666)
    }
}
test_service()
