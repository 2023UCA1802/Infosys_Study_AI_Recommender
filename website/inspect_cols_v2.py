import joblib
import os
import sys

artifacts_path = "backend/artifacts"

try:
    num_cols = joblib.load(os.path.join(artifacts_path, "num_cols.pkl"))
    cat_cols = joblib.load(os.path.join(artifacts_path, "cat_cols.pkl"))
    
    with open("cols_info.txt", "w") as f:
        f.write(f"Numerical Columns: {num_cols}\n")
        f.write(f"Categorical Columns: {cat_cols}\n")
        
except Exception as e:
    with open("cols_info.txt", "w") as f:
        f.write(f"Error: {e}\n")
