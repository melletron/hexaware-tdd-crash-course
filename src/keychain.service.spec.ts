import {expect} from "chai";

import {localStorage} from "./mocks/local-storage.mock";
import {KeychainService} from "./keychain.service";

const sinon = require("sinon");

// We are having 2 stub keys as values we can use for our test
// These are generated manually using the Crypto library
const STUB_PRIVATE_KEY = JSON.stringify({
    "alg": "RSA-OAEP-256",
    "d": "B15ihGqNnRwmGjIIOSz4q6eZ4_2FrDnJhVUT-MtwDUmN4wXeSn1c0v_0jK1oUDzmvZ0RqgDkHuKV4QHFXr6oxEa4lqO7oAySmeC2ArJ7jtM1GfBUTRymR3twHfghKb4A2_2fqNXi7G3-H6UD6ZptkTLoqg2A82wXWooijel8gQ",
    "dp": "c2N9lZgzlmsf_gsZwXAN7OP83a6lsn3yg3VeX4nUvgKhrBYwrLAYJSY0Zfz30jK1zeW7RFqK4kWqDpaR_jMXAQ",
    "dq": "iX10_IGlBE62OappS6qILIt7gHGShxsABAmFx-3VMUevGUWJB-6gRtYKLppS6SknO7EtVCbQjrPU0vD5ux1mjQ",
    "e": "AQAB",
    "ext": true,
    "key_ops": ["decrypt"],
    "kty": "RSA",
    "n": "tRiARNa5Dj_L34A7caaTxah35ZNcEmFR1eGpRI0jJEAMeK40xTb5YPiIYXfGbhGQ4aVOgMHeL79u79ag0UhmsDoyZgoCxs4lJuAxZ4YGFqGLisbNNqdQFTJe1UG0EK12kDd7yXzhKDCE9KNWOqU61bhw5AocdAP6uATdYJD5Qn0",
    "p": "4waSH256jkrnpXWRw9pOVi7k8ea5x54I1Wgex3u4ra9NExL1P0mONFcSZnjT_LMJ41hn-90iHS2LzIsj_SY8gQ",
    "q": "zDVME9V4hLfV85OSYhUg_Sk1sb3F_6A-X9F1LHq5W_HSpdnfe_OKBm4cTe5t_FJ0vygi4zT9tJ1uoxih0k_3_Q",
    "qi": "SKkN5l5LaDJpKqvZM5Mai3GStECD36A2fKkEStFmjKomwqHepWwk3XboqmwrCSX9Nump4eb2M2LxxdnBCzjyuA"
});
const STUB_PUBLIC_KEY = JSON.stringify({
    "alg": "RSA-OAEP-256",
    "e": "AQAB",
    "ext": true,
    "key_ops": ["encrypt"],
    "kty": "RSA",
    "n": "tRiARNa5Dj_L34A7caaTxah35ZNcEmFR1eGpRI0jJEAMeK40xTb5YPiIYXfGbhGQ4aVOgMHeL79u79ag0UhmsDoyZgoCxs4lJuAxZ4YGFqGLisbNNqdQFTJe1UG0EK12kDd7yXzhKDCE9KNWOqU61bhw5AocdAP6uATdYJD5Qn0"
});

describe('KeyChain', () => {

    describe('constructor / initialize / ready', () => {

        it('takes previously generated keys from localStorage and uses that as the key pair', async () => {

            //localStorage is a singleton, so let's make sure no keys are stored there
            localStorage.removeItem('vault-public-key');
            localStorage.removeItem('vault-private-key');

            // We store our stub keys into local storage
            localStorage.setItem('vault-public-key', STUB_PUBLIC_KEY);
            localStorage.setItem('vault-private-key', STUB_PRIVATE_KEY);

            const keyChain = new KeychainService();
            // All crypto operations are async, because they're computationally heavy and thus offloaded to a web worker
            // Therefore we also need to create a ready method
            await keyChain.ready();

            // Crypto, that's meant to be with a lot of private parts
            // So the only thing we can actually validate, is the n value
            // We need to verify the actual functioning of it through other methods
            expect(keyChain.n).to.equal("tRiARNa5Dj_L34A7caaTxah35ZNcEmFR1eGpRI0jJEAMeK40xTb5YPiIYXfGbhGQ4aVOgMHeL79u79ag0UhmsDoyZgoCxs4lJuAxZ4YGFqGLisbNNqdQFTJe1UG0EK12kDd7yXzhKDCE9KNWOqU61bhw5AocdAP6uATdYJD5Qn0");

        });

        it('generates new keys if there are no keys in the local storage', async () => {
            //localStorage is a singleton, so let's make sure no keys are stored there
            localStorage.removeItem('vault-public-key');
            localStorage.removeItem('vault-private-key');

            const keyChain = new KeychainService();
            // All crypto operations are async, because they're computationally heavy and thus offloaded to a web worker
            // Therefore we also need to create a ready method
            await keyChain.ready();

            const publicKey = localStorage.getItem('vault-public-key') || 'undefined';
            const privateKey = localStorage.getItem('vault-private-key') || 'undefined';
            expect(publicKey).not.to.equal('undefined');
            expect(privateKey).not.to.equal('undefined');
            expect(keyChain.n).to.equal(JSON.parse(publicKey).n);

        });

        it('clears malformed keys from local storage and replaces it with newly generated keys' +
            ' adding a console warning', async () => {

            // We add rubbish to the local storage
            localStorage.setItem('vault-public-key', 'CORRUPTED KEY');
            localStorage.setItem('vault-private-key', 'CORRUPTED KEY');

            const warn = sinon.spy(console, 'warn');

            const keyChain = new KeychainService();
            await keyChain.ready();

            expect(warn.calledWith('keys from local storage are not correct, generating new keys')).to.be.true;

            const publicKey = localStorage.getItem('vault-public-key') || 'undefined';
            const privateKey = localStorage.getItem('vault-private-key') || 'undefined';
            expect(publicKey).not.to.equal('undefined');
            expect(publicKey).not.to.equal('CORRUPTED KEY');
            expect(privateKey).not.to.equal('undefined');
            expect(privateKey).not.to.equal('CORRUPTED KEY');
            expect(keyChain.n).to.equal(JSON.parse(publicKey).n);

            warn.restore();

        });


    });

});