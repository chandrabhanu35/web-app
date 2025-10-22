import express from 'express';
import cors from 'cors';
import http from 'http';
import { initializeWebSocket } from './services/websocket.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import quizRoutes from './routes/quiz.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';

// Import middleware
import { updateSessionActivity } from './middleware/auth.js';

// Import database initialization
import { initializeDatabase } from './db/schema.js';
import setupDefaultAdmin from './db/setupAdmin.js';
import { autoSeedQuestions } from './db/autoSeed.js';
import { runMigrations } from './db/migrations.js';
import seedTestUser from './db/seedTestUser.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// WebSocket will be initialized after server starts
let wss = null;

// Middleware
// ✅ FIXED: Restrict CORS to allowed origins only
// Handle parse errors globally
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON Parse Error:', err.message);
    return res.status(400).json({ error: 'Invalid JSON in request' });
  }
  next();
});

// Setup API middleware first
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files - but exclude root path
app.use((req, res, next) => {
  if (req.path === '/') {
    // Skip static file serving for root, let routes handle it
    return next();
  }
  express.static(path.join(__dirname, 'public'))(req, res, next);
});

const allowedOrigins = [
  'http://localhost:5000',
  'http://localhost:3000',
  'https://web-app-kljr.onrender.com',
  'https://www.aptitudepro.in',
  'https://aptitudepro.in',
  'https://web-app-pi-seven-32.vercel.app',
  'https://web-rl21xegox-chandrabhanu35s-projects.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Origin ${origin} not allowed by CORS`);
      callback(new Error('Origin not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Enhanced error handling for JSON parsing
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON Parse Error:', {
      error: err.message,
      body: err.body,
      path: req.path,
      method: req.method,
      contentType: req.get('Content-Type')
    });
    return res.status(400).json({ 
      error: 'Invalid JSON payload',
      details: process.env.NODE_ENV !== 'production' ? err.message : undefined
    });
  }
  next(err);
});

// Update session activity on API requests
app.use('/api/', updateSessionActivity);

// Request logging middleware for debugging
app.use('/api/', (req, res, next) => {
  console.log(`📍 ${req.method} ${req.path}`, {
    contentType: req.get('Content-Type'),
    bodySize: req.get('Content-Length'),
    timestamp: new Date().toISOString()
  });
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// Debug endpoint for testing
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working', timestamp: new Date().toISOString() });
});

// Add security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Serve landing page at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/landing.html'));
});

// Serve admin panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin-new.html'));
});

// Serve app
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Serve app.html
app.get('/app.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Serve main app - handle client-side routing
app.get('*', (req, res) => {
  // API routes should have been handled by now
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  // All other routes serve the main app
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Comprehensive error handling
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query
  });

  // Don't expose stack traces in production
  const error = process.env.NODE_ENV === 'production' 
    ? { error: 'Internal server error' }
    : { error: err.message, stack: err.stack };

  res.status(err.status || 500).json(error);
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    console.log('✅ Database initialized');
    
    // Run migrations to add missing columns
    await runMigrations();
    console.log('✅ Migrations completed');
    
    await setupDefaultAdmin();
    console.log('✅ Admin setup complete');
    
    // Seed test user for development
    await seedTestUser();
    console.log('✅ Test user ready');
    
    // Auto-seed questions if they don't exist
    await autoSeedQuestions();
    console.log('✅ Questions ready');
    
    server.listen(PORT, () => {
      // Initialize WebSocket after server is listening
      wss = initializeWebSocket(server);
      
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🔌 WebSocket server active`);
      console.log('Ready to accept requests...\n');
    });

    // Handle any server errors
    server.on('error', (err) => {
      console.error('Server error:', err);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\nShutting down gracefully...');
      if (wss) {
        wss.close(() => {
          console.log('WebSocket server closed');
        });
      }
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Startup error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Keep process alive
process.on('exit', (code) => {
  console.log('Process exiting with code:', code);
});
