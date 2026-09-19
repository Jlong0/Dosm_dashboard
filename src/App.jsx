import { useState } from 'react';
import { useDashboardData } from './hooks/useDashboardData';
import Header from './components/Header';
import KpiCards from './components/KpiCards';
import StateExplorer from './components/StateExplorer';
import NationalTrends from './components/NationalTrends';
import ForecastPanel from './components/ForecastPanel';
import CausalInsights from './components/CausalInsights';
import Methodology from './components/Methodology';
import OverviewSentiment from './components/OverviewSentiment';

export default function App() {
  const { data, error, loading } = useDashboardData();
  const [tab, setTab] = useState('Overview'), [range, setRange] = useState([2012, 2025]), [selection, setSelection] = useState(null), [selectedState, setSelectedState] = useState('Melaka');
  if (loading) return <main className="loading" role="status"><span className="brand-mark">◈</span><h1>Loading the observatory</h1><p>Reading local notebook exports…</p></main>;
  if (error) return <main className="loading" role="alert"><h1>Data could not be loaded</h1><p>{error.message}</p><p>Run the data exporter and serve the site with Vite.</p><button className="button" onClick={() => location.reload()}>Retry</button></main>;
  const allStates = [...new Set(data.state_year.map(row => row.state))].sort(), states = selection ?? allStates;
  const toggle = state => {
    const next = states.includes(state) ? states.filter(name => name !== state) : [...states, state];
    setSelection(next);
    if (!next.includes(selectedState)) setSelectedState(next[0] ?? '');
  };
  return <><Header metadata={data.metadata} tab={tab} setTab={setTab}/><main className="page">
    <div className="hero"><div><span className="eyebrow">SUSTAINABLE TOURISM / MALAYSIA</span><h1>Growth, with a longer view.</h1><p>Explore how domestic tourism, communities and coastal ecosystems move together.</p></div><a className="button download" href={`${import.meta.env.BASE_URL}data/Processed_Data.xlsx`} download>Download data <span>↗</span></a></div>
    <div className="controls"><div className="range-control"><span className="eyebrow">YEAR RANGE</span><label>From <strong>{range[0]}</strong><input aria-label="Start year" type="range" min="2012" max="2025" value={range[0]} onChange={event => setRange([+event.target.value, Math.max(+event.target.value, range[1])])}/></label><label>To <strong>{range[1]}</strong><input aria-label="End year" type="range" min="2012" max="2025" value={range[1]} onChange={event => setRange([Math.min(range[0], +event.target.value), +event.target.value])}/></label></div><details className="state-picker"><summary>{states.length === 16 ? 'All 16 states & territories' : `${states.length} states selected`} <span>⌄</span></summary><div className="state-options"><div className="selection-actions"><button onClick={() => { setSelection(null); setSelectedState('Melaka'); }}>Select all</button><button onClick={() => { setSelection([]); setSelectedState(''); }}>Clear</button></div>{allStates.map(state => <label key={state}><input type="checkbox" checked={states.includes(state)} onChange={() => toggle(state)}/>{state}</label>)}</div></details><button className="reset" onClick={() => { setRange([2012, 2025]); setSelection(null); setSelectedState('Melaka'); }}>Reset filters ↺</button></div>
    <p className="filter-note">The range filters Overview and state trends; its To year selects the States-page STI snapshot. Forecast, causal, recovery, stability, and pooled sentiment outputs retain their labelled analysis periods. State selection also filters forecasts.</p>
    {tab === 'Overview' && <KpiCards data={data}/>}<div className="content-stack">
      {tab === 'States' && <StateExplorer data={data} range={range} states={states} selectedState={selectedState} onSelect={setSelectedState}/ >}
      {tab === 'Overview' && <><NationalTrends data={data} range={range} states={states}/><OverviewSentiment overall={data.sentiment_overall} dimensions={data.sentiment_dimensions} stakeholders={data.sentiment_stakeholders} quarterly={data.sentiment_quarterly}/></>}
      {tab === 'Forecast' && <ForecastPanel tasks={data.forecast_tasks} visitorRows={data.forecast_state_visitors.filter(row => states.includes(row.state))}/ >}
      {tab === 'Causal' && <CausalInsights causal={data.causal}/ >}{tab === 'Methodology' && <Methodology methodology={data.methodology} causal={data.causal} forecasts={data.forecast_tasks} sentimentOverall={data.sentiment_overall} sentimentQuarterly={data.sentiment_quarterly}/ >}
    </div><footer><span>TOURISM / MALAYSIA <small>DOSM Datathon 2026</small></span><span>Data vintage: {data.metadata.dataVintage}</span><button onClick={() => window.print()}>Print this view ↗</button></footer>
  </main></>;
}
