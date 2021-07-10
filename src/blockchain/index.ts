import Block from './block'
import {cryptoHash} from '../util/';
import Transaction from '../wallet/transaction';
import {MINING_REWARD, REWARD_INPUT} from '../config';
import Wallet from '../wallet';


class Blockchain {
    chain: Block[];
    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock({data}: {data: string[] | Transaction[]}) {
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length - 1],
            data
        })
        this.chain.push(newBlock);
    }

    static isValidChain(chain: Block[]) {
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false;

        for (let i = 1; i < chain.length; i++) {

            const {timestamp, lastHash, hash, data, nonce, difficulty} = chain[i];

            const acutalLastHash = chain[i - 1].hash;

            const lastDifficulty = chain[i - 1].difficulty;

            if (lastHash !== acutalLastHash) return false;

            const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);

            if (hash !== validatedHash) return false;

            if (Math.abs(lastDifficulty - difficulty) > 1) return false;
        }

        return true;
    }

    replaceChain(chain: Block[], validateTransactions?: boolean, onSuccess?: () => void) {
        if (chain.length <= this.chain.length) {
            console.error("The incoming chain must be longer")
            return;
        }

        if (!Blockchain.isValidChain(chain)) {
            console.error("the incoming chain must be valid")
            return;
        }

        if (validateTransactions && !this.validTransactionData({chain})) {
            console.error("the incoming chain has invalid data")
            return;
        }
        if (onSuccess) onSuccess()
        console.log("replacing chain with", chain)
        this.chain = chain;
    }

    validTransactionData({chain}: {chain: Block[]}) {
        for (let i = 0; i < chain.length; i++) {
            const block = chain[i]
            const tranasactionSets = new Set();
            let reweardTransactionCount = 0
            for (let transaction of block.data) {
                transaction = transaction as Transaction
                if (transaction.input.address === REWARD_INPUT.address) {
                    reweardTransactionCount += 1;
                    if (reweardTransactionCount > 1) {
                        console.error('Miner reward exceed limit')
                        return false;
                    }
                    if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
                        console.error('Miner reward amount is invalid')
                        return false;
                    }
                } else {
                    if (!Transaction.validTransaction(transaction)) {
                        console.error('Invalid transaction');
                        return false;
                    }
                    const trueBalance = Wallet.calculateBalance({
                        chain: this.chain,
                        address: transaction.input.address
                    })
                    if (trueBalance !== transaction.input.amount) {
                        console.error("Invalid input amount")
                        return false;
                    }
                    if (tranasactionSets.has(transaction)) {
                        console.error('An identical transaction appears more than once in the block')
                        return false
                    } else {
                        tranasactionSets.add(transaction)
                    }
                }
            }
        }
        return true
    }
}
export default Blockchain;