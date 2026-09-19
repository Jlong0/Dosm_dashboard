import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import StateMap, { colorForScore } from './StateMap';
import StateDetailPanel from './StateDetailPanel';
import { getPillarBreakdown, getStiSnapshot } from '../data/stiAvailability';
import { getRecoveryInsights } from '../data/recoveryInsights';
export default function StateExplorer({ data, range, states, selectedState, onSelect }) {
 const year=range[1];
 const snapshot=getStiSnapshot(data.sti_details,data.sti_fallbacks,states,year);
 const resultsByState=Object.fromEntries(snapshot.map(result=>[result.state,result]));
 const scores=snapshot.filter(result=>result.status==='full').sort((a,b)=>b.value-a.value);
 const detail=data.state_year.filter(r=>r.state===selectedState&&r.year>=range[0]&&r.year<=range[1]).sort((a,b)=>a.year-b.year);
 const selectedYearDetail=data.state_year.find(r=>r.state===selectedState&&r.year===year);
 const pillars=getPillarBreakdown(data.sti_details,data.sti_fallbacks,selectedState,year);
 const recovery=getRecoveryInsights(data.sti_details,data.recovery,selectedState);
 const sentiment={destinationDimensions:data.sentiment_destination_dimensions,aspects:data.sentiment_aspects,quarterly:data.sentiment_quarterly};
 return <><section className="panel"><div className="section-heading"><div><span className="eyebrow">GEOGRAPHY OF SUSTAINABILITY</span><h2>A state-by-state perspective</h2></div><span className="badge">Selected year · {year}</span></div><p className="muted">Full STI uses the v5 equal-pillar index. Neutral areas have fallback or unavailable full STI and remain selectable.</p><StateMap geography={data.geography} resultsByState={resultsByState} year={year} selectedState={selectedState} onSelect={onSelect} states={states}/><div className="ranking"><h3>State STI Ranking — {year} <span className="muted">/ 100</span></h3>{scores.length?<><p className="muted">{scores.length} states with complete STI coverage</p><ResponsiveContainer width="100%" height={Math.max(260,scores.length*32)}><BarChart data={scores} layout="vertical" margin={{left:5,right:40,top:10,bottom:5}}><CartesianGrid horizontal={false} stroke="#edf0ec"/><XAxis type="number" domain={[0,100]} tick={{fontSize:11}}/><YAxis type="category" dataKey="state" width={135} tick={{fontSize:11}}/><Tooltip formatter={v=>[Number(v).toFixed(1),'Full STI']}/><Bar dataKey="value" radius={[0,4,4,0]} barSize={17} isAnimationActive={false} onClick={r=>onSelect(r.state)} label={{position:'right',fontSize:11,formatter:v=>Number(v).toFixed(1)}}>{scores.map(r=><Cell key={r.state} fill={colorForScore(r.value)} cursor="pointer"/>)}</Bar></BarChart></ResponsiveContainer></>:<div className="empty">Full STI ranking unavailable for {year}. Environmental inputs required for full STI are not available.</div>}</div></section><StateDetailPanel state={selectedState} year={year} pillars={pillars} sourceRow={selectedYearDetail} yoyValues={data.yoy_values} recovery={recovery} sentiment={sentiment} rows={detail}/></>;
}
