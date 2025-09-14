#!/bin/bash

# Environment Configuration Script for DARA-Medics
# This script helps switch between different environment configurations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  DARA-Medics Environment Setup${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Function to setup environment
setup_environment() {
    local env=$1
    
    print_header
    
    case $env in
        "development"|"dev"|"local")
            print_status "Setting up DEVELOPMENT environment..."
            setup_development
            ;;
        "staging"|"stage")
            print_status "Setting up STAGING environment..."
            setup_staging
            ;;
        "production"|"prod")
            print_status "Setting up PRODUCTION environment..."
            setup_production
            ;;
        *)
            print_error "Invalid environment: $env"
            print_error "Valid options: development, staging, production"
            exit 1
            ;;
    esac
    
    print_status "Environment setup complete!"
    print_warning "Remember to update the configuration files with your actual values"
}

# Development setup
setup_development() {
    # Backend
    if [ -f "medsupply-wa-backend/env.example" ]; then
        cp medsupply-wa-backend/env.example medsupply-wa-backend/.env
        print_status "Backend .env created from example"
    else
        print_warning "Backend env.example not found"
    fi
    
    # Frontend
    if [ -f "medsupply-wa-frontend/.env.local" ]; then
        print_status "Frontend .env.local already exists"
    else
        cat > medsupply-wa-frontend/.env.local << EOF
# Development Environment Configuration
REACT_APP_ENV=development
REACT_APP_API_URL=http://localhost:3000
REACT_APP_SUPABASE_URL=https://mdwicqcwzkmlwajxutjy.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kd2ljcWN3emttbHdhanh1dGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5ODk1MTUsImV4cCI6MjA3MjU2NTUxNX0.rXTR5PaijHWzt78MXiWBrjyL0n4fhap4PS1hKIvZNTY
REACT_APP_ENABLE_EMAIL_VERIFICATION=false
REACT_APP_SKIP_EMAIL_VERIFICATION=true
REACT_APP_DEBUG_MODE=true
REACT_APP_SHOW_ENV_BANNER=false
REACT_APP_MOCK_API=false
REACT_APP_ENABLE_CONSOLE_LOGS=true
EOF
        print_status "Frontend .env.local created"
    fi
}

# Staging setup
setup_staging() {
    # Backend
    if [ -f "medsupply-wa-backend/env.staging.example" ]; then
        cp medsupply-wa-backend/env.staging.example medsupply-wa-backend/.env
        print_status "Backend .env created from staging example"
    else
        print_warning "Backend env.staging.example not found"
    fi
    
    # Frontend
    if [ -f "medsupply-wa-frontend/env.staging.example" ]; then
        cp medsupply-wa-frontend/env.staging.example medsupply-wa-frontend/.env
        print_status "Frontend .env created from staging example"
    else
        print_warning "Frontend env.staging.example not found"
    fi
}

# Production setup
setup_production() {
    # Backend
    if [ -f "medsupply-wa-backend/env.production.example" ]; then
        cp medsupply-wa-backend/env.production.example medsupply-wa-backend/.env
        print_status "Backend .env created from production example"
    else
        print_warning "Backend env.production.example not found"
    fi
    
    # Frontend
    if [ -f "medsupply-wa-frontend/env.production.example" ]; then
        cp medsupply-wa-frontend/env.production.example medsupply-wa-frontend/.env
        print_status "Frontend .env created from production example"
    else
        print_warning "Frontend env.production.example not found"
    fi
}

# Function to show current environment
show_current_env() {
    print_header
    
    # Check backend
    if [ -f "medsupply-wa-backend/.env" ]; then
        local backend_env=$(grep "^NODE_ENV=" medsupply-wa-backend/.env | cut -d'=' -f2)
        print_status "Backend environment: $backend_env"
    else
        print_warning "Backend .env not found"
    fi
    
    # Check frontend
    if [ -f "medsupply-wa-frontend/.env" ]; then
        local frontend_env=$(grep "^REACT_APP_ENV=" medsupply-wa-frontend/.env | cut -d'=' -f2)
        print_status "Frontend environment: $frontend_env"
    elif [ -f "medsupply-wa-frontend/.env.local" ]; then
        local frontend_env=$(grep "^REACT_APP_ENV=" medsupply-wa-frontend/.env.local | cut -d'=' -f2)
        print_status "Frontend environment: $frontend_env (from .env.local)"
    else
        print_warning "Frontend environment file not found"
    fi
}

# Function to validate configuration
validate_config() {
    print_header
    print_status "Validating configuration..."
    
    # Check required files
    local missing_files=()
    
    if [ ! -f "medsupply-wa-backend/.env" ]; then
        missing_files+=("medsupply-wa-backend/.env")
    fi
    
    if [ ! -f "medsupply-wa-frontend/.env" ] && [ ! -f "medsupply-wa-frontend/.env.local" ]; then
        missing_files+=("medsupply-wa-frontend/.env or .env.local")
    fi
    
    if [ ${#missing_files[@]} -gt 0 ]; then
        print_error "Missing configuration files:"
        for file in "${missing_files[@]}"; do
            echo "  - $file"
        done
        print_warning "Run: ./setup-env.sh development"
        return 1
    fi
    
    print_status "Configuration files found"
    
    # Check backend configuration
    if [ -f "medsupply-wa-backend/.env" ]; then
        local supabase_url=$(grep "^SUPABASE_URL=" medsupply-wa-backend/.env | cut -d'=' -f2)
        if [ -z "$supabase_url" ] || [ "$supabase_url" = "your_supabase_url" ]; then
            print_warning "Backend SUPABASE_URL not configured"
        else
            print_status "Backend Supabase URL configured"
        fi
    fi
    
    # Check frontend configuration
    local frontend_env_file=""
    if [ -f "medsupply-wa-frontend/.env" ]; then
        frontend_env_file="medsupply-wa-frontend/.env"
    elif [ -f "medsupply-wa-frontend/.env.local" ]; then
        frontend_env_file="medsupply-wa-frontend/.env.local"
    fi
    
    if [ -n "$frontend_env_file" ]; then
        local api_url=$(grep "^REACT_APP_API_URL=" "$frontend_env_file" | cut -d'=' -f2)
        if [ -z "$api_url" ] || [ "$api_url" = "your_api_url" ]; then
            print_warning "Frontend API URL not configured"
        else
            print_status "Frontend API URL configured"
        fi
    fi
    
    print_status "Configuration validation complete"
}

# Function to show help
show_help() {
    print_header
    echo "Usage: $0 [COMMAND] [ENVIRONMENT]"
    echo ""
    echo "Commands:"
    echo "  setup <env>     Setup environment configuration"
    echo "  show           Show current environment"
    echo "  validate       Validate current configuration"
    echo "  help           Show this help message"
    echo ""
    echo "Environments:"
    echo "  development    Local development environment"
    echo "  staging        Staging environment"
    echo "  production     Production environment"
    echo ""
    echo "Examples:"
    echo "  $0 setup development"
    echo "  $0 setup staging"
    echo "  $0 setup production"
    echo "  $0 show"
    echo "  $0 validate"
}

# Main script logic
main() {
    case $1 in
        "setup")
            if [ -z "$2" ]; then
                print_error "Environment required for setup command"
                show_help
                exit 1
            fi
            setup_environment "$2"
            ;;
        "show")
            show_current_env
            ;;
        "validate")
            validate_config
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        "")
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
