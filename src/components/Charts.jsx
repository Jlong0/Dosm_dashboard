import { useId, useState } from "react";

const COLORS = ["#0a6f69", "#f6a63a", "#6c63c9", "#ef6c5b"];
const paddedDomain = (values) => {
  const min = Math.min(...values); const max = Math.max(...values); const pad = Math.max((max - min) * 0.12, 1);
  return [min - pad, max + pad];
};

export function LineChart({ data, lines, height = 264, formatter = (v) => v.toLocaleString() }) {
  const id = useId(); const [hover, setHover] = useState(null);
  const width = 720, pad = { top: 18, right: 18, bottom: 32, left: 48 };
  const innerW = width - pad.left - pad.right, innerH = height - pad.top - pad.bottom;
  const values = data.flatMap((row) => lines.map((line) => row[line.key]).filter(Number.isFinite));
  const [min, max] = paddedDomain(values.length ? values : [0, 1]);
  const x = (index) => pad.left + (data.length < 2 ? innerW / 2 : index * innerW / (data.length - 1));
  const y = (value) => pad.top + innerH - ((value - min) / (max - min)) * innerH;
  const path = (key) => data.map((row, index) => Number.isFinite(row[key]) ? `${index ? "L" : "M"}${x(index)},${y(row[key])}` : "").join(" ");
  return <div className="chart-shell"><svg className="chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Trend chart">
    <defs>{lines.map((line, i) => <linearGradient key={line.key} id={`${id}-${i}`} x1="0" x2="0" y1="0" y2="1"><stop stopColor={line.color || COLORS[i]} stopOpacity=".16" /><stop offset="1" stopColor={line.color || COLORS[i]} stopOpacity="0" /></linearGradient>)}</defs>
    {[0, .25, .5, .75, 1].map((ratio) => <g key={ratio}><line x1={pad.left} x2={width - pad.right} y1={pad.top + innerH * ratio} y2={pad.top + innerH * ratio} className="grid-line" /><text x={pad.left - 8} y={pad.top + innerH * ratio + 4} textAnchor="end" className="axis-label">{formatter(max - (max - min) * ratio)}</text></g>)}
    {lines.map((line, index) => <path key={line.key} d={path(line.key)} fill="none" stroke={line.color || COLORS[index]} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />)}
    {data.map((row, index) => <g key={row.year ?? index} onMouseEnter={() => setHover(index)} onMouseLeave={() => setHover(null)}>
      <rect x={x(index) - innerW / Math.max(data.length - 1, 1) / 2} y={pad.top} width={innerW / Math.max(data.length - 1, 1)} height={innerH} fill="transparent" />
      <text x={x(index)} y={height - 10} textAnchor="middle" className="axis-label">{row.year}</text>
      {lines.map((line, lineIndex) => Number.isFinite(row[line.key]) && <circle key={line.key} cx={x(index)} cy={y(row[line.key])} r="4" fill={line.color || COLORS[lineIndex]} />)}
    </g>)}
    {hover != null && <g className="chart-tooltip" transform={`translate(${Math.min(x(hover) + 8, width - 142)},${pad.top + 8})`}><rect width="134" height={28 + lines.length * 20} rx="7" /> <text x="9" y="19">{data[hover].year}</text>{lines.map((line, i) => <text key={line.key} x="9" y={39 + i * 20} fill={line.color || COLORS[i]}>{line.label}: {formatter(data[hover][line.key])}</text>)}</g>}
  </svg><div className="legend">{lines.map((line, i) => <span key={line.key}><i style={{ background: line.color || COLORS[i] }} />{line.label}</span>)}</div></div>;
}

export function BarChart({ data, keys, height = 300, onSelect, selected }) {
  const [hover, setHover] = useState(null); const width = 760, pad = { top: 18, right: 10, bottom: 75, left: 46 };
  const innerW = width - pad.left - pad.right, innerH = height - pad.top - pad.bottom;
  const max = Math.max(...data.flatMap((row) => keys.map((k) => row[k.key] || 0)), 1) * 1.1;
  const groupW = innerW / data.length; const gap = Math.max(2, groupW * .08); const barW = Math.max(2, (groupW - gap * 2) / keys.length);
  return <div className="chart-shell"><svg className="chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Bar chart">
    {[0, .25, .5, .75, 1].map((ratio) => <g key={ratio}><line x1={pad.left} x2={width - pad.right} y1={pad.top + innerH * ratio} y2={pad.top + innerH * ratio} className="grid-line" /><text x={pad.left - 7} y={pad.top + innerH * ratio + 4} textAnchor="end" className="axis-label">{Math.round(max * (1 - ratio)).toLocaleString()}</text></g>)}
    {data.map((row, index) => <g key={row.state} className={onSelect ? "clickable-group" : ""} onClick={() => onSelect?.(row.state)} onMouseEnter={() => setHover(index)} onMouseLeave={() => setHover(null)}>
      {keys.map((key, k) => { const value = row[key.key] || 0; const h = value / max * innerH; return <rect key={key.key} x={pad.left + index * groupW + gap + k * barW} y={pad.top + innerH - h} width={barW - 1} height={h} rx="2" fill={key.color || COLORS[k]} opacity={selected && selected !== row.state ? .38 : 1} />; })}
      <text x={pad.left + index * groupW + groupW / 2} y={height - 12} textAnchor="end" transform={`rotate(-46 ${pad.left + index * groupW + groupW / 2} ${height - 12})`} className="axis-label">{row.state.replace("W.P. ", "")}</text>
    </g>)}
    {hover != null && <g className="chart-tooltip" transform={`translate(${Math.min(pad.left + hover * groupW, width - 152)},${pad.top + 4})`}><rect width="144" height={26 + keys.length * 18} rx="7" /><text x="8" y="18">{data[hover].state}</text>{keys.map((key, i) => <text key={key.key} x="8" y={38 + i * 18} fill={key.color || COLORS[i]}>{key.label}: {Math.round(data[hover][key.key] || 0).toLocaleString()}</text>)}</g>}
  </svg><div className="legend">{keys.map((key, i) => <span key={key.key}><i style={{ background: key.color || COLORS[i] }} />{key.label}</span>)}</div></div>;
}
