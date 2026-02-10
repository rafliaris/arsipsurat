# VS Code Quick Fix for Import Errors

## Problem Solved ✅

The lint errors were caused because the virtual environment wasn't created in the correct location.

## What Was Done

1. ✅ Created virtual environment in `backend/.venv`
2. ✅ Upgraded pip to version 26.0.1
3. ✅ Installed all 90+ dependencies from `requirements.txt`
4. ✅ Updated VS Code settings to use correct Python interpreter
5. ✅ Created Pyright configuration for better IntelliSense

## Next Steps for You

### 1. Reload VS Code Window
Press `Ctrl + Shift + P` → Type `Reload Window` → Enter

This will make VS Code recognize the new virtual environment.

### 2. Verify Python Interpreter
1. Open Command Palette: `Ctrl + Shift + P`
2. Type: `Python: Select Interpreter`
3. Select: `Python 3.13.x ('.venv': venv) .\backend\.venv\Scripts\python.exe`

### 3. Check if Errors are Gone
- Open [backend/app/main.py](file:///c:/Users/rafli/OneDrive/Dokumen/POLDA/arsipsurat/backend/app/main.py)
- All red squiggly lines should be gone
- Imports should be recognized

### 4. Activate Virtual Environment in Terminal

Each time you open a new terminal:

```powershell
# Navigate to backend
cd backend

# Activate venv
.\.venv\Scripts\Activate.ps1

# Verify (should show .venv path)
where python
```

## Configuration Files Created

- **`.vscode/settings.json`** - VS Code Python interpreter settings
- **`pyrightconfig.json`** - Python language server configuration  
- **`backend/setup.ps1`** - Quick setup script for future use

## Verified Working Versions

- FastAPI: 0.109.0
- SQLAlchemy: 2.0.25
- Pydantic: 2.5.3
- Python: 3.13.x

## If Issues Persist

1. Close VS Code completely
2. Reopen the workspace
3. Select the correct interpreter again
4. Clear Python language server cache: `Ctrl+Shift+P` → `Python: Clear Cache and Reload Window`
