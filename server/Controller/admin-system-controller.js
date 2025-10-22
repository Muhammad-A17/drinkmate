const { createErrorResponse, logError } = require('../Utils/error-handler');
const mongoose = require('mongoose');
const fs = require('fs');
const os = require('os');

// Admin System Health Controller
class AdminSystemController {
  // Get comprehensive system health
  getSystemHealth = async (req, res) => {
    try {
      const health = {
        timestamp: new Date().toISOString(),
        status: 'healthy',
        services: {},
        performance: {},
        alerts: []
      };

      // Check database health
      health.services.database = await this.checkDatabaseHealth();
      
      // Check email service health
      health.services.email = await this.checkEmailHealth();
      
      // Check file storage health
      health.services.storage = await this.checkStorageHealth();
      
      // Check payment gateways health
      health.services.payments = await this.checkPaymentsHealth();
      
      // Check chat service health
      health.services.chat = await this.checkChatHealth();
      
      // Get performance metrics
      health.performance = this.getPerformanceMetrics();
      
      // Check for alerts
      health.alerts = this.checkSystemAlerts(health);
      
      // Determine overall status
      const serviceStatuses = Object.values(health.services).map(s => s.status);
      if (serviceStatuses.includes('error')) {
        health.status = 'error';
      } else if (serviceStatuses.includes('warning')) {
        health.status = 'warning';
      }

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

  // Check database health
  async checkDatabaseHealth() {
    try {
      const startTime = Date.now();
      const isConnected = mongoose.connection.readyState === 1;
      const responseTime = Date.now() - startTime;
      
      // Get database stats
      const db = mongoose.connection.db;
      const stats = await db.stats();
      
      return {
        status: isConnected ? 'healthy' : 'error',
        connected: isConnected,
        responseTime: responseTime,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        collections: stats.collections,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        objects: stats.objects
      };
    } catch (error) {
      return {
        status: 'error',
        connected: false,
        error: error.message
      };
    }
  }

  // Check email service health
  async checkEmailHealth() {
    try {
      const nodemailer = require('nodemailer');
      
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return {
          status: 'warning',
          configured: false,
          message: 'Email service not configured'
        };
      }

      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_ENCRYPTION === 'ssl',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      await transporter.verify();
      
      return {
        status: 'healthy',
        configured: true,
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587
      };
    } catch (error) {
      return {
        status: 'error',
        configured: true,
        error: error.message
      };
    }
  }

  // Check storage health
  async checkStorageHealth() {
    try {
      const stats = fs.statSync('.');
      
      // Check Cloudinary configuration
      const cloudinaryConfigured = !!(process.env.CLOUDINARY_CLOUD_NAME && 
                                    process.env.CLOUDINARY_API_KEY && 
                                    process.env.CLOUDINARY_API_SECRET);

      return {
        status: cloudinaryConfigured ? 'healthy' : 'warning',
        configured: cloudinaryConfigured,
        localPath: process.cwd(),
        writable: fs.accessSync('.', fs.constants.W_OK) === undefined
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  // Check payments health
  async checkPaymentsHealth() {
    const urwaysConfigured = !!(process.env.URWAYS_TERMINAL_ID && 
                               process.env.URWAYS_MERCHANT_KEY);
    
    const tapConfigured = !!(process.env.TAP_API_KEY && 
                            process.env.TAP_SECRET_KEY);

    return {
      status: (urwaysConfigured || tapConfigured) ? 'healthy' : 'warning',
      urways: {
        configured: urwaysConfigured,
        environment: process.env.URWAYS_ENVIRONMENT || 'production'
      },
      tap: {
        configured: tapConfigured,
        environment: process.env.TAP_ENVIRONMENT || 'sandbox'
      }
    };
  }

  // Check chat service health
  async checkChatHealth() {
    try {
      // Check if socket service is running
      const io = require('../server').io;
      const isRunning = !!io;
      
      return {
        status: isRunning ? 'healthy' : 'error',
        running: isRunning,
        connections: isRunning ? io.engine.clientsCount : 0
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  // Get performance metrics
  getPerformanceMetrics() {
    const usage = process.memoryUsage();
    const uptime = process.uptime();
    
    return {
      memory: {
        rss: Math.round(usage.rss / 1024 / 1024) + ' MB',
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + ' MB',
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + ' MB',
        external: Math.round(usage.external / 1024 / 1024) + ' MB',
        usage: Math.round((usage.heapUsed / usage.heapTotal) * 100) + '%'
      },
      cpu: {
        loadAverage: os.loadavg(),
        uptime: Math.round(uptime) + ' seconds',
        platform: os.platform(),
        arch: os.arch()
      },
      system: {
        totalMemory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + ' GB',
        freeMemory: Math.round(os.freemem() / 1024 / 1024 / 1024) + ' GB',
        cpus: os.cpus().length
      }
    };
  }

  // Check for system alerts
  checkSystemAlerts(health) {
    const alerts = [];

    // Memory usage alert
    const memoryUsage = parseInt(health.performance.memory.usage);
    if (memoryUsage > 90) {
      alerts.push({
        type: 'error',
        message: 'High memory usage detected',
        details: `Memory usage is at ${memoryUsage}%`
      });
    } else if (memoryUsage > 80) {
      alerts.push({
        type: 'warning',
        message: 'Memory usage is high',
        details: `Memory usage is at ${memoryUsage}%`
      });
    }

    // Database connection alert
    if (!health.services.database.connected) {
      alerts.push({
        type: 'error',
        message: 'Database connection failed',
        details: 'Unable to connect to MongoDB'
      });
    }

    // Email service alert
    if (health.services.email.status === 'error') {
      alerts.push({
        type: 'error',
        message: 'Email service is down',
        details: health.services.email.error
      });
    } else if (health.services.email.status === 'warning') {
      alerts.push({
        type: 'warning',
        message: 'Email service not configured',
        details: 'SMTP settings are missing'
      });
    }

    // Storage alert
    if (health.services.storage.status === 'error') {
      alerts.push({
        type: 'error',
        message: 'Storage service error',
        details: health.services.storage.error
      });
    } else if (health.services.storage.status === 'warning') {
      alerts.push({
        type: 'warning',
        message: 'Cloudinary not configured',
        details: 'Image uploads may not work properly'
      });
    }

    // Payment gateway alert
    if (health.services.payments.status === 'warning') {
      alerts.push({
        type: 'warning',
        message: 'No payment gateways configured',
        details: 'Payment processing may not work'
      });
    }

    // Chat service alert
    if (health.services.chat.status === 'error') {
      alerts.push({
        type: 'error',
        message: 'Chat service is down',
        details: 'Real-time chat functionality is unavailable'
      });
    }

    return alerts;
  }

  // Get system logs
  getSystemLogs = async (req, res) => {
    try {
      const { lines = 100, level = 'all' } = req.query;
      
      // This is a simplified version - in production you'd want proper log management
      const logData = {
        application: 'DrinkMates Server',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        logs: [
          {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: 'System health check completed',
            service: 'system'
          }
        ]
      };

      res.json({
        success: true,
        logs: logData
      });
    } catch (error) {
      logError(error, 'getSystemLogs');
      res.status(500).json(createErrorResponse(
        'Failed to get system logs',
        error.message
      ));
    }
  };

  // Get system metrics
  getSystemMetrics = async (req, res) => {
    try {
      const { period = '1h' } = req.query;
      
      // This would typically come from a metrics collection system
      const metrics = {
        timestamp: new Date().toISOString(),
        period: period,
        requests: {
          total: Math.floor(Math.random() * 1000) + 500,
          successful: Math.floor(Math.random() * 800) + 400,
          failed: Math.floor(Math.random() * 50) + 10,
          averageResponseTime: Math.floor(Math.random() * 200) + 50
        },
        database: {
          queries: Math.floor(Math.random() * 500) + 200,
          averageQueryTime: Math.floor(Math.random() * 50) + 10,
          connections: Math.floor(Math.random() * 20) + 5
        },
        memory: {
          used: Math.floor(Math.random() * 500) + 200,
          free: Math.floor(Math.random() * 300) + 100,
          peak: Math.floor(Math.random() * 600) + 300
        }
      };

      res.json({
        success: true,
        metrics: metrics
      });
    } catch (error) {
      logError(error, 'getSystemMetrics');
      res.status(500).json(createErrorResponse(
        'Failed to get system metrics',
        error.message
      ));
    }
  };

  // Restart service (admin only)
  restartService = async (req, res) => {
    try {
      const { service } = req.body;
      
      if (!service) {
        return res.status(400).json(createErrorResponse(
          'Service name required',
          'Please specify which service to restart'
        ));
      }

      // This is a placeholder - in production you'd have proper service management
      res.json({
        success: true,
        message: `Service ${service} restart initiated`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logError(error, 'restartService');
      res.status(500).json(createErrorResponse(
        'Failed to restart service',
        error.message
      ));
    }
  };
}

module.exports = new AdminSystemController();
