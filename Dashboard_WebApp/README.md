# Malaysia Sustainable Tourism Analytics Dashboard

A web-based decision-support dashboard for exploring sustainable tourism conditions across Malaysia.

The dashboard integrates:

- Sustainable Tourism Index (STI) indicators
- State-level tourism and socioeconomic trends
- Public sentiment analysis
- Marine water-quality monitoring through MarineWatch / MQIMS
- Tourism-demand forecasting
- Observational impact analysis
- Evidence-grounded Decision Intelligence

The final user-facing navigation is:

**Overview → States → MarineWatch → Forecast → Impact Analysis → Methodology**

Public sentiment is integrated into the Overview and States sections rather than presented as a separate page.

---

# 5.1 Software Name and Version Used

## Main software

The dashboard was developed as a web application using:

- **Node.js:** version 22.12 or newer
- **React:** 18.3.1
- **React DOM:** 18.3.1
- **Vite:** 8.3.0
- **@vitejs/plugin-react:** 6.1.1
- **Express.js:** 5.2.1
- **Recharts:** 3.10.1
- **react-simple-maps:** 5.0.5
- **Papa Parse:** 5.7.0
- **JavaScript / JSX**
- **HTML5 / CSS3**
- **OpenRouter API:** used for the Decision Intelligence feature


The production dashboard is deployed as a web application and can be accessed using a modern web browser.

> Note: The exact dependency versions used for the submitted build are recorded in `package.json` and `package-lock.json`.

## Analytical software

The analytical datasets used by the dashboard were generated using Python notebooks, primarily:

- `Data_Cleaning_v5.ipynb`
- `Comment_Sentiment_Pipeline_v2.ipynb`

The notebooks produce validated dashboard-ready exports that are stored under `public/data/`.

---

# 5.2 Step-by-Step Instructions to Open and Navigate the Dashboard

## Option A — Open the deployed dashboard

1. Open the deployed dashboard URL in a modern browser such as Google Chrome, Microsoft Edge, Firefox, or Safari.
2. Wait for the dashboard data to finish loading.
3. Use the top navigation bar to move between:

   **Overview → States → MarineWatch → Forecast → Impact Analysis → Methodology**

4. Use the year-range controls where available to change the period being displayed.
5. Use the state selector to include or exclude states and federal territories.
6. Use the **Reset filters** control to restore the default dashboard selection.

### Overview

The Overview page provides a national-level summary of sustainable tourism conditions.

Users can:

- View headline STI and recovery indicators.
- Compare national trends across the selected year range.
- Review national public-sentiment patterns.
- Examine high-level sustainability observations.
- Open **Decision Intelligence** for evidence-grounded interpretation of the current view.

### States

The States page provides state-level sustainability analysis.

Users can:

1. Select a state from the map, ranking, or state selector.
2. Change the end year of the year-range control to select the STI/report-card year.
3. Examine:
   - STI score
   - sustainability pillars
   - year-on-year indicator changes
   - recovery indicators
   - stability indicators
   - public-perception evidence
4. Open **Decision Intelligence** to obtain an evidence-linked explanation for the selected state.

The initial selected state is **Melaka** and can be changed by the user.

### MarineWatch

MarineWatch provides marine water-quality monitoring based on MQIMS station data.

Users can:

1. Open the **MarineWatch** page.
2. Filter stations by available attributes such as:
   - state
   - MWQI class
   - trend
   - station category
3. Select a station from the map or station listing.
4. Review:
   - latest MWQI value
   - MWQI class
   - historical observations
   - five-year change
   - trend classification
   - monitoring-priority category
   - nearby Marine Protected Area reference points
5. Open **Decision Intelligence** for a marine-water-quality brief or a selected-station explanation.

Monitoring-priority categories are dashboard decision-support heuristics and are not official Department of Environment classifications.

### Forecast

The Forecast page presents model outputs for:

- domestic visitor demand
- water pressure
- coastal quality

Users can:

1. Select the states to display.
2. Review forecast performance.
3. Compare each forecasting model against its naive persistence baseline.
4. Review 2025 forecasts and available actual observations.
5. Open **Decision Intelligence** to interpret forecast reliability.

