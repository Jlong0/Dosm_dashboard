import OverviewSentiment from './OverviewSentiment';
import StateSentimentPanel from './StateSentimentPanel';
import { getPillarBreakdown } from '../data/stiAvailability';

export default function PublicSentimentPage({ data, selectedState, year }) {
  const pillars = getPillarBreakdown(data.sti_details, data.sti_fallbacks, selectedState, year);
  return <>
    <OverviewSentiment
      overall={data.sentiment_overall}
      dimensions={data.sentiment_dimensions}
      stakeholders={data.sentiment_stakeholders}
      quarterly={data.sentiment_quarterly}
    />
    <section className="panel public-sentiment-state">
      <div className="section-heading"><div><span className="eyebrow">DESTINATION CONTEXT</span><h2>{selectedState} perception profile</h2></div><span className="badge">Supporting signal</span></div>
      <p className="muted">Compare destination-level public perception with measured sustainability conditions. Sentiment remains separate from the STI and is not a representative survey.</p>
      <StateSentimentPanel
        state={selectedState}
        pillars={pillars}
        destinationRows={data.sentiment_destination_dimensions}
        aspects={data.sentiment_aspects}
        quarterly={data.sentiment_quarterly}
      />
    </section>
  </>;
}
