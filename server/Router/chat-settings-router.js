const express = require('express');
const router = express.Router();
const chatSettingsController = require('../Controller/chat-settings-controller');
const { authenticateToken, isAdmin } = require('../Middleware/auth-middleware');
const { validateChatSettings } = require('../Middleware/chat-settings-validation');
// Removed rate limiting for chat settings

// Get current chat settings (public endpoint for frontend)
router.get('/', chatSettingsController.getChatSettings);

// Get chat status (public endpoint for frontend)
router.get('/status', chatSettingsController.getChatStatus);

// Update chat settings (admin only)
router.put('/', 
  authenticateToken, 
  isAdmin, 
  validateChatSettings, 
  chatSettingsController.updateChatSettings
);

// Reset to default settings (admin only)
router.post('/reset', 
  authenticateToken, 
  isAdmin, 
  chatSettingsController.resetToDefaults
);

module.exports = router;
