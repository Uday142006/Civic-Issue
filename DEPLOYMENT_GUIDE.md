# 🚀 COMPLETE DEPLOYMENT & TESTING GUIDE

## ✅ System Status: PRODUCTION READY

All features are fully implemented and tested. This guide will help you deploy and verify the complete system.

---

## 📋 PRE-DEPLOYMENT SETUP

### 1. Environment Variables Configuration

#### **server/.env**
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civic-issues
DB_NAME=civic_issues_db

# JWT
JWT_SECRET=your_jwt_secret_key_here_min_32_chars
JWT_EXPIRE=7d

# Cloudinary (Image/Video Storage)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Email (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# SMS (Optional - Twilio)
TWILIO_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE=+1234567890
```

#### **client/.env**
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_UPLOAD_URL=http://localhost:5000/api

# Cloudinary Configuration
VITE_CLOUDINARY_NAME=your_cloudinary_name
VITE_CLOUDINARY_KEY=your_cloudinary_key
VITE_CLOUDINARY_UPLOAD_PRESET=civic_reports

# App Configuration
VITE_APP_NAME=Civic Issue Reporter
VITE_APP_VERSION=1.0.0
```

---

## 🔧 INSTALLATION STEPS

### Step 1: Install Server Dependencies
```bash
cd server
npm install

# Expected packages installed:
# - express, mongoose, cors
# - jsonwebtoken, bcryptjs
# - socket.io
# - cloudinary
# - twilio (optional)
# - etc.
```

### Step 2: Install Client Dependencies
```bash
cd ../client
npm install

# Expected packages installed:
# - react, react-dom, react-router-dom
# - axios, redux, react-redux
# - leaflet, react-leaflet
# - recharts
# - socket.io-client
# - etc.
```

### Step 3: Create Admin User (Optional)
```bash
cd server
node scripts/create-admin.js

# Follow prompts to create admin account
# Admin email: admin@example.com
# Admin name: Admin User
```

### Step 4: Seed Demo Data (Optional)
```bash
node scripts/seed-demo.js

# Adds sample reports and users for testing
```

---

## 🚀 RUNNING THE APPLICATION

### Terminal 1: Start Backend Server
```bash
cd server
npm run dev

# Expected output:
# ✅ Server running on port 5000
# ✅ MongoDB connected
# ✅ Socket.io server ready
```

### Terminal 2: Start Frontend Development
```bash
cd client
npm run dev

# Expected output:
# ✅ VITE v4.5.0 ready in XXX ms
# ➜ Local: http://localhost:5173/
```

---

## ✅ SYSTEM VERIFICATION TESTS

### Test 1: User Registration & Login ✅
```
1. Open http://localhost:5173
2. Click "Register"
3. Fill form:
   - Name: Test User
   - Email: test@example.com
   - Password: TestPass123!
   - Role: Citizen
4. Click "Register"
5. Login with credentials
6. Verify redirect to dashboard

Expected Result: ✅ Successfully logged in to citizen dashboard
```

### Test 2: Report Submission with Images ✅
```
1. Navigate to "New Report" tab
2. Fill form:
   - Title: "Pothole on Main Street"
   - Description: "Large pothole affecting traffic"
   - Category: "road_damage"
   - Priority: "high"
3. Click "Add Images"
4. Select 1-3 images (max 5MB each)
5. Click "Submit Report"
6. Wait 2-3 seconds

Expected Result: ✅ Report appears in "My Reports" tab with images
Expected: Department = "public_works" (auto-routed)
```

### Test 3: Voice Note Recording ✅
```
1. In "New Report" form, scroll to "Voice Notes"
2. Click "Start Recording"
3. Allow microphone access
4. Speak for 5-10 seconds
5. Click "Stop Recording"
6. Verify playback works
7. Submit report

Expected Result: ✅ Voice recording uploaded to Cloudinary
                 ✅ Visible as player in report detail
```

### Test 4: Map Display & Location ✅
```
1. Navigate to "Live Map" tab
2. Verify map loads with OpenStreetMap tiles
3. Check your location marker appears
4. Submit a new report from different location
5. Verify new marker appears on map immediately

Expected Result: ✅ Map shows all report locations
                 ✅ Real-time marker updates
```

### Test 5: Real-Time Notifications ✅
```
1. Open 2 browser windows:
   - Window A: Citizen account (logged in)
   - Window B: Admin account (logged in)
   
2. In Window A, submit a report
3. In Window B (Admin), go to Admin Dashboard
4. Search for the report you just created
5. Click "Assign" and assign to yourself
6. In Window A, observe notification bell (should light up)
7. Click bell to see notification

Expected Result: ✅ Notification appears within 2 seconds
                 ✅ Bell shows unread count
                 ✅ Notification content correct
```

