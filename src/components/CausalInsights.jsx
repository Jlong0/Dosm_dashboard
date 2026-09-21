const number = value => Number.isFinite(value) ? value.toFixed(4) : 'N/A';

export default function CausalInsights({ causal }) {
  const estimate = causal.tourism_receipts_lag1;
  const [yearStart, yearEnd] = [causal.panel_years[0], causal.panel_years.at(-1)];
  return <section className="panel causal-analysis">
    <div className="section-heading"><div><span className="eyebrow">EVIDENCE & UNCERTAINTY</span><h2>Does tourism intensity move with coastal water quality?</h2></div><span className="badge">TWFE · observational panel</span></div>
    <p className="muted causal-intro">This model estimates an association using the final v5 panel. It does not establish that tourism causes changes in coastal quality.</p>
    <div className="causal-result-banner">
      <span className="eyebrow">KEY RESULT</span>
      <h3>No clear association detected</h3>
      <p>Across {causal.panel_states} comparable states from {yearStart}–{yearEnd}, the model does not find statistically distinguishable evidence that higher tourism receipts per resident are associated with changes in the share of coastal monitoring stations rated good or excellent.</p>
    </div>
    <div className="causal-estimate">
      <div><span className="eyebrow">Estimated association</span><h3>Lagged tourism receipts per resident</h3><strong>β = {number(estimate.coefficient)}</strong></div>
      <dl><div><dt>95% confidence interval</dt><dd>[{number(estimate.ci_95[0])}, {number(estimate.ci_95[1])}]</dd></div><div><dt>Robust standard error</dt><dd>{number(estimate.se)}</dd></div><div><dt>p-value</dt><dd>{estimate.p_value.toFixed(3)}</dd></div></dl>
    </div>
    <p className="causal-interpretation">A RM1 increase in the previous year’s tourism receipts per resident is associated with an estimated {number(estimate.coefficient)} percentage-point increase in the share of coastal stations rated good or excellent, after accounting for the model controls and fixed effects. The confidence interval includes zero, so this estimate is not statistically distinguishable from zero at the 5% level.</p>
    <div className="causal-context">
      <article><span className="eyebrow">Model specification</span><h3>State and year fixed effects</h3><p>State fixed effects account for persistent differences between states. Year fixed effects account for shocks common across states, including nationwide COVID-period shocks; they do not remove every possible time-varying confounder.</p><small>Controls: lagged length of stay, unemployment rate, and population · HC1 heteroskedasticity-robust, non-clustered SE</small></article>
      <article><span className="eyebrow">Panel coverage</span><div className="coverage-values"><strong>{causal.panel_n}<small>observations</small></strong><strong>{causal.panel_states}<small>states</small></strong><strong>{yearStart}–{yearEnd}<small>period</small></strong></div><p>Perlis, W.P. Kuala Lumpur, and W.P. Putrajaya are excluded because the coastal-quality outcome is unavailable without monitoring stations.</p></article>
    </div>
    <div className="causal-limitations"><h3>Interpret with care</h3><ul><li>The panel is observational and cannot rule out unobserved factors that vary by state and year.</li><li>Seven annual observations across 13 states provide limited power; no detected association is not proof of no effect.</li><li>Coastal-quality percentages may be more volatile where monitoring is sparse: W.P. Labuan averages {causal.coastal_station_caveat['W.P. Labuan']} stations, Kelantan {causal.coastal_station_caveat.Kelantan}, and Selangor {causal.coastal_station_caveat.Selangor}.</li><li>HC1 errors do not account for within-state serial correlation; the notebook does not rely on unstable cluster-robust inference with only 13 clusters.</li></ul></div>
  </section>;
}
