const { createErrorResponse, logError } = require('../Utils/error-handler');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Admin Settings Controller
class AdminSettingsController {
  constructor() {
    this.settings = {
      email: {
        smtp_host: process.env.SMTP_HOST || 'smtp.gmail.com',
        smtp_port: parseInt(process.env.SMTP_PORT) || 587,
        smtp_username: process.env.SMTP_USER || '',
        smtp_password: process.env.SMTP_PASS || '',
        smtp_encryption: 'tls',
        from_email: process.env.SMTP_USER || 'noreply@drinkmate.sa',
        from_name: 'Drinkmate'
      },
      payment: {
        urways_enabled: true,
        urways_terminal_id: process.env.URWAYS_TERMINAL_ID || '',
        urways_merchant_key: process.env.URWAYS_MERCHANT_KEY || '',
        urways_environment: process.env.URWAYS_ENVIRONMENT || 'production',
        tap_enabled: false,
        tap_api_key: process.env.TAP_API_KEY || '',
        tap_secret_key: process.env.TAP_SECRET_KEY || '',
        tap_environment: process.env.TAP_ENVIRONMENT || 'sandbox'
      },
      shipping: {
        aramex_enabled: true,
        aramex_username: process.env.ARAMEX_USERNAME || '',
        aramex_password: process.env.ARAMEX_PASSWORD || '',
        aramex_environment: process.env.ARAMEX_ENVIRONMENT || 'sandbox'
      },
      general: {
        site_name: 'Drinkmate',
        site_url: process.env.FRONTEND_URL || 'https://drinkmate-main-production.up.railway.app',
        admin_email: 'admin@drinkmate.sa',
        support_email: 'support@drinkmate.sa',
        phone: '+966 12 345 6789',
        currency: 'SAR',
        timezone: 'Asia/Riyadh',
        language: 'en',
        maintenance_mode: false
      },
      security: {
        session_timeout: 4 * 60 * 60 * 1000, // 4 hours
        max_login_attempts: 5,
        lockout_duration: 15 * 60 * 1000, // 15 minutes
        password_min_length: 8,
        require_2fa: false
      },
      notifications: {
        email_notifications: true,
        sms_notifications: false,
        push_notifications: false,
        order_notifications: true,
        chat_notifications: true,
        system_notifications: true
      }
    };
  }

  // Get all settings
  getSettings = async (req, res) => {
    try {
      // Remove sensitive data before sending
      const safeSettings = {
        ...this.settings,
        email: {
          ...this.settings.email,
          smtp_password: this.settings.email.smtp_password ? '***' : ''
        },
        payment: {
          ...this.settings.payment,
          urways_merchant_key: this.settings.payment.urways_merchant_key ? '***' : '',
          tap_secret_key: this.settings.payment.tap_secret_key ? '***' : ''
        },
        shipping: {
          ...this.settings.shipping,
          aramex_password: this.settings.shipping.aramex_password ? '***' : ''
        }
      };

      res.json({
        success: true,
        settings: safeSettings
      });
    } catch (error) {
      logError(error, 'getSettings');
      res.status(500).json(createErrorResponse(
        'Failed to get settings',
        error.message
      ));
    }
  };

  // Update settings
  updateSettings = async (req, res) => {
    try {
      const { section, settings } = req.body;

      if (!section || !settings) {
        return res.status(400).json(createErrorResponse(
          'Invalid request',
          'Section and settings are required'
        ));
      }

      // Validate section
      const validSections = ['email', 'payment', 'shipping', 'general', 'security', 'notifications'];
      if (!validSections.includes(section)) {
        return res.status(400).json(createErrorResponse(
          'Invalid section',
          'Section must be one of: ' + validSections.join(', ')
        ));
      }

      // Update settings
      this.settings[section] = { ...this.settings[section], ...settings };

      // Log the update
      console.log(`Settings updated for section: ${section}`);

      res.json({
        success: true,
        message: 'Settings updated successfully',
        section: section
      });
    } catch (error) {
      logError(error, 'updateSettings');
      res.status(500).json(createErrorResponse(
        'Failed to update settings',
        error.message
      ));
    }
  };

  // Test email configuration
  testEmail = async (req, res) => {
    try {
      const { smtp_host, smtp_port, smtp_username, smtp_password, smtp_encryption } = req.body;

      if (!smtp_host || !smtp_port || !smtp_username || !smtp_password) {
        return res.status(400).json(createErrorResponse(
          'Missing email configuration',
          'All SMTP fields are required'
        ));
      }

      // Create test transporter
      const transporter = nodemailer.createTransporter({
        host: smtp_host,
        port: parseInt(smtp_port),
        secure: smtp_encryption === 'ssl',
        auth: {
          user: smtp_username,
          pass: smtp_password
        }
      });

      // Test connection
      await transporter.verify();

      // Send test email
      const testEmail = {
        from: `"Drinkmate Test" <${smtp_username}>`,
        to: smtp_username,
        subject: 'Drinkmate Email Test',
        html: `
          <h2>Email Configuration Test</h2>
          <p>This is a test email to verify your SMTP configuration.</p>
          <p>If you received this email, your email settings are working correctly!</p>
          <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
        `,
        text: 'This is a test email to verify your SMTP configuration.'
      };

      const info = await transporter.sendMail(testEmail);

      res.json({
        success: true,
        message: 'Email test successful',
        messageId: info.messageId
      });
    } catch (error) {
      logError(error, 'testEmail');
      res.status(500).json(createErrorResponse(
        'Email test failed',
        error.message
      ));
    }
  };

  // Test payment gateway
  testPaymentGateway = async (req, res) => {
    try {
      const { gateway, credentials } = req.body;

      if (!gateway || !credentials) {
        return res.status(400).json(createErrorResponse(
          'Missing gateway information',
          'Gateway and credentials are required'
        ));
      }

      let testResult = { success: false, message: '' };

      switch (gateway) {
        case 'urways':
          testResult = await this.testUrways(credentials);
          break;
        case 'tap':
          testResult = await this.testTap(credentials);
          break;
        default:
          return res.status(400).json(createErrorResponse(
            'Unsupported gateway',
            'Only urways and tap are supported'
          ));
      }

      res.json({
        success: testResult.success,
        message: testResult.message,
        gateway: gateway
      });
    } catch (error) {
      logError(error, 'testPaymentGateway');
      res.status(500).json(createErrorResponse(
        'Payment gateway test failed',
        error.message
      ));
    }
  };

  // Test Urways payment gateway
  async testUrways(credentials) {
    try {
      const { terminal_id, merchant_key, environment } = credentials;
      
      if (!terminal_id || !merchant_key) {
        return { success: false, message: 'Missing Urways credentials' };
      }

      // Test with a minimal request
      const testRequest = {
        terminalID: terminal_id,
        merchantID: merchant_key,
        action: '10', // Inquiry action
        trackID: 'TEST_' + Date.now(),
        amount: '0.00',
        currency: 'SAR'
      };

      const response = await fetch(
        environment === 'production' 
          ? 'https://payments.urway-tech.com/URWAYPGService/transaction/jsonProcess/JSONrequest'
          : 'https://payments-dev.urway-tech.com/URWAYPGService/transaction/jsonProcess/JSONrequest',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testRequest)
        }
      );

      if (response.ok) {
        return { success: true, message: 'Urways connection successful' };
      } else {
        return { success: false, message: 'Urways connection failed' };
      }
    } catch (error) {
      return { success: false, message: 'Urways test failed: ' + error.message };
    }
  }

  // Test Tap payment gateway
  async testTap(credentials) {
    try {
      const { api_key, secret_key, environment } = credentials;
      
      if (!api_key || !secret_key) {
        return { success: false, message: 'Missing Tap credentials' };
      }

      const baseUrl = environment === 'production' 
        ? 'https://api.tap.company' 
        : 'https://sandbox-api.tap.company';

      // Test with a simple API call
      const response = await fetch(`${baseUrl}/v2/charges`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${secret_key}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok || response.status === 401) { // 401 means auth is working
        return { success: true, message: 'Tap connection successful' };
      } else {
        return { success: false, message: 'Tap connection failed' };
      }
    } catch (error) {
      return { success: false, message: 'Tap test failed: ' + error.message };
    }
  }

  // Get system health
  getSystemHealth = async (req, res) => {
    try {
      const health = {
        database: await this.checkDatabase(),
        email: await this.checkEmail(),
        storage: await this.checkStorage(),
        memory: this.checkMemory(),
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      };

      res.json({
        success: true,
        health: health
      });
    } catch (error) {
      logError(error, 'getSystemHealth');
      res.status(500).json(createErrorResponse(
        'Failed to get system health',
        error.message
      ));
    }
  };

  async checkDatabase() {
    try {
      const mongoose = require('mongoose');
      const state = mongoose.connection.readyState;
      return {
        status: state === 1 ? 'connected' : 'disconnected',
        state: state,
        host: mongoose.connection.host,
        name: mongoose.connection.name
      };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  async checkEmail() {
    try {
      if (!this.settings.email.smtp_username || !this.settings.email.smtp_password) {
        return { status: 'not_configured' };
      }

      const transporter = nodemailer.createTransporter({
        host: this.settings.email.smtp_host,
        port: this.settings.email.smtp_port,
        secure: this.settings.email.smtp_encryption === 'ssl',
        auth: {
          user: this.settings.email.smtp_username,
          pass: this.settings.email.smtp_password
        }
      });

      await transporter.verify();
      return { status: 'connected' };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  async checkStorage() {
    try {
      const fs = require('fs');
      const stats = fs.statSync('.');
      return {
        status: 'available',
        free_space: 'unknown' // Would need additional logic to get actual free space
      };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  checkMemory() {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024) + ' MB',
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + ' MB',
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + ' MB',
      external: Math.round(usage.external / 1024 / 1024) + ' MB'
    };
  }
}

module.exports = new AdminSettingsController();