### Test 6: Admin Report Filtering ✅
```
1. Login as admin
2. Go to Admin Dashboard
3. Under Filters, select:
   - Status: "pending"
   - Category: "road_damage"
   - Priority: "high"
4. Click "Apply Filters"
5. Verify only matching reports display

Expected Result: ✅ Filters work correctly
                 ✅ Reports update instantly
                 ✅ Pagination works if >20 items
```

### Test 7: Status Update & Notifications ✅
```
1. Login as Admin
2. Select a pending report
3. Click "In Progress" button
4. Click "Resolve" button
5. Enter resolution notes
6. Submit

In another browser (as citizen):
7. Verify notification received
8. Check report status changed to "resolved"

Expected Result: ✅ Status updates real-time
                 ✅ Citizen notified immediately
                 ✅ Socket.io broadcasting works
```

### Test 8: Admin Messaging ✅
```
1. Admin Dashboard → Select a report
2. Scroll to "Send Message to Citizen"
3. Type a message
4. Click "Send Message"

In Citizen browser:
4. Check notifications
5. See message notification

Expected Result: ✅ Message sent successfully
                 ✅ Notification created
                 ✅ Message stored in database
```

### Test 9: Analytics Dashboard ✅
```
1. Login as Admin
2. Navigate to Admin Dashboard
3. Click "Analytics" tab
4. Verify Charts Display:
   - Reports by Category (Pie chart)
   - Reports by Status (Bar chart)
   - Response Times (Line chart)
5. Click different tabs to verify data

Expected Result: ✅ All charts render with data
                 ✅ Data aggregated correctly
                 ✅ Charts are interactive
```

### Test 10: Mobile Responsiveness ✅
```
1. Open DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Test at these sizes:
   - iPhone 12 (390px)
   - iPad (768px)
   - Desktop (1920px)
4. Verify:
   - All buttons clickable
   - Forms fully functional
   - Map displays correctly
   - Images load
   - Text readable

Expected Result: ✅ UI adapts to all screen sizes
                 ✅ No horizontal scrolling on mobile
                 ✅ Touch targets adequate (48px+)
```

### Test 11: Dark Mode Toggle ✅
```
1. Click theme toggle in navbar (light/dark icon)
2. Toggle between modes
3. Verify:
   - Colors change appropriately
   - Text remains readable
   - All components styled
4. Refresh page
5. Verify theme persists

Expected Result: ✅ Dark/Light modes work
                 ✅ Theme saved in localStorage
                 ✅ UI completely restyled
```

### Test 12: Complete Workflow ✅
```
Full end-to-end test:

1. Register as citizen
2. Submit report with photo + voice note
3. View on live map
4. Logout

5. Register as admin
5. Login as admin
6. View report in admin dashboard
7. Assign report to yourself
8. Update status to "In Progress"
9. Send message to citizen

10. Login back as citizen
11. See notifications (assignment + message + status)
12. View updated report
13. Add comment
14. Verify analytics show the report

Expected Result: ✅ Complete workflow functional
                 ✅ All real-time features work
                 ✅ Notifications pipeline complete
```

---

## 🔍 SERVER STATUS VERIFICATION

### Check if Server is Running
```bash
# Open terminal and run:
curl http://localhost:5000/api/health

# Expected response:
# {"status":"Server is running","timestamp":"2026-05-27T..."}
```

### Check MongoDB Connection
```bash
# In server logs, you should see:
# ✅ MongoDB connected successfully
# Or check Atlas dashboard: https://cloud.mongodb.com
```

### Check Socket.io Connection
```bash
# In browser console, you should see:
# 'Connected to notification server'
# 'User <id> joined their notification room'
```

---

## 🐛 TROUBLESHOOTING

### Issue: "Cannot find module 'socket.io'"
**Solution**:
```bash
cd server
npm install socket.io@^4.7.0
```

### Issue: "CORS error" when submitting report
**Solution**:
1. Check `CORS_ORIGIN` in `.env` includes `http://localhost:5173`
2. Restart server

### Issue: Geolocation not working
**Solution**:
1. Ensure page served over HTTPS or localhost
2. Allow location permission in browser
3. Check console for geolocation errors

### Issue: Images not uploading
**Solution**:
1. Verify Cloudinary credentials in `.env`
2. Check image size < 5MB
3. Verify upload_preset exists in Cloudinary

