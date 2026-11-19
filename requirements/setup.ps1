# FarmMarket one-time setup.
# Checks the requirements, installs the Node.js libraries and loads the sample data.
# Run from PowerShell:   .\requirements\setup.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $root 'backend'

Write-Host '== Checking requirements ==' -ForegroundColor Cyan

try { $nodeVersion = (node --version) } catch { $nodeVersion = $null }
if (-not $nodeVersion) {
  Write-Host 'Node.js is not installed. Download it from https://nodejs.org and run this script again.' -ForegroundColor Red
  exit 1
}
Write-Host "Node.js $nodeVersion found"

$svc = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
if (-not $svc) {
  Write-Host 'MongoDB service not found. Install MongoDB Community Server from https://www.mongodb.com/try/download/community' -ForegroundColor Red
  exit 1
}
if ($svc.Status -ne 'Running') {
  Write-Host 'MongoDB service is stopped, starting it...'
  Start-Service MongoDB
}
Write-Host 'MongoDB service is running'

if (-not (Test-Path (Join-Path $backend '.env'))) {
  Copy-Item (Join-Path $backend '.env.example') (Join-Path $backend '.env')
  Write-Host 'Created backend\.env from .env.example'
}

Write-Host '== Installing Node.js libraries ==' -ForegroundColor Cyan
Push-Location $backend
try {
  npm install --no-audit --no-fund
  if ($LASTEXITCODE -ne 0) { throw 'npm install failed' }

  Write-Host '== Loading the 50 sample documents ==' -ForegroundColor Cyan
  node seed.js
  if ($LASTEXITCODE -ne 0) { throw 'seed failed' }
}
finally {
  Pop-Location
}

Write-Host ''
Write-Host 'Setup complete. Start the app with:  .\requirements\run.ps1' -ForegroundColor Green
