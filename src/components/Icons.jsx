export function Icon({ name, size = 18 }) {
  const paths = {
    leaf: "M12 21V9m0 0C8 9 5 7 4 3c4 0 8 1 8 6m0 0c2-3 5-4 8-4 0 4-2 7-8 8",
    users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m17-11a4 4 0 1 0-4-4m6 15v-2a4 4 0 0 0-3-3.87M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    trend: "m3 17 6-6 4 4 8-9M14 6h7v7",
    wave: "M2 13c2.2 0 2.2-2 4.4-2s2.2 2 4.4 2 2.2-2 4.4-2 2.2 2 4.4 2 2.2-2 4.4-2M2 18c2.2 0 2.2-2 4.4-2s2.2 2 4.4 2 2.2-2 4.4-2 2.2 2 4.4 2 2.2-2 4.4-2",
    arrow: "m9 18 6-6-6-6",
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
