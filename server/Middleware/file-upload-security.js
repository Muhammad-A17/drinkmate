const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

// File type validation
const allowedMimeTypes = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp'
];

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// File size limits (in bytes)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES_PER_REQUEST = 5;

// Generate secure filename
const generateSecureFilename = (originalname) => {
  const ext = path.extname(originalname).toLowerCase();
  const randomName = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  return `${timestamp}_${randomName}${ext}`;
};

// Enhanced file filter with security checks
const secureFileFilter = (req, file, cb) => {
  try {
    // Check MIME type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error(`File type ${file.mimetype} is not allowed. Only images are permitted.`), false);
    }
    
    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error(`File extension ${ext} is not allowed.`), false);
    }
    
    // Check for suspicious filenames
    const suspiciousPatterns = [
      /\.exe$/i,
      /\.bat$/i,
      /\.cmd$/i,
      /\.scr$/i,
      /\.pif$/i,
      /\.vbs$/i,
      /\.js$/i,
      /\.php$/i,
      /\.asp$/i,
      /\.jsp$/i,
      /script/i,
      /javascript/i
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(file.originalname)) {
        return cb(new Error('Suspicious filename detected.'), false);
      }
    }
    
    // Log file upload attempt
    console.log(`File upload attempt: ${file.originalname} (${file.mimetype})`);
    
    cb(null, true);
  } catch (error) {
    cb(error, false);
  }
};

// Memory storage for processing
const memoryStorage = multer.memoryStorage();

// Configure multer with security settings
const upload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES_PER_REQUEST,
    fieldSize: 1024 * 1024, // 1MB for field data
    fieldNameSize: 100,
    fields: 10
  },
  fileFilter: secureFileFilter,
  onError: (err, next) => {
    console.error('Multer error:', err);
    next(err);
  }
});

// Image processing and validation middleware
const processAndValidateImage = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }
    
    const processedFiles = [];
    
    for (const file of req.files) {
      try {
        // Validate file buffer
        if (!file.buffer || file.buffer.length === 0) {
          throw new Error('Empty file buffer');
        }
        
        // Check file size
        if (file.buffer.length > MAX_FILE_SIZE) {
          throw new Error(`File ${file.originalname} exceeds maximum size limit`);
        }
        
        // Process image with Sharp for validation and optimization
        const imageInfo = await sharp(file.buffer)
          .metadata()
          .catch(() => {
            throw new Error(`Invalid image file: ${file.originalname}`);
          });
        
        // Validate image dimensions
        if (imageInfo.width > 5000 || imageInfo.height > 5000) {
          throw new Error(`Image ${file.originalname} dimensions too large`);
        }
        
        if (imageInfo.width < 10 || imageInfo.height < 10) {
          throw new Error(`Image ${file.originalname} dimensions too small`);
        }
        
        // Optimize image
        const optimizedBuffer = await sharp(file.buffer)
          .resize(1920, 1080, { 
            fit: 'inside',
            withoutEnlargement: true 
          })
          .jpeg({ quality: 85 })
          .toBuffer();
        
        // Generate secure filename
        const secureFilename = generateSecureFilename(file.originalname);
        
        // Create processed file object
        const processedFile = {
          fieldname: file.fieldname,
          originalname: file.originalname,
          encoding: file.encoding,
          mimetype: 'image/jpeg', // Converted to JPEG
          buffer: optimizedBuffer,
          size: optimizedBuffer.length,
          filename: secureFilename,
          path: secureFilename // For compatibility
        };
        
        processedFiles.push(processedFile);
        
        console.log(`Image processed: ${file.originalname} -> ${secureFilename} (${optimizedBuffer.length} bytes)`);
        
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error.message);
        return res.status(400).json({
          success: false,
          error: `Failed to process file ${file.originalname}: ${error.message}`
        });
      }
    }
    
    // Replace original files with processed ones
    req.files = processedFiles;
    next();
    
  } catch (error) {
    console.error('Image processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Image processing failed'
    });
  }
};

// Rate limiting for file uploads
const uploadRateLimit = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  // Simple in-memory rate limiting (use Redis in production)
  if (!global.uploadAttempts) {
    global.uploadAttempts = new Map();
  }
  
  const attempts = global.uploadAttempts.get(clientIP) || [];
  const recentAttempts = attempts.filter(time => now - time < 3600000); // 1 hour
  
  if (recentAttempts.length >= 20) { // 20 uploads per hour
    return res.status(429).json({
      success: false,
      error: 'Upload rate limit exceeded. Please try again later.'
    });
  }
  
  recentAttempts.push(now);
  global.uploadAttempts.set(clientIP, recentAttempts);
  
  next();
};

// Clean up old rate limit data
setInterval(() => {
  if (global.uploadAttempts) {
    const now = Date.now();
    for (const [ip, attempts] of global.uploadAttempts.entries()) {
      const recentAttempts = attempts.filter(time => now - time < 3600000);
      if (recentAttempts.length === 0) {
        global.uploadAttempts.delete(ip);
      } else {
        global.uploadAttempts.set(ip, recentAttempts);
      }
    }
  }
}, 300000); // Clean up every 5 minutes

module.exports = {
  upload,
  processAndValidateImage,
  uploadRateLimit,
  MAX_FILE_SIZE,
  MAX_FILES_PER_REQUEST,
  allowedMimeTypes,
  allowedExtensions
};
