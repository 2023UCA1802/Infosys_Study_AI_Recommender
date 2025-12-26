import json
import sys
import pandas as pd
import joblib
from recommendations import rule_based_recommendations

# Load ML artifacts
num_imputer = joblib.load("artifacts/num_imputer.pkl")
cat_imputer = joblib.load("artifacts/cat_imputer.pkl")
scaler = joblib.load("artifacts/scaler.pkl")
encoder = joblib.load("artifacts/encoder.pkl")
pca = joblib.load("artifacts/pca.pkl")
kmeans = joblib.load("artifacts/kmeans.pkl")

num_cols = joblib.load("artifacts/num_cols.pkl")
cat_cols = joblib.load("artifacts/cat_cols.pkl")
final_columns = joblib.load("artifacts/final_columns.pkl")

cluster_name_map = {
    0: "Regular Attendees",
    1: "Focused Learners",
    2: "Active Improvers"
}

def predict_cluster_and_recommend(input_data: dict):
    # Add default values for missing columns
    defaults = {
        "Motivation_Level": "Medium",
        "Internet_Access": "Yes",
        "Peer_Influence": "Neutral",
        "Learning_Disabilities": "No",
        "Gender": "Female"
    }
    for col, val in defaults.items():
        if col not in input_data:
            input_data[col] = val

    df = pd.DataFrame([input_data])

    # Imputation
    df[num_cols] = num_imputer.transform(df[num_cols])
    df[cat_cols] = cat_imputer.transform(df[cat_cols])

    # Scaling
    df[num_cols] = scaler.transform(df[num_cols])

    # Encoding
    encoded = encoder.transform(df[cat_cols])
    encoded_df = pd.DataFrame(encoded, columns=encoder.get_feature_names_out())

    # Combine
    final_df = pd.concat(
        [df[num_cols].reset_index(drop=True),
         encoded_df.reset_index(drop=True)],
        axis=1
    )

    # Align columns
    final_df = final_df.reindex(columns=final_columns, fill_value=0)

    # PCA
    pca_input = pca.transform(final_df)

    # Cluster prediction
    cluster_id = int(kmeans.predict(pca_input)[0])
    cluster_name = cluster_name_map[cluster_id]

    # Prepare row for rule engine (standardized values!)
    rule_row = df[num_cols].iloc[0].copy()
    rule_row["Cluster_Name"] = cluster_name

    # Recommendations
    recs = rule_based_recommendations(rule_row)

    return {
        "cluster_id": cluster_id,
        "cluster_name": cluster_name,
        "recommendations": recs
    }

if __name__ == "__main__":
    try:
        input_json = sys.stdin.read()
        data = json.loads(input_json)

        result = predict_cluster_and_recommend(data)

        print(json.dumps({"success": True, **result}))

    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
