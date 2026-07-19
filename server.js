require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/she_can_foundation';
const JWT_SECRET = process.env.JWT_SECRET || 'she_can_foundation_super_secret_key_2026';

// Middleware
app.use(express.json());

// Connect to MongoDB & Auto-seed Admins if Empty
const sanitizedUri = MONGODB_URI.replace(/:([^@]+)@/, ':******@');
console.log(`🔌 Attempting to connect database URI: ${sanitizedUri}`);

mongoose.connect(MONGODB_URI)
  .then(() => console.log('🌿 Connected successfully to MongoDB'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

/* =========================================================
   DATABASE SCHEMAS & MODELS
   ========================================================= */

// Submission Schema (Handles General Contacts, Volunteers, and Appointed Team Members)
const submissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Admin Schema (Handles Admin Authentication Logins)
const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Submission = mongoose.model('Submission', submissionSchema);
const Admin = mongoose.model('Admin', adminSchema);

// Login Attempt Log Schema
const loginAttemptSchema = new mongoose.Schema({
  email: { type: String, required: true },
  status: { type: String, enum: ['SUCCESS', 'FAILED'], required: true },
  ip: { type: String, default: 'N/A' },
  createdAt: { type: Date, default: Date.now }
});

const LoginAttempt = mongoose.model('LoginAttempt', loginAttemptSchema);

/* =========================================================
   AUTHENTICATION MIDDLEWARE
   ========================================================= */

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No Token Provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden: Invalid Token' });
    }
    req.user = user;
    next();
  });
};

/* =========================================================
   API ENDPOINTS
   ========================================================= */

// 1. Submit a Contact/Volunteer Application Form
app.post('/api/submissions', async (req, res) => {
  try {
    const { name, email, message, createdAt } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    const newSubmission = new Submission({
      name,
      email,
      message,
      createdAt: createdAt ? new Date(createdAt) : new Date()
    });

    await newSubmission.save();
    
    // Add Appwrite-compatible properties for frontend seamless integration
    const responseData = newSubmission.toObject();
    responseData.$id = responseData._id.toString();
    responseData.$createdAt = responseData.createdAt.toISOString();

    res.status(201).json(responseData);
  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(500).json({ message: 'Server error saving submission.' });
  }
});

// 2. Admin Login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const admin = await Admin.findOne({ email });
    const clientIp = req.ip || req.headers['x-forwarded-for'] || 'N/A';

    if (!admin) {
      // Log failed attempt in MongoDB
      const attempt = new LoginAttempt({ email, status: 'FAILED', ip: clientIp });
      await attempt.save().catch(err => console.error("Error saving login attempt:", err));
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      // Log failed attempt in MongoDB
      const attempt = new LoginAttempt({ email, status: 'FAILED', ip: clientIp });
      await attempt.save().catch(err => console.error("Error saving login attempt:", err));
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Log successful attempt in MongoDB
    const attempt = new LoginAttempt({ email, status: 'SUCCESS', ip: clientIp });
    await attempt.save().catch(err => console.error("Error saving login attempt:", err));

    // Sign JWT
    const token = jwt.sign(
      { id: admin._id, email: admin.email, name: admin.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        email: admin.email,
        name: admin.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// 3. Get Auth State Profile
app.get('/api/admin/me', authenticateToken, (req, res) => {
  res.json({
    email: req.user.email,
    name: req.user.name
  });
});

// 4. Retrieve All Submissions (Requires Auth)
app.get('/api/admin/submissions', authenticateToken, async (req, res) => {
  try {
    const docs = await Submission.find().sort({ createdAt: -1 });
    
    // Map response to match Appwrite's schema structure
    const appwriteCompatibleDocs = docs.map(doc => {
      const obj = doc.toObject();
      obj.$id = obj._id.toString();
      obj.$createdAt = obj.createdAt.toISOString();
      return obj;
    });

    res.json({
      documents: appwriteCompatibleDocs
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Server error fetching database entries.' });
  }
});

// 5. Delete Submission by ID (Requires Auth)
app.delete('/api/admin/submissions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedDoc = await Submission.findByIdAndDelete(id);
    
    if (!deletedDoc) {
      return res.status(404).json({ message: 'Submission not found.' });
    }
    
    res.json({ message: 'Document deleted successfully', id });
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({ message: 'Server error deleting entry.' });
  }
});

// 6. Appoint Another Admin (Requires Auth)
app.post('/api/admin/appoint', authenticateToken, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields (name, email, password) are required.' });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'An admin with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword
    });
    await newAdmin.save();

    const auditRecord = new Submission({
      name,
      email,
      message: `[TEAM MEMBER] Appointed as Admin`,
      createdAt: new Date()
    });
    await auditRecord.save();

    res.status(201).json({
      message: `Successfully appointed ${name} as a new Administrator!`,
      user: { name, email }
    });
  } catch (error) {
    console.error('Error appointing admin:', error);
    res.status(500).json({ message: 'Server error appointing administrator.' });
  }
});

/* =========================================================
   STATIC FILE SERVING
   ========================================================= */

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/html', express.static(path.join(__dirname, 'html')));

app.use((req, res, next) => {
  if (req.path.endsWith('.html')) {
    const filename = path.basename(req.path);
    return res.sendFile(path.join(__dirname, 'html', filename));
  }
  next();
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

/* =========================================================
   START SERVER
   ========================================================= */
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 She Can Foundation Web Portal Server is Live!`);
  console.log(`🔗 Local Address: http://localhost:${PORT}`);
  console.log(`🌿 Connecting Database: she_can_foundation`);
  console.log(`======================================================\n`);
});

module.exports = app;
