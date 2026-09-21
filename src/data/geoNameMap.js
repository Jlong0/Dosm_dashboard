import { canonicalState } from './stateNames';

export function geoState(geo) {
  const name = [
    'name',
    'NAME_1',
    'VARNAME_1',
    'state',
    'State',
    'NAME',
  ]
    .map(key => geo.properties?.[key])
    .find(Boolean);

  return canonicalState(name) ?? name;
}