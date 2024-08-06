import { useState, useEffect } from 'react';
import { PROMPTS_SYSTEM, TOOLS } from './chart';
const TAG = ' | inference | ';
//@ts-ignore
import { ChainToNetworkId, shortListSymbolToCaip, Chain } from '@pioneer-platform/pioneer-caip';
type ComponentType = string;

export const useInferenceChat = (usePioneer: any, initialModel = 'llama3.1') => {
    const { state } = usePioneer();
    const { app, balances, pubkeys } = state;
    const [model, setModel] = useState(initialModel);
    const [messages, setMessages] = useState<any>([]);
    const [conversation, setConversation] = useState<any>([]);
    const [input, setInput] = useState('');
    const [selectedComponent, setSelectedComponent] = useState<string>('portfolio');

    const onStart = async () => {
        try{
            //Overview of the wallet
            let balancesCount = app.balances.length
            let pubkeysCount = app.pubkeys.length
            console.log('assets: ', app.assetsMap)
            let assetsKnown = app.assetsMap.size
            console.log('assets: ', app.assetsMap.size)

            //total value of the wallet
            const filteredBalances = app.balances.filter((balance: any) => parseFloat(balance.valueUsd) >= 10);

            filteredBalances.sort((a: any, b: any) => parseFloat(b.valueUsd) - parseFloat(a.valueUsd));

            const totalValue = filteredBalances.reduce(
              (acc: any, balance: any) => acc + parseFloat(balance.valueUsd),
              0,
            );
            let totalValueUsd = totalValue

            let summary = `tell the user they are connected to their keepkey: the users wallet has ${balancesCount} balances, ${pubkeysCount} pubkeys, and ${assetsKnown} assets. The total value of your wallet is $${totalValueUsd}.`
            console.log('summary: ', summary)
            let messagesInit = [...messages, { role: 'system', content: summary }]
            let response = await app.pioneer.Inference({
                messages:messagesInit,
            })
            setMessages(messages)
            console.log('response: ', response.data)
            console.log(response.data.result.choices[0].message);
            setConversation([...conversation, response.data.result.choices[0].message])
        }catch(e){
            console.error(e)
        }
    }

    //get basics of wallet
    useEffect(() => {
        onStart()
    }, [app, app?.pioneer]);

    let EXAMPLE_WALLET = {
        shortListNameToCaip: async (params: { name: string }) => {
            if(!params.name) throw Error("No name provided");
            return shortListSymbolToCaip(Chain[params.name]);
        },
        setAssetContext: async (params: { caip: string }) => {
            if(!params.caip) throw Error("No caip provided");
            let result = await app.setAssetContext({
                caip: params.caip,
            });
            return result;
        },
        getMarketInfo: async (params: { caip: string }) => {
            if(!params.caip) throw Error("No caip provided");
            let result = await app.pioneer.MarketInfo({
                caip: params.caip,
            });
            return JSON.stringify(result.data);
        },
        getAddress: async (params: { network: any }) => {
            let pubkeys = app.pubkeys.filter((e: any) => e.networks.includes(params.network));
            if (pubkeys.length > 0) {
                return pubkeys[0].address || pubkeys[0].master;
            } else {
                throw Error("No pubkey found for " + params.network);
            }
        },
        getBalance: async (params: { network: any }) => {
            let balance = app.balances.filter((b: any) => b.networkId === params.network);
            return JSON.stringify(balance);
        }
    };

    const availableFunctions: any = {
        ...EXAMPLE_WALLET,
        showComponent: async (params: { component: any }) => {
            console.log('showComponent params:', params);
            setSelectedComponent(params.component);
            return `Component ${params.component} has been added to the dashboard.`;
        },
    };

    const submitMessage = async (message: any) => {
        const tag = TAG + ' | submitMessage | ';
        try {
            console.log(tag, 'message:', message);

            const newMessages = [...messages, ...PROMPTS_SYSTEM, { role: 'user', content: message }];
            setMessages(newMessages);
            console.log('app.pioneer: ', app.pioneer);
            console.log('TOOLS: ', TOOLS);
            const inference = await app.pioneer.Inference({
                messages: newMessages,
                functions: TOOLS
            });
            console.log('inference: ', inference.data.result);
            let result = inference.data.result.choices[0];
            console.log('result: ', result);

            const isFunction = result.message.function_call;
            if (!isFunction) {
                console.log("The model didn't use the function. Its response was:",inference.data.result.choices[0].message);
                setConversation([inference.data.result.choices[0].message])
                // setConversation([...conversation, inference.data.result.choices[0].message])
                return;
            }
            let functionCall = result.message.function_call
            const functionName = functionCall.name;
            const functionArguments = JSON.parse(functionCall.arguments);
            console.log('functionName: ', functionName);
            console.log('functionArguments: ', functionArguments);

            if (availableFunctions[functionName]) {
                let paramName = Object.keys(functionArguments)[0];
                console.log('paramName: ', paramName);
                const functionResponse = await availableFunctions[functionName](functionArguments);
                messages.push({
                    role: 'system',
                    content: `The response for ${functionName} is ${functionResponse} with arguments ${JSON.stringify(functionArguments)}`
                });
                messages.push({
                    role: 'system',
                    content: `you are a summary agent. the system made tool calls. you are to put together a response the understands in users intent, and attempts to interpret the information returned from the tools. and then summaize for the user. you are to make an inference if the solution is correct, if you are more then 80pct sure the answer is logical you tell the user this. othersize you appolize for failing and return the logic of why you think the reponse is wrong.`
                });
                // Second API call: Get final response from the model
                const finalResponse = await app.pioneer.Inference({
                    messages
                });
                console.log(finalResponse.data);
                console.log(finalResponse.data.result.choices[0]);
                console.log(finalResponse.data.result.choices[0].message);
                // setMessages([...messages, finalResponse.data.result.choices[0].message])
                // setConversation([...conversation, finalResponse.data.result.choices[0].message])
                setConversation([finalResponse.data.result.choices[0].message])
            } else {
                console.log(`Function ${functionName} not found.`);
            }
        } catch (e) {
            console.error(tag, e);
        }
    };

    return {
        model,
        setModel,
        messages,
        conversation,
        input,
        setInput,
        submitMessage,
        selectedComponent,
        setSelectedComponent,
    };
};
