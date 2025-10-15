#!/bin/bash

# VMS Docker Deployment Script
# This script automates the deployment process for the Visitor Management System

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="vms-lts"
COMPOSE_FILE="docker-compose.yml"
PROD_COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env"

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

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running. Please start Docker first."
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

setup_environment() {
    log_info "Setting up environment..."
    
    if [ ! -f "$ENV_FILE" ]; then
        if [ -f ".env.production" ]; then
            log_info "Copying .env.production to .env"
            cp .env.production .env
        else
            log_error "No environment file found. Please create .env file."
            exit 1
        fi
    fi
    
    log_success "Environment setup completed"
}

build_images() {
    log_info "Building Docker images..."
    
    if [ "$1" = "production" ]; then
        docker-compose -f $COMPOSE_FILE -f $PROD_COMPOSE_FILE build --no-cache
    else
        docker-compose build --no-cache
    fi
    
    log_success "Docker images built successfully"
}

start_services() {
    log_info "Starting services..."
    
    if [ "$1" = "production" ]; then
        docker-compose -f $COMPOSE_FILE -f $PROD_COMPOSE_FILE up -d
    else
        docker-compose up -d
    fi
    
    log_success "Services started successfully"
}

check_health() {
    log_info "Checking service health..."
    
    # Wait for services to start
    sleep 10
    
    # Check each service
    services=("backend:3001" "client:3000" "data-prep:3002" "face-rec:3003")
    
    for service in "${services[@]}"; do
        IFS=':' read -r name port <<< "$service"
        log_info "Checking $name service on port $port..."
        
        if curl -f -s "http://localhost:$port" > /dev/null 2>&1; then
            log_success "$name service is healthy"
        else
            log_warning "$name service might not be ready yet"
        fi
    done
}

show_status() {
    log_info "Service status:"
    docker-compose ps
    
    echo ""
    log_info "Access URLs:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend API: http://localhost:3001"
    echo "  GraphQL Playground: http://localhost:3001/graphql"
    echo "  Data Prep Service: http://localhost:3002"
    echo "  Face Recognition Service: http://localhost:3003"
}

cleanup() {
    log_info "Cleaning up..."
    docker-compose down
    docker system prune -f
    log_success "Cleanup completed"
}

backup_data() {
    log_info "Creating database backup..."
    
    # Create backup directory
    mkdir -p backups
    
    # Create backup with timestamp
    timestamp=$(date +"%Y%m%d_%H%M%S")
    backup_file="backups/mongodb_backup_$timestamp"
    
    # Create MongoDB backup
    docker exec ${PROJECT_NAME}_mongodb_1 mongodump --db vms --out /backup
    docker cp ${PROJECT_NAME}_mongodb_1:/backup "$backup_file"
    
    log_success "Database backup created: $backup_file"
}

show_logs() {
    if [ -n "$1" ]; then
        docker-compose logs -f "$1"
    else
        docker-compose logs -f
    fi
}

# Main script
case "$1" in
    "dev"|"development")
        log_info "Starting development deployment..."
        check_prerequisites
        setup_environment
        build_images "development"
        start_services "development"
        check_health
        show_status
        ;;
    "prod"|"production")
        log_info "Starting production deployment..."
        check_prerequisites
        setup_environment
        build_images "production"
        start_services "production"
        check_health
        show_status
        ;;
    "stop")
        log_info "Stopping services..."
        docker-compose down
        log_success "Services stopped"
        ;;
    "restart")
        log_info "Restarting services..."
        docker-compose restart
        check_health
        show_status
        ;;
    "logs")
        show_logs "$2"
        ;;
    "status")
        show_status
        ;;
    "cleanup")
        cleanup
        ;;
    "backup")
        backup_data
        ;;
    "health")
        check_health
        ;;
    *)
        echo "Usage: $0 {dev|prod|stop|restart|logs [service]|status|cleanup|backup|health}"
        echo ""
        echo "Commands:"
        echo "  dev        - Deploy in development mode"
        echo "  prod       - Deploy in production mode"
        echo "  stop       - Stop all services"
        echo "  restart    - Restart all services"
        echo "  logs       - Show logs (optionally for specific service)"
        echo "  status     - Show service status and URLs"
        echo "  cleanup    - Stop services and clean up resources"
        echo "  backup     - Create database backup"
        echo "  health     - Check service health"
        echo ""
        echo "Examples:"
        echo "  $0 dev                 # Start development environment"
        echo "  $0 prod                # Start production environment"
        echo "  $0 logs backend        # Show backend service logs"
        echo "  $0 backup              # Create database backup"
        exit 1
        ;;
esac