import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { geoCentroid } from 'd3-geo';
import { geoState } from '../data/geoNameMap';
export function colorForScore(value) {
 if (value == null) return '#dce4e2';
 const t = Math.max(0, Math.min(1, value / 100));
 const from = t < .5 ? [199,100,81] : [228,198,117], to = t < .5 ? [228,198,117] : [22,112,91], u=t<.5?t*2:(t-.5)*2;
 return `rgb(${from.map((v,i)=>Math.round(v+(to[i]-v)*u)).join(',')})`;
}
function tooltip(name, result, year, active) {
 if (!active) return `${name}\nExcluded by the current state filter`;
 if (result?.status === 'full') return `${name}\nFull STI: ${result.value.toFixed(1)}\nYear: ${year}`;
 const structural = result?.message?.includes('no coastal water-quality');
 return [name, `Full STI: ${structural ? 'Not available' : 'Not calculated'}`, structural && 'Reason: No coastal water-quality monitoring stations', result?.status === 'fallback' && `Economic + Social Score: ${result.value.toFixed(1)}`, `Year: ${year}`].filter(Boolean).join('\n');
}
export default function StateMap({ geography, resultsByState, year, selectedState, onSelect, states }) {
 return <div className="map-wrap"><ComposableMap width={900} height={345} projection="geoMercator" projectionConfig={{center:[109.5,4.1],scale:2450}} aria-label="Malaysia sustainable tourism index by state">
 <Geographies geography={geography}>{({geographies})=>geographies.map(geo=>{
 const name=geoState(geo), active=states.includes(name), result=active?resultsByState[name]:null, score=result?.status==='full'?result.value:null, description=tooltip(name,result,year,active);
 return <g key={geo.rsmKey}><Geography geography={geo} fill={colorForScore(score)} stroke={selectedState===name?'#142f29':'#fff'} strokeWidth={selectedState===name?2:0.7} tabIndex={active?0:-1} role={active?'button':undefined} aria-label={description.replaceAll('\n', '. ')} onClick={()=>active&&onSelect(name)} onKeyDown={e=>{if(active&&(e.key==='Enter'||e.key===' ')){e.preventDefault();onSelect(name);}}} style={{default:{outline:'none',opacity:active?1:.35},hover:{outline:'none',fill:active?'#9ab6a6':'#dce4e2',cursor:active?'pointer':'default'},pressed:{outline:'none'}}}><title>{description}</title></Geography>{score!=null&&<Marker coordinates={geoCentroid(geo)}><text textAnchor="middle" className="map-score" pointerEvents="none">{score.toFixed(0)}</text></Marker>}</g>;
 })}</Geographies></ComposableMap><div className="map-label west">PENINSULAR MALAYSIA</div><div className="map-label east">EAST MALAYSIA</div><div className="map-legend"><span>0</span><i/><span>100</span><span className="no-data-key"/> Full STI unavailable</div></div>;
}
