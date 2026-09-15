# Sustainable Tourism Dashboard — Implementation Plan
**DOSM Datathon 2026 — mapped to `Data_Cleaning_v2.ipynb`**

Two fully decoupled layers, exactly as you specified: a Python pipeline that bakes data into static JSON/CSV, and a React/Vite/Tailwind app that reads those files client-side. No backend, no live database, nothing that can fail during evaluation.

---

## 1. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Data pipeline | Python, pandas (already in the notebook) | No change needed — just add an export cell |
| Build tool | Vite | Fast dev server, zero-config, matches your spec |
| UI framework | React 18 | Component-driven, matches your spec |
| Styling | Tailwind CSS | Utility classes, fast to build with, matches your spec |
| Charts | **Recharts** (primary) | Covers every chart type you need (bar, line, composed/dual-axis, scatter) with a small bundle and simple React API |
| State map | **`react-simple-maps` + `d3-geo`**, static GeoJSON, self-hosted | Pure SVG, no API token, no tile server, plays directly with Tailwind. `d3-geo`'s `geoCentroid` places your index labels precisely in the middle of each state polygon. See §3a for the full setup — kept in-scope per your request, no longer on the cut list |
| Routing | None — tab-based state in one page | You don't need shareable per-page URLs for a static dashboard demo; `react-router` would be one more dependency to debug for no real benefit here |
| Data fetching | Native `fetch()` on mount, no library | The data is static and small (a few hundred KB total) — no need for React Query/SWR |

**On Syncfusion Maps:** it can do the same state-labeling trick, but it's a commercial component suite — even on the free community license, that means account registration and license-key setup for one component, in exchange for nothing `react-simple-maps` doesn't already do here. Sticking with the MIT-licensed, dependency-light stack avoids adding any licensing question to a competition submission with a hard deadline.

---

## 2. Data Layer — What Comes Out of the Notebook

Add **one new final cell** to `Data_Cleaning_v2.ipynb` that exports five JSON files + one flat CSV. Every field below is a real column already in your notebook — nothing here is hypothetical.

