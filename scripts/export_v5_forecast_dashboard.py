"""Prepare dashboard exports from executed v5 notebook outputs without rerunning analysis."""
from pathlib import Path
import io
import json
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
notebook = json.loads((ROOT / "Data_Cleaning_v5.ipynb").read_text())
def saved_table(cell_number):
    cell = notebook["cells"][cell_number]
    html = next("".join(output["data"]["text/html"]) for output in cell["outputs"] if "text/html" in output.get("data", {}))
    return pd.read_html(io.StringIO(html))[0].drop(columns=["Unnamed: 0"], errors="ignore")

final_df = saved_table(105)
national_year_df = saved_table(84)
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

STATE_COLUMNS = {
    "State": "state", "Year": "year", "Domestic_Visitors_TSA_000": "visitors000",
    "Population_('000)": "population000", "Total Receipts (RM million)": "receiptsRmMil",
    "Avg Length of Stay (nights)": "avgStayNights", "Visitors per Resident": "visitorsPerResident",
    "Tourism Receipts per Resident (RM)": "receiptsPerResidentRm",
    "Coastal Good+Excellent (%)": "coastalGoodExcellentPct", "Coastal Poor (%)": "coastalPoorPct",
    "Mangrove Area (ha)": "mangroveHa", "Municipal Waste Facility Tonnes/Day": "wasteTonnesPerDay",
    "Unemployment Rate (%)": "unemploymentPct", "Labour Force Participation Rate (%)": "lfprPct",
    "CPI Food Away From Home": "cpiFoodAway", "CPI Accommodation Services": "cpiAccom",
}
NATIONAL_COLUMNS = {
    "Year": "year", "Domestic_Visitors_000": "visitors000",
    "Tourism_Expenditure_RM_mil": "expenditureRmMil", "CPI Accom": "cpiAccom",
    "CPI Food Away": "cpiFoodAway", "Marine_Excellent_Stations": "marineExcellent",
    "Marine_Poor_Stations": "marinePoor",
}

state_rows = final_df[list(STATE_COLUMNS)].rename(columns=STATE_COLUMNS)
national_rows = national_year_df[list(NATIONAL_COLUMNS)].rename(columns=NATIONAL_COLUMNS)
assert len(state_rows) == 176 and not state_rows.duplicated(["state", "year"]).any()
assert len(national_rows) == 14 and not national_rows.duplicated(["year"]).any()

state_json = state_rows.to_json(orient="records", indent=2)
national_json = national_rows.to_json(orient="records", indent=2)
(ROOT / "dashboard_exports_other" / "state_year_dashboard.json").write_text(state_json + "\n")
(ROOT / "dashboard_exports_other" / "national_year_dashboard.json").write_text(national_json + "\n")
(ROOT / "public" / "data" / "state_year_dashboard.json").write_text(state_json + "\n")
(ROOT / "public" / "data" / "national_year_dashboard.json").write_text(national_json + "\n")
final_df.to_csv(ROOT / "dashboard_exports_other" / "Data_v5.csv", index=False)
final_df.to_csv(ROOT / "public" / "data" / "Data.csv", index=False)
final_df.to_csv(ROOT / "Data.csv", index=False)

print("Exported v5 core panels, 3 national forecast tasks, and 16 visitor forecasts.")
