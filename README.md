# Intelligent Visitor Management System (VMS)

<body>
  <div class="vms-container">
    <div class="vms-title">VMS</div>
    <div class="vms-subtitle">Virtual Management System</div>
  </div>
</body>

## 📐 About The Project

The Intelligent Visitor Management System (VMS) is a comprehensive, AI-powered platform designed to revolutionize building security and visitor management. Built for residential complexes, office buildings, and gated communities, this system provides a seamless experience for residents, receptionists, and administrators while maintaining the highest security standards.

### 🎯 Key Objectives
- **Enhanced Security**: Multi-layered authentication with facial recognition
- **Intelligent Analytics**: AI-powered visitor predictions and insights
- **User Experience**: Intuitive interfaces for all user types
- **Scalability**: Modular architecture supporting growth
- **Automation**: Streamlined processes reducing manual intervention

## 🏗️ System Architecture

### Frontend Architecture
- **Framework**: Next.js 12+ with React 17
- **Styling**: Tailwind CSS with DaisyUI components
- **State Management**: Zustand for lightweight state management
- **Authentication**: JWT-based with role-based access control
- **API Communication**: Apollo Client for GraphQL integration
- **Animations**: Framer Motion for smooth UI transitions
- **Testing**: Jest with React Testing Library
- **E2E Testing**: Cypress for comprehensive testing

### Backend Architecture
- **Framework**: NestJS with TypeScript
- **API**: GraphQL with Apollo Server
- **Architecture Pattern**: CQRS (Command Query Responsibility Segregation)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with Passport strategies
- **Caching**: Built-in NestJS caching
- **Email Service**: Nodemailer integration
- **File Handling**: Multer for file uploads
- **Testing**: Jest with comprehensive unit and integration tests

### AI/ML Components

#### 1. Data Preparation Service (Python)
- **Framework**: Flask
- **ML Libraries**: scikit-learn, numpy, pandas
- **Scheduling**: APScheduler for automated tasks
- **Models**: 
  - Visitor prediction regression model
  - Parking demand forecasting model
- **Features**:
  - Time-series analysis for visitor patterns
  - Holiday detection and adjustment
  - Seasonal trend analysis
  - Real-time prediction caching

#### 2. Face Recognition Service (Python)
- **Framework**: Flask
- **Computer Vision**: OpenCV, face-recognition library
- **ML Framework**: scikit-learn for classification
- **Features**:
  - Real-time face detection and recognition
  - Visitor identity verification
  - Anti-spoofing measures
  - Model training and updates

### Database Design

#### Core Collections
- **Users**: Admin, Receptionist, Resident profiles
- **Invites**: Visitor invitation management
- **Visitors**: Visitor profiles and history
- **Parking**: Parking space management and reservations
- **Restrictions**: System-wide rules and limitations
- **Rewards**: Gamification and badge system
- **GroupInvites**: Aggregated invitation analytics

## 🚀 Features Overview

### 👥 Multi-Role System

#### Administrator (Permission Level 0)
- **Dashboard**: Comprehensive system overview
- **User Management**: Authorize/deauthorize users
- **Analytics**: Advanced reporting and insights
- **System Configuration**: Manage restrictions and settings
- **Parking Management**: Configure parking spaces
- **Bulk Operations**: Mass user management

#### Receptionist (Permission Level 1)
- **Visitor Check-in/Check-out**: Front desk operations
- **Real-time Monitoring**: Active visitor tracking
- **Resident Management**: Basic resident operations
- **Parking Assignment**: Manage visitor parking
- **Emergency Access**: Override capabilities

#### Resident (Permission Level 2)
- **Invite Creation**: Generate visitor invitations
- **QR Code Generation**: Secure visitor access codes
- **Visitor History**: Personal visitor analytics
- **Parking Requests**: Reserve parking for visitors
- **Profile Management**: Personal settings and preferences

### 🤖 AI-Powered Features

#### Visitor Prediction Engine
- **Time-series Forecasting**: Predict visitor volumes
- **Pattern Recognition**: Identify recurring visitors
- **Seasonal Adjustments**: Account for holidays and events
- **Resource Planning**: Optimize staffing and parking

#### Intelligent Suggestions
- **Frequent Visitor Detection**: Auto-suggest regular visitors
- **Optimal Timing**: Recommend best visit times
- **Parking Optimization**: Smart parking allocation
- **Anomaly Detection**: Identify unusual patterns

#### Facial Recognition System
- **Identity Verification**: Confirm visitor identity
- **Security Enhancement**: Prevent unauthorized access
- **Contactless Check-in**: Touchless visitor processing
- **Audit Trail**: Complete visitor verification logs

### 📊 Analytics & Reporting

#### Real-time Dashboards
- **Live Visitor Count**: Current building occupancy
- **Parking Utilization**: Real-time parking status
- **Security Alerts**: Immediate threat notifications
- **System Health**: Infrastructure monitoring

#### Historical Analytics
- **Visitor Trends**: Long-term pattern analysis
- **Peak Time Analysis**: Identify busy periods
- **Resident Behavior**: Usage pattern insights
- **Security Reports**: Incident tracking and analysis

#### Predictive Analytics
- **Demand Forecasting**: Future visitor predictions
- **Resource Planning**: Optimize resource allocation
- **Capacity Management**: Prevent overcrowding
- **Maintenance Scheduling**: Predictive maintenance alerts

### 🎮 Gamification System

#### Rewards & Badges
- **XP System**: Experience points for good behavior
- **Achievement Badges**: Various accomplishment levels
- **Leaderboards**: Community engagement
- **Incentives**: Extra privileges for active users

#### Badge Categories
- **Invite Master**: Frequent invite creators
- **Punctual Host**: On-time visitor management
- **Security Champion**: Following security protocols
- **Community Helper**: Assisting other residents

## 🛠️ Technology Stack

### Frontend Technologies
```json
{
  "core": {
    "next": "^12.2.3",
    "react": "^17.0.2",
    "react-dom": "^17.0.2"
  },
  "styling": {
    "tailwindcss": "^3.0.7",
    "daisyui": "^2.14.3",
    "framer-motion": "^6.3.3"
  },
  "state_management": {
    "zustand": "^4.0.0-rc.1",
    "@apollo/client": "^3.6.2"
  },
  "forms_validation": {
    "formik": "^2.2.9"
  },
  "charts_visualization": {
    "chart.js": "^3.8.0",
    "react-chartjs-2": "^4.1.0"
  },
  "utilities": {
    "axios": "^0.27.2",
    "jwt-decode": "^3.1.2",
    "react-qr-reader": "^3.0.0-beta-1"
  }
}
```

### Backend Technologies
```json
{
  "core": {
    "@nestjs/core": "^8.0.0",
    "@nestjs/common": "^8.4.6",
    "@nestjs/graphql": "^10.0.10"
  },
  "database": {
    "@nestjs/mongoose": "^9.0.3",
    "mongoose": "^6.3.1"
  },
  "authentication": {
    "@nestjs/jwt": "^8.0.0",
    "@nestjs/passport": "^8.2.1",
    "bcrypt": "^5.0.1",
    "passport-jwt": "^4.0.0"
  },
  "architecture": {
    "@nestjs/cqrs": "^8.0.3",
    "@nestjs/schedule": "^2.1.0"
  },
  "utilities": {
    "nodemailer": "^6.7.5",
    "qrcode": "^1.5.0",
    "multer": "^1.4.5-lts.1"
  }
}
```

### AI/ML Technologies
```python
# Data Preparation Service
Flask==2.1.3
scikit-learn==1.1.1
numpy==1.23.1
pandas==1.4.3
APScheduler==3.9.1
pymongo==4.1.1
joblib==1.1.0

# Face Recognition Service
Flask==2.2.2
face-recognition
opencv-python==4.6.0.66
scikit-learn==1.1.2
Pillow==9.2.0
numpy==1.23.3
```

## 📋 Prerequisites

### System Requirements
- **Node.js**: v16.x or higher
- **Python**: 3.8+ (for AI services)
- **MongoDB**: 4.4+ (local or cloud)
- **Git**: Latest version
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: 10GB free space

### Development Tools
- **Code Editor**: VS Code (recommended)
- **API Testing**: Postman or GraphQL Playground
- **Database GUI**: MongoDB Compass
- **Version Control**: Git

## 🚀 Installation & Setup

### 1. Repository Setup
```bash
# Clone the repository
git clone https://github.com/COS301-SE-2022/Intelligent-VMS-Visitor-Management-System-.git
cd Intelligent-VMS-Visitor-Management-System-

# Install root dependencies
npm install
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure environment variables
# Edit .env file with your settings:
# MONGO_DB_CONNECTION_STRING=mongodb://localhost:27017/vms
# JWT_SECRET=your-super-secret-jwt-key
# MAIL_HOST=smtp.gmail.com
# MAIL_USER=your-email@gmail.com
# MAIL_PASS=your-app-password
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd ../client

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Configure environment variables
# Edit .env.local file:
# BACKEND_GRAPHQL_URL=http://localhost:3001/graphql
# BACKEND_URL=http://localhost:3001
```

### 4. AI Services Setup

#### Data Preparation Service
```bash
# Navigate to data-prep directory
cd ../data-prep

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with MongoDB connection string
```

#### Face Recognition Service
```bash
# Navigate to face-rec directory
cd ../face-rec

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
```

### 5. Database Setup

