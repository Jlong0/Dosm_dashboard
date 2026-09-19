"""Prepare v5 forecast exports, adding published 2025 visitor actuals from saved final_df."""
from pathlib import Path
import io
import json
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
notebook = json.loads((ROOT / "Data_Cleaning_v5.ipynb").read_text())
cell = notebook["cells"][105]
html = next("".join(output["data"]["text/html"]) for output in cell["outputs"] if "text/html" in output.get("data", {}))
final_df = pd.read_html(io.StringIO(html))[0]
actuals = final_df.loc[final_df["Year"] == 2025, ["State", "Domestic Visitors ('000)"]].rename(columns={"State": "state", "Domestic Visitors ('000)": "actual_2025"})
assert len(actuals) == 16 and actuals["actual_2025"].notna().all()

national = pd.read_csv(ROOT / "dashboard_exports_other" / "agg_forecast_national.csv")
national.loc[national["task"] == "domestic_visitors", "actual_2025"] = actuals["actual_2025"].sum()
assert national.loc[national["task"] != "domestic_visitors", "actual_2025"].isna().all()

visitors = pd.read_csv(ROOT / "dashboard_exports_other" / "agg_forecast_states_visitors.csv").merge(actuals, on="state", how="left", validate="one_to_one")
assert visitors["actual_2025"].notna().all()

for directory in [ROOT / "dashboard_exports_other", ROOT / "public" / "data"]:
    national.to_csv(directory / "agg_forecast_national_dashboard.csv", index=False)
    visitors.to_csv(directory / "agg_forecast_states_visitors_dashboard.csv", index=False)
print("Exported 3 national tasks and 16 v5 visitor forecasts with published 2025 actuals.")
