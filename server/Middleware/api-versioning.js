class APIVersionManager {
  constructor() {
    this.versions = new Map();
    this.deprecatedVersions = new Set();
    this.supportedVersions = new Set();
    this.defaultVersion = 'v1';
    
    this.initializeVersions();
  }

  // Initialize API versions
  initializeVersions() {
    // Current supported versions
    this.supportedVersions.add('v1');
    this.supportedVersions.add('v2');
    
    // Deprecated versions (still supported but with warnings)
    this.deprecatedVersions.add('v1');
    
    // Version configurations
    this.versions.set('v1', {
      version: 'v1',
      status: 'deprecated',
      deprecationDate: '2024-01-01',
      sunsetDate: '2024-12-31',
      migrationGuide: '/docs/migration/v1-to-v2',
      changelog: '/docs/changelog/v1'
    });

    this.versions.set('v2', {
      version: 'v2',
      status: 'current',
      releaseDate: '2024-01-01',
      features: ['enhanced-security', 'improved-performance', 'new-endpoints'],
      documentation: '/docs/api/v2'
    });
  }

  // Extract version from request
  extractVersion(req) {
    // Check URL path for version
    const pathMatch = req.path.match(/^\/api\/(v\d+)\//);
    if (pathMatch) {
      return pathMatch[1];
    }

    // Check Accept header
    const acceptHeader = req.headers.accept;
    if (acceptHeader) {
      const versionMatch = acceptHeader.match(/version=(\d+)/);
      if (versionMatch) {
        return `v${versionMatch[1]}`;
      }
    }

    // Check custom header
    const versionHeader = req.headers['x-api-version'];
    if (versionHeader) {
      return versionHeader;
    }

    // Check query parameter
    const queryVersion = req.query.version;
    if (queryVersion) {
      return queryVersion;
    }

    return this.defaultVersion;
  }

  // Validate API version
  validateVersion(version) {
    if (!version) {
      return {
        valid: false,
        error: 'API version is required',
        code: 'MISSING_VERSION'
      };
    }

    if (!this.supportedVersions.has(version)) {
      return {
        valid: false,
        error: `Unsupported API version: ${version}`,
        code: 'UNSUPPORTED_VERSION',
        supportedVersions: Array.from(this.supportedVersions)
      };
    }

    return { valid: true, version };
  }

  // Get version information
  getVersionInfo(version) {
    return this.versions.get(version) || null;
  }

  // Check if version is deprecated
  isDeprecated(version) {
    return this.deprecatedVersions.has(version);
  }

  // Get deprecation warning
  getDeprecationWarning(version) {
    const versionInfo = this.getVersionInfo(version);
    
    if (!versionInfo || versionInfo.status !== 'deprecated') {
      return null;
    }

    return {
      warning: `API version ${version} is deprecated`,
      deprecationDate: versionInfo.deprecationDate,
      sunsetDate: versionInfo.sunsetDate,
      migrationGuide: versionInfo.migrationGuide,
      changelog: versionInfo.changelog
    };
  }

  // API versioning middleware
  apiVersioningMiddleware() {
    return (req, res, next) => {
      const version = this.extractVersion(req);
      const validation = this.validateVersion(version);

      if (!validation.valid) {
        return res.status(400).json({
          error: validation.error,
          code: validation.code,
          supportedVersions: validation.supportedVersions || Array.from(this.supportedVersions),
          defaultVersion: this.defaultVersion
        });
      }

      // Add version info to request
      req.apiVersion = version;
      req.versionInfo = this.getVersionInfo(version);

      // Check for deprecation warnings
      if (this.isDeprecated(version)) {
        const warning = this.getDeprecationWarning(version);
        
        // Add deprecation warning to response headers
        res.setHeader('X-API-Deprecation-Warning', JSON.stringify(warning));
        res.setHeader('X-API-Deprecation-Date', warning.deprecationDate);
        res.setHeader('X-API-Sunset-Date', warning.sunsetDate);
        res.setHeader('X-API-Migration-Guide', warning.migrationGuide);
      }

      // Add version headers to response
      res.setHeader('X-API-Version', version);
      res.setHeader('X-API-Supported-Versions', Array.from(this.supportedVersions).join(', '));
      res.setHeader('X-API-Default-Version', this.defaultVersion);

      next();
    };
  }

  // Version-specific route handler
  versionedRoute(versions, handler) {
    return (req, res, next) => {
      const version = req.apiVersion;
      
      if (!versions.includes(version)) {
        return res.status(400).json({
          error: `API version ${version} not supported for this endpoint`,
          code: 'VERSION_NOT_SUPPORTED',
          supportedVersions: versions
        });
      }

      return handler(req, res, next);
    };
  }

  // Get all versions info
  getAllVersions() {
    const versions = {};
    
    for (const [version, info] of this.versions.entries()) {
      versions[version] = {
        ...info,
        isDeprecated: this.isDeprecated(version),
        isSupported: this.supportedVersions.has(version)
      };
    }

    return {
      versions,
      defaultVersion: this.defaultVersion,
      supportedVersions: Array.from(this.supportedVersions),
      deprecatedVersions: Array.from(this.deprecatedVersions)
    };
  }

  // Add new version
  addVersion(version, config) {
    this.versions.set(version, config);
    this.supportedVersions.add(version);
    
    if (config.status === 'deprecated') {
      this.deprecatedVersions.add(version);
    }
  }

  // Deprecate version
  deprecateVersion(version, deprecationDate, sunsetDate) {
    if (this.versions.has(version)) {
      const config = this.versions.get(version);
      config.status = 'deprecated';
      config.deprecationDate = deprecationDate;
      config.sunsetDate = sunsetDate;
      
      this.deprecatedVersions.add(version);
    }
  }

  // Remove version support
  removeVersion(version) {
    this.versions.delete(version);
    this.supportedVersions.delete(version);
    this.deprecatedVersions.delete(version);
  }
}

const apiVersionManager = new APIVersionManager();

// API version info endpoint
const getAPIVersionInfo = (req, res) => {
  try {
    const versionInfo = apiVersionManager.getAllVersions();
    
    res.json({
      success: true,
      ...versionInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get API version info error:', error);
    res.status(500).json({
      error: 'Failed to get API version information',
      code: 'VERSION_INFO_FAILED'
    });
  }
};

// Version-specific health check
const getVersionHealth = (req, res) => {
  try {
    const version = req.apiVersion;
    const versionInfo = req.versionInfo;
    
    const health = {
      version,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      versionInfo
    };

    // Add deprecation warning if applicable
    if (apiVersionManager.isDeprecated(version)) {
      health.deprecationWarning = apiVersionManager.getDeprecationWarning(version);
    }

    res.json(health);
  } catch (error) {
    console.error('Version health check error:', error);
    res.status(500).json({
      error: 'Version health check failed',
      code: 'VERSION_HEALTH_FAILED'
    });
  }
};

// Middleware for handling version-specific responses
const versionResponseHandler = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Add version-specific metadata
    if (data && typeof data === 'object') {
      data._meta = {
        version: req.apiVersion,
        timestamp: new Date().toISOString(),
        ...data._meta
      };

      // Add deprecation warning if applicable
      if (apiVersionManager.isDeprecated(req.apiVersion)) {
        data._meta.deprecationWarning = apiVersionManager.getDeprecationWarning(req.apiVersion);
      }
    }

    return originalJson.call(this, data);
  };

  next();
};

module.exports = {
  apiVersionManager,
  getAPIVersionInfo,
  getVersionHealth,
  versionResponseHandler,
  apiVersioningMiddleware: apiVersionManager.apiVersioningMiddleware(),
  versionedRoute: apiVersionManager.versionedRoute.bind(apiVersionManager)
};
