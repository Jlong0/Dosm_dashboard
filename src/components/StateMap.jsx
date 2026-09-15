import bordersText from "../../malaysia.geojson?raw";
import { stateLabels } from "../data/stateLabels";

const borders = JSON.parse(bordersText);

const scoreColour = (score) => {
  if (score == null) return "#d8e3e5";
  const t = Math.max(0, Math.min(1, (score - 45) / 40));
  const r = Math.round(222 - 196 * t); const g = Math.round(142 - 24 * t); const b = Math.round(72 + 48 * t);
  return `rgb(${r}, ${g}, ${b})`;
};
const linePath = (coords, box) => coords.map(([lon, lat], i) => {
  const x = 12 + (lon - box.minLon) / (box.maxLon - box.minLon) * 276;
  const y = 12 + (box.maxLat - lat) / (box.maxLat - box.minLat) * 176;
  return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
}).join(" ");
const peninsula = { minLon: 99.8, maxLon: 104.1, minLat: 1.1, maxLat: 7.15 };
const borneo = { minLon: 109.5, maxLon: 119.1, minLat: .7, maxLat: 7.5 };

function BoundaryPane({ eastern, scores, selectedState, onSelect }) {
  const box = eastern ? borneo : peninsula;
  const lines = borders.features.filter((feature) => eastern ? /^(sbh|srw|lbn)/.test(feature.properties.name) : !/^(sbh|srw|lbn)/.test(feature.properties.name));
  const labelEntries = Object.entries(stateLabels).filter(([, [lon]]) => eastern ? lon > 109 : lon < 109);
  const point = ([lon, lat]) => [12 + (lon - box.minLon) / (box.maxLon - box.minLon) * 276, 12 + (box.maxLat - lat) / (box.maxLat - box.minLat) * 176];
  return <svg viewBox="0 0 300 200" className="map-pane" aria-label={eastern ? "East Malaysia state boundaries" : "Peninsular Malaysia state boundaries"}>
    <rect x="0" y="0" width="300" height="200" rx="12" fill="#dff2f3" />
    {lines.map((feature) => <path key={feature.properties.name} d={linePath(feature.geometry.coordinates, box)} className="boundary-line" />)}
    {labelEntries.map(([state, coords]) => { const [x, y] = point(coords); const score = scores[state]; const active = selectedState === state; return <g key={state} className="map-marker" onClick={() => onSelect(state)} transform={`translate(${x},${y})`}><title>{`${state}: ${score == null ? "Not monitored" : `STI ${score}`}`}</title><circle r={active ? 12 : 10} fill={scoreColour(score)} stroke={active ? "#073b4c" : "#fff"} strokeWidth={active ? 3 : 1.5} /><text y="3" textAnchor="middle">{score == null ? "–" : score}</text></g>; })}
  </svg>;
}

export default function StateMap({ scores, selectedState, onSelect }) {
  return <div className="map-wrap"><BoundaryPane scores={scores} selectedState={selectedState} onSelect={onSelect} /><BoundaryPane eastern scores={scores} selectedState={selectedState} onSelect={onSelect} /><div className="map-key"><span>STI score</span><i style={{ background: "#de8e48" }} />45 <i style={{ background: "#0a766d" }} />85 <em>– not monitored</em></div></div>;
}
