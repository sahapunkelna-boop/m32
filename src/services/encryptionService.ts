/**
 * End-to-End Encryption (E2EE) Service for M32 Mixer Presets & Console Shows
 * Uses Web Crypto API (SubtleCrypto) AES-256-GCM and PBKDF2 Key Derivation.
 */

export interface EncryptedVaultPayload {
  version: '1.0';
  algorithm: 'AES-GCM-256';
  kdf: 'PBKDF2-HMAC-SHA256';
  iterations: number;
  salt: string; // Base64
  iv: string; // Base64
  ciphertext: string; // Base64
  tagLength: number;
  createdAt: string;
  checksum: string; // SHA-256 of plain JSON
}

function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function computeSha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function encryptData(
  plainObject: unknown,
  passphrase: string
): Promise<EncryptedVaultPayload> {
  const jsonString = JSON.stringify(plainObject);
  const encoder = new TextEncoder();
  const plaintextBytes = encoder.encode(jsonString);

  // Generate random Salt (16 bytes) and IV (12 bytes for AES-GCM)
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Import raw passphrase
  const passphraseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // Derive AES-GCM 256 key
  const aesKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passphraseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  // Encrypt with AES-GCM
  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      tagLength: 128,
    },
    aesKey,
    plaintextBytes
  );

  const checksum = await computeSha256(jsonString);

  return {
    version: '1.0',
    algorithm: 'AES-GCM-256',
    kdf: 'PBKDF2-HMAC-SHA256',
    iterations: 100000,
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    ciphertext: bufferToBase64(ciphertextBuffer),
    tagLength: 128,
    createdAt: new Date().toISOString(),
    checksum,
  };
}

export async function decryptData<T = unknown>(
  vault: EncryptedVaultPayload,
  passphrase: string
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const salt = base64ToBuffer(vault.salt);
    const iv = base64ToBuffer(vault.iv);
    const ciphertext = base64ToBuffer(vault.ciphertext);

    const passphraseKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    const aesKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as unknown as BufferSource,
        iterations: vault.iterations || 100000,
        hash: 'SHA-256',
      },
      passphraseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource,
        tagLength: vault.tagLength || 128,
      },
      aesKey,
      ciphertext as unknown as BufferSource
    );

    const jsonString = decoder.decode(decryptedBuffer);

    // Verify Checksum
    const checksum = await computeSha256(jsonString);
    if (vault.checksum && checksum !== vault.checksum) {
      return { success: false, error: 'Data integrity error: Checksum mismatch.' };
    }

    const data = JSON.parse(jsonString) as T;
    return { success: true, data };
  } catch {
    return {
      success: false,
      error: 'Decryption failed: Incorrect encryption key/passphrase or corrupted payload.',
    };
  }
}
