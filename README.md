# Civic Issue Reporting and Resolution System

A crowdsourced civic issue reporting platform built with the MERN stack (MongoDB, Express, React, Node.js) that empowers citizens to report local infrastructure issues and enables municipalities to track and resolve them efficiently.

## 🌟 Features

### Citizen Features
- **Easy Issue Reporting**: Submit reports with photos, location tagging, and voice descriptions
- **Live City Map**: View all reported issues on an interactive map
- **Track Progress**: Monitor the status of submitted reports in real-time
- **Upvote & Comment**: Support other citizens and add comments to reports
- **Notifications**: Receive updates on report status changes

### Administrative Features
- **Centralized Dashboard**: View all reports with advanced filtering and sorting
- **Automated Routing**: Reports automatically routed to relevant departments
- **Report Management**: Assign, update status, and resolve reports
- **Analytics**: Insights into reporting trends, department response times, and system effectiveness
- **Multi-Department Support**: Handle different civic issue categories

## 📋 Project Structure

```
Civic-Issue/
├── server/                           # Backend
│   ├── config/                       # Configuration files
│   │   ├── database.js
│   │   └── cloudinary.js
│   ├── models/                       # MongoDB schemas
│   │   ├── User.js
│   │   └── Report.js
│   ├── routes/                       # API routes
│   │   ├── auth.routes.js
│   │   ├── reports.routes.js
│   │   ├── users.routes.js
│   │   ├── admin.routes.js
│   │   └── analytics.routes.js
│   ├── middleware/                   # Express middleware
│   │   ├── auth.middleware.js
│   │   └── errorHandler.middleware.js
│   ├── controllers/                  # Business logic
│   ├── server.js                     # Entry point
│   ├── package.json
│   └── .env.example
│
├── client/                           # Frontend
│   ├── src/
│   │   ├── components/               # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/                    # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── ReportDetailPage.jsx
│   │   ├── services/                 # API services
│   │   │   └── api.js
│   │   ├── redux/                    # State management
│   │   │   ├── store.js
│   │   │   ├── authSlice.js
│   │   │   └── reportSlice.js
│   │   ├── utils/                    # Utility functions
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   │   └── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **Node.js & Express.js** - Server framework
- **MongoDB & Mongoose** - Database and ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Cloudinary** - Image storage

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Leaflet & React-Leaflet** - Interactive maps
- **Axios** - HTTP client

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Server Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example` and configure:
```bash
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. Start the server:
```bash
npm run dev  # Development with auto-reload
npm start    # Production
```

### Client Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Reports
- `GET /api/reports` - Get all reports (with filters)
- `POST /api/reports` - Create new report
- `GET /api/reports/:id` - Get report details
- `PATCH /api/reports/:id/status` - Update report status
- `POST /api/reports/:id/upvote` - Upvote report

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Admin
- `GET /api/admin/reports` - Get all reports (admin)
- `PATCH /api/admin/reports/:id/assign` - Assign report
- `PATCH /api/admin/reports/:id/resolve` - Resolve report
- `GET /api/admin/stats` - Get dashboard statistics

### Analytics
- `GET /api/analytics/by-category` - Reports by category
- `GET /api/analytics/by-status` - Reports by status
- `GET /api/analytics/response-times` - Department response times

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Authorization middleware for protected routes
- Input validation
- CORS configuration
- Environment variables for sensitive data

## 📊 Database Schema

### User Schema
- Personal information
- Authentication credentials
- Role-based access (citizen, department, admin)
- Report statistics

### Report Schema
- Issue details and description
- Category and priority classification
- Geolocation with MongoDB 2dsphere index
- Image and voice note storage
- Status tracking
- Department routing
- Comments and upvotes

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 📈 Deployment

### Server (Heroku/Railway/Render)
```bash
# Create Procfile in server directory
web: node server.js

# Push to platform
```

### Client (Vercel/Netlify)
```bash
npm run build
# Deploy dist folder
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Backend Developer**: [Your Name]
- **Frontend Developer**: [Your Name]
- **UI/UX Designer**: [Your Name]
- **Project Manager**: [Your Name]

## 📞 Support

For support, email support@civicissue.com or create an issue in the GitHub repository.

## 🎯 Future Enhancements

- [ ] Mobile app (React Native/Flutter)
- [ ] SMS notifications
- [ ] Real-time updates with WebSocket
- [ ] AI-powered image analysis
- [ ] ML-based priority prediction
- [ ] Integration with municipal systems
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Offline-first capability
- [ ] Social media integration

---

**Made with ❤️ by the Civic Issue Reporter Team**
