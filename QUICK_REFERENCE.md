# Quick Reference Guide

Fast lookup for commands, endpoints, and features while developing.

## Terminal Commands

### Backend (server/)

```bash
npm install              # Install dependencies
npm run dev             # Start development server (auto-reload)
npm start               # Start production server
npm test                # Run tests
npm run create-admin    # Create first admin user
npm run seed-demo       # Populate database with test data
```

### Frontend (client/)

```bash
npm install             # Install dependencies
npm run dev            # Start Vite dev server (http://localhost:3000)
npm run build          # Build for production
npm run preview        # Preview production build
```

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Purpose | Body |
|--------|----------|---------|------|
| POST | `/send-otp` | Send 6-digit OTP to phone | `{ phone }` |
| POST | `/verify-otp` | Verify OTP & auto-register citizen | `{ phone, otp, name?, email? }` |
| POST | `/google-auth` | Google OAuth auto-registration | `{ token, name, email }` |
| POST | `/admin-login` | Admin credentials login (no auto-register) | `{ email, password }` |
| POST | `/admin/create-credentials` | Create new admin (protected) | `{ email, password, name }` |
| GET | `/verify` | Verify JWT token validity | Headers: `Authorization: Bearer {token}` |
| POST | `/logout` | Logout & invalidate token | Headers: `Authorization: Bearer {token}` |

### Reports Routes (`/api/reports`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/` | Submit new report |
| GET | `/` | Get all reports (with filters) |
| GET | `/:id` | Get single report details |
| PUT | `/:id` | Update report |
| DELETE | `/:id` | Delete report |
| POST | `/:id/upvote` | Upvote report |
| GET | `/category/:category` | Get reports by category |

### Admin Routes (`/api/admin`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/stats` | Dashboard statistics (total, pending, resolved, users) |
| GET | `/reports` | All reports with admin context |
| PUT | `/reports/:id/assign` | Assign report to staff |
| PUT | `/reports/:id/status` | Update report status |
| PUT | `/reports/:id/resolve` | Mark report as resolved |

### Analytics Routes (`/api/analytics`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/by-category` | Reports grouped by category |
| GET | `/by-status` | Reports grouped by status |
| GET | `/by-date` | Reports grouped by date (time series) |
| GET | `/city/:city` | Analytics for specific city |

## Authentication Flow

### Citizen Login (Phone OTP)

```
1. Enter phone → POST /send-otp
2. Receive OTP in console/email
3. Enter OTP → POST /verify-otp
4. Auto-register if first login
5. Receive JWT token
6. Redirect to /dashboard
```

### Citizen Login (Google OAuth)

```
1. Click "Sign in with Google"
2. Google auth popup
3. Send token → POST /google-auth
4. Auto-register if first login
5. Receive JWT token
6. Redirect to /dashboard
```

### Admin Login

```
1. Enter email & password → POST /admin-login
2. NO auto-registration (credentials must exist first)
3. Receive JWT token
4. Redirect to /admin
```

## Database Collections

### Users Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  role: String,  // "citizen", "admin", "department_staff"
  password: String,  // bcrypt hashed
  googleId: String,  // for OAuth
  phoneVerified: Boolean,
  emailVerified: Boolean,
  profilePicture: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Reports Collection

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String,  // "road_damage", "garbage", "water_leakage", etc
  priority: String,  // "low", "medium", "high", "critical"
  status: String,    // "pending", "acknowledged", "in_progress", "resolved"
  location: {
    type: "Point",
    coordinates: [longitude, latitude],
    address: String,
    city: String,
    state: String
  },
  submittedBy: ObjectId,  // user ref
  images: [String],  // Cloudinary URLs
  upvotes: Number,
  upvoters: [ObjectId],
  assignedTo: ObjectId,  // staff member
  resolutionNotes: String,
  resolvedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Key Redux Slices

### authSlice

```javascript
{
  user: { id, name, email, role },
  token: String,
  isAuthenticated: Boolean,
  loading: Boolean,
  error: String
}
```

### reportSlice

```javascript
{
  reports: [Report],
  selectedReport: Report,
  myReports: [Report],
  loading: Boolean,
  error: String,
  filters: { status, category, city }
}
```

## Development Workflow

### 1. Start All Services

**Terminal 1 - Backend**:
```bash
cd server
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 - Frontend**:
```bash
cd client
npm run dev
# Runs on http://localhost:3000 (hot reload enabled)
```

**Terminal 3 - MongoDB** (if local):
```bash
mongosh
# or open MongoDB Compass GUI
```

### 2. Test a Feature

- Make code changes (auto-reloads with Vite)
- Open DevTools (F12 → Console/Network)
- Check network requests in "Network" tab
- Check Redux state in browser console: `localStorage.getItem('persist:auth')`

### 3. Debug Issues

- **Backend logs**: Check terminal where `npm run dev` runs
- **Frontend logs**: Check browser console (F12)
- **Network errors**: Check XHR requests in Network tab
- **Database**: Use MongoDB Compass or `mongosh`

## Environment Variables Quick Ref

### Backend `.env`

```
MONGODB_LOCAL=mongodb://localhost:27017/civic-issue
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=development
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app-password
CLOUDINARY_NAME=xxx
CLOUDINARY_KEY=xxx
CLOUDINARY_SECRET=xxx
```

### Frontend `.env`

```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=xxx
```

## Common Tasks

### Create Test Admin

```bash
cd server
npm run create-admin
# Follow prompts to set email/password
```

### Add Sample Data

```bash
cd server
npm run seed-demo
# Creates 3 citizens + 4 reports
```

### Clear MongoDB

```javascript
// In mongosh
use civic-issue
db.users.deleteMany({})
db.reports.deleteMany({})
```

### Test OTP Endpoint

```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'
```

### Get JWT Token

```bash
# After login, token stored in localStorage
localStorage.getItem('token')

# Use in API calls
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/admin/stats
```

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| ECONNREFUSED 27017 | MongoDB not running | `brew services start mongodb-community` |
| EADDRINUSE 5000 | Port occupied | `PORT=5001 npm run dev` |
| CORS error | Frontend/backend mismatch | Check `VITE_API_URL` matches backend URL |
| Token invalid | Expired or corrupted | Clear localStorage, re-login |
| OTP not received | Email/SMS not configured | Check server console for OTP |
| Cannot find module | Dependency missing | `npm install` in that directory |

## Useful Links

- [Express Docs](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [React Docs](https://react.dev/)
- [Redux Docs](https://redux.js.org/)
- [Vite Docs](https://vitejs.dev/)
- [JWT.io](https://jwt.io/)

---

**Pro Tips**:
- 💡 Use Redux DevTools extension for better state debugging
- 💡 Use Postman for API testing before building frontend
- 💡 Check browser DevTools Network tab for request/response inspection
- 💡 Use `console.log()` strategically in Redux reducers to trace state changes
- 💡 Test on mobile device by visiting `http://YOUR_IP:3000` from phone
