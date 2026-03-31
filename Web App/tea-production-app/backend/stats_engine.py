import pandas as pd
import numpy as np
import os
from statsmodels.tsa.stattools import adfuller
from statsmodels.stats.diagnostic import acorr_ljungbox
from statsmodels.stats.outliers_influence import variance_inflation_factor
from statsmodels.tsa.statespace.sarimax import SARIMAX
from scipy.stats import chi2
import warnings

warnings.filterwarnings("ignore")

class StatsEngine:
    def __init__(self, data_path):
        self.df = pd.read_csv(data_path)
        self.prepare_data()

    def prepare_data(self):
        # Convert date
        self.df['date'] = pd.to_datetime(self.df['date'])
        
        # Mapping column names to standard ones
        self.col_map = {
            'Tea Production': 'production',
            'Rain fall': 'rainfall',
            'Humidity': 'humidity',
            'Air Tempurature': 'air_temperature'
        }
        
        # Aggegation logic
        agg_cols = {
            'Tea Production': 'sum',
            'Rain fall': 'mean',
            'Humidity': 'mean',
            'Air Tempurature': 'mean'
        }
        
        # Create elevation datasets
        self.datasets = {}
        elevations = ['LOW', 'MEDIUM', 'HIGH']
        
        for elev in elevations:
            elev_df = self.df[self.df['Elevation'] == elev].groupby('date').agg(agg_cols).copy()
            elev_df.sort_index(inplace=True)
            # Ensure monthly frequency
            elev_df = elev_df.asfreq('MS').fillna(method='ffill')
            self.datasets[elev.lower()] = elev_df
            
        # Create TOTAL dataset
        total_df = self.df.groupby('date').agg(agg_cols).copy()
        total_df.sort_index(inplace=True)
        total_df = total_df.asfreq('MS').fillna(method='ffill')
        self.datasets['total'] = total_df

    def check_stationarity(self, series, alpha=0.05):
        d = 0
        current_series = series.copy()
        
        # Augmented Dickey-Fuller test
        res = adfuller(current_series)
        p_val = res[1]
        
        is_stationary = p_val < alpha
        
        # Apply differencing if non-stationary
        if not is_stationary:
            d = 1
            current_series = current_series.diff().dropna()
            # Double check (optional but good for 'automatic differencing' instruction)
            # We only do 1st order differencing as per typical time series practice unless explicitly stated
            res_diff = adfuller(current_series)
            p_val = res_diff[1]
            is_stationary = p_val < alpha
            
        return d, is_stationary, float(p_val)

    def check_multicollinearity(self, exog_df):
        vif_data = pd.DataFrame()
        vif_data["feature"] = exog_df.columns
        
        # Add constant for VIF calculation
        X = exog_df.copy()
        X['intercept'] = 1
        
        vifs = []
        for i in range(len(exog_df.columns)):
            v = variance_inflation_factor(X.values, i)
            vifs.append(v)
            
        vif_data["vif"] = vifs
        return vif_data.to_dict(orient='records')

    def run_hypothesis_testing(self, elevation='total', alpha=0.05):
        if elevation not in self.datasets:
            return {"error": f"Dataset for {elevation} not found"}
        
        df = self.datasets[elevation]
        target = df['Tea Production']
        exog_vars = ['Rain fall', 'Humidity', 'Air Tempurature']
        exog = df[exog_vars]
        
        # 3.1 Stationarity
        d, is_stationary, adf_p = self.check_stationarity(target, alpha)
        
        # 3.2 Multicollinearity
        vif_results = self.check_multicollinearity(exog)
        
        # 4. Model A (Baseline SARIMA)
        # Using a simple (1, d, 1)x(1, 1, 1, 12) structure for speed/demonstration
        # In practice, one would optimize orders, but SARIMAX requirement is about testing covariates
        try:
            model_a = SARIMAX(target, order=(1, d, 1), seasonal_order=(1, 1, 1, 12)).fit(disp=False)
            loglik_a = model_a.llf
            aic_a = model_a.aic
        except Exception as e:
            print(f"Error fitting Model A: {e}")
            loglik_a = 0
            aic_a = 0
            
        # 4. Model B (Full SARIMAX)
        try:
            model_b = SARIMAX(target, exog=exog, order=(1, d, 1), seasonal_order=(1, 1, 1, 12)).fit(disp=False)
            loglik_b = model_b.llf
            aic_b = model_b.aic
            
            # Hypothesis Testing (Coefficients)
            coeffs = model_b.params[exog_vars]
            pvalues = model_b.pvalues[exog_vars]
            
            # 3.3 Residual Autocorrelation (Ljung-Box)
            # Check residuals for the full model
            lb_test = acorr_ljungbox(model_b.resid, lags=[10], return_df=True)
            lb_p = float(lb_test['lb_pvalue'].iloc[0])
            lb_decision = "Good" if lb_p > alpha else "Problem"
            
        except Exception as e:
            print(f"Error fitting Model B: {e}")
            return {"error": f"Failed to fit SARIMAX models: {str(e)}"}

        # 6. Model Comparison (Likelihood Ratio Test)
        # LR = -2 * (LogLik_ModelA - LogLik_ModelB)
        lr_stat = -2 * (loglik_a - loglik_b)
        # Degrees of freedom = difference in number of parameters = 3
        df_diff = 3
        lr_p = 1 - chi2.cdf(lr_stat, df_diff)
        
        # Prepare Variable Level Results (Step 7 & 8)
        variable_results = []
        for var in exog_vars:
            p_val = float(pvalues[var])
            coef = float(coeffs[var])
            sig = "Yes" if p_val < alpha else "No"
            decision = "Significant" if p_val < alpha else "Not Significant"
            
            # Friendly Explanation
            if p_val < alpha:
                explanation = f"At α = {alpha}, {var} significantly affects tea production (p = {p_val:.4f}). This suggests changes in this factor influence yield."
            else:
                explanation = f"At α = {alpha}, {var} does not show a strong statistical effect (p = {p_val:.4f}). Its impact may be weak or already captured by time patterns."
            
            variable_results.append({
                "variable": var,
                "coefficient": coef,
                "p_value": p_val,
                "decision": decision,
                "significance": sig,
                "explanation": explanation
            })

        # Summary decision for elevation (Step 9)
        sig_vars = [v['variable'] for v in variable_results if v['significance'] == "Yes"]
        insig_vars = [v['variable'] for v in variable_results if v['significance'] == "No"]
        
        if sig_vars:
            summary_insight = f"At α = {alpha}, {', '.join(sig_vars)} are significant predictors in {elevation} elevation areas"
            if insig_vars:
                summary_insight += f", while {', '.join(insig_vars)} show weaker influence."
            else:
                summary_insight += "."
        else:
            summary_insight = f"At α = {alpha}, none of the environmental factors show standalone significance for {elevation} elevation."

        # Model Level Insight (Step 11)
        if lr_p < alpha:
            exog_insight = "Environmental variables add meaningful predictive power beyond past tea production patterns."
        else:
            exog_insight = "Tea production patterns already capture much of the variation, making environmental variables less impactful."

        return {
            "elevation": elevation,
            "alpha": alpha,
            "stationarity": {
                "differencing_order": d,
                "p_value": adf_p,
                "is_stationary": is_stationary
            },
            "multicollinearity": vif_results,
            "residuals": {
                "lb_p_value": lb_p,
                "decision": lb_decision
            },
            "comparison": {
                "aic_sarima": aic_a,
                "aic_sarimax": aic_b,
                "lr_p_value": float(lr_p),
                "is_better": lr_p < alpha,
                "insight": exog_insight
            },
            "variables": variable_results,
            "summary_insight": summary_insight
        }

    def get_all_results(self, alpha=0.05):
        results = {}
        for elev in self.datasets.keys():
            results[elev] = self.run_hypothesis_testing(elev, alpha)
        
        # Global Insight Panel (Step 10)
        all_vars = ['Rain fall', 'Humidity', 'Air Tempurature']
        global_insights = []
        for var in all_vars:
            sig_in = [e for e, r in results.items() if any(v['variable'] == var and v['significance'] == "Yes" for v in r.get('variables', []))]
            if len(sig_in) == len(results):
                global_insights.append(f"{var} consistently shows strong significance across all elevations, indicating it is the most reliable environmental driver.")
            elif len(sig_in) > 0:
                global_insights.append(f"{var} effects vary by elevation ({', '.join(sig_in)}), suggesting localized climate sensitivity.")
            else:
                global_insights.append(f"{var} does not show strong standalone significance in any elevation zone.")

        results["global_insight"] = " ".join(global_insights)
        return results
