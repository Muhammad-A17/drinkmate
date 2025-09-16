const ChatSettings = require('../Models/chat-settings-model');
const { validationResult } = require('express-validator');

// Get current chat settings
const getChatSettings = async (req, res) => {
  try {
    const settings = await ChatSettings.getCurrentSettings();
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching chat settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat settings',
      message: error.message
    });
  }
};

// Update chat settings
const updateChatSettings = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const userId = req.user.id;
    const updates = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;
    delete updates.lastUpdatedBy;
    delete updates.version;
    
    const settings = await ChatSettings.updateSettings(updates, userId);
    
    res.json({
      success: true,
      data: settings,
      message: 'Chat settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating chat settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update chat settings',
      message: error.message
    });
  }
};

// Get chat status (online/offline)
const getChatStatus = async (req, res) => {
  try {
    const settings = await ChatSettings.getCurrentSettings();
    const isOnline = settings.isChatOnline();
    
    res.json({
      success: true,
      data: {
        isOnline,
        isEnabled: settings.isEnabled,
        workingHours: settings.workingHours,
        timezone: settings.timezone,
        nextAvailable: isOnline ? null : getNextAvailableTime(settings)
      }
    });
  } catch (error) {
    console.error('Error getting chat status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get chat status',
      message: error.message
    });
  }
};

// Helper function to calculate next available time
const getNextAvailableTime = (settings) => {
  if (settings.isEnabled) {
    const now = new Date();
    const serverTime = new Date(now.toLocaleString("en-US", { timeZone: settings.timezone }));
    const currentHour = serverTime.getHours();
    const currentMinute = serverTime.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const [startHour, startMinute] = settings.workingHours.start.split(':').map(Number);
    const startTime = startHour * 60 + startMinute;
    
    // If it's before start time today, return today's start time
    if (currentTime < startTime) {
      const today = new Date(serverTime);
      today.setHours(startHour, startMinute, 0, 0);
      return today.toISOString();
    }
    
    // Otherwise, return tomorrow's start time
    const tomorrow = new Date(serverTime);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(startHour, startMinute, 0, 0);
    return tomorrow.toISOString();
  }
  
  return null;
};

// Reset to default settings
const resetToDefaults = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Delete existing settings
    await ChatSettings.deleteMany({});
    
    // Create new default settings
    const defaultSettings = new ChatSettings({
      lastUpdatedBy: userId
    });
    
    await defaultSettings.save();
    
    res.json({
      success: true,
      data: defaultSettings,
      message: 'Chat settings reset to defaults'
    });
  } catch (error) {
    console.error('Error resetting chat settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset chat settings',
      message: error.message
    });
  }
};

module.exports = {
  getChatSettings,
  updateChatSettings,
  getChatStatus,
  resetToDefaults
};
