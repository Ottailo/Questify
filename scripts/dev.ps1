# Questify Dual-Stack Development Launcher
Write-Host "==========================================" -ForegroundColor DarkYellow
Write-Host "   QUESTIFY // GREAT SAGE OS LAUNCHER     " -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor DarkYellow

$scriptRoot = Split-Path -Parent $PSScriptRoot
Set-Location $scriptRoot

# 1. Check OmniRoute Gateway
Write-Host "`n[1/3] Checking OmniRoute Gateway (Port 20129)..." -ForegroundColor Cyan
try {
    $omni = Invoke-RestMethod -Uri "http://127.0.0.1:20129/v1/models" -Headers @{ Authorization = "Bearer sk-9ebfedc343ccc674-f1fdcc-800831f5" } -TimeoutSec 2 -ErrorAction Stop
    Write-Host "  -> OmniRoute is ONLINE (Multi-Model Gateway active)" -ForegroundColor Green
} catch {
    Write-Host "  -> Warning: OmniRoute not responding on port 20129. AI engine will utilize resilient local fallback." -ForegroundColor Yellow
}

# 2. Start Backend FastAPI with SQLite
Write-Host "`n[2/3] Launching FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Cyan
$backendJob = Start-Process -FilePath "python" -ArgumentList "-m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload" -WorkingDirectory "$scriptRoot\backend" -PassThru

# 3. Start Frontend React on Port 3001
Write-Host "`n[3/3] Launching React Client on http://localhost:3001..." -ForegroundColor Cyan
$env:PORT = "3001"
Start-Process -FilePath "npm" -ArgumentList "--prefix frontend start" -WorkingDirectory "$scriptRoot"

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host "   All systems dispatched! Enjoy Questing." -ForegroundColor Green
Write-Host "   Database Target:  SQLite (questify.db)" -ForegroundColor Yellow
Write-Host "   Backend API Docs: http://127.0.0.1:8000/docs" -ForegroundColor Gray
Write-Host "   Frontend HUD:     http://localhost:3001" -ForegroundColor Gray
Write-Host "==========================================`n" -ForegroundColor Green
