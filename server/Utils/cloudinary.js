const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Load environment variables
require('dotenv').config({ path: './.env' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your_cloud_name',
  api_key: process.env.CLOUDINARY_API_KEY || 'your_api_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your_api_secret'
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'drinkmate', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'], // Allowed image formats
    transformation: [
      { width: 1000, height: 1000, crop: 'limit' }, // Resize images to max 1000x1000
      { quality: 'auto:good' } // Optimize quality
    ]
  }
});

// Helper function to delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    console.log('Cloudinary deleteImage called with publicId:', publicId);
    console.log('PublicId type:', typeof publicId);
    console.log('PublicId length:', publicId.length);
    
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Cloudinary delete result:', result);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    console.error('Error details:', {
      message: error.message,
      http_code: error.http_code,
      name: error.name
    });
    throw error;
  }
};

// Helper function to get image URL with transformations
const getImageUrl = (publicId, options = {}) => {
  const defaultOptions = {
    width: 800,
    height: 800,
    crop: 'fill',
    quality: 'auto:good'
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  return cloudinary.url(publicId, finalOptions);
};

module.exports = {
  cloudinary,
  storage,
  deleteImage,
  getImageUrl
};
