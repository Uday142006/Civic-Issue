# ⚡ 3-Minute Quick Start

## Step 1: Start MongoDB (1 minute)

**Open PowerShell as Administrator**:

```powershell
# Check if MongoDB is installed
mongod --version

# If not found, download and install from:
# https://www.mongodb.com/try/download/community
# Select "Install as Service" during setup

# Start MongoDB service
Start-Service MongoDB

# Verify it's running
Get-Service MongoDB
# Should show: Running    MongoDB
```

---

## Step 2: Setup & Create Admin (1 minute)

**Navigate to project**:

```bash
cd "d:\B.Tech Projects\SIH25031\Civic-Issue\server"

# Install dependencies (if not done)
npm install

# Create admin account
npm run create-admin
```

**When prompted, enter**:
```
Email: admin@municipal.gov
Password: Admin@123
Name: Municipal Admin
```

**Note**: Write down your admin email/password! You'll need it to login.

---

## Step 3: Start Dev Servers (1 minute)

**Terminal 1 - Backend**:
```bash
cd "d:\B.Tech Projects\SIH25031\Civic-Issue\server"
npm run dev
```

**Terminal 2 - Frontend** (new PowerShell window):
```bash
cd "d:\B.Tech Projects\SIH25031\Civic-Issue\client"
npm run dev
```

**Wait for**:
- Backend: `✅ Server running on http://localhost:5000`
- Frontend: `Local: http://localhost:3000`

---

## 🎉 You're Ready!

Open browser → **http://localhost:3000**

### Test Citizen Flow:
1. Click "Login" → "Phone" tab
2. Enter: `+919876543210`
3. Click "Send OTP"
4. **Check backend terminal console** for OTP (e.g., `123456`)
5. Enter OTP & click "Verify"
6. Enter name: `Test User`
7. ✅ You're logged in!

### Test New Report with Images:
1. Click "New Report" tab
2. Fill form:
   - Title: "Pothole on Street"
   - Category: "Road Damage"
   - Description: "Large hole in pavement"
3. Click "+ Select Images"
4. Choose images (up to 3, max 5MB each)
5. Click "📤 Upload Images"
6. Click "📤 Submit Report"
7. ✅ Report submitted with images!

### Test Admin Dashboard:
1. Logout (click profile menu if visible)
2. Login → "Admin" tab
   - Email: `admin@municipal.gov`
   - Password: (what you set in Step 2)
3. Click "Analytics" tab
4. ✅ See interactive charts!

---

## 📚 Full Docs (When Needed)

- **Setup Issues?** → Read [MONGODB_SETUP.md](MONGODB_SETUP.md)
- **Commands?** → See [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- **Testing?** → Follow [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)
- **Errors?** → Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 🎯 What's New

✨ **File Upload**: Submit reports with photos  
✨ **Analytics**: Visualize report trends with charts

---

## ⚠️ If Something Breaks

1. **MongoDB won't start**:
   ```powershell
   Stop-Service MongoDB
   Start-Service MongoDB
   ```

2. **Port 5000 in use**:
   ```powershell
   Get-Process -Name node | Stop-Process
   # Then restart backend
   ```

3. **Port 3000 in use**:
   ```bash
   # Kill all node processes or use different port
   # Press Ctrl+C in the terminal running `npm run dev`
   ```

4. **npm ERR!**:
   ```bash
   # In that directory:
   npm install
   ```

---

**That's it! You're ready to develop! 🚀**
