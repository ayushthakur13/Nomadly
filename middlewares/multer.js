const multer = require('multer');
const { profileStorage, tripCoverStorage, memoryStorage } = require('../utils/cloudinary');

module.exports = {
    uploadProfile: multer({ storage: profileStorage }),
    uploadTripCover: multer({ storage: tripCoverStorage }),
    uploadMemory: multer({ storage: memoryStorage })
};
