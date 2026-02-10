# Fix for Import Errors - Step by Step

## The Real Problem

When you run Python from the `backend` directory, imports like `from app.core.config import settings` work fine. But VS Code's Pylance needs to be explicitly told that `backend` is the root where the `app` module lives.

## **Solution: Use the Workspace File**

I've created `arsipsurat.code-workspace`. Here's what to do:

### Step 1: Open the Workspace File
1. Close VS Code completely
2. Navigate to: `c:\Users\rafli\OneDrive\Dokumen\POLDA\arsipsurat\`
3. Double-click `arsipsurat.code-workspace`
4. VS Code will reopen with the workspace loaded

### Step 2: Select the Correct Python Interpreter
1. Open any Python file in `backend/app/`
2. Press `Ctrl + Shift + P`
3. Type: `Python: Select Interpreter`
4. Choose: `Python 3.13.x ('.venv': venv) backend/.venv/Scripts/python.exe`

### Step 3: Reload Window
1. Press `Ctrl + Shift + P`
2. Type: `Developer: Reload Window`
3. Press Enter

## Alternative Fix (If You Don't Want Workspace)

If you prefer not to use a workspace file, you can manually tell VS Code where Python should run from:

### Add to `.vscode/settings.json`:
```json
{
  "python.analysis.extraPaths": [
    "${workspaceFolder}/backend"
  ],
  "python.envFile": "${workspaceFolder}/backend/.env"
}
```

## Test It Works

Open Terminal in VS Code and run:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -c "from app.core.config import settings; print('Success! Imports working')"
```

If this prints "Success!", then the Python environment is correct, and it's just a VS Code configuration issue.

## Why This Happens

- Python files inside `app/` directory can import each other fine
- But `main.py` imports use `from app.xxx` which requires `backend/` to be in Python path
- VS Code needs to know the project root is `backend/`, not the workspace root

## Quick Verification

After following the steps above, open `backend/app/main.py` and check:
- Line 8: `from app.api.v1.router import api_router` - should have NO red underline
- Line 9: `from app.core.config import settings` - should have NO red underline

If still showing errors, try:
1. `Ctrl + Shift + P` → `Python: Clear Cache and Reload Window`
2. Restart VS Code completely
