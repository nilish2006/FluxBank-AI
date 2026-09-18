# Start ML Service
Start-Process cmd -ArgumentList "/k cd ml-service && python ml_service.py" -WindowStyle Normal

# Start Backend
Start-Process cmd -ArgumentList "/k cd backend && node server.js" -WindowStyle Normal

# Start Frontend
Start-Process cmd -ArgumentList "/k cd frontend && npm run dev" -WindowStyle Normal

Write-Host "All services started in separate windows."
