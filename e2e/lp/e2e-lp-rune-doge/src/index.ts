/*
    E2E testing

 */

require("dotenv").config()
require('dotenv').config({path:"../../.env"});
require('dotenv').config({path:"./../../.env"});
require("dotenv").config({path:'../../../.env'})
require("dotenv").config({path:'../../../../.env'})

const TAG  = " | e2e-test | "
import { WalletOption, availableChainsByWallet, FeeOption, Chain } from '@coinmasters/types';
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
let BLOCKCHAIN_LEG_1 = ChainToNetworkId['THOR']
let BLOCKCHAIN_LEG_2 = ChainToNetworkId['DOGE']
let ASSET = 'RUNE'
let MIN_BALANCE = process.env['MIN_BALANCE_THOR'] || "0.01"
let TEST_AMOUNT = process.env['TEST_AMOUNT'] || "1"
let spec = process.env['PIONEER_URL_SPEC'] || 'http://127.0.0.1:9001/spec/swagger.json'
let wss = process.env['URL_PIONEER_SOCKET'] || 'wss://pioneers.dev'


console.log("spec: ",spec)
console.log("wss: ",wss)



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
        let pathsAdd:any = [
        ]

        let config:any = {
            username,
            queryKey,
            spec,
            keepkeyApiKey:process.env.KEEPKEY_API_KEY,
            wss,
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
        log.info(tag,"resultInit: ",resultInit)
        log.info(tag,"wallets: ",app.wallets.length)

        let blockchains = [BLOCKCHAIN_LEG_1, BLOCKCHAIN_LEG_2, ChainToNetworkId['ETH']]
        log.info(tag,"blockchains: ",blockchains)

        //get paths for wallet
        let paths = getPaths(blockchains)
        log.info("paths: ",paths)

        // @ts-ignore
        //HACK only use 1 path per chain
        //TODO get user input (performance or find all funds)
        // let optimized:any = [];
        // blockchains.forEach((network: any) => {
        //     const pathForNetwork = paths.filter((path: { network: any; }) => path.network === network).slice(-1)[0];
        //     if (pathForNetwork) {
        //         optimized.push(pathForNetwork);
        //     }
        // });
        // log.info("optimized: ", optimized.length);
        app.setPaths(paths)

        let pairObject = {
            type:WalletOption.KEEPKEY,
            blockchains
        }
        resultInit = await app.pairWallet(pairObject)
        log.info(tag,"resultInit: ",resultInit)
        assert(app.keepkeyApiKey)
        if(!process.env.KEEPKEY_API_KEY || process.env.KEEPKEY_API_KEY !== app.keepkeyApiKey){
            log.alert("SET THIS IN YOUR ENV AS KEEPKEY_API_KEY: ",app.keepkeyApiKey)
        }

        //check pairing
        // //context should match first account
        let context = await app.context
        log.info(tag,"context: ",context)
        assert(context)


        await app.getPubkeys()
        await app.getBalances()
        log.info(tag,"balances: ",app.balances)
        let balance = app.balances.filter((e:any) => e.ticker === ASSET)
        log.info(tag,"balance: ",balance)
        assert(balance.length > 0)
        app.setAssetContext(balance[0])
        //verify balances

        // let balanceOut = app.balances.filter((e:any) => e.chain === OUTPUT_ASSET)
        // log.info(tag,"balanceOut: ",balanceOut)
        // assert(balanceOut[0])
        // await app.setOutboundAssetContext(balanceOut[0]);

        //get outbound asset
        // let outboundAssetContext = await app.outboundAssetContext
        // log.info(tag,"outboundAssetContext: ",outboundAssetContext)
        // assert(outboundAssetContext)
        // // if(outboundAssetContext.chain !== OUTPUT_ASSET) throw Error("Wrong output!")

        assert(app.assetContext)
        assert(app.assetContext.address)
        assert(app.assetContext.address)

        //get sender context
        const senderAddress = app.assetContext.address;
        assert(senderAddress)



        await AssetValue.loadStaticAssets();

        const address = app?.swapKit.getAddress(Chain.Dogecoin);
        log.info("address: ", address);
        assert(address)
        let runeAssetValue = AssetValue.fromChainOrSignature(Chain.THORChain,parseFloat(TEST_AMOUNT))


        // create assetValue
        const assetString = `DOGE.DOGE`;
        console.log('assetString: ', assetString);

        const assetValue = AssetValue.fromStringSync(assetString, parseFloat(TEST_AMOUNT));
        log.info("assetValue: ",assetValue)

        let runeAddr = app?.swapKit.getAddress(Chain.THORChain)

        let paramsLP = {
            runeAssetValue,
            assetValue,
            runeAddr,
            assetAddr:address,
            isPendingSymmAsset:false,
            mode:'sym',
        }
        log.info("paramsLP: ",paramsLP)
        const { runeTx, assetTx } = await app?.swapKit.createLiquidity(paramsLP);
        console.log("paramsLP: ",paramsLP)
        console.log("runeTx: ",runeTx)
        console.log("assetTx: ",assetTx)

        //send
        // const txHash = await app?.swapKit.swap({
        //     route:selected,
        //     recipient: address,
        //     feeOptionKey: FeeOption.Fast,
        // });
        // log.info("txHash: ",txHash)
        // assert(txHash)

        //TODO monitor TX untill complete

        //TODO check balance


        console.log("************************* TEST PASS *************************")
    } catch (e) {
        log.error(e)
        //process
        process.exit(666)
    }
}
test_service()

