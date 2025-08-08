// config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
dotenv.config();

// 🔑 Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 📁 Logo storage
const logoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'hotel/logos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

// 📁 Issue attachments storage
const issueStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'hotel/issues',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
  },
});

// ✅ Export different multer uploaders


export { cloudinary, logoStorage, issueStorage };
