# Authentication & Dashboards Setup Guide

## Overview

The Civic Issue Reporter system has been configured with three authentication methods:

1. **Phone-based OTP Authentication** - For citizens (auto-registration on first login)
2. **Google OAuth 2.0** - For citizens (quick login, auto-registration)
3. **Admin Credentials** - Manual setup only (no auto-registration)

---

## 🔑 Part 1: Authentication Methods

### 1.1 Phone OTP Authentication

#### How It Works:
- Citizens enter their phone number
- System sends a 6-digit OTP (for development, OTP is logged to console)
- User enters OTP to verify
- On first login, user provides name and optional email
- **Auto-registered as a citizen** in the system

#### Backend Endpoints:
```
POST /api/auth/send-otp
Body: { phone: "+91xxxxxxxxxx" }
Response: { success: true, message: "OTP sent", otp: "123456" } (only in dev)

POST /api/auth/verify-otp
Body: { phone, otp, name, email }
Response: { success: true, token, user }
```

#### For Production:
To send actual SMS, integrate Twilio (already in dependencies):

```javascript
// In auth.routes.js - replace email sending with SMS
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

client.messages.create({
  body: `Your OTP is: ${otp}`,
  from: process.env.TWILIO_PHONE_NUMBER,
  to: phone
});
```

---

### 1.2 Google OAuth 2.0 Authentication

#### How It Works:
- Citizen clicks "Sign in with Google"
- Google authentication popup appears
- User logs in with Gmail
- **Auto-registered as a citizen** if first time
- Profile picture and email automatically synced

#### Frontend Setup:

1. Install Google Sign-In library in `client/public/index.html`:
```html
<script async defer src="https://accounts.google.com/gsi/client"></script>
```

2. Create Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 Credentials (Web Application)
   - Add authorized JavaScript origins: `http://localhost:3000`, `http://localhost:5173`
   - Add authorized redirect URIs
   - Copy Client ID

3. Update `client/.env`:
```
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

4. Implement Google Sign-In button in `LoginPage.jsx`:
```javascript
<div
  id="g_id_onload"
  data-client_id="YOUR_CLIENT_ID"
  data-callback="handleGoogleLogin"
></div>
<div className="g_id_signin" data-type="standard"></div>

<script src="https://accounts.google.com/gsi/client" async defer></script>
```

#### Backend Endpoints:
```
POST /api/auth/google-auth
Body: { googleId, email, name, picture, phoneNumber }
Response: { success: true, token, user, isNewUser: true/false }
```

---

### 1.3 Admin Credentials (Manual Entry Only)

#### How It Works:
- **NO auto-registration for admin accounts**
- Admin credentials must be manually created via database or API
- Admin can only login via email + password
- Admin cannot login via OAuth or OTP methods

#### Create Admin Credentials:

**Option 1: Via API Endpoint** (requires existing admin token):
```
POST /api/auth/admin/create-credentials
Authorization: Bearer <existing_admin_token>
Body: {
  email: "admin@civicissue.com",
  username: "admin", // optional
  password: "secure_password",
  adminName: "Municipal Administrator"
}
```

**Option 2: Via MongoDB Direct (Initial Setup)**:
```javascript
// Connect to MongoDB and insert admin user
db.users.insertOne({
  name: "Municipal Administrator",
  email: "admin@civicissue.com",
  password: "$2a$10$...", // bcrypt hashed password
  role: "admin",
  emailVerified: true,
  isActive: true,
  createdAt: new Date()
})
```

**Option 3: Via Backend CLI Script**:

Create `server/scripts/create-admin.js`:
```javascript
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_LOCAL);
  
  const admin = new User({
    name: 'Municipal Administrator',
    email: process.env.ADMIN_EMAIL || 'admin@civicissue.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123',
    role: 'admin',
    emailVerified: true,
  });
  
  await admin.save();
  console.log('Admin created:', admin.email);
  process.exit();
}

createAdmin();
```

Run: `node server/scripts/create-admin.js`

#### Admin Login Endpoint:
```
POST /api/auth/admin-login
Body: { email: "admin@civicissue.com", password: "password" }
Response: { success: true, token, user: { id, name, email, role } }
```

---

## 📊 Part 2: User Dashboards

### 2.1 Citizen Dashboard

#### Features:
- **Live Map View** - Interactive map showing all reported issues in the city
- **My Reports** - Track submissions and their resolution status
- **New Report** - Submit civic issues with photo, location, and description
- **Report Cards** - View details, upvote, and comment on other reports
- **Statistics** - Track personal contributions (reports submitted, upvotes received)

#### Pages:
- `/dashboard` - Main citizen dashboard (redirects to CitizenDashboard.jsx)
- Navigation: Map → My Reports → New Report

#### Key Components:
- **Issue Card** - Shows report title, category, status, upvotes
- **Report Form** - Submit new issues with auto-location detection
- **Map Integration** - Leaflet.js with markers for all reports
- **Status Tracking** - Monitor from pending → acknowledged → resolved

#### User Flow:
1. Login with phone/Google
2. Auto-registered as citizen
3. View home dashboard with map
4. Submit new report with location auto-detection
5. Track report status
6. Receive notifications on resolution

---

### 2.2 Admin Dashboard

#### Features:
- **Statistics Overview** - Total reports, pending, resolved, users
- **All Reports View** - Filterable table of all citizen submissions
- **Report Management** - View, assign, and mark issues as resolved
- **Resolution Notes** - Add notes when resolving issues
- **Analytics** - Charts for reports by category/status, response times
- **Quick Actions** - View reports, send notifications, export data

#### Pages:
- `/admin` - Main admin dashboard

#### Navigation Tabs:
1. **Dashboard** - Stats overview and quick actions
2. **All Reports** - Filterable table with report details
3. **Analytics** - Charts and metrics (coming soon)

#### Key Features:
- **Real-time Stats** - Total reports, pending count, resolution rate
- **Filtering** - By status, category, date range
- **Assign Reports** - Assign to department staff
- **Mark Resolved** - Add resolution notes and closure
- **Progress Bar** - Visual representation of resolution rate

#### Admin Access:
- Only users with `role: 'admin'` can access `/admin`
- Admin credentials required (no OAuth/OTP for admin)
- Protected route redirects non-admin users to home

---

## 🚀 Part 3: Getting Started

### 3.1 Quick Start - Development

**Terminal 1 - MongoDB**:
```bash
# Option A: Local MongoDB
mongod