#### MongoDB Installation
```bash
# Install MongoDB Community Edition
# Follow official MongoDB installation guide for your OS

# Start MongoDB service
# Windows: Start MongoDB service from Services
# macOS: brew services start mongodb/brew/mongodb-community
# Linux: sudo systemctl start mongod
```

#### Database Seeding
```bash
# Navigate to backend directory
cd backend

# Seed database with demo users
node seed-users.js

# Verify seeding
node check-all-users.js
```

## 🏃‍♂️ Running the Application

### Development Mode

#### 1. Start Backend Services
```bash
# Terminal 1: Backend API
cd backend
npm run start:dev
# Server runs on http://localhost:3001
# GraphQL Playground: http://localhost:3001/graphql

# Terminal 2: Data Preparation Service
cd data-prep
python app.py
# Service runs on http://localhost:3002

# Terminal 3: Face Recognition Service
cd face-rec
python app.py
# Service runs on http://localhost:3003
```

#### 2. Start Frontend
```bash
# Terminal 4: Frontend Application
cd client
npm run dev
# Application runs on http://localhost:3000
```

### Production Mode

#### Backend Production Build
```bash
cd backend
npm run build
npm run start:prod
```

#### Frontend Production Build
```bash
cd client
npm run build
npm start
```

## 👥 Demo User Credentials

After running the seeding script, use these test accounts:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | `admin@vms.com` | `Admin123!` | Full system access, user management, analytics |
| **Receptionist** | `receptionist@vms.com` | `Reception123!` | Visitor check-in/out, resident management |
| **Resident** | `resident1@vms.com` | `Resident123!` | Create invites, manage visitors |
| **Resident** | `resident2@vms.com` | `Resident123!` | Create invites, manage visitors |

### Permission Levels
- **Level 0 (Admin)**: Complete system control
- **Level 1 (Receptionist)**: Front desk operations
- **Level 2 (Resident)**: Personal visitor management
- **Level -1 to -3**: Pending authorization
- **Level -999**: Expired/invalid session

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Unit tests
npm run test

# Integration tests
npm run test:int

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Testing
```bash
cd client

# Unit tests
npm run test

# Integration tests
npm run test:integration

# Coverage report
npm run test:cov

# Cypress E2E tests
npm run cypress

# Headless E2E tests
npm run cypress:headless
```

### AI Services Testing
```bash
# Data preparation service
cd data-prep
python -m pytest app/tests/

# Face recognition service
cd face-rec
python -m pytest tests/
```

## 📊 API Documentation

### GraphQL Schema
The system uses GraphQL for API communication. Key operations include:

#### Queries
- `getInvites`: Retrieve visitor invitations
- `getUsers`: Fetch user information
- `getVisitors`: Get visitor data
- `getParkingStatus`: Check parking availability
- `getAnalytics`: Fetch system analytics

#### Mutations
- `login`: User authentication
- `createInvite`: Generate visitor invitation
- `signIn/signOut`: Visitor check-in/out
- `authorizeUser`: Approve user accounts
- `reserveParking`: Book parking spaces

#### Subscriptions
- Real-time visitor updates
- Live parking status changes
- System notifications

### REST Endpoints (AI Services)

#### Data Preparation Service (Port 3002)
```
GET  /api/predictions/{startDate}/{endDate}  # Visitor predictions
POST /api/train-model                        # Retrain ML models
GET  /api/analytics/trends                   # Trend analysis
```

#### Face Recognition Service (Port 3003)
```
POST /api/face/register    # Register new face
POST /api/face/verify      # Verify visitor identity
POST /api/face/train       # Train recognition model
GET  /api/face/status      # Service health check
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
MONGO_DB_CONNECTION_STRING=mongodb://localhost:27017/vms

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRATION=24h

# Email Service
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM=noreply@vms.com

# External Services
DATA_PREP_URL=http://localhost:3002
FACE_REC_URL=http://localhost:3003

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100

# File Upload
MAX_FILE_SIZE=50mb
UPLOAD_PATH=./uploads
```

#### Frontend (.env.local)
```env
# API Endpoints
BACKEND_GRAPHQL_URL=http://localhost:3001/graphql
BACKEND_URL=http://localhost:3001

# External Services
DATA_PREP_URL=http://localhost:3002
FACE_REC_URL=http://localhost:3003

# Application
NEXT_PUBLIC_APP_NAME=Intelligent VMS
NEXT_PUBLIC_APP_VERSION=1.0.0

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

#### AI Services (.env)
```env
# Database
MONGO_DB_CONNECTION_STRING=mongodb://localhost:27017/vms

# Service Configuration
PORT=3002  # or 3003 for face-rec
FLASK_ENV=development
FLASK_DEBUG=False

# ML Model Paths
VISITOR_MODEL_PATH=./models/visitor-model.pkl
PARKING_MODEL_PATH=./models/parking-model.pkl
FACE_MODEL_PATH=./models/face-model.pkl

# Scheduler
SCHEDULER_TIMEZONE=UTC
MODEL_RETRAIN_INTERVAL=24  # hours
```

## 🚀 Deployment

### Docker Deployment

#### Compose (Backend, Frontend, AI services, MongoDB)

The repository includes a `docker-compose.yml` that spins up the full stack:

Services:
- `mongodb`: MongoDB database
- `backend`: NestJS GraphQL API on `http://localhost:3001`
- `client`: Next.js frontend on `http://localhost:3000`
- `data-prep`: Flask AI service on `http://localhost:3002`
- `face-rec`: Flask Face Recognition service on `http://localhost:3003`

Steps:
```bash
# 1) Ensure Docker and Docker Compose are installed
# 2) (Optional) Review .env.docker and adjust secrets
# 3) Build and start all services
docker compose up -d --build

# 4) Check container logs
docker compose logs -f backend
docker compose logs -f client

# 5) Seed demo users (run once)
docker compose exec backend node seed-users.js

# 6) Verify
# Frontend: http://localhost:3000
# GraphQL:  http://localhost:3001/graphql
```

Shutdown:
```bash
docker compose down
# Remove volumes as well (MongoDB data)
docker compose down -v
```

### Cloud Deployment

#### Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd client
vercel --prod
```

#### Heroku (Backend & AI Services)
```bash
# Backend
heroku create vms-backend
heroku config:set MONGO_DB_CONNECTION_STRING=your-mongodb-uri
git subtree push --prefix backend heroku main

# AI Services
heroku create vms-data-prep
heroku create vms-face-rec
```

#### MongoDB Atlas (Database)
1. Create MongoDB Atlas cluster
2. Configure network access
3. Create database user
4. Update connection strings in environment variables

### CI/CD Pipeline

The project includes GitHub Actions workflows:

- **Frontend Deploy**: Automated Vercel deployment
- **Backend Deploy**: Heroku deployment
- **Code Quality**: ESLint, Prettier, Tests
- **Security**: Dependency vulnerability scanning

## 📈 Performance Optimization

### Frontend Optimizations
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Caching**: Apollo Client caching strategies
- **Bundle Analysis**: webpack-bundle-analyzer
- **Lazy Loading**: Component-level lazy loading

### Backend Optimizations
- **Database Indexing**: Optimized MongoDB indexes
- **Query Optimization**: Efficient GraphQL resolvers
- **Caching**: Redis-compatible caching layer
- **Connection Pooling**: MongoDB connection optimization
- **Rate Limiting**: API protection and throttling

### AI Service Optimizations
- **Model Caching**: Pre-loaded ML models
- **Batch Processing**: Efficient data processing
- **Async Operations**: Non-blocking AI operations
- **Resource Management**: Memory and CPU optimization

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure stateless authentication
- **Role-Based Access**: Granular permission system
- **Password Hashing**: bcrypt with salt rounds
- **Session Management**: Secure token handling

### Data Protection
- **Input Validation**: Comprehensive data sanitization
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy
- **CORS Configuration**: Controlled cross-origin requests

### Privacy & Compliance
- **Data Encryption**: Sensitive data encryption
- **Audit Logging**: Comprehensive activity logs
- **GDPR Compliance**: Data protection measures
- **Secure File Upload**: File type and size validation

## 🐛 Troubleshooting

### Common Issues

#### Backend Issues
```bash
# MongoDB connection failed
# Check MongoDB service status
sudo systemctl status mongod

# Port already in use
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# GraphQL schema errors
# Regenerate schema
npm run build
```

#### Frontend Issues
```bash
# Build failures
# Clear Next.js cache
rm -rf .next
npm run build

# Apollo Client errors
# Clear Apollo cache
# Restart development server
```

#### AI Service Issues
```bash
# Python dependency conflicts
# Recreate virtual environment
rm -rf venv
python -m venv venv
pip install -r requirements.txt

# Model loading errors
# Check model file paths and permissions
```

### Debug Mode

#### Backend Debug
```bash
npm run start:debug
# Debugger available on port 9229
```

#### Frontend Debug
```bash
# Enable debug mode
NODE_ENV=development npm run dev
```

## 📚 Additional Resources

### Documentation
- [API Documentation](./backend/README.md)
- [Frontend Documentation](./client/README.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Deployment Guide](./docs/deployment.md)
- [Security Guidelines](./docs/security.md)

### Learning Resources
- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [GraphQL Documentation](https://graphql.org/learn/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](./CONTRIBUTING.md) for details on:

- Code of conduct
- Development process
- Pull request procedure
- Coding standards
- Testing requirements

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
