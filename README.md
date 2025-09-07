# Campus Event Management Platform

A comprehensive MERN stack application for managing campus events with separate admin portal and student mobile app.

## 🏗️ Architecture

- **Backend**: Node.js + Express.js + MongoDB
- **Admin Portal**: React.js with Tailwind CSS
- **Student App**: React Native with Expo
- **Authentication**: JWT-based authentication
- **File Upload**: Multer for event posters

## 📱 Features

### Admin Portal
- Event creation and management
- Student account management
- Attendance tracking and marking
- Comprehensive reports and analytics
- Real-time dashboard with charts

### Student App
- Browse and search events
- Event registration and unregistration
- View registered events
- Submit feedback for attended events
- Profile management

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Expo CLI (for mobile app)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd campus-event-management
   ```

2. **Install dependencies for all projects**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp backend/config.env.example backend/config.env
   
   # Edit the config.env file with your MongoDB URI and JWT secret
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

5. **Start the development servers**
   ```bash
   # Start both backend and admin portal
   npm run dev
   
   # In a separate terminal, start the mobile app
   cd student-app
   npm start
   ```

## 📁 Project Structure

```
campus-event-management/
├── backend/                 # Node.js + Express API
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Authentication middleware
│   └── uploads/            # File uploads directory
├── admin-portal/           # React.js admin interface
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   └── theme/          # Styling
├── student-app/            # React Native mobile app
│   ├── src/
│   │   ├── screens/        # Mobile screens
│   │   ├── navigation/     # Navigation setup
│   │   ├── contexts/       # React contexts
│   │   └── theme/          # App theme
└── package.json            # Root package.json
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/student/login` - Student login
- `GET /api/auth/admin/me` - Get current admin
- `GET /api/auth/student/me` - Get current student

### Events
- `POST /api/events/create` - Create event (Admin)
- `GET /api/events/list` - List events (Admin)
- `GET /api/events/public` - Public events list
- `PUT /api/events/:id/update` - Update event (Admin)
- `DELETE /api/events/:id/cancel` - Cancel event (Admin)

### Students
- `GET /api/students/list` - List students (Admin)
- `POST /api/students/register-event` - Register for event
- `DELETE /api/students/unregister-event/:id` - Unregister from event

### Attendance
- `POST /api/attendance/mark` - Mark attendance (Admin)
- `GET /api/attendance/:event_id/report` - Get attendance report

### Feedback
- `POST /api/feedback/submit` - Submit feedback
- `GET /api/feedback/:event_id/average` - Get average feedback

### Reports
- `GET /api/reports/popular_events` - Popular events report
- `GET /api/reports/student_participation` - Student participation report
- `GET /api/reports/top_students` - Top students report
- `GET /api/reports/dashboard_stats` - Dashboard statistics

## 🎯 User Roles

### Super Admin
- Create college admins
- Monitor all colleges
- System-wide analytics

### College Admin
- Create and manage events
- Manage student accounts
- Mark attendance
- Generate reports
- Upload event posters

### Student
- Browse events
- Register for events
- View registered events
- Submit feedback
- Manage profile

## 📊 Reports & Analytics

- **Event Popularity**: Sort by registration count
- **Student Participation**: Track attendance per student
- **Attendance Percentage**: (Attended / Registered) * 100
- **Feedback Scores**: Average rating per event
- **Top Students**: Most active participants
- **Event Type Analytics**: Performance by category
- **Monthly Trends**: Attendance patterns over time

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS protection
- File upload security

## 📱 Mobile App Features

- Cross-platform (iOS/Android)
- Offline-friendly design
- Push notifications ready
- Modern UI with React Native Paper
- Smooth navigation
- Image caching for event posters

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev  # Starts with nodemon
```

### Admin Portal Development
```bash
cd admin-portal
npm start    # Starts React development server
```

### Mobile App Development
```bash
cd student-app
npm start    # Starts Expo development server
```

## 📦 Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use a production MongoDB instance
3. Set secure JWT secret
4. Configure file upload limits
5. Set up reverse proxy (nginx)

### Admin Portal
```bash
cd admin-portal
npm run build
# Deploy the build folder to your web server
```

### Mobile App
```bash
cd student-app
expo build:android  # For Android
expo build:ios      # For iOS
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔮 Future Enhancements

- Push notifications for event updates
- QR code check-in system
- Social media integration
- Advanced analytics dashboard
- Multi-language support
- Offline mode for mobile app
- Event calendar integration
- Email notifications
- Advanced search and filtering
- Event categories and tags
