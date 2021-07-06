import Wallet from ".";
import Blockchain from "../blockchain";
import Transaction from "./transaction"
import TransactionPool from "./transaction-pool";

describe('TransactionPool', () => {
    let transactionPool: TransactionPool, transaction: Transaction, senderWallet: Wallet;
    beforeEach(() => {
        transactionPool = new TransactionPool()
        senderWallet = new Wallet();
        transaction = new Transaction({
            senderWallet,
            recipient: "dummy-recipient",
            amount: 50
        });
    })

    describe('setTransaction()', () => {
        it('adds a transaction', () => {
            transactionPool.setTransaction(transaction)
            expect(transactionPool.transactionMap[transaction.id])
                .toBe(transaction)
        })
    })
    describe('exisitingTransaction()', () => {
        it('returns an exisiting transaction given and input address', () => {
            transactionPool.setTransaction(transaction)
            expect(transactionPool.exisitingTransaction({inputAddress: senderWallet.publicKey}))
                .toBe(transaction)
        })

    })

    describe('validTransactions()', () => {
        let validTransactions: Transaction[], errorMock: jest.Mock;

        beforeEach(() => {
            validTransactions = []
            errorMock = jest.fn()
            global.console.error = errorMock;
            for (let i = 0; i < 10; i++) {
                transaction = new Transaction({
                    senderWallet,
                    recipient: 'any-recipient',
                    amount: 30
                })
                if (i % 3 === 0) {
                    transaction.input.amount = 99999;
                } else if (i % 3 === 1) {
                    transaction.input.signature = new Wallet().sign(['foo'])
                } else {
                    validTransactions.push(transaction)
                }
                transactionPool.setTransaction(transaction)
            }

        })
        it('returns valid transaction', () => {
            expect(transactionPool.validTransactions()).toEqual(validTransactions);
        })
        it('logs errors for the invalid transactions', () => {
            transactionPool.validTransactions()
            expect(errorMock).toHaveBeenCalled()
        })
    })

    describe('clear()', () => {
        it('clears the transactions', () => {
            transactionPool.clear()
            expect(transactionPool.transactionMap).toEqual({})
        })
    })

    describe('clearBlockchainTransactions()', () => {
        it('clears the pool of any existing blockchain tranasactions', () => {
            const blockchain = new Blockchain()
            const expectedTransactionMap: {[key: string]: Transaction} = {}
            for (let i = 0; i < 6; i++) {
                const transaction = new Wallet().createTransaction({
                    recipient: "foo", amount: 20
                })
                transactionPool.setTransaction(transaction)
                if (i % 2 === 0) {
                    blockchain.addBlock({data: [transaction]})
                } else {
                    expectedTransactionMap[transaction.id] = transaction
                }
            }
            transactionPool.clearBlockchainTransactions({chain: blockchain.chain})
            expect(transactionPool.transactionMap).toEqual(expectedTransactionMap)
        })
    })

})