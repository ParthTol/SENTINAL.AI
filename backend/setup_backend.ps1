# Backend Setup Script for Windows
# Usage: .\setup_backend.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Sentinel AI Backend Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if Python is installed
$pythonCheck = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Python is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

Write-Host "Python Version: $pythonCheck" -ForegroundColor Green

# Create virtual environment
Write-Host "`nCreating virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "Virtual environment already exists. Skipping creation." -ForegroundColor Yellow
} else {
    python -m venv venv
    Write-Host "Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "`nActivating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Install dependencies
Write-Host "`nInstalling dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

if ($LASTEXITCODE -eq 0) {
    Write-Host "Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "Error installing dependencies" -ForegroundColor Red
    exit 1
}

# Create .env file from template
if (-not (Test-Path ".env")) {
    Write-Host "`nCreating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host ".env file created. Please review and update paths as needed." -ForegroundColor Green
} else {
    Write-Host ".env file already exists" -ForegroundColor Yellow
}

# Create uploads directory
if (-not (Test-Path "uploads")) {
    New-Item -ItemType Directory -Name "uploads" | Out-Null
    Write-Host "Created uploads directory" -ForegroundColor Green
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Review and update .env file with your model paths"
Write-Host "2. Run: python -m scripts.seed_data (optional - populate sample data)"
Write-Host "3. Run: python -m app.main (start the backend)"
Write-Host "4. Visit: http://localhost:8000/docs (API documentation)"

Write-Host "`nTo start the backend now, run:" -ForegroundColor Cyan
Write-Host "python -m app.main" -ForegroundColor White

# Option to start backend
$start = Read-Host "`nStart backend now? (y/n)"
if ($start -eq 'y' -or $start -eq 'Y') {
    Write-Host "`nStarting backend..." -ForegroundColor Green
    python -m app.main
}
