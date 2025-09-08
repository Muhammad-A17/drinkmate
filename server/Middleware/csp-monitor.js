const fs = require('fs');
const path = require('path');

class CSPMonitor {
  constructor() {
    this.logFile = path.join(__dirname, '../logs/csp-violations.log');
    this.ensureLogDirectory();
    this.violationCounts = new Map();
    this.blockedDomains = new Set();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  // Log CSP violation
  logViolation(violation) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      type: 'CSP_VIOLATION',
      severity: this.getViolationSeverity(violation),
      violation: {
        blockedURI: violation['blocked-uri'],
        documentURI: violation['document-uri'],
        violatedDirective: violation['violated-directive'],
        originalPolicy: violation['original-policy'],
        sourceFile: violation['source-file'],
        lineNumber: violation['line-number'],
        columnNumber: violation['column-number']
      },
      userAgent: violation['user-agent'],
      referrer: violation.referrer
    };

    // Write to log file
    fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + '\n');

    // Track violation patterns
    this.trackViolationPattern(violation);

    // Alert on high-severity violations
    if (logEntry.severity === 'high' || logEntry.severity === 'critical') {
      console.error(`🚨 CSP VIOLATION [${logEntry.severity.toUpperCase()}]:`, {
        blockedURI: violation['blocked-uri'],
        violatedDirective: violation['violated-directive'],
        documentURI: violation['document-uri']
      });
    }
  }

  // Determine violation severity
  getViolationSeverity(violation) {
    const blockedURI = violation['blocked-uri'];
    const violatedDirective = violation['violated-directive'];

    // Critical violations
    if (violatedDirective.includes('script-src') && 
        (blockedURI.includes('eval') || blockedURI.includes('inline'))) {
      return 'critical';
    }

    // High severity violations
    if (violatedDirective.includes('script-src') || 
        violatedDirective.includes('object-src') ||
        violatedDirective.includes('base-uri')) {
      return 'high';
    }

    // Medium severity violations
    if (violatedDirective.includes('img-src') || 
        violatedDirective.includes('style-src') ||
        violatedDirective.includes('font-src')) {
      return 'medium';
    }

    return 'low';
  }

  // Track violation patterns for analysis
  trackViolationPattern(violation) {
    const key = `${violation['violated-directive']}_${violation['blocked-uri']}`;
    const count = this.violationCounts.get(key) || 0;
    this.violationCounts.set(key, count + 1);

    // Block domains with excessive violations
    if (count > 10) {
      const domain = this.extractDomain(violation['blocked-uri']);
      if (domain) {
        this.blockedDomains.add(domain);
        console.warn(`🚫 Blocking domain due to excessive CSP violations: ${domain}`);
      }
    }
  }

  // Extract domain from URI
  extractDomain(uri) {
    try {
      if (uri.startsWith('http://') || uri.startsWith('https://')) {
        return new URL(uri).hostname;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Get violation statistics
  getViolationStats() {
    const stats = {
      totalViolations: Array.from(this.violationCounts.values()).reduce((a, b) => a + b, 0),
      uniqueViolations: this.violationCounts.size,
      blockedDomains: Array.from(this.blockedDomains),
      topViolations: Array.from(this.violationCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
    };

    return stats;
  }

  // Check if domain is blocked
  isDomainBlocked(domain) {
    return this.blockedDomains.has(domain);
  }
}

const cspMonitor = new CSPMonitor();

// CSP violation reporting endpoint
const reportCSPViolation = (req, res) => {
  try {
    const violation = req.body;
    
    if (!violation || !violation['violated-directive']) {
      return res.status(400).json({
        error: 'Invalid CSP violation report',
        code: 'INVALID_CSP_REPORT'
      });
    }

    // Log the violation
    cspMonitor.logViolation(violation);

    // Return minimal response to avoid additional violations
    res.status(204).send();
  } catch (error) {
    console.error('CSP violation reporting error:', error);
    res.status(500).json({
      error: 'Failed to process CSP violation report',
      code: 'CSP_REPORT_FAILED'
    });
  }
};

// CSP statistics endpoint (admin only)
const getCSPStats = (req, res) => {
  try {
    const stats = cspMonitor.getViolationStats();
    
    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('CSP stats error:', error);
    res.status(500).json({
      error: 'Failed to get CSP statistics',
      code: 'CSP_STATS_FAILED'
    });
  }
};

// Enhanced CSP headers
const getCSPHeaders = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const reportUri = process.env.CSP_REPORT_URI || '/api/csp-violation';

  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.drinkmate.com https://www.google-analytics.com",
    "media-src 'self' https://www.youtube.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
    `report-uri ${reportUri}`,
    "report-to csp-endpoint"
  ];

  // Add nonce-based CSP in production
  if (isProduction) {
    cspDirectives[1] = "script-src 'self' 'nonce-{NONCE}' https://www.youtube.com https://www.googletagmanager.com";
    cspDirectives[2] = "style-src 'self' 'nonce-{NONCE}' https://fonts.googleapis.com";
  }

  return {
    'Content-Security-Policy': cspDirectives.join('; '),
    'Content-Security-Policy-Report-Only': cspDirectives.join('; '),
    'Report-To': JSON.stringify({
      group: 'csp-endpoint',
      max_age: 10886400,
      endpoints: [{ url: reportUri }]
    })
  };
};

module.exports = {
  reportCSPViolation,
  getCSPStats,
  getCSPHeaders,
  cspMonitor
};
