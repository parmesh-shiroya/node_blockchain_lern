import {curve, ec} from "elliptic";
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
    createTransaction({recipient, amount}: {recipient: string, amount: number}) {
        if (amount > this.balance) {
            throw new Error('Amount exceeds balance')
        }
        return new Transaction({
            senderWallet: this, recipient, amount
        })
    }
}

export default Wallet;