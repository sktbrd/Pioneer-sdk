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



let txid:string
let IS_SIGNED: boolean

const test_service = async function (this: any) {
    let tag = TAG + " | test_service | "
    try {
        //(tag,' CHECKPOINT 1');
        console.time('start2build');
        console.time('start2broadcast');
        console.time('start2end');
        // if force new user
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
        log.info(tag,"walletKeepKey: ",keepkeyWallet)
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

        //get all assets
        let assets = await app.getAssets()
        log.info(tag,"assets: TOTAL: ",assets.length)
        assert(assets)

        // //filter by memoless
        // let filterForMemoless = {
        //     hasPubkey: false,
        //     onlyOwned:false,
        //     noTokens:false,
        //     // searchQuery:"",
        //     memoless:true,
        //     // integrations: [],
        // }
        // let assetsFiltered = await app.getAssets(filterForMemoless)
        // log.info(tag,"assetsFiltered: (memoless)",assetsFiltered.length)
        //
        // //filter by no tokens BROKE**** @TODO too low
        // let filterForNoTokens = {
        //     hasPubkey: false,
        //     onlyOwned:false,
        //     noTokens:true,
        //     // searchQuery:"",
        //     // memoless:true,
        //     // integrations: [],
        // }
        // let assetsFiltered2 = await app.getAssets(filterForNoTokens)
        // log.info(tag,"assetsFiltered: (no tokens)",assetsFiltered2.length)
        //
        //
        // let filterForBitcoin = {
        //     hasPubkey: false,
        //     onlyOwned:false,
        //     noTokens:true,
        //     searchQuery:"Bitcoin",
        //     // memoless:true,
        //     // integrations: [],
        //     // networks: []
        // }
        // let assetsFilteredSearch = await app.getAssets(filterForBitcoin)
        // log.info(tag,"assetsFiltered: (search bitcoin)",assetsFilteredSearch.length)
        //
        // let filterForThorswap = {
        //     hasPubkey: false,
        //     onlyOwned:false,
        //     noTokens:false,
        //     // searchQuery:"",
        //     // memoless:true,
        //     integrations: ['thorswap'],
        //     // networks: []
        // }
        // let assetsFiltered3 = await app.getAssets(filterForThorswap)
        // log.info(tag,"assetsFiltered: (thorswap)",assetsFiltered3.length)

        // let filterForBase = {
        //     hasPubkey: false,
        //     onlyOwned:false,
        //     noTokens:false,
        //     // searchQuery:"",
        //     // memoless:true,
        //     // integrations: ['thorswap'],
        //     networks: ['eip155:8453']
        // }
        // let assetsFiltered4 = await app.getAssets(filterForBase)
        // log.info(tag,"assetsFiltered: (base)",assetsFiltered4.length)

        // let filterForEth = {
        //     hasPubkey: false,
        //     onlyOwned:false,
        //     noTokens:false,
        //     // searchQuery:"",
        //     // memoless:true,
        //     // integrations: ['thorswap'],
        //     networks: ['eip155:1']
        // }
        // let assetsFiltered5 = await app.getAssets(filterForEth)
        // log.info(tag,"assetsFiltered: (eth)",assetsFiltered5.length)


        // //filter by base blockchain
        // log.info(tag,"assets: ",assets)

        // const baseNetworkId = 'eip155:8453';
        // const filteredAssets2 = assets.filter((asset: any) => {
        //     // Check if asset belongs to BASE blockchain by networkId
        //     const isBaseAsset = asset.networkId === baseNetworkId;
        //
        //     // Additional conditions can be included if needed, e.g., onlyOwned, noTokens, etc.
        //     // For simplicity, this example focuses on filtering by BASE networkId
        //     return isBaseAsset;
        // });
        // log.info(tag,"filteredAssets: ",filteredAssets2)
        //
        // let onlyOwned = true
        // let noTokens = false
        // let hasPubkey = true
        // let searchQuery = ""
        // const filteredAssets = assets.filter((asset: any) => {
        //     // Ensure asset.name and searchQuery are both strings before calling toLowerCase()
        //     const assetName = asset.name ? asset.name.toLowerCase() : '';
        //     const normalizedSearchQuery = searchQuery ? searchQuery.toLowerCase() : '';
        //
        //     return assetName.includes(normalizedSearchQuery) &&
        //       (!onlyOwned || (onlyOwned && asset.balance && parseFloat(asset.balance) > 0)) &&
        //       (!noTokens || (noTokens && asset.type !== 'token')) &&
        //       (!hasPubkey || (hasPubkey && asset.pubkey));
        // });
        // log.info('filteredAssets: ',filteredAssets.length)
        // log.info('filteredAssets: ',filteredAssets[0])
        // log.info('filteredAssets: ',filteredAssets)


        // const AllChainsSupported = availableChainsByWallet['KEEPKEY'];
        const AllChainsSupported = [Chain.Ethereum, Chain.Base];
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
        let pairObject = {
            type:WalletOption.KEEPKEY,
            blockchains
        }
        resultInit = await app.pairWallet(pairObject)
        console.timeEnd('start2paired'); // End timing for pairing
        log.debug(tag,"resultInit: ",resultInit)

        //check pairing
        // //context should match first account
        let context = await app.context
        log.info(tag,"context: ",context)
        assert(context)




        //search for output

        console.log("************************* TEST PASS *************************")
    } catch (e) {
        log.error(e)
        //process
        process.exit(666)
    }
}
test_service()