Only forecast models that outperform the relevant baseline should be interpreted as providing additional predictive value.

### Impact Analysis

The Impact Analysis page presents the observational two-way fixed-effects analysis.

It includes:

- panel coverage
- estimated coefficient
- standard error
- p-value
- confidence interval
- model fit information

The analysis is intended to examine statistical association after controlling for state and year fixed effects.

It does **not** establish definitive causation.

### Methodology

The Methodology page documents:

- STI construction
- data coverage
- fallback rules
- missing-data treatment
- sentiment methodology
- forecast validation
- impact-analysis methodology
- MarineWatch rules
- known data limitations

---

## Option B — Run the dashboard locally

### Prerequisites

Install:

- Node.js 22.12 or newer
- npm

Clone or download the project repository.

From the project folder, run:

npm ci
npm run check:data

### Start the Decision Intelligence backend

In the first terminal:

npm run server

The local backend runs on:

http://localhost:3001

### Start the frontend

In a second terminal:

npm run dev

Open:

http://localhost:5173/

The Vite development server proxies /api requests to the local Decision Intelligence backend.

### Production build

To generate the production bundle:

npm run build

To preview the production bundle locally:

npm run preview

The default preview URL is:

http://localhost:4173/

# 5.3 Additional Requirements, Plugins, or Add-ons

No browser plugins or add-ons are required.

A modern JavaScript-enabled web browser is sufficient for normal dashboard use.

## Decision Intelligence requirements

The core dashboard visualisations use committed dashboard exports and do not require an external data service at runtime.

The **Decision Intelligence** feature additionally requires:

an active backend API
internet access from the backend
an OpenRouter API key
access to a compatible Large Language Model

For local development, create a .env file containing:

OPENROUTER_API_KEY=your_api_key
OPENROUTER_MODEL=your_model
PORT=3001

The API key must remain server-side and must never be exposed using a VITE_ environment variable.

If the OpenRouter quota, rate limit, or selected model is unavailable, the core dashboard remains usable, but AI-generated Decision Intelligence responses may temporarily be unavailable.

# Current Analytical Sources of Truth

The primary analytical sources are:

Data_Cleaning_v5.ipynb
- structured tourism data
- STI calculations
- forecast results
- impact-analysis results
- methodology outputs

Comment_Sentiment_Pipeline_v2.ipynb
- public-sentiment analysis
- national sentiment aggregates
- destination/state sentiment aggregates

dashboard_exports_other/
- analytical hand-off files produced from the current analysis

dashboard_exports/
- sentiment aggregates

`comments_scored.csv` is retained for possible future drill-down work but is not loaded into the runtime dashboard.

`Data_Cleaning_v2.ipynb` and `scripts/export_dashboard.py` are historical artifacts and are not used as current dashboard inputs.

Runtime Data

Runtime data is loaded from `public/data/` through `src/hooks/useDashboardData.js`.

Major files include:

- agg_overview.json
- agg_states_detail.csv
- agg_states_fallback.csv
- agg_states_yoy_values.csv
- agg_states_recovery.csv
- state_year_dashboard.json
- national_year_dashboard.json
- agg_sentiment_*.csv
- agg_forecast_*_dashboard.csv
- agg_causal.json
- agg_methodology.json
- Data.csv
- malaysia-states.geojson
- metadata.json

MarineWatch additionally uses station history, station-summary and Marine Protected Area reference-point datasets.

After notebook outputs change, regenerate and validate the dashboard exports using:

.venv/bin/python scripts/export_v5_forecast_dashboard.py
npm run check:data
npm run build

The exporter reads already-executed notebook outputs and does not rerun the expensive analytical workflow.

