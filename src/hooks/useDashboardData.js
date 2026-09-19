import { useEffect, useState } from 'react';
import { parseCsv } from '../data/csv';
const FILES = ['state_year', 'sustainability_index', 'national_year', 'forecast', 'causal_findings', 'metadata', 'map_scores'];
export function useDashboardData() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    const requests = [
      ...FILES.map(name => [name, `${name}.json`, 'json']),
      ['geography', 'malaysia-states.geojson', 'json'],
      ['sti_details', 'agg_states_detail.csv', 'csv'],
      ['sti_fallbacks', 'agg_states_fallback.csv', 'csv'],
      ['overview', 'agg_overview.json', 'json'],
    ];
    Promise.all(requests.map(async ([name, file, type]) => {
      const response = await fetch(`${import.meta.env.BASE_URL}data/${file}`, { signal: controller.signal });
      if (!response.ok) throw new Error(`Could not load ${file} (${response.status}).`);
      return [name, type === 'csv' ? parseCsv(await response.text()) : await response.json()];
    })).then(entries => setData(Object.fromEntries(entries))).catch(e => { if (e.name !== 'AbortError') setError(e); });
    return () => controller.abort();
  }, []);
  return { data, error, loading: !data && !error };
}
