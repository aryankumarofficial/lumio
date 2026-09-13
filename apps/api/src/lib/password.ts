import {argon2id, argon2Verify, setWASMModules} from 'argon2-wasm-edge'

// @ts-expect-error Cloudflare Workers exposes .wasm imports as WebAssembly.Module
import argon2WASM from 'argon2-wasm-edge/wasm/argon2.wasm'

// @ts-expect-error Cloudflare Workers exposes .wasm imports as WebAssembly.Module
import blake2bWASM from 'argon2-wasm-edge/wasm/blake2b.wasm'

setWASMModules({
    argon2WASM,
    blake2bWASM
}).then(() => {
    console.log('[Argon2] WASM registered');
}).catch((e) => {
    console.error("[Argon2] failed to register WASM: ", e)
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

    return await argon2id({
        ...hashingParams,
        password: plain,
        salt
    });
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
    return await argon2Verify({
        password: plain,
        hash
    })
}