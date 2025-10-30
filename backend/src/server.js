require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const database = require('./config/database');
const path = require('path');

const allowCrossOriginResources = (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none'); // disable COEP on this route
  next();
};

const imagesDir = path.resolve(__dirname, '../Database/photo');

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false, // safer for video, too
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

// Import routes
const authRoutes = require('./routes/authRoutes');
const listingRoutes = require('./routes/listingRoutes');
const imageRoutes = require('./routes/imageRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/images', imageRoutes);

// Test Route
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Backend server running on http://localhost:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV}`);
});