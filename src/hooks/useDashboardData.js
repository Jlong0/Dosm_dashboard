import { useEffect, useState } from 'react';
const FILES = ['state_year', 'sustainability_index', 'national_year', 'forecast', 'causal_findings', 'metadata', 'map_scores'];
export function useDashboardData() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    const requests = [...FILES.map(name => [name, `${name}.json`]), ['geography', 'malaysia-states.geojson']];
    Promise.all(requests.map(async ([name, file]) => {
      const response = await fetch(`${import.meta.env.BASE_URL}data/${file}`, { signal: controller.signal });
      if (!response.ok) throw new Error(`Could not load ${file} (${response.status}).`);
      return [name, await response.json()];
    })).then(entries => setData(Object.fromEntries(entries))).catch(e => { if (e.name !== 'AbortError') setError(e); });
    return () => controller.abort();
  }, []);
  return { data, error, loading: !data && !error };
}
