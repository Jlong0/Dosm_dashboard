SUSTAINABLE TOURISM DASHBOARD — DOSM Datathon 2026

Requirements: Node.js 22.12+; npm. No backend required.
1. npm ci
2. npm run dev
3. Open http://localhost:5173/
Production build: npm run build
Local production preview: npm run preview (http://localhost:4173/)
Deployment is handled by the project owner.

Data: Data_Cleaning_v2.ipynb and its saved exported workbook. State visitors
cover 2015–2025, national indicators 2012–2025 and coastal STI 2020–2024.
The 65 PCA scores are recomputed using the notebook's own PCA cell and checked
against its saved 2024 results. No synthetic records or interpolated values.

Limitations: Missing environmental observations remain blank. STI covers 13
monitored states. The forecast uses 50% shrinkage and is a prototype. Causal
findings are observational associations from a small panel.

See README.md for offline data regeneration and provenance.
Run npm run check:data for export integrity checks.
Browser review and Dashboard.pdf export remain manual: Chrome launch permission
was declined during implementation. Print the local site using Save as PDF.
