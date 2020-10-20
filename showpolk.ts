#!/usr/bin/env ts-node
import {ApiPromise, WsProvider} from "@polkadot/api";
import { Header } from "@polkadot/types/interfaces";

const initWs = async () => {
    const wsProvider = new WsProvider('wss://rpc.polkadot.io');
    const api = await ApiPromise.create({ provider: wsProvider });

    return api;
};

const showBlockData = (blockData: Header) => {
    if(!blockData || !blockData.number || !blockData.hash) {
        console.error("block number or hash does not exists");
        return;
    }
    console.log(`Last block number: ${blockData.number}`);
    console.log(`hash: ${blockData.hash.toHuman()}`);
    console.log(`ParentHash: ${blockData.parentHash}`);
}

const getHelp = () => {
    console.info("Show Polk Help:\n" +
    " without option: get the last block information\n"+
    " -n [BLOCK NUMBER]: search a block by number\n"+
    " --hash [BLOCK HASH]: search a block by hash\n"+
    " --help: help\n");
}

const getBlockDataByNumber = async (arg: string, api: ApiPromise): Promise<Header> => {
    if (!arg) {
        console.error("Block number is missing");
        return;
    }
    const hash = await api.rpc.chain.getBlockHash(arg);
    return api.rpc.chain.getHeader(hash);
}

const getBlockDataByHash = async (arg: string, api: ApiPromise): Promise<Header> => {
    if (!arg) {
        console.error("Block hash is missing");
        return;
    }
    return api.rpc.chain.getHeader(arg);
}

const checkOption = async (arg: string, api: ApiPromise): Promise<Header|undefined> => {
    let blockData;
    if(arg === '-n') {
        blockData = await getBlockDataByNumber(process.argv[3], api);
    } else if (arg === '--hash') {
        blockData = await getBlockDataByHash(process.argv[3], api);
    } else if (arg === '--help') {
        getHelp();
    } else {
        console.error("option does not exists");
    }

    return blockData;
}

const runCommand = async () => {
    try {
        const api = await initWs();

        const arg = process.argv[2];

        let blockData;

        if(arg) {
            blockData = await checkOption(arg, api);
        } else { 
            blockData = await api.rpc.chain.getHeader();
        }

        if (blockData) {
            showBlockData(blockData);
        }

    } catch (error) {
        console.error(error.message);
    }
}

(async () => {
    await runCommand();
    process.exit();
})();