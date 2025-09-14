const express = require('express');
const router = express.Router();
const ChatController = require('../Controller/chat-controller');
const { authMiddleware } = require('../Middleware/auth-middleware');
const adminMiddleware = require('../Middleware/admin-middleware');

// Public routes
router.get('/business-hours', ChatController.checkBusinessHours);

// Customer routes (require authentication)
router.post('/create', authMiddleware, ChatController.createChat);
router.get('/customer', authMiddleware, ChatController.getCustomerChats);
router.get('/:chatId', authMiddleware, ChatController.getChatById);
router.post('/:chatId/messages', authMiddleware, ChatController.sendMessage);
router.get('/:chatId/messages', authMiddleware, ChatController.getChatMessages);
router.put('/:chatId/read', authMiddleware, ChatController.markMessagesAsRead);

// Admin routes (require admin authentication)
router.get('/admin/all', authMiddleware, adminMiddleware, ChatController.getOpenChats);
router.get('/admin/assigned', authMiddleware, adminMiddleware, ChatController.getAdminChats);
router.put('/:chatId/assign', authMiddleware, adminMiddleware, ChatController.assignChatToAdmin);
router.put('/:chatId/close', authMiddleware, adminMiddleware, ChatController.closeChat);
router.get('/admin/stats', authMiddleware, adminMiddleware, ChatController.getChatStats);

module.exports = router;
