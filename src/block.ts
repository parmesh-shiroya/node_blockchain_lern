import {GENESIS_DATA} from "./config"
import cryptoHash from "./crypto-hash";
class Block {
    timestamp: number;
    lastHash: string;
    hash: string;
    data: object;

    constructor({timestamp, lastHash, hash, data}: {timestamp: number, lastHash: string, hash: string, data: object}) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
    }

    static genesis() {
        return new this(GENESIS_DATA)
    }

    static mineBlock({lastBlock, data}: {lastBlock: Block, data: object}) {
        const timestamp = Date.now();
        const lastHash = lastBlock.hash
        return new this({
            timestamp,
            lastHash,
            data,
            hash: cryptoHash(timestamp, lastHash, data)
        })
    }
}

export default Block;