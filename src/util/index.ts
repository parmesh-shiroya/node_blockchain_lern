import {BNInput, ec} from 'elliptic'
import cryptoHash from './crypto-hash';
import hexToBinary from "./hexToBinary"
export const EC = new ec('secp256k1');

export const verifySignature = ({publicKey, data, signature}: {publicKey: string, data: object, signature: ec.Signature}) => {
    const keyFromPublic = EC.keyFromPublic(publicKey, "hex")
    return keyFromPublic.verify(cryptoHash(data), signature);
}
export {cryptoHash, hexToBinary};