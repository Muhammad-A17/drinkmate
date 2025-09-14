const mongoose = require('mongoose');

// Ticket ID Generator Utility
class TicketGenerator {
  constructor() {
    this.prefix = 'TKT';
    this.year = new Date().getFullYear();
    this.month = String(new Date().getMonth() + 1).padStart(2, '0');
  }

  // Generate a unique ticket ID
  async generateTicketId() {
    try {
      // Get current date components
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      
      // Create date prefix (YYYYMMDD)
      const datePrefix = `${year}${month}${day}`;
      
      // Get the count of tickets created today
      const startOfDay = new Date(year, now.getMonth(), now.getDate());
      const endOfDay = new Date(year, now.getMonth(), now.getDate() + 1);
      
      // Count existing tickets for today
      const Chat = require('../Models/chat-model');
      const todayTicketsCount = await Chat.countDocuments({
        ticketId: { $regex: `^${this.prefix}-${datePrefix}-` },
        createdAt: {
          $gte: startOfDay,
          $lt: endOfDay
        }
      });
      
      // Generate sequential number (padded to 4 digits)
      const sequenceNumber = String(todayTicketsCount + 1).padStart(4, '0');
      
      // Format: TKT-YYYYMMDD-XXXX
      const ticketId = `${this.prefix}-${datePrefix}-${sequenceNumber}`;
      
      return ticketId;
    } catch (error) {
      console.error('Error generating ticket ID:', error);
      // Fallback to timestamp-based ID
      const timestamp = Date.now().toString().slice(-8);
      return `${this.prefix}-${timestamp}`;
    }
  }

  // Generate ticket ID with custom prefix
  async generateCustomTicketId(prefix = 'TKT', category = null) {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const datePrefix = `${year}${month}${day}`;
      
      // Add category prefix if provided
      const fullPrefix = category ? `${prefix}-${category.toUpperCase()}` : prefix;
      
      // Count existing tickets for today with this prefix
      const startOfDay = new Date(year, now.getMonth(), now.getDate());
      const endOfDay = new Date(year, now.getMonth(), now.getDate() + 1);
      
      const Chat = require('../Models/chat-model');
      const todayTicketsCount = await Chat.countDocuments({
        ticketId: { $regex: `^${fullPrefix}-${datePrefix}-` },
        createdAt: {
          $gte: startOfDay,
          $lt: endOfDay
        }
      });
      
      const sequenceNumber = String(todayTicketsCount + 1).padStart(4, '0');
      const ticketId = `${fullPrefix}-${datePrefix}-${sequenceNumber}`;
      
      return ticketId;
    } catch (error) {
      console.error('Error generating custom ticket ID:', error);
      const timestamp = Date.now().toString().slice(-8);
      return `${prefix}-${timestamp}`;
    }
  }

  // Generate ticket ID based on chat category
  async generateCategoryBasedTicketId(chatCategory) {
    const categoryPrefixes = {
      'general': 'GEN',
      'order': 'ORD',
      'technical': 'TECH',
      'billing': 'BILL',
      'refund': 'REF',
      'other': 'MISC'
    };
    
    const prefix = categoryPrefixes[chatCategory] || 'TKT';
    return await this.generateCustomTicketId(prefix, chatCategory);
  }

  // Validate ticket ID format
  isValidTicketId(ticketId) {
    const pattern = /^[A-Z]+-\d{8}-\d{4}$/;
    return pattern.test(ticketId);
  }

  // Extract date from ticket ID
  extractDateFromTicketId(ticketId) {
    const match = ticketId.match(/^[A-Z]+-(\d{8})-\d{4}$/);
    if (match) {
      const dateStr = match[1];
      const year = parseInt(dateStr.substring(0, 4));
      const month = parseInt(dateStr.substring(4, 6)) - 1; // Month is 0-indexed
      const day = parseInt(dateStr.substring(6, 8));
      return new Date(year, month, day);
    }
    return null;
  }
}

module.exports = new TicketGenerator();
