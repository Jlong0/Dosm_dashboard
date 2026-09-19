const DIRECTIONS = {
  'Tourism Receipts per Resident (RM)': 'Higher is favourable',
  'Avg Length of Stay (nights)': 'Higher is favourable',
  'Labour Force Participation Rate (%)': 'Higher is favourable',
  'Unemployment Rate (%)': 'Lower is favourable · inverted',
  'Non-Domestic Water Share (%)': 'Lower is favourable · inverted',
  'Coastal Good+Excellent (%)': 'Higher is favourable',
};
const TASKS = { domestic_visitors: 'Domestic visitors', water_pressure: 'Water pressure', coastal_quality: 'Coastal quality' };
const metric = (name, value) => name === 'MAPE_%' ? `MAPE ${value.toFixed(1)}%` : `MAE ${value.toFixed(2)} pts`;

export default function Methodology({ methodology, causal, forecasts, sentimentOverall, sentimentQuarterly }) {
  const index = methodology.index_method, robust = methodology.robustness;
  const comments = sentimentOverall.find(row => row.metric === 'analyzed_comments')?.value;
  const periods = sentimentQuarterly.map(row => row.year_quarter).filter(period => period && period !== 'NaT').sort();
  return <section className="panel methodology">
    <span className="eyebrow">SOURCES / METHODS / LIMITATIONS</span><h2>How to read the evidence</h2>
    <p className="method-intro">Methods documented here match the exports currently used by the dashboard. Quantitative sustainability, forecasts, causal estimates, and social-media perception remain separate analytical signals.</p>

    <div className="method-sections">
      <details open><summary>01 / Sustainable Tourism Index</summary><div className="method-body">
        <p>The production STI uses a complete fixed panel of 13 states from {index.panel_years[0]}–{index.panel_years[1]}. Each indicator is converted to a directional Z-score; “lower is favourable” indicators are sign-reversed. The two indicators within each pillar are averaged, the Economic, Social, and Environmental pillars receive equal 33.3% weight, and the composite is rescaled to 0–100 over all 104 state-years.</p>
        <div className="indicator-grid">{['Economic', 'Social', 'Environmental'].map(pillar => <article key={pillar}><h3>{pillar}</h3>{Object.entries(index.indicators).filter(([, value]) => value === pillar).map(([name]) => <p key={name}><strong>{name}</strong><small>{DIRECTIONS[name]}</small></p>)}</article>)}</div>
        <p>To reduce double-counting, <strong>Visitors per Resident</strong> was removed in favour of receipts per resident (r={index.dropped_indicators[0].correlation}), and <strong>Coastal MWQI Proxy</strong> was removed in favour of coastal good/excellent share (r={index.dropped_indicators[1].correlation}). Correlation indicates redundancy here; it does not make either candidate intrinsically invalid.</p>
        <div className="method-note"><strong>Coverage and missing data</strong><p>{index.excluded_states.join(', ')} have no coastal water-quality monitoring stations, so a comparable Environmental pillar cannot be built. Full STI is unavailable in 2015–2016 because receipts and length-of-stay inputs are unavailable, and in 2025 because environmental observations are not published. Where inputs permit, <code>Economic_Social_0_100</code> is shown as a partial fallback—not as STI. The dashboard does not interpolate, substitute zero, fabricate STI, or silently relabel a fallback.</p></div>
      </div></details>

      <details open><summary>02 / Robustness and ranking sensitivity</summary><div className="method-body">
        <div className="method-stats"><strong>{robust.kmo.toFixed(3)}<small>KMO</small></strong><strong>p &lt; 0.0001<small>Bartlett</small></strong><strong>{robust.components_for_80pct_variance}<small>PCs for ≥80%</small></strong><strong>{robust.pearson_r_equal_vs_pca.toFixed(3)}<small>Pearson r</small></strong><strong>{robust.spearman_rho_equal_vs_pca.toFixed(3)}<small>Spearman ρ</small></strong></div>
        <p>Bartlett’s exact exported p-value is {robust.bartlett_p.toExponential(3)}. Four components explain 88.7% of variance. The low KMO indicates weak common-factor structure, so PCA is used as a sensitivity comparison—not as evidence that a single latent factor is the preferred index. Equal-pillar and PCA alternatives broadly align but do not produce identical rankings.</p>
        <p>Leave-one-out testing finds the 2024 ranking most sensitive to <strong>Tourism Receipts per Resident</strong> (Spearman ρ=0.291 when removed). Exact rank positions should therefore be treated as indicative; state stability scores summarize this sensitivity.</p>
      </div></details>

      <details><summary>03 / Forecasting</summary><div className="method-body">
        <p>{methodology.forecast_method.rule}. Historical validation and real 2025 validation are distinct: published 2025 actuals exist for visitors, but not for the environmental tasks.</p>
        <div className="table-scroll"><table><thead><tr><th>Task / model</th><th>Naive</th><th>Model</th><th>Beats baseline?</th><th>2025 actual</th></tr></thead><tbody>{forecasts.map(row => <tr key={row.task}><th>{TASKS[row.task]}<small>{row.model_name}</small></th><td>{metric(row.naive_error_metric, row.naive_error)}</td><td>{metric(row.model_error_metric, row.model_error)}</td><td>{row.beats_baseline === 'True' ? 'Yes' : 'No'}</td><td>{Number.isFinite(row.actual_2025) ? 'Published' : 'Not yet published'}</td></tr>)}</tbody></table></div>
        <p>Only domestic visitor demand beats persistence. Water-pressure and coastal-quality forecasts remain visible for transparent comparison; they are not presented as better operational choices than the naive baseline.</p>
      </div></details>

      <details><summary>04 / Causal analysis</summary><div className="method-body">
        <p>The final v5 TWFE model regresses <strong>Coastal Good+Excellent (%)</strong> on one-year-lagged <strong>Tourism Receipts per Resident (RM)</strong>, with lagged length of stay, unemployment, and population controls. It covers {causal.panel_n} observations across {causal.panel_states} states, {causal.panel_years[0]}–{causal.panel_years.at(-1)}, with state and year fixed effects and HC1 heteroskedasticity-robust, non-clustered standard errors.</p>
        <p>This observational estimate describes a conditional relationship. Fixed effects account for persistent state differences and common year shocks, but residual time-varying confounding and within-state serial correlation may remain.</p>
      </div></details>

      <details><summary>05 / Sentiment analysis</summary><div className="method-body">
        <p>The perception layer uses YouTube comments about Malaysian travel destinations. URLs and excess whitespace are removed; empty/very short and duplicate text is filtered; rule-based relevance retains tourism-focused comments with a mapped sustainability dimension. The final {Number.isFinite(comments) ? comments.toLocaleString('en-MY') : 'N/A'} analysis-ready comments are scored with the multilingual <strong>cardiffnlp/twitter-xlm-roberta-base-sentiment</strong> XLM-R model.</p>
        <p>Keyword rules map comments to Economic, Environmental, Infrastructure, and Social dimensions and tourism aspects. Stakeholder labels—local, visitor, potential visitor, or unknown—require explicit wording in the comment; nationality is not inferred from usernames or language. Aggregates report positive, neutral, negative, and net sentiment (% positive − % negative), with engagement-weighted variants where exported.</p>
        <p>Dated trend records span <strong>{periods[0]}–{periods.at(-1)}</strong>. Undated comments contribute to headline aggregates but not the displayed trend, and sentiment coverage is independent of the selected STI year. Exported low-sample rules flag aspects/destinations below n=20, stakeholder groups below n=30, and monthly dimension buckets below n=10.</p>
        <div className="method-note"><strong>Not survey data</strong><p>Social-media sentiment is a self-selected observational perception signal, not a representative survey of all tourists or residents. Results are subject to YouTube platform, creator/audience, language-detection, model, and participation bias.</p></div>
      </div></details>

      <details><summary>06 / Limitations</summary><div className="method-body"><ul>
        <li>Low coastal-station counts can make annual percentages more volatile—for example, W.P. Labuan averages {causal.coastal_station_caveat['W.P. Labuan']} stations, Kelantan {causal.coastal_station_caveat.Kelantan}, and Selangor {causal.coastal_station_caveat.Selangor}. This affects environmental analysis and forecast confidence without invalidating all monitoring data.</li>
        <li>Environmental publication lags tourism data: 2025 environmental actuals, full STI, and real-world environmental forecast validation are unavailable.</li>
        <li><strong>Readiness ≠ governance quality.</strong> Environmental Data &amp; Monitoring Readiness measures the share of desired monitoring fields observed across years, not policy performance or institutional quality.</li>
        <li>STI is a relative 0–100 composite for the fixed comparison panel, not a certification or absolute sustainability threshold.</li>
      </ul></div></details>

      <details open><summary>07 / Data provenance</summary><div className="method-body provenance-list">
        <p><strong>Data preparation and STI</strong><span>Data_Cleaning_v5.ipynb → final_df → skyfinal.xlsx (State_year and National_Year)</span></p>
        <p><strong>Sentiment</strong><span>Comment_Sentiment_Pipeline_v2.ipynb → dashboard_exports/</span></p>
        <p><strong>Dashboard aggregates</strong><span>dashboard_exports_other/ and dashboard_exports/ → public/data/</span></p>
        <p><strong>Original public providers</strong><span>OpenDOSM and data.gov.my. State boundaries use self-hosted GADM 4.1 data subject to GADM reuse terms.</span></p>
        <p>Legacy notebook versions are not current analytical sources. The generated <code>skyfinal.xlsx</code> workbook is the core processed source described by v5, although it is not checked into this repository.</p>
      </div></details>
    </div>
    <a className="button" href={`${import.meta.env.BASE_URL}data/Data.csv`} download>Download full Data.csv ↗</a>
  </section>;
}
