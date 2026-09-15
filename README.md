# Sustainable Tourism Dashboard

Local, static dashboard implementing `docs/Dashboard_Implementation_Plan.md`.
Python bakes notebook data into JSON/CSV. React 18, Vite and Tailwind load those
files once with native fetch. Recharts renders the charts; react-simple-maps and
d3-geo render a self-hosted GADM state map. No backend, database, routing library
or runtime external data service is required.

## Run locally

Use Node.js 22.12+ (or a supported newer version).

```sh
npm ci
npm run dev
```

Open http://localhost:5173/. For a production preview:

```sh
npm run build
npm run preview
```

Preview opens at http://localhost:4173/. The build uses relative asset paths.
Deployment is left to the project owner.

## Data provenance and regeneration

All analytical values originate from `Data_Cleaning_v2.ipynb` and its exported
workbook. The previous manually entered scores and synthetic historical series
have been removed.

`pipeline/source/Combined_dataset_updated.xlsx` is a copy of the notebook export
found locally as `Downloads/Combined_dataset_updated-2.xlsx`. It contains the
112-row original master, 176-row extended master and 14-row national panel.
The export script verifies all state visitor values and the national table
against the notebook's saved HTML outputs. It executes the notebook's unchanged
PCA cell on the exported master and checks all 13 latest-year scores against
cell 92's saved values, within their printed precision. Forecasts and regression
coefficients are parsed from cells 100, 107, 110 and 113; they are not invented
or refitted.

To reproduce the committed exports without downloading analytical source data:

```sh
python3 -m venv .venv
.venv/bin/pip install -r pipeline/requirements.txt
.venv/bin/python scripts/export_dashboard.py
npm run check:data
```

This dependency set was verified with Python 3.14. Generated files are written
to `dashboard_data/`, copied to `public/data/`, and the full CSV is copied to
`Data.csv`. The website requires only the committed files in `public/data/`.

A new final notebook cell also exports directly from the live DataFrames and
fitted models after the original analysis has run. It imports the shared export
function from `scripts/export_dashboard.py`; run the notebook from this project
root. Running the original notebook from scratch still requires its original
`water/` source workbooks, which are not bundled here. The offline export path
above does not require them.

### Data files

- `state_year.json`: 176 records, 16 states/territories, 2015–2025.
- `sustainability_index.json`: 65 records, 13 monitored states, 2020–2024;
  includes all three retained standardized PCA components.
- `national_year.json`: 14 records, 2012–2025, with national environmental data.
- `forecast.json`: 16 states; raw/shrunk forecasts, actuals and signed errors.
- `causal_findings.json`: three findings extracted from saved model outputs.
- `metadata.json`: vintage, provenance, workbook SHA-256 and caveats.
- `map_scores.json`: rounded latest-year scores.
- `Data.csv`: full 176-row extended master, retaining all original columns.

### Plan examples resolved against actual data

The plan's example statistics are not substituted for notebook evidence.
The actual index includes W.P. Labuan and excludes Perlis, W.P. Kuala Lumpur
and W.P. Putrajaya. Saved raw forecast MAPE is 14.4%, with shrunk MAPE 4.2%.
The saved p-values are 0.413 (receipts), 0.098 (stay), 0.052 (reverse) and
0.545 (alternative exposure). Missing observations remain JSON null/CSV blank;
no interpolation or zero imputation is used. The plan's JSON example was
adjusted to avoid non-standard NaN tokens and duplicate/reset-index fields.

The plan's recommended gist and the existing `malaysia.geojson` contain boundary
lines rather than usable named state polygons. Its specified GADM fallback is
therefore used: `public/data/malaysia-states.geojson` contains all 16 states.
Name normalization handles GADM's compact names (e.g. `PulauPinang`).
Source: https://geodata.ucdavis.edu/gadm/gadm4.1/json/gadm41_MYS_1.json
Boundary reuse terms: https://gadm.org/license.html

## Dashboard behavior

Overview includes latest KPIs, labeled state map, ranked STI bar chart, state
profile and national dual-axis trends. States provides the map/ranking/profile;
Forecast compares 2024 actual, 2025 shrunk prediction and 2025 actual; Causal
shows three finding cards; Methodology explains sources, pipeline and caveats.

- Year sliders filter state and national trends. The map uses the latest index
  year within the selected range and explicitly shows no data outside coverage.
- State checkboxes filter the map, ranking and forecast. National trends retain
  the official national lines and add a selected-state visitor comparison.
- Map and bar selection open that state's detail; missing metric series display
  an explicit empty state. Separate small charts preserve each metric's units.
- KPIs use latest available national/coastal data regardless of filters.
- Forecast is fixed 2025 validation; causal cards describe the full model panel.
- CSV download contains the complete notebook export, regardless of filters.

## Validation and PDF

`npm run check:data` checks row counts, unique keys, finite values, missing-data
handling, forecast/visitor agreement, PCA map scores and all 16 boundary names.
`npm run build` verifies the production bundle.

The build and data checks were run. Automated Chrome checks and PDF export were
not run because the browser launch permission was declined. Browser appearance
and interactions still need visual review. To produce `Dashboard.pdf`, open the
local site at a wide viewport and choose Print → Save as PDF. Print styles are
included; the print action prints the currently selected tab. Print the Forecast
view separately if it is needed in the submission PDF.