# Option B: MongoDB Atlas (Cloud)
# Update MONGODB_URI in .env with your connection string
```

**Terminal 2 - Backend**:
```bash
cd server
npm install
cp .env.example .env

# Edit .env with your configurations:
# - MONGODB_LOCAL or MONGODB_URI
# - JWT_SECRET
# - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (optional)
# - SMTP settings for email (optional)

# Create initial admin user
node scripts/create-admin.js

npm run dev
# Server running on http://localhost:5000
```

**Terminal 3 - Frontend**:
```bash
cd client
npm install
cp .env.example .env

# Edit .env with:
# VITE_API_BASE_URL=http://localhost:5000/api
# VITE_GOOGLE_CLIENT_ID=your_client_id (optional)

npm run dev
# Frontend running on http://localhost:3000
```

### 3.2 First-Time Setup Checklist

- [ ] Create MongoDB database (local or Atlas)
- [ ] Copy `.env.example` to `.env` in both `server/` and `client/`
- [ ] Configure MongoDB connection string
- [ ] Generate JWT secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] Set up Gmail SMTP (enable 2FA, create app password)
- [ ] Create Google OAuth credentials (optional)
- [ ] Create initial admin user
- [ ] Install dependencies: `npm install` in server and client
- [ ] Start MongoDB
- [ ] Start server and client
- [ ] Test phone OTP login
- [ ] Test admin login
- [ ] Test citizen dashboard

---

## 🔐 Part 4: Security Best Practices

### Development vs Production

**Development (.env):**
```
NODE_ENV=development
MONGODB_LOCAL=mongodb://localhost:27017/civic-issue-db
JWT_SECRET=dev_secret_key
```

**Production (.env):**
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=<strong_random_string_32_chars>
CORS_ORIGIN=https://yourdomain.com
```

### Key Security Points:

1. **JWT Secret**: Use strong, random value (32+ characters)
2. **Password Hashing**: Bcrypt with 10 salt rounds (already configured)
3. **OTP Expiry**: 10 minutes (configurable)
4. **Rate Limiting**: Implement to prevent brute force attacks
5. **HTTPS**: Use SSL certificates in production
6. **Admin Access**: Never expose admin creation endpoint in production
7. **Token Storage**: Client-side localStorage (consider httpOnly cookies for enhanced security)

---

## 📱 Part 5: API Documentation

### Authentication Endpoints

#### Phone OTP
```
POST /api/auth/send-otp
POST /api/auth/verify-otp
```

#### Google OAuth
```
POST /api/auth/google-auth
```

#### Admin
```
POST /api/auth/admin-login
POST /api/auth/admin/create-credentials (admin only)
```

#### General
```
GET /api/auth/verify
POST /api/auth/logout
```

### Report Endpoints
```
GET /api/reports
POST /api/reports
GET /api/reports/:id
PATCH /api/reports/:id/status
POST /api/reports/:id/upvote
```

### Admin Endpoints
```
GET /api/admin/reports
PATCH /api/admin/reports/:id/assign
PATCH /api/admin/reports/:id/resolve
GET /api/admin/stats
```

---

## 🛠️ Part 6: Troubleshooting

### Common Issues

**"OTP not received"**
- Development: Check server console for OTP
- Production: Verify Twilio credentials
- Check SMTP settings for email sending

**"Google login not working"**
- Verify Client ID in localStorage
- Check CORS_ORIGIN settings
- Ensure redirect URIs match in Google Console

**"Admin login failing"**
- Verify admin user exists in database
- Check password hashing
- Ensure role is "admin"

**"Token expired"**
- JWT_EXPIRE setting controls token lifetime
- Default: 7 days
- Implement refresh token logic for longer sessions

---

## 📞 Support

For issues or questions:
1. Check console for error messages
2. Verify all `.env` variables are set
3. Test API endpoints using Postman
4. Check database connectivity

---

## 📚 Additional Resources

- [JWT Documentation](https://jwt.io/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Twilio SMS API](https://www.twilio.com/docs/sms)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Bcrypt Documentation](https://github.com/dcodeIO/bcrypt.js)

---

**Last Updated**: May 24, 2026
**Version**: 1.0
**Status**: Ready for Development
