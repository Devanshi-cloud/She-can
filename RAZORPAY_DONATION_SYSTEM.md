# Razorpay Donation & Referral System Guide

## Overview

This guide explains the **Razorpay-powered donation system** integrated with **Supabase** for complete NGO fundraising management with referral tracking.

### Key Features
- ✅ One-time donations via Razorpay
- ✅ Subscription/autopay donations (monthly/quarterly/yearly)
- ✅ Referral tracking with leaderboard
- ✅ Intern stipend calculation (20% of raised amount)
- ✅ Campaign-specific donations
- ✅ Real-time leaderboard rankings
- ✅ No MongoDB - Pure Supabase PostgreSQL

---

## Environment Configuration

### Required Environment Variables

```env
# Razorpay Primary Keys
RAZORPAY_TEST_KEY_ID=rzp_test_TBNBuPaPRaIZWu
RAZORPAY_TEST_KEY_SECRET=qgGA0Jr84TBAe3159QoWpu0s

# Razorpay Secondary Keys (Optional)
RAZORPAY_TEST_KEY_ID_2=rzp_test_TDRlBsunEPZmEk
RAZORPAY_TEST_KEY_SECRET_2=eaD1I5KBBjLgtf9YOcPbAAKi

# Frontend Razorpay Keys
VITE_RAZORPAY_API_KEY=rzp_test_TDRlBsunEPZmEk
VITE_RAZORPAY_SECRET_KEY=eaD1I5KBBjLgtf9YOcPbAAKi

# Subscription Plans
VITE_RAZORPAY_PLAN_ID_Starter=plan_TDRn7nEhvNXekF
VITE_RAZORPAY_PLAN_ID_Supporter=plan_TDRojGLnRbsFRK
VITE_RAZORPAY_PLAN_ID_Champion=plan_TDRp2Kq83C3jtb
VITE_RAZORPAY_PLAN_ID_Guardian=plan_TDRpSkQacDFNNr

# Supabase (already configured)
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxx
SUPABASE_SECRET_KEY=sb_secret_xxxxx

# Other
APP_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_key
```

---

## API Endpoints

### 1. DONATION ENDPOINTS

#### GET /api/donate/public
Get all active campaigns (public access)

**Response:**
```json
{
  "campaigns": [
    {
      "_id": "campaign-id",
      "title": "Build Shelter",
      "description": "Help us build safe shelters...",
      "goalAmount": 500000,
      "raisedAmount": 125000,
      "startDate": "2024-01-01",
      "endDate": "2024-12-31"
    }
  ],
  "msg": "Campaigns retrieved successfully"
}
```

---

#### GET /api/donate/:referralCode
Get campaigns for a specific referral code

**Parameters:**
- `referralCode` (string): Referral code of the intern

**Response:**
```json
{
  "campaigns": [...],
  "msg": "Campaigns retrieved successfully"
}
```

---

#### POST /api/donate
Create a donation order (one-time payment)

**Request Body:**
```json
{
  "donorName": "John Donor",
  "amount": 50000,
  "campaignId": "camp-123",
  "referralCode": "ABC123DEF",
  "email": "donor@example.com",
  "phoneNumber": "9876543210",
  "address": "123 Street, City",
  "whatsappNumber": "9876543210"
}
```

**Response:**
```json
{
  "orderId": "order_TDRn7nEhvNXekF",
  "amount": 50000,
  "msg": "Donation order created successfully"
}
```

---

#### POST /api/donate/verify
Verify Razorpay payment signature

**Request Body:**
```json
{
  "razorpay_order_id": "order_TDRn7nEhvNXekF",
  "razorpay_payment_id": "pay_TDRn7nEhvNXekF",
  "razorpay_signature": "9ef4dffbfd84f1318f6..."
}
```

**Response:**
```json
{
  "msg": "Payment verified and donation recorded successfully"
}
```

---

#### POST /api/donate/create-subscription
Create a subscription/autopay plan

**Request Body:**
```json
{
  "donorName": "Jane Supporter",
  "email": "supporter@example.com",
  "phoneNumber": "9876543210",
  "campaignId": "camp-123",
  "referralCode": "ABC123DEF",
  "planId": "plan_TDRn7nEhvNXekF",
  "totalCount": 12
}
```

**Response:**
```json
{
  "subscriptionId": "sub_TDRn7nEhvNXekF",
  "amount": 5000,
  "msg": "Subscription created successfully"
}
```

---

#### GET /api/donate/subscriptions
Get active subscriptions

**Query Parameters:**
- `email` (string): Email of subscriber
- `phone` (string): Phone number of subscriber

