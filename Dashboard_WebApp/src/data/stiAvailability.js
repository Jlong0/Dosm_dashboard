export const NO_COASTAL_STI_STATES = new Set(['Perlis', 'W.P. Kuala Lumpur', 'W.P. Putrajaya']);

export function getStiAvailability(details, fallbacks, state, year) {
  const full = details.find(row => row.State === state && row.Year === year && Number.isFinite(row.STI));
  if (full) return { status: 'full', value: full.STI, label: 'STI', message: null };

  const partial = fallbacks.find(row => row.State === state && row.Year === year && Number.isFinite(row.Economic_Social_0_100));
  return {
    status: partial ? 'fallback' : 'unavailable',
    value: partial?.Economic_Social_0_100 ?? null,
    label: partial ? 'Economic + Social' : null,
    message: NO_COASTAL_STI_STATES.has(state)
      ? 'Full STI unavailable — no coastal water-quality monitoring stations.'
      : 'Full STI: Not calculated for this year/state.',
  };
}

export function getStiSnapshot(details, fallbacks, states, year) {
  return states.map(state => ({ state, year, ...getStiAvailability(details, fallbacks, state, year) }));
}

export function getPillarBreakdown(details, fallbacks, state, year) {
  const availability = getStiAvailability(details, fallbacks, state, year);
  const row = details.find(item => item.State === state && item.Year === year);
  const value = key => Number.isFinite(row?.[key]) ? row[key] : null;
  return {
    ...availability,
    state,
    year,
    pillars: {
      economic: value('Economic_0_100'),
      social: value('Social_0_100'),
      environmental: value('Environmental_0_100'),
    },
  };
}
