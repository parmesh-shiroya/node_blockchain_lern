import cryptoHash from './crypto-hash';
describe('cryptoHash()', () => {
    it('generates a SHA-256 hashed output', () => {
        expect(cryptoHash('crypto')).toEqual('7368c9fc78371c6ae1f53aed405ba97fb15e50ff19556d01e8be44817f50ff58')
    })
    it('produce the same hash with the same input arguments in any order', () => {
        expect(cryptoHash('one', 'two', 'three')).toEqual(cryptoHash('one', 'three', 'two',))
    })

    it('produces a unique hash when the properties have changed on an input', () => {
        const foo: {[key: string]: string} = {}
        const originalHash = cryptoHash(foo)
        foo['a'] = "a"
        expect(cryptoHash(foo)).not.toEqual(originalHash)
    })
})
