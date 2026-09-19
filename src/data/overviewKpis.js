export function getOverviewKpis(details = [], overview = {}) {
  const valid = details.filter(row => Number.isFinite(row.STI) && Number.isFinite(row.Year));
  const latestYear = valid.length ? Math.max(...valid.map(row => row.Year)) : null;
  const latest = valid.filter(row => row.Year === latestYear);
  const averageSti = latest.length ? latest.reduce((sum, row) => sum + row.STI, 0) / latest.length : null;
  const finite = value => Number.isFinite(value) ? value : null;
  return {
    latestYear,
    averageSti,
    covered: new Set(latest.map(row => row.State)).size,
    total: Number.isFinite(overview.states_full_sti_coverage?.total) ? overview.states_full_sti_coverage.total : 16,
    deltaEconomic: finite(overview.delta_economic_national_avg),
    deltaEnvironmental: finite(overview.delta_environmental_national_avg),
  };
}
