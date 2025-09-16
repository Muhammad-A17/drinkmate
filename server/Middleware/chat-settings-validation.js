const { body, validationResult } = require('express-validator');

const validateChatSettings = [
  // General settings validation
  body('isEnabled').optional().isBoolean().withMessage('isEnabled must be a boolean'),
  
  // Working hours validation
  body('workingHours.start')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  
  body('workingHours.end')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  
  // Timezone validation
  body('timezone')
    .optional()
    .isString()
    .isLength({ min: 1 })
    .withMessage('Timezone must be a valid string'),
  
  // Agent settings validation
  body('autoAssign').optional().isBoolean().withMessage('autoAssign must be a boolean'),
  
  body('maxConcurrentChats')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('maxConcurrentChats must be between 1 and 20'),
  
  // Contact channels validation
  body('whatsappNumber')
    .optional()
    .matches(/^\+[1-9]\d{1,14}$/)
    .withMessage('WhatsApp number must be in international format (+1234567890)'),
  
  body('emailAddress')
    .optional()
    .isEmail()
    .withMessage('Email must be a valid email address'),
  
  // Message validation
  body('offlineMessage')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Offline message must be a string with max 500 characters'),
  
  // SLA settings validation
  body('slaSettings.firstResponseTime')
    .optional()
    .isInt({ min: 60, max: 3600 })
    .withMessage('First response time must be between 60 and 3600 seconds'),
  
  body('slaSettings.resolutionTime')
    .optional()
    .isInt({ min: 300, max: 86400 })
    .withMessage('Resolution time must be between 300 and 86400 seconds'),
  
  // Advanced settings validation
  body('advancedSettings.enableNotifications')
    .optional()
    .isBoolean()
    .withMessage('enableNotifications must be a boolean'),
  
  body('advancedSettings.enableTypingIndicators')
    .optional()
    .isBoolean()
    .withMessage('enableTypingIndicators must be a boolean'),
  
  body('advancedSettings.enableFileUploads')
    .optional()
    .isBoolean()
    .withMessage('enableFileUploads must be a boolean'),
  
  body('advancedSettings.maxFileSize')
    .optional()
    .isInt({ min: 1048576, max: 52428800 })
    .withMessage('Max file size must be between 1MB and 50MB'),
  
  // Custom validation for working hours
  body().custom((value) => {
    if (value.workingHours) {
      const { start, end } = value.workingHours;
      if (start && end) {
        const [startHour, startMinute] = start.split(':').map(Number);
        const [endHour, endMinute] = end.split(':').map(Number);
        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;
        
        // Allow 24/7 (00:00 to 23:59) or normal hours
        if (startTime !== 0 || endTime !== 1439) {
          if (startTime >= endTime) {
            throw new Error('Start time must be before end time (except for 24/7)');
          }
        }
      }
    }
    return true;
  })
];

module.exports = {
  validateChatSettings
};
