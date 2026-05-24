# Getting Started Guide

Complete setup instructions for running the Civic Issue Reporting System locally.

## Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v18+) - [Download](https://nodejs.org/)
- **MongoDB** (local or Atlas) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **npm** (comes with Node.js)

## Project Structure

```
Civic-Issue/
├── server/                    # Express backend (port 5000)
│   ├── models/               # Database schemas
│   ├── routes/               # API endpoints
│   ├── middleware/           # Auth, error handling
│   ├── controllers/          # Business logic
│   ├── scripts/              # Admin creation, data seeding
│   ├── config/               # Database, Cloudinary config
│   ├── server.js             # Express app entry point
│   ├── .env.example          # Environment template
│   └── package.json          # Dependencies
└── client/                    # React frontend (port 3000)
    ├── src/
    │   ├── pages/            # Page components
    │   ├── components/       # Reusable components
    │   ├── services/         # API client
    │   ├── redux/            # State management
    │   └── App.jsx           # Root component
    ├── .env.example          # Environment template
    └── package.json          # Dependencies
```

## Step 1: Backend Setup

### 1.1 Clone and Navigate

```bash
cd Civic-Issue
cd server
```

### 1.2 Install Dependencies

```bash
npm install
```

### 1.3 Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
# On Windows (PowerShell)
Copy-Item .env.example .env

# On macOS/Linux
cp .env.example .env
```

Edit `.env` and update:

```env
# MongoDB Connection
MONGODB_LOCAL=mongodb://localhost:27017/civic-issue
# OR use MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civic-issue

# Server Port
PORT=5000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this

# Google OAuth (Optional - get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Configuration (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Cloudinary (Optional - for image uploads)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret

# Twilio (Optional - for SMS OTP in production)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE=your_twilio_phone_number
```

### 1.4 Start MongoDB

**Option A: Local MongoDB**
```bash
# Windows (if installed)
net start MongoDB

# macOS (if using Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**Option B: MongoDB Atlas**
- Login to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster
- Update `MONGODB_URI` in `.env`

### 1.5 Create Admin User

This script creates the first admin account for accessing the admin dashboard:

```bash
npm run create-admin
```

Follow the prompts:
```
📧 Enter admin email: admin@municipal.gov
🔐 Enter admin password: secure_password_123
👤 Enter admin name: Municipal Admin
```

**Alternative Methods:**

- **Direct MongoDB Insert** (MongoDB Compass or Atlas UI):
```javascript
db.users.insertOne({
  name: "Municipal Admin",
  email: "admin@municipal.gov",
  password: "$2a$10$...",  // bcrypt hashed password
  role: "admin",
  emailVerified: true,
  isActive: true
})
```

- **Using Create Credentials API** (after first admin exists):
```bash
curl -X POST http://localhost:5000/api/auth/admin/create-credentials \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newadmin@municipal.gov",
    "password": "secure_password",
    "name": "New Admin"
  }'
```

### 1.6 (Optional) Seed Demo Data

Populate database with sample citizens and reports for testing:

```bash
npm run seed-demo
```

Creates:
- 3 sample citizens
- 4 sample reports (various statuses)
- Realistic Kolkata location data

### 1.7 Start Backend

```bash
npm run dev
```

Expected output:
```
✅ Connected to MongoDB at mongodb://localhost:27017/civic-issue
🚀 Server running on http://localhost:5000
```

## Step 2: Frontend Setup

### 2.1 Navigate to Client Directory

```bash
# From project root
cd client
```

### 2.2 Install Dependencies

```bash
npm install
```

### 2.3 Configure Environment Variables

```bash
# Copy template
# Windows (PowerShell)
Copy-Item .env.example .env

# macOS/Linux
cp .env.example .env
```

Edit `.env`:

