const crypto = require('crypto');

class ThreatDetector {
  constructor() {
    this.suspiciousPatterns = new Map();
    this.userBehavior = new Map();
    this.ipReputation = new Map();
    this.geoLocationCache = new Map();
    this.threatThresholds = {
      maxRequestsPerMinute: 60,
      maxFailedLogins: 5,
      maxSuspiciousPatterns: 3,
      maxGeoDistance: 1000, // km
      maxSessionDuration: 24 * 60 * 60 * 1000 // 24 hours
    };
    
    this.initializeThreatPatterns();
  }

  // Initialize threat detection patterns
  initializeThreatPatterns() {
    // SQL Injection patterns
    this.suspiciousPatterns.set('sql_injection', [
      /union\s+select/i,
      /drop\s+table/i,
      /delete\s+from/i,
      /insert\s+into/i,
      /update\s+set/i,
      /or\s+1\s*=\s*1/i,
      /'\s*or\s*'\s*=\s*'/i,
      /;\s*drop/i,
      /'\s*;\s*--/i
    ]);

    // XSS patterns
    this.suspiciousPatterns.set('xss', [
      /<script[^>]*>/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe[^>]*>/i,
      /<object[^>]*>/i,
      /<embed[^>]*>/i,
      /<link[^>]*>/i,
      /<meta[^>]*>/i,
      /expression\s*\(/i,
      /url\s*\(/i
    ]);

    // Path traversal patterns
    this.suspiciousPatterns.set('path_traversal', [
      /\.\.\//,
      /\.\.\\/,
      /\.\.%2f/i,
      /\.\.%5c/i,
      /\.\.%252f/i,
      /\.\.%255c/i,
      /etc\/passwd/i,
      /proc\/self\/environ/i,
      /windows\/system32/i
    ]);

    // Command injection patterns
    this.suspiciousPatterns.set('command_injection', [
      /;\s*rm\s+/i,
      /;\s*cat\s+/i,
      /;\s*ls\s+/i,
      /;\s*whoami/i,
      /;\s*id/i,
      /;\s*ps\s+/i,
      /;\s*kill/i,
      /;\s*nc\s+/i,
      /;\s*wget/i,
      /;\s*curl/i
    ]);

    // NoSQL injection patterns
    this.suspiciousPatterns.set('nosql_injection', [
      /\$ne\s*:\s*null/i,
      /\$gt\s*:/i,
      /\$lt\s*:/i,
      /\$regex\s*:/i,
      /\$where\s*:/i,
      /\$exists\s*:\s*true/i,
      /\$in\s*:/i,
      /\$nin\s*:/i
    ]);
  }

  // Analyze request for threats
  analyzeRequest(req) {
    const threats = [];
    const requestData = {
      body: req.body,
      query: req.query,
      params: req.params,
      headers: req.headers,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    };

    // Check for suspicious patterns
    threats.push(...this.detectSuspiciousPatterns(requestData));

    // Check for behavioral anomalies
    threats.push(...this.detectBehavioralAnomalies(req));

    // Check for IP reputation
    threats.push(...this.checkIPReputation(req.ip));

    // Check for geographic anomalies
    threats.push(...this.detectGeoAnomalies(req));

    // Check for rate limiting violations
    threats.push(...this.checkRateLimiting(req));

    return threats;
  }

  // Detect suspicious patterns in request data
  detectSuspiciousPatterns(requestData) {
    const threats = [];
    const dataToCheck = [
      { data: requestData.body, source: 'body' },
      { data: requestData.query, source: 'query' },
      { data: requestData.params, source: 'params' },
      { data: requestData.url, source: 'url' },
      { data: requestData.userAgent, source: 'userAgent' }
    ];

    dataToCheck.forEach(({ data, source }) => {
      if (!data) return;

      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      
      for (const [threatType, patterns] of this.suspiciousPatterns.entries()) {
        patterns.forEach(pattern => {
          if (pattern.test(dataString)) {
            threats.push({
              type: 'suspicious_pattern',
              threatType,
              source,
              pattern: pattern.toString(),
              severity: this.getThreatSeverity(threatType),
              confidence: 0.9
            });
          }
        });
      }
    });

    return threats;
  }

  // Detect behavioral anomalies
  detectBehavioralAnomalies(req) {
    const threats = [];
    const userId = req.user?._id;
    const ip = req.ip;

    if (userId) {
      const userBehavior = this.userBehavior.get(userId) || {
        requestCount: 0,
        lastRequest: Date.now(),
        averageRequestInterval: 0,
        suspiciousRequests: 0,
        loginAttempts: 0,
        failedLogins: 0
      };

      // Update user behavior
      const now = Date.now();
      const timeSinceLastRequest = now - userBehavior.lastRequest;
      
      userBehavior.requestCount++;
      userBehavior.lastRequest = now;
      
      if (userBehavior.requestCount > 1) {
        userBehavior.averageRequestInterval = 
          (userBehavior.averageRequestInterval + timeSinceLastRequest) / 2;
      }

      // Check for unusual request patterns
      if (userBehavior.requestCount > 100 && 
          userBehavior.averageRequestInterval < 1000) {
        threats.push({
          type: 'behavioral_anomaly',
          threatType: 'rapid_requests',
          severity: 'medium',
          confidence: 0.7,
          details: 'User making requests too rapidly'
        });
      }

      this.userBehavior.set(userId, userBehavior);
    }

    // Check IP behavior
    const ipBehavior = this.userBehavior.get(ip) || {
      requestCount: 0,
      lastRequest: Date.now(),
      suspiciousRequests: 0
    };

    ipBehavior.requestCount++;
    ipBehavior.lastRequest = Date.now();

    if (ipBehavior.requestCount > this.threatThresholds.maxRequestsPerMinute) {
      threats.push({
        type: 'behavioral_anomaly',
        threatType: 'ip_flooding',
        severity: 'high',
        confidence: 0.8,
        details: 'IP making too many requests'
      });
    }

    this.userBehavior.set(ip, ipBehavior);

    return threats;
  }

  // Check IP reputation
  checkIPReputation(ip) {
    const threats = [];
    const reputation = this.ipReputation.get(ip);

    if (reputation) {
      if (reputation.isBlocked) {
        threats.push({
          type: 'ip_reputation',
          threatType: 'blocked_ip',
          severity: 'critical',
          confidence: 1.0,
          details: 'IP is on blocklist'
        });
      }

      if (reputation.suspiciousScore > 0.7) {
        threats.push({
          type: 'ip_reputation',
          threatType: 'suspicious_ip',
          severity: 'high',
          confidence: reputation.suspiciousScore,
          details: 'IP has high suspicious score'
        });
      }
    }

    return threats;
  }

  // Detect geographic anomalies
  detectGeoAnomalies(req) {
    const threats = [];
    const ip = req.ip;
    const user = req.user;

    if (user && user.lastKnownLocation) {
      const currentLocation = this.getGeoLocation(ip);
      
      if (currentLocation && user.lastKnownLocation) {
        const distance = this.calculateDistance(
          user.lastKnownLocation,
          currentLocation
        );

        if (distance > this.threatThresholds.maxGeoDistance) {
          threats.push({
            type: 'geo_anomaly',
            threatType: 'impossible_travel',
            severity: 'high',
            confidence: 0.8,
            details: `User traveled ${distance}km in short time`
          });
        }
      }
    }

    return threats;
  }

  // Check rate limiting violations
  checkRateLimiting(req) {
    const threats = [];
    const ip = req.ip;
    const now = Date.now();
    const minute = Math.floor(now / 60000);

    const rateLimitKey = `${ip}_${minute}`;
    const currentCount = this.userBehavior.get(rateLimitKey) || 0;

    if (currentCount > this.threatThresholds.maxRequestsPerMinute) {
      threats.push({
        type: 'rate_limit_violation',
        threatType: 'excessive_requests',
        severity: 'medium',
        confidence: 0.9,
        details: 'Rate limit exceeded'
      });
    }

    this.userBehavior.set(rateLimitKey, currentCount + 1);

    return threats;
  }

  // Get threat severity
  getThreatSeverity(threatType) {
    const severityMap = {
      'sql_injection': 'critical',
      'xss': 'high',
      'path_traversal': 'high',
      'command_injection': 'critical',
      'nosql_injection': 'high'
    };

    return severityMap[threatType] || 'medium';
  }

  // Get geographic location (mock implementation)
  getGeoLocation(ip) {
    // In production, use a real geolocation service
    if (this.geoLocationCache.has(ip)) {
      return this.geoLocationCache.get(ip);
    }

    // Mock location for testing
    const mockLocation = {
      latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
      longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
      country: 'US',
      city: 'New York'
    };

    this.geoLocationCache.set(ip, mockLocation);
    return mockLocation;
  }

  // Calculate distance between two coordinates
  calculateDistance(loc1, loc2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(loc2.latitude - loc1.latitude);
    const dLon = this.toRadians(loc2.longitude - loc1.longitude);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(loc1.latitude)) * 
              Math.cos(this.toRadians(loc2.latitude)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Convert degrees to radians
  toRadians(degrees) {
    return degrees * (Math.PI/180);
  }

  // Update IP reputation
  updateIPReputation(ip, isSuspicious, reason) {
    const reputation = this.ipReputation.get(ip) || {
      suspiciousScore: 0,
      isBlocked: false,
      lastUpdated: Date.now(),
      reasons: []
    };

    if (isSuspicious) {
      reputation.suspiciousScore = Math.min(1.0, reputation.suspiciousScore + 0.1);
      reputation.reasons.push({
        reason,
        timestamp: Date.now()
      });

      if (reputation.suspiciousScore > 0.8) {
        reputation.isBlocked = true;
      }
    } else {
      reputation.suspiciousScore = Math.max(0, reputation.suspiciousScore - 0.05);
    }

    reputation.lastUpdated = Date.now();
    this.ipReputation.set(ip, reputation);
  }

  // Get threat statistics
  getThreatStats() {
    return {
      totalThreats: this.userBehavior.size,
      suspiciousIPs: Array.from(this.ipReputation.entries())
        .filter(([ip, rep]) => rep.suspiciousScore > 0.5).length,
      blockedIPs: Array.from(this.ipReputation.entries())
        .filter(([ip, rep]) => rep.isBlocked).length,
      activeUsers: Array.from(this.userBehavior.entries())
        .filter(([key, data]) => key.includes('_') && data.requestCount > 0).length
    };
  }
}

const threatDetector = new ThreatDetector();

// Threat detection middleware
const threatDetectionMiddleware = (req, res, next) => {
  const threats = threatDetector.analyzeRequest(req);
  
  if (threats.length > 0) {
    // Log threats
    console.warn('🚨 Threats detected:', threats);
    
    // Check for critical threats
    const criticalThreats = threats.filter(t => t.severity === 'critical');
    
    if (criticalThreats.length > 0) {
      // Block request for critical threats
      return res.status(403).json({
        error: 'Request blocked due to security threats',
        code: 'THREAT_DETECTED',
        threats: criticalThreats.map(t => ({
          type: t.type,
          threatType: t.threatType,
          severity: t.severity
        }))
      });
    }

    // Add threat headers for monitoring
    res.setHeader('X-Threat-Count', threats.length);
    res.setHeader('X-Threat-Severity', Math.max(...threats.map(t => 
      t.severity === 'critical' ? 4 : 
      t.severity === 'high' ? 3 : 
      t.severity === 'medium' ? 2 : 1
    )));
  }

  next();
};

// Threat statistics endpoint (admin only)
const getThreatStats = (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Admin access required',
        code: 'ADMIN_REQUIRED'
      });
    }

    const stats = threatDetector.getThreatStats();

    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get threat stats error:', error);
    res.status(500).json({
      error: 'Failed to get threat statistics',
      code: 'THREAT_STATS_FAILED'
    });
  }
};

module.exports = {
  threatDetectionMiddleware,
  getThreatStats,
  threatDetector
};
