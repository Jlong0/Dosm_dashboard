"""Extract recovery deltas and notebook-assigned quadrants from saved v5 output."""
from pathlib import Path
import json
import re
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
NOTEBOOK_CELL = 128
notebook = json.loads((ROOT / "Data_Cleaning_v5.ipynb").read_text())
output = "".join("".join(item.get("text", [])) for item in notebook["cells"][NOTEBOOK_CELL]["outputs"])
pattern = re.compile(r"^\s*(.+?)\s+(-?\d+\.\d)\s+(-?\d+\.\d)\s+(-?\d+\.\d)\s+(.+?)\s*$")
rows = []
for line in output.splitlines():
    match = pattern.match(line)
    if match:
        rows.append({
            "State": match[1],
            "Delta_Economic": float(match[2]),
            "Delta_Environmental": float(match[3]),
            "Quadrant": match[5],
        })

recovery = pd.DataFrame(rows)
assert len(recovery) == 13 and recovery["State"].nunique() == 13
for directory in [ROOT / "dashboard_exports_other", ROOT / "public" / "data"]:
    recovery.to_csv(directory / "agg_states_recovery.csv", index=False)
print(f"Exported {len(recovery)} recovery patterns from saved notebook cell {NOTEBOOK_CELL}.")
