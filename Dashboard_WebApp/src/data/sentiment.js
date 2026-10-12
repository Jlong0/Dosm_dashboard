export const SENTIMENT_DIMENSIONS = ['economic', 'environmental', 'infrastructure', 'social'];

export function sentimentMetrics(rows = []) {
  return Object.fromEntries(rows.filter(row => row.metric && Number.isFinite(row.value)).map(row => [row.metric, row.value]));
}

export function quarterlySentiment(rows = []) {
  const valid = rows.filter(row => /^\d{4}Q[1-4]$/.test(row.year_quarter) && SENTIMENT_DIMENSIONS.includes(row.sustainability_dimension));
  return [...new Set(valid.map(row => row.year_quarter))].sort().map(period => {
    const point = { period };
    for (const row of valid.filter(item => item.year_quarter === period)) {
      point[row.sustainability_dimension] = Number.isFinite(row.net_sentiment) ? row.net_sentiment : null;
      point[`${row.sustainability_dimension}_n`] = Number.isFinite(row.n) ? row.n : null;
    }
    return point;
  });
}

export const stakeholderLabel = value => value?.replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase()) ?? 'N/A';

const STATE_TO_SENTIMENT_DESTINATION = {
  'W.P. Kuala Lumpur': 'Kuala Lumpur',
  'Pulau Pinang': 'Penang',
  'W.P. Putrajaya': 'Putrajaya',
  'Kedah': 'Langkawi',
};

export function destinationSentiment(rows = [], state) {
  const destination = rows.some(row => row.destination === state) ? state : STATE_TO_SENTIMENT_DESTINATION[state];
  return { destination: destination ?? null, rows: destination ? rows.filter(row => row.destination === destination) : [] };
}

export function topNegativeAspects(rows = [], limit = 5) {
  return rows.filter(row => row.low_sample_warning !== 'True' && Number.isFinite(row.negative_pct)).sort((a, b) => b.negative_pct - a.negative_pct).slice(0, limit);
}
