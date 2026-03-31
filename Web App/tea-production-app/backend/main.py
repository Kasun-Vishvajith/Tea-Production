from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import forecast, hypothesis, data

app = FastAPI()

# CORS middleware for frontend (keeping it so React works)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forecast.router, prefix="/forecast")
app.include_router(hypothesis.router, prefix="/hypothesis")
app.include_router(data.router, prefix="/data")
