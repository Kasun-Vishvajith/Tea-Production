from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import shutil
import joblib
import pandas as pd
from inference import ForecastEngine
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import webbrowser
from threading import Timer

app = FastAPI(title="Tea Production Forecasting API")

# Enable Gzip compression to minimize web page size
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Enable CORS (not strictly needed if served from same origin, but helpful)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import sys

# Configuration for paths (Supporting PyInstaller _MEIPASS)
if getattr(sys, 'frozen', False):
    # If the app is run as a bundle (frozen EXE)
    BASE_DIR = sys._MEIPASS
    # Note: In onefile mode, internal files are in _MEIPASS root
    DEFAULT_MODEL_PATH = os.path.join(BASE_DIR, "Model")
    DEFAULT_INFERENCE_PATH = os.path.join(BASE_DIR, "Inference Model")
    UPLOAD_DIR = os.path.join(os.getcwd(), "custom_models") # Keep uploads in current working dir
    FRONTEND_DIR = os.path.join(BASE_DIR, "frontend/out")
    CACHED_JSON_PATH = os.path.join(BASE_DIR, "cached_results.json")
    DATASET_CSV_PATH = os.path.join(BASE_DIR, "Dataset/tea_combined.csv")
else:
    # If the app is run as a normal script
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DEFAULT_MODEL_PATH = os.path.join(BASE_DIR, "../Model")
    DEFAULT_INFERENCE_PATH = os.path.join(BASE_DIR, "../Inference Model")
    UPLOAD_DIR = os.path.join(BASE_DIR, "custom_models")
    FRONTEND_DIR = os.path.join(BASE_DIR, "../frontend/out")
    CACHED_JSON_PATH = os.path.join(BASE_DIR, "../cached_results.json")
    DATASET_CSV_PATH = os.path.join(BASE_DIR, "../Dataset/tea_combined.csv")

# Ensure upload directory exists
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

_engine = None

def get_engine():
    global _engine
    if _engine is not None:
        return _engine

    _engine = ForecastEngine(
        model_path=DEFAULT_MODEL_PATH,
        inference_path=DEFAULT_INFERENCE_PATH,
        custom_path=UPLOAD_DIR if os.listdir(UPLOAD_DIR) else None
    )
    return _engine

# --- API Routes --- (Updated to use new paths) ---

@app.post("/upload-models")
async def upload_models(
    total_sarimax: Optional[UploadFile] = File(None),
    share_catboost: Optional[UploadFile] = File(None),
    high_sarimax: Optional[UploadFile] = File(None),
    medium_sarimax: Optional[UploadFile] = File(None),
    low_sarimax: Optional[UploadFile] = File(None)
):
    try:
        file_map = {
            "total_sarimax.joblib": total_sarimax,
            "share_catboost.joblib": share_catboost,
            "infer_high_small.joblib": high_sarimax,
            "infer_medium_small.joblib": medium_sarimax,
            "infer_low_small.joblib": low_sarimax
        }
        for target_name, file in file_map.items():
            if file:
                file_path = os.path.join(UPLOAD_DIR, target_name)
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
        return {"message": "Success", "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/hypothesis-test")
async def get_hypothesis_test_data(alpha: float = 0.05):
    try:
        with open(CACHED_JSON_PATH, "r") as f:
            results = json.load(f)
        for elev, data in results.items():
            if "coefficients" in data:
                for coef in data["coefficients"]:
                    active = coef["p_value"] < alpha
                    coef["decision"] = "Reject H0" if active else "Fail to reject H0"
                    coef["significance"] = "Significant" if active else "Not Significant"
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics")
async def get_analytics_data():
    try:
        df = pd.read_csv(DATASET_CSV_PATH)
        ts_df = df[df['Tea Type'] == 'TOTAL BLACK TEA'].groupby('date')['Tea Production'].sum().reset_index()
        ts_df['date_dt'] = pd.to_datetime(ts_df['date'], dayfirst=True)
        ts_df = ts_df.sort_values('date_dt')
        time_series = [{"date": row['date'], "production": float(row['Tea Production'])} for _, row in ts_df.iterrows()]
        box_data = []
        for elev in ['LOW', 'MEDIUM', 'HIGH']:
            subset = df[(df['Tea Type'] == 'TOTAL BLACK TEA') & (df['Elevation'] == elev)]
            if subset.empty: continue
            vals = sorted(subset['Tea Production'].dropna().tolist())
            n = len(vals)
            box_data.append({
                "elevation": elev.capitalize() + " Grown",
                "min": float(vals[0]),
                "q1": float(vals[int(n * 0.25)]),
                "median": float(vals[int(n * 0.5)]),
                "q3": float(vals[int(n * 0.75)]),
                "max": float(vals[-1]),
                "all_values": [float(v) for v in vals]
            })
        return {"time_series": time_series, "elevation_box": box_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ForecastRequest(BaseModel):
    rainfall: float
    humidity: float
    temperature: float
    months: int = 1

@app.post("/forecast")
async def get_forecast(request: ForecastRequest):
    try:
        results = get_engine().predict(
             rainfall=request.rainfall,
             humidity=request.humidity,
             temperature=request.temperature,
             steps=request.months
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Static Files / App Serving ---

if os.path.exists(FRONTEND_DIR):
    app.mount("/_next", StaticFiles(directory=os.path.join(FRONTEND_DIR, "_next")), name="next")
    # For exported images, they are often in images/ folder directly
    if os.path.exists(os.path.join(FRONTEND_DIR, "images")):
        app.mount("/images", StaticFiles(directory=os.path.join(FRONTEND_DIR, "images")), name="images")

    @app.get("/{path:path}")
    async def serve_static(path: str):
        if path == "" or path == "/":
            return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
        
        local_path = os.path.join(FRONTEND_DIR, path)
        # Check standard path
        if os.path.isfile(local_path):
            return FileResponse(local_path)
        
        # Check path with .html extension (common in static exports)
        if os.path.isfile(local_path + ".html"):
            return FileResponse(local_path + ".html")
            
        # Check folder index.html
        index_path = os.path.join(local_path, "index.html")
        if os.path.isfile(index_path):
            return FileResponse(index_path)
        
        # SPA routing fallback
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
else:
    @app.get("/")
    async def root():
        return {"message": "API Running (Frontend not found: check FRONTEND_DIR)"}

def open_browser():
    webbrowser.open("http://localhost:8000")

if __name__ == "__main__":
    import uvicorn
    # Delay browser opening slightly
    Timer(2.0, open_browser).start()
    uvicorn.run(app, host="0.0.0.0", port=8000)


