const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SecurityAuditor {
  constructor() {
    this.auditResults = {
      vulnerabilities: [],
      warnings: [],
      recommendations: [],
      score: 0,
      timestamp: new Date().toISOString()
    };
  }

  // Run comprehensive security audit
  async runAudit() {
    console.log('🔍 Starting comprehensive security audit...\n');

    await this.auditDependencies();
    await this.auditEnvironmentVariables();
    await this.auditCodeSecurity();
    await this.auditConfiguration();
    await this.auditDatabaseSecurity();
    await this.auditFilePermissions();
    await this.auditNetworkSecurity();
    await this.auditLoggingSecurity();

    this.calculateSecurityScore();
    this.generateReport();

    return this.auditResults;
  }

  // Audit npm dependencies for vulnerabilities
  async auditDependencies() {
    console.log('📦 Auditing dependencies...');
    
    try {
      // Run npm audit
      const auditOutput = execSync('npm audit --json', { 
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8',
        timeout: 30000
      });
      
      const auditData = JSON.parse(auditOutput);
      
      if (auditData.vulnerabilities) {
        Object.entries(auditData.vulnerabilities).forEach(([packageName, vuln]) => {
          this.auditResults.vulnerabilities.push({
            type: 'dependency',
            package: packageName,
            severity: vuln.severity,
            title: vuln.title,
            description: vuln.overview,
            recommendation: vuln.recommendation,
            cwe: vuln.cwe
          });
        });
      }

      // Check for outdated packages
      const outdatedOutput = execSync('npm outdated --json', { 
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8',
        timeout: 30000
      });
      
      const outdatedData = JSON.parse(outdatedOutput);
      Object.entries(outdatedData).forEach(([packageName, info]) => {
        this.auditResults.warnings.push({
          type: 'outdated_package',
          package: packageName,
          current: info.current,
          wanted: info.wanted,
          latest: info.latest,
          recommendation: `Update ${packageName} to version ${info.latest}`
        });
      });

    } catch (error) {
      this.auditResults.warnings.push({
        type: 'audit_error',
        message: 'Failed to run dependency audit',
        error: error.message
      });
    }
  }

  // Audit environment variables
  async auditEnvironmentVariables() {
    console.log('🔐 Auditing environment variables...');
    
    const requiredVars = [
      'JWT_SECRET',
      'MONGODB_URI',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET'
    ];

    const sensitiveVars = [
      'JWT_SECRET',
      'MONGODB_URI',
      'CLOUDINARY_API_SECRET',
      'SMTP_PASS',
      'ADMIN_PASSWORD'
    ];

    // Check for missing required variables
    requiredVars.forEach(varName => {
      if (!process.env[varName]) {
        this.auditResults.vulnerabilities.push({
          type: 'missing_env_var',
          variable: varName,
          severity: 'high',
          recommendation: `Set ${varName} environment variable`
        });
      }
    });

    // Check for weak JWT secret
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret && jwtSecret.length < 32) {
      this.auditResults.vulnerabilities.push({
        type: 'weak_jwt_secret',
        severity: 'critical',
        recommendation: 'JWT secret should be at least 32 characters long'
      });
    }

    // Check for hardcoded secrets in code
    const codeFiles = this.getCodeFiles();
    codeFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      sensitiveVars.forEach(varName => {
        if (content.includes(`'${process.env[varName]}'`) || 
            content.includes(`"${process.env[varName]}"`)) {
          this.auditResults.vulnerabilities.push({
            type: 'hardcoded_secret',
            file: file,
            variable: varName,
            severity: 'high',
            recommendation: 'Remove hardcoded secret from code'
          });
        }
      });
    });
  }

  // Audit code security
  async auditCodeSecurity() {
    console.log('💻 Auditing code security...');
    
    const codeFiles = this.getCodeFiles();
    
    codeFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for dangerous patterns
      const dangerousPatterns = [
        { pattern: /eval\s*\(/, type: 'eval_usage', severity: 'critical' },
        { pattern: /new Function\s*\(/, type: 'function_constructor', severity: 'high' },
        { pattern: /innerHTML\s*=/, type: 'innerhtml_usage', severity: 'medium' },
        { pattern: /document\.write\s*\(/, type: 'document_write', severity: 'medium' },
        { pattern: /setTimeout\s*\(\s*["']/, type: 'string_settimeout', severity: 'medium' },
        { pattern: /setInterval\s*\(\s*["']/, type: 'string_setinterval', severity: 'medium' }
      ];

      dangerousPatterns.forEach(({ pattern, type, severity }) => {
        if (pattern.test(content)) {
          this.auditResults.warnings.push({
            type: type,
            file: file,
            severity: severity,
            recommendation: `Avoid using ${type.replace('_', ' ')} for security reasons`
          });
        }
      });

      // Check for console.log in production code
      if (process.env.NODE_ENV === 'production' && content.includes('console.log')) {
        this.auditResults.warnings.push({
          type: 'console_log_production',
          file: file,
          severity: 'low',
          recommendation: 'Remove console.log statements from production code'
        });
      }
    });
  }

  // Audit configuration security
  async auditConfiguration() {
    console.log('⚙️ Auditing configuration security...');
    
    // Check CORS configuration
    if (process.env.CORS_ORIGIN === '*') {
      this.auditResults.vulnerabilities.push({
        type: 'cors_wildcard',
        severity: 'high',
        recommendation: 'Use specific origins instead of wildcard for CORS'
      });
    }

    // Check if HTTPS is enforced
    if (process.env.NODE_ENV === 'production' && !process.env.FORCE_HTTPS) {
      this.auditResults.warnings.push({
        type: 'https_not_enforced',
        severity: 'medium',
        recommendation: 'Enforce HTTPS in production'
      });
    }

    // Check session configuration
    if (process.env.SESSION_COOKIE_SECURE !== 'true') {
      this.auditResults.warnings.push({
        type: 'insecure_session_cookie',
        severity: 'medium',
        recommendation: 'Set SESSION_COOKIE_SECURE=true for secure cookies'
      });
    }
  }

  // Audit database security
  async auditDatabaseSecurity() {
    console.log('🗄️ Auditing database security...');
    
    const mongoUri = process.env.MONGODB_URI;
    
    if (mongoUri) {
      // Check for authentication
      if (!mongoUri.includes('authSource')) {
        this.auditResults.warnings.push({
          type: 'mongodb_auth_source',
          severity: 'medium',
          recommendation: 'Specify authSource in MongoDB connection string'
        });
      }

      // Check for SSL/TLS
      if (!mongoUri.includes('ssl=true') && !mongoUri.includes('tls=true')) {
        this.auditResults.warnings.push({
          type: 'mongodb_ssl',
          severity: 'medium',
          recommendation: 'Enable SSL/TLS for MongoDB connection'
        });
      }
    }
  }

  // Audit file permissions
  async auditFilePermissions() {
    console.log('📁 Auditing file permissions...');
    
    const sensitiveFiles = [
      '.env',
      'server/.env',
      'package.json',
      'server/package.json'
    ];

    sensitiveFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        const mode = stats.mode.toString(8);
        
        // Check if file is world-readable
        if (mode.endsWith('4') || mode.endsWith('5') || mode.endsWith('6') || mode.endsWith('7')) {
          this.auditResults.warnings.push({
            type: 'world_readable_file',
            file: file,
            severity: 'medium',
            recommendation: 'Restrict file permissions to owner only'
          });
        }
      }
    });
  }

  // Audit network security
  async auditNetworkSecurity() {
    console.log('🌐 Auditing network security...');
    
    // Check for exposed ports
    const port = process.env.PORT || 3000;
    if (port < 1024 && process.env.NODE_ENV === 'production') {
      this.auditResults.warnings.push({
        type: 'privileged_port',
        port: port,
        severity: 'medium',
        recommendation: 'Avoid using privileged ports in production'
      });
    }

    // Check for rate limiting
    if (!process.env.RATE_LIMIT_ENABLED) {
      this.auditResults.warnings.push({
        type: 'no_rate_limiting',
        severity: 'medium',
        recommendation: 'Enable rate limiting to prevent abuse'
      });
    }
  }

  // Audit logging security
  async auditLoggingSecurity() {
    console.log('📝 Auditing logging security...');
    
    // Check for sensitive data in logs
    const logFiles = this.getLogFiles();
    
    logFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for passwords in logs
        if (content.includes('password') || content.includes('secret')) {
          this.auditResults.warnings.push({
            type: 'sensitive_data_in_logs',
            file: file,
            severity: 'high',
            recommendation: 'Remove sensitive data from log files'
          });
        }
      }
    });
  }

  // Get code files for analysis
  getCodeFiles() {
    const codeExtensions = ['.js', '.ts', '.jsx', '.tsx'];
    const files = [];
    
    const scanDirectory = (dir) => {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDirectory(fullPath);
        } else if (stat.isFile() && codeExtensions.includes(path.extname(item))) {
          files.push(fullPath);
        }
      });
    };

    scanDirectory(path.join(__dirname, '..'));
    return files;
  }

  // Get log files
  getLogFiles() {
    const logDir = path.join(__dirname, '../logs');
    const files = [];
    
    if (fs.existsSync(logDir)) {
      const items = fs.readdirSync(logDir);
      items.forEach(item => {
        if (item.endsWith('.log')) {
          files.push(path.join(logDir, item));
        }
      });
    }
    
    return files;
  }

  // Calculate security score
  calculateSecurityScore() {
    let score = 100;
    
    // Deduct points for vulnerabilities
    this.auditResults.vulnerabilities.forEach(vuln => {
      switch (vuln.severity) {
        case 'critical': score -= 20; break;
        case 'high': score -= 15; break;
        case 'medium': score -= 10; break;
        case 'low': score -= 5; break;
      }
    });

    // Deduct points for warnings
    this.auditResults.warnings.forEach(warning => {
      switch (warning.severity) {
        case 'high': score -= 10; break;
        case 'medium': score -= 5; break;
        case 'low': score -= 2; break;
      }
    });

    this.auditResults.score = Math.max(0, score);
  }

  // Generate audit report
  generateReport() {
    console.log('\n📊 Security Audit Report');
    console.log('========================');
    console.log(`Security Score: ${this.auditResults.score}/100`);
    console.log(`Vulnerabilities: ${this.auditResults.vulnerabilities.length}`);
    console.log(`Warnings: ${this.auditResults.warnings.length}`);
    
    if (this.auditResults.vulnerabilities.length > 0) {
      console.log('\n🚨 Vulnerabilities:');
      this.auditResults.vulnerabilities.forEach(vuln => {
        console.log(`  [${vuln.severity.toUpperCase()}] ${vuln.type}: ${vuln.recommendation}`);
      });
    }

    if (this.auditResults.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      this.auditResults.warnings.forEach(warning => {
        console.log(`  [${warning.severity.toUpperCase()}] ${warning.type}: ${warning.recommendation}`);
      });
    }

    // Save report to file
    const reportFile = path.join(__dirname, '../logs/security-audit-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(this.auditResults, null, 2));
    console.log(`\n📄 Report saved to: ${reportFile}`);
  }
}

// Run audit if called directly
if (require.main === module) {
  const auditor = new SecurityAuditor();
  auditor.runAudit().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Audit failed:', error);
    process.exit(1);
  });
}

module.exports = SecurityAuditor;
