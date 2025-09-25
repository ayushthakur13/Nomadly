const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'Nomadly/ProfilePics',
    allowed_formats: ['jpeg', 'png', 'jpg'],
    transformation: [{ width: 300, height: 300, crop: 'fill' }]
  }
});

const tripCoverStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'Nomadly/TripCovers', 
    allowed_formats: ['jpeg', 'png', 'jpg'],
    // transformation: [{ width: 800, height: 400, crop: 'fill' }]
  }
});

const memoryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'Nomadly/Memories',
    allowed_formats: ['jpeg', 'png', 'jpg']
  }
});

module.exports = {
  cloudinary,
  profileStorage,
  tripCoverStorage,
  memoryStorage
};