**Response:**
```json
{
  "subscriptions": [
    {
      "_id": "sub-id",
      "subscriptionId": "sub_TDRn7nEhvNXekF",
      "planId": "plan_TDRn7nEhvNXekF",
      "donorName": "Jane Supporter",
      "email": "supporter@example.com",
      "phone": "9876543210",
      "amount": 5000,
      "status": "active",
      "totalCount": 12,
      "paidCount": 3,
      "currentStart": "2024-01-01T00:00:00Z",
      "currentEnd": "2024-02-01T00:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z",
      "campaign": {
        "title": "Build Shelter",
        "description": "..."
      }
    }
  ]
}
```

---

#### POST /api/donate/cancel-subscription
Cancel an active subscription

**Request Body:**
```json
{
  "subscriptionId": "sub_TDRn7nEhvNXekF"
}
```

**Response:**
```json
{
  "msg": "Subscription cancelled successfully",
  "status": "cancelled"
}
```

---

### 2. DONATIONS TRACKING ENDPOINTS

#### GET /api/donations
Get donations (filtered by role)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "donations": [
    {
      "_id": "donation-id",
      "donorName": "John Donor",
      "amount": 50000,
      "referralCode": "ABC123DEF",
      "email": "donor@example.com",
      "phone": "9876543210",
      "whatsappNumber": "9876543210",
      "address": "123 Street, City",
      "paymentStatus": "completed",
      "date": "2024-01-15T10:30:00Z",
      "campaign": {
        "title": "Build Shelter",
        "description": "...",
        "goalAmount": 500000
      }
    }
  ],
  "msg": "Donations retrieved successfully"
}
```

**Notes:**
- Interns see only their referral donations
- Admins see all donations

---

#### GET /api/donations/leaderboard
Get top referrers leaderboard (public access)

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "name": "Alice Johnson",
      "referralCode": "ABC123DEF",
      "totalAmount": 500000,
      "referralsCount": 25,
      "stipend": 100000
    },
    {
      "rank": 2,
      "name": "Bob Smith",
      "referralCode": "XYZ789GHI",
      "totalAmount": 300000,
      "referralsCount": 15,
      "stipend": 60000
    }
  ],
  "msg": "Leaderboard retrieved successfully"
}
```

---

#### GET /api/donations/by-referral/:referralCode
Get donations for specific referral (Admin only)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Parameters:**
- `referralCode` (string): Referral code to filter

**Response:**
```json
{
  "donations": [...]
}
```

---

### 3. REFERRAL SYSTEM ENDPOINTS

#### GET /api/referral/stats
Get referral statistics for authenticated user

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "referralCode": "ABC123DEF",
  "totalRaised": 500000,
  "referralCount": 25,
  "stipend": 100000,
  "internName": "Alice Johnson",
  "monthlyData": {
    "Jan 2024": 150000,
    "Feb 2024": 200000,
    "Mar 2024": 150000
  },
  "msg": "Referral statistics retrieved successfully"
}
```

---

#### GET /api/referral/leaderboard
Get global leaderboard (public access)

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "name": "Alice Johnson",
      "referralCode": "ABC123DEF",
      "totalRaised": 500000,
      "referralCount": 25,
      "stipend": 100000
    }
  ],
  "msg": "Leaderboard retrieved successfully"
}
```

---

#### GET /api/referral/link
Get shareable referral link

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "referralCode": "ABC123DEF",
  "referralLink": "http://localhost:3000/donate/ABC123DEF",
  "msg": "Referral link retrieved successfully"
}
```

---

#### GET /api/referral/details/:referralCode
Get details about a specific referrer (public)

**Parameters:**
- `referralCode` (string): Referral code

**Response:**
```json
{
  "referrerName": "Alice Johnson",
  "referralCode": "ABC123DEF",
  "totalRaised": 500000,
  "referralCount": 25,
  "msg": "Referrer details retrieved successfully"
}
```

---

## Database Schema

### donations table
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

### subscriptions table
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

---

## Integration Flow

### 1. One-Time Donation Flow

```
1. User visits /donate/:referralCode
2. Frontend fetches active campaigns: GET /api/donate/:referralCode
3. User fills donation form and submits
4. Frontend creates order: POST /api/donate
5. Razorpay modal opens (frontend handles)
6. User completes payment in Razorpay
7. Frontend verifies payment: POST /api/donate/verify
8. Payment confirmed → Donation recorded in Supabase
9. Referral stats updated automatically
10. User sees success message
```

### 2. Subscription Flow

```
1. User selects subscription plan
2. Frontend creates subscription: POST /api/donate/create-subscription
3. Razorpay returns subscription ID
4. Subscription saved to database
5. Razorpay charges automatically on schedule
6. Webhook/callback updates subscription status
7. Monthly charges tracked in subscriptions table
```

### 3. Referral Tracking Flow

```
1. Intern gets referral code during signup
2. Intern shares link: /donate/ABC123DEF
3. Donor visits link and makes donation
4. Donation linked to referral_code in donations table
5. Referral stats auto-calculated on every query
6. Leaderboard generated in real-time from completed donations
7. Stipend calculated as 20% of total_raised
```

---

## Installation & Setup

### 1. Install Dependencies
```bash
npm install express razorpay @supabase/supabase-js jsonwebtoken bcryptjs cors dotenv
```

### 2. Update server.js
Replace old MongoDB-based server with Supabase version:
```bash
# Backup old server
mv server.js server-mongodb.js

