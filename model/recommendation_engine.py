from typing import List
import pandas as pd

# Thresholds for feature evaluation
LOW_THRESH = -0.3
HIGH_THRESH = 0.3

# Generate rule-based recommendations for a single student record
def rule_based_recommendations(row: pd.Series) -> List[str]:

    recs = []

    cluster = row['Cluster_Name']
    h = row['Hours_Studied']
    a = row['Attendance']
    t = row['Tutoring_Sessions']
    p = row['Physical_Activity']
    s = row['Sleep_Hours']


# FEATURE-BASED RULES

    # Hours studied
    if h < LOW_THRESH:
        recs.append("Increase daily self-study time with a fixed schedule.")
    elif h > HIGH_THRESH:
        recs.append("Maintain your current self-study routine, but focus on revising weak topics.")

    # Attendance
    if a < LOW_THRESH:
        recs.append("Improve class attendance by setting a minimum target.")
    elif a > HIGH_THRESH:
        recs.append("Use your strong class attendance to actively ask questions and clarify doubts.")

    # Tutoring sessions
    if t < LOW_THRESH:
        recs.append("Consider using tutoring or mentoring sessions when you struggle with topics.")
    elif t > HIGH_THRESH:
        recs.append("Review what you learn in tutoring through short self-study sessions afterwards.")

    # Physical activity
    if p < LOW_THRESH:
        recs.append("Add regular light physical activity to improve focus.")
    elif p > HIGH_THRESH:
        recs.append("Maintain your physical activity; use it to manage stress during exam periods.")

    # Sleep hours
    if s < LOW_THRESH:
        recs.append("Aim for a more regular sleep schedule with at least 7 hours of sleep.")
    elif s > HIGH_THRESH:
        recs.append("Keep your healthy sleep routine; avoid late-night screen time before exams.")


# CLUSTER-SPECIFIC RULES

    if cluster == "Active Improvers":
        recs.append("Reduce dependency on tutoring by adding solo revision after each session.")
        recs.append("Balance your schedule to increase sleep time while keeping activity moderate.")
        recs.append("Create a weekly self-study plan focusing on topics covered in tutoring.")

    elif cluster == "Focused Learners":
        recs.append("Increase class attendance to complement your self-study with teacher guidance.")
        recs.append("Use occasional tutoring or doubt-clearing sessions for difficult subjects.")
        recs.append("Share your effective self-study strategies with peers or study groups.")

    elif cluster == "Regular Attendees":
        recs.append("Convert your good class attendance into better results by planning daily revision.")
        recs.append("Include short physical activity breaks to avoid fatigue and improve concentration.")
        recs.append("Use tutoring or peer study groups if you still feel stuck despite attending classes.")

    # Remove duplicates, keep order
    recs = list(dict.fromkeys(recs))
    return recs

# Add recommendations to the entire DataFrame
def add_recommendations(df: pd.DataFrame) -> pd.DataFrame:

    required_cols = [
        'Hours_Studied',
        'Attendance',
        'Tutoring_Sessions',
        'Physical_Activity',
        'Sleep_Hours',
        'Cluster_Name'
    ]

    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns in input DataFrame: {missing}")

    df_out = df.copy()
    df_out['Recommendations'] = df_out.apply(rule_based_recommendations, axis=1)
    return df_out

# Run as script
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Rule-based recommendation generator.")
    parser.add_argument("input_csv")
    parser.add_argument("output_csv")
    args = parser.parse_args()

    data = pd.read_csv(args.input_csv)
    data_with_recs = add_recommendations(data)
    data_with_recs.to_csv(args.output_csv, index=False)
    print(f"Saved recommendations to {args.output_csv}")