| Export file | Source DataFrame | Rows | Notes |
|---|---|---|---|
| `state_year.json` | `combined_master_extended` | 176 (16 states × 2015-2025) | Visitors span 2015-2025; population/water/coastal/mangrove/waste only populated 2018-2024 (genuine data limit — the UI should show blanks, not zeros, for those years) |
| `sustainability_index.json` | `sti_df` | 65 (13 coastal states × 2020-2024) | Includes `PCA_STI_0_100` and `PC1_Standardized`…`PCk_Standardized` |
| `national_year.json` | `national_year_df` | 14 (2012-2025) | Pollutant/marine columns only populated 2020-2024 |
| `forecast.json` | the shrinkage-fixed forecast `results` table | 16 (one per state) | Has `Raw_Model_2025`, `Shrunk_Model_2025`, `Real_2025_Actual`, `Shrunk_Error_%` — this is your best "the model actually works" visual |
| `causal_findings.json` | hand-built from `model_fwd` / `model_rev` / `model_alt` | 3 findings | Not a DataFrame — a small hand-written summary object (a regression table isn't a dashboard chart; a plain-language finding card is) |
| `metadata.json` | hand-written | — | Data vintage, sources list, notebook version, headline caveats — feeds the header's "data source version / last updated" requirement |

### Export cell to paste at the end of the notebook

```python
import json, os

os.makedirs("dashboard_data", exist_ok=True)

def export_json(df, filename, float_round=2):
    records = df.round(float_round).where(pd.notna(df), None).to_dict(orient="records")
    with open(f"dashboard_data/{filename}", "w") as f:
        json.dump(records, f, indent=2, default=str)
    print(f"{filename}: {len(records)} records")

# Rename to concise camelCase keys so the frontend never touches column
# names with embedded units/symbols like "Tourism Receipts per Resident (RM)"
state_year_export = combined_master_extended.rename(columns={
    "State": "state", "Year": "year",
    "Domestic_Visitors_TSA_000": "visitors000",
    "Population_('000)": "population000",
    "Total Receipts (RM million)": "receiptsRmMil",
    "Avg Length of Stay (nights)": "avgStayNights",
    "Visitors per Resident": "visitorsPerResident",
    "Tourism Receipts per Resident (RM)": "receiptsPerResidentRm",
    "Coastal Good+Excellent (%)": "coastalGoodExcellentPct",
    "Coastal Poor (%)": "coastalPoorPct",
    "Mangrove Area (ha)": "mangroveHa",
    "Municipal Waste Facility Tonnes/Day": "wasteTonnesPerDay",
    "Unemployment Rate (%)": "unemploymentPct",
    "Labour Force Participation Rate (%)": "lfprPct",
    "CPI Food Away From Home": "cpiFoodAway",
    "CPI Accommodation Services": "cpiAccom",
})[["state", "year", "visitors000", "population000", "receiptsRmMil",
    "avgStayNights", "visitorsPerResident", "receiptsPerResidentRm",
    "coastalGoodExcellentPct", "coastalPoorPct", "mangroveHa",
    "wasteTonnesPerDay", "unemploymentPct", "lfprPct", "cpiFoodAway", "cpiAccom"]]
export_json(state_year_export, "state_year.json")

sti_export = sti_df.rename(columns={
    "State": "state", "Year": "year", "PCA_STI_0_100": "stiScore",
})[["state", "year", "stiScore"] + [c for c in sti_df.columns if c.startswith("PC")]]
export_json(sti_export, "sustainability_index.json")

national_export = national_year_df.reset_index().rename(columns={
    "Year": "year", "Domestic_Visitors_000": "visitors000",
    "Tourism_Expenditure_RM_mil": "expenditureRmMil",
    "CPI Accom": "cpiAccom", "CPI Food Away": "cpiFoodAway",
    "Marine_Excellent_Stations": "marineExcellent", "Marine_Poor_Stations": "marinePoor",
})
export_json(national_export, "national_year.json")

forecast_export = results.reset_index().rename(columns={
    "State": "state", "2024_Actual": "actual2024",
    "Raw_Model_2025": "rawForecast2025", "Shrunk_Model_2025": "shrunkForecast2025",
    "Real_2025_Actual": "actual2025", "Shrunk_Error_%": "errorPct",
})
export_json(forecast_export, "forecast.json")

causal_findings = [
    {
        "id": "forward",
        "title": "Does tourism intensity affect coastal quality?",
        "result": "No statistically significant effect",
        "detail": "Tourism receipts per resident (t-1): p = 0.41. Length of stay (t-1): p = 0.10.",
        "n": int(model_fwd.nobs), "caveat": "N=52, likely underpowered to detect a small true effect."
    },
    {
        "id": "reverse",
        "title": "Does coastal quality affect tourism receipts?",
        "result": "Weak positive association, borderline significant",
        "detail": f"Coastal quality (t-1) -> receipts: coef = +12.7, p = 0.052.",
        "n": int(model_rev.nobs), "caveat": "Suggestive only - one specification, not a robust finding on its own."
    },
    {
        "id": "robustness",
        "title": "Robustness check (visitor volume instead of receipts)",
        "result": "Same null result",
        "detail": "Confirms no detectable forward effect with an alternative exposure variable.",
        "n": int(model_alt.nobs), "caveat": None
    },
]
with open("dashboard_data/causal_findings.json", "w") as f:
    json.dump(causal_findings, f, indent=2)

metadata = {
    "dataVintage": "2025 (visitors, macro); 2024 (water/coastal/mangrove/waste)",
    "sources": ["OpenDOSM", "data.gov.my"],
    "lastUpdated": pd.Timestamp.now().strftime("%Y-%m-%d"),
    "caveats": [
        "Coastal MWQI only available 2020-2024 for 13 of 16 states",
        "Forecast uses 50% shrinkage toward no-growth - see methodology panel",
        "Causal findings are associational, not confirmed causal relationships",
    ],
}
with open("dashboard_data/metadata.json", "w") as f:
    json.dump(metadata, f, indent=2)

# Flat CSV for the Data.csv submission requirement
combined_master_extended.to_csv("dashboard_data/Data.csv", index=False)

# A compact state -> latest STI score lookup, purpose-built for the map (§3a)
latest_year = sti_df["Year"].max()
map_scores = (sti_df[sti_df["Year"] == latest_year]
              .set_index("State")["PCA_STI_0_100"].round(0).to_dict())
with open("dashboard_data/map_scores.json", "w") as f:
    json.dump(map_scores, f, indent=2)

print("\nAll dashboard data files written to ./dashboard_data/")
```

Run this once, then copy the whole `dashboard_data/` folder into the React app's `public/data/` folder — that's the entire hand-off between the two layers.

---

## 3. Frontend Architecture

### Scaffold

```bash
npm create vite@latest dashboard -- --template react
cd dashboard
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install recharts
npm install react-simple-maps d3-geo
```

### Folder structure

```
dashboard/
├── public/
│   └── data/                  <- copy dashboard_data/*.json + Data.csv here
├── src/
│   ├── main.jsx
│   ├── App.jsx                 <- tab state, top-level layout
│   ├── hooks/
│   │   └── useDashboardData.js <- single fetch-everything-on-mount hook
│   ├── data/
│   │   └── geoNameMap.js       <- geojson name -> dataset state name lookup
│   ├── components/
│   │   ├── Header.jsx           <- title, data vintage, tab nav
│   │   ├── KpiCards.jsx
│   │   ├── StateMap.jsx         <- labeled choropleth, react-simple-maps + d3-geo
│   │   ├── StateExplorer.jsx    <- map + ranked bar chart + click-to-drill-down
│   │   ├── StateDetailPanel.jsx <- trend lines for one selected state
│   │   ├── NationalTrends.jsx   <- visitors vs CPI dual-axis chart
│   │   ├── ForecastPanel.jsx    <- 2025 model vs actual validation chart
│   │   ├── CausalInsights.jsx   <- 3 finding cards, no chart needed
│   │   └── Methodology.jsx      <- data sources, pipeline diagram, caveats
│   └── index.css                <- Tailwind directives
├── package.json
└── vite.config.js
```

### Data loading hook

```jsx
// src/hooks/useDashboardData.js
import { useState, useEffect } from "react";

const FILES = ["state_year", "sustainability_index", "national_year",
               "forecast", "causal_findings", "metadata"];

export function useDashboardData() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all(FILES.map(f => fetch(`./data/${f}.json`).then(r => {
      if (!r.ok) throw new Error(`Failed to load ${f}.json`);
      return r.json();
    })))
      .then(results => setData(Object.fromEntries(FILES.map((f, i) => [f, results[i]]))))
      .catch(setError);
  }, []);

  return { data, error, loading: !data && !error };
}
```

Every component reads from this one hook's result — no per-component fetching, no risk of the UI rendering half-loaded data.

---

## 3a. State Map with Labeled Index Values

### Install

```bash
npm install react-simple-maps d3-geo
```

### Get the boundary file, once, and self-host it

Download a Malaysia state-level GeoJSON — [this gist](https://gist.github.com/heiswayi/81a169ab39dcf749c31a) (raw file linked from that page) is a commonly-used, freely available one with state-level (not district-level) boundaries. Save it as `public/data/malaysia-states.geojson` in the project.

**Do this rather than pointing `<Geographies geography="https://gist.github.com/...">` at the live URL.** Your whole architecture's point is "no external network dependency that can fail during evaluation" — the boundary file should be baked into the app exactly like your data JSON is, not fetched from GitHub at demo time.

You don't need to open the file and hunt for the right property key — the component below tries every common one (`name`, `NAME_1`, `VARNAME_1`, `state`, `State`) automatically and uses whichever is present. The only thing worth a quick glance is that all 16 states/territories are actually in the file, including the small ones (W.P. Kuala Lumpur, Labuan, Putrajaya) — if any are missing, GADM's [Malaysia level-1 administrative boundaries](https://gadm.org) is the fallback source.

### Name normalization

Boundary files almost never spell state names exactly like your dataset (you already hit this once with `W.P.Labuan` vs `W.P. Labuan` in the macro data), so this lookup is what actually attaches each index value to the right state — it's the one piece of manual work the auto-detection above can't remove:

```js
// src/data/geoNameMap.js
// Left side = a spelling the geojson might use -> right side = your
// dataset's canonical state name (matching sti_df / state_year.json)
export const GEO_NAME_TO_DATASET_NAME = {
  "Johor": "Johor",
  "Kedah": "Kedah",
  "Kelantan": "Kelantan",
  "Melaka": "Melaka",
  "Negeri Sembilan": "Negeri Sembilan",
  "Pahang": "Pahang",
  "Perak": "Perak",
  "Perlis": "Perlis",
  "Pulau Pinang": "Pulau Pinang",
  "Penang": "Pulau Pinang",
  "Sabah": "Sabah",
  "Sarawak": "Sarawak",
  "Selangor": "Selangor",
  "Terengganu": "Terengganu",
  "Kuala Lumpur": "W.P. Kuala Lumpur",
  "W.P. Kuala Lumpur": "W.P. Kuala Lumpur",
  "Labuan": "W.P. Labuan",
  "W.P. Labuan": "W.P. Labuan",
  "Putrajaya": "W.P. Putrajaya",
  "W.P. Putrajaya": "W.P. Putrajaya",
};
```

### The map component

```jsx
// src/components/StateMap.jsx
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import { GEO_NAME_TO_DATASET_NAME } from "../data/geoNameMap";

const GEO_URL = "./data/malaysia-states.geojson";

// Tries every common property key so nobody has to open the geojson file
// and go looking for the right one.
const NAME_KEYS = ["name", "NAME_1", "VARNAME_1", "state", "State", "NAME"];
function getGeoStateName(geo) {
  for (const key of NAME_KEYS) {
    if (geo.properties?.[key]) return geo.properties[key];
  }
  return "Unknown";
}

function colorForScore(score, min, max) {
  if (score == null) return "#e2e8f0"; // slate-200: no data for this state
  const t = Math.max(0, Math.min(1, (score - min) / (max - min || 1)));
  // simple red -> amber -> green ramp, no extra color-scale dependency needed
  const r = t < 0.5 ? 220 : Math.round(220 - (t - 0.5) * 2 * 170);
  const g = t < 0.5 ? Math.round(120 + t * 2 * 90) : 180;
  return `rgb(${r}, ${g}, 90)`;
}

export default function StateMap({ scoresByState }) {
  const values = Object.values(scoresByState).filter((v) => v != null);
  const min = Math.min(...values);
  const max = Math.max(...values);

  return (
    <ComposableMap
      projection="geoMercator"
      projectionConfig={ { center: [109.5, 4], scale: 1600 } }
      className="w-full h-auto"
    >
      <Geographies geography={GEO_URL}>
        {({ geographies }) =>
          geographies.map((geo) => {
            const rawName = getGeoStateName(geo);
            const stateName = GEO_NAME_TO_DATASET_NAME[rawName] ?? rawName;
            const score = scoresByState[stateName];
            const centroid = geoCentroid(geo);

            return (
              <g key={geo.rsmKey}>
                <Geography
                  geography={geo}
                  fill={colorForScore(score, min, max)}
                  stroke="#ffffff"
                  strokeWidth={0.75}
                  style={ {
                    default: { outline: "none" },
                    hover: { outline: "none", filter: "brightness(0.92)" },
                    pressed: { outline: "none" },
                  }}
                />
                {score != null && (
                  <Marker coordinates={centroid}>
                    <text
                      textAnchor="middle"
                      className="fill-slate-900 font-semibold pointer-events-none"
                      style={ { fontSize: "9px" } }
                    >
                      {score.toFixed(0)}
                    </text>
                  </Marker>
                )}
              </g>
            );
          })
        }
      </Geographies>
    </ComposableMap>
  );
}
```

Usage in `StateExplorer.jsx`:

```jsx
import StateMap from "./StateMap";
// data.map_scores is a plain { "Johor": 62, "Melaka": 84, ... } object -
// export it from the notebook (see the map_scores.json addition in §2)
<StateMap scoresByState={data.map_scores} />
```

### Known rough edge, and the fix if you hit it

W.P. Kuala Lumpur, Labuan, and Putrajaya are small on a national-scale projection — their centroid labels can look cramped or overlap the state border. If that happens visually once you see it rendered, the standard fix is a `<title>` tooltip on hover (shows the exact value on demand) instead of — or in addition to — the always-on label for those three territories specifically:

```jsx
<Geography geography={geo} /* ...as above... */>
  <title>{`${stateName}: ${score ?? "No data"}`}</title>
</Geography>
```

Keep the always-on label as the default for the 13 larger states where it reads cleanly, and only reach for the hover-tooltip pattern if the small territories are genuinely unreadable in your build — don't pre-emptively build both label styles before you've seen the actual render.

---

## 4. Dashboard Layout (mapped to your spec)

**Header & controls** — title, `metadata.lastUpdated` + `metadata.sources`, a year-range slider and state multi-select that filter what `StateExplorer` and `NationalTrends` show, plus the tab nav (Overview / States / Forecast / Causal / Methodology).

**KPI summary cards** (top row, 4 cards) — pull straight from `national_year.json`'s latest row and `sustainability_index.json`'s average:
- Total Domestic Visitors (latest year, national)
- YoY Growth % (national)
- Average Sustainable Tourism Index (latest year)
- Coastal states monitored (count with non-null MWQI data)

**State Explorer** — the `StateMap` from §3a as the headline visual (Malaysia states color-graded by STI score, value labeled on each state), with a Recharts `BarChart` ranking underneath for precise sorting/comparison the map alone can't give you at a glance. Clicking either a state on the map or a bar sets `selectedState` and renders `StateDetailPanel` below: a small multi-line trend chart of that state's visitors, receipts-per-resident, and (where available) coastal quality over time, using `state_year.json` filtered client-side.

**National Trends** — Recharts `ComposedChart` with two Y-axes: visitors as a line, `cpiAccom`/`cpiFoodAway` as lines on the secondary axis. This is literally the same chart your notebook already built — just re-plotted in Recharts from `national_year.json`.

**Forecast panel** — this is your strongest visual: a grouped bar chart per state showing `actual2024` → `shrunkForecast2025` → `actual2025` side by side. It's a genuine "here's a model, here's what it predicted, here's what actually happened, and it was close" story — rare for a datathon submission to be able to show real validated accuracy rather than an unverifiable forecast.

**Causal Insights** — three plain-language finding cards from `causal_findings.json` (title, result, one-line detail, caveat badge). Don't force this into a chart; a regression coefficient isn't naturally visual, and a clean stat-card layout is more honest about what the finding actually is.

**Methodology / About** — data source list, the architecture diagram (reuse the one shown above, exported as a static image), and the caveats list from `metadata.json`. This is where the notebook's rigor (the Penang bug fix, the shrinkage-validated forecast, the honest null causal result) actually earns credit with judges — most teams won't have this section at all.

---

## 5. Deliverable Packaging

```
TeamName_Datathon2026_Dashboard.zip
├── Dashboard.pdf              <- browser print-to-PDF of the built app (see below)
├── dashboard/                 <- full source folder, minus node_modules
│   ├── src/
│   ├── public/
│   │   └── data/               <- includes malaysia-states.geojson + map_scores.json
│   ├── package.json
│   └── vite.config.js
├── Data.csv                   <- dashboard_data/Data.csv from the export cell
└── README.txt
```

**Generating `Dashboard.pdf`:** run `npm run build && npm run preview`, open the local preview URL in Chrome, set the viewport wide (or use responsive design mode at ~1440px), and use Chrome's native Print → Save as PDF. No extra tooling needed — this is the fastest path given the timeline.

**README.txt should cover:** required Node version, `npm install` then `npm run dev` (or `npm run build && npm run preview`), which port it opens on, one line on data vintage, and one line listing the known limitations already in `metadata.json`.

---

## 6. Day-by-Day Schedule (today is 15 Sept; deadline 22 Sept, 5 PM)

| Day | Focus |
|---|---|
| **15 Sept (today)** | Paste the export cell into the notebook, run it, verify the 5 JSON files + Data.csv look right. Scaffold the Vite project. |
| **16 Sept** | `useDashboardData` hook, `Header`, `KpiCards`, basic Tailwind layout shell — get *something* rendering end-to-end early. |
| **17 Sept** | `StateMap` (§3a) + `StateExplorer` bar chart + `StateDetailPanel` drill-down + `NationalTrends` chart. |
| **18 Sept** | `ForecastPanel` + `CausalInsights` + `Methodology` panel. |
| **19 Sept** | Polish: responsive layout, loading/error states, filters wired up, tooltips. Start `Dashboard.pdf`. |
| **20 Sept** | Package the zip, write `README.txt`, cross-check against the submission checklist. Shift focus to the report/video if the dashboard is stable. |
| **21 Sept** | Buffer day — fix whatever broke, dry-run the whole submission package on a clean machine/folder if possible. |
| **22 Sept, before 5 PM** | Submit. |

---

## 7. Scope Triage (cut in this order if you fall behind)

**Must have:** KPI cards, `StateMap` with labeled scores, one national trend chart, Forecast validation chart, `Data.csv`, `README.txt`, `Dashboard.pdf`.

**Should have:** State Explorer bar chart alongside the map, state drill-down detail panel, Causal Insights cards, year/state filter controls.

**Cut first if short on time:** the hover-tooltip fallback for the three small territories (§3a) — ship with the always-on label first and only add tooltips if you have time to spare; multi-page routing, animations, any live hosting/deployment.
