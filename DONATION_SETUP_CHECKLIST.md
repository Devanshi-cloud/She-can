# Razorpay Donation System - Setup Checklist

## Pre-Setup Verification

- [ ] Razorpay account created and verified
- [ ] Test keys obtained from Razorpay dashboard
- [ ] Supabase project created and accessible
- [ ] Node.js 16+ installed
- [ ] npm or yarn package manager available

## Step 1: Environment Configuration

- [ ] Open `.env.development.local`
- [ ] Add Razorpay keys:
  ```
  RAZORPAY_TEST_KEY_ID=rzp_test_TBNBuPaPRaIZWu
  RAZORPAY_TEST_KEY_SECRET=qgGA0Jr84TBAe3159QoWpu0s
  ```
- [ ] Add Razorpay secondary keys (optional):
  ```
  RAZORPAY_TEST_KEY_ID_2=rzp_test_TDRlBsunEPZmEk
  RAZORPAY_TEST_KEY_SECRET_2=eaD1I5KBBjLgtf9YOcPbAAKi
  ```
- [ ] Add subscription plan IDs:
  ```
  VITE_RAZORPAY_PLAN_ID_Starter=plan_TDRn7nEhvNXekF
  VITE_RAZORPAY_PLAN_ID_Supporter=plan_TDRojGLnRbsFRK
  VITE_RAZORPAY_PLAN_ID_Champion=plan_TDRp2Kq83C3jtb
  VITE_RAZORPAY_PLAN_ID_Guardian=plan_TDRpSkQacDFNNr
  ```
- [ ] Verify Supabase credentials are present
- [ ] Add JWT_SECRET if not present
- [ ] Add APP_URL for referral links

## Step 2: Dependencies Installation

```bash
# Install required packages
npm install razorpay @supabase/supabase-js jsonwebtoken bcryptjs cors dotenv

# Verify installation
npm list razorpay @supabase/supabase-js
```

- [ ] Razorpay package installed
- [ ] Supabase client installed
- [ ] JWT package installed
- [ ] All dependencies resolve without errors

## Step 3: Database Setup

### In Supabase Console:

1. Navigate to SQL Editor
2. Create donations table:
   ```sql
   CREATE TABLE donations (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     donor_name VARCHAR(255) NOT NULL,
     email VARCHAR(255) NOT NULL,
     phone VARCHAR(20),
     amount DECIMAL(10, 2) NOT NULL,
     campaign_id UUID REFERENCES campaigns(id),
     referral_code VARCHAR(20) REFERENCES users(referral_code),
     address TEXT,
     whatsapp_number VARCHAR(20),
     razorpay_order_id VARCHAR(255),
     razorpay_payment_id VARCHAR(255),
     razorpay_signature VARCHAR(255),
     payment_status VARCHAR(50) DEFAULT 'pending',
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

3. Create subscriptions table:
   ```sql
   CREATE TABLE subscriptions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     razorpay_subscription_id VARCHAR(255) UNIQUE NOT NULL,
     razorpay_plan_id VARCHAR(255) NOT NULL,
     donor_name VARCHAR(255) NOT NULL,
     email VARCHAR(255) NOT NULL,
     phone VARCHAR(20),
     campaign_id UUID REFERENCES campaigns(id),
     referral_code VARCHAR(20) REFERENCES users(referral_code),
     amount DECIMAL(10, 2),
     status VARCHAR(50),
     total_count INT,
     paid_count INT DEFAULT 0,
     current_start TIMESTAMP,
     current_end TIMESTAMP,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

