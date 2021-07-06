import Block from "../blockchain/block";
import Transaction from "./transaction"

class TransactionPool {
    transactionMap: {[key: string]: Transaction}
    constructor() {
        this.transactionMap = {}
    }
    setTransaction(transaction: Transaction) {
        this.transactionMap[transaction.id] = transaction;
    }


    setMap(transactionPoolMap: {[key: string]: Transaction}) {
        this.transactionMap = transactionPoolMap
    }

    exisitingTransaction({inputAddress}: {inputAddress: string}) {
        const transactions = Object.values(this.transactionMap)
        return transactions.find(transaction => transaction.input.address === inputAddress)
    }

    validTransactions() {
        return Object.values(this.transactionMap).filter(
            (transaction) => Transaction.validTransaction(transaction))
    }

    clear() {
        this.transactionMap = {}
    }
    clearBlockchainTransactions({chain}: {chain: Block[]}) {
        for (let i = 1; i < chain.length; i++) {
            const block = chain[i]
            for (let transaction of block.data) {

                if (this.transactionMap[(transaction as Transaction).id]) {
                    delete this.transactionMap[(transaction as Transaction).id]
                }
            }
        }
    }

}

export default TransactionPool