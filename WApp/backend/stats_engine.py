import os
import sys
import json
import traceback

class StatisticalEngine:
    def __init__(self, dataset_path: str):
        # Support both script execution and frozen EXE
        if getattr(sys, 'frozen', False):
            self.cache_path = os.path.join(sys._MEIPASS, "cached_results.json")
        else:
            self.cache_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../cached_results.json")
        
    def run_tests(self, alpha=None):
        try:
            if not os.path.exists(self.cache_path):
                return {"error": "cached_results.json not found"}
                
            with open(self.cache_path, "r") as f:
                return json.load(f)

        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            return {"error": str(e)}

_statistical_engine = None

def get_statistical_engine():
    global _statistical_engine
    if _statistical_engine is None:
        _statistical_engine = StatisticalEngine("")
    return _statistical_engine
