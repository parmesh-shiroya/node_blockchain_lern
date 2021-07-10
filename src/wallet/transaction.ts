import {ec} from 'elliptic';
import {v1 as uuidv1} from 'uuid';
import Wallet from ".";
import {MINING_REWARD, REWARD_INPUT} from '../config';
import {verifySignature} from '../util';

class Transaction {
    id: string;
    outputMap: {[key: string]: number};
    input: any;
    constructor({senderWallet = new Wallet(), recipient = "reco[oemt", amount = 0, outputMap, input}: {
        senderWallet?: Wallet,
        recipient?: string,
        amount?: number,
        outputMap?: {[key: string]: number},
        input?: any
    }) {
        this.id = uuidv1()
        this.outputMap = outputMap || this.createOutputMap({senderWallet, recipient, amount});
        this.input = input || this.createInput({senderWallet, outputMap: this.outputMap})
    }
    createOutputMap({senderWallet, recipient, amount}: {senderWallet: Wallet, recipient: string, amount: number}) {
        const outputMap: {[key: string]: number} = {}
        outputMap[recipient] = amount;
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
        return outputMap;
    }

    createInput({senderWallet, outputMap}: {senderWallet: Wallet, outputMap: {[key: string]: number}}) {
        return {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(outputMap)
        }
    }

    update({senderWallet, recipient, amount}: {senderWallet: Wallet, recipient: string, amount: number}) {
        if (amount > this.outputMap[senderWallet.publicKey]) {
            throw new Error('Amount exceeds balance')
        }
        if (!this.outputMap[recipient]) {
            this.outputMap[recipient] = amount;
        } else {
            this.outputMap[recipient] = this.outputMap[recipient] + amount;
        }
        this.outputMap[senderWallet.publicKey] = this.outputMap[senderWallet.publicKey] - amount;
        this.input = this.createInput({senderWallet, outputMap: this.outputMap})
    }

    static validTransaction(transaction: Transaction): boolean {
        const {input: {address, amount, signature}, outputMap} = transaction
        const outputTotal = Object.values(outputMap).reduce((total, outputAmount) => total + outputAmount)
        if (amount !== outputTotal) {
            console.error(`Invalid transaction from ${address}`)
            return false
        }
        if (!verifySignature({publicKey: address, data: outputMap, signature})) {
            console.error(`Invalid transaction from ${address}`)
            return false;
        }
        return true
    }

    static rewardTransaction({minerWallet}: {minerWallet: Wallet}) {
        return new this({
            input: REWARD_INPUT,
            outputMap: {[minerWallet.publicKey]: MINING_REWARD}
        })
    }
}

export default Transaction;