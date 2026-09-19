# Malaysia Sustainable Tourism Analytics Dashboard

A static React/Vite dashboard for comparing measured sustainable-tourism conditions, public sentiment, forecasts and observational causal evidence. It uses committed exports and requires no backend or runtime external data service.

## Run locally

Node.js 22.12 or newer is required.

```sh
npm ci
npm run check:data
npm run dev
```

Open <http://localhost:5173/>. For a production bundle, run `npm run build`; `npm run preview` serves that bundle at <http://localhost:4173/>.

## Current sources of truth

- `Data_Cleaning_v5.ipynb`: structured tourism, STI, forecast, causal and methodology results.
- `Comment_Sentiment_Pipeline_v2.ipynb`: aggregate sentiment exports.
- `dashboard_exports_other/`: v5 analytical exports and runtime hand-off files.
- `dashboard_exports/`: sentiment aggregates. `comments_scored.csv` is retained here for possible later drill-down work and is not loaded or copied into `public/data/`.

`Data_Cleaning_v2.ipynb` and `scripts/export_dashboard.py` are historical artifacts only. They are not dashboard inputs. The legacy exporter requires an explicit opt-in flag so it cannot accidentally overwrite the active data.

## Runtime data

The app loads only files under `public/data/` through `src/hooks/useDashboardData.js`.

- `agg_overview.json`: latest national STI and delta KPIs.
- `agg_states_detail.csv`, `agg_states_fallback.csv`, `agg_states_yoy_values.csv`, `agg_states_recovery.csv`: state STI, fallback, report-card, recovery and stability results.
- `state_year_dashboard.json`, `national_year_dashboard.json`: v5-derived trend panels.
- `agg_sentiment_*.csv`: pooled sentiment summaries used by Overview and States.
- `agg_forecast_*_dashboard.csv`: the three forecast tasks and state visitor forecasts.
- `agg_causal.json`, `agg_methodology.json`: validated causal and methodology outputs.
- `Data.csv`: v5 final panel offered as the download.
- `malaysia-states.geojson`, `metadata.json`: map boundaries and provenance metadata.

Run the saved-output exporter after notebook results change:

```sh
.venv/bin/python scripts/export_v5_forecast_dashboard.py
npm run check:data
npm run build
```

The exporter reads already-executed v5 notebook outputs; it does not rerun the expensive analysis.

## Dashboard behavior

- Full STI is shown only when all required inputs exist. Perlis, W.P. Kuala Lumpur and W.P. Putrajaya use the Economic + Social fallback where available and are excluded from full-STI rankings. The fallback export has no 2015–2016 rows, so those years have neither full STI nor Economic + Social fallback because receipts and average-stay inputs are missing.
- Missing values remain missing—never zero-filled or interpolated. An unavailable state/year is explained explicitly.
- The year range filters Overview and state trends; its end year selects the state STI/report-card observation. Forecast, causal, recovery/stability and pooled sentiment panels label their own fixed periods.
- Map, ranking and global state selections share the same state selection. Sentiment availability remains independent from STI availability.
- Measured STI/pillars and perception metrics are visually adjacent but never combined into one score.
- Forecast validation distinguishes 2025 tourism actuals from environmental actuals that are not yet published and compares every model with its naive baseline.
- Causal results use the v5 `final_df`-consistent panel, include state and year fixed effects, and are described as observational rather than definitive proof.

## Validation and known limitations

`npm run check:data` verifies hand-offs, unique keys, STI coverage/fallbacks, state-year agreement, sentiment ranges, forecast results, causal metadata and the absence of raw comments from runtime data. `npm run build` verifies the production bundle.

Important limitations include coastal monitoring-station sparsity, environmental publication lag, readiness not being governance, sentiment sampling/platform bias and small causal samples. Vite currently reports a non-blocking bundle-size advisory for the main JavaScript chunk.
