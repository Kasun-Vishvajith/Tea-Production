import sys
import os

# Add backend to path
sys.path.append('c:\\Users\\kasun\\Documents\\Kasun Vishvajith @ Data Science\\Advanced ML\\Tea Production\\Web App\\tea-production-app')

from backend.stats_engine import StatsEngine

try:
    data_path = 'c:\\Users\\kasun\\Documents\\Kasun Vishvajith @ Data Science\\Advanced ML\\Tea Production\\Web App\\tea-production-app\\data\\tea_combined.csv'
    engine = StatsEngine(data_path)
    
    print("Data preparation successful.")
    print(f"Datasets: {list(engine.datasets.keys())}")
    
    # Test one elevation
    print("\nRunning analysis for 'total' elevation...")
    res = engine.run_hypothesis_testing('total', 0.05)
    
    if "error" in res:
        print(f"Error: {res['error']}")
    else:
        print("Success!")
        print(f"Stationarity p-val: {res['stationarity']['p_value']}")
        print(f"Differencing order: {res['stationarity']['differencing_order']}")
        print(f"AIC SARIMA: {res['comparison']['aic_sarima']}")
        print(f"AIC SARIMAX: {res['comparison']['aic_sarimax']}")
        print(f"LR p-value: {res['comparison']['lr_p_value']}")
        print("\nVariable results:")
        for v in res['variables']:
            print(f"- {v['variable']}: p={v['p_value']:.4f}, significant={v['significance']}")

except Exception as e:
    import traceback
    traceback.print_exc()
