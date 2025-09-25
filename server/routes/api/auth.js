const express = require('express');
const router = express.Router();
const requireAuth = require('../../middlewares/requireAuth');
const ctrl = require('../../controllers/api/auth');

// Local auth
router.post('/signup', ctrl.signup);
router.post('/login', ctrl.login);
router.post('/logout', requireAuth, ctrl.logout);
router.get('/me', requireAuth, ctrl.me);
router.post('/refresh', ctrl.refresh);

// Google OAuth Code (popup)
router.post('/google-code', ctrl.googleCodeLogin);

module.exports = router;
