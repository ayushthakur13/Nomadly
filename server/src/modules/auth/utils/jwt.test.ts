import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from './jwt';

describe('jwt.ts utilities', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    email: 'test@example.com',
    isAdmin: true,
  };

  describe('generateAccessToken and verifyAccessToken', () => {
    it('signs an access token and verifying it returns the original payload correctly', () => {
      const token = generateAccessToken(mockUser);
      const decoded = verifyAccessToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.sub).toBe(mockUser._id);
      expect(decoded.username).toBe(mockUser.username);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.isAdmin).toBe(mockUser.isAdmin);
    });
  });

  describe('generateRefreshToken and verifyRefreshToken', () => {
    it('signs a refresh token and verifying it returns the original payload correctly', () => {
      const token = generateRefreshToken(mockUser);
      const decoded = verifyRefreshToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.sub).toBe(mockUser._id);
    });
  });

  describe('verifying an expired token', () => {
    it('throws TokenExpiredError when verifying an expired access token', () => {
      const payload = {
        sub: mockUser._id,
        username: mockUser.username,
        email: mockUser.email,
        isAdmin: mockUser.isAdmin,
      };
      
      const secret = process.env.JWT_ACCESS_SECRET || 'secret-access';
      // Sign with negative/zero expiration
      const token = jwt.sign(payload, secret, { expiresIn: '-1s' });

      expect(() => verifyAccessToken(token)).toThrow();
    });

    it('throws TokenExpiredError when verifying an expired refresh token', () => {
      const payload = {
        sub: mockUser._id,
      };
      
      const secret = process.env.JWT_REFRESH_SECRET || 'secret-refresh';
      // Sign with negative/zero expiration
      const token = jwt.sign(payload, secret, { expiresIn: '-1s' });

      expect(() => verifyRefreshToken(token)).toThrow();
    });
  });

  describe('verifying a tampered/malformed token', () => {
    it('throws JsonWebTokenError when verifying an access token with an invalid signature', () => {
      const token = generateAccessToken(mockUser);
      // Tamper with the token by modifying characters in the signature (last part of JWT)
      const parts = token.split('.');
      parts[2] = (parts[2] || '') + 'tampered';
      const tamperedToken = parts.join('.');

      expect(() => verifyAccessToken(tamperedToken)).toThrow();
    });

    it('throws JsonWebTokenError when verifying a malformed access token string', () => {
      expect(() => verifyAccessToken('completely-invalid-garbage-token-string')).toThrow();
    });

    it('throws JsonWebTokenError when verifying a refresh token with an invalid signature', () => {
      const token = generateRefreshToken(mockUser);
      const parts = token.split('.');
      parts[2] = (parts[2] || '') + 'tampered';
      const tamperedToken = parts.join('.');

      expect(() => verifyRefreshToken(tamperedToken)).toThrow();
    });
  });
});
