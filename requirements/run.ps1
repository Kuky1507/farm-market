# Starts FarmMarket and opens it in the browser.
# Run from PowerShell:   .\requirements\run.ps1
# Press Ctrl+C in this window to stop the server.

$root = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $root 'backend'

if (-not (Test-Path (Join-Path $backend 'node_modules'))) {
  Write-Host 'Libraries are not installed yet. Run .\requirements\setup.ps1 first.' -ForegroundColor Red
  exit 1
}

$svc = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
if ($svc -and $svc.Status -ne 'Running') { Start-Service MongoDB }

Start-Job -ScriptBlock { Start-Sleep -Seconds 2; Start-Process 'http://localhost:5000' } | Out-Null

Push-Location $backend
try { node server.js } finally { Pop-Location }
