import Blockchain from "../blockchain";
import Wallet from "../wallet";
import Transaction from "../wallet/transaction";
import TransactionPool from "../wallet/transaction-pool";
import PubSub from "./pubsub";

class TransactionMiner {
    private blockchain: Blockchain;
    private transactionPool: TransactionPool;
    private wallet: Wallet;
    private pubsub: PubSub
    constructor({blockchain, transactionPool, wallet, pubsub}: {blockchain: Blockchain, transactionPool: TransactionPool, wallet: Wallet, pubsub: PubSub}) {
        this.blockchain = blockchain
        this.transactionPool = transactionPool
        this.wallet = wallet
        this.pubsub = pubsub
    }
    mineTransaction() {
        const validTransactions = this.transactionPool.validTransactions()

        validTransactions.push(
            Transaction.rewardTransaction({minerWallet: this.wallet})
        )
        this.blockchain.addBlock({data: validTransactions})
        this.pubsub.broadcastChain()
        this.transactionPool.clear()
    }
}
export default TransactionMiner