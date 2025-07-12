const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile');
const multer = require('../middlewares/multer');

router.get('/', profileController.getProfile);
router.get('/settings', profileController.getProfileSettings);
router.post('/settings', multer.single('profilePic'), profileController.postUpdateProfile);

module.exports = router;
