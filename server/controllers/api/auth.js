const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const Users = require('../../models/users');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefresh,
  hashToken,
  compareToken,
  setRefreshCookie,
  clearRefreshCookie,
} = require('../../auth/jwt');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_APP_ID);

function publicUser(u) {
  return {
    id: u._id,
    username: u.username,
    name: u.name,
    email: u.email,
    profilePic: u.profilePic,
    isAdmin: u.isAdmin,
  };
}

function setCsrfCookie(res) {
  const token = crypto.randomBytes(32).toString('hex');
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('csrf_token', token, {
    httpOnly: false,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return token;
}

function verifyCsrf(req) {
  const header = req.headers['x-csrf-token'];
  const cookie = req.cookies?.csrf_token;
  return header && cookie && header === cookie;
}

// POST /api/auth/signup
async function signup(req, res, next) {
  try {
    const { username, password, name, email } = req.body;
    if (!username || !password || !email) return res.status(400).json({ error: 'username, email and password are required' });

    const [existingUsername, existingEmail] = await Promise.all([
      Users.findOne({ username }),
      Users.findOne({ email }),
    ]);
    if (existingUsername) return res.status(409).json({ error: 'Username already taken' });
    if (existingEmail) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const user = await Users.create({ username, name, email, password: hash });

    // Issue tokens
    const refresh = signRefreshToken(user);
    const access = signAccessToken(user);

    // Persist refresh hash (single-device session for now)
    user.refreshTokenHash = await hashToken(refresh);
    await user.save();

    setRefreshCookie(res, refresh);
    const csrfToken = setCsrfCookie(res);

    return res.status(201).json({ user: publicUser(user), accessToken: access, csrfToken });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) return res.status(400).json({ error: 'usernameOrEmail and password are required' });

    const user = await Users.findOne({
      $or: [ { username: usernameOrEmail }, { email: usernameOrEmail } ]
    });
    if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const refresh = signRefreshToken(user);
    const access = signAccessToken(user);

    user.refreshTokenHash = await hashToken(refresh);
    await user.save();

    setRefreshCookie(res, refresh);
    const csrfToken = setCsrfCookie(res);

    return res.json({ user: publicUser(user), accessToken: access, csrfToken });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/logout
async function logout(req, res, next) {
  try {
    // CSRF protection for cookie-backed actions
    if (!verifyCsrf(req)) return res.status(403).json({ error: 'CSRF validation failed' });

    const userId = req.user?.id; // if called with access token, we clear server hash as well
    if (userId) {
      await Users.findByIdAndUpdate(userId, { $set: { refreshTokenHash: null } });
    }
    clearRefreshCookie(res);
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me (requires access token header)
async function me(req, res) {
  return res.json({ user: req.user });
}

// POST /api/auth/refresh (uses httpOnly cookie)
async function refresh(req, res, next) {
  try {
    // CSRF protection for cookie-backed action
    if (!verifyCsrf(req)) return res.status(403).json({ error: 'CSRF validation failed' });

    const token = req.cookies?.refresh_token;
    if (!token) return res.status(401).json({ error: 'Missing refresh token' });

    let payload;
    try { payload = verifyRefresh(token); } catch (e) { return res.status(401).json({ error: 'Invalid refresh token' }); }

    const user = await Users.findById(payload.sub);
    if (!user) return res.status(401).json({ error: 'Invalid refresh token' });

    const valid = await compareToken(token, user.refreshTokenHash);
    if (!valid) return res.status(401).json({ error: 'Invalid refresh token' });

    // Rotation
    const newRefresh = signRefreshToken(user);
    user.refreshTokenHash = await hashToken(newRefresh);
    await user.save();

    setRefreshCookie(res, newRefresh);

    const access = signAccessToken(user);
    return res.json({ accessToken: access, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}


// Google OAuth Code flow (popup) -> exchange code server-side for id_token
async function googleCodeLogin(req, res, next) {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'authorization code required' });

    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_APP_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_APP_SECRET;
    if (!clientId || !clientSecret) return res.status(500).json({ error: 'Google client credentials not configured' });

    const oauthClient = new OAuth2Client(clientId, clientSecret, 'postmessage');
    const { tokens } = await oauthClient.getToken(code);
    const idToken = tokens.id_token;
    if (!idToken) return res.status(400).json({ error: 'No id_token in Google response' });

    // Verify id_token using the same verifier
    const ticket = await googleClient.verifyIdToken({ idToken, audience: clientId });
    const payload = ticket.getPayload();

    const email = payload?.email;
    const name = payload?.name || '';
    const profilePic = payload?.picture || null;
    if (!email) return res.status(400).json({ error: 'Email not present in Google token' });

    let user = await Users.findOne({ googleID: payload.sub });
    if (!user) {
      const baseUsername = email.split('@')[0];
      let username = baseUsername;
      let counter = 1;
      while (await Users.findOne({ username })) {
        username = `${baseUsername}${counter++}`;
      }
      user = await Users.create({
        username,
        name,
        email,
        profilePic,
        googleID: payload.sub,
      });
    }

    const refresh = signRefreshToken(user);
    const access = signAccessToken(user);

    user.refreshTokenHash = await hashToken(refresh);
    await user.save();

    setRefreshCookie(res, refresh);
    const csrfToken = setCsrfCookie(res);

    return res.json({ user: publicUser(user), accessToken: access, csrfToken });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  signup,
  login,
  logout,
  me,
  refresh,
  googleCodeLogin,
};
