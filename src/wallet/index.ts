import {curve, ec} from "elliptic";
import Block from "../blockchain/block";
import {STARTING_BALANCE} from "../config";
import {EC, cryptoHash} from "../util"
import Transaction from "./transaction";


class Wallet {
    balance: number;
    publicKey: string;
    keyPair: ec.KeyPair;
    constructor() {
        this.balance = STARTING_BALANCE;
        this.keyPair = EC.genKeyPair()
        this.publicKey = this.keyPair.getPublic().encode('hex', false)
    }

    sign(data: object) {
        return this.keyPair.sign(cryptoHash(data))
    }
    createTransaction({recipient, amount, chain}: {recipient: string, amount: number, chain?: Block[]}) {
        if (chain) {
            this.balance = Wallet.calculateBalance({
                chain,
                address: this.publicKey
            })
        }

        if (amount > this.balance) {
            throw new Error('Amount exceeds balance')
        }
        return new Transaction({
            senderWallet: this, recipient, amount
        })
    }
    static calculateBalance({chain, address}: {chain: Block[], address: string}) {
        let hasConductedTransaction = false;
        let outputTotal = 0
        for (let i = chain.length - 1; i > 0; i--) {
            const block = chain[i]
            for (let tranasaction of block.data) {
                if ((tranasaction as Transaction).input.address === address) {
                    hasConductedTransaction = true;
                }
                const addressOutput = (tranasaction as Transaction).outputMap[address]
                if (addressOutput) {
                    outputTotal = outputTotal + addressOutput;
                }
            }

            if (hasConductedTransaction) {
                break;
            }
        }
        return hasConductedTransaction ? outputTotal : STARTING_BALANCE + outputTotal
    }
}

export default Wallet;