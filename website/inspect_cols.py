import joblib
import os

artifacts_path = "backend/artifacts"

try:
    num_cols = joblib.load(os.path.join(artifacts_path, "num_cols.pkl"))
    cat_cols = joblib.load(os.path.join(artifacts_path, "cat_cols.pkl"))
    
    print("Numerical Columns:")
    print(num_cols)
    print("\nCategorical Columns:")
    print(cat_cols)
except Exception as e:
    print(f"Error loading artifacts: {e}")
