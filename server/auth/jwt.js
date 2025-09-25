const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || '15m';
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL || '7d';
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'change-me-access';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'change-me-refresh';

function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), username: user.username, email: user.email, isAdmin: user.isAdmin || false },
    ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { sub: user._id.toString() },
    REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_TTL }
  );
}

function verifyAccess(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

function verifyRefresh(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

async function hashToken(token) {
  const saltRounds = 10;
  return bcrypt.hash(token, saltRounds);
}

async function compareToken(token, hash) {
  if (!hash) return false;
  return bcrypt.compare(token, hash);
}

function setRefreshCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  // If frontend is a different origin in prod, SameSite=None is required and Secure must be true.
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
  res.cookie('refresh_token', token, cookieOptions);
}

function clearRefreshCookie(res) {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/api/auth',
  });
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccess,
  verifyRefresh,
  hashToken,
  compareToken,
  setRefreshCookie,
  clearRefreshCookie,
};
