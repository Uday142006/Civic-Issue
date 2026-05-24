# MongoDB Local Setup Guide

Complete instructions for setting up MongoDB Community Edition on Windows.

## Option 1: Windows Installer (Recommended)

### Step 1: Download MongoDB Community Edition

1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - **Version**: Latest (e.g., 7.0 or 8.0)
   - **Platform**: Windows x64
   - **Package**: MSI

3. Click "Download"

### Step 2: Run the Installer

1. Open the downloaded `.msi` file
2. Click **Next** through the setup wizard
3. Choose **Complete** installation
4. When asked about MongoDB Compass:
   - ✅ **Check "Install MongoDB Compass"** (helpful GUI tool)
5. When asked about Service:
   - ✅ **Check "Install MongoDB as a Service"**
   - ✅ **Run the service as a Network Service user**
6. Click **Install**
7. Click **Finish**

### Step 3: Verify Installation

Open PowerShell and run:
```powershell
mongod --version
```

Expected output:
```
db version v7.0.0
```

### Step 4: Start MongoDB Service

MongoDB should start automatically as a Windows service, but you can verify:

**In PowerShell (as Administrator):**
```powershell
# Check if service is running
Get-Service MongoDB

# Start service if not running
Start-Service MongoDB

# Check service status
Get-Service MongoDB | Select-Object Status, Name
```

**Expected output:**
```
Status   Name
------   ----
Running  MongoDB
```

---

## Option 2: Portable/Manual Setup (Alternative)

If you prefer not to use the installer:

### Step 1: Extract MongoDB

1. Download `.zip` file from MongoDB website
2. Extract to: `C:\mongodb`
3. Create data directory: `C:\mongodb\data\db`

### Step 2: Start MongoDB Manually

```powershell
# Navigate to MongoDB bin directory
cd C:\mongodb\bin

# Start MongoDB server
mongod --dbpath C:\mongodb\data\db
```

Keep this terminal open while using MongoDB.

---

## Verify MongoDB is Running

### Method 1: Using mongosh CLI

Open new PowerShell terminal:

```powershell
mongosh
```

You should see:
```
test> 
```

Type `exit` to quit.

### Method 2: Using MongoDB Compass

1. Start MongoDB Compass (installed with MSI)
2. Click **Connect**
3. You should see `local` database listed

---

## Create Initial Admin Account

Once MongoDB is running:

```bash
cd "d:\B.Tech Projects\SIH25031\Civic-Issue\server"

# Install dependencies if not done
npm install

# Create admin user
npm run create-admin
```

Follow the prompts:
```
📧 Enter admin email: admin@municipal.gov
🔐 Enter admin password: your_secure_password
👤 Enter admin name: Municipal Administrator
```

---

## Configure Backend Connection

Edit `.env` in the `server` directory:

```env
# Local MongoDB
MONGODB_LOCAL=mongodb://localhost:27017/civic-issue

# Or if running on different port
MONGODB_LOCAL=mongodb://localhost:27017/civic-issue
```

---

## Common Issues

### ❌ "mongod is not recognized"

After reinstalling, restart PowerShell or add MongoDB to PATH:
```powershell
# Windows will detect mongod after restart
```

### ❌ "Port 27017 already in use"

MongoDB is already running (probably as service):
```powershell
# Either use existing service or stop it
Stop-Service MongoDB
```

### ❌ "Connection refused on 127.0.0.1:27017"

MongoDB service not started:
```powershell
Start-Service MongoDB

# Verify it's running
Get-Service MongoDB
```

---

## Using MongoDB Compass (GUI)

1. **Open** MongoDB Compass (start menu → MongoDB Compass)
2. **Click** "Connect"
3. **Create Database**:
   - Click "+" icon
   - Database name: `civic-issue`
   - Collection: `users`
   - Click **Create**

4. **Create Admin User Manually** (if script fails):
   - Go to `civic-issue` → `users` collection
   - Click **Insert Document**
   - Add (replace with your details):
   ```json
   {
     "name": "Municipal Admin",
     "email": "admin@municipal.gov",
     "password": "$2a$10$...",
     "role": "admin",
     "emailVerified": true,
     "isActive": true,
     "createdAt": new Date(),
     "updatedAt": new Date()
   }
   ```

---

## Testing MongoDB Connection

Create a test file `test-mongo.js`:

```javascript
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/civic-issue')
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });
```

Run:
```bash
node test-mongo.js
```

---

## Starting Fresh

If you need to delete all data and start over:

```powershell
# Stop MongoDB
Stop-Service MongoDB

# Or if running manually, press Ctrl+C in the terminal running mongod
```

**Using MongoDB Compass:**
1. Connect to local MongoDB
2. Right-click `civic-issue` database
3. Select **Delete Database**

**Using CLI:**
```
mongosh
use civic-issue
db.dropDatabase()
exit
```

---

## Next Steps

1. ✅ Start MongoDB service
2. ✅ Create admin account: `npm run create-admin`
3. ✅ Seed demo data (optional): `npm run seed-demo`
4. ✅ Start backend: `npm run dev`
5. ✅ Start frontend: `npm run dev`
6. ✅ Test application at http://localhost:3000

---

## Windows Service Management

```powershell
# Start MongoDB service
Start-Service MongoDB

# Stop MongoDB service
Stop-Service MongoDB

# Restart MongoDB service
Restart-Service MongoDB

# Check status
Get-Service MongoDB

# Remove from startup (permanently)
Stop-Service MongoDB
Remove-Item 'HKLM:\SYSTEM\CurrentControlSet\Services\MongoDB'
```

---

**MongoDB is now ready for development! 🚀**
