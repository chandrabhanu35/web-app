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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize WebSocket
const wss = initializeWebSocket(server);

// Middleware
// ✅ FIXED: Restrict CORS to allowed origins only
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5000', 'http://localhost:3000', 'https://web-app-pi-seven-32.vercel.app', 'https://web-rl21xegox-chandrabhanu35s-projects.vercel.app'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 🆕 FIXED: Update session activity on every API request
app.use('/api/', updateSessionActivity);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// Serve admin panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin-new.html'));
});

// Serve main app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    console.log('✅ Database initialized');
    
    await setupDefaultAdmin();
    console.log('✅ Admin setup complete');
    
    // Auto-seed questions if they don't exist
    await autoSeedQuestions();
    console.log('✅ Questions ready');
    
    server.listen(PORT, () => {
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
