# Troubleshooting Guide

Solutions to common issues and errors you might encounter.

## Database Issues

### ❌ "MongoServerError: connect ECONNREFUSED 127.0.0.1:27017"

**Cause**: MongoDB service is not running

**Solutions**:

**Windows:**
```bash
# Start MongoDB service
net start MongoDB

# Or if using MongoDB as a user service
# Start -> Services -> MongoDB Server -> Start
```

**macOS (Homebrew):**
```bash
# Start MongoDB service
brew services start mongodb-community

# Verify it's running
brew services list
```

**Linux (Ubuntu):**
```bash
# Start MongoDB service
sudo systemctl start mongod

# Verify status
sudo systemctl status mongod
```

**MongoDB Atlas (Cloud):**
- Verify connection string in `.env`
- Check IP whitelist in cluster settings
- Test connection: `mongosh "your-connection-string"`

---

### ❌ "MongoAuthenticationError: Authentication failed"

**Cause**: Incorrect MongoDB credentials in connection string

**Solutions**:
1. Check `.env` has correct connection string
2. Verify username/password are URL-encoded (spaces → %20)
3. Test connection directly:
```bash
mongosh "mongodb+srv://username:password@cluster.mongodb.net/civic-issue"
```
4. Check MongoDB Atlas user credentials are correct

---

### ❌ "MongooseError: Cannot connect to MongoDB"

**Cause**: MongoDB connection URI malformed

**Solutions**:
1. Verify format:
   - Local: `mongodb://localhost:27017/civic-issue`
   - Atlas: `mongodb+srv://user:pass@cluster.mongodb.net/database`
2. Check port number (default: 27017)
3. Verify database name exists
4. Restart MongoDB service

---

### ❌ "MongooseError: Model.findOne is not a function"

**Cause**: Model not properly imported/exported

**Solution**: 
Check `server/models/User.js`:
```javascript
// Correct
module.exports = mongoose.model('User', userSchema);

// Not just
mongoose.model('User', userSchema);
```

---

## Authentication Issues

### ❌ "JWT malformed" or "Invalid token"

**Cause**: Corrupted or improperly formatted JWT token

**Solutions**:
1. Clear browser storage:
   - DevTools → Application → Clear All
   - Or logout and login again
2. Verify token format: Should be 3 parts separated by `.`
3. Check backend JWT_SECRET matches between encoding/decoding:
   ```javascript
   // server/.env
   JWT_SECRET=your_exact_secret_key
   ```
4. Test token generation:
   ```bash
   curl -X POST http://localhost:5000/api/auth/verify-otp \
     -H "Content-Type: application/json" \
     -d '{"phone": "+919876543210", "otp": "123456"}'
   ```

---

### ❌ "OTP sent but not received"

**Cause**: Email/SMS not configured or provider issue

**Solutions**:

**Development Mode** (OTP prints in console):
- Check server console for: `🔐 OTP Code: 123456`
- Use that code in UI

**Production Mode** (Needs Configuration):

**For Email via Nodemailer:**
1. Enable 2FA on Gmail
2. Generate app-specific password: https://myaccount.google.com/apppasswords
3. Update `.env`:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   NODE_ENV=production
   ```
4. Restart server

**For SMS via Twilio:**
1. Get Twilio credentials: https://console.twilio.com
2. Update `.env`:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxx
   TWILIO_AUTH_TOKEN=xxxxxxxx
   TWILIO_PHONE=+1234567890
   ```
3. Code will automatically send SMS

---

### ❌ "Admin can auto-register with OTP/OAuth"

**Cause**: Did not properly use separate admin-only endpoint

**Solution**:
Admin accounts MUST be created via:
```bash
# Option 1: Script
npm run create-admin

# Option 2: API (protected - requires existing admin token)
curl -X POST http://localhost:5000/api/auth/admin/create-credentials \
  -H "Authorization: Bearer ADMIN_TOKEN"
  -H "Content-Type: application/json" \
  -d '{
    "email": "newadmin@example.com",
    "password": "secured_password",
    "name": "New Admin"
  }'

# Option 3: Direct MongoDB
mongosh
use civic-issue
db.users.insertOne({
  name: "Admin",
  email: "admin@example.com",
  password: "$2a$10$...",  // bcrypt hashed
  role: "admin",
  emailVerified: true
})
```

---

## API & Network Issues

### ❌ "CORS error: Access to XMLHttpRequest blocked"

