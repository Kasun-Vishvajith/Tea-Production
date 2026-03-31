from fastapi import APIRouter
import pandas as pd
import math

router = APIRouter()

import os
base_path = os.path.join(os.path.dirname(__file__), "..", "..", "data")
df = pd.read_csv(os.path.join(base_path, "tea_combined.csv"))

# Clean data if NaN to support JSON
df = df.fillna("")

@router.get("/")
def get_data():
    return df.to_dict(orient="records")
