import cryptoHash from './crypto-hash';
describe('cryptoHash()', () => {
    it('generates a SHA-256 hashed output', () => {
        expect(cryptoHash('crypto')).toEqual('da2f073e06f78938166f247273729dfe465bf7e46105c13ce7cc651047bf0ca4')
    })
    it('produce the same hash with the same input arguments in any order', () => {
        expect(cryptoHash('one', 'two', 'three')).toEqual(cryptoHash('one', 'three', 'two',))
    })
})
