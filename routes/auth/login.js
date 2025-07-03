const express = require('express');
const router = express.Router();
const loginController = require('../../controllers/auth/login')

router.get('/', loginController.getLogin);
router.post('/', loginController.postLogin);

router.get('/facebook', loginController.facebookLogin);
router.get('/facebook/callback', loginController.facebookCallback);

router.get('/google', loginController.googleLogin);
router.get('/google/callback', loginController.googleCallback);

module.exports = router;