4. Create fundraisers table (if not exists):
   ```sql
   CREATE TABLE IF NOT EXISTS fundraisers (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES users(id),
     referral_code VARCHAR(20) UNIQUE,
     total_raised DECIMAL(15, 2) DEFAULT 0,
     goal_amount DECIMAL(15, 2) DEFAULT 30000,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

- [ ] donations table created
- [ ] subscriptions table created
- [ ] fundraisers table created
- [ ] All tables have proper indexes
- [ ] Row Level Security policies configured

## Step 4: File Setup

- [ ] Copy/create `js/donateRoutes.js`
- [ ] Copy/create `js/authRoutes.js`
- [ ] Copy/create `js/donationsRoutes.js`
- [ ] Create `js/referralRoutes.js`
- [ ] Create `server-supabase.js`
- [ ] Backup old `server.js` to `server-mongodb.js`
- [ ] Update `server.js` or switch to `server-supabase.js`

## Step 5: Server Configuration

In your main `server.js` or `server-supabase.js`:

```javascript
// Import routes
const authRoutes = require('./js/authRoutes');
const donateRoutes = require('./js/donateRoutes');
const donationsRoutes = require('./js/donationsRoutes');
const referralRoutes = require('./js/referralRoutes');

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/donate', donateRoutes);
app.use('/api/donations', donationsRoutes);
app.use('/api/referral', referralRoutes);
```

- [ ] All routes imported
- [ ] All routes registered
- [ ] CORS configured for development
- [ ] Error handling middleware added

## Step 6: Testing - Donation Flow

### Test One-Time Donation:

1. Start server: `npm start`
2. Test public campaigns endpoint:
   ```bash
   curl http://localhost:3000/api/donate/public
   ```
   - [ ] Returns list of campaigns

3. Test create donation order:
   ```bash
   curl -X POST http://localhost:3000/api/donate \
     -H "Content-Type: application/json" \
     -d '{
       "donorName": "Test Donor",
       "amount": 50000,
       "email": "test@example.com",
       "phoneNumber": "9876543210"
     }'
   ```
   - [ ] Returns orderId
   - [ ] Order saved to Supabase

4. Verify payment (use test signature):
   ```bash
   curl -X POST http://localhost:3000/api/donate/verify \
     -H "Content-Type: application/json" \
     -d '{
       "razorpay_order_id": "<order_id>",
       "razorpay_payment_id": "pay_test123",
       "razorpay_signature": "<generated_signature>"
     }'
   ```
   - [ ] Signature verified
   - [ ] Payment status updated to "completed"

## Step 7: Testing - Referral Flow

### Test Referral System:

1. Create test intern account via signup
2. Get referral code from user profile
3. Test referral link:
   ```bash
   curl http://localhost:3000/api/donate/<REFERRAL_CODE>
   ```
   - [ ] Returns campaigns
   - [ ] Referral code validated

4. Make donation with referral code
5. Test referral stats:
   ```bash
   curl -H "Authorization: Bearer <JWT_TOKEN>" \
     http://localhost:3000/api/referral/stats
   ```
   - [ ] Returns referral statistics
   - [ ] Shows correct total_raised
   - [ ] Shows correct stipend (20%)

6. Test leaderboard:
   ```bash
   curl http://localhost:3000/api/referral/leaderboard
   ```
   - [ ] Returns ranked list
   - [ ] Correct calculations

## Step 8: Testing - Subscription Flow

1. Test create subscription:
   ```bash
   curl -X POST http://localhost:3000/api/donate/create-subscription \
     -H "Content-Type: application/json" \
     -d '{
       "donorName": "Test Subscriber",
       "email": "sub@example.com",
       "phoneNumber": "9876543210",
       "planId": "plan_TDRn7nEhvNXekF",
       "totalCount": 12
     }'
   ```
   - [ ] Returns subscriptionId
   - [ ] Subscription saved to DB

2. Test fetch subscriptions:
   ```bash
   curl "http://localhost:3000/api/donate/subscriptions?email=sub@example.com"
   ```
   - [ ] Returns subscription list
   - [ ] Shows correct status

3. Test cancel subscription:
   ```bash
   curl -X POST http://localhost:3000/api/donate/cancel-subscription \
     -H "Content-Type: application/json" \
     -d '{"subscriptionId": "<sub_id>"}'
   ```
   - [ ] Subscription cancelled
   - [ ] Status updated

## Step 9: Frontend Integration

- [ ] Add Razorpay script to HTML:
  ```html
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  ```

- [ ] Create donation form component
- [ ] Create leaderboard component
- [ ] Create referral link share component
- [ ] Test complete donation flow
- [ ] Test referral tracking
- [ ] Test subscription flow

## Step 10: Security Hardening

- [ ] Enable CORS only for trusted domains
- [ ] Add rate limiting to payment endpoints
- [ ] Implement request validation
- [ ] Add logging for payment events
- [ ] Set up error monitoring
- [ ] Configure database backups
- [ ] Enable encryption at rest
- [ ] Set up webhook security
- [ ] Test XSS/CSRF protections

## Step 11: Production Migration

- [ ] Update Razorpay keys to production
- [ ] Point to production Supabase instance
- [ ] Set up HTTPS certificates
- [ ] Configure production domain
- [ ] Update APP_URL to production
- [ ] Set up email notifications
- [ ] Configure logging service
- [ ] Set up monitoring/alerts
- [ ] Create backup strategy
- [ ] Document rollback procedure

## Step 12: Verification

### Final Checks:

- [ ] Donations recorded in Supabase
- [ ] Payments verified with signatures
- [ ] Referral codes tracked correctly
- [ ] Leaderboard calculates correctly
- [ ] Stipend calculations accurate (20%)
- [ ] Subscriptions renew on schedule
- [ ] All error cases handled
- [ ] Logs capture important events
- [ ] Performance acceptable
- [ ] Mobile responsiveness verified

## Quick Start Commands

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.development.local

# Update with your credentials
nano .env.development.local

# Start development server
npm start

# Test endpoints
npm run test

# Deploy to production
npm run deploy
```

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Razorpay key invalid | Verify keys in dashboard, check .env |
| Supabase connection fails | Check URL and credentials |
| Signature verification fails | Verify secret key matches |
| Referral code not found | Check if user exists, verify code format |
| Donations not saving | Check database connection, verify schema |
| Leaderboard empty | Ensure donations have status "completed" |
| Subscriptions not active | Check plan ID, verify Razorpay account |

## Support

For issues, refer to:
- **RAZORPAY_DONATION_SYSTEM.md** - Full API documentation
- **Razorpay Docs**: https://razorpay.com/docs
- **Supabase Docs**: https://supabase.com/docs

---

**Setup Status**: Ready for Production
**Last Updated**: July 19, 2026
**Version**: 1.0.0
