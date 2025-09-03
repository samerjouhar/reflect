import CryptoJS from "crypto-js";

export function encrypt<T>(value: T, passphrase: string): string | null {
try { return CryptoJS.AES.encrypt(JSON.stringify(value), passphrase).toString(); }
catch { return null; }
}


export function decrypt<T>(ciphertext: string, passphrase: string): T | null {
try {
const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
const str = bytes.toString(CryptoJS.enc.Utf8);
return JSON.parse(str) as T;
} catch { return null; }
}