"""
Generate weekly parent communication recommendations for Ms. Rivera's Algebra II class.

Reads all data from data/, applies the prompt in scripts/prompt.md, calls Gemini,
and writes structured output to output/messages.json.

Usage:
    python scripts/generate_messages.py
"""

import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

from google import genai

ROOT = Path(__file__).parent.parent
DATA_DIR = ROOT / "data"
OUTPUT_DIR = ROOT / "output"
PROMPT_FILE = ROOT / "scripts" / "prompt.md"
API_KEY_FILE = ROOT / "api_key.env"

GEMINI_MODEL = "gemini-3.6-flash"


def load_api_key() -> str:
    if api_key := os.environ.get("GEMINI_API_KEY"):
        return api_key
    if API_KEY_FILE.exists():
        return API_KEY_FILE.read_text().strip()
    sys.exit("No Gemini API key found. Set GEMINI_API_KEY or create api_key.env.")


def load_data() -> tuple[dict, dict, dict, dict]:
    def read(name: str) -> dict:
        return json.loads((DATA_DIR / name).read_text())

    return (
        read("roster.json"),
        read("gradebook.json"),
        read("attendance.json"),
        read("teacher_notes.json"),
    )


def letter_grade(pct: float) -> str:
    if pct >= 90: return "A"
    if pct >= 80: return "B"
    if pct >= 70: return "C"
    if pct >= 60: return "D"
    return "F"


def build_student_snapshots(roster, gradebook, attendance, teacher_notes) -> list[dict]:
    """Compute per-student metrics and combine with teacher notes."""
    assignments = {a["id"]: a for a in gradebook["assignments"]}
    grades_by_sid = {g["student_id"]: g["scores"] for g in gradebook["grades"]}
    att_by_sid = {r["student_id"]: r for r in attendance["records"]}
    notes_by_sid = {n["student_id"]: n["entries"] for n in teacher_notes["notes"]}
    total_days = attendance["reporting_period"]["total_days"]

    snapshots = []
    for student in roster["students"]:
        sid = student["student_id"]
        scores = grades_by_sid.get(sid, {})

        # Grade metrics — nulls count as 0 (missing work penalises grade)
        earned = sum(s for s in scores.values() if s is not None)
        possible = sum(a["max_points"] for a in gradebook["assignments"])
        missing = sum(1 for s in scores.values() if s is None)
        grade_pct = round(earned / possible * 100, 1) if possible else 0

        att = att_by_sid.get(sid, {})

        snapshots.append({
            "student_id": sid,
            "name": student["name"],
            "grade_pct": grade_pct,
            "grade_letter": letter_grade(grade_pct),
            "missing_assignments": missing,
            "unexcused_absences": att.get("absences_unexcused", 0),
            "excused_absences": att.get("absences_excused", 0),
            "tardies": att.get("tardies", 0),
            "total_school_days": total_days,
            "scores_by_assignment": {
                aid: {
                    "title": assignments[aid]["title"],
                    "type": assignments[aid]["type"],
                    "score": score,
                    "max": assignments[aid]["max_points"],
                }
                for aid, score in scores.items()
            },
            "teacher_notes": notes_by_sid.get(sid, []),
        })

    return snapshots


def _ordinal(n: int) -> str:
    suffix = "th" if 11 <= n % 100 <= 13 else {1: "st", 2: "nd", 3: "rd"}.get(n % 10, "th")
    return f"{n}{suffix}"


def _fmt_date(iso: str) -> str:
    from datetime import date
    return date.fromisoformat(iso).strftime("%B %-d, %Y")


def fill_template(template: str, roster: dict, attendance: dict) -> str:
    cls = roster["class"]
    period = attendance["reporting_period"]
    replacements = {
        "{{TEACHER_NAME}}":          cls["teacher"],
        "{{CLASS_NAME}}":            cls["name"],
        "{{PERIOD}}":                str(cls["period"]),
        "{{GRADE_LEVEL}}":           _ordinal(cls["grade"]),
        "{{SCHOOL_YEAR}}":           cls["school_year"],
        "{{REPORTING_PERIOD_START}}": _fmt_date(period["start"]),
        "{{REPORTING_PERIOD_END}}":   _fmt_date(period["end"]),
        "{{TOTAL_SCHOOL_DAYS}}":     str(period["total_days"]),
    }
    for key, value in replacements.items():
        template = template.replace(key, value)
    return template


def build_prompt(snapshots: list[dict], roster: dict, attendance: dict) -> str:
    template = PROMPT_FILE.read_text()
    instruction = fill_template(template, roster, attendance)
    data_block = json.dumps({"students": snapshots}, indent=2, ensure_ascii=False)
    return f"{instruction}\n\n## Student Data\n\n```json\n{data_block}\n```\n"


def call_gemini(api_key: str, prompt: str) -> str:
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
    )
    return response.text


def extract_json(raw: str) -> dict:
    """Extract a JSON object from the model response, tolerating markdown fences."""
    # Strip markdown code fences if present
    cleaned = re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=re.MULTILINE)
    cleaned = re.sub(r"\s*```$", "", cleaned.strip(), flags=re.MULTILINE)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Try to find the first {...} block
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError(f"Could not parse JSON from model response:\n{raw[:500]}")


def main():
    print("Loading API key…")
    api_key = load_api_key()

    print("Loading data…")
    roster, gradebook, attendance, teacher_notes = load_data()

    print("Computing student snapshots…")
    snapshots = build_student_snapshots(roster, gradebook, attendance, teacher_notes)

    print("Building prompt…")
    prompt = build_prompt(snapshots, roster, attendance)

    print(f"Calling Gemini ({GEMINI_MODEL})…")
    raw_response = call_gemini(api_key, prompt)

    print("Parsing response…")
    result = extract_json(raw_response)

    # Stamp generation time if the model didn't
    result.setdefault("generated_at", datetime.now().isoformat())

    OUTPUT_DIR.mkdir(exist_ok=True)
    output_path = OUTPUT_DIR / "messages.json"
    output_path.write_text(json.dumps(result, indent=2, ensure_ascii=False))

    n_contact = len(result.get("students_to_contact", []))
    n_skip = len(result.get("students_not_contacted", []))
    print(f"\nDone. {n_contact} messages drafted, {n_skip} students skipped.")
    print(f"Output written to {output_path.relative_to(ROOT)}")

    # Print a quick summary to the console
    print("\n--- Recommended contacts ---")
    for rec in result.get("students_to_contact", []):
        print(f"  {rec['student_name']:20s}  [{rec['message_type']}]  {rec['contact_reason'][:80]}")


if __name__ == "__main__":
    main()
