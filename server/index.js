require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const adminRoutes = require('./routes/adminRoutes');
const institutionRoutes = require('./routes/institutionRoutes');
const leadRoutes = require('./routes/leadRoutes');
const exportRoutes = require('./routes/exportRoutes');
const contactRoutes = require('./routes/contactRoutes');

connectDB();

const app = express();
app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts, please try again in 15 minutes.' },
});

const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Automatically allow the request's origin (Bypasses CORS strictness for frontend)
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/api/', limiter);

app.use('/api/admin', authLimiter, adminRoutes);
app.use('/api/institution', institutionRoutes);
app.use('/api/lead', leadRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/contact', contactRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mintu bro! API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\nMintu bro! API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Health: http://localhost:${PORT}/health\n`);
});
