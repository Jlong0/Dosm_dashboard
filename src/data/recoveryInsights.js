export function getRecoveryInsights(details, recoveryRows, state) {
  const recovery = recoveryRows.find(row => row.State === state);
  const stability = details.find(row => row.State === state && Number.isFinite(row.STI_Stability_Score_0_100))?.STI_Stability_Score_0_100;
  return {
    quadrant: recovery?.Quadrant ?? null,
    deltaEconomic: Number.isFinite(recovery?.Delta_Economic) ? recovery.Delta_Economic : null,
    deltaEnvironmental: Number.isFinite(recovery?.Delta_Environmental) ? recovery.Delta_Environmental : null,
    stability: Number.isFinite(stability) ? stability : null,
  };
}
