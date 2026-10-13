import CryptoJS from 'crypto-js';

// Enterprise 256-bit AES Key and 128-bit IV matching backend GatewaySecurity
const AES_KEY = CryptoJS.enc.Utf8.parse('QbSecureFoodAppKey2026@SwiggyZmt'); // 32 bytes
const AES_IV  = CryptoJS.enc.Utf8.parse('QuickBiteIv2026!'); // 16 bytes
const HMAC_KEY = 'QB_HMAC_SECRET_INTEGRITY_TOKEN_2026_994';

/**
 * Encrypt a JavaScript object or string using AES-256-CBC
 */
export function encryptPayload(data) {
  if (data === null || data === undefined) return '';
  const text = typeof data === 'string' ? data : JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(text, AES_KEY, {
    iv: AES_IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.toString(); // Base64 ciphertext
}

/**
 * Decrypt an AES-256-CBC Base64 ciphertext returned by backend
 */
export function decryptPayload(cipherText) {
  if (!cipherText) return null;
  const decrypted = CryptoJS.AES.decrypt(cipherText, AES_KEY, {
    iv: AES_IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  const plainText = decrypted.toString(CryptoJS.enc.Utf8);
  if (!plainText) return null;
  try {
    return JSON.parse(plainText);
  } catch {
    return plainText;
  }
}

/**
 * Generate HMAC-SHA256 signature for anti-tamper and replay validation
 */
export function generateHmac(action, timestamp, payloadCipher) {
  const data = `${action}|${timestamp}|${payloadCipher || ''}`;
  return CryptoJS.HmacSHA256(data, HMAC_KEY).toString(CryptoJS.enc.Hex);
}
