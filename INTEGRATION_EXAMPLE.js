/**
 * Multi-Tenant Integration Example
 * Shows how to integrate the multi-tenant system into your existing Express app
 */

// ============================================
// STEP 1: Update your server.js
// ============================================

const express = require('express');
const multiTenantRoutes = require('./js/multiTenantRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// ============================================
// STEP 2: Register Multi-Tenant Routes
// ============================================

// All multi-tenant routes will be available at /api/multi-tenant/*
app.use('/api/multi-tenant', multiTenantRoutes);

// ============================================
// STEP 3: Usage Examples in Your Routes
// ============================================

// Example 1: Simple Auth Check
app.get('/api/example/protected', async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ msg: "No token provided" });
    }

    const { verifyTokenAndGetRole } = require('./js/supabaseClientMultiTenant');
    const userInfo = await verifyTokenAndGetRole(token, 'primary');
    
    res.json({
      msg: "Success",
      user: userInfo
    });
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
});

// Example 2: Admin-Only Endpoint
app.get('/api/example/admin-only', async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ msg: "No token provided" });
    }

    const { verifyTokenAndGetRole, hasRole } = require('./js/supabaseClientMultiTenant');
    const userInfo = await verifyTokenAndGetRole(token, 'primary');
    
    if (!hasRole(userInfo.role, ['Super Admin'])) {
      return res.status(403).json({ msg: "Only Super Admins can access this" });
    }
    
    res.json({
      msg: "Admin access granted",
      user: userInfo
    });
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
});

// Example 3: Intern-Only Endpoint
app.get('/api/example/intern-only', async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ msg: "No token provided" });
    }

    const { verifyTokenAndGetRole, hasRole } = require('./js/supabaseClientMultiTenant');
    const userInfo = await verifyTokenAndGetRole(token, 'primary');
    
    if (!hasRole(userInfo.role, ['Intern'])) {
      return res.status(403).json({ msg: "Only Interns can access this" });
    }
    
    res.json({
      msg: "Intern access granted",
      user: userInfo
    });
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
});

// Example 4: Query Data for Specific User
app.get('/api/example/user-donations', async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ msg: "No token provided" });
    }

    const { verifyTokenAndGetRole, getSupabaseClient } = require('./js/supabaseClientMultiTenant');
    const userInfo = await verifyTokenAndGetRole(token, 'primary');
    
    // Get the Supabase client for the user's tenant
    const supabase = getSupabaseClient(userInfo.tenant, false);
    
    // Fetch user's donations
    const { data: user } = await supabase
      .from('users')
      .select('referral_code')
      .eq('id', userInfo.userId)
      .single();

    const { data: donations } = await supabase
      .from('donations')
      .select('*')
      .eq('referral_code', user?.referral_code);

    res.json({
      success: true,
      donations: donations || []
    });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching donations", error: err.message });
  }
});

// Example 5: Cross-Tenant Query (Admin only)
app.get('/api/example/all-donations', async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ msg: "No token provided" });
    }

    const { verifyTokenAndGetRole, hasRole, getSupabaseClient } = require('./js/supabaseClientMultiTenant');
    const userInfo = await verifyTokenAndGetRole(token, 'primary');
    
    if (!hasRole(userInfo.role, ['Super Admin'])) {
      return res.status(403).json({ msg: "Only admins can view all donations" });
    }
    
    // Get the Supabase client
    const supabase = getSupabaseClient(userInfo.tenant, false);
    
    // Fetch all donations
    const { data: donations } = await supabase
      .from('donations')
      .select('*')
      .eq('payment_status', 'completed')
      .order('created_at', { ascending: false });

    const totalAmount = donations?.reduce((sum, d) => sum + d.amount, 0) || 0;

    res.json({
      success: true,
      totalDonations: donations?.length || 0,
      totalAmount: totalAmount,
      donations: donations || []
    });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching donations", error: err.message });
  }
});

