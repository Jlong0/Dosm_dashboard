import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const LABELS = { domestic_visitors: 'Domestic visitors', water_pressure: 'Water pressure', coastal_quality: 'Coastal quality' };
const finite = value => Number.isFinite(value);
const measure = (row, value) => !finite(value) ? 'N/A — not yet published' : row.task === 'domestic_visitors' ? `${(value / 1000).toFixed(1)}M` : `${value.toFixed(2)}%`;
const error = (metric, value) => !finite(value) ? 'N/A' : metric === 'MAPE_%' ? `MAPE ${value.toFixed(1)}%` : `MAE ${value.toFixed(2)} pts`;
const beatsBaseline = row => row.beats_baseline === true || row.beats_baseline === 'True';

export default function ForecastPanel({ tasks, visitorRows }) {
  return <section className="panel">
    <div className="section-heading"><div><span className="eyebrow">MODEL / BASELINE / REALITY CHECK</span><h2>Three forecasts, different evidence</h2></div><span className="badge">1 of 3 beats baseline</span></div>
    <p className="muted">Every model is compared with naive persistence. Environmental error metrics come from historical holdout validation; published 2025 environmental actuals are not yet available.</p>
    <div className="forecast-task-grid">{tasks.map(row => <article key={row.task} className={`forecast-task ${beatsBaseline(row) ? 'passes' : 'fails'}`}>
      <div><span className="eyebrow">{LABELS[row.task]}</span><h3>{row.model_name}</h3></div>
      <dl><div><dt>2024 observed</dt><dd>{measure(row, row.actual_2024)}</dd></div><div><dt>2025 model forecast</dt><dd>{measure(row, row.model_forecast_2025)}</dd></div><div><dt>2025 observed</dt><dd>{measure(row, row.actual_2025)}</dd></div></dl>
      <p><span>{error(row.naive_error_metric, row.naive_error)}</span><span>{error(row.model_error_metric, row.model_error)}</span></p>
      <strong className="baseline-result">Beats baseline: {beatsBaseline(row) ? 'Yes' : 'No'}</strong>
      <small>{row.task === 'domestic_visitors' ? 'Published 2025 actual shown; reported MAPE is the notebook’s historical validation result.' : row.task === 'coastal_quality' ? 'Historical validation only · model forecast shown for transparency, not recommended.' : 'Historical validation only · persistence remains the recommended 2025 forecast.'}</small>
    </article>)}</div>
    <div className="table-scroll forecast-table"><table><thead><tr>{['Task', '2024 actual', '2025 model forecast', '2025 actual', 'Naive error', 'Model error', 'Beats baseline?'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{tasks.map(row => <tr key={row.task}><th>{LABELS[row.task]}<small>{row.unit}</small></th><td>{measure(row, row.actual_2024)}</td><td>{measure(row, row.model_forecast_2025)}</td><td>{measure(row, row.actual_2025)}</td><td>{error(row.naive_error_metric, row.naive_error)}</td><td>{error(row.model_error_metric, row.model_error)}</td><td><span className={`report-status ${beatsBaseline(row) ? 'favourable' : 'concern'}`}>{beatsBaseline(row) ? 'Yes' : 'No'}</span></td></tr>)}</tbody></table></div>
    <div className="forecast-chart"><h3>Selected-state domestic visitor forecast</h3>{visitorRows.length ? <ResponsiveContainer width="100%" height={Math.max(340, visitorRows.length * 56)}><BarChart data={visitorRows} layout="vertical" margin={{ left: 0, right: 20, top: 10, bottom: 10 }}><CartesianGrid horizontal={false} stroke="#edf0ec"/><XAxis type="number" tickFormatter={value => `${(value / 1000).toFixed(0)}M`}/><YAxis type="category" dataKey="state" width={135} tick={{ fontSize: 11 }}/><Tooltip formatter={value => [`${Number(value).toLocaleString('en-MY', { maximumFractionDigits: 1 })} ('000)`]}/><Legend wrapperStyle={{ fontSize: 12 }}/><Bar dataKey="actual_2024" name="2024 observed" fill="#c4d3cd" isAnimationActive={false}/><Bar dataKey="model_forecast_2025" name="2025 model forecast" fill="#c28e4f" isAnimationActive={false}/><Bar dataKey="actual_2025" name="2025 observed" fill="#16705b" isAnimationActive={false}/></BarChart></ResponsiveContainer> : <div className="empty">Select at least one state to compare domestic visitor forecasts.</div>}</div>
    <div className="forecast-notes"><p>2025 environmental monitoring results are not yet available in the source data, so real-world 2025 validation is not yet possible for water-pressure or coastal-quality forecasts.</p><p>Coastal percentages are volatile where monitoring networks are sparse: W.P. Labuan averages 5 stations, Kelantan 6, and Selangor 6. This is an important limitation, but is not asserted as the sole cause of poor model performance.</p></div>
  </section>;
}
