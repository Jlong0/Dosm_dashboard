const fmt = (v, digits = 1) => v == null ? '—' : v.toLocaleString('en-MY', { maximumFractionDigits: digits });
export default function KpiCards({ data, showIndex = true }) {
 const rows = [...data.national_year].sort((a,b) => a.year-b.year), latest = rows.at(-1), prev = rows.find(r=>r.year===latest.year-1);
 const year = Math.max(...data.sustainability_index.map(r=>r.year));
 const scores = data.sustainability_index.filter(r=>r.year===year && r.stiScore!=null);
 const monitored = data.state_year.filter(r=>r.year===year && r.coastalGoodExcellentPct!=null).length;
 const items = [ ['Domestic visitors', `${fmt(latest.visitors000/1000)}M`, `National total · ${latest.year}`], ['Year-on-year growth', `${fmt(prev?.visitors000 ? (latest.visitors000/prev.visitors000-1)*100 : null)}%`, `${latest.year} vs ${latest.year-1} · national`], ['Average tourism index',fmt(scores.reduce((s,r)=>s+r.stiScore,0)/scores.length),`Out of 100 · ${year} · ${scores.length} states`], ['Coastal states monitored',String(monitored),`With MWQI observations · ${year}`] ];
 return <section className={`kpis ${showIndex ? '' : 'kpis-without-index'}`} aria-label="Latest national and coastal indicators">{items.map(([label,value,note],i)=> i === 2 && !showIndex ? null :<article key={label} className="kpi"><span className="eyebrow">{label}</span><div className="kpi-value">{value}<span className="kpi-icon">{['↗','↗','◈','≋'][i]}</span></div><small>{note}</small></article>)}</section>;
}
