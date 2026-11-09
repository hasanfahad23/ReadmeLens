/**
 * Serialized representation of an encrypted secret stored at rest.
 * Uses authenticated AES-GCM cipher with PBKDF2 key derivation.
 */
export interface EncryptedVault {
  /** Base64-encoded encrypted payload with integrated GCM authentication tag. */
  ciphertext: string;
  /** Base64-encoded 96-bit initialization vector generated via crypto.getRandomValues. */
  iv: string;
  /** Base64-encoded 128-bit cryptographic salt for PBKDF2 derivation. */
  salt: string;
  /** Number of PBKDF2 derivation iterations applied (100,000 minimum). */
  iterations: number;
}

const PBKDF2_ITERATIONS = 100000;

/**
 * Encrypts a sensitive credential (e.g., GitHub Personal Access Token or GitLab token)
 * using client-side WebCrypto AES-GCM (256-bit) and PBKDF2 (SHA-256, 100,000 iterations).
 *
 * @param token - Plaintext secret token string.
 * @param passphrase - User-provided master encryption key or passphrase.
 * @returns Serialized EncryptedVault containing Base64 components.
 */
export async function encryptToken(token: string, passphrase: string): Promise<EncryptedVault> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(token)
  );

  return {
    ciphertext: Buffer.from(encrypted).toString('base64'),
    iv: Buffer.from(iv).toString('base64'),
    salt: Buffer.from(salt).toString('base64'),
    iterations: PBKDF2_ITERATIONS,
  };
}

/**
 * Decrypts a stored EncryptedVault back into its original plaintext token.
 * Reconstructs the 256-bit AES-GCM key via PBKDF2 using the vault's salt and iteration count.
 * Fails automatically if the ciphertext has been modified or if the passphrase is incorrect.
 *
 * @param vault - EncryptedVault containing ciphertext, IV, salt, and iteration count.
 * @param passphrase - User-provided master encryption key or passphrase.
 * @returns Decrypted plaintext secret token.
 * @throws DOMException if authentication tag validation fails (wrong key or tampered ciphertext).
 */
export async function decryptToken(vault: EncryptedVault, passphrase: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = Buffer.from(vault.salt, 'base64');
  const iv = Buffer.from(vault.iv, 'base64');
  const ciphertext = Buffer.from(vault.ciphertext, 'base64');

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: vault.iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}
