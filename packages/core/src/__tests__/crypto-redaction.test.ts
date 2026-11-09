import { describe, it, expect } from 'vitest';
import { encryptToken, decryptToken, redactLogMessage } from '../index.js';

describe('Pre-Launch Security Audit: WebCrypto Token Vault & Log Redaction', () => {
  it('encrypts and decrypts provider tokens with PBKDF2 passphrase derivation', async () => {
    const rawSecret = 'ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    const passphrase = 'user_secure_vault_passphrase_2026!';

    const vault = await encryptToken(rawSecret, passphrase);
    expect(vault.ciphertext).toBeDefined();
    expect(vault.ciphertext).not.toBe(rawSecret);
    expect(vault.iterations).toBe(100000);

    const decrypted = await decryptToken(vault, passphrase);
    expect(decrypted).toBe(rawSecret);

    // Fails with wrong passphrase
    await expect(decryptToken(vault, 'wrong_passphrase')).rejects.toThrow();
  });

  it('redacts tokens, api keys, and bearer headers from logs', () => {
    const sensitiveLog = 'Failed connecting with Authorization: Bearer ghp_ABC1234567890DEF1234567890123456 and api_key="sk_live_93817293812"';
    const redacted = redactLogMessage(sensitiveLog);

    expect(redacted).not.toContain('ghp_ABC1234567890DEF1234567890123456');
    expect(redacted).not.toContain('sk_live_93817293812');
    expect(redacted).toContain('[REDACTED]');
  });
});
