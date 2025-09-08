const helmet = require('helmet');

class AdvancedSecurityHeaders {
  constructor() {
    this.hstsMaxAge = 31536000; // 1 year
    this.hstsIncludeSubDomains = true;
    this.hstsPreload = true;
  }

  // Get comprehensive security headers
  getSecurityHeaders() {
    return helmet({
      // Content Security Policy
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'", // Remove in production
            "https://www.youtube.com",
            "https://www.googletagmanager.com",
            "https://www.google-analytics.com"
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com"
          ],
          imgSrc: [
            "'self'",
            "data:",
            "https:",
            "blob:"
          ],
          fontSrc: [
            "'self'",
            "https://fonts.gstatic.com"
          ],
          connectSrc: [
            "'self'",
            "https://api.drinkmate.com",
            "https://www.google-analytics.com"
          ],
          mediaSrc: [
            "'self'",
            "https://www.youtube.com"
          ],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: []
        },
        reportOnly: false
      },

      // HTTP Strict Transport Security
      hsts: {
        maxAge: this.hstsMaxAge,
        includeSubDomains: this.hstsIncludeSubDomains,
        preload: this.hstsPreload
      },

      // X-Frame-Options
      frameguard: {
        action: 'deny'
      },

      // X-Content-Type-Options
      noSniff: true,

      // X-XSS-Protection
      xssFilter: true,

      // Referrer Policy
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin'
      },

      // Permissions Policy
      permissionsPolicy: {
        camera: [],
        microphone: [],
        geolocation: [],
        payment: [],
        usb: [],
        magnetometer: [],
        gyroscope: [],
        accelerometer: [],
        ambientLightSensor: [],
        autoplay: [],
        battery: [],
        fullscreen: ["'self'"],
        pictureInPicture: []
      },

      // Cross-Origin Policies
      crossOriginEmbedderPolicy: false, // Disable for compatibility
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginResourcePolicy: { policy: 'cross-origin' },

      // DNS Prefetch Control
      dnsPrefetchControl: {
        allow: false
      },

      // Hide X-Powered-By
      hidePoweredBy: true,

      // IE No Open
      ieNoOpen: true,

      // Origin Agent Cluster
      originAgentCluster: true
    });
  }

  // Get HSTS preload headers
  getHSTSPreloadHeaders() {
    return {
      'Strict-Transport-Security': `max-age=${this.hstsMaxAge}; includeSubDomains; preload`,
      'Expect-CT': `max-age=86400, enforce`,
      'Public-Key-Pins': this.getHPKPHeader()
    };
  }

  // Get HTTP Public Key Pinning header (deprecated but still useful)
  getHPKPHeader() {
    // In production, you should generate your own pins
    const pins = [
      'pin-sha256="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="', // Replace with actual pin
      'pin-sha256="BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB="'  // Replace with backup pin
    ];
    
    return `${pins.join('; ')}; max-age=86400; includeSubDomains`;
  }

  // Get additional security headers
  getAdditionalHeaders() {
    return {
      // Server information hiding
      'Server': 'DrinkMate/1.0',
      
      // Cache control for sensitive endpoints
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      
      // Feature Policy (legacy, for older browsers)
      'Feature-Policy': [
        "camera 'none'",
        "microphone 'none'",
        "geolocation 'none'",
        "payment 'none'",
        "usb 'none'",
        "magnetometer 'none'",
        "gyroscope 'none'",
        "accelerometer 'none'",
        "ambient-light-sensor 'none'",
        "autoplay 'none'",
        "battery 'none'",
        "fullscreen 'self'",
        "picture-in-picture 'none'"
      ].join('; '),
      
      // Clear-Site-Data (for logout endpoints)
      'Clear-Site-Data': '"cache", "cookies", "storage", "executionContexts"',
      
      // Cross-Origin-Embedder-Policy
      'Cross-Origin-Embedder-Policy': 'require-corp',
      
      // Cross-Origin-Opener-Policy
      'Cross-Origin-Opener-Policy': 'same-origin',
      
      // Cross-Origin-Resource-Policy
      'Cross-Origin-Resource-Policy': 'cross-origin',
      
      // X-DNS-Prefetch-Control
      'X-DNS-Prefetch-Control': 'off',
      
      // X-Download-Options
      'X-Download-Options': 'noopen',
      
      // X-Permitted-Cross-Domain-Policies
      'X-Permitted-Cross-Domain-Policies': 'none'
    };
  }

  // Get headers for API endpoints
  getAPIHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
  }

  // Get headers for static assets
  getStaticAssetHeaders() {
    return {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    };
  }

  // Get headers for logout endpoints
  getLogoutHeaders() {
    return {
      'Clear-Site-Data': '"cache", "cookies", "storage", "executionContexts"',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
  }

  // Middleware for applying security headers
  applySecurityHeaders() {
    return (req, res, next) => {
      // Apply base security headers
      const securityHeaders = this.getSecurityHeaders();
      securityHeaders(req, res, () => {
        // Apply additional headers based on route
        if (req.path.startsWith('/api/')) {
          Object.entries(this.getAPIHeaders()).forEach(([key, value]) => {
            res.setHeader(key, value);
          });
        } else if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
          Object.entries(this.getStaticAssetHeaders()).forEach(([key, value]) => {
            res.setHeader(key, value);
          });
        } else if (req.path.includes('/logout') || req.path.includes('/signout')) {
          Object.entries(this.getLogoutHeaders()).forEach(([key, value]) => {
            res.setHeader(key, value);
          });
        }

        // Apply HSTS preload headers in production
        if (process.env.NODE_ENV === 'production') {
          Object.entries(this.getHSTSPreloadHeaders()).forEach(([key, value]) => {
            res.setHeader(key, value);
          });
        }

        // Apply additional security headers
        Object.entries(this.getAdditionalHeaders()).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            res.setHeader(key, value.join('; '));
          } else {
            res.setHeader(key, value);
          }
        });

        next();
      });
    };
  }
}

const advancedSecurityHeaders = new AdvancedSecurityHeaders();

module.exports = {
  advancedSecurityHeaders,
  applySecurityHeaders: advancedSecurityHeaders.applySecurityHeaders()
};
