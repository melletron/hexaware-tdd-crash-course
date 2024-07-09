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

export class KeychainService {
}