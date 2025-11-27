require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const database = require('./config/database');
const path = require('path');

const allowCrossOriginResources = (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
};

const imagesDir = path.resolve(__dirname, '../Database/photo');
const videosDir = path.resolve(__dirname, '../Database/video');

const app = express();

// Import routes BEFORE using them
// ORIGINAL ROUTES (maintained)
const backgroundPath = path.join(__dirname, '../Database/Background');
const authRoutes = require('./routes/authRoutes');
const listingRoutes = require('./routes/listingRoutes');
const imageRoutes = require('./routes/imageRoutes');
const messageRoutes = require('./routes/messageRoutes');
const orderRoutes = require('./routes/orderRoutes');
const accountRoutes = require('./routes/accountRoutes');

// ENHANCED ROUTE IMPORT (new for product detail page - video support)
// This enables video streaming with range request support for efficient seeking
let videoRoutes;
try {
  videoRoutes = require('./routes/videoRoutes');
  console.log('Video routes loaded successfully');
} catch (error) {
  console.warn('Warning: Video routes not found - video functionality disabled');
  console.warn('To enable video support, create videoRoutes.js in src/routes/');
}

// Import session tracking (only if files exist and are created)
// ORIGINAL FUNCTIONALITY (maintained)
let sessionRoutes;
let extractClientInfo;

try {
  sessionRoutes = require('./routes/sessionRoutes');
  const sessionMiddleware = require('./middleware/sessionMiddleware');
  extractClientInfo = sessionMiddleware.extractClientInfo;
  console.log('Session tracking loaded');
} catch (error) {
  console.warn('Session tracking files not found - skipping session routes');
  console.warn('Create sessionRoutes.js and sessionMiddleware.js to enable session tracking');
}

// ORIGINAL ROUTE IMPORTS (maintained)
const passwordResetRoutes = require('./routes/passwordResetRoutes');

// Middleware
// ORIGINAL MIDDLEWARE (maintained - no changes)
app.use('/background', express.static(backgroundPath));

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/images', allowCrossOriginResources, express.static(imagesDir));
app.use('/api/images', express.static(path.join(__dirname, '../../Database/photo')));
app.use('/api/message-media', express.static(path.join(__dirname, '../Database/message-media')));
app.use('/api/orders', orderRoutes);
app.use('/api/account', accountRoutes);

// Use session middleware if it's loaded
// ORIGINAL MIDDLEWARE (maintained)
if (extractClientInfo) {
  app.use(extractClientInfo);
}

// Use routes
// ORIGINAL ROUTES (maintained)
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/images', imageRoutes);

// ENHANCED ROUTE USAGE (new for product detail page - video streaming)
// Serves video files with range request support for efficient streaming
if (videoRoutes) {
  app.use('/api/videos', videoRoutes);
  console.log('Video routes active at /api/videos');
}

// Use session routes if they're loaded
// ORIGINAL ROUTES (maintained)
if (sessionRoutes) {
  app.use('/api/session', sessionRoutes);
}

// ORIGINAL ROUTES (maintained)
app.use('/api/auth', passwordResetRoutes);

app.use('/api/messages', messageRoutes);

// Test Route
// ORIGINAL ROUTE (maintained - no changes)
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Error Handler
// ORIGINAL HANDLER (maintained - no changes)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start Server
// ORIGINAL SERVER START (maintained - no changes)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Backend server running on http://localhost:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV}`);
});