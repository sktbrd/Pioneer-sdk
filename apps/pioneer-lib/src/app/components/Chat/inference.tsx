/*
     Pioneer Chat Inference



 */
import { useState, useEffect } from 'react';
import { PROMPTS_SYSTEM, TOOLS } from './chart';
import { EXAMPLE_WALLET } from './ai/walletFunctions';
const TAG = ' | inference | ';

export const useInferenceChat = (usePioneer: any, initialModel = 'llama3.1') => {
    const { state } = usePioneer();
    const { app } = state;
    const [model, setModel] = useState(initialModel);
    const [messages, setMessages] = useState<any>([]);
    const [conversation, setConversation] = useState<any>([]);
    const [input, setInput] = useState('');
    const [selectedComponent, setSelectedComponent] = useState<string>('portfolio');

    const onStart = async () => {
        try {
            let balancesCount = app.balances.length;
            let pubkeysCount = app.pubkeys.length;
            let assetsKnown = app.assetsMap.size;
            const filteredBalances = app.balances.filter((balance: any) => parseFloat(balance.valueUsd) >= 10);
            filteredBalances.sort((a: any, b: any) => parseFloat(b.valueUsd) - parseFloat(a.valueUsd));
            const totalValue = filteredBalances.reduce((acc: any, balance: any) => acc + parseFloat(balance.valueUsd), 0);
            let totalValueUsd = totalValue;

            let summary = `tell the user they are connected to their keepkey: the users wallet has ${balancesCount} balances, ${pubkeysCount} pubkeys, and ${assetsKnown} assets. The total value of your wallet is $${totalValueUsd}.`;
            let messagesInit = [...messages, { role: 'system', content: summary }];
            let response = await app.pioneer.Inference({ messages: messagesInit });
            setMessages(messagesInit);
            setConversation([...conversation, response.data.result.choices[0].message]);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        onStart();
    }, [app, app?.pioneer]);

    const walletFunctions = EXAMPLE_WALLET(app);

    const availableFunctions: any = {
        ...walletFunctions,
        showComponent: async (params: { component: any }) => {
            setSelectedComponent(params.component);
            return `Component ${params.component} has been added to the dashboard.`;
        },
    };

    const submitMessage = async (message: any) => {
        const tag = TAG + ' | submitMessage | ';
        try {
            const newMessages = [...messages, ...PROMPTS_SYSTEM, { role: 'user', content: message }];
            setMessages(newMessages);
            const inference = await app.pioneer.Inference({
                messages: newMessages,
                functions: TOOLS
            });
            let result = inference.data.result.choices[0];
            const isFunction = result.message.function_call;
            if (!isFunction) {
                setConversation([result.message]);
                return;
            }
            let functionCall = result.message.function_call;
            const functionName = functionCall.name;
            const functionArguments = JSON.parse(functionCall.arguments);

            if (availableFunctions[functionName]) {
                const functionResponse = await availableFunctions[functionName](functionArguments);
                messages.push({
                    role: 'system',
                    content: `The response for ${functionName} is ${functionResponse} with arguments ${JSON.stringify(functionArguments)}`
                });
                messages.push({
                    role: 'system',
                    content: `you are a summary agent. the system made tool calls. you are to put together a response that understands the user's intent, and attempts to interpret the information returned from the tools, then summarize for the user. you are to make an inference if the solution is correct, if you are more than 80% sure the answer is logical you tell the user this. otherwise you apologize for failing and return the logic of why you think the response is wrong.`
                });

                const finalResponse = await app.pioneer.Inference({ messages });
                setConversation([finalResponse.data.result.choices[0].message]);
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
