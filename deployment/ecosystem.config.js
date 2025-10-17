// PM2 Ecosystem configuration for DrinkMate
// This file manages both frontend and backend processes

module.exports = {
  apps: [
    {
      name: 'drinkmate-backend',
      script: './server/server.js',
      cwd: '/var/www/drinkmate',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        MONGODB_URI: 'mongodb://localhost:27017/drinkmate_prod',
        JWT_SECRET: process.env.JWT_SECRET || 'your-production-jwt-secret',
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
        EMAIL_HOST: process.env.EMAIL_HOST,
        EMAIL_PORT: process.env.EMAIL_PORT,
        EMAIL_USER: process.env.EMAIL_USER,
        EMAIL_PASS: process.env.EMAIL_PASS,
        ARAMEX_USERNAME: process.env.ARAMEX_USERNAME,
        ARAMEX_PASSWORD: process.env.ARAMEX_PASSWORD,
        ARAMEX_ACCOUNT_NUMBER: process.env.ARAMEX_ACCOUNT_NUMBER,
        ARAMEX_ACCOUNT_PIN: process.env.ARAMEX_ACCOUNT_PIN,
        ARAMEX_ACCOUNT_ENTITY: process.env.ARAMEX_ACCOUNT_ENTITY,
        ARAMEX_ACCOUNT_COUNTRY_CODE: process.env.ARAMEX_ACCOUNT_COUNTRY_CODE,
        URWAY_MERCHANT_ID: process.env.URWAY_MERCHANT_ID,
        URWAY_MERCHANT_KEY: process.env.URWAY_MERCHANT_KEY,
        URWAY_API_URL: process.env.URWAY_API_URL,
        TABBY_PUBLIC_KEY: process.env.TABBY_PUBLIC_KEY,
        TABBY_SECRET_KEY: process.env.TABBY_SECRET_KEY,
        TABBY_API_URL: process.env.TABBY_API_URL,
        REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
        SESSION_SECRET: process.env.SESSION_SECRET || 'your-production-session-secret'
      },
      error_file: '/var/log/drinkmate/backend-error.log',
      out_file: '/var/log/drinkmate/backend-out.log',
      log_file: '/var/log/drinkmate/backend-combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads'],
      env_production: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'drinkmate-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/drinkmate/drinkmate-main',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        NEXT_PUBLIC_API_URL: 'https://drinkmate.sa/api',
        NEXT_PUBLIC_SITE_URL: 'https://drinkmate.sa',
        NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
        NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
        NEXT_PUBLIC_TABBY_PUBLIC_KEY: process.env.TABBY_PUBLIC_KEY
      },
      error_file: '/var/log/drinkmate/frontend-error.log',
      out_file: '/var/log/drinkmate/frontend-out.log',
      log_file: '/var/log/drinkmate/frontend-combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      watch: false,
      ignore_watch: ['node_modules', '.next', 'logs'],
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ],

  deploy: {
    production: {
      user: 'drinkmate',
      host: 'your-server-ip', // Replace with your server IP
      ref: 'origin/main',
      repo: 'https://github.com/your-username/drinkmates.git', // Replace with your repo
      path: '/var/www/drinkmate',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && cd drinkmate-main && npm install && npm run build && cd ../server && npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
