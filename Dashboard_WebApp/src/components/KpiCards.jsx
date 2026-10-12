import { getOverviewKpis } from '../data/overviewKpis';

const signed = value => Number.isFinite(value) ? `${value > 0 ? '+' : ''}${value.toFixed(1)}` : 'N/A';
export default function KpiCards({ data }) {
  const kpis = getOverviewKpis(data.sti_details, data.overview);
  const items = [
   ['National avg STI', Number.isFinite(kpis.averageSti) ? kpis.averageSti.toFixed(1) : 'N/A', kpis.latestYear ? `Full STI only · ${kpis.latestYear}` : 'No valid full-STI year'],
   ['Full STI coverage', kpis.covered ? `${kpis.covered} / ${kpis.total}` : 'N/A', 'States and territories'],
   ['Avg economic recovery Δ', signed(kpis.deltaEconomic), 'Recovery − pre-COVID · index points'],
   ['Avg environmental pressure Δ', signed(kpis.deltaEnvironmental), 'Recovery − pre-COVID · signed index-point change'],
  ];
  return <section className="kpis" aria-label="Latest sustainable tourism indicators">{items.map(([label,value,note],i)=><article key={label} className="kpi"><span className="eyebrow">{label}</span><div className="kpi-value">{value}<span className="kpi-icon">{['◈','≋','↗','≋'][i]}</span></div><small>{note}</small></article>)}</section>;
}
