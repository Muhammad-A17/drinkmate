const express = require('express');
const router = express.Router();
const chatController = require('../Controller/chat-controller');
const { authenticateToken, isAdmin } = require('../Middleware/auth-middleware');
const { generalLimiter } = require('../Middleware/security-middleware');

// Apply rate limiting to all routes
router.use(generalLimiter);

// Get all chats (admin only)
router.get('/', authenticateToken, isAdmin, chatController.getAllChats);

// Admin route alias for frontend compatibility
router.get('/admin/all', authenticateToken, isAdmin, chatController.getAllChats);

// Agents endpoint (placeholder for frontend compatibility)
router.get('/agents', authenticateToken, isAdmin, (req, res) => {
  res.json({
    success: true,
    data: [
      { id: '1', name: 'Admin Agent', status: 'online', activeChats: 0 },
      { id: '2', name: 'Support Agent', status: 'online', activeChats: 0 }
    ]
  });
});

// Get chat statistics (admin only)
router.get('/stats', authenticateToken, isAdmin, chatController.getChatStats);

// Admin route alias for stats
router.get('/admin/stats', authenticateToken, isAdmin, chatController.getChatStats);

// Get specific chat (admin only)
router.get('/:id', authenticateToken, isAdmin, chatController.getChatById);

// Create new chat session (public for contact form)
router.post('/', chatController.createChat);

// Get messages for a specific chat
router.get('/:chatId/messages', authenticateToken, isAdmin, chatController.getChatMessages);

// Assign chat to admin
router.put('/:chatId/assign', authenticateToken, isAdmin, chatController.assignChat);

// Close chat
router.put('/:chatId/close', authenticateToken, isAdmin, chatController.closeChat);

// Add message to chat (admin only)
router.post('/:chatId/messages', authenticateToken, isAdmin, chatController.addMessage);

// Assign chat to admin (admin only)
router.post('/:chatId/assign', authenticateToken, isAdmin, chatController.assignChat);

// Close chat (admin only)
router.post('/:chatId/close', authenticateToken, isAdmin, chatController.closeChat);

// Update chat status (admin only)
router.put('/:chatId', authenticateToken, isAdmin, chatController.updateChatStatus);

// Mark messages as read (admin only)
router.put('/:chatId/read', authenticateToken, isAdmin, chatController.markAsRead);

// Convert chat to ticket (admin only)
router.post('/:chatId/convert-to-ticket', authenticateToken, isAdmin, chatController.convertToTicket);

// Ban IP address (admin only)
router.post('/:chatId/ban-ip', authenticateToken, isAdmin, chatController.banIP);

// Unban IP address (admin only)
router.post('/:chatId/unban-ip', authenticateToken, isAdmin, chatController.unbanIP);

// Rate chat (public for customers)
router.post('/:chatId/rate', chatController.rateChat);

// Delete chat (admin only)
router.delete('/:chatId', authenticateToken, isAdmin, chatController.deleteChat);

module.exports = router;