**Cause**: Frontend and backend have mismatched origins

**Solutions**:

1. **Verify backend CORS config** (`server/server.js`):
   ```javascript
   const cors = require('cors');
   app.use(cors({
     origin: 'http://localhost:3000',  // frontend URL
     credentials: true
   }));
   ```

2. **Verify frontend API URL** (`client/.env`):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Check URLs match**:
   - Frontend running: `http://localhost:3000`
   - Backend running: `http://localhost:5000`
   - In `.env`: `VITE_API_URL=http://localhost:5000/api`

4. **Restart both frontend and backend**

5. **Clear browser cache**: Ctrl+Shift+Delete

---

### ❌ "Network request hangs / no response"

**Cause**: Backend not running or endpoint not defined

**Solutions**:
1. Verify backend is running: `npm run dev`
2. Check server console for errors
3. Test endpoint directly:
   ```bash
   curl http://localhost:5000/api/auth/send-otp
   # Should get error (missing body), not connection refused
   ```
4. If no response, port may be blocked by firewall

---

### ❌ "404 Not Found" on API endpoint

**Cause**: Route not defined or wrong path

**Solutions**:
1. Check route is defined in `server/routes/auth.routes.js`:
   ```javascript
   router.post('/send-otp', sendOTP);  // ✓ Defined
   ```
2. Verify route is registered in `server/server.js`:
   ```javascript
   app.use('/api/auth', authRoutes);  // Routes mounted
   ```
3. Check correct full path: `/api/auth/send-otp`
4. Verify HTTP method (GET vs POST vs PUT)

---

### ❌ "Cannot read property 'body' of undefined"

**Cause**: Express middleware not properly configured

**Solutions**:
Check `server/server.js`:
```javascript
// Add these BEFORE routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
```

---

## Port & Process Issues

### ❌ "Error: listen EADDRINUSE ✗ :::5000"

**Cause**: Port 5000 already in use

**Solutions**:

**Kill existing process:**

**Windows:**
```bash
# Find process on port 5000
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID 12345 /F
```

**macOS/Linux:**
```bash
# Find process on port 5000
lsof -i :5000

# Kill process (replace PID)
kill -9 12345
```

**Use different port:**
```bash
PORT=5001 npm run dev
# Remember to update .env on client with new URL
```

---

### ❌ "Error: listen EADDRINUSE ✗ :::3000"

**Cause**: Port 3000 already in use

**Solutions**:

**Kill existing process:**

**Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
lsof -i :3000
kill -9 <PID>
```

---

## Frontend Issues

### ❌ "undefined is not a function" errors

**Cause**: Module import/export mismatch

**Solutions**:

**Check Redux slice export:**
```javascript
// ✓ Correct
export default authSlice.reducer;
export const { setUser, setToken } = authSlice.actions;

// Check import matches
import authSlice from './authSlice';
import { setUser } from './authSlice';
```

**Check API service export:**
```javascript
// ✓ Correct
export const api = axios.create({...});
export const authService = { sendOTP, verifyOTP, ... };

// Import correctly
import { authService } from './api';
```

---

### ❌ "Cannot find module 'leaflet'"

**Cause**: Dependencies not installed

**Solutions**:
```bash
cd client
npm install

# If persists, clean and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

### ❌ "Blank white screen after login"

**Cause**: Route component not rendering properly

**Solutions**:
1. Check browser console for errors (F12)
2. Check Redux state: `localStorage.getItem('persist:auth')`
3. Verify ProtectedRoute component in `App.jsx`:
   ```javascript
   // Check it properly checks auth
   if (!isAuthenticated) return <Navigate to="/login" />;
   if (requiredRole && user.role !== requiredRole) 
     return <Navigate to="..." />;
   return <Component />;
   ```
4. Verify component file exists and exports default

---

### ❌ "Form not submitting / button does nothing"

**Cause**: Missing event handler or prevented default

**Solutions**:
1. Check button is type="submit" in a `<form>`
2. Verify onClick handler exists and is called
3. Check `e.preventDefault()` is present
4. Verify API service call has correct URL
5. Check network tab for request status

---

### ❌ "Map not loading or showing blank"

**Cause**: Leaflet not initialized or CSS missing

**Solutions**:
1. Import CSS in component:
   ```javascript
   import 'leaflet/dist/leaflet.css';
   ```
2. Verify Leaflet container has height:
   ```css
   #map {
     height: 500px;  /* Required! */
     width: 100%;
   }
   ```
3. Check coordinates are valid: `[latitude, longitude]` (not reversed)
4. Verify geolocation permission granted

---

## Development Workflow Issues

### ❌ "Changes not reflecting (stale code)"

**Cause**: Hot reload not working or cache issue

**Solutions**:
1. Check Vite dev server is running and watching files
2. Make small test change visible (e.g., add console.log)
3. If not updating:
   ```bash
   # Stop Vite (Ctrl+C)
   # Clear cache
   rm -rf .vite*
   npm run dev
   ```
4. Try hard refresh: `Ctrl+Shift+R` (not just F5)
5. Clear browser cache: DevTools → Network → Disable cache

---

### ❌ "Cannot read property 'user' of undefined (Redux)"

**Cause**: Redux selector returning wrong structure

**Solutions**:
Check Redux selector syntax:
```javascript
// ✓ Correct
const { user } = useSelector(state => state.auth);
const { token } = useSelector(state => state.auth);

// Check reducer has these fields
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  ...
};
```

---

## MongoDB Issues

### ❌ "Cannot read properties of undefined reading 'email'"

**Cause**: Document field doesn't exist or null value

**Solutions**:
1. Check field exists in schema
2. Verify document has the field:
   ```javascript
   // In mongosh
   db.users.findOne({_id: ObjectId("...")})
   ```
3. Add null checks in code:
   ```javascript
   const email = user?.email || 'unknown';
   ```

---

### ❌ "Duplicate key error"

**Cause**: Unique field already exists in database

**Solutions**:
1. Check indexes on collection:
   ```javascript
   // mongosh
   db.users.getIndexes()
   ```
2. Drop unique index if needed:
   ```javascript
   db.users.dropIndex("email_1")
   ```
3. Or use different email/value

---

### ❌ "Cast to ObjectId failed"

**Cause**: Invalid MongoDB object ID format

**Solutions**:
1. Check ID is 24-character hex string
2. Verify ID passed from frontend is valid
3. Check database query:
   ```javascript
   // ✓ Correct - Mongoose auto-converts
   await User.findById(req.user.id);
   
   // Also works
   await User.findById(new mongoose.Types.ObjectId(id));
   ```

---

## Deployment Issues

### ⚠️ Ready to deploy but "X" not working

Before deployment, verify:
- [ ] All environment variables set correctly
- [ ] Database connection works remotely
- [ ] APIs tested end-to-end
- [ ] No console errors in production build
- [ ] Token expiry set appropriately (7 days reasonable)
- [ ] CORS allows production URLs
- [ ] File upload paths configured
- [ ] Email/SMS providers configured

---

## Getting Help

If issue persists:

1. **Check logs**:
   - Backend: Terminal where `npm run dev` runs
   - Frontend: Browser Console (F12)
   - Database: MongoDB logs

2. **Test components in isolation**:
   - Test API endpoints with Postman/cURL
   - Test Redux state with DevTools extension
   - Test database with MongoDB Compass

3. **Search existing issues**:
   - GitHub Issues (if open source)
   - Stack Overflow with specific error message
   - Error documentation for libraries used

4. **Minimal reproduction**:
   - Create smallest test case showing issue
   - Share: code snippet, error message, steps to reproduce
   - Include: OS, Node version, MongoDB version

5. **Nuclear option** (last resort):
   ```bash
   # Clear everything and start fresh
   cd server && rm -rf node_modules .env && npm install
   cd ../client && rm -rf node_modules .env && npm install
   
   # Recreate .env files from .example
   # Stop both servers
   # Clear browser cache and localStorage
   # Stop MongoDB and restart it
   # Start everything again
   ```

---

## Performance Optimization

If system is slow:

### Backend Optimization
```javascript
// Add database indexes
db.reports.createIndex({ "location": "2dsphere" })
db.reports.createIndex({ status: 1, createdAt: -1 })

// Use .lean() for read-only queries
const reports = await Report.find({}).lean();

// Limit results
const reports = await Report.find({}).limit(50);
```

### Frontend Optimization
```javascript
// Lazy load components
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Memo prevent re-renders
export default memo(ReportCard);

// Chunk large lists
import { FixedSizeList } from 'react-window';
```

---

**Still stuck?** 
- Review [GETTING_STARTED.md](GETTING_STARTED.md) for setup recap
- Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for command syntax
- Review [AUTHENTICATION_SETUP.md](AUTHENTICATION_SETUP.md) for auth flow details
