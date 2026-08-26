# HELLO MAIN + FREIGHT BACKEND

This package combines the **Hello Main** React/Vite frontend with the **Freight Navigator** FastAPI backend.

## Connection

The frontend API layer in `src/lib/api/` already targets the Freight backend endpoints:
- `GET /health`
- `GET /api/data/routes`
- `GET /api/data/summary`
- `GET /api/data/eda`
- `GET /api/data/history`
- `POST /api/forecast`
- `GET /api/forecast/history`
- `POST /api/whatif`
- `POST /api/optimize`
- `GET /api/recommendations/history`
- `GET /api/scenarios/history`
- `GET /api/model-runs`
- `/api/maritime/*`

`.env` is set to `VITE_API_BASE_URL=http://127.0.0.1:8001`.

## Run on Windows

### Terminal 1 — backend
```bat
backend\run.bat
```

Or manually:
```bat
py -m venv .venv
.venv\Scripts\activate
pip install -r backend\requirements.txt
set PYTHONPATH=%CD%\backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

Backend docs:
`http://127.0.0.1:8001/docs`

Health check:
`http://127.0.0.1:8001/health`

### Terminal 2 — frontend
```bat
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## Important

The backend defaults to a local SQLite database unless `DATABASE_URL` is set.
For Supabase/PostgreSQL, set `DATABASE_URL` before starting the backend and apply `backend/app/sql/schema.sql` to the database.

The frontend does not call Supabase directly for Freight data; it calls the FastAPI backend through `src/lib/api/client.ts`.

## SIH26006 integrated decision layer

The dashboard now includes **Maritime Operations**, an end-to-end decision workflow for the SIH26006 requirements:

- short/medium-term multiple-voyage contract comparison: spot, 3, 6 and 12 voyages;
- vessel-type ranking using destination **and representative origin** draft/LOA/beam/cargo constraints;
- full voyage duration and congestion-cost analysis;
- congestion-driven idle-time detection and alternate-port/repositioning suggestions;
- deterministic risk alerts for congestion, forecast uncertainty, volatility and idle exposure;
- market signal panel for freight, fuel, demand, supply and demand/supply pressure;
- explicit provenance labels distinguishing bundled synthetic/demo data from live feeds.

### Important data-status note

The bundled freight history and port master are demo/synthetic/assumed inputs. The system is designed so CSV ingestion and production port feeds can replace them. It does **not** claim live port congestion unless a live feed is connected.
