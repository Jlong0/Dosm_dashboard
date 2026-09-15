MALAYSIA SUSTAINABLE TOURISM DASHBOARD
DOSM Datathon 2026

REQUIREMENTS
Node.js 20 or newer. Node 22 is used in the Docker image.

RUN LOCALLY
1. npm install
2. npm run dev
3. Open http://localhost:5173

PRODUCTION CHECK
npm run build
npm run preview
Open http://localhost:4173

DOCKER (optional)
docker build -t sustainable-tourism-dashboard .
docker run --rm -p 8080:80 sustainable-tourism-dashboard
Open http://localhost:8080

DATA VINTAGE
2025 tourism and macro data; 2024 environmental/coastal data.
Sources: OpenDOSM and data.gov.my.

CONTENTS
- src/: React dashboard source
- malaysia.geojson: supplied Malaysia state-boundary linework
- Data.csv: 2024/2025 forecast validation table used by the app
- Data_Cleaning_v2.ipynb: original analysis notebook
- Dockerfile: production static-site container

KNOWN LIMITATIONS
- Coastal MWQI covers only 13 states and years 2020–2024.
- Forecast values use 50% shrinkage towards no growth.
- Causal findings are associations, not proof of causation.
- malaysia.geojson uses LineString boundaries, so state index values are shown as clickable
  colour-coded markers and a ranked comparison list rather than polygon fills.

The application has no runtime API, backend, credentials, or external map dependency.
