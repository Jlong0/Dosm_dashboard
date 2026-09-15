import assert from 'node:assert/strict';
import fs from 'node:fs';
import { geoState } from '../src/data/geoNameMap.js';
const read=name=>JSON.parse(fs.readFileSync(`public/data/${name}.json`,'utf8'));
const state=read('state_year'), sti=read('sustainability_index'), national=read('national_year'), forecast=read('forecast');
assert.equal(state.length,176);assert.equal(sti.length,65);assert.equal(national.length,14);assert.equal(forecast.length,16);
for(const rows of [state,sti,national])assert.equal(new Set(rows.map(r=>`${r.state??'national'}:${r.year}`)).size,rows.length);
const names=new Set(state.map(r=>r.state));assert.equal(names.size,16);
for(const rows of [state,sti,national,forecast])for(const row of rows)for(const value of Object.values(row))if(typeof value==='number')assert(Number.isFinite(value));
for(const row of state.filter(r=>r.year===2025))assert.equal(row.coastalGoodExcellentPct,null);
for(const row of sti){assert(row.stiScore>=0&&row.stiScore<=100);assert.equal(typeof row.PC3_Standardized,'number');}
for(const r of forecast){
 for(const year of [2024,2025])assert(Math.abs(state.find(s=>s.state===r.state&&s.year===year).visitors000-r[`actual${year}`])<0.00001);
 assert(Math.abs((r.shrunkForecast2025/r.actual2025-1)*100-r.errorPct)<0.051);
}
for(const [state,score] of Object.entries(read('map_scores')))assert.equal(Math.round(sti.find(r=>r.year===2024&&r.state===state).stiScore),score);
const geo=JSON.parse(fs.readFileSync('public/data/malaysia-states.geojson'));
assert.equal(geo.features.length,16);assert.deepEqual(new Set(geo.features.map(geoState)),names);
assert.equal(read('causal_findings').length,3);
for(const file of fs.readdirSync('dashboard_data'))assert.equal(fs.readFileSync(`dashboard_data/${file}`,'utf8'),fs.readFileSync(`public/data/${file}`,'utf8'));
console.log('PASS: export counts, keys, nulls, forecast actuals/errors, PCA map scores, all 16 boundaries and static file hand-off.');