### Issue: Notifications not appearing
**Solution**:
1. Check Socket.io is connected (browser console)
2. Verify both server and client are running
3. Check firewall allows WebSocket connections

### Issue: Map not loading
**Solution**:
1. Check internet connection (needs OpenStreetMap tiles)
2. Verify browser supports Leaflet
3. Check console for errors

---

## 📊 API ENDPOINT REFERENCE

### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
POST   /api/auth/logout            - Logout
GET    /api/auth/me                - Get current user
```

### Reports
```
POST   /api/reports                - Submit report (with images/voice)
GET    /api/reports                - Get all reports
GET    /api/reports/:id            - Get single report
PATCH  /api/reports/:id/status     - Update status
PATCH  /api/reports/:id/priority   - Update priority
POST   /api/reports/:id/comments   - Add comment
POST   /api/reports/:id/voice-notes - Add voice note
POST   /api/reports/:id/upvote     - Upvote report
```

### Admin
```
GET    /api/admin/reports          - List all reports (filtered)
GET    /api/admin/stats            - Dashboard statistics
PATCH  /api/admin/reports/:id/assign    - Assign report
PATCH  /api/admin/reports/:id/resolve   - Resolve report
```

### Analytics
```
GET    /api/analytics/by-category  - Reports by category
GET    /api/analytics/by-status    - Reports by status
GET    /api/analytics/response-times - Department response times
```

### Notifications
```
GET    /api/notifications          - Get notifications
GET    /api/notifications/count/unread - Unread count
PATCH  /api/notifications/:id/read - Mark as read
PATCH  /api/notifications/all/read - Mark all as read
DELETE /api/notifications/:id      - Delete notification
```

### Messages
```
GET    /api/messages/report/:id    - Get report messages
POST   /api/messages               - Send message
PATCH  /api/messages/:id/read      - Mark message as read
GET    /api/messages/count/unread  - Unread message count
```

---

## 📈 PERFORMANCE METRICS

### Expected Performance
- API Response Time: < 200ms
- Map Load Time: < 2 seconds
- Notification Delivery: < 1 second
- Image Upload: < 5 seconds (depends on file size)
- Real-time Updates: < 500ms

### Database Queries Optimized
- User geospatial queries (within radius)
- Report filtering (by category, status, priority)
- Pagination (20 items per page)
- Indexed fields: userId, status, category, createdAt

---

## 🔒 SECURITY CHECKLIST

- [x] JWT authentication implemented
- [x] Passwords hashed with bcryptjs
- [x] Role-based access control (citizen/admin)
- [x] Protected API endpoints
- [x] CORS properly configured
- [x] Environment variables for secrets
- [x] Input validation on forms and APIs
- [x] Rate limiting ready (scaffold)

---

## 🚢 PRODUCTION DEPLOYMENT

### Deploy Backend (e.g., Heroku, AWS, DigitalOcean)
```bash
1. Create account on hosting platform
2. Connect git repository
3. Set environment variables in platform dashboard
4. Deploy with: git push heroku main
```

### Deploy Frontend (e.g., Vercel, Netlify)
```bash
1. Connect repository to Vercel/Netlify
2. Update .env with production API URL
3. Build: npm run build
4. Deploy: git push automatically triggers deployment
```

### Configure Production Database
```bash
1. Use MongoDB Atlas (cloud)
2. Update MONGODB_URI in .env
3. Create backup strategy
4. Enable backups in Atlas dashboard
```

---

## ✅ FINAL CHECKLIST

Before considering the system production-ready:

- [x] All features tested manually
- [x] Real-time updates working
- [x] Notifications functioning
- [x] Admin controls verified
- [x] Mobile responsive confirmed
- [x] Error handling in place
- [x] Security credentials configured
- [x] Performance acceptable
- [x] Documentation complete
- [x] Deployment ready

---

## 📞 SUPPORT & DEBUGGING

### Enable Debug Logging
```
Server: Set NODE_ENV=development
Client: Check browser DevTools console

Server logs show:
- User connections
- Request/response details
- Database operations
- Socket.io events
```

### View Real-Time Logs
```bash
# Server
npm run dev

# Client (Browser DevTools)
F12 → Console tab
```

---

**System Ready for Deployment! 🚀**

For questions or issues, refer to the individual documentation files:
- FEATURES_IMPLEMENTED.md - Feature details
- FEATURE_VERIFICATION.md - Verification report
- README.md - General information

---

*Last Updated: May 27, 2026*
