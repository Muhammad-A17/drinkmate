const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class AuditLogger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.auditLogFile = path.join(this.logDir, 'audit.log');
    this.complianceLogFile = path.join(this.logDir, 'compliance.log');
    this.ensureLogDirectory();
    
    this.auditEvents = new Map();
    this.complianceRules = new Map();
    
    this.initializeComplianceRules();
  }

  // Ensure log directory exists
  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  // Initialize compliance rules
  initializeComplianceRules() {
    // GDPR compliance rules
    this.complianceRules.set('gdpr', {
      dataRetention: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
      rightToErasure: true,
      dataPortability: true,
      consentRequired: true,
      dataMinimization: true
    });

    // PCI DSS compliance rules
    this.complianceRules.set('pci_dss', {
      cardDataEncryption: true,
      accessControl: true,
      networkSecurity: true,
      regularTesting: true,
      securityPolicy: true
    });

    // SOX compliance rules
    this.complianceRules.set('sox', {
      financialDataIntegrity: true,
      accessLogging: true,
      changeManagement: true,
      dataBackup: true,
      securityControls: true
    });
  }

  // Log audit event
  logAuditEvent(event) {
    const auditEntry = {
      id: this.generateEventId(),
      timestamp: new Date().toISOString(),
      eventType: event.type,
      severity: event.severity || 'info',
      userId: event.userId,
      userEmail: event.userEmail,
      ip: event.ip,
      userAgent: event.userAgent,
      action: event.action,
      resource: event.resource,
      details: event.details,
      outcome: event.outcome || 'success',
      riskLevel: event.riskLevel || 'low',
      compliance: event.compliance || [],
      metadata: event.metadata || {}
    };

    // Write to audit log
    this.writeToLog(this.auditLogFile, auditEntry);

    // Check compliance requirements
    this.checkComplianceRequirements(auditEntry);

    // Store in memory for quick access
    this.auditEvents.set(auditEntry.id, auditEntry);

    // Log to console for immediate visibility
    if (event.severity === 'critical' || event.severity === 'high') {
      console.error(`🚨 AUDIT ALERT [${event.severity.toUpperCase()}]:`, {
        type: event.type,
        action: event.action,
        userId: event.userId,
        ip: event.ip
      });
    }

    return auditEntry.id;
  }

  // Write to log file
  writeToLog(logFile, entry) {
    const logLine = JSON.stringify(entry) + '\n';
    fs.appendFileSync(logFile, logLine);
  }

  // Check compliance requirements
  checkComplianceRequirements(auditEntry) {
    const complianceViolations = [];

    // GDPR compliance checks
    if (auditEntry.eventType === 'data_access' && !auditEntry.userId) {
      complianceViolations.push({
        standard: 'GDPR',
        violation: 'Data access without user identification',
        severity: 'high'
      });
    }

    if (auditEntry.eventType === 'data_deletion' && auditEntry.outcome !== 'success') {
      complianceViolations.push({
        standard: 'GDPR',
        violation: 'Failed data deletion request',
        severity: 'medium'
      });
    }

    // PCI DSS compliance checks
    if (auditEntry.eventType === 'payment_processing' && !auditEntry.details?.encrypted) {
      complianceViolations.push({
        standard: 'PCI_DSS',
        violation: 'Payment data not encrypted',
        severity: 'critical'
      });
    }

    if (auditEntry.eventType === 'admin_access' && !auditEntry.details?.twoFactor) {
      complianceViolations.push({
        standard: 'PCI_DSS',
        violation: 'Admin access without 2FA',
        severity: 'high'
      });
    }

    // SOX compliance checks
    if (auditEntry.eventType === 'financial_data_change' && !auditEntry.details?.approval) {
      complianceViolations.push({
        standard: 'SOX',
        violation: 'Financial data change without approval',
        severity: 'high'
      });
    }

    // Log compliance violations
    if (complianceViolations.length > 0) {
      const complianceEntry = {
        id: this.generateEventId(),
        timestamp: new Date().toISOString(),
        type: 'compliance_violation',
        auditEventId: auditEntry.id,
        violations: complianceViolations,
        severity: Math.max(...complianceViolations.map(v => 
          v.severity === 'critical' ? 4 : 
          v.severity === 'high' ? 3 : 
          v.severity === 'medium' ? 2 : 1
        )) > 2 ? 'high' : 'medium'
      };

      this.writeToLog(this.complianceLogFile, complianceEntry);
    }
  }

  // Generate unique event ID
  generateEventId() {
    return crypto.randomBytes(16).toString('hex');
  }

  // Log authentication event
  logAuthentication(userId, userEmail, ip, userAgent, action, outcome, details = {}) {
    return this.logAuditEvent({
      type: 'authentication',
      userId,
      userEmail,
      ip,
      userAgent,
      action,
      outcome,
      details,
      severity: outcome === 'success' ? 'info' : 'medium',
      riskLevel: outcome === 'success' ? 'low' : 'medium',
      compliance: ['GDPR', 'PCI_DSS']
    });
  }

  // Log data access event
  logDataAccess(userId, userEmail, ip, userAgent, resource, action, details = {}) {
    return this.logAuditEvent({
      type: 'data_access',
      userId,
      userEmail,
      ip,
      userAgent,
      action,
      resource,
      details,
      severity: 'info',
      riskLevel: 'low',
      compliance: ['GDPR', 'SOX']
    });
  }

  // Log data modification event
  logDataModification(userId, userEmail, ip, userAgent, resource, action, details = {}) {
    return this.logAuditEvent({
      type: 'data_modification',
      userId,
      userEmail,
      ip,
      userAgent,
      action,
      resource,
      details,
      severity: 'medium',
      riskLevel: 'medium',
      compliance: ['GDPR', 'SOX', 'PCI_DSS']
    });
  }

  // Log admin action
  logAdminAction(userId, userEmail, ip, userAgent, action, details = {}) {
    return this.logAuditEvent({
      type: 'admin_action',
      userId,
      userEmail,
      ip,
      userAgent,
      action,
      details,
      severity: 'high',
      riskLevel: 'high',
      compliance: ['GDPR', 'SOX', 'PCI_DSS']
    });
  }

  // Log security event
  logSecurityEvent(userId, userEmail, ip, userAgent, action, details = {}) {
    return this.logAuditEvent({
      type: 'security_event',
      userId,
      userEmail,
      ip,
      userAgent,
      action,
      details,
      severity: 'high',
      riskLevel: 'high',
      compliance: ['GDPR', 'PCI_DSS']
    });
  }

  // Log payment event
  logPaymentEvent(userId, userEmail, ip, userAgent, action, details = {}) {
    return this.logAuditEvent({
      type: 'payment_processing',
      userId,
      userEmail,
      ip,
      userAgent,
      action,
      details,
      severity: 'high',
      riskLevel: 'high',
      compliance: ['PCI_DSS']
    });
  }

  // Get audit trail for user
  getAuditTrail(userId, limit = 100) {
    const userEvents = [];
    
    for (const [id, event] of this.auditEvents.entries()) {
      if (event.userId === userId) {
        userEvents.push(event);
      }
    }

    return userEvents
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  // Get compliance report
  getComplianceReport(standard, startDate, endDate) {
    const report = {
      standard,
      period: { startDate, endDate },
      totalEvents: 0,
      violations: 0,
      complianceScore: 0,
      recommendations: []
    };

    // Read compliance log
    if (fs.existsSync(this.complianceLogFile)) {
      const logContent = fs.readFileSync(this.complianceLogFile, 'utf8');
      const lines = logContent.split('\n').filter(line => line.trim());
      
      lines.forEach(line => {
        try {
          const entry = JSON.parse(line);
          if (entry.violations) {
            entry.violations.forEach(violation => {
              if (violation.standard === standard) {
                report.violations++;
                report.recommendations.push(violation.violation);
              }
            });
          }
        } catch (error) {
          // Skip invalid JSON lines
        }
      });
    }

    // Calculate compliance score
    report.complianceScore = Math.max(0, 100 - (report.violations * 10));

    return report;
  }

  // Export audit data
  exportAuditData(format = 'json', startDate, endDate) {
    const events = [];
    
    for (const [id, event] of this.auditEvents.entries()) {
      const eventDate = new Date(event.timestamp);
      if ((!startDate || eventDate >= startDate) && 
          (!endDate || eventDate <= endDate)) {
        events.push(event);
      }
    }

    if (format === 'json') {
      return JSON.stringify(events, null, 2);
    } else if (format === 'csv') {
      return this.convertToCSV(events);
    }

    return events;
  }

  // Convert events to CSV
  convertToCSV(events) {
    if (events.length === 0) return '';
    
    const headers = Object.keys(events[0]).join(',');
    const rows = events.map(event => 
      Object.values(event).map(value => 
        typeof value === 'object' ? JSON.stringify(value) : value
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  }
}

const auditLogger = new AuditLogger();

// Audit logging middleware
const auditLoggingMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - startTime;
    
    // Log the request
    auditLogger.logDataAccess(
      req.user?._id,
      req.user?.email,
      req.ip,
      req.headers['user-agent'],
      req.path,
      req.method,
      {
        statusCode: res.statusCode,
        duration,
        responseSize: JSON.stringify(data).length
      }
    );
    
    return originalJson.call(this, data);
  };

  next();
};

// Get audit trail endpoint
const getAuditTrail = (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Admin access required',
        code: 'ADMIN_REQUIRED'
      });
    }

    const { userId, limit = 100 } = req.query;
    const auditTrail = auditLogger.getAuditTrail(userId, parseInt(limit));

    res.json({
      success: true,
      auditTrail,
      count: auditTrail.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get audit trail error:', error);
    res.status(500).json({
      error: 'Failed to get audit trail',
      code: 'AUDIT_TRAIL_FAILED'
    });
  }
};

// Get compliance report endpoint
const getComplianceReport = (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Admin access required',
        code: 'ADMIN_REQUIRED'
      });
    }

    const { standard, startDate, endDate } = req.query;
    const report = auditLogger.getComplianceReport(standard, startDate, endDate);

    res.json({
      success: true,
      report,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get compliance report error:', error);
    res.status(500).json({
      error: 'Failed to get compliance report',
      code: 'COMPLIANCE_REPORT_FAILED'
    });
  }
};

module.exports = {
  auditLoggingMiddleware,
  getAuditTrail,
  getComplianceReport,
  auditLogger
};
