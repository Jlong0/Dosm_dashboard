# Malaysia Sustainable Tourism Dashboard

A static, responsive dashboard for the DOSM Datathon 2026 Sustainable Tourism analysis. It visualises national visitor/CPI trends, a state sustainability explorer, 2025 forecast validation, and carefully caveated causal findings.

## Run it

Requires **Node.js 20+** (Node 22 is used in the supplied Docker image).

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). For a production check:

```bash
npm run build
npm run preview
```

The preview server uses port `4173`. Both ports are fixed to make the handoff predictable.

## Docker

```bash
docker build -t sustainable-tourism-dashboard .
docker run --rm -p 8080:80 sustainable-tourism-dashboard
```

Then open [http://localhost:8080](http://localhost:8080).

## What is included

- `src/App.jsx` — tabbed dashboard and filter state.
- `src/components/` — reusable SVG chart, map, and icon components; charts do not require a heavy charting dependency.
- `src/data/dashboardData.js` — compact, build-time static dashboard data with no runtime API calls.
- `malaysia.geojson` — supplied Malaysia state-boundary linework, bundled directly into the map.
- `Data.csv` — the exact 2024/2025 forecast-validation table used by the Forecast tab.
- `Data_Cleaning_v2.ipynb` — original analysis and modelling notebook.
- `Dockerfile` — production static-site image using Nginx.

## Data notes

Data vintage is **2025 for tourism and macro data; 2024 for environmental/coastal data**. Core national series and 2025 forecast-validation values are retained from the notebook’s saved results. The dashboard is deliberately static and has no server, API key, or network request at runtime.

The supplied `malaysia.geojson` contains 45 boundary `LineString` features rather than filled state polygons. The dashboard renders those original boundaries directly and uses selectable, colour-coded score markers plus a ranked index list for exact state comparison.

Known limitations:

- Coastal MWQI is available only for 2020–2024 and 13 monitored states.
- The 2025 visitor model uses 50% shrinkage toward no growth.
- Causal findings are associational; they do not establish causation.
- The notebook is the authoritative source for a full re-export of the combined master data when source workbooks are available. `Data.csv` is intentionally the compact forecast-validation deliverable used by this dashboard.

## Verification

`npm run build` has been run successfully. The app is intentionally dependency-light: React, ReactDOM, and Vite are its only JavaScript dependencies.
