import axios from 'axios';
import express, {Request, Response} from 'express';
import Blockchain from './blockchain';
import PubSub from './app/pubsub';
import TransactionPool from './wallet/transaction-pool';
import Wallet from './wallet';
import Transaction from './wallet/transaction';

const app = express()
const blockchain: Blockchain = new Blockchain();
const transactionPool: TransactionPool = new TransactionPool();
const wallet: Wallet = new Wallet();
const pubsub: PubSub = new PubSub({blockchain, transactionPool})
const DEFAULT_PORT = 5600;
const ROOT_NODE_ADDRES = `https://localhost:${DEFAULT_PORT}`


app.use(express.json())

app.get('/api/blocks', (req: Request, res: Response) => {
    res.json(blockchain.chain);
})

app.post('/api/mine', (req: Request, res: Response) => {
    const {data} = req.body
    blockchain.addBlock({data})
    pubsub.broadcastChain()
    res.redirect('/api/blocks')
})

app.post('/api/transact', (req: Request, res: Response) => {
    const {amount, recipient} = req.body
    let transaction: Transaction | undefined = transactionPool.exisitingTransaction({inputAddress: wallet.publicKey})
    try {
        if (transaction) {
            transaction.update({senderWallet: wallet, recipient, amount})
        } else {
            transaction = wallet.createTransaction({recipient, amount})
        }
    } catch (error) {
        return res.status(400).json({type: 'error', message: error.message})
    }
    transactionPool.setTransaction(transaction)
    pubsub.boradcastTransaction(transaction)
    console.log('transactionPool', transaction)
    res.json({type: "success", transaction})
})


app.get('api/transaction-pool-map', (req: Request, res: Response) => {
    res.json(transactionPool.transactionMap)
})

const syncWithRootState = () => {
    axios.get(`${ROOT_NODE_ADDRES}/api/blocks`).then(res => {
        console.log('replace chain on sync with', res.data)
        blockchain.replaceChain(res.data)
    })
    axios.get(`${ROOT_NODE_ADDRES}/api/transaction-pool-map`).then(res => {
        console.log('replace chain on sync with', res.data)
        transactionPool.setMap(res.data)
    })
}

let PORT: number = DEFAULT_PORT;
if (process.env.GENERATE_PEER_PORT === 'true') {
    PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000)
}

app.listen(PORT, () => {
    console.log(`listening at localhost:${PORT}`)
    if (PORT !== DEFAULT_PORT)
        syncWithRootState()
})