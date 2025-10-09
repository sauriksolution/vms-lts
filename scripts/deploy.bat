@echo off
REM VMS Docker Deployment Script for Windows
REM This script automates the deployment process for the Visitor Management System

setlocal enabledelayedexpansion

REM Configuration
set PROJECT_NAME=vms-lts
set COMPOSE_FILE=docker-compose.yml
set PROD_COMPOSE_FILE=docker-compose.prod.yml
set ENV_FILE=.env

REM Functions
:log_info
echo [INFO] %~1
goto :eof

:log_success
echo [SUCCESS] %~1
goto :eof

:log_warning
echo [WARNING] %~1
goto :eof

:log_error
echo [ERROR] %~1
goto :eof

:check_prerequisites
call :log_info "Checking prerequisites..."

REM Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    call :log_error "Docker is not installed. Please install Docker Desktop first."
    exit /b 1
)

REM Check Docker Compose
docker-compose --version >nul 2>&1
if errorlevel 1 (
    call :log_error "Docker Compose is not installed. Please install Docker Compose first."
    exit /b 1
)

REM Check if Docker daemon is running
docker info >nul 2>&1
if errorlevel 1 (
    call :log_error "Docker daemon is not running. Please start Docker Desktop first."
    exit /b 1
)

call :log_success "Prerequisites check passed"
goto :eof

:setup_environment
call :log_info "Setting up environment..."

if not exist "%ENV_FILE%" (
    if exist ".env.production" (
        call :log_info "Copying .env.production to .env"
        copy .env.production .env >nul
    ) else (
        call :log_error "No environment file found. Please create .env file."
        exit /b 1
    )
)

call :log_success "Environment setup completed"
goto :eof

:build_images
call :log_info "Building Docker images..."

if "%~1"=="production" (
    docker-compose -f %COMPOSE_FILE% -f %PROD_COMPOSE_FILE% build --no-cache
) else (
    docker-compose build --no-cache
)

if errorlevel 1 (
    call :log_error "Failed to build Docker images"
    exit /b 1
)

call :log_success "Docker images built successfully"
goto :eof

:start_services
call :log_info "Starting services..."

if "%~1"=="production" (
    docker-compose -f %COMPOSE_FILE% -f %PROD_COMPOSE_FILE% up -d
) else (
    docker-compose up -d
)

if errorlevel 1 (
    call :log_error "Failed to start services"
    exit /b 1
)

call :log_success "Services started successfully"
goto :eof

:check_health
call :log_info "Checking service health..."

REM Wait for services to start
timeout /t 10 /nobreak >nul

REM Check each service
set services=backend:3001 client:3000 data-prep:3002 face-rec:3003

for %%s in (%services%) do (
    for /f "tokens=1,2 delims=:" %%a in ("%%s") do (
        call :log_info "Checking %%a service on port %%b..."
        
        REM Use curl if available, otherwise use PowerShell
        curl -f -s "http://localhost:%%b" >nul 2>&1
        if errorlevel 1 (
            call :log_warning "%%a service might not be ready yet"
        ) else (
            call :log_success "%%a service is healthy"
        )
    )
)
goto :eof

:show_status
call :log_info "Service status:"
docker-compose ps

echo.
call :log_info "Access URLs:"
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:3001
echo   GraphQL Playground: http://localhost:3001/graphql
echo   Data Prep Service: http://localhost:3002
echo   Face Recognition Service: http://localhost:3003
goto :eof

:cleanup
call :log_info "Cleaning up..."
docker-compose down
docker system prune -f
call :log_success "Cleanup completed"
goto :eof

:backup_data
call :log_info "Creating database backup..."

REM Create backup directory
if not exist "backups" mkdir backups

REM Create backup with timestamp
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do set mydate=%%c%%a%%b
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set mytime=%%a%%b
set mytime=%mytime: =0%
set backup_file=backups\mongodb_backup_%mydate%_%mytime%

REM Create MongoDB backup
docker exec %PROJECT_NAME%_mongodb_1 mongodump --db vms --out /backup
docker cp %PROJECT_NAME%_mongodb_1:/backup "%backup_file%"

call :log_success "Database backup created: %backup_file%"
goto :eof

:show_logs
if "%~1"=="" (
    docker-compose logs -f
) else (
    docker-compose logs -f %~1
)
goto :eof

REM Main script
if "%1"=="dev" goto dev_deploy
if "%1"=="development" goto dev_deploy
if "%1"=="prod" goto prod_deploy
if "%1"=="production" goto prod_deploy
if "%1"=="stop" goto stop_services
if "%1"=="restart" goto restart_services
if "%1"=="logs" goto show_service_logs
if "%1"=="status" goto show_service_status
if "%1"=="cleanup" goto cleanup_resources
if "%1"=="backup" goto backup_database
if "%1"=="health" goto check_service_health
goto show_usage

:dev_deploy
call :log_info "Starting development deployment..."
call :check_prerequisites
if errorlevel 1 exit /b 1
call :setup_environment
if errorlevel 1 exit /b 1
call :build_images "development"
if errorlevel 1 exit /b 1
call :start_services "development"
if errorlevel 1 exit /b 1
call :check_health
call :show_status
goto :eof

:prod_deploy
call :log_info "Starting production deployment..."
call :check_prerequisites
if errorlevel 1 exit /b 1
call :setup_environment
if errorlevel 1 exit /b 1
call :build_images "production"
if errorlevel 1 exit /b 1
call :start_services "production"
if errorlevel 1 exit /b 1
call :check_health
call :show_status
goto :eof

:stop_services
call :log_info "Stopping services..."
docker-compose down
call :log_success "Services stopped"
goto :eof

:restart_services
call :log_info "Restarting services..."
docker-compose restart
call :check_health
call :show_status
goto :eof

:show_service_logs
call :show_logs %2
goto :eof

:show_service_status
call :show_status
goto :eof

:cleanup_resources
call :cleanup
goto :eof

:backup_database
call :backup_data
goto :eof

:check_service_health
call :check_health
goto :eof

:show_usage
echo Usage: %0 {dev^|prod^|stop^|restart^|logs [service]^|status^|cleanup^|backup^|health}
echo.
echo Commands:
echo   dev        - Deploy in development mode
echo   prod       - Deploy in production mode
echo   stop       - Stop all services
echo   restart    - Restart all services
echo   logs       - Show logs (optionally for specific service)
echo   status     - Show service status and URLs
echo   cleanup    - Stop services and clean up resources
echo   backup     - Create database backup
echo   health     - Check service health
echo.
echo Examples:
echo   %0 dev                 # Start development environment
echo   %0 prod                # Start production environment
echo   %0 logs backend        # Show backend service logs
echo   %0 backup              # Create database backup
exit /b 1