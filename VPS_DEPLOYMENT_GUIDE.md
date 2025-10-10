# VMS VPS Deployment Guide

## 🚀 Deployment to VPS Server: 185.229.119.76

This guide provides step-by-step instructions for deploying the VMS application to your VPS server.

### 📋 Server Information
- **IP Address**: 185.229.119.76
- **Username**: vms
- **Password**: 1V@vms1

### 🔧 Prerequisites

Before starting, ensure your VPS has the following installed:

#### 1. Connect to Your VPS
```bash
ssh vms@185.229.119.76
# Enter password: 1V@vms1
```

#### 2. Install Docker (if not already installed)
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker vms

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

#### 3. Install Git (if not already installed)
```bash
sudo apt install git -y
```

### 🚀 Deployment Steps

#### Step 1: Clone the Repository
```bash
# Navigate to home directory
cd ~

# Clone the VMS repository
git clone https://github.com/your-username/vms-lts.git
cd vms-lts

# Or if you're uploading files manually, create the directory
mkdir -p ~/vms-lts
cd ~/vms-lts
```

#### Step 2: Configure Environment Variables
```bash
# Copy the VPS-specific environment file
cp .env.vps .env

# Edit environment variables if needed
nano .env
```

**Important Environment Variables to Verify:**
- `JWT_SECRET`: Change to a secure random string
- `MONGO_INITDB_ROOT_PASSWORD`: Change to a secure password
- `SESSION_SECRET`: Change to a secure random string
- All URLs should point to `185.229.119.76`

#### Step 3: Configure Firewall (Ubuntu/Debian)
```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH (important - don't lock yourself out!)
sudo ufw allow 22

# Allow application ports
sudo ufw allow 3000  # Frontend
sudo ufw allow 3001  # Backend
sudo ufw allow 3002  # Data Prep Service
sudo ufw allow 3003  # Face Recognition Service

# Check firewall status
sudo ufw status
```

#### Step 4: Deploy the Application
```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Run deployment (this will build and start all services)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

# Or use the automated script
./scripts/deploy.sh
```

#### Step 5: Verify Deployment
```bash
# Check if all containers are running
docker-compose ps

# Check logs for any errors
docker-compose logs -f

# Test individual services
curl http://localhost:3001/health  # Backend health check
curl http://localhost:3000         # Frontend
```

### 🌐 Access Your Application

After successful deployment, access your VMS application at:

- **Frontend (Main Application)**: http://185.229.119.76:3000
- **Backend API**: http://185.229.119.76:3001
- **GraphQL Playground**: http://185.229.119.76:3001/graphql
- **Data Prep Service**: http://185.229.119.76:3002
- **Face Recognition Service**: http://185.229.119.76:3003

### 🔧 Management Commands

#### View Logs
```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f client
docker-compose logs -f mongodb
```

#### Restart Services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
```

#### Update Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

#### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ This will delete data)
docker-compose down -v
```

### 🔒 Security Recommendations

#### 1. Change Default Passwords
```bash
# Edit .env file and change:
nano .env
# - JWT_SECRET
# - MONGO_INITDB_ROOT_PASSWORD  
# - SESSION_SECRET
```

#### 2. Setup SSL/HTTPS (Recommended)
```bash
# Install Nginx
sudo apt install nginx -y

# Install Certbot for Let's Encrypt SSL
sudo apt install certbot python3-certbot-nginx -y

# Configure Nginx reverse proxy (create config file)
sudo nano /etc/nginx/sites-available/vms
```

#### 3. Regular Backups
```bash
# Create backup script
nano ~/backup-vms.sh

# Add backup commands for MongoDB data
# Schedule with cron for regular backups
```

### 🐛 Troubleshooting

#### Common Issues:

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   sudo netstat -tulpn | grep :3000
   
   # Kill process if needed
   sudo kill -9 <PID>
   ```

2. **Docker Permission Denied**
   ```bash
   # Add user to docker group
   sudo usermod -aG docker vms
   
   # Logout and login again
   exit
   ssh vms@185.229.119.76
   ```

3. **Services Not Starting**
   ```bash
   # Check Docker logs
   docker-compose logs backend
   
   # Check system resources
   free -h
   df -h
   ```

4. **Database Connection Issues**
   ```bash
   # Check MongoDB container
   docker-compose logs mongodb
   
   # Verify environment variables
   cat .env | grep MONGO
   ```

### 📊 Monitoring

#### Check System Resources
```bash
# Check memory usage
free -h

# Check disk usage
df -h

# Check running processes
htop

# Check Docker container stats
docker stats
```

#### Health Checks
```bash
# Backend health
curl http://185.229.119.76:3001/health

# Check all services
docker-compose ps
```

### 🔄 Maintenance

#### Regular Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker-compose pull
docker-compose up -d
```

#### Log Rotation
```bash
# Configure Docker log rotation
sudo nano /etc/docker/daemon.json

# Add log rotation settings
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}

# Restart Docker
sudo systemctl restart docker
```

---

## 🆘 Support

If you encounter any issues during deployment:

1. Check the logs: `docker-compose logs -f`
2. Verify environment variables: `cat .env`
3. Check system resources: `free -h` and `df -h`
4. Ensure all ports are open in firewall
5. Verify Docker and Docker Compose are properly installed

For additional help, refer to the main `DOCKER_DEPLOYMENT.md` file or create an issue in the repository.