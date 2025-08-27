# Cloudinary Setup Guide

This guide will help you set up Cloudinary for storing admin-uploaded images in your DrinkMate application.

## Prerequisites

1. A Cloudinary account (free tier available at [cloudinary.com](https://cloudinary.com))
2. Node.js and npm installed

## Step 1: Get Cloudinary Credentials

1. Sign up or log in to [Cloudinary Console](https://cloudinary.com/console)
2. Go to your Dashboard
3. Copy the following values:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

## Step 2: Configure Environment Variables

Create or update your `.env` file in the server directory with:

```env
# Server Configuration
PORT=3000
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:3001

# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Replace `your_cloud_name`, `your_api_key`, and `your_api_secret` with your actual Cloudinary credentials.

## Step 3: Install Dependencies

The required packages are already installed:
- `cloudinary` - Cloudinary SDK
- `multer-storage-cloudinary` - Multer storage engine for Cloudinary

## Step 4: Test the Integration

1. Start your server: `npm run dev`
2. Upload an image through the admin panel
3. Check the console logs to see Cloudinary upload details
4. Verify the image appears in your Cloudinary dashboard under the "drinkmate" folder

## Features

- **Automatic Image Optimization**: Images are automatically resized and optimized
- **Cloud Storage**: All images are stored securely in the cloud
- **CDN Delivery**: Fast image delivery through Cloudinary's global CDN
- **Image Transformations**: Easy to apply filters, crops, and other transformations
- **Automatic Backup**: Images are automatically backed up in Cloudinary

## Image Storage Structure

Images are organized in Cloudinary under the `drinkmate` folder with the following structure:
```
drinkmate/
├── product-images/
├── blog-images/
├── testimonial-images/
└── other-uploads/
```

## File Size Limits

- **Maximum file size**: 10MB (increased from 5MB for local storage)
- **Supported formats**: JPG, JPEG, PNG, GIF, WebP
- **Automatic optimization**: Images are optimized for web delivery

## Troubleshooting

### Common Issues

1. **"Cloudinary not configured" error**
   - Check that all environment variables are set correctly
   - Restart the server after updating .env

2. **Upload fails with "Invalid credentials"**
   - Verify your Cloudinary API key and secret
   - Check that your Cloudinary account is active

3. **Images not displaying**
   - Check the browser console for errors
   - Verify the image URL is accessible

### Getting Help

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary Support](https://support.cloudinary.com)
- Check server console logs for detailed error messages

## Security Notes

- Never commit your `.env` file to version control
- Keep your Cloudinary API credentials secure
- Consider using environment-specific credentials for development/production
