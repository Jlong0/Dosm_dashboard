import { useMemo, useState } from "react";
import { BarChart, LineChart } from "./components/Charts";
import StateMap from "./components/StateMap";
import { Icon } from "./components/Icons";
import { causalFindings, forecast, metadata, nationalYear, stateYear, states, sustainabilityIndex } from "./data/dashboardData";

const tabs = ["Overview", "States", "Forecast", "Causal", "Methodology"];
const compact = new Intl.NumberFormat("en-MY", { notation: "compact", maximumFractionDigits: 1 });
const integer = new Intl.NumberFormat("en-MY", { maximumFractionDigits: 0 });

function Header({ tab, onTab, selectedState, onState }) {
  return <header className="topbar"><div className="brand"><div className="brand-mark"><Icon name="leaf" size={26} /></div><div><p className="eyebrow">DOSM DATATHON 2026</p><h1>Malaysia Sustainable Tourism</h1></div></div><div className="header-controls"><label className="state-select"><span>Explore state</span><select value={selectedState} onChange={(event) => onState(event.target.value)}>{states.map((state) => <option key={state}>{state}</option>)}</select></label><div className="vintage"><span>Data vintage</span><strong>{metadata.dataVintage}</strong></div></div><nav aria-label="Dashboard sections">{tabs.map((item) => <button key={item} onClick={() => onTab(item)} className={tab === item ? "active" : ""}>{item}</button>)}</nav></header>;
}

function KpiCards() {
  const latest = nationalYear.at(-1); const prior = nationalYear.at(-2); const averageSti = sustainabilityIndex.reduce((sum, row) => sum + row.stiScore, 0) / sustainabilityIndex.length;
  const cards = [
    ["Domestic visitors", `${compact.format(latest.visitors000)}k`, "2025 national total", "users"],
    ["Year-on-year growth", `${((latest.visitors000 / prior.visitors000 - 1) * 100).toFixed(1)}%`, "Recovery remains strong", "trend"],
    ["Average STI", averageSti.toFixed(0), "13 monitored coastal states", "leaf"],
    ["Coastal stations", "13", "States with environmental monitoring", "wave"],
  ];
  return <section className="kpi-grid">{cards.map(([label, value, detail, icon]) => <article className="kpi" key={label}><div className="kpi-icon"><Icon name={icon} /></div><div><p>{label}</p><strong>{value}</strong><small>{detail}</small></div></article>)}</section>;
}

function SectionHeading({ eyebrow, title, children }) { return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{children}</div>; }

function StateExplorer({ selectedState, onSelect }) {
  const scores = Object.fromEntries(sustainabilityIndex.map((row) => [row.state, row.stiScore]));
  const ranking = [...sustainabilityIndex].sort((a, b) => b.stiScore - a.stiScore);
  const selectedRows = stateYear.filter((row) => row.state === selectedState);
  const selectedScore = scores[selectedState];
  return <>
    <section className="panel explorer"><SectionHeading eyebrow="STATE EXPLORER" title="Where is tourism growing sustainably?" /><p className="panel-intro">Boundary lines come from the supplied Malaysia GeoJSON. Select a score marker or ranking bar to compare a state’s tourism activity with its environmental index.</p><div className="explorer-grid"><div><StateMap scores={scores} selectedState={selectedState} onSelect={onSelect} /></div><div className="ranking"><h3>2024 sustainability index</h3>{ranking.map((row, index) => <button key={row.state} onClick={() => onSelect(row.state)} className={selectedState === row.state ? "rank-row selected" : "rank-row"}><span className="rank">{index + 1}</span><span>{row.state}</span><span className="rank-track"><i style={{ width: `${row.stiScore}%` }} /></span><strong>{row.stiScore}</strong></button>)}</div></div></section>
    <section className="panel state-detail"><SectionHeading eyebrow="STATE DETAIL" title={selectedState} ><span className={selectedScore == null ? "status neutral" : "status"}>{selectedScore == null ? "Environmental monitoring unavailable" : `2024 STI score: ${selectedScore}`}</span></SectionHeading><LineChart data={selectedRows} formatter={(v) => compact.format(v)} lines={[{ key: "visitors000", label: "Visitors (’000)", color: "#0a6f69" }, { key: "receiptsPerResidentRm", label: "Receipts / resident (RM)", color: "#f6a63a" }, { key: "coastalGoodExcellentPct", label: "Coastal good+excellent (%)", color: "#6c63c9" }]} /></section>
  </>;
}

function NationalTrends() { return <section className="panel"><SectionHeading eyebrow="NATIONAL TRENDS" title="Tourism recovery alongside visitor costs" /><p className="panel-intro">Domestic visitor volumes rebounded beyond pre-pandemic levels while accommodation and food-away-from-home CPI continued to rise.</p><LineChart data={nationalYear} formatter={(v) => compact.format(v)} lines={[{ key: "visitors000", label: "Visitors (’000)", color: "#0a6f69" }, { key: "cpiAccom", label: "Accommodation CPI", color: "#f6a63a" }, { key: "cpiFoodAway", label: "Food away CPI", color: "#6c63c9" }]} /></section>; }

