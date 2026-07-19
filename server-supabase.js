require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true
}));

// ==================== ROUTE IMPORTS ====================

// Authentication Routes
const authRoutes = require('./js/authRoutes');

// Donation Routes (Razorpay integration)
const donateRoutes = require('./js/donateRoutes');

// Donations Tracking Routes
const donationsRoutes = require('./js/donationsRoutes');

// Referral System Routes
const referralRoutes = require('./js/referralRoutes');

// ==================== API ROUTES ====================

// Authentication endpoints
app.use('/api/auth', authRoutes);

// Donation endpoints (with Razorpay)
app.use('/api/donate', donateRoutes);

// Donations tracking endpoints
app.use('/api/donations', donationsRoutes);

// Referral system endpoints
app.use('/api/referral', referralRoutes);

// ==================== STATIC FILE SERVING ====================

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/html', express.static(path.join(__dirname, 'html')));

// Serve HTML files
app.use((req, res, next) => {
  if (req.path.endsWith('.html')) {
    const filename = path.basename(req.path);
    return res.sendFile(path.join(__dirname, 'html', filename));
  }
  next();
});

// Default routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

// Fallback SPA route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ 
    msg: "Internal Server Error", 
    error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 She Can Foundation Server is Live!`);
  console.log(`🔗 Local Address: http://localhost:${PORT}`);
  console.log(`💾 Database: Supabase (PostgreSQL)`);
  console.log(`💳 Payments: Razorpay`);
  console.log(`======================================================\n`);
});

module.exports = app;
