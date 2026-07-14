import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  comparePassword,
  hashToken,
  compareToken,
} from './hash';

describe('hash.ts utilities', () => {
  describe('password hashing and comparison', () => {
    it('returns true when comparing the correct plaintext password against the hash', async () => {
      const password = 'mySecretPassword123';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password); // should not be plaintext
      
      const isMatch = await comparePassword(password, hash);
      expect(isMatch).toBe(true);
    });

    it('returns false when comparing an incorrect plaintext password against the hash', async () => {
      const password = 'mySecretPassword123';
      const hash = await hashPassword(password);
      
      const isMatch = await comparePassword('wrongPassword', hash);
      expect(isMatch).toBe(false);
    });

    it('returns false when the hash is not provided (null or undefined)', async () => {
      expect(await comparePassword('password', null)).toBe(false);
      expect(await comparePassword('password', undefined)).toBe(false);
    });
  });

  describe('token hashing and comparison', () => {
    it('returns true when comparing the correct plaintext token against the hash', async () => {
      const token = 'someSecureTokenString';
      const hash = await hashToken(token);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(token);
      
      const isMatch = await compareToken(token, hash);
      expect(isMatch).toBe(true);
    });

    it('returns false when comparing an incorrect plaintext token against the hash', async () => {
      const token = 'someSecureTokenString';
      const hash = await hashToken(token);
      
      const isMatch = await compareToken('wrongToken', hash);
      expect(isMatch).toBe(false);
    });

    it('returns false when the hash is not provided (null or undefined)', async () => {
      expect(await compareToken('token', null)).toBe(false);
      expect(await compareToken('token', undefined)).toBe(false);
    });
  });
});
