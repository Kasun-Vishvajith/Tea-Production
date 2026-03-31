import os
import json
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from typing import List, Dict, Any

class ForecastEngine:
    def __init__(self, model_path: str, inference_path: str, custom_path: str = None):
        self.model_path = model_path
        self.inference_path = inference_path
        self.custom_path = custom_path
        self.metadata = None
        self.total_model = None
        self.share_model = None
        self.df_history = None
        self.latest_date = None
        
        self.load_metadata()
        self.load_models()
        self.load_history()

    def load_metadata(self):
        # Metadata is usually fixed unless we allow that upload too
        metadata_file = os.path.join(self.model_path, "metadata.json")
        with open(metadata_file, "r") as f:
            self.metadata = json.load(f)

    def load_models(self):
        # Load the models using joblib
        # Prioritize custom uploads if available
        def get_model_file(filename, default_dir):
            if self.custom_path:
                custom_file = os.path.join(self.custom_path, filename)
                if os.path.exists(custom_file):
                    print(f"Loading custom model: {custom_file}")
                    return custom_file
            return os.path.join(default_dir, filename)

        self.total_model = joblib.load(get_model_file("total_sarimax.joblib", self.model_path))
        self.share_model = joblib.load(get_model_file("share_catboost.joblib", self.model_path))

    def load_history(self):
        # Load the dataset to get latest shares for lags
        dataset_path = os.path.join(os.path.dirname(__file__), "../Dataset/tea_combined.csv")
        self.df_history = pd.read_csv(dataset_path)
        self.df_history['date'] = pd.to_datetime(self.df_history['date'])
        self.latest_date = self.df_history['date'].max()

    def get_initial_shares_history(self) -> Dict[str, List[float]]:
        # Returns a dict of combo_key -> list of last 12 shares
        # combo_key: "Elevation_Tea Type"
        totals = self.df_history.groupby('date')['Tea Production'].sum().reset_index()
        totals.rename(columns={'Tea Production': 'total_y'}, inplace=True)
        
        df = self.df_history.merge(totals, on='date')
        df['share'] = df['Tea Production'] / df['total_y']
        
        history = {}
        for combo in self.metadata['data']['all_combos']:
            key = f"{combo['Elevation']}_{combo['Tea Type']}"
            subset = df[
                (df['Elevation'] == combo['Elevation']) & 
                (df['Tea Type'] == combo['Tea Type'])
            ].sort_values('date')
            
            last_shares = subset['share'].tail(12).values.tolist()
            # Padding if history is short
            while len(last_shares) < 12:
                last_shares.insert(0, 0.0)
            history[key] = last_shares
        return history

    def calculate_lags(self, last_12: List[float]) -> Dict[str, float]:
        lags = {f"share_lag_{i}": last_12[-(i)] for i in range(1, 13)}
        lags["share_roll3"] = np.mean(last_12[-3:]) if len(last_12) >= 3 else 0.0
        lags["share_roll6"] = np.mean(last_12[-6:]) if len(last_12) >= 6 else 0.0
        return lags

    def predict(self, rainfall: float, humidity: float, temperature: float, steps: int = 1) -> List[Dict[str, Any]]:
        # 1. SARIMAX: Predict total production for the horizon
        # For simplicity, we assume constant exog unless user provides future inputs
        exog_future = pd.DataFrame([{
            "Rain fall": rainfall,
            "Humidity": humidity,
            "Air Tempurature": temperature
        }] * steps)
        
        # SARIMAX forecast returns mean and CI
        total_forecast = self.total_model.get_forecast(steps=steps, exog=exog_future)
        total_means = total_forecast.predicted_mean.tolist()
        total_conf_int = total_forecast.conf_int(alpha=0.05).values.tolist() # [[lower, upper], ...]

        # 2. Iterative Category Breakdown (CatBoost)
        all_combos = self.metadata['data']['all_combos']
        structural_zeros = self.metadata['data']['structural_zero_combos']
        
        # Initial lags for each combo
        iterative_shares_history = self.get_initial_shares_history()
        
        monthly_forecasts = []
        current_date = self.latest_date

        for s in range(steps):
            current_date += pd.DateOffset(months=1)
            month = current_date.month
            month_sin = np.sin(2 * np.pi * month / 12)
            month_cos = np.cos(2 * np.pi * month / 12)
            
            total_y = total_means[s]
            lower_ci = total_conf_int[s][0]
            upper_ci = total_conf_int[s][1]
            
            monthly_results = []
            for combo in all_combos:
                key = f"{combo['Elevation']}_{combo['Tea Type']}"
                row = combo.copy()
                row.update({
                    "Rain fall": rainfall,
                    "Humidity": humidity,
                    "Air Tempurature": temperature,
                    "month_sin": month_sin,
                    "month_cos": month_cos
                })
                # Add lags
                lags = self.calculate_lags(iterative_shares_history[key])
                row.update(lags)
                
                # Predict share (raw)
                try:
                    df_input = pd.DataFrame([row])
                    # Ensure same column order as expected by catboost (from metadata)
                    feature_cols = self.metadata['models']['share_model']['feature_cols']
                    df_input = df_input[feature_cols]
                    share_raw = float(self.share_model.predict(df_input)[0])
                    share_raw = max(0, share_raw) # clip
                except Exception as e:
                    print(f"CatBoost Error: {e}")
                    share_raw = 0.0
                
                # Structural zero enforcement
                for sz in structural_zeros:
                    if row['Elevation'] == sz['Elevation'] and row['Tea Type'] == sz['Tea Type']:
                        share_raw = 0.0
                        break
                
                row["share_raw"] = share_raw
                monthly_results.append(row)

            # 3. Renormalization per month
            total_share_raw = sum(r['share_raw'] for r in monthly_results)
            month_breakdown = []
            
            for r in monthly_results:
                share_pred = (r['share_raw'] / total_share_raw) if total_share_raw > 0 else (1.0 / len(monthly_results))
                prod_pred = share_pred * total_y
                
                # Append predicted share to history for next month's lags
                key = f"{r['Elevation']}_{r['Tea Type']}"
                iterative_shares_history[key].append(share_pred)
                iterative_shares_history[key].pop(0) # Keep sliding window of 12
                
                item = {
                    "elevation": r['Elevation'],
                    "tea_type": r['Tea Type'],
                    "share": share_pred,
                    "production": prod_pred
                }
                month_breakdown.append(item)

            monthly_forecasts.append({
                "date": str(current_date.date()),
                "total_production": total_y,
                "confidence_interval": {"lower": lower_ci, "upper": upper_ci},
                "breakdown": month_breakdown,
                "meta": {
                    "rainfall": rainfall,
                    "humidity": humidity,
                    "temperature": temperature
                }
            })

        return monthly_forecasts
