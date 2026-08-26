import json
import os
from contextlib import asynccontextmanager
from datetime import date as date_type

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, text

from app.database import init_db, SessionLocal
from app.models.freight import ModelRun
from app.routes import data, forecast, decision, maritime, chat
from app.services.reference_data import seed_reference_data
from app.ml.train import MODEL_DIR, HORIZONS


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()

    db = SessionLocal()

    try:
        seed_reference_data(db)
        seed_model_run_history(db)
    finally:
        db.close()

    yield


app = FastAPI(
    title="Intelligent Freight Forecasting & Chartering Decision Support",
    description=(
        "SIH 2026 Problem Statement 26006 — backend API. Zero external APIs: "
        "all forecasting/optimization runs locally against historical + "
        "synthetic data using scikit-learn/XGBoost/LightGBM models."
    ),
    version="1.0.0",
    lifespan=lifespan,
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Main Vercel production domain
        "https://freight-puce.vercel.app",

        # Current Vercel deployment URL shown by browser
        "https://freight-no7hyyp8j-divyanshu19283-maxs-projects.vercel.app",

        # Local Vite development
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",

        # Other local development
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# API ROUTES
# ============================================================

app.include_router(data.router)
app.include_router(forecast.router)
app.include_router(decision.router)
app.include_router(maritime.router)
app.include_router(chat.router)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "service": "freight-forecasting-backend",
        "status": "ok",
        "docs": "/docs",
    }


# ============================================================
# MODEL RUN HISTORY
# ============================================================

def seed_model_run_history(db):
    """
    Populate model_runs from the bundled training-evaluation metadata.

    This keeps the Model Intelligence page populated on fresh
    SQLite/demo databases and production PostgreSQL databases.
    """

    meta_dir = os.path.join(
        os.path.dirname(
            os.path.dirname(
                os.path.abspath(__file__)
            )
        ),
        "data",
        "trained_models",
    )

    if not os.path.isdir(meta_dir):
        return 0

    written = 0

    for horizon in HORIZONS:

        meta_path = os.path.join(
            meta_dir,
            f"model_h{horizon}_meta.json",
        )

        if not os.path.exists(meta_path):
            continue

        try:
            with open(
                meta_path,
                "r",
                encoding="utf-8",
            ) as f:
                meta = json.load(f)

        except (OSError, ValueError, TypeError):
            continue

        leaderboard = meta.get("leaderboard", {})

        for model_name, metrics in leaderboard.items():

            existing = (
                db.execute(
                    select(ModelRun).where(
                        ModelRun.model_name == model_name,
                        ModelRun.horizon_days == int(horizon),
                    ).order_by(ModelRun.id.asc())
                )
                .scalars()
                .first()
            )

            try:
                values = {
                    "training_start": date_type.fromisoformat(
                        meta["training_start"]
                    ),
                    "training_end": date_type.fromisoformat(
                        meta["training_end"]
                    ),
                    "mae": float(
                        metrics.get("mae", 0)
                    ),
                    "rmse": float(
                        metrics.get("rmse", 0)
                    ),
                    "mape": float(
                        metrics.get("mape", 0)
                    ),
                    "r2": (
                        float(metrics["r2"])
                        if metrics.get("r2") is not None
                        else None
                    ),
                    "training_rows": int(
                        meta.get("training_rows", 0)
                    ),
                    "horizon_days": int(horizon),
                    "is_best_model": (
                        model_name == meta.get("best_model")
                    ),
                }

            except (KeyError, TypeError, ValueError):
                continue

            if existing is None:

                db.add(
                    ModelRun(
                        model_name=model_name,
                        **values,
                    )
                )

            else:

                for key, value in values.items():
                    setattr(
                        existing,
                        key,
                        value,
                    )

            written += 1

    if written:
        db.commit()

    return written


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():
    """
    Reports database connectivity and trained model availability.
    """

    db_status = "disconnected"

    try:
        db = SessionLocal()

        try:
            db.execute(text("SELECT 1"))
            db_status = "connected"

        finally:
            db.close()

    except Exception:
        db_status = "disconnected"

    model_loaded = all(
        os.path.exists(
            os.path.join(
                MODEL_DIR,
                f"model_h{h}.joblib",
            )
        )
        for h in HORIZONS
    )

    return {
        "status": "healthy",
        "database": db_status,
        "model_loaded": model_loaded,
        "version": "1.0.0",
    }