import os
import pandas as pd
from recommendation_engine import add_recommendations

# Main function to load data, generate recommendations, and save results
def main():
    input_csv = "output/processed_for_recommendation.csv"
    output_csv = "output/student_recommendations.csv"

    if not os.path.exists(input_csv):
        raise FileNotFoundError(f"{input_csv} not found. " f"Run Preprocess&Model.ipynb first to generate this file.")

    print(f" Loading preprocessed data from: {input_csv}")
    df = pd.read_csv(input_csv)
    print(" Data shape:", df.shape)

    print(" Generating rule-based recommendations...")
    df_with_recs = add_recommendations(df)
    
    # Format recommendations as bullet points
    def format_recs(rec_list):
        if not isinstance(rec_list, list):
            return ""
        return "• " + "\n• ".join(rec_list)

    df_with_recs["Recommendations_Text"] = df_with_recs["Recommendations"].apply(format_recs)

    os.makedirs("output", exist_ok=True)
    df_with_recs.to_csv(output_csv, index=False)
    print(f" Saved recommendations to: {output_csv}")

    # # Show a small sample in console
    # print("\n Sample recommendations:")
    # for i in range(min(3, len(df_with_recs))):
    #     row = df_with_recs.iloc[i]
    #     print(f"\n Student {i + 1}")
    #     print("Cluster_Name:", row["Cluster_Name"])
    #     print("Recommendations:")
    #     for rec in row["Recommendations"]:
    #         print("  -", rec)


if __name__ == "__main__":
    main()
