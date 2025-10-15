# VMS Docker Deployment Guide

This guide provides comprehensive instructions for deploying the Visitor Management System (VMS) using Docker containers.

## 📋 Prerequisites

Before starting the deployment, ensure you have the following installed:

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: For cloning the repository
- **Minimum System Requirements**:
  - RAM: 4GB (8GB recommended)
  - Storage: 10GB free space
  - CPU: 2 cores (4 cores recommended)

## 🏗️ Architecture Overview

The VMS application consists of 5 main services:

1. **MongoDB**: Database service for data persistence
2. **Backend**: NestJS API server (Port 3001)
3. **Client**: Next.js frontend application (Port 3000)
4. **Data-Prep**: Python service for data processing (Port 3002)
5. **Face-Rec**: Python service for face recognition (Port 3003)

## 🚀 Quick Start (Development)

### Step 1: Clone the Repository
```bash
git clone https://github.com/sauriksolution/vms-lts.git
cd vms-lts
```

### Step 2: Environment Setup
```bash
# Copy environment template
cp .env.production .env

# Edit environment variables (optional for development)
# Update JWT_SECRET, MONGO credentials, etc.
```

### Step 3: Build and Start Services
```bash
# Start all services in development mode
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d
```

### Step 4: Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **GraphQL Playground**: http://localhost:3001/graphql
- **Data Prep Service**: http://localhost:3002
- **Face Recognition Service**: http://localhost:3003
- **MongoDB**: localhost:27017

## 🏭 Production Deployment

### Step 1: Environment Configuration
```bash
# Create production environment file
cp .env.production .env

# Edit .env file with production values
nano .env
```

**Important Environment Variables:**
```env
# Security - CHANGE THESE IN PRODUCTION!
JWT_SECRET=your-super-secure-jwt-secret-key
MONGO_INITDB_ROOT_USERNAME=your-mongo-username
MONGO_INITDB_ROOT_PASSWORD=your-secure-mongo-password

# Database - MongoDB Atlas
MONGO_DB_CONNECTION_STRING=mongodb+srv://vmssauriksolution:9CatOVvR1Hptz5KB@vms.hstsv6w.mongodb.net/vms?retryWrites=true&w=majority&appName=vms

# Service URLs (Internal)
DATA_PREP_URL=http://data-prep:3002
FACE_REC_URL=http://face-rec:3003
BACKEND_URL=http://backend:3001
BACKEND_GRAPHQL_URL=http://backend:3001/graphql

# Client URLs (External)
NEXT_PUBLIC_BACKEND_URL=http://your-domain:3001
NEXT_PUBLIC_BACKEND_GRAPHQL_URL=http://your-domain:3001/graphql
```

### Step 2: Production Deployment
```bash
# Deploy with production configuration
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

## 🔧 Service Management

### Starting Services
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d backend

# Rebuild and start
docker-compose up --build -d
```

### Stopping Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ This will delete data)
docker-compose down -v

# Stop specific service
docker-compose stop backend
```

### Viewing Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f client
docker-compose logs -f mongodb

# View last 100 lines
docker-compose logs --tail=100 backend
```

### Health Checks
```bash
# Check container health
docker ps

# Check service health
docker-compose ps

# Manual health check
curl http://localhost:3000  # Frontend
curl http://localhost:3001  # Backend
curl http://localhost:3002/health  # Data Prep
curl http://localhost:3003/health  # Face Recognition
```

## 🗄️ Database Management

### Initial Setup
The database is automatically initialized with:
- Required collections (users, visitors, invites, etc.)
- Proper indexes for performance
- Validation schemas

### Backup Database
```bash
# Create backup
docker exec vms-mongodb mongodump --db vms --out /backup

# Copy backup to host
docker cp vms-mongodb:/backup ./mongodb-backup
```

### Restore Database
```bash
# Copy backup to container
docker cp ./mongodb-backup vms-mongodb:/backup

# Restore database
docker exec vms-mongodb mongorestore --db vms /backup/vms
```

### Seed Initial Data
```bash
# Run user seeding script
docker exec vms-backend node seed-users.js
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
netstat -tulpn | grep :3000

# Kill the process
sudo kill -9 <PID>

# Or use different ports in docker-compose.yml
```

#### 2. MongoDB Connection Issues
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Test connection
docker exec vms-mongodb mongosh --eval "db.adminCommand('ping')"
```

#### 3. Build Failures
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Check disk space
df -h
```

#### 4. Service Health Check Failures
```bash
# Check service logs
docker-compose logs <service-name>

# Restart specific service
docker-compose restart <service-name>

# Check network connectivity
docker network ls
docker network inspect vms-network
```

### Performance Optimization

#### 1. Resource Limits
The production configuration includes resource limits:
- Backend: 512MB RAM, 0.5 CPU
- Frontend: 256MB RAM, 0.25 CPU
- MongoDB: 1GB RAM, 0.5 CPU

#### 2. Scaling Services
```bash
# Scale backend service
docker-compose up --scale backend=3 -d

# Scale with production config
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --scale backend=2 -d
```

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit `.env` files to version control
- Use strong, unique passwords
- Rotate secrets regularly

### 2. Network Security
- Services communicate through internal Docker network
- Only necessary ports are exposed to host
- Non-root users in containers

### 3. Data Security
- MongoDB data is persisted in Docker volumes
- Regular backups recommended
- Consider encryption at rest for production

## 📊 Monitoring

### Container Monitoring
```bash
# Resource usage
docker stats

# System information
docker system df
docker system info
```

### Application Monitoring
- Health checks are configured for all services
- Logs are available through Docker Compose
- Consider adding monitoring tools like Prometheus/Grafana

## 🔄 Updates and Maintenance

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up --build -d
```

### Database Migrations
```bash
# Run migrations (if any)
docker exec vms-backend npm run migration:run
```

### Cleanup
```bash
# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Complete cleanup (⚠️ Use with caution)
docker system prune -a --volumes
```

## 📞 Support

For issues and support:
1. Check the logs: `docker-compose logs -f`
2. Review this documentation
3. Check GitHub issues
4. Contact the development team

## 🎯 Next Steps

After successful deployment:
1. Configure reverse proxy (Nginx/Apache) for production
2. Set up SSL certificates
3. Configure monitoring and alerting
4. Set up automated backups
5. Configure CI/CD pipeline

---

**Note**: This deployment guide assumes a basic understanding of Docker and containerization. For production deployments, consider additional security measures, monitoring, and backup strategies.