# Dashboard Behaviour and Assumptions
- Full STI is shown only where all required inputs are available.
- Perlis, W.P. Kuala Lumpur and W.P. Putrajaya use the Economic + Social fallback where available and are excluded from full-STI rankings.
- Missing observations remain missing. They are never replaced with zero or artificially interpolated.
- The year range filters Overview and state trends.
- The end year selects the States-page STI/report-card observation.
- Forecast, impact-analysis, recovery/stability and pooled-sentiment outputs retain their own labelled analytical periods.
- State selection also controls the states included in applicable forecast visualisations.
- Sentiment availability is independent of STI availability.
- Measured STI/pillar values and perception metrics are shown alongside one another but are never combined into a single artificial score.
- Forecast models are evaluated against naive persistence baselines.
- 2025 domestic-tourism actuals may be available while corresponding environmental actuals remain unpublished.
- Impact-analysis results are observational and must not be interpreted as definitive evidence that tourism caused changes in environmental quality.
- Marine Protected Area distances represent distance to available MPA reference coordinates, not distance to legal protected-area boundaries.
- MarineWatch monitoring priorities are dashboard heuristics intended to support investigation and prioritisation rather than official regulatory classifications.

# Decision Intelligence

The dashboard contains an evidence-grounded Decision Intelligence layer.

Its architecture follows:

Validated dashboard exports
        ↓
Deterministic evidence layer
        ↓
Guided-query contract
        ↓
Backend API
        ↓
Large Language Model
        ↓
Validated structured response
        ↓
Decision Intelligence drawer

Numerical values are obtained from validated dashboard datasets rather than generated by the language model.

The language model is used to:

- explain evidence
- summarise findings
- identify relevant limitations
- provide evidence-linked interpretation

Each material finding is linked to evidence identifiers generated by the deterministic evidence layer.

The system contains guardrails intended to prevent unsupported causal claims and cross-domain interpretation.

# 5.4 Limitations, Assumptions, and Special Considerations

Important limitations include:

## Sustainable Tourism Index
- STI availability differs by state and year.
- States without complete required inputs are not assigned a full STI value.
- Fallback indicators are not equivalent to the full STI and are clearly labelled.

## Missing Data
- Missing observations are preserved as unavailable.
- No zero-filling or artificial interpolation is used to create apparent observations.

## Sentiment Analysis
- Sentiment reflects the available review/comment dataset and should not be interpreted as a representative population survey.
- Platform, sampling, language and destination coverage may introduce bias.
- Some destination-level sentiment is used as a proxy where appropriate and is explicitly labelled.

## Forecasting
- Forecast results depend on the available historical period and model assumptions.
- Model performance is compared against a naive persistence baseline.
- Environmental forecasts that do not outperform the baseline should not be treated as reliable predictive improvements.
- Environmental 2025 actual observations may not yet be published.

## Impact Analysis
- The two-way fixed-effects model is observational.
- Statistical association does not by itself establish causation.
- A non-significant coefficient does not prove that no relationship exists.
- The panel contains a relatively small number of state-year observations.
- State-level results should not be used to explain individual monitoring-station changes.

## MarineWatch / MQIMS
- Marine monitoring stations are not evenly distributed across Malaysia.
- A station measurement represents conditions at the monitoring location and should not automatically be generalised to an entire coastline or state.
- Five-year trend categories use dashboard-defined thresholds.
- Monitoring-priority categories are decision-support heuristics rather than official DOE priority classifications.
- Marine Protected Area data uses reference coordinates and does not represent legal boundary polygons.
- Decision Intelligence
- AI responses are restricted to evidence supplied by the dashboard but remain machine-generated interpretations.
- Decision Intelligence should support human review rather than replace domain experts or regulatory decision-making.
- Availability depends on the configured model/API service.
- API quotas, provider availability or rate limits may temporarily make the AI feature unavailable.
- Technical Considerations
- JavaScript must be enabled.
- The dashboard is designed primarily for modern desktop browsers, although responsive layouts are provided.
- Vite may report a non-blocking JavaScript bundle-size advisory during production builds.

# Validation

Run:

`npm run check:data`

to verify:

- expected analytical hand-offs
- unique keys
- STI coverage and fallbacks
- state-year agreement
- sentiment ranges
- forecast results
- impact-analysis metadata
- absence of raw comments from runtime dashboard data

Run:

`npm run build`

to verify that the production application builds successfully.