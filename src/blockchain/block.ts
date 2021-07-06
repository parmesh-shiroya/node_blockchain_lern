import {GENESIS_DATA, MINE_RATE} from "../config"
import {hexToBinary, cryptoHash} from "../util/";
import Transaction from "../wallet/transaction";

class Block {
    timestamp: number;
    lastHash: string;
    hash: string;
    data: string[] | Transaction[];
    nonce: number = 1;
    difficulty = 1;


    constructor({timestamp, lastHash, hash, data, nonce, difficulty}: {timestamp: number, lastHash: string, hash: string, data: string[] | Transaction[], nonce: number, difficulty: number}) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty;
    }

    static genesis() {
        return new this(GENESIS_DATA)
    }

    static mineBlock({lastBlock, data}: {lastBlock: Block, data: string[] | Transaction[]}) {
        let hash: string, timestamp: number;
        const {hash: lastHash} = lastBlock
        let {difficulty} = lastBlock
        let nonce = 0;

        do {
            nonce++;
            timestamp = Date.now()
            difficulty = Block.adjustDifficulty({originalBlock: lastBlock, timestamp})
            hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty)
        } while (hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty))

        return new this({timestamp, lastHash, data, difficulty, nonce, hash})
    }
    static adjustDifficulty({originalBlock, timestamp}: {originalBlock: Block, timestamp: number}) {
        const {difficulty} = originalBlock;
        if (difficulty < 1) return 1;
        if ((timestamp - originalBlock.timestamp) > MINE_RATE) return difficulty - 1;
        return difficulty + 1;
    }
}

export default Block;