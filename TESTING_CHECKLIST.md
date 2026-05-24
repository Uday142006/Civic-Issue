# Testing Checklist

Systematic verification of all features and functionality.

## Pre-Testing Setup

- [ ] MongoDB is running and accessible
- [ ] Backend server: `npm run dev` (running on http://localhost:5000)
- [ ] Frontend dev server: `npm run dev` (running on http://localhost:3000)
- [ ] Browser console open (F12) for error checking
- [ ] Network tab open to monitor API calls

## Section 1: Authentication

### 1.1 Citizen Login - Phone OTP

- [ ] **Send OTP**
  - [ ] Click "Login" → "Phone" tab
  - [ ] Enter phone: `+919876543210`
  - [ ] Click "Send OTP"
  - [ ] Check server console for OTP code
  - [ ] Verify success message appears

- [ ] **Verify OTP - First Time Login**
  - [ ] Enter OTP from console
  - [ ] Form expands to ask for name
  - [ ] Enter: `Test Citizen`
  - [ ] Enter email: `test@example.com`
  - [ ] Click "Verify OTP"
  - [ ] Verify: Redirected to Citizen Dashboard
  - [ ] Check localStorage: `token` and `persist:auth` exist

- [ ] **Verify OTP - Returning User**
  - [ ] Logout from dashboard
  - [ ] Send OTP again for same phone
  - [ ] Enter OTP
  - [ ] Verify: No form, directly logged in
  - [ ] Verify: User data loaded from database

- [ ] **OTP Expiry**
  - [ ] Wait 11 minutes after sending OTP
  - [ ] Try to use old OTP
  - [ ] Verify: "OTP expired" error message

- [ ] **OTP Attempt Limit**
  - [ ] Send OTP
  - [ ] Enter wrong OTP 5 times
  - [ ] Verify: "Too many attempts" error

### 1.2 Admin Login

- [ ] **Valid Credentials**
  - [ ] Click "Login" → "Admin" tab
  - [ ] Enter: `admin@municipal.gov`
  - [ ] Enter: `your_password`
  - [ ] Click "Login"
  - [ ] Verify: Redirected to Admin Dashboard
  - [ ] Verify: Role badge shows "Admin"

- [ ] **Invalid Email**
  - [ ] Try non-existent email
  - [ ] Verify: "Invalid credentials" error

- [ ] **Invalid Password**
  - [ ] Use correct email with wrong password
  - [ ] Verify: "Invalid credentials" error

- [ ] **Admin Auto-Registration Prevention**
  - [ ] Try to login with non-existent admin email
  - [ ] Verify: User NOT auto-created
  - [ ] Verify: Error message generated

## Section 2: Citizen Dashboard

### 2.1 Live Map Tab

- [ ] **Map Loads**
  - [ ] Navigate to Citizen Dashboard
  - [ ] Select "Live Map" tab
  - [ ] Verify: Leaflet map displays
  - [ ] Verify: Kolkata region visible

- [ ] **Current Location**
  - [ ] Browser should prompt for location permission
  - [ ] Accept permission
  - [ ] Verify: Blue dot/marker shows your location
  - [ ] Verify: Map centers on your location

- [ ] **Report Markers**
  - [ ] Verify: Multiple report markers visible on map
  - [ ] Click on marker
  - [ ] Verify: Popup shows report title + status

- [ ] **Zoom & Pan**
  - [ ] Use mouse scroll to zoom in/out
  - [ ] Drag map to pan
  - [ ] Verify: Responsive and smooth

### 2.2 My Reports Tab

- [ ] **Report List**
  - [ ] Click "My Reports" tab
  - [ ] Verify: Shows only YOUR submitted reports
  - [ ] Verify: Each report shows title, category, status, date

- [ ] **Status Badges**
  - [ ] Verify: "Pending" shown in red
  - [ ] Verify: "Acknowledged" shown in yellow
  - [ ] Verify: "In Progress" shown in blue
  - [ ] Verify: "Resolved" shown in green

- [ ] **Report Details**
  - [ ] Click on report card
  - [ ] Verify: Modal opens with full details
  - [ ] Verify: Shows description, location, upvotes
  - [ ] Close modal

- [ ] **Upvote Functionality** (if implemented)
  - [ ] Click upvote button on report
  - [ ] Verify: Upvote count increases
  - [ ] Verify: Button disabled or changes color

### 2.3 New Report Tab

- [ ] **Form Fields**
  - [ ] Click "New Report" tab
  - [ ] Verify: Title field present
  - [ ] Verify: Description field present
  - [ ] Verify: Category dropdown present
  - [ ] Verify: Priority dropdown present
  - [ ] Verify: Location section present

- [ ] **Auto-Detection**
  - [ ] Verify: "Get My Location" button present
  - [ ] Click button (allow location permission)
  - [ ] Verify: Coordinates auto-populated
  - [ ] Verify: Address displayed

- [ ] **Form Validation**
  - [ ] Leave title empty, try submit
  - [ ] Verify: Error message "Title required"
  - [ ] Fill all required fields
  - [ ] Click submit
  - [ ] Verify: Success message appears

- [ ] **New Report in Database**
  - [ ] After submission, check MongoDB
  - [ ] Verify: Report created with correct data
  - [ ] Verify: Submission timestamp recorded
  - [ ] Verify: Submitter ID matches current user

- [ ] **Report Appears in List**
  - [ ] Navigate to "My Reports" tab
  - [ ] Verify: New report appears in list
  - [ ] Verify: Status is "Pending"

### 2.4 Session Management

- [ ] **Token Refresh**
  - [ ] Login and check localStorage for token
  - [ ] Refresh page (F5)
  - [ ] Verify: Still logged in (not redirected to login)
  - [ ] Verify: User data persists

- [ ] **Logout**
  - [ ] Click logout button (if present)
  - [ ] Verify: Token removed from localStorage
  - [ ] Verify: Redirected to login page
  - [ ] Try accessing `/dashboard` directly
  - [ ] Verify: Redirected to login

- [ ] **Token Expiry**
  - [ ] Modify token in localStorage (corrupt it)
  - [ ] Refresh page or make API call
  - [ ] Verify: "Invalid token" error
  - [ ] Verify: Redirected to login after error

## Section 3: Admin Dashboard

### 3.1 Dashboard Overview

- [ ] **Stats Cards**
  - [ ] Verify: "Total Reports" card shows number
  - [ ] Verify: "Pending Reports" card shows number
  - [ ] Verify: "Resolved Reports" card shows number
  - [ ] Verify: "Active Users" card shows number
  - [ ] Verify: Stats match database

- [ ] **Admin Tab Access**
  - [ ] Locate and verify navigation to "Reports" tab
  - [ ] Locate and verify navigation to "Analytics" tab

### 3.2 Reports Tab

- [ ] **Reports Table**
  - [ ] Verify: Table displays all reports
  - [ ] Verify: Columns: Title, Category, Submitter, Status, Date
  - [ ] Verify: Sortable columns work
  - [ ] Verify: Pagination if many reports

- [ ] **Filter by Status**
  - [ ] Click status filter dropdown
  - [ ] Select "Pending"
  - [ ] Verify: Only pending reports shown
  - [ ] Select "Resolved"
  - [ ] Verify: Only resolved reports shown

- [ ] **Filter by Category**
  - [ ] Click category filter dropdown
  - [ ] Select "Road Damage"
  - [ ] Verify: Only road damage reports shown
  - [ ] Select "Garbage"
  - [ ] Verify: Only garbage reports shown

- [ ] **Report Detail Modal**
  - [ ] Click on report row
  - [ ] Verify: Modal opens with full details
  - [ ] Verify: Shows title, description, location
  - [ ] Verify: Shows submitter information
  - [ ] Verify: Shows current status

- [ ] **Mark as Resolved**
  - [ ] Choose pending report and open modal
  - [ ] Enter resolution notes: `"Fixed the pothole"`
  - [ ] Click "Mark as Resolved"
  - [ ] Verify: Success message
  - [ ] Verify: Report status changes to "Resolved"
  - [ ] Check MongoDB: `resolutionNotes` saved
  - [ ] Check MongoDB: `resolvedAt` timestamp set

- [ ] **Status Update**
  - [ ] Open report modal
  - [ ] Click status dropdown
  - [ ] Change from "Pending" to "Acknowledged"
  - [ ] Verify: Status updates immediately
  - [ ] Verify: Database updated

### 3.3 Analytics Tab

- [ ] **Charts Display** (if implemented)
  - [ ] Navigate to Analytics tab
  - [ ] Verify: Chart appears
  - [ ] Verify: Data accurate

- [ ] **If Not Yet Implemented**
  - [ ] Note for future implementation

## Section 4: Role-Based Access Control

### 4.1 Citizen Cannot Access Admin

- [ ] **Direct URL Access**
  - [ ] Login as citizen
  - [ ] Try accessing `http://localhost:3000/admin`
  - [ ] Verify: Redirected to `/dashboard`
  - [ ] Verify: Error/warning message

- [ ] **No Admin Menu**
  - [ ] Verify: Admin menu items not visible in navbar

### 4.2 Admin Cannot See Citizen Dashboard

- [ ] **Accessing Citizen Dashboard**
  - [ ] Login as admin
  - [ ] Try accessing `http://localhost:3000/dashboard`
  - [ ] Verify: Redirected to `/admin`

### 4.3 Unauthenticated Users

- [ ] **Protected Routes**
  - [ ] Logout all users
  - [ ] Try accessing `http://localhost:3000/dashboard`
  - [ ] Verify: Redirected to login page
  - [ ] Try accessing `http://localhost:3000/admin`
  - [ ] Verify: Redirected to login page

## Section 5: API Integration

### 5.1 Network Requests

- [ ] **Check Network Tab (DevTools)**
  - [ ] Open DevTools → Network tab
  - [ ] Send OTP
  - [ ] Verify: POST request to `/api/auth/send-otp`
  - [ ] Verify: Response status 200
  - [ ] Verify: Response contains OTP (dev mode)

- [ ] **Verify OTP Request**
  - [ ] Verify: POST request to `/api/auth/verify-otp`
  - [ ] Verify: Request body contains phone, otp, name
  - [ ] Verify: Response status 200
  - [ ] Verify: Response contains JWT token

- [ ] **Admin Login Request**
  - [ ] Verify: POST request to `/api/auth/admin-login`
  - [ ] Verify: Request body contains email, password
  - [ ] Verify: Response contains JWT token

- [ ] **Get Reports Request**
  - [ ] Submit new report
  - [ ] Verify: POST request to `/api/reports`
  - [ ] Verify: Response status 201
  - [ ] Verify: Response contains report ID

- [ ] **Token in Headers**
  - [ ] After login, make any API call
  - [ ] Check request headers
  - [ ] Verify: `Authorization: Bearer {token}` present

### 5.2 Error Handling

- [ ] **Network Error**
  - [ ] Stop backend server
  - [ ] Try to make API call from frontend
  - [ ] Verify: User sees error message
  - [ ] Start backend again

- [ ] **Validation Error**
  - [ ] Submit form with invalid data
  - [ ] Verify: API returns validation error
  - [ ] Verify: Frontend displays error message

- [ ] **Server Error**
  - [ ] Look for any 500 errors in Network tab
  - [ ] Check backend console for error logs
  - [ ] Verify: Frontend handles gracefully

## Section 6: Data Persistence

### 6.1 MongoDB Verification

- [ ] **Check User Created**
  - [ ] Open MongoDB Compass or mongosh
  - [ ] Navigate to `civic-issue.users`
  - [ ] Verify: User document exists with correct data
  - [ ] Verify: Password is bcrypt hashed (not plain text)
  - [ ] Verify: Role is "citizen" or "admin"

- [ ] **Check Report Created**
  - [ ] Navigate to `civic-issue.reports`
  - [ ] Verify: Report document exists
  - [ ] Verify: Location stored as GeoJSON
  - [ ] Verify: Coordinates [longitude, latitude] correct
  - [ ] Verify: Submitted user ID is valid ObjectId ref

- [ ] **Check Status Updates**
  - [ ] Mark report as resolved in admin dashboard
  - [ ] Check MongoDB: `status` field = "resolved"
  - [ ] Check MongoDB: `resolutionNotes` populated
  - [ ] Check MongoDB: `resolvedAt` timestamp present

### 6.2 localStorage Verification

- [ ] **Token Storage**
  - [ ] Login as citizen
  - [ ] Open DevTools → Application/Storage → localStorage
  - [ ] Verify: `token` key exists
  - [ ] Verify: Value is valid JWT (3 parts separated by .)

- [ ] **Auth State Storage**
  - [ ] Verify: `persist:auth` key exists (Redux persist)
  - [ ] Value is JSON stringified Redux state
  - [ ] Contains: user, token, isAuthenticated

- [ ] **Persistence After Refresh**
  - [ ] Login and verify localStorage has token
  - [ ] Refresh page (F5)
  - [ ] Verify: Still logged in without sending credentials again
  - [ ] Verify: User data displayed immediately

## Section 7: Responsive Design

### 7.1 Desktop (1920x1080)

- [ ] **Layout**
  - [ ] Navbar spans full width
  - [ ] Content properly aligned
  - [ ] Map fills designated area
  - [ ] Sidebar visible (if applicable)

- [ ] **Forms**
  - [ ] All form fields visible
  - [ ] Buttons properly sized
  - [ ] No overflow or scrolling needed

### 7.2 Tablet (768x1024)

- [ ] **Layout Adaptation**
  - [ ] Navbar remains accessible
  - [ ] Map scales appropriately
  - [ ] Single column layout for forms
  - [ ] No content overlap

### 7.3 Mobile (375x667)

- [ ] **Layout Adaptation**
  - [ ] Hamburger menu (if applicable)
  - [ ] Full width content
  - [ ] Vertical scrolling, no horizontal
  - [ ] Touch-friendly buttons

- [ ] **Touch Interactions**
  - [ ] Tap on buttons works smoothly
  - [ ] Map zoom with pinch works
  - [ ] Forms fillable on mobile keyboard

## Section 8: Browser Compatibility

- [ ] **Chrome (Latest)**
  - [ ] All features work
  - [ ] No console errors
  - [ ] Map renders correctly

- [ ] **Firefox (Latest)**
  - [ ] All features work
  - [ ] No console errors

- [ ] **Safari (Latest)**
  - [ ] All features work
  - [ ] Geolocation works

- [ ] **Edge (Latest)**
  - [ ] All features work

## Section 9: Edge Cases

- [ ] **Empty States**
  - [ ] New user with no reports → "No reports yet" message
  - [ ] Empty report list displays correctly
  - [ ] Map displays even with no reports

- [ ] **Long Text**
  - [ ] Very long report title → Proper truncation
  - [ ] Very long description → Scrollable content

- [ ] **Special Characters**
  - [ ] Report with unicode characters: "नगर#निकाय"
  - [ ] Submit and verify display
  - [ ] Database stores correctly

- [ ] **Duplicate Submissions**
  - [ ] File same form twice rapidly
  - [ ] Verify: Only one report created (no double submission)

- [ ] **Rapid Navigation**
  - [ ] Click between tabs quickly
  - [ ] Verify: No crashes or UI glitches
  - [ ] Verify: Correct data loads each time

## Section 10: Performance

- [ ] **Page Load Time**
  - [ ] Open DevTools → Network → Throttle to "Slow 3G"
  - [ ] Reload dashboard
  - [ ] Load time < 5 seconds acceptable?
  - [ ] Yes ✓ / No - investigate

- [ ] **Map Performance**
  - [ ] Add >100 markers on map
  - [ ] Verify: Still responsive
  - [ ] No lag when panning/zooming

- [ ] **Large Dataset**
  - [ ] Load admin dashboard with 1000+ reports
  - [ ] Verify: Still responsive
  - [ ] Verify: Pagination works

## Final Sign-Off

### All Sections Complete?

- [ ] Section 1: Authentication ✓
- [ ] Section 2: Citizen Dashboard ✓
- [ ] Section 3: Admin Dashboard ✓
- [ ] Section 4: Role-Based Access ✓
- [ ] Section 5: API Integration ✓
- [ ] Section 6: Data Persistence ✓
- [ ] Section 7: Responsive Design ✓
- [ ] Section 8: Browser Compatibility ✓
- [ ] Section 9: Edge Cases ✓
- [ ] Section 10: Performance ✓

### Issues Found

Document any issues discovered during testing:

```
Issue #1: [Describe]
  Severity: Low/Medium/High/Critical
  Reproduction: [Steps to reproduce]
  Expected: [Expected behavior]
  Actual: [Actual behavior]
  Status: Open/In Progress/Fixed

Issue #2: [Describe]
  ...
```

### Ready for Next Phase?

- [ ] All critical issues resolved
- [ ] Most features working as expected
- [ ] No blockers for development

**Next Steps:**
- [ ] Google OAuth integration
- [ ] File upload functionality
- [ ] Analytics visualization
- [ ] Additional feature development

---

**Test Date**: ___________  
**Tester**: ___________  
**Status**: ✓ PASSED / ✗ FAILED  
**Notes**: _______________
