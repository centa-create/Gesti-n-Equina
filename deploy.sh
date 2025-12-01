#!/bin/bash

# Deployment script for Gestion Equina
# Usage: ./deploy.sh [environment]
# Environments: staging, production

set -e

ENVIRONMENT=${1:-staging}
PROJECT_NAME="gestion-equina"

echo "🚀 Starting deployment to $ENVIRONMENT environment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to log with timestamp
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" >&2
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    log "Checking dependencies..."

    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        error "npm is not installed"
        exit 1
    fi

    if ! command -v ng &> /dev/null; then
        error "Angular CLI is not installed"
        exit 1
    fi

    log "Dependencies check passed"
}

# Setup environment variables
setup_environment() {
    log "Setting up $ENVIRONMENT environment..."

    if [ "$ENVIRONMENT" = "production" ]; then
        export NODE_ENV=production
        export PORT=3000
        export JWT_SECRET=${JWT_SECRET:-"change-this-in-production"}
        BUILD_CMD="npm run build:prod"
    elif [ "$ENVIRONMENT" = "staging" ]; then
        export NODE_ENV=staging
        export PORT=3001
        export JWT_SECRET=${JWT_SECRET:-"staging-secret-key"}
        BUILD_CMD="npm run build:staging"
    else
        error "Invalid environment: $ENVIRONMENT"
        echo "Usage: $0 [staging|production]"
        exit 1
    fi

    log "Environment variables set for $ENVIRONMENT"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    npm ci
    log "Dependencies installed successfully"
}

# Run tests
run_tests() {
    log "Running tests..."

    if [ "$ENVIRONMENT" = "production" ]; then
        npm run test:prod
    else
        npm run test:ci
    fi

    log "Tests passed successfully"
}

# Build application
build_application() {
    log "Building application for $ENVIRONMENT..."
    eval $BUILD_CMD
    log "Build completed successfully"
}

# Health check
health_check() {
    log "Performing health check..."

    # Wait for server to start
    sleep 5

    # Check if server is responding
    if curl -f http://localhost:$PORT/health > /dev/null 2>&1; then
        log "Health check passed"
    else
        error "Health check failed"
        exit 1
    fi
}

# Backup database (if exists)
backup_database() {
    if [ -f "gestion-equina.db" ]; then
        BACKUP_FILE="backup-$(date +%Y%m%d-%H%M%S).db"
        cp gestion-equina.db $BACKUP_FILE
        log "Database backed up to $BACKUP_FILE"
    fi
}

# Start application
start_application() {
    log "Starting application on port $PORT..."

    # Kill existing process if running
    pkill -f "node server.js" || true

    # Start in background
    nohup npm run server > app.log 2>&1 &
    SERVER_PID=$!

    echo $SERVER_PID > server.pid
    log "Application started with PID $SERVER_PID"

    # Health check
    health_check
}

# Main deployment process
main() {
    log "Starting deployment process for $PROJECT_NAME ($ENVIRONMENT)"

    check_dependencies
    setup_environment
    backup_database
    install_dependencies
    run_tests
    build_application
    start_application

    log "🎉 Deployment to $ENVIRONMENT completed successfully!"
    log "Application is running on port $PORT"
    log "Check logs with: tail -f app.log"
    log "Stop with: kill \$(cat server.pid)"
}

# Handle script interruption
trap 'error "Deployment interrupted by user"; exit 1' INT TERM

# Run main function
main "$@"