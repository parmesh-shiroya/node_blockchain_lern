import {channel} from 'diagnostic_channel';
import redis, {RedisClient} from 'redis'
import Blockchain from '../blockchain';
import Transaction from '../wallet/transaction';
import TransactionPool from '../wallet/transaction-pool';

const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN',
    TRANSACTION: 'TRANSACTION'
}
class PubSub {
    private publisher: RedisClient;
    private subscriber: RedisClient;
    private blockchain: Blockchain;
    private transactionPool: TransactionPool

    constructor({blockchain, transactionPool}: {blockchain: Blockchain, transactionPool: TransactionPool}) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;

        this.publisher = redis.createClient();
        this.subscriber = redis.createClient()

        this.subscribeToChannels();
        this.subscriber.subscribe(CHANNELS.TEST);
        this.subscriber.on('message', this.handleMessaage)
    }

    handleMessaage(channel: string, message: string) {
        console.log(`message received. Channel ${channel}. Message: ${message}`)
        const parsedMessage = JSON.parse(message)

        switch (channel) {
            case CHANNELS.BLOCKCHAIN:
                this.blockchain.replaceChain(parsedMessage)
                break;
            case CHANNELS.TRANSACTION:
                this.transactionPool.setTransaction(parsedMessage)
                break;
            default:
                return;
        }

    }

    subscribeToChannels() {
        Object.values(CHANNELS).forEach(channel => {
            this.subscriber.subscribe(channel)
        })
    }

    publish({channel, message}: {channel: string, message: string}) {
        this.subscriber.unsubscribe(channel, () => {
            this.publisher.publish(channel, message, () => {
                this.subscriber.subscribe(channel)
            })
        })
    }


    broadcastChain() {
        this.publish({
            channel: CHANNELS.BLOCKCHAIN,
            message: JSON.stringify(this.blockchain.chain)
        })
    }

    boradcastTransaction(transaction: Transaction) {
        this.publish({
            channel: CHANNELS.TRANSACTION,
            message: JSON.stringify(transaction)
        })
    }

}

export default PubSub