# Git Branch Merge Tutorial

**Project:** Sistem Klasifikasi Arsip Surat  
**Last Updated:** 10 Februari 2026

---

## Table of Contents

1. [Branch Structure Overview](#branch-structure-overview)
2. [Development Workflow](#development-workflow)
3. [Merging Backend to Main](#merging-backend-to-main)
4. [Merging Frontend to Main](#merging-frontend-to-main)
5. [Resolving Merge Conflicts](#resolving-merge-conflicts)
6. [Best Practices](#best-practices)
7. [Common Commands Reference](#common-commands-reference)

---

## Branch Structure Overview

This repository uses a **feature branch workflow** with three main branches:

```
main (production-ready code)
├── backend (FastAPI development)
└── frontend (React development)
```

### Branch Purposes

- **`main`**: Production-ready code, always stable
- **`backend`**: Backend development (FastAPI, Python)
- **`frontend`**: Frontend development (React, TypeScript)

---

## Development Workflow

### For Backend Developer

1. **Switch to backend branch:**
   ```bash
   git checkout backend
   ```

2. **Pull latest changes:**
   ```bash
   git pull origin backend
   ```

3. **Make your changes and commit:**
   ```bash
   git add .
   git commit -m "feat: add OCR processing endpoint"
   ```

4. **Push to remote:**
   ```bash
   git push origin backend
   ```

### For Frontend Developer

1. **Switch to frontend branch:**
   ```bash
   git checkout frontend
   ```

2. **Pull latest changes:**
   ```bash
   git pull origin frontend
   ```

3. **Make your changes and commit:**
   ```bash
   git add .
   git commit -m "feat: add surat masuk upload form"
   ```

4. **Push to remote:**
   ```bash
   git push origin frontend
   ```

---

## Merging Backend to Main

### Step 1: Ensure Backend is Ready

```bash
# Switch to backend branch
git checkout backend

# Pull latest changes
git pull origin backend

# Run tests (if available)
# python -m pytest

# Check status
git status
```

### Step 2: Update Backend with Latest Main

```bash
# Still on backend branch
git fetch origin main

# Merge main into backend to ensure compatibility
git merge origin/main

# Resolve any conflicts (see conflict resolution section)
# Test everything works after merge

# Push updated backend
git push origin backend
```

### Step 3: Merge Backend into Main

```bash
# Switch to main branch
git checkout main

# Pull latest main
git pull origin main

# Merge backend into main
git merge backend --no-ff -m "merge: integrate backend features"

# If there are conflicts, resolve them (see below)
```

### Step 4: Test and Push

```bash
# Test the merged code
# Run all tests

# If everything looks good, push to main
git push origin main
```

---

## Merging Frontend to Main

### Step 1: Ensure Frontend is Ready

```bash
# Switch to frontend branch
git checkout frontend

# Pull latest changes
git pull origin frontend

# Build and test
# npm run build
# npm run test

# Check status
git status
```

### Step 2: Update Frontend with Latest Main

```bash
# Still on frontend branch
git fetch origin main

# Merge main into frontend
git merge origin/main

# Resolve any conflicts
# Test the build after merge

# Push updated frontend
git push origin frontend
```

### Step 3: Merge Frontend into Main

```bash
# Switch to main branch
git checkout main

# Pull latest main
git pull origin main

# Merge frontend into main
git merge frontend --no-ff -m "merge: integrate frontend features"

# Resolve conflicts if any
```

### Step 4: Test and Push

```bash
# Test the merged code
# npm run build (if frontend is in main)

# Push to main
git push origin main
```

---

## Resolving Merge Conflicts

When you see merge conflicts, Git will show messages like:

```
CONFLICT (content): Merge conflict in <filename>
Automatic merge failed; fix conflicts and then commit the result.
```

### Step-by-Step Conflict Resolution

**1. Check which files have conflicts:**
```bash
git status
```

**2. Open the conflicting file(s):**

You'll see conflict markers:

```
<<<<<<< HEAD
// Code from the branch you're on (e.g., main)
=======
// Code from the branch you're merging (e.g., backend)
>>>>>>> backend
```

**3. Edit the File:**

- Remove the conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
- Keep the code you want (or combine both versions)
- Save the file

**4. Mark as resolved:**
```bash
git add <conflicted-file>
```

**5. Complete the merge:**
```bash
git commit -m "resolve: merge conflicts between main and backend"
```

**6. Push the changes:**
```bash
git push origin main
```

### Example Conflict Resolution

**Before (conflicted file):**
```python
<<<<<<< HEAD
def process_document(file):
    return ocr_v1(file)
=======
def process_document(file):
    return ocr_v2_improved(file)
>>>>>>> backend
```

**After (resolved):**
```python
def process_document(file):
    return ocr_v2_improved(file)  # Using newer version from backend
```

---

## Best Practices

### 1. Commit Messages

Use conventional commit format:

```
<type>: <description>

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes (formatting)
- refactor: Code refactoring
- test: Adding tests
- chore: Build process or auxiliary tool changes
```

**Examples:**
```bash
git commit -m "feat: add OCR classification endpoint"
git commit -m "fix: resolve login authentication bug"
git commit -m "docs: update API documentation"
```

### 2. Pull Before Push

Always pull before pushing to avoid conflicts:

```bash
git pull origin <branch-name>
git push origin <branch-name>
```

### 3. Regular Syncing

Keep your branch updated with main regularly:

```bash
# On your feature branch
git fetch origin main
git merge origin/main
```

### 4. Small, Focused Commits

- Commit often with small, logical changes
- Each commit should represent one logical change
- Easier to review and rollback if needed

### 5. Test Before Merging

- **Backend**: Run all tests, check API endpoints
- **Frontend**: Run build, check UI functionality
- **Integration**: Test backend + frontend together

### 6. Use Pull Requests (Recommended)

If using GitHub/GitLab:

1. Push your branch to remote
2. Create a Pull Request (PR) / Merge Request (MR)
3. Request review from teammate
4. Merge after approval

---

## Common Commands Reference

### Branch Management

```bash
# List all branches
git branch -a

# Create new branch
git checkout -b <branch-name>

# Switch branch
git checkout <branch-name>

# Delete local branch
git branch -d <branch-name>

# Delete remote branch
git push origin --delete <branch-name>
```

### Viewing Changes

```bash
# See changes in working directory
git status

# See commit history
git log --oneline --graph --all

# See changes before commit
git diff

# See changes between branches
git diff main..backend
```

### Undoing Changes

```bash
# Discard changes in working directory
git checkout -- <file>

# Unstage file
git reset HEAD <file>

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

### Remote Operations

```bash
# View remotes
git remote -v

# Fetch all remote branches
git fetch origin

# Pull = fetch + merge
git pull origin <branch-name>

# Push to remote
git push origin <branch-name>

# Push all branches
git push --all origin
```

---

## Workflow Diagram

```
Backend Developer:                 Frontend Developer:
    │                                  │
    ├─ work on backend branch          ├─ work on frontend branch
    ├─ commit changes                  ├─ commit changes
    ├─ push to backend                 ├─ push to frontend
    │                                  │
    └─────────┬───────────┬────────────┘
              │           │
         When ready  When ready
              │           │
              ▼           ▼
    ┌─────────────────────────────┐
    │   Merge to main branch      │
    │   (after testing)           │
    └─────────────────────────────┘
              │
              ▼
      Production Deploy
```

---

## Troubleshooting

### Problem: "Your branch is behind"

**Solution:**
```bash
git pull origin <branch-name>
```

### Problem: "Already up to date" but you know there are changes

**Solution:**
```bash
git fetch origin
git log HEAD..origin/<branch-name>
git merge origin/<branch-name>
```

### Problem: Accidentally committed to wrong branch

**Solution:**
```bash
# Don't push yet! Move commit to correct branch:
git log  # Note the commit hash
git reset --hard HEAD~1  # Undo commit on wrong branch
git checkout <correct-branch>
git cherry-pick <commit-hash>  # Apply commit to correct branch
```

### Problem: Want to discard all local changes

**Solution:**
```bash
git reset --hard HEAD
git clean -fd  # Remove untracked files
```

---

## Integration Testing Checklist

Before merging to main, ensure:

### Backend Checklist
- [ ] All API endpoints tested
- [ ] Database migrations applied
- [ ] Environment variables documented
- [ ] Dependencies updated in requirements.txt
- [ ] No hardcoded credentials
- [ ] CORS configured correctly
- [ ] Error handling implemented

### Frontend Checklist
- [ ] Build completes without errors (`npm run build`)
- [ ] No console errors in browser
- [ ] Responsive design tested
- [ ] All forms validated properly
- [ ] API integration working
- [ ] Dependencies updated in package.json
- [ ] Environment variables configured

### Integration Checklist
- [ ] Backend API + Frontend communication working
- [ ] Authentication flow working end-to-end
- [ ] File upload and OCR processing functional
- [ ] Export features working (Excel, PDF, Google Sheets)
- [ ] All major user flows tested

---

## Quick Reference: Typical Merge Day

### Merging Both Branches to Main

```bash
# 1. Merge Backend First
git checkout main
git pull origin main
git merge backend --no-ff -m "merge: integrate backend features"
# Resolve conflicts if needed
git push origin main

# 2. Update Frontend with new Main
git checkout frontend
git pull origin frontend
git fetch origin main
git merge origin/main
# Resolve conflicts if needed
git push origin frontend

# 3. Merge Frontend to Main
git checkout main
git pull origin main
git merge frontend --no-ff -m "merge: integrate frontend features"
# Resolve conflicts if needed
git push origin main

# 4. Update branches with new Main
git checkout backend
git merge main
git push origin backend

git checkout frontend
git merge main
git push origin frontend
```

---

## Contact & Support

If you encounter issues:

1. Check this tutorial
2. Check `git status` for current state
3. Check `git log` for recent commits
4. Consult with team member
5. Use `git reflog` to recover from mistakes

---

**Happy Coding! 🚀**
