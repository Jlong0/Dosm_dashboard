export const CANONICAL_STATES = [
    'Johor',
    'Kedah',
    'Kelantan',
    'Melaka',
    'Negeri Sembilan',
    'Pahang',
    'Perak',
    'Perlis',
    'Pulau Pinang',
    'Sabah',
    'Sarawak',
    'Selangor',
    'Terengganu',
    'W.P. Kuala Lumpur',
    'W.P. Labuan',
    'W.P. Putrajaya',
  ];
  
  function stateKey(value) {
    return String(value ?? '')
      .trim()
      .toLowerCase()
      .replace(/\./g, '')
      .replace(/\s+/g, ' ');
  }
  
  const STATE_ALIASES = {
    johor: 'Johor',
    kedah: 'Kedah',
    kelantan: 'Kelantan',
    melaka: 'Melaka',
    malacca: 'Melaka',
  
    'negeri sembilan': 'Negeri Sembilan',
    negerisembilan: 'Negeri Sembilan',
    'n sembilan': 'Negeri Sembilan',
  
    pahang: 'Pahang',
    perak: 'Perak',
    perlis: 'Perlis',
  
    'pulau pinang': 'Pulau Pinang',
    pulaupinang: 'Pulau Pinang',
    penang: 'Pulau Pinang',
    'p pinang': 'Pulau Pinang',
  
    sabah: 'Sabah',
    sarawak: 'Sarawak',
    selangor: 'Selangor',
  
    terengganu: 'Terengganu',
    trengganu: 'Terengganu',
  
    'kuala lumpur': 'W.P. Kuala Lumpur',
    kualalumpur: 'W.P. Kuala Lumpur',
    'wp kuala lumpur': 'W.P. Kuala Lumpur',
  
    labuan: 'W.P. Labuan',
    'wp labuan': 'W.P. Labuan',
  
    putrajaya: 'W.P. Putrajaya',
    'wp putrajaya': 'W.P. Putrajaya',
  };
  
  export function canonicalState(value) {
    if (value == null || value === '') return null;
  
    if (value === 'All') {
      return 'All';
    }
  
    const trimmed = String(value).trim();
  
    return (
      STATE_ALIASES[stateKey(trimmed)] ??
      trimmed
    );
  }
  
  export function stateEquals(a, b) {
    const left = canonicalState(a);
    const right = canonicalState(b);
  
    return Boolean(
      left &&
      right &&
      left === right
    );
  }