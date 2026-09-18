# FluxBank - AI-Powered Intelligent Cross-Sell Agent

FluxBank is an AI-powered banking dashboard that analyzes customer transaction profiles, financial health, risk tiers, and customer dialogue intent to recommend personalized, policy-compliant banking products.

## Tech Stack
- **Frontend**: React 19, Vite 7, Recharts, Framer Motion, Lucide Icons, Vanilla CSS
- **Backend**: Node.js, Express 5, Axios, CSV-Parser, Body-Parser, CORS
- **ML Service**: Python 3.13, Flask, scikit-learn, pandas, joblib
- **Data**: `data/customers.csv`

## Quick Start

### 1. Automated (PowerShell)
```powershell
.\start_all.ps1
```

### 2. Manual Startup

**ML Service:**
```bash
cd ml-service
python ml_service.py
```

**Backend API:**
```bash
cd backend
node server.js
```

**Frontend Dashboard:**
```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Documentation
For full architectural details, audit notes, bug fixes, and next steps, see [AI_HANDOFF.md](AI_HANDOFF.md).
