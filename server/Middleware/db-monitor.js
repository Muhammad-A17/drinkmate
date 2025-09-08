const mongoose = require('mongoose');

class DatabaseMonitor {
  constructor() {
    this.slowQueries = [];
    this.queryStats = new Map();
    this.connectionStats = {
      totalConnections: 0,
      activeConnections: 0,
      failedConnections: 0
    };
    this.setupMongooseMonitoring();
  }

  // Setup mongoose monitoring
  setupMongooseMonitoring() {
    // Monitor slow queries
    mongoose.set('debug', (collectionName, method, query, doc) => {
      const startTime = Date.now();
      
      // Log query execution
      console.log(`MongoDB Query: ${collectionName}.${method}`, {
        query: JSON.stringify(query),
        doc: doc ? JSON.stringify(doc) : undefined
      });

      // Track slow queries
      setTimeout(() => {
        const duration = Date.now() - startTime;
        if (duration > 1000) { // Queries taking more than 1 second
          this.logSlowQuery({
            collection: collectionName,
            method,
            query: JSON.stringify(query),
            duration,
            timestamp: new Date().toISOString()
          });
        }
      }, 0);
    });

    // Monitor connection events
    mongoose.connection.on('connected', () => {
      this.connectionStats.totalConnections++;
      this.connectionStats.activeConnections++;
      console.log('📊 Database connected');
    });

    mongoose.connection.on('disconnected', () => {
      this.connectionStats.activeConnections--;
      console.log('📊 Database disconnected');
    });

    mongoose.connection.on('error', (error) => {
      this.connectionStats.failedConnections++;
      console.error('📊 Database error:', error);
    });

    // Monitor connection pool
    setInterval(() => {
      this.monitorConnectionPool();
    }, 30000); // Every 30 seconds
  }

  // Log slow query
  logSlowQuery(queryInfo) {
    this.slowQueries.push(queryInfo);
    
    // Keep only last 100 slow queries
    if (this.slowQueries.length > 100) {
      this.slowQueries = this.slowQueries.slice(-100);
    }

    console.warn(`🐌 Slow Query Detected:`, {
      collection: queryInfo.collection,
      method: queryInfo.method,
      duration: `${queryInfo.duration}ms`,
      query: queryInfo.query
    });

    // Alert if query is extremely slow
    if (queryInfo.duration > 5000) {
      console.error(`🚨 CRITICAL: Extremely slow query detected:`, queryInfo);
    }
  }

  // Monitor connection pool
  monitorConnectionPool() {
    const connection = mongoose.connection;
    
    if (connection.readyState === 1) { // Connected
      const poolStats = {
        readyState: connection.readyState,
        host: connection.host,
        port: connection.port,
        name: connection.name,
        timestamp: new Date().toISOString()
      };

      // Check for connection pool issues
      if (connection.db && connection.db.serverConfig) {
        const serverConfig = connection.db.serverConfig;
        poolStats.poolSize = serverConfig.poolSize;
        poolStats.availableConnections = serverConfig.availableConnections;
        
        // Alert if pool is getting full
        if (serverConfig.availableConnections < 2) {
          console.warn('⚠️ Database connection pool is getting full:', poolStats);
        }
      }

      // Store stats
      this.queryStats.set('connectionPool', poolStats);
    }
  }

  // Get database statistics
  getDatabaseStats() {
    const stats = {
      connection: {
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name
      },
      connectionStats: this.connectionStats,
      slowQueries: this.slowQueries.slice(-10), // Last 10 slow queries
      totalSlowQueries: this.slowQueries.length,
      queryStats: Object.fromEntries(this.queryStats)
    };

    return stats;
  }

  // Get slow query analysis
  getSlowQueryAnalysis() {
    if (this.slowQueries.length === 0) {
      return { message: 'No slow queries detected' };
    }

    const analysis = {
      totalSlowQueries: this.slowQueries.length,
      averageDuration: this.slowQueries.reduce((sum, q) => sum + q.duration, 0) / this.slowQueries.length,
      slowestQuery: this.slowQueries.reduce((max, q) => q.duration > max.duration ? q : max),
      queriesByCollection: {},
      queriesByMethod: {}
    };

    // Group by collection
    this.slowQueries.forEach(query => {
      if (!analysis.queriesByCollection[query.collection]) {
        analysis.queriesByCollection[query.collection] = 0;
      }
      analysis.queriesByCollection[query.collection]++;

      if (!analysis.queriesByMethod[query.method]) {
        analysis.queriesByMethod[query.method] = 0;
      }
      analysis.queriesByMethod[query.method]++;
    });

    return analysis;
  }

  // Health check
  getHealthStatus() {
    const connection = mongoose.connection;
    const isHealthy = connection.readyState === 1;
    
    return {
      healthy: isHealthy,
      readyState: connection.readyState,
      readyStateText: this.getReadyStateText(connection.readyState),
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }

  // Get ready state text
  getReadyStateText(readyState) {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    return states[readyState] || 'unknown';
  }
}

const dbMonitor = new DatabaseMonitor();

// Middleware for database monitoring
const monitorDatabase = (req, res, next) => {
  const startTime = Date.now();
  
  // Add database stats to response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log slow requests that might indicate database issues
    if (duration > 2000) {
      console.warn(`🐌 Slow request detected: ${req.method} ${req.path} took ${duration}ms`);
    }
  });

  next();
};

// Database health check endpoint
const getDatabaseHealth = (req, res) => {
  try {
    const health = dbMonitor.getHealthStatus();
    const statusCode = health.healthy ? 200 : 503;
    
    res.status(statusCode).json({
      success: health.healthy,
      health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Database health check failed',
      timestamp: new Date().toISOString()
    });
  }
};

// Database statistics endpoint (admin only)
const getDatabaseStats = (req, res) => {
  try {
    const stats = dbMonitor.getDatabaseStats();
    const analysis = dbMonitor.getSlowQueryAnalysis();
    
    res.json({
      success: true,
      stats,
      analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get database statistics',
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  monitorDatabase,
  getDatabaseHealth,
  getDatabaseStats,
  dbMonitor
};