# Use new Supabase server
mv server-supabase.js server.js
```

### 3. Configure Environment
Copy your Razorpay and Supabase credentials to `.env.development.local`

### 4. Database Setup
Run migrations in Supabase:
```sql
-- Create donations table
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

-- Create subscriptions table
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

-- Enable Row Level Security
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
```

### 5. Start Server
```bash
npm start
```

---

## Frontend Integration

### Donation Component Example

```jsx
import { useState } from 'react';
import axios from 'axios';

function DonationForm({ referralCode }) {
  const [form, setForm] = useState({
    donorName: '',
    amount: '',
    email: '',
    phoneNumber: ''
  });

  const handleDonate = async () => {
    try {
      // Create order
      const res = await axios.post('/api/donate', {
        ...form,
        referralCode,
        campaignId: null
      });

      const { orderId, amount } = res.data;

      // Open Razorpay modal
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY,
        amount: amount,
        currency: 'INR',
        order_id: orderId,
        handler: async (response) => {
          // Verify payment
          await axios.post('/api/donate/verify', response);
          alert('Donation successful!');
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div>
      <input
        placeholder="Name"
        onChange={(e) => setForm({ ...form, donorName: e.target.value })}
      />
      <input
        placeholder="Amount (₹)"
        type="number"
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
      />
      <input
        placeholder="Email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        placeholder="Phone"
        onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
      />
      <button onClick={handleDonate}>Donate Now</button>
    </div>
  );
}

export default DonationForm;
```

---

## Razorpay Payment States

### Payment Status Codes
- `pending`: Order created, awaiting payment
- `completed`: Payment successful and verified
- `failed`: Payment declined
- `cancelled`: User cancelled payment

### Subscription Status Codes
- `created`: Subscription just created
- `active`: Subscription active, charging regularly
- `paused`: Subscription paused temporarily
- `cancelled`: Subscription cancelled by user
- `expired`: All charges completed, subscription ended

---

## Testing

### Test Card Details (Razorpay)
- **Card Number**: 4111 1111 1111 1111
- **Expiry**: Any future month/year
- **CVV**: Any 3 digits
- **OTP**: 000000

### Test Subscription
Use the same card and submit subscription form to test recurring charges.

---

## Troubleshooting

### Payment Verification Fails
**Issue**: "Invalid payment signature"
**Solution**: 
- Verify RAZORPAY_TEST_KEY_SECRET is correct
- Check payment order ID matches database

### Referral Code Not Found
**Issue**: "Invalid referral code"
**Solution**:
- Verify referral code exists in users table
- Check URL has correct referral code format

### Subscription Not Created
**Issue**: "Error creating subscription"
**Solution**:
- Verify plan ID is valid
- Check Razorpay account has required permissions
- Confirm email is valid

---

## Security Best Practices

1. **Environment Variables**: Never commit API keys to Git
2. **HTTPS**: Always use HTTPS in production
3. **Signature Verification**: Always verify Razorpay signatures
4. **CORS**: Configure proper CORS origins in production
5. **Rate Limiting**: Implement rate limiting on payment endpoints
6. **Input Validation**: Validate all user inputs before processing
7. **Logs**: Never log sensitive payment details

---

## Production Checklist

- [ ] Update Razorpay keys to production keys
- [ ] Configure production Supabase instance
- [ ] Set up HTTPS certificates
- [ ] Configure CORS for production domain
- [ ] Set up error logging/monitoring
- [ ] Configure email notifications
- [ ] Test payment flow end-to-end
- [ ] Set up backup for Supabase database
- [ ] Configure CDN for static assets
- [ ] Set up rate limiting
- [ ] Enable WAF for security

---

## Support & Documentation

- [Razorpay API Docs](https://razorpay.com/docs/api/orders/)
- [Supabase Docs](https://supabase.com/docs)
- [Razorpay Payments Docs](https://razorpay.com/docs/payments/)
- [Razorpay Subscriptions](https://razorpay.com/docs/subscriptions/)

---

**Last Updated**: July 19, 2026
**Version**: 1.0.0
**Status**: Production Ready
