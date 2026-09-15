export const GEO_NAME_TO_DATASET_NAME = {
  'KualaLumpur':'W.P. Kuala Lumpur', 'NegeriSembilan':'Negeri Sembilan', 'PulauPinang':'Pulau Pinang', 'Trengganu':'Terengganu',
  'Johor': 'Johor', 'Kedah': 'Kedah', 'Kelantan': 'Kelantan', 'Melaka': 'Melaka',
  'Negeri Sembilan': 'Negeri Sembilan', 'Pahang': 'Pahang', 'Perak': 'Perak', 'Perlis': 'Perlis',
  'Pulau Pinang': 'Pulau Pinang', 'Penang': 'Pulau Pinang', 'Sabah': 'Sabah', 'Sarawak': 'Sarawak',
  'Selangor': 'Selangor', 'Terengganu': 'Terengganu', 'Kuala Lumpur': 'W.P. Kuala Lumpur',
  'Labuan': 'W.P. Labuan', 'Putrajaya': 'W.P. Putrajaya',
};
export function geoState(geo) {
  const name = ['name', 'NAME_1', 'VARNAME_1', 'state', 'State', 'NAME'].map(k => geo.properties?.[k]).find(Boolean);
  return GEO_NAME_TO_DATASET_NAME[name] ?? name;
}
