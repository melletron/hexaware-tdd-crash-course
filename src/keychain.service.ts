/**
 * We are building class that provides a KeyChainService to the Bonfire web application
 * This service is designed to store a public/private keypair into a local storage
 * So that it kan provide its public key to another service for encrypting data
 * and can use the private key to decrypt received data.
 * The interface has three methods:
 * - one to get the public key
 * - one to encrypt data
 * - one to decrypt data
 * - during the initialisation phase of the class it is retrieving the keys from local storage
 *      or generating new keys and storing them in the local storage
 */

import {localStorage} from "./mocks/local-storage.mock";

// We are going to use a standard RSA-OAEP configuration for our encryption
// Using the web crypto API (https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
const RSA_CONFIG: RsaHashedKeyGenParams = {
    name: 'RSA-OAEP',
    modulusLength: 1024,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: 'SHA-256',
};

export class KeychainService {

    public n: string | undefined; // n: The modulus value of the RSA key, Base64 URL encoded.
    private _privateKey: CryptoKey | undefined;
    private _publicKey: CryptoKey | undefined;
    private initialized: boolean = false;

    /**
     * retrieving the keys from local storage
     *      or generating new keys and storing them in the local storage
     */
    constructor() {
        // A constructor cannot handle async operations, thus we need to pus that off to an initializer function
        // all crypto methods are async because it is computationally heavy, therefore offloading it onto a web worker
        // I like my initialize method to be private, so we need to test it through other methods
        this.initialize().then(() => {
            this.initialized = true;
        });
    }

    private async initialize() {
        const publicKey = localStorage.getItem('vault-public-key');
        const privateKey = localStorage.getItem('vault-private-key');

        if (publicKey && privateKey) {
            try {
                const jwkPublic = JSON.parse(publicKey);
                this._privateKey = await crypto.subtle.importKey('jwk', JSON.parse(privateKey), RSA_CONFIG, true, ['decrypt']);
                this._publicKey = await crypto.subtle.importKey('jwk', jwkPublic, RSA_CONFIG, true, ['encrypt']);
                this.n = jwkPublic.n;
            } catch (e: unknown) {
                console.warn('keys from local storage are not correct, generating new keys');

                // We just clear the keys
                localStorage.removeItem('vault-public-key');
                localStorage.removeItem('vault-private-key');

                // and reinitialise
                await this.initialize();
            }
        } else {
            const {privateKey, publicKey} = await crypto.subtle.generateKey(RSA_CONFIG, true, ['decrypt', 'encrypt']);
            this._publicKey = publicKey;
            this._privateKey = privateKey;
            const jwkPublic = await crypto.subtle.exportKey('jwk', publicKey);
            const jwkPrivate = await crypto.subtle.exportKey('jwk', privateKey);
            this.n = jwkPublic.n;
            localStorage.setItem('vault-private-key', JSON.stringify(jwkPrivate));
            localStorage.setItem('vault-public-key', JSON.stringify(jwkPublic));
        }

    }

    public ready(): Promise<boolean> {
        return new Promise((resolve) => {
            const _ready = () => {
                if (this.initialized) {
                    resolve(true);
                }
                setTimeout(_ready, 10);
            };
            _ready();
        });
    }
}
