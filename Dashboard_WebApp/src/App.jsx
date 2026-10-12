import { useEffect, useMemo, useState } from 'react';
import { useDashboardData } from './hooks/useDashboardData';
import Header from './components/Header';
import KpiCards from './components/KpiCards';
import StateExplorer from './components/StateExplorer';
import NationalTrends from './components/NationalTrends';
import ForecastPanel from './components/ForecastPanel';
import CausalInsights from './components/CausalInsights';
import Methodology from './components/Methodology';
import OverviewSentiment from './components/OverviewSentiment';
import MQIMS from './components/MQIMS';
import { buildEvidenceContext } from './evidence/buildEvidenceContext';
import DecisionIntelligenceDrawer from './components/DecisionIntelligenceDrawer';
import OverviewStory from './components/OverviewStory';

export default function App() {
  const {
    data,
    error,
    loading
  } = useDashboardData();

  const [tab, setTab] =
    useState('Overview');

  const [range, setRange] =
    useState([2012, 2025]);

  const [selection, setSelection] =
    useState(null);

  const [
    selectedState,
    setSelectedState
  ] = useState('Melaka');

  const [
    aiOpen,
    setAiOpen
  ] = useState(false);

  const [
    mqimsEvidenceContext,
    setMqimsEvidenceContext
  ] = useState(null);

  const showDecisionIntelligence = tab !== 'Methodology';


  /*
   * data is null during the first render,
   * so always use a safe empty array.
   */
  const stateYearRows =
    data?.state_year ?? [];


  const allStates = [
    ...new Set(
      stateYearRows.map(
        row => row.state
      )
    )
  ].sort();


  const states =
    selection ?? allStates;


  const toggle = state => {
    const next =
      states.includes(state)
        ? states.filter(
            name => name !== state
          )
        : [
            ...states,
            state
          ];

    setSelection(next);

    if (
      !next.includes(
        selectedState
      )
    ) {
      setSelectedState(
        next[0] ?? ''
      );
    }
  };


  const generalEvidenceContext =
    useMemo(() => {

      if (!data) {
        return null;
      }

      const contextualState =
        tab === 'States'
          ? selectedState

          : tab === 'Forecast' &&
            states.length === 1
            ? states[0]

          : null;

      return buildEvidenceContext({
        dashboardData:
          data,

        page:
          tab,

        state:
          contextualState,

        year:
          range?.[1] ?? null
      });

    }, [
      data,
      tab,
      selectedState,
      states,
      range
    ]);

    useEffect(() => {
      if (
        tab === 'Methodology'
      ) {
        setAiOpen(false);
      }
    }, [tab]);

  const activeEvidenceContext =
    tab === 'MQIMS'
      ? mqimsEvidenceContext
      : generalEvidenceContext;


  if (loading) {
    return (
      <main
        className="loading"
        role="status"
      >
        <span className="brand-mark">
          ◈
        </span>

        <h1>
          Loading the observatory
        </h1>

        <p>
          Reading local notebook exports…
        </p>
      </main>
    );
  }


  if (error) {
    return (
      <main
        className="loading"
        role="alert"
      >
        <h1>
          Data could not be loaded
        </h1>

        <p>
          {error.message}
        </p>

        <p>
          Run the data exporter and
          serve the site with Vite.
        </p>

        <button
          className="button"
          onClick={() =>
            location.reload()
          }
        >
          Retry
        </button>
      </main>
    );
  }
  return <><Header metadata={data.metadata} tab={tab} setTab={setTab}/><main className="page">
    <div className="hero">
      <div>
        {tab === 'MQIMS' ? (
          <>
            <span className="eyebrow">
              MARINE ENVIRONMENT / MALAYSIA
            </span>

            <h1>
              MarineWatch Malaysia
            </h1>

            <p>
              Monitor marine water quality, detect
              deteriorating stations and support coastal
              intervention prioritisation.
            </p>
          </>
        ) : tab === 'Overview' ? (
          <>
            <span className="eyebrow">SUSTAINABLE TOURISM / MALAYSIA</span>
            <h1>From Tourism Growth to Sustainable Decisions</h1>
            <p className="hero-lead">An early-warning and decision-support system for Malaysia's tourism future.</p>
            <div className="problem-statement"><strong>The challenge</strong><span>Visitor growth alone cannot reveal emerging pressure on communities, infrastructure and coastal ecosystems. This platform combines sustainability benchmarking, forecasting, public sentiment and marine monitoring to identify where pressure is emerging and where closer investigation or action may be needed.</span></div>
          </>
        ) : tab === 'States' ? (
          <>
            <span className="eyebrow">SUSTAINABLE TOURISM / MALAYSIA</span>
            <h1>How have economic and environmental conditions changed across states?</h1>
            <p>Explore how domestic tourism, communities and coastal ecosystems move together.</p>
          </>
        ) : tab === 'Forecast' ? (
          <>
            <span className="eyebrow">SUSTAINABLE TOURISM / MALAYSIA</span>
            <h1>Where is tourism demand heading next?</h1>
            <p>Use validated forecasts to anticipate domestic visitor demand while testing whether environmental indicators can be forecast reliably.</p>
          </>
        ) : tab === 'Causal' ? null : tab === 'Methodology' ? (
          <>
            <span className="eyebrow">SUSTAINABLE TOURISM / MALAYSIA</span>
            <h1>Methodology &amp; Data</h1>
            <p>Understand how the Sustainability Observatory transforms tourism, socioeconomic, environmental and public-perception data into transparent, validated evidence.</p>
          </>
        ) : (
          <>
            <span className="eyebrow">SUSTAINABLE TOURISM / MALAYSIA</span>
            <h1>Growth, with a longer view.</h1>
            <p>Explore how domestic tourism, communities and coastal ecosystems move together.</p>
          </>
        )}

      </div>

      {tab !== 'MQIMS' && (
        <a
          className="button download"
          href={`${import.meta.env.BASE_URL}data/Processed_Data.xlsx`}
          download
        >
          Download data <span>↗</span>
        </a>
        )}
    </div>
    {tab !== 'MQIMS' && tab !== 'Causal' && tab !== 'Methodology' && (
      <>
        <div className="controls"><div className="range-control"><span className="eyebrow">YEAR RANGE</span><label>From <strong>{range[0]}</strong><input aria-label="Start year" type="range" min="2012" max="2025" value={range[0]} onChange={event => setRange([+event.target.value, Math.max(+event.target.value, range[1])])}/></label><label>To <strong>{range[1]}</strong><input aria-label="End year" type="range" min="2012" max="2025" value={range[1]} onChange={event => setRange([Math.min(range[0], +event.target.value), +event.target.value])}/></label></div><details className="state-picker"><summary>{states.length === 16 ? 'All 16 states & territories' : `${states.length} states selected`} <span>⌄</span></summary><div className="state-options"><div className="selection-actions"><button onClick={() => { setSelection(null); setSelectedState('Melaka'); }}>Select all</button><button onClick={() => { setSelection([]); setSelectedState(''); }}>Clear</button></div>{allStates.map(state => <label key={state}><input type="checkbox" checked={states.includes(state)} onChange={() => toggle(state)}/>{state}</label>)}</div></details><button className="reset" onClick={() => { setRange([2012, 2025]); setSelection(null); setSelectedState('Melaka'); }}>Reset filters ↺</button></div>
        <p className="filter-note">The range filters Overview and state trends; its To year selects the States-page STI snapshot. Forecast, causal, recovery, stability, and pooled sentiment outputs retain their labelled analysis periods. State selection also filters forecasts.</p>
      </>
    )}
      {tab === 'Overview' && <KpiCards data={data} evidenceContext={generalEvidenceContext}/>}<div className="content-stack">
      {tab === 'States' && <StateExplorer data={data} range={range} states={states} selectedState={selectedState} onSelect={setSelectedState} evidenceContext={generalEvidenceContext}/ >}
      {tab === 'Overview' && <NationalTrends data={data} range={range} states={states}/>}
      {tab === 'Forecast' && <ForecastPanel tasks={data.forecast_tasks} visitorRows={data.forecast_state_visitors.filter(row => states.includes(row.state))} evidenceContext={generalEvidenceContext}/ >}
      {tab === 'Overview' && <OverviewStory data={data} setTab={setTab}/>}
      {tab === 'Overview' && <OverviewSentiment overall={data.sentiment_overall} dimensions={data.sentiment_dimensions} stakeholders={data.sentiment_stakeholders} quarterly={data.sentiment_quarterly} aspects={data.sentiment_aspects}/>}
      {tab === 'Causal' && <CausalInsights causal={data.causal}/ >}{tab === 'Methodology' && <Methodology methodology={data.methodology} causal={data.causal} forecasts={data.forecast_tasks} sentimentOverall={data.sentiment_overall} sentimentQuarterly={data.sentiment_quarterly}/ >}
      {tab === 'MQIMS' && (<MQIMS geography={data.geography} dashboardData={data} onEvidenceContextChange={ setMqimsEvidenceContext }/>)}
    </div><footer><span>TOURISM / MALAYSIA <small>DOSM Datathon 2026</small></span><span>Data vintage: {data.metadata.dataVintage}</span><button onClick={() => window.print()}>Print this view ↗</button></footer>
    {showDecisionIntelligence && (
      <div className="ai-launcher">
        <div className="ai-launch-hint">
          Explain this view using
          dashboard evidence
        </div>
        <button
          type="button"
          className="ai-floating-button"
          onClick={() =>
            setAiOpen(true)
          }
        >
        
          <span>✦</span>
          
        
          <span>
            Decision Intelligence
          </span>
        </button>
      </div>
    )}
  
  <DecisionIntelligenceDrawer
    open={aiOpen && showDecisionIntelligence}
    onClose={() =>
      setAiOpen(false)
    }
    evidenceContext={
      activeEvidenceContext
    }
  />
  </main></>;
}
