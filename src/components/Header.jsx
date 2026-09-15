export const TABS = ['Overview', 'States', 'Forecast', 'Causal', 'Methodology'];
export default function Header({ metadata, tab, setTab }) {
  return <header className="header"><div className="brand"><span className="brand-mark" aria-hidden="true">◈</span><div><strong>TOURISM / MALAYSIA</strong><span>SUSTAINABILITY OBSERVATORY</span></div></div><div className="header-meta"><span className="status-dot" /> DOSM Datathon 2026 <small>{metadata.sources.join(' · ')} · Updated {metadata.lastUpdated}</small></div><nav aria-label="Dashboard sections">{TABS.map(t => <button key={t} aria-current={tab === t ? 'page' : undefined} onClick={() => setTab(t)}>{t}</button>)}</nav></header>;
}