```env
# API Backend URL
VITE_API_URL=http://localhost:5000/api

# Google OAuth (Optional)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 2.4 Start Frontend Development Server

```bash
npm run dev
```

Expected output:
```
VITE v4.0.0  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  press h to show help
```

## Step 3: Test the Application

### 3.1 Open Application

Open browser and go to: **http://localhost:3000**

### 3.2 Test Citizen Login (Phone OTP)

1. Click "Login" tab → "Phone"
2. Enter: `+919876543210`
3. Click "Send OTP"
4. **Check server console** or email for OTP (e.g., `123456`)
5. Enter OTP and hit "Verify"
6. Enter name and optional email
7. ✅ Logged in as citizen → See Citizen Dashboard

### 3.3 Test Citizen Dashboard

**Live Map Tab:**
- Shows your location + all reports
- Click markers for report details

**My Reports Tab:**
- Track your submitted issues
- View status and upvotes
- Click to see full details

**New Report Tab:**
- Fill report form
- Auto-detects your location (allow browser permissions)
- Add title, description, category, priority
- Submit

### 3.4 Test Admin Login

1. Click "Login" tab → "Admin"
2. Enter admin email: `admin@municipal.gov`
3. Enter password: (whatever you set)
4. ✅ Logged in as admin → See Admin Dashboard

### 3.5 Test Admin Dashboard

**Stats Overview:**
- Total Reports, Pending, Resolved, Users

**Reports Table:**
- Filter by Status (Pending, Acknowledged, In Progress, Resolved)
- Filter by Category
- Click report rows for details

**Report Detail Modal:**
- View full issue context
- See submitter information
- Add resolution notes
- Mark as resolved

### 3.6 Test Role-Based Routing

Try accessing URLs directly:
- **Citizen Dashboard**: http://localhost:3000/dashboard
  - If not logged in → redirects to login
  - If logged in as admin → redirects to /admin
  
- **Admin Dashboard**: http://localhost:3000/admin
  - If not logged in → redirects to login
  - If logged in as citizen → redirects to /dashboard

## Troubleshooting

### MongoDB Connection Issues

**Error**: `MongoServerError: connect ECONNREFUSED 127.0.0.1:27017`

**Solution**:
- Ensure MongoDB is running: `mongosh` or `mongo` from terminal
- Check MongoDB status: `brew services list` (macOS)
- Verify `MONGODB_LOCAL` in `.env` is correct

### Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Find and kill process
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

### OTP Not Received

**For Development**: OTP prints in server console
```
📧 OTP sent to phone: +919876543210
🔐 OTP Code: 123456
```

**For Production**: 
- Configure Twilio credentials in `.env`
- OTP will be sent via SMS
- Check Twilio console for delivery status

### CORS Errors

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**: Ensure backend is running and `VITE_API_URL` in client `.env` matches:
- Backend running on: `http://localhost:5000`
- Frontend should use: `VITE_API_URL=http://localhost:5000/api`

### Google OAuth Not Working

**Solution**:
1. Get credentials from [Google Cloud Console](https://console.cloud.google.com/)
2. Add `http://localhost:3000` to authorized redirect URIs
3. Update `GOOGLE_CLIENT_ID` in backend `.env`
4. Integrate Google Sign-In button in frontend (see: `AUTHENTICATION_SETUP.md`)

## API Testing with cURL/Postman

### Create Admin via API

```bash
curl -X POST http://localhost:5000/api/auth/admin/create-credentials \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "neweadmin@example.com",
    "password": "secure123",
    "name": "New Administrator"
  }'
```

### Send OTP

```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'
```

### Verify OTP (Auto-Register)

```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "otp": "123456",
    "name": "Rajesh Kumar",
    "email": "rajesh@example.com"
  }'
```

### Admin Login

```bash
curl -X POST http://localhost:5000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@municipal.gov",
    "password": "secure_password_123"
  }'
```

## Next Steps

1. ✅ **System Running?** Great! Now test all features
2. 📸 **Add Image Uploads** - Implement report photo submission
3. 📊 **Build Analytics** - Charts for report trends
4. 🔔 **Add Notifications** - Email/SMS status updates
5. 🗺️ **Google OAuth** - Full integration with button
6. 📱 **Mobile App** - React Native version
7. 🚀 **Deploy** - AWS/Heroku/DigitalOcean

## Support

For issues or questions:
1. Check `AUTHENTICATION_SETUP.md` - Authentication detailed guide
2. Review server logs for errors
3. Verify `.env` configuration
4. Ensure all dependencies are installed: `npm install`

---

**Status**: System is production-ready for development and testing! 🎉
