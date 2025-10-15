# Security Recommendations for VMS Production Deployment

## 🔒 Critical Security Measures

### 1. Environment Variables & Secrets

#### Change Default Secrets
```bash
# Generate strong JWT secret (32+ characters)
JWT_SECRET="your-super-secure-jwt-secret-key-here-32-chars-minimum"

# Change MongoDB credentials
MONGO_INITDB_ROOT_USERNAME="admin_user_custom"
MONGO_INITDB_ROOT_PASSWORD="super-secure-mongo-password-123!"
```

#### Secure Environment File
```bash
# Set proper permissions on .env file
chmod 600 .env
chown vms:vms .env

# Never commit .env files to version control
echo ".env" >> .gitignore
echo ".env.*" >> .gitignore
```

### 2. Network Security

#### Firewall Configuration
```bash
# Enable UFW firewall
sudo ufw enable

# Allow only necessary ports
sudo ufw allow 22          # SSH
sudo ufw allow 3000        # Frontend
sudo ufw allow 3001        # Backend API
sudo ufw allow 3002        # Data Prep Service
sudo ufw allow 3003        # Face Recognition Service

# Block all other ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

#### SSH Security
```bash
# Disable root login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

# Use key-based authentication (recommended)
# Disable password authentication after setting up keys
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

# Change default SSH port (optional but recommended)
sudo sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config

# Restart SSH service
sudo systemctl restart ssh
```

### 3. SSL/HTTPS Setup

#### Using Let's Encrypt (Recommended)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Install Nginx
sudo apt install nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Nginx Configuration Example
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. Database Security

#### MongoDB Security
```bash
# Enable MongoDB authentication
# In docker-compose.yml, ensure:
MONGO_INITDB_ROOT_USERNAME=admin_user_custom
MONGO_INITDB_ROOT_PASSWORD=super-secure-mongo-password-123!

# Use connection string with authentication
MONGO_DB_CONNECTION_STRING=mongodb://admin_user_custom:super-secure-mongo-password-123!@mongodb:27017/vms?authSource=admin
```

#### Database Backup
```bash
# Create backup script
cat > /home/vms/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/vms/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker exec vms-mongodb mongodump --authenticationDatabase admin \
  -u admin_user_custom -p super-secure-mongo-password-123! \
  --out $BACKUP_DIR/backup_$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -type d -name "backup_*" -mtime +7 -exec rm -rf {} \;
EOF

chmod +x /home/vms/backup-db.sh

# Schedule daily backups
crontab -e
# Add: 0 2 * * * /home/vms/backup-db.sh
```

### 5. Application Security

#### Docker Security
```bash
# Run containers as non-root user
# Add to Dockerfile:
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Limit container resources
# In docker-compose.yml:
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
    reservations:
      cpus: '0.25'
      memory: 256M
```

#### File Permissions
```bash
# Set proper ownership
sudo chown -R vms:vms /home/vms/vms-lts

# Secure file permissions
find /home/vms/vms-lts -type f -exec chmod 644 {} \;
find /home/vms/vms-lts -type d -exec chmod 755 {} \;
chmod +x /home/vms/vms-lts/deploy-to-vps.sh
```

### 6. Monitoring & Logging

#### System Monitoring
```bash
# Install monitoring tools
sudo apt install htop iotop nethogs -y

# Monitor Docker containers
docker stats

# Check logs
docker-compose logs -f --tail=100
```

#### Log Rotation
```bash
# Configure Docker log rotation
# In docker-compose.yml, add to each service:
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

#### Security Monitoring
```bash
# Install fail2ban for SSH protection
sudo apt install fail2ban -y

# Configure fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 7. Regular Maintenance

#### System Updates
```bash
# Create update script
cat > /home/vms/update-system.sh << 'EOF'
#!/bin/bash
sudo apt update
sudo apt upgrade -y
sudo apt autoremove -y
docker system prune -f
EOF

chmod +x /home/vms/update-system.sh

# Schedule weekly updates
crontab -e
# Add: 0 3 * * 0 /home/vms/update-system.sh
```

#### Application Updates
```bash
# Create app update script
cat > /home/vms/update-app.sh << 'EOF'
#!/bin/bash
cd /home/vms/vms-lts
git pull
docker-compose down
docker-compose up --build -d
docker system prune -f
EOF

chmod +x /home/vms/update-app.sh
```

### 8. Backup Strategy

#### Complete Backup Script
```bash
cat > /home/vms/full-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/vms/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/full_backup_$DATE"

mkdir -p $BACKUP_PATH

# Backup database
docker exec vms-mongodb mongodump --authenticationDatabase admin \
  -u admin_user_custom -p super-secure-mongo-password-123! \
  --out $BACKUP_PATH/database

# Backup application files
tar -czf $BACKUP_PATH/app_files.tar.gz /home/vms/vms-lts

# Backup environment files
cp /home/vms/vms-lts/.env $BACKUP_PATH/

# Clean old backups (keep 30 days)
find $BACKUP_DIR -type d -name "full_backup_*" -mtime +30 -exec rm -rf {} \;

echo "Backup completed: $BACKUP_PATH"
EOF

chmod +x /home/vms/full-backup.sh
```

### 9. Security Checklist

- [ ] Changed default JWT_SECRET
- [ ] Changed MongoDB credentials
- [ ] Configured firewall (UFW)
- [ ] Secured SSH access
- [ ] Set up SSL/HTTPS
- [ ] Configured proper file permissions
- [ ] Set up database backups
- [ ] Configured log rotation
- [ ] Installed fail2ban
- [ ] Set up monitoring
- [ ] Scheduled regular updates
- [ ] Created backup strategy

### 10. Emergency Procedures

#### Service Recovery
```bash
# If services fail to start
docker-compose down
docker-compose up -d

# Check logs
docker-compose logs -f

# Restart individual service
docker-compose restart backend
```

#### Database Recovery
```bash
# Restore from backup
docker exec -i vms-mongodb mongorestore --authenticationDatabase admin \
  -u admin_user_custom -p super-secure-mongo-password-123! \
  --drop /backup/path
```

## 🚨 Important Notes

1. **Never expose MongoDB port (27017) to the internet**
2. **Always use strong, unique passwords**
3. **Regularly update all components**
4. **Monitor logs for suspicious activity**
5. **Test backups regularly**
6. **Keep security patches up to date**

## 📞 Support

For security issues or questions:
- Check application logs: `docker-compose logs -f`
- Monitor system resources: `htop`
- Check firewall status: `sudo ufw status`
- Review fail2ban logs: `sudo fail2ban-client status`