// /scripts/crypto.js

export async function encryptData(data, keyBase64) {
    const encoder = new TextEncoder();
    const keyData = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0));
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = encoder.encode(JSON.stringify(data));
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        cryptoKey,
        encoded
    );
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...combined));
}

/**
 * Descriptografa dados criptografados com encryptData
 * @param {string} encryptedBase64 - String base64 contendo IV + dados criptografados
 * @param {string} keyBase64 - Chave em base64 (mesma usada para criptografar)
 * @returns {Promise<Object>} - Objeto descriptografado
 */
export async function decryptData(encryptedBase64, keyBase64) {
    const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    const keyData = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0));
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
    );
    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        cryptoKey,
        encrypted
    );
    const decoder = new TextDecoder();
    const jsonString = decoder.decode(decrypted);
    return JSON.parse(jsonString);
}

function safeStringify(obj) {
  const seen = new WeakSet();

  return JSON.stringify(obj, function (key, value) {
    if (value && typeof value === "object") {
      if (seen.has(value)) {
        return "[Circular]";
      }
      seen.add(value);
    }
    return value;
  });
}

function uint8ToBase64(bytes) {
  let binary = '';
  const chunkSize = 8192;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
}

function base64ToUint8(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

async function derive(secretKeyBase64) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    base64ToUint8(secretKeyBase64),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('cartao-static-salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptJSON(data, secretKeyBase64) {
  const encoder = new TextEncoder();
  const plaintext = encoder.encode(safeStringify(data));
  const key = await derive(secretKeyBase64);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintext
  );

  return {
    iv: uint8ToBase64(iv),
    data: uint8ToBase64(new Uint8Array(encrypted))
  };
}

export async function decryptJSON(encryptedData, secretKeyBase64) {
  const key = await derive(secretKeyBase64);
  const iv = base64ToUint8(encryptedData.iv);
  const ciphertext = base64ToUint8(encryptedData.data);
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return JSON.parse(new TextDecoder().decode(plaintext));
}