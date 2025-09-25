const { verifyAccess } = require('../auth/jwt');

module.exports = function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing token' });

    const payload = verifyAccess(token);
    req.user = { id: payload.sub, username: payload.username, email: payload.email, isAdmin: payload.isAdmin };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
