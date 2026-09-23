# QBIT One-Click Launcher for Windows
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Starting QBIT - Quantum Computing Platform" -ForegroundColor White
Write-Host "  Team: UNPAIRED ELECTRONS | SIH26140" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Start Python FastAPI Backend in separate process
Write-Host "[1/2] Starting Python Quantum Simulation Engine on port 8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python main.py"

# Start Vite React Frontend
Write-Host "[2/2] Starting Vite Frontend on port 5173..." -ForegroundColor Green
cd frontend
npm run dev
