const multer = require('multer');
const {v4: uuidv4} = require('uuid');
const path = require('path');

  // Storage configuration for upload post
const postStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/uploads')
    },
    filename: function (req, file, cb) {
        const uniquename = uuidv4();
      cb(null, uniquename+path.extname(file.originalname));
    }
  });
  
  // Storage configuration for profile pictures
const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads');
  },
  filename: function (req, file, cb) {
    const uniquename = uuidv4();
    cb(null, 'profile-' + uniquename + path.extname(file.originalname));
  }
});

  const upload = multer({ storage: postStorage })
  const uploadProfilePicture = multer({ storage: profileStorage })
  module.exports = { upload, uploadProfilePicture };