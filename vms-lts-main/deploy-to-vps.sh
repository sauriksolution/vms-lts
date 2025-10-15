#!/bin/bash

# VMS VPS Deployment Script
# Server: 185.229.119.76
# User: vms

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VPS_IP="185.229.119.76"
VPS_USER="vms"
PROJECT_NAME="vms-lts"
REMOTE_DIR="/home/vms/vms-lts"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're running locally or on VPS
check_environment() {
    if [[ $(hostname -I | grep -c "185.229.119.76") -eq 1 ]]; then
        log_info "Running on VPS server"
        DEPLOY_MODE="local"
    else
        log_info "Running from local machine - will deploy to VPS"
        DEPLOY_MODE="remote"
    fi
}

# Install prerequisites on VPS
install_prerequisites() {
    log_info "Installing prerequisites on VPS..."
    
    # Update system
    sudo apt update && sudo apt upgrade -y
    
    # Install Docker if not present
    if ! command -v docker &> /dev/null; then
        log_info "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
    fi
    
    # Install Docker Compose if not present
    if ! command -v docker-compose &> /dev/null; then
        log_info "Installing Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi
    
    # Install Git if not present
    if ! command -v git &> /dev/null; then
        log_info "Installing Git..."
        sudo apt install git -y
    fi
    
    log_success "Prerequisites installed successfully"
}

# Configure firewall
configure_firewall() {
    log_info "Configuring firewall..."
    
    # Enable UFW if not enabled
    sudo ufw --force enable
    
    # Allow SSH (important!)
    sudo ufw allow 22
    
    # Allow application ports
    sudo ufw allow 3000  # Frontend
    sudo ufw allow 3001  # Backend
    sudo ufw allow 3002  # Data Prep
    sudo ufw allow 3003  # Face Recognition
    
    log_success "Firewall configured successfully"
}

# Deploy application locally (on VPS)
deploy_local() {
    log_info "Deploying VMS application locally on VPS..."
    
    # Navigate to project directory
    cd $REMOTE_DIR
    
    # Copy VPS environment configuration
    if [[ -f ".env.vps" ]]; then
        cp .env.vps .env
        log_success "VPS environment configuration copied"
    else
        log_warning ".env.vps not found, using .env.production"
        cp .env.production .env
        
        # Update URLs for VPS IP
        sed -i "s/localhost/${VPS_IP}/g" .env
        sed -i "s/127.0.0.1/${VPS_IP}/g" .env
    fi
    
    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose down || true
    
    # Build and start services
    log_info "Building and starting services..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
    
    # Wait for services to start
    log_info "Waiting for services to start..."
    sleep 30
    
    # Check service health
    check_services
}

# Deploy from remote machine
deploy_remote() {
    log_info "Deploying to VPS from local machine..."
    
    # Create remote directory
    ssh ${VPS_USER}@${VPS_IP} "mkdir -p ${REMOTE_DIR}"
    
    # Copy project files to VPS
    log_info "Copying project files to VPS..."
    rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' ./ ${VPS_USER}@${VPS_IP}:${REMOTE_DIR}/
    
    # Execute deployment on VPS
    log_info "Executing deployment on VPS..."
    ssh ${VPS_USER}@${VPS_IP} "cd ${REMOTE_DIR} && chmod +x deploy-to-vps.sh && ./deploy-to-vps.sh"
}

# Check service health
check_services() {
    log_info "Checking service health..."
    
    # Wait a bit more for services to fully start
    sleep 10
    
    # Check Docker containers
    docker-compose ps
    
    # Check individual services
    services=("3001" "3000" "3002" "3003")
    for port in "${services[@]}"; do
        if curl -f -s http://localhost:$port > /dev/null 2>&1; then
            log_success "Service on port $port is running"
        else
            log_warning "Service on port $port may not be ready yet"
        fi
    done
    
    # Show logs for any failed services
    failed_services=$(docker-compose ps --services --filter "status=exited")
    if [[ -n "$failed_services" ]]; then
        log_error "Some services failed to start:"
        echo "$failed_services"
        log_info "Showing logs for failed services..."
        docker-compose logs $failed_services
    fi
}

# Show deployment summary
show_summary() {
    log_success "Deployment completed!"
    echo ""
    echo "🌐 Access your VMS application at:"
    echo "   Frontend:     http://${VPS_IP}:3000"
    echo "   Backend API:  http://${VPS_IP}:3001"
    echo "   GraphQL:      http://${VPS_IP}:3001/graphql"
    echo "   Data Prep:    http://${VPS_IP}:3002"
    echo "   Face Rec:     http://${VPS_IP}:3003"
    echo ""
    echo "📊 Management commands:"
    echo "   View logs:    docker-compose logs -f"
    echo "   Restart:      docker-compose restart"
    echo "   Stop:         docker-compose down"
    echo "   Update:       git pull && docker-compose up --build -d"
    echo ""
    echo "🔒 Security reminders:"
    echo "   - Change JWT_SECRET in .env file"
    echo "   - Change MongoDB passwords"
    echo "   - Consider setting up SSL/HTTPS"
    echo "   - Regular backups recommended"
}

# Main deployment function
main() {
    log_info "Starting VMS deployment to VPS ${VPS_IP}..."
    
    check_environment
    
    if [[ "$DEPLOY_MODE" == "local" ]]; then
        # Running on VPS
        install_prerequisites
        configure_firewall
        deploy_local
    else
        # Running from local machine
        deploy_remote
        return
    fi
    
    show_summary
}

# Run main function
main "$@"