export default function OverviewStory({ data, setTab }) {
  const goToTab = (nextTab) => {
    setTab(nextTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const steps = [
    ['01', 'Measure', 'Combine economic, social and environmental indicators into a state-level Sustainable Tourism Index.'],
    ['02', 'Detect', 'Use recovery trends, forecasts and public sentiment to identify where pressure or divergence may be emerging.'],
    ['03', 'Act', 'Move from state-level signals to MarineWatch station alerts that support targeted investigation and intervention.'],
  ];

  const findings = [
    {
      value: '2025 ≈ 2019',
      title: 'Price-driven rebound',
      body: 'Domestic trip volumes in 2025 are approximately back to 2019 levels, while nominal tourism receipts are 17.5% higher. Higher food and accommodation prices contributed substantially to the rise in spending per trip.',
      note: 'National domestic tourism · 2019 vs 2025',
      action: 'View trends →',
      onClick: () => scrollToSection('national-trends'),
    },
    {
      value: '75 / 368',
      title: 'Declining marine trend',
      body: 'Only 4 marine monitoring stations are currently classified as Poor, but 75 of 368 stations show a declining trend — highlighting local deterioration that aggregate state reporting can conceal.',
      note: 'Marine water-quality monitoring stations',
      action: 'Explore MarineWatch →',
      onClick: () => goToTab('MQIMS'),
    },
    {
      value: '3 / 13',
      title: 'Achieved balanced improvement',
      body: 'Only three comparable states improved across both the economic and environmental recovery dimensions, showing that post-pandemic tourism recovery remains uneven.',
      note: 'Recovery comparison · 2022–2024 average vs 2017–2019 average',
      breakdown: [
        ['3', 'Sustainable improvement'],
        ['2', 'Growth under environmental stress'],
        ['3', 'Overall deterioration'],
        ['5', 'Environmental recovery / tourism weakness'],
      ],
      action: 'Compare states →',
      onClick: () => goToTab('States'),
    },
    {
      value: '−11.1',
      title: 'Infrastructure friction',
      body: 'Among 4,755 sustainability-relevant YouTube comments, infrastructure recorded the only negative dimension-level net sentiment. Facilities, accessibility and public transport were among the prominent negative aspects.',
      note: 'Net sentiment · supporting perception signal',
      action: 'Explore sentiment →',
      onClick: () => scrollToSection('public-sentiment'),
    },
  ];

  return <>
    <section className="panel story-panel" aria-labelledby="how-it-works-title">
      <div className="section-heading">
        <div><span className="eyebrow">FROM DATA TO DECISION</span><h2 id="how-it-works-title">How the system works</h2></div>
      </div>
      <p className="muted story-intro">The dashboard is designed as a decision-support flow: measure sustainability conditions, detect emerging pressure, then move toward targeted action.</p>
      <div className="story-steps">{steps.map(([number,title,body], index) => <article className="story-step" key={title}>
        <div className="story-step-top"><span>{number}</span><strong>{title}</strong></div>
        <p>{body}</p>{index < steps.length - 1 && <i aria-hidden="true">→</i>}
      </article>)}</div>
    </section>

    <section className="panel findings-panel" aria-labelledby="key-findings-title">
      <div className="section-heading"><div><span className="eyebrow">WHAT THE DATA SAYS</span><h2 id="key-findings-title">Key findings</h2></div></div>
      <div className="key-findings-grid">{findings.map(item => <article className="key-finding" key={item.title}>
        <strong className="key-finding-value">{item.value}</strong><h3>{item.title}</h3><p>{item.body}</p>{item.breakdown && <div className="recovery-breakdown">{item.breakdown.map(([count, label]) => <div key={label}><b>{count}</b><span>{label}</span></div>)}</div>}<small>{item.note}</small><button type="button" className="finding-link" onClick={item.onClick}>{item.action}</button>
      </article>)}</div>
    </section>
  </>;
}
