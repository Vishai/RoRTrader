import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { authRoutes } from './modules/auth';
import { demoRoutes } from './modules/demo';
import { analysisRoutes } from './modules/analysis';
import { marketRoutes, MarketGateway } from './modules/market';
import { strategyRoutes } from './modules/strategy';
import { coachRoutes } from './modules/coach';
import { botRoutes } from './modules/bots';
import { webhookRoutes } from './modules/webhooks';
import { prisma } from './shared/database/prisma';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const httpServer = createServer(app);

// CORS origins configuration
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:3000', 'http://localhost:3001'];

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Initialize market WebSocket gateway (raw ws)
const marketGateway = new MarketGateway(httpServer);
marketGateway.initialize();

// Middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // For development, allow all origins
      // callback(new Error('Not allowed by CORS')); // For production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - adjusted for real-time indicators
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, // Limit each IP to 120 requests per minute (2 per second)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// More lenient rate limit for analysis endpoints (real-time indicators)
const analysisLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Allow 60 requests per minute for analysis endpoints
  message: 'Too many analysis requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiter to all API routes
app.use('/api', generalLimiter);

// Apply specific rate limiter to analysis routes
app.use('/api/analysis', analysisLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'RoR Trader API',
    version: '0.1.0',
    description: 'Multi-asset trading bot platform API',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth/*',
      demo: '/api/demo/*',
      analysis: '/api/analysis/*',
      strategies: '/api/strategies/*',
      coach: '/api/coach/*',
      bots: '/api/bots/*',
      webhooks: '/webhook/:botId/:secret',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/strategies', strategyRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/bots', botRoutes);
app.use('', webhookRoutes); // Webhook routes include both /webhook and /api paths

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`
🚀 RoR Trader API Server
   
   Environment: ${process.env.NODE_ENV || 'development'}
   Port: ${PORT}
   Health: http://localhost:${PORT}/health
   API: http://localhost:${PORT}/api
   
   Ready to process trading signals!
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(async () => {
    console.log('HTTP server closed');
    await prisma.$disconnect();
    console.log('Database connection closed');
    process.exit(0);
  });
});
