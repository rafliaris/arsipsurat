# Git Authentication & Configuration Guide

It looks like we need to get your git identity and permissions sorted out so you can push your changes to your team's repository.

## 1. Configure Your Identity

Currently, the git user is set to a placeholder. You should set this to your actual GitHub identity so your team knows who made the changes.

Run these commands in your terminal (PowerShell):

```powershell
git config user.name "Your Actual Name"
git config user.email "your.github.email@example.com"
```

*Note: This will apply to future commits. The commits we just made will still show "Antigravity Agent" unless we rewrite history, which might be complicated. For now, it's safe to proceed.*

## 2. Authentication Options

Since the repository `https://github.com/rafliaris/arsipsurat.git` belongs to `rafliaris` (presumably your teammate or the team account), you need **Write Access**.

### Option A: You are a Collaborator (Recommended)
If `rafliaris` has added your GitHub account as a collaborator:
1.  Run `git push origin main frontend`
2.  A window should pop up asking you to sign in to GitHub.
3.  Sign in with **YOUR** account.
4.  If it asks for a **Password** in the terminal, you must use a **Personal Access Token (PAT)**, not your login password.
    *   *To generate a PAT: Go to GitHub Settings -> Developer Settings -> Personal Access Tokens -> Tokens (classic) -> Generate new token -> Select 'repo' scope.*

### Option B: You are NOT a Collaborator (Forking)
If you do not have write access, you must fork the repository:
1.  Go to `https://github.com/rafliaris/arsipsurat` in your browser.
2.  Click **Fork** (top right).
3.  In your terminal, add your fork as a new remote:
    ```powershell
    git remote add my-fork https://github.com/YOUR_USERNAME/arsipsurat.git
    ```
4.  Push to your fork:
    ```powershell
    git push my-fork main frontend
    ```
5.  Go to GitHub and create a **Pull Request** from your fork to the team repo.

## 3. Pushing the Changes

Once you have authenticated:

```powershell
# Push the main branch (with the merge)
git push origin main

# Push the frontend branch
git push origin frontend
```
