import Crypto from 'crypto'


export default (...args: any[]) => {
    const hash = Crypto.createHash('sha256')
    hash.update(args.map((input) => JSON.stringify(input)).sort().join())
    return hash.digest('hex')
}