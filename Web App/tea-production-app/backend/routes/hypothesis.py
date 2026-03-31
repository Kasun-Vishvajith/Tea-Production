from fastapi import APIRouter, Query
import os
from backend.stats_engine import StatsEngine

router = APIRouter()

# Data path
base_data_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "tea_combined.csv")
stats_engine = StatsEngine(base_data_path)

# Simple cache for results to avoid re-fitting models for every request
_cache = {}

def get_stats_for_alpha(alpha: float):
    # Rounding alpha to handle floating point keys
    key = round(alpha, 2)
    if key in _cache:
        return _cache[key]
    
    results = stats_engine.get_all_results(alpha)
    _cache[key] = results
    return results

@router.get("/")
def get_all_hypothesis_data(alpha: float = Query(0.05)):
    """
    Returns hypothesis testing results for all elevations for a given alpha.
    """
    return get_stats_for_alpha(alpha)

@router.get("/{elevation}")
def get_elevation_hypothesis_data(elevation: str, alpha: float = Query(0.05)):
    """
    Returns hypothesis testing results for a specific elevation for a given alpha.
    """
    all_data = get_stats_for_alpha(alpha)
    if elevation in all_data:
        return all_data[elevation]
    return {"error": f"Elevation {elevation} not found"}
