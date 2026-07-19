# Multi-Tenant Supabase Integration Guide

## Overview

This document outlines the setup and implementation of multi-tenant support using Supabase. The system supports both a primary Supabase instance (main NGO tenant) and an optional secondary instance for advanced multi-tenancy scenarios.

## Environment Variables

Add the following environment variables to your `.env.development.local` file:

```env
# Primary Supabase Instance (Required)
SUPABASE_URL='https://your-primary-supabase-url.supabase.co'
SUPABASE_PUBLISHABLE_KEY='sb_publishable_your-primary-key'
SUPABASE_SECRET_KEY='sb_secret_your-primary-secret-key'
SUPABASE_JWKS_URL='https://your-primary-supabase-url.supabase.co/auth/v1/.well-known/jwks.json'

# Secondary Supabase Instance (Optional - for multi-tenant support)
SUPABASE_URL_2='https://your-secondary-supabase-url.supabase.co'
SUPABASE_PUBLISHABLE_KEY_2='sb_publishable_your-secondary-key'
SUPABASE_SECRET_KEY_2='sb_secret_your-secondary-secret-key'
SUPABASE_JWKS_URL_2='https://your-secondary-supabase-url.supabase.co/auth/v1/.well-known/jwks.json'
```

## File Structure

### Core Multi-Tenant Files

1. **`js/supabaseClientMultiTenant.js`** - Multi-tenant Supabase client handler
   - Manages connections to primary and secondary instances
   - Provides role-based access control utilities
   - Includes token verification and user role extraction

2. **`js/multiTenantRoutes.js`** - API routes with role-based access
   - Dashboard endpoints
   - Intern-specific endpoints (performance, leaderboard)
   - Super Admin endpoints (interns management, campaigns, analytics)

### Dashboard Components

3. **`js/InternDashboard.jsx`** - Intern dashboard UI
   - Fundraising statistics
   - Referral code management
   - Share link generation
   - Performance metrics

4. **`js/SuperAdminDashboardEnhanced.jsx`** - Enhanced Super Admin dashboard
   - Intern management
   - Campaign oversight
   - Analytics and reporting
   - Comprehensive statistics

## Usage Guide

### 1. Integrating Multi-Tenant Routes

In your `server.js` or main Express app:

```javascript
const multiTenantRoutes = require('./js/multiTenantRoutes');

// Add routes
app.use('/api/multi-tenant', multiTenantRoutes);
```

### 2. Using the Supabase Client

```javascript
const {
  getSupabaseClient,
  verifyTokenAndGetRole,
  hasRole,
  roleBasedAccessMiddleware
} = require('./js/supabaseClientMultiTenant');

// Get appropriate client
const supabase = getSupabaseClient('primary', false); // server-side, primary instance

// Or for public/browser use
const publicSupabase = getSupabaseClient('primary', true);

// Verify token and get user role
const userInfo = await verifyTokenAndGetRole(token, 'primary');
console.log(userInfo.role); // 'Intern' or 'Super Admin'
```

### 3. Creating Role-Based Middleware

```javascript
// Only allow Super Admins
app.get('/api/admin/restricted', 
  roleBasedAccessMiddleware(['Super Admin']),
  (req, res) => {
    // Handler code
  }
);

// Allow both Interns and Admins
app.get('/api/shared',
  roleBasedAccessMiddleware(['Intern', 'Super Admin']),
  (req, res) => {
    // Handler code
  }
);
```

### 4. Using Dashboards in React

```javascript
import InternDashboard from './js/InternDashboard';
import SuperAdminDashboardEnhanced from './js/SuperAdminDashboardEnhanced';

// In your routing
<Routes>
  <Route path="/dashboard/intern" element={<InternDashboard />} />
  <Route path="/dashboard/admin" element={<SuperAdminDashboardEnhanced />} />
</Routes>
```

## API Endpoints

### Dashboard
- `GET /api/multi-tenant/dashboard` - Fetch personalized dashboard (auth required)

### Intern Endpoints
- `GET /api/multi-tenant/intern/performance` - Get fundraising performance
- `GET /api/multi-tenant/intern/leaderboard` - Get leaderboard of all interns

### Super Admin Endpoints
- `GET /api/multi-tenant/admin/interns` - Get all interns with metrics
- `GET /api/multi-tenant/admin/campaigns` - Get all campaigns
- `GET /api/multi-tenant/admin/analytics` - Get comprehensive analytics

## Database Schema Requirements

Your Supabase instance should have the following tables:

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT CHECK (role IN ('Intern', 'Super Admin', 'Admin')),
  referral_code TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Donations Table
```sql
CREATE TABLE donations (
  id UUID PRIMARY KEY,
  referral_code TEXT,
  amount DECIMAL(10, 2),
  payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (referral_code) REFERENCES users(referral_code)
);
```

### Campaigns Table
```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Authentication Flow

1. User logs in with email/password
2. JWT token is generated
3. Token is stored in localStorage
4. For each API request, token is sent in Authorization header: `Bearer {token}`
5. Server verifies token and extracts user role
6. Request is processed based on role permissions

## Role-Based Access

### Intern Role
- View personal dashboard
- Access referral code and share link
- View fundraising performance
- See leaderboard
- Cannot access admin functions

### Super Admin Role
- Access all dashboard data
- Manage interns (add, edit, delete)
- Oversee all campaigns
- View comprehensive analytics
- Access all Intern endpoints
- Full system access

## Switching Between Tenants

To switch between primary and secondary Supabase instances:

```javascript
// Use primary instance
const primaryClient = getSupabaseClient('primary', false);

// Use secondary instance (falls back to primary if not configured)
const secondaryClient = getSupabaseClient('secondary', false);

// Both support public/browser mode with usePublicKey parameter
const publicClient = getSupabaseClient('primary', true);
```

## Security Considerations

1. **JWT Tokens**: Always validated on the server before processing requests
2. **Role Verification**: Every protected endpoint verifies user role
3. **Data Isolation**: Interns can only see their own data
4. **CORS**: Configure appropriate CORS headers in production
5. **Rate Limiting**: Implement rate limiting for API endpoints
6. **HTTPS**: Always use HTTPS in production

## Troubleshooting

### Token Verification Fails
- Ensure token is valid and not expired
- Check JWT_SECRET matches between frontend and backend
- Verify user exists in database

### Secondary Tenant Returns Null
- Confirm `SUPABASE_URL_2` is configured correctly
- Verify secondary Supabase credentials are valid
- Check fallback logic to primary tenant

### Role-Based Access Denied
- Verify user role is correctly set in database
- Check role matches allowed roles in middleware
- Confirm token is fresh and user profile is updated

## Migration from Single Tenant

If migrating from a single-tenant setup:

1. Keep primary instance as is (backward compatible)
2. Configure secondary instance credentials
3. Update API calls to specify tenant: `getSupabaseClient('secondary')`
4. Gradually migrate data/users to secondary instance
5. Update client-side logic to respect tenant boundaries

## Performance Optimization

1. **Caching**: Implement caching for frequently accessed data
2. **Pagination**: Paginate large result sets
3. **Indexes**: Create indexes on frequently queried columns
4. **Connection Pooling**: Reuse Supabase client connections
5. **CDN**: Cache static dashboard assets

## Future Enhancements

- [ ] Implement tenant-specific branding
- [ ] Add multi-currency support
- [ ] Implement audit logging per tenant
- [ ] Add real-time notifications via Supabase subscriptions
- [ ] Implement data export/backup per tenant
- [ ] Add advanced reporting features
