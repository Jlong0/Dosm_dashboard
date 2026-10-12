"""Add Scheduled Waste to the runtime report-card CSV; rerun after upstream exports."""
from pathlib import Path
import csv
import math
import os
import tempfile

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "public/data/agg_states_yoy_values.csv"
INDICATOR = "Scheduled Waste"
FIELDS = ["State", "Year", "value", "indicator", "unit", "higher_is_better", "part_of_sti"]


def main():
    source = pd.read_excel(
        ROOT / "public/data/Processed_Data.xlsx",
        sheet_name="State_year",
        usecols=["State", "Year", "Scheduled waste"],
        dtype={"State": str, "Year": "Int64"},
    )
    assert source[["State", "Year"]].notna().all().all(), "Missing source State/Year"
    assert not source.duplicated(["State", "Year"]).any(), "Duplicate source State/Year"
    assert source["Scheduled waste"].dropna().map(math.isfinite).all(), "Invalid waste value"

    with CSV_PATH.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        assert reader.fieldnames == FIELDS, "Unexpected report-card schema"
        # Keep existing fields as strings so precision, blanks and booleans survive.
        existing = [row for row in reader if row["indicator"] != INDICATOR]

    additions = {}
    for state, year, value in source[["State", "Year", "Scheduled waste"]].itertuples(index=False, name=None):
        additions[(state, str(year))] = dict(zip(FIELDS, [
            state, str(year), "" if pd.isna(value) else str(value),
            INDICATOR, "tonnes", "", "False",
        ]))

    anchors = [(row["State"], row["Year"]) for row in existing if row["indicator"] == "Visitors per Resident"]
    assert len(anchors) == len(set(anchors)), "Duplicate Visitors per Resident anchors"
    assert set(anchors) == set(additions), "Workbook and report-card State/Year coverage differs"

    patched = []
    for row in existing:
        patched.append(row)
        if row["indicator"] == "Visitors per Resident":
            patched.append(additions[(row["State"], row["Year"])])

    assert [row for row in patched if row["indicator"] != INDICATOR] == existing
    keys = [(row["State"], row["Year"], row["indicator"]) for row in patched]
    assert len(keys) == len(set(keys)), "Duplicate report-card State/Year/indicator"
    for index, row in enumerate(patched):
        if row["indicator"] == INDICATOR:
            previous = patched[index - 1]
            assert previous["indicator"] == "Visitors per Resident"
            assert (previous["State"], previous["Year"]) == (row["State"], row["Year"])

    # Replace only after validation and a complete write, avoiding partial CSVs.
    with tempfile.NamedTemporaryFile(mode="w", newline="", encoding="utf-8", dir=CSV_PATH.parent, delete=False) as handle:
        temporary = Path(handle.name)
        try:
            writer = csv.DictWriter(handle, fieldnames=FIELDS, lineterminator="\n")
            writer.writeheader()
            writer.writerows(patched)
        except BaseException:
            temporary.unlink(missing_ok=True)
            raise
    try:
        os.replace(temporary, CSV_PATH)
    finally:
        temporary.unlink(missing_ok=True)

    print(f"Inserted {len(additions)} Scheduled Waste rows; {source['Scheduled waste'].notna().sum()} non-null, "
          f"{source['State'].nunique()} states, {source['Year'].min()}–{source['Year'].max()}. "
          f"Preserved {len(existing)} existing rows.")


if __name__ == "__main__":
    main()
