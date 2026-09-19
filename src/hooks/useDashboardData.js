import { useEffect, useState } from 'react';
import { parseCsv } from '../data/csv';
const FILES = ['state_year', 'sustainability_index', 'national_year', 'metadata', 'map_scores'];
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
      ['yoy_values', 'agg_states_yoy_values.csv', 'csv'],
      ['recovery', 'agg_states_recovery.csv', 'csv'],
      ['sentiment_overall', 'agg_sentiment_overall.csv', 'csv'],
      ['sentiment_dimensions', 'agg_sentiment_dimension.csv', 'csv'],
      ['sentiment_stakeholders', 'agg_sentiment_stakeholder.csv', 'csv'],
      ['sentiment_quarterly', 'agg_sentiment_quarterly.csv', 'csv'],
      ['sentiment_destination_dimensions', 'agg_sentiment_destination_dimension.csv', 'csv'],
      ['sentiment_aspects', 'agg_sentiment_aspect.csv', 'csv'],
      ['forecast_tasks', 'agg_forecast_national_dashboard.csv', 'csv'],
      ['forecast_state_visitors', 'agg_forecast_states_visitors_dashboard.csv', 'csv'],
      ['causal', 'agg_causal.json', 'json'],
      ['methodology', 'agg_methodology.json', 'json'],
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
