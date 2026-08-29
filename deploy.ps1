<#
  NameWall - one-command PERMANENT free deployment to GitHub Pages.

  Usage:
      .\deploy.ps1                 # first time (creates the repo)
      .\deploy.ps1 -Message "fix"  # later updates

  Result: a permanent public HTTPS URL like
      https://<your-user>.github.io/namewall/
#>

param(
  [string]$RepoName = "namewall",
  [string]$Message  = "Deploy NameWall PWA"
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

# Make sure gh is on PATH for this session (winget installs it here).
$ghDir = "$env:ProgramFiles\GitHub CLI"
if (Test-Path $ghDir) { $env:Path = "$env:Path;$ghDir" }

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  throw "GitHub CLI not found. Install it with:  winget install --id GitHub.cli -e"
}

# 1. Login (opens the browser once, then remembered forever)
gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "`n>> Logging you in to GitHub (browser will open)..." -ForegroundColor Cyan
  gh auth login --hostname github.com --git-protocol https --web --scopes "repo,workflow"
}

$user = (gh api user --jq .login)
Write-Host ">> GitHub user: $user" -ForegroundColor Green

# 2. Local git repo
if (-not (Test-Path .git)) { git init -q; git branch -M main }
git add -A
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) { git commit -q -m $Message }

# 3. Remote repo (create once, public)
$exists = $true
gh repo view "$user/$RepoName" 1>$null 2>$null
if ($LASTEXITCODE -ne 0) { $exists = $false }

if (-not $exists) {
  Write-Host ">> Creating public repo $user/$RepoName ..." -ForegroundColor Cyan
  gh repo create $RepoName --public --source . --remote origin --push
} else {
  if (-not (git remote | Select-String -Quiet '^origin$')) {
    git remote add origin "https://github.com/$user/$RepoName.git"
  }
  git push -u origin main
}

# 4. Turn on GitHub Pages (GitHub Actions source) - permanent free hosting
Write-Host ">> Enabling GitHub Pages ..." -ForegroundColor Cyan
try {
  gh api -X POST "repos/$user/$RepoName/pages" -f "build_type=workflow" 1>$null 2>$null
} catch { }
try {
  gh api -X PUT "repos/$user/$RepoName/pages" -f "build_type=workflow" 1>$null 2>$null
} catch { }

gh workflow run deploy.yml --repo "$user/$RepoName" 2>$null

$url = "https://$user.github.io/$RepoName/"
Write-Host "`n============================================================" -ForegroundColor Green
Write-Host " Deployed! Your permanent free link (live in ~1 minute):" -ForegroundColor Green
Write-Host "   $url" -ForegroundColor Yellow
Write-Host " Build progress: https://github.com/$user/$RepoName/actions"
Write-Host "============================================================`n" -ForegroundColor Green
Write-Host "Open it on your phone -> Chrome menu -> 'Install app'."

