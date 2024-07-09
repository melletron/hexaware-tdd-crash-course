import {expect} from "chai";
import {localStorage} from "./local-storage.mock";

describe('Local Storage: Mock implementation of the browser API', () => {

    describe('setItem / getItem / removeItem', () => {
        it('adds an item to the local storage which can be retrieved later, removeItem removes the item from the storage', () => {
            expect(localStorage.getItem('key')).to.equal(undefined);
            localStorage.setItem('key', 'value');
            expect(localStorage.getItem('key')).to.equal('value');
            localStorage.removeItem('key');
            expect(localStorage.getItem('key')).to.equal(undefined);
        })
    });

});