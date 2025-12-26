import sys
import json
import pandas as pd
from typing import List

# Thresholds for feature evaluation
LOW_THRESH = -0.3
HIGH_THRESH = 0.3

# Generate rule-based recommendations for a single student record
def rule_based_recommendations(row: pd.Series) -> List[str]:

    recs = []

    cluster = row.get('Cluster_Name', '')
    h = row.get('Hours_Studied', 0)
    a = row.get('Attendance', 0)
    t = row.get('Tutoring_Sessions', 0)
    p = row.get('Physical_Activity', 0)
    s = row.get('Sleep_Hours', 0)


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

if __name__ == "__main__":
    try:
        # Read JSON from stdin
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input data provided"}))
            sys.exit(1)
            
        data = json.loads(input_data)
        
        # Convert to Series (handling potential list of dicts or single dict)
        if isinstance(data, list):
            data = data[0]
            
        series = pd.Series(data)
        recommendations = rule_based_recommendations(series)
        
        print(json.dumps({"success": True, "recommendations": recommendations}))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
