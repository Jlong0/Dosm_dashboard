const ORDER = [
  'Tourism Receipts per Resident (RM)', 'Avg Length of Stay (nights)',
  'Labour Force Participation Rate (%)', 'Unemployment Rate (%)',
  'Non-Domestic Water Share (%)', 'Coastal Good+Excellent (%)',
  'Coastal Poor (%)', 'Municipal Waste Facility Tonnes/Day',
  'Mangrove Area (ha)', 'Visitors per Resident',
];

const asBool = value => value === true || value === 'True';

export function getYoyReport(values, state, year) {
  const stateRows = values.filter(row => row.State === state);
  return ORDER.map(indicator => {
    const current = stateRows.find(row => row.Year === year && row.indicator === indicator);
    const previous = stateRows.find(row => row.Year === year - 1 && row.indicator === indicator);
    const currentValue = Number.isFinite(current?.value) ? current.value : null;
    const previousValue = Number.isFinite(previous?.value) ? previous.value : null;
    const change = currentValue != null && previousValue != null ? currentValue - previousValue : null;
    const partOfSti = asBool(current?.part_of_sti ?? previous?.part_of_sti);
    let status = 'Unavailable';
    if (change != null && Math.abs(change) <= 1e-9) status = 'Stable';
    else if (change != null && !partOfSti) status = 'Diagnostic';
    else if (change != null) status = (change > 0) === asBool(current?.higher_is_better) ? 'Favourable' : 'Concern';
    return { indicator, unit: current?.unit ?? previous?.unit, currentValue, previousValue, change, direction: change == null || Math.abs(change) <= 1e-9 ? 'flat' : change > 0 ? 'up' : 'down', status, partOfSti };
  });
}

export function formatIndicatorValue(value, unit) {
  if (!Number.isFinite(value)) return 'N/A';
  if (unit === 'RM') return `RM ${value.toLocaleString('en-MY', { maximumFractionDigits: 1 })}`;
  if (unit === '%') return `${value.toFixed(1)}%`;
  if (unit === 'nights') return `${value.toFixed(1)} nights`;
  if (unit === 'ha') return `${value.toLocaleString('en-MY', { maximumFractionDigits: 1 })} ha`;
  if (unit === 'tonnes/day') return `${value.toLocaleString('en-MY', { maximumFractionDigits: 1 })} t/day`;
  return value.toFixed(1);
}

export function formatIndicatorChange(value, unit) {
  if (!Number.isFinite(value)) return 'YoY: N/A';
  const number = `${value > 0 ? '+' : ''}${value.toLocaleString('en-MY', { maximumFractionDigits: 1 })}`;
  return `${number}${unit === '%' ? ' pp' : unit === 'RM' ? ' RM' : unit === 'nights' ? ' nights' : unit === 'ha' ? ' ha' : unit === 'tonnes/day' ? ' t/day' : ''}`;
}
