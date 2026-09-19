MALAYSIA SUSTAINABLE TOURISM ANALYTICS DASHBOARD

Requirements: Node.js 22.12+ and npm. No backend is required.

1. npm ci
2. npm run check:data
3. npm run dev
4. Open http://localhost:5173/

Production build: npm run build
Production preview: npm run preview (http://localhost:4173/)

Current analytical source: Data_Cleaning_v5.ipynb.
Current sentiment source: Comment_Sentiment_Pipeline_v2.ipynb.
Data_Cleaning_v2.ipynb is historical and is not used by the dashboard.

Missing STI values remain unavailable; they are never interpolated or replaced
with zero. Sentiment is separate from STI. Environmental forecast actuals are
shown as not yet published. Causal findings are observational associations.

See README.md for provenance, regeneration, behavior and limitations.