function ForecastPanel({ selectedState, onSelect }) {
  const error = forecast.reduce((sum, item) => sum + Math.abs(item.errorPct), 0) / forecast.length;
  return <section className="forecast-page"><div className="hero-stat"><div><p className="eyebrow">FORECAST VALIDATION</p><h2>The model was tested against real 2025 outcomes.</h2><p>The dashboard uses a conservative 50% shrinkage toward no-growth, then evaluates it against actual state visitor data—not an unverified projection.</p></div><div className="accuracy"><strong>{error.toFixed(1)}%</strong><span>mean absolute percentage error</span></div></div><section className="panel"><SectionHeading eyebrow="16 STATES & TERRITORIES" title="2024 actual → 2025 forecast → 2025 actual" /><BarChart data={forecast} selected={selectedState} onSelect={onSelect} keys={[{ key: "actual2024", label: "2024 actual", color: "#b7cbcb" }, { key: "shrunkForecast2025", label: "2025 forecast", color: "#f6a63a" }, { key: "actual2025", label: "2025 actual", color: "#0a6f69" }]} /></section><section className="forecast-table panel"><h3>Largest forecast differences</h3><div className="table-wrap"><table><thead><tr><th>State</th><th>Forecast</th><th>Actual</th><th>Error</th></tr></thead><tbody>{[...forecast].sort((a,b) => Math.abs(b.errorPct) - Math.abs(a.errorPct)).slice(0, 6).map((row) => <tr key={row.state}><td>{row.state}</td><td>{integer.format(row.shrunkForecast2025)}k</td><td>{integer.format(row.actual2025)}k</td><td className={Math.abs(row.errorPct) < 6 ? "positive" : "warning"}>{row.errorPct > 0 ? "+" : ""}{row.errorPct}%</td></tr>)}</tbody></table></div></section></section>;
}

function CausalInsights() { return <section className="causal-page"><div className="page-intro"><p className="eyebrow">CAUSAL INSIGHTS</p><h2>Evidence first. Claims second.</h2><p>These regressions examine lagged relationships, with transparent caveats instead of overstating what the data can prove.</p></div><div className="findings">{causalFindings.map((finding, index) => <article key={finding.id} className="finding"><span className="finding-number">0{index + 1}</span><h3>{finding.title}</h3><strong>{finding.result}</strong><p>{finding.detail}</p><footer><span>Sample: n = {finding.n}</span>{finding.caveat && <span className="caveat">{finding.caveat}</span>}</footer></article>)}</div></section>; }

function Methodology() { return <section className="method-page"><div className="page-intro"><p className="eyebrow">METHODOLOGY & DATA</p><h2>Designed to be robust at demo time.</h2><p>The dashboard is a fully static client application. No server, credentials, or live database is required to view it.</p></div><div className="method-grid"><article className="panel"><h3>Data lineage</h3><div className="pipeline"><div>OpenDOSM<br /><span>tourism, CPI</span></div><Icon name="arrow" /><div>data.gov.my<br /><span>coastal monitoring</span></div><Icon name="arrow" /><div>Python notebook<br /><span>cleaning & modelling</span></div><Icon name="arrow" /><div>Static React app<br /><span>this dashboard</span></div></div></article><article className="panel"><h3>Sources & vintage</h3><p className="source-line">{metadata.sources.join(" · ")}</p><p>{metadata.dataVintage}</p><p>Last packaged: {metadata.lastUpdated}</p></article><article className="panel caveats-panel"><h3>Known limitations</h3><ul>{metadata.caveats.map((caveat) => <li key={caveat}>{caveat}</li>)}</ul></article><article className="panel"><h3>Map boundary note</h3><p>The supplied <code>malaysia.geojson</code> is made of state-boundary line segments. It is rendered directly as the map outline; index values are accessible score markers, with the ranked list supplied for exact comparison.</p></article></div></section>; }

export default function App() {
  const [tab, setTab] = useState("Overview"); const [selectedState, setSelectedState] = useState("Pulau Pinang");
  const goState = (state) => { setSelectedState(state); };
  const content = useMemo(() => {
    if (tab === "States") return <StateExplorer selectedState={selectedState} onSelect={goState} />;
    if (tab === "Forecast") return <ForecastPanel selectedState={selectedState} onSelect={goState} />;
    if (tab === "Causal") return <CausalInsights />;
    if (tab === "Methodology") return <Methodology />;
    return <><KpiCards /><StateExplorer selectedState={selectedState} onSelect={goState} /><NationalTrends /></>;
  }, [tab, selectedState]);
  return <><Header tab={tab} onTab={setTab} selectedState={selectedState} onState={setSelectedState} /><main>{content}</main><footer className="site-footer"><span>Malaysia Sustainable Tourism Dashboard</span><span>Static, offline-ready dashboard · {metadata.sources.join(" + ")}</span></footer></>;
}
