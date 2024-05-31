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
let {ChainToNetworkId, shortListNameToCaip} = require('@pioneer-platform/pioneer-caip');
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

        // // if force new user
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
        //     utxoApiKey: process.env.VITE_BLOCKCHAIR_API_KEY || 'B_s9XK926uwmQSGTDEcZB3vSAmt5t2',
        //     // @ts-ignore
        //     walletConnectProjectId:
        //     // @ts-ignore
        //       process.env.VITE_WALLET_CONNECT_PROJECT_ID || '18224df5f72924a5f6b3569fbd56ae16',
        // };
        //
        // //console.log(tag,' CHECKPOINT 2');
        // //console.log(tag,' config: ',config);
        // let app = new SDK.SDK(spec,config)
        //
        // let assets = await app.getAssets()
        // log.info(tag,"assets: TOTAL: ",assets.length)
        // assert(assets)
        // if(assets.length > 0) throw Error("Assets should filter on pubkeys, no pubkeys no assets!")
        //
        // const walletsVerbose: any = [];
        // const { keepkeyWallet } = await import("@coinmasters/wallet-keepkey");
        // log.info(tag,"walletKeepKey: ",keepkeyWallet)
        // const walletKeepKey = {
        //     type: WalletOption.KEEPKEY,
        //     icon: "https://pioneers.dev/coins/keepkey.png",
        //     chains: availableChainsByWallet[WalletOption.KEEPKEY],
        //     wallet: keepkeyWallet,
        //     status: "offline",
        //     isConnected: false,
        // };
        // walletsVerbose.push(walletKeepKey);
        // // console.time('start2init');
        // let resultInit = await app.init(walletsVerbose, {})
        // log.info(tag,"resultInit: ",resultInit)
        //
        // //lets test marketInfo on top assets
        // let topList = Object.keys(shortListNameToCaip)
        // log.info(tag,"topList: ",topList)
        // //topList creata a list of assets
        // for(let i =0; i<topList.length; i++){
        //     let caip = shortListNameToCaip[topList[i]]
        //     log.info(tag,"caip: ",caip)
        //     //get marekt info
        //     let priceData = await app.pioneer.MarketInfo({ caip });
        //     priceData = priceData.data || {};
        //     log.info(tag,"priceData: ",priceData)
        //     assert(priceData)
        // }


        // //const AllChainsSupported = availableChainsByWallet['KEEPKEY'];
        // const AllChainsSupported = [Chain.Ethereum, Chain.Base, Chain.BitcoinCash];
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
        // let pairObject = {
        //     type:WalletOption.KEEPKEY,
        //     blockchains
        // }
        // let resultPair = await app.pairWallet(pairObject)
        // log.info(tag,"resultPair: ",resultPair)
        //
        // // let assets2 = await app.assets
        // // log.info(tag,"assets2: TOTAL: ",assets2.length)
        // // assert(assets)
        //
        // //get all assets
        // let assets2 = await app.getAssets()
        // log.info(tag,"assets2: TOTAL: ",assets2)
        // assert(assets)
        //
        // let balances = await app.getBalances()
        // log.info(tag,"balances: TOTAL: ",balances.length)
        // assert(balances)
        //
        // for(let i = 0; i < balances.length; i++){
        //     let balance = balances[i]
        //     log.info(tag,"balance: ",balance)
        //     assert(balance)
        //     assert(balance.caip)
        // }

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
        // const AllChainsSupported = [Chain.Ethereum, Chain.Base, Chain.BitcoinCash];
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
        // let pairObject = {
        //     type:WalletOption.KEEPKEY,
        //     blockchains
        // }
        // resultInit = await app.pairWallet(pairObject)
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
        // //get all assets
        // // let assets = await app.getAssets()
        // // log.info(tag,"assets: ",assets.length)
        // // assert(assets)
        //
        // //filter for pubkeys
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
        //
        //
        // //filter for balances
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
        // log.info(tag,"assetsFiltered: (search bitcoin)",assetsFilteredSearch)
        // log.info(tag,"assetsFiltered: (search bitcoin)",JSON.stringify(assetsFilteredSearch))


        //
        // //filter by base blockchain
        // log.info(tag,"assets: ",assets)
        //
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

        // //setAssetContext
        // let allAssets = await app.getAssets()
        //
        // for(let i = 0; i < allAssets.length; i++){
        //     let asset = allAssets[i]
        //     console.log("asset: ",asset)
        // }
        //
        //test AssetValue

        let assetValue = AssetValue.fromChainOrSignature(
          Chain.Base,
          0,
        );
        console.log("assetValue: ",assetValue)
        console.log("assetValue: ",assetValue.getValue('string'))

        // let assetValue = AssetValue.fromChainOrSignature(
        //   Chain.Base,
        //   "0.001",
        // );
        // console.log("assetValue: ",assetValue)
        // console.log("assetValue: ",assetValue.getValue('string'))

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

        // let assetString = 'BASE.PRO-0XEF743DF8EDA497BCF1977393C401A636518DD630'
        //
        // await AssetValue.loadStaticAssets();
        // const assetValue = AssetValue.fromStringSync(assetString, parseFloat("0.001"));
        // console.log("assetValue: ",assetValue)

        // let assetString = 'ARB.ETH'
        // let assetString = 'ARB/ETH'
        // let assetString = 'MAYA.MAYA'
        // let assetString = 'ZEC.ZEC'
        // let assetString = 'BASE.ETH'
        // let assetString = 'BASE.PRO-0XEF743DF8EDA497BCF1977393C401A636518DD630'
        // let assetString = 'ETH.USDT-0xdac17f958d2ee523a2206206994597c13d831ec7'
        // let assetString = 'ETH.FOX-0xc770eefad204b5180df6a14ee197d99d808ee52d'

        // await AssetValue.loadStaticAssets();
        // const assetValue = AssetValue.fromStringSync(assetString, parseFloat("500"));
        // console.log("assetValue: ",assetValue)
        // assert(assetValue)
        //
        // console.log("assetValue: ",assetValue?.decimal)
        // console.log("assetValue: ",assetValue?.toString())
        // console.log("assetValue: ",assetValue?.getValue('string'))
        // //verify it set
        
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
