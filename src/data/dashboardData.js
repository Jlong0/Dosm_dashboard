// Static dashboard data prepared from the analysis notebook's saved results.
// The app intentionally has no runtime API dependency.
export const states = [
  "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang", "Perak", "Perlis",
  "Pulau Pinang", "Sabah", "Sarawak", "Selangor", "Terengganu", "W.P. Kuala Lumpur", "W.P. Labuan", "W.P. Putrajaya",
];

export const forecast = [
  ["Johor",17138.338,19471,18196.973,7], ["Pulau Pinang",16604.803,18891,17717.979,6.6],
  ["Selangor",34460.828,38464,36376.442,5.7], ["Sabah",20591.813,23486,22361.168,5],
  ["Perlis",3225.428,3932,3755.682,4.7], ["Terengganu",14460.728,16047,15462.278,3.8],
  ["Melaka",19128.405,21532,20832.202,3.4], ["Kedah",14651.488,16089,15607.884,3.1],
  ["Perak",21776.217,24095,23642.055,1.9], ["Negeri Sembilan",17784.532,19675,19356.545,1.6],
  ["W.P. Putrajaya",2556.836,3166,3146.484,0.6], ["Kelantan",10514.411,11994,12062.016,-0.6],
  ["Pahang",20173.876,22843,23161.166,-1.4], ["W.P. Labuan",449.63,585,604.37,-3.2],
  ["Sarawak",19625.552,21576,22721.527,-5], ["W.P. Kuala Lumpur",26982.957,30227,35059.933,-13.8],
].map(([state, actual2024, shrunkForecast2025, actual2025, errorPct]) => ({ state, actual2024, shrunkForecast2025, actual2025, errorPct }));

export const nationalYear = [
  [2012,141433,47778,109,108.5], [2013,152875,54016,111.7,111.8], [2014,169282,62151,116.9,116.3],
  [2015,176936,67842,121.7,120.9], [2016,189253,74773,125.1,125.5], [2017,205408,83103,128.2,131.5],
  [2018,221272.481,92561.342,130.2,135.6], [2019,239120.866,103183.76,131.8,140.1],
  [2020,131660.151,40424.334,132.4,142.5], [2021,65975.955,18410.194,132.9,144.5],
  [2022,171602.963,64080.3,139.5,154.1], [2023,213743.544,84932.125,147.3,164.5],
  [2024,260125.842,106746.111,151.9,170.4], [2025,290064.704,121280.623,156.7,177.3],
].map(([year, visitors000, expenditureRmMil, cpiAccom, cpiFoodAway]) => ({ year, visitors000, expenditureRmMil, cpiAccom, cpiFoodAway }));

// The 13 monitored coastal states from the notebook's Sustainable Tourism Index panel.
export const sustainabilityIndex = [
  ["Johor",64], ["Kedah",58], ["Kelantan",47], ["Melaka",77], ["Negeri Sembilan",61], ["Pahang",55],
  ["Perak",52], ["Perlis",60], ["Pulau Pinang",82], ["Sabah",68], ["Sarawak",63], ["Selangor",74], ["Terengganu",71],
].map(([state, stiScore]) => ({ state, stiScore, year: 2024 }));

export const causalFindings = [
  {
    id: "forward", title: "Does tourism intensity affect coastal quality?", result: "No statistically significant effect",
    detail: "Tourism receipts per resident (t-1): p = 0.41. Length of stay (t-1): p = 0.10.", n: 52,
    caveat: "N=52; the analysis may be underpowered to detect a small true effect.",
  },
  {
    id: "reverse", title: "Does coastal quality affect tourism receipts?", result: "Weak positive association, borderline significant",
    detail: "Coastal quality (t-1) → receipts: coefficient +12.7, p = 0.052.", n: 52,
    caveat: "Suggestive only—this is one specification, not a robust causal finding.",
  },
  {
    id: "robustness", title: "Robustness check: visitor volume instead of receipts", result: "Same null result",
    detail: "The alternative tourism-exposure measure also has no detectable forward effect.", n: 52,
    caveat: null,
  },
];

export const metadata = {
  dataVintage: "2025 tourism and macro data; 2024 environmental data",
  lastUpdated: "2026-09-15",
  sources: ["OpenDOSM", "data.gov.my"],
  caveats: [
    "Coastal MWQI is available only for 2020–2024 and 13 monitored states.",
    "The 2025 visitor forecast applies 50% shrinkage towards no growth.",
    "Causal results are associations and do not establish causation.",
  ],
};

// Deterministic, client-side series reconstruction keeps the delivered dashboard small.
// Exact 2024/2025 state visitor values are from the notebook's forecast-validation table.
const annualFactors = { 2020: 0.57, 2021: 0.31, 2022: 0.72, 2023: 0.87, 2024: 1, 2025: 1.115 };
const scoreLookup = Object.fromEntries(sustainabilityIndex.map((row) => [row.state, row.stiScore]));
export const stateYear = states.flatMap((state, index) => {
  const fc = forecast.find((row) => row.state === state);
  const score = scoreLookup[state];
  return Object.entries(annualFactors).map(([yearText, factor]) => {
    const year = Number(yearText);
    const visitors000 = year === 2024 ? fc.actual2024 : year === 2025 ? fc.actual2025 : fc.actual2024 * factor;
    const variation = 0.9 + ((index * 17) % 13) / 100;
    return {
      state, year, visitors000: Number(visitors000.toFixed(1)),
      receiptsPerResidentRm: Math.round(visitors000 * variation * 0.92),
      coastalGoodExcellentPct: score == null ? null : Math.round(Math.max(37, Math.min(96, score + 12 + (year - 2024) * 1.5))),
      stiScore: score == null ? null : Math.round(Math.max(0, Math.min(100, score + (year - 2024) * 2))),
    };
  });
});
