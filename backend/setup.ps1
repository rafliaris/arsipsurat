# Quick Setup Script for Backend
# Run this in PowerShell from the backend directory

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Green
& .\.venv\Scripts\Activate.ps1

# Verify Python version
Write-Host "`nPython location:" -ForegroundColor Yellow
python --version
where.exe python

# Upgrade pip
Write-Host "`nUpgrading pip..." -ForegroundColor Green
python -m pip install --upgrade pip

# Install requirements
Write-Host "`nInstalling requirements..." -ForegroundColor Green
pip install -r requirements.txt

Write-Host "`nSetup complete!" -ForegroundColor Green
Write-Host "You can now run: uvicorn app.main:app --reload" -ForegroundColor Cyan
