/*
    E2E testing

 */

import os from 'os';

require("dotenv").config()
require('dotenv').config({path:"../../.env"});
require('dotenv').config({path:"./../../.env"});
require("dotenv").config({path:'../../../.env'})
require("dotenv").config({path:'../../../../.env'})

const TAG  = " | e2e-test | "
import { WalletOption, availableChainsByWallet, FeeOption } from "@coinmasters/types";
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
let BLOCKCHAIN_IN = ChainToNetworkId['BASE']
let BLOCKCHAIN_OUT = ChainToNetworkId['BASE']
let ASSET = 'PRO'
let MIN_BALANCE = process.env['MIN_BALANCE_ETH'] || "0.01"
let TEST_AMOUNT = process.env['TEST_AMOUNT'] || "0.09"
let spec = process.env['VITE_PIONEER_URL_SPEC'] || 'https://pioneers.dev/spec/swagger.json'
let wss = process.env['URL_PIONEER_SOCKET'] || 'wss://pioneers.dev'
import { z } from 'zod';
const DB = require('@coinmaster' +
  's/pioneer-db');
console.log("DB: ",DB)

//ai
// let ai = require('@pioneer-platform/pioneer-ollama')

let txid:string
let IS_SIGNED: boolean

const test_service = async function (this: any) {
    let tag = TAG + " | test_service | "
    try {
        // await ai.init()
        // await ai.init('dolphin-mixtral:latest')

        /*
            Playground

            Tools Embedding
         */


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

        let blockchains = [BLOCKCHAIN_IN, ChainToNetworkId['ETH']]
        log.info(tag,"blockchains: ",blockchains)

        //get paths for wallet
        let paths = getPaths(blockchains)
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
        // log.info(tag,"wallets: ",app.wallets.length)


        // @ts-ignore
        //HACK only use 1 path per chain
        //TODO get user input (performance or find all funds)
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

        let assets = app.assetsMap
        log.info(tag,"assets: ",assets)
        assert(assets)
        assert(assets[0])

        //default filter noTokens
        let assetsGet = await app.getAssets()
        log.info(tag,"assetsGet: ",assetsGet)
        assert(assetsGet)
        assert(assetsGet[0])

        //check pairing
        // //context should match first account
        // let context = await app.context
        // log.info(tag,"context: ",context)
        // assert(context)


        await app.getPubkeys()
        await app.getBalances()



        let appView = app
        delete appView.assets
        delete appView.assetsMap



        // Example usage with correct options
        // log.info(tag,"app keys: ",Object.keys(appView))
        // log.info(tag,"app keys: pioneer ",JSON.stringify(appView.pioneer))
        // log.info(tag,"app keys: swapkit ",JSON.stringify(appView.swapKit))
        // log.info("app: ",appView.toString())
        log.info("app: ",JSON.stringify(appView))

        //
        // type ScriptResponse = {
        //     summary: string;
        //     success: boolean;
        //     result?: string;
        //     isComplete?: boolean;
        // };
        //
        // const ScriptResponseSchema = z.object({
        //     summary: z.string(),
        //     success: z.boolean().optional(),
        //     result: z.string().optional(),
        //     isComplete: z.boolean().optional(),
        // });
        //
        // const preSystem = "You are a pioneer wallet inspection tool. You interpret and review user questions and attempt to filter relevant data and if possible answer.";
        // const prompt = `${preSystem} Generate responses in strict JSON format. Include a 'summary', 'result', 'success' boolean, 'isComplete' boolean. Ensure all string values are enclosed in double quotes, no trailing commas, and no comments.`;
        //
        // const userRequestContent = "what is my eth address?";
        //
        // const messages = [
        //     { role: "system", content: prompt },
        //     { role: "user", content: userRequestContent },
        //     // Ensure to serialize appView properly before appending to the message
        //     { role: "user", content: `here is my pioneer info: ${JSON.stringify(appView)}` }
        // ];
        //
        // let handleResponse = async function(messages: any[]) {
        //     try {
        //         let response = await ai.respond(messages); // Assuming ai.respond is a function returning a promise
        //         console.log("Raw response:", response);
        //
        //         const parsedResponse = JSON.parse(response); // Ensure response is JSON
        //         console.log("Parsed response:", parsedResponse);
        //
        //         // Validate the response using Zod schema
        //         ScriptResponseSchema.parse(parsedResponse);
        //         console.log("Validated response:", parsedResponse);
        //
        //         // If you need to log additional details
        //         console.log("Content type:", typeof parsedResponse);
        //         console.log("Content keys:", Object.keys(parsedResponse));
        //
        //     } catch (e) {
        //         if (e instanceof SyntaxError) {
        //             log.error("SyntaxError in JSON parsing:", e.message);
        //         } else if (e instanceof z.ZodError) {
        //             log.error("Zod validation error:", e.errors);
        //         } else {
        //             log.error("Unexpected error:", e);
        //         }
        //         throw e; // Rethrow the error if you need to handle it upstream
        //     }
        // }
        //
        // handleResponse(messages).then(() => {
        //     console.log("Processing completed successfully.");
        // }).catch(error => {
        //     console.error("Error during processing:", error);
        // });



        //  let preSystem = "You are pioneer wallet inspection tool. you interpret and review user questions and attempt to filter relevant data and if possible answer "
        //  let prompt = preSystem+` Generate responses in strict JSON format.
        //  Include a
        //      'summary',
        //      'result',
        //      'success' boolean
        //      isComplete: boolean
        //
        //      Ensure all string values are enclosed in double quotes, no trailing commas, and no comments. must be valid json
        //
        //
        //  let "pioneer-coins" = {
        //  "getPaths": ['caip']
        // }
        //
        // some example user data:
        // {"address":"0x141D9959cAe3853b035000490C03991eB70Fc4aC","networkId":"x","eip155":true,"pubkey":"shared with ETH and all evm chains","chain":"base"}
        //
        // Example 1 command found:
        //
        //
        // input: what is my base address?
        // output:
        //
        // {
        //      "summary": "base is a blockchain with networkId x its eip155 meaning its pubkey is shared with ETH and all evm chains",
        //      "result": "0x141D9959cAe3853b035000490C03991eB70Fc4aC",
        //      "success": true,
        //      "isComplete": true,
        //  }
        //
        //  example 2 no command found
        //
        // input: what is my bitcoin address?
        // output:
        //
        // {
        //      "summary": "address not found, user needs to pair wallet",
        //      "success": false,
        //  }
        //
        // input: I want to get the price of Mazacoin
        // output:
        //
        // {
        //      "summary": "my tooling does not support price lookups",
        //      "success": false,
        //  }
        //
        //  Above are only examples never return examples, always review the user input to ensure the response is accurate.
        //
        //  `;
        //
        //  //
        //  let userRequestContent = "what is my eth address?";
        //
        //  let messages: any = [
        //      {
        //          "role": "system",
        //          "content": prompt
        //      },
        //      {
        //          role: "user",
        //          content: userRequestContent
        //      },
        //      {
        //          role: "user",
        //          content: "here is my pioneer info: "+JSON.stringify(appView)
        //      }
        //  ];
        //
        // const ScriptResponseSchema = z.object({
        //     summary: z.string(),
        //     success: z.boolean(),
        //     result: z.string().optional(),  // Optional: only included when a specific result (like an address) is available
        //     isComplete: z.boolean().optional(),  // Optional: may only be present when the response is definitively complete
        // });
        //
        //  let response = await ai.respond(messages);
        //  log.info(tag, "response: ", response)
        //  try {
        //      response = JSON.parse(response);
        //      // Validate the response using Zod schema
        //      ScriptResponseSchema.parse(response);
        //      log.info(tag, "content: ", response);
        //      log.info(tag, "content: ", typeof(response));
        //      log.info(tag, "content: ", Object.keys(response));
        //  } catch (e) {
        //      if (e instanceof z.ZodError) {
        //          log.error(tag, "Invalid response schema: ", e.errors);
        //      } else {
        //          log.error(tag, "Invalid response: ", response);
        //          log.error("Modal pretend invalid JSON: ", response.length);
        //      }
        //      throw e;
        //  }
        //
        // // validate scheme
        // log.info("response.scriptName: ", response.scriptName);
        //









       //EXAMPLE
       //  let preSystem = "You are a tool engine. you interpret and instruct you only call functions you know. if you believe there is no instruction you are trained on you return empty and refuse to try."
       //  let prompt = preSystem+` Generate responses in strict JSON format.
       //  Include a
       //      'summary',
       //      'functionName',
       //      'inputs': [param1, param2, param3....]. (params are optional) {params may be strings json or arrarys of json
       //
       //      Ensure all string values are enclosed in double quotes, no trailing commas, and no comments. must be valid json
       //
       //
       //  let "pioneer-coins" = {
       //  "getPaths": ['caip']
       // }
       //
       // some example networkIds:
       // {
       //      'ARB': 'eip155:42161',
       //      'AVAX': 'eip155:43114',
       //      'BSC': 'eip155:56',
       //      'BNB': 'binance:bnb-beacon-chain',
       //      'BCH': 'bip122:000000000000000000651ef99cb9fcbe',
       //      'BTC': 'bip122:000000000019d6689c085ae165831e93',
       //      'BASE': 'eip155:8453',
       //      'GAIA': 'cosmos:cosmoshub-4',
       //      'DASH': 'bip122:000007d91d1254d60e2dd1ae58038307',
       //      'DGB': 'bip122:digibytes-hash',
       //      'DOGE': 'bip122:00000000001a91e3dace36e2be3bf030',
       //      'KUJI': 'cosmos:kaiyo-1',
       //      'EOS': 'eos:cf057bbfb72640471fd910bcb67639c2',
       //      'ETH': 'eip155:1',
       //      'LTC': 'bip122:12a765e31ffd4059bada1e25190f6e98',
       //      'MAYA': 'cosmos:mayachain-mainnet-v1',
       //      'OP': 'eip155:10',
       //      'OSMO': 'cosmos:osmosis-1',
       //      'MATIC': 'eip155:137',
       //      'XRP': 'ripple:4109C6F2045FC7EFF4CDE8F9905D19C2',
       //      'THOR': 'cosmos:thorchain-mainnet-v1',
       //      'ZEC': 'bip122:0000000000196a45',
       //  }
       //
       // Example 1 command found:
       //
       //
       // input: I want to get the path for bitcoin
       // output:
       //
       // {
       //      "summary": "bitcoin is btc, its networkIds is bip122:000000000019d6689c085ae165831e93",
       //      "success": true,
       //      "functionName": "getPaths",
       //      "inputs": ["bip122:000000000019d6689c085ae165831e93"],
       //  }
       //
       //  example 2 no command found
       //
       // input: I want to get the price of bitcoin
       // output:
       //
       // {
       //      "summary": "command not found",
       //      "success": false,
       //  }
       //
       // input: I want to get the price of Mazacoin
       // output:
       //
       // {
       //      "summary": "caip not found for asset, need to find the caip for mazacoin",
       //      "success": false,
       //  }
       //
       //  Above are only examples never return examples, always review the user input to ensure the response is accurate.
       //
       //  `;
       //
       //  //
       //  let userRequestContent = "I want to get the path for dogecoin";
       //
       //  let messages: any = [
       //      {
       //          "role": "system",
       //          "content": prompt
       //      },
       //      {
       //          role: "user",
       //          content: userRequestContent
       //      }
       //  ];
       //
       //  const ScriptResponseSchema = z.object({
       //      summary: z.string(),
       //      success: z.boolean(),  // Corrected from z.array(z.any()) to z.boolean()
       //      functionName: z.string().optional(), // Make it optional as it might not be in every response
       //      inputs: z.array(z.string()).optional(), // Also optional for cases where no inputs are provided
       //      context: z.string().optional() // Retained as optional
       //  });
       //
       //  let response = await ai.respond(messages);
       //  log.info(tag, "response: ", response)
       //  try {
       //      response = JSON.parse(response);
       //      // Validate the response using Zod schema
       //      ScriptResponseSchema.parse(response);
       //      log.info(tag, "content: ", response);
       //      log.info(tag, "content: ", typeof(response));
       //      log.info(tag, "content: ", Object.keys(response));
       //  } catch (e) {
       //      if (e instanceof z.ZodError) {
       //          log.error(tag, "Invalid response schema: ", e.errors);
       //      } else {
       //          log.error(tag, "Invalid response: ", response);
       //          log.error("Modal pretend invalid JSON: ", response.length);
       //      }
       //      throw e;
       //  }
       //
       //  let toolbox:any = {
       //      getPaths
       //  }
       //
       //  /*
       //
       //      result:
       //
       //      {
       //        summary: 'doge is dogecoin, its caip is bip122:000007d91d1254d60e2dd1ae58038307/slip44:5',
       //        success: true,
       //        functionName: 'getPaths',
       //        inputs: [ 'bip122:000007d91d1254d60e2dd1ae58038307/slip44:5' ]
       //      }
       //
       //  */
       //
       //  //perform the action
       //  let result = await toolbox[response.functionName](response.inputs)
       //  log.info("result: ", result)
       //
       //  let result2 = await getPaths(response.inputs)
       //  log.info("result2: ", result2)

        //review the results

        //return the results to user

        console.log("************************* TEST PASS *************************")
    } catch (e) {
        log.error(e)
        //process
        process.exit(666)
    }
}
test_service()
