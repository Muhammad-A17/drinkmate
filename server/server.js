// Start server (cPanel-compatible)
const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Configure server timeouts
server.timeout = parseInt(process.env.SERVER_TIMEOUT_MS) || 120000; 
server.keepAliveTimeout = parseInt(process.env.SERVER_KEEP_ALIVE_TIMEOUT_MS) || 65000;
server.headersTimeout = parseInt(process.env.SERVER_HEADERS_TIMEOUT_MS) || 66000;

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "https://drinkmate.sa",
      "http://localhost:3002",
      "http://localhost:8080",
      "http://127.0.0.1:3001",
      "http://127.0.0.1:3002",
      "http://127.0.0.1:8080"
    ],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"]
  },
  allowEIO3: true,
  transports: ['websocket', 'polling']
});

// Initialize Socket service
const SocketService = require('./Services/socket-service');
new SocketService(io);
app.set('io', io);

// Start session timeout service after DB connection
const sessionTimeoutService = require('./Services/session-timeout-service');
setTimeout(() => {
  const { isConnected } = require('./Utils/db');
  if (isConnected()) {
    sessionTimeoutService.start();
  } else {
    console.log('⚠️ DB not connected yet, will retry session timeout start later.');
  }
}, 5000);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Health check: /health`);
  console.log(`📋 API Status: /api-status`);
});

// Error handling
server.on('error', (error) => {
  console.error('Server error:', error);
});

handleUncaughtException();
handleUnhandledRejection();
