import {argon2i, argon2Verify, setWASMModules} from 'argon2-wasm-edge'
import argon2WASM from 'argon2-wasm-edge/wasm/argon2.wasm.json'
import blake2bWASM from 'argon2-wasm-edge/wasm/blake2b.wasm.json'

await setWASMModules({
    argon2WASM,
    blake2bWASM
})

const hashingParams = {
    parallelism: 1,
    iterations: 256,
    memorySize: 512,
    hashLength: 32,
    outputType: 'encoded' as const
}

export async function hashPassword(plain: string): Promise<string> {
    const salt = new Uint8Array(16);
    crypto.getRandomValues(salt);

    return argon2i({
        ...hashingParams,
        password: plain,
        salt
    })
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
    return argon2Verify({
        password: plain,
        hash
    })
}