@echo off
echo ========================================
echo VMS Remote Deployment to VPS
echo Server: 185.229.119.76
echo User: vms
echo ========================================

REM Check if required tools are available
where scp >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: scp not found. Please install OpenSSH or Git Bash
    pause
    exit /b 1
)

where ssh >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: ssh not found. Please install OpenSSH or Git Bash
    pause
    exit /b 1
)

echo [INFO] Copying project files to VPS...
scp -P 1033 -r . vms@185.229.119.76:/home/vms/vms-lts/

if %errorlevel% neq 0 (
    echo ERROR: Failed to copy files to VPS
    pause
    exit /b 1
)

echo [INFO] Executing deployment on VPS...
ssh -p 1033 vms@185.229.119.76 "cd /home/vms/vms-lts && chmod +x deploy-to-vps.sh && ./deploy-to-vps.sh"

if %errorlevel% neq 0 (
    echo ERROR: Deployment failed
    pause
    exit /b 1
)

echo ========================================
echo Deployment completed successfully!
echo ========================================
echo Your VMS application is now available at:
echo Frontend:     http://185.229.119.76:3000
echo Backend API:  http://185.229.119.76:3001
echo GraphQL:      http://185.229.119.76:3001/graphql
echo Data Prep:    http://185.229.119.76:3002
echo Face Rec:     http://185.229.119.76:3003
echo ========================================

pause