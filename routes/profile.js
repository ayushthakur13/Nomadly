const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile');
const { uploadProfile } = require('../middlewares/multer');

router.get('/', profileController.getProfile);
router.get('/settings', profileController.getProfileSettings);
router.post('/settings', uploadProfile.single('profilePic'), profileController.postUpdateProfile);

module.exports = router;
