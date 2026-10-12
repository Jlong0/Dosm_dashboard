"""Extract dashboard-ready YoY values from Data_Cleaning_v5's saved final_df output."""
from pathlib import Path
import io
import json
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
NOTEBOOK_CELL = 105
INDICATORS = {
    "Tourism Receipts per Resident (RM)": ("RM", True, True),
    "Avg Length of Stay (nights)": ("nights", True, True),
    "Labour Force Participation Rate (%)": ("%", True, True),
    "Unemployment Rate (%)": ("%", False, True),
    "Non-Domestic Water Share (%)": ("%", False, True),
    "Coastal Good+Excellent (%)": ("%", True, True),
    "Coastal Poor (%)": ("%", None, False),
    "Municipal Waste Facility Tonnes/Day": ("tonnes/day", None, False),
    "Mangrove Area (ha)": ("ha", None, False),
    "Visitors per Resident": ("ratio", None, False),
}

notebook = json.loads((ROOT / "Data_Cleaning_v5.ipynb").read_text())
cell = notebook["cells"][NOTEBOOK_CELL]
html = next("".join(output["data"]["text/html"]) for output in cell["outputs"] if "text/html" in output.get("data", {}))
final_df = pd.read_html(io.StringIO(html))[0].drop(columns="Unnamed: 0")
assert final_df.shape[0] == 176 and not final_df[["State", "Year"]].duplicated().any()

rows = []
for indicator, (unit, higher_is_better, part_of_sti) in INDICATORS.items():
    values = final_df[["State", "Year", indicator]].rename(columns={indicator: "value"})
    values["indicator"] = indicator
    values["unit"] = unit
    values["higher_is_better"] = higher_is_better
    values["part_of_sti"] = part_of_sti
    rows.append(values)

report = pd.concat(rows, ignore_index=True).sort_values(["State", "Year", "part_of_sti", "indicator"], ascending=[True, True, False, True])
for directory in [ROOT / "dashboard_exports_other", ROOT / "public" / "data"]:
    report.to_csv(directory / "agg_states_yoy_values.csv", index=False)
print(f"Exported {len(report)} v5 report-card values from saved notebook cell {NOTEBOOK_CELL}.")