// Example 6: Using Secondary Tenant
app.get('/api/example/secondary-tenant-data', async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ msg: "No token provided" });
    }

    const { verifyTokenAndGetRole, hasRole, getSupabaseClient } = require('./js/supabaseClientMultiTenant');
    const userInfo = await verifyTokenAndGetRole(token, 'primary');
    
    if (!hasRole(userInfo.role, ['Super Admin'])) {
      return res.status(403).json({ msg: "Only admins can access secondary tenant" });
    }
    
    // Get the secondary Supabase client
    const secondarySupabase = getSupabaseClient('secondary', false);
    
    // Fetch data from secondary tenant
    const { data: campaigns } = await secondarySupabase
      .from('campaigns')
      .select('*');

    res.json({
      success: true,
      tenant: 'secondary',
      campaigns: campaigns || []
    });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching secondary tenant data", error: err.message });
  }
});

// ============================================
// STEP 4: Frontend Integration (React)
// ============================================

/*
// Example React component using the dashboards

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import InternDashboard from './js/InternDashboard';
import SuperAdminDashboardEnhanced from './js/SuperAdminDashboardEnhanced';

function App() {
  return (
    <Routes>
      <Route path="/dashboard/intern" element={<InternDashboard />} />
      <Route path="/dashboard/admin" element={<SuperAdminDashboardEnhanced />} />
    </Routes>
  );
}

export default App;
*/

// ============================================
// STEP 5: Authentication Helper
// ============================================

/**
 * Helper function to authenticate and get user info
 */
async function authenticateUser(token) {
  try {
    const { verifyTokenAndGetRole } = require('./js/supabaseClientMultiTenant');
    const userInfo = await verifyTokenAndGetRole(token, 'primary');
    return userInfo;
  } catch (err) {
    return null;
  }
}

/**
 * Helper function to check if user has required role
 */
function checkRole(userInfo, requiredRoles = []) {
  const { hasRole } = require('./js/supabaseClientMultiTenant');
  return hasRole(userInfo.role, requiredRoles);
}

/**
 * Middleware wrapper for common auth checks
 */
function withAuth(allowedRoles = []) {
  return async (req, res, next) => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ msg: "No token provided" });
      }

      const { verifyTokenAndGetRole, hasRole } = require('./js/supabaseClientMultiTenant');
      const userInfo = await verifyTokenAndGetRole(token, 'primary');
      
      if (allowedRoles.length > 0 && !hasRole(userInfo.role, allowedRoles)) {
        return res.status(403).json({ msg: `Access denied. Required roles: ${allowedRoles.join(', ')}` });
      }

      req.user = userInfo;
      next();
    } catch (err) {
      res.status(401).json({ msg: "Invalid token" });
    }
  };
}

// Usage of withAuth middleware
app.get('/api/example/using-middleware', withAuth(['Intern', 'Super Admin']), (req, res) => {
  res.json({
    msg: "Success",
    user: req.user
  });
});

// ============================================
// STEP 6: Start Server
// ============================================

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🚀 She Can Foundation Server is Live!`);
  console.log(`🔗 Local Address: http://localhost:${PORT}`);
  console.log(`📊 Multi-Tenant API: http://localhost:${PORT}/api/multi-tenant`);
  console.log(`${'='.repeat(50)}\n`);
});

// ============================================
// AVAILABLE MULTI-TENANT ENDPOINTS
// ============================================

/*
Dashboard:
  GET /api/multi-tenant/dashboard
    - Personalized dashboard based on user role

Intern Endpoints (requires Intern role):
  GET /api/multi-tenant/intern/performance
    - Get fundraising performance metrics
  
  GET /api/multi-tenant/intern/leaderboard
    - Get leaderboard of all interns

Admin Endpoints (requires Super Admin role):
  GET /api/multi-tenant/admin/interns
    - Get all interns with metrics
  
  GET /api/multi-tenant/admin/campaigns
    - Get all campaigns
  
  GET /api/multi-tenant/admin/analytics
    - Get comprehensive analytics

All endpoints require Authorization header:
  Authorization: Bearer <JWT_TOKEN>
*/

module.exports = app;
