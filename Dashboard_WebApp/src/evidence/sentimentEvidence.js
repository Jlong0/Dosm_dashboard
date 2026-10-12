import {
    destinationSentiment,
    quarterlySentiment,
    sentimentMetrics,
    topNegativeAspects
  } from '../data/sentiment';
  
  import {
    canonicalState
  } from '../data/stateNames';
  
  
  function numberOrNull(value) {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return null;
    }
  
    const parsed = Number(value);
  
    return Number.isFinite(parsed)
      ? parsed
      : null;
  }
  
  
  function rounded(value, digits = 1) {
    const parsed = numberOrNull(value);
  
    if (parsed === null) {
      return null;
    }
  
    return Number(
      parsed.toFixed(digits)
    );
  }
  
  
  function booleanFlag(value) {
    return (
      value === true ||
      value === 'True' ||
      value === 'true'
    );
  }
  
  
  function cleanDimension(row) {
    return {
      dimension:
        row.sustainability_dimension,
  
      sampleSize:
        numberOrNull(row.n),
  
      positivePct:
        rounded(row.positive_pct),
  
      neutralPct:
        rounded(row.neutral_pct),
  
      negativePct:
        rounded(row.negative_pct),
  
      netSentiment:
        rounded(row.net_sentiment),
  
      weightedNetSentiment:
        rounded(
          row.weighted_net_sentiment
        )
    };
  }
  
  
  function cleanDestinationDimension(row) {
    return {
      dimension:
        row.sustainability_dimension,
  
      sampleSize:
        numberOrNull(row.n),
  
      netSentiment:
        rounded(row.net_sentiment)
    };
  }
  
  
  function cleanStakeholder(row) {
    return {
      stakeholder:
        row.stakeholder,
  
      sampleSize:
        numberOrNull(row.n),
  
      positivePct:
        rounded(row.positive_pct),
  
      neutralPct:
        rounded(row.neutral_pct),
  
      negativePct:
        rounded(row.negative_pct),
  
      netSentiment:
        rounded(row.net_sentiment),
  
      lowSampleWarning:
        booleanFlag(
          row.low_sample_warning
        )
    };
  }
  
  
  function cleanAspect(row) {
    return {
      aspect:
        row.tourism_aspect,
  
      sampleSize:
        numberOrNull(row.n),
  
      positivePct:
        rounded(row.positive_pct),
  
      negativePct:
        rounded(row.negative_pct),
  
      netSentiment:
        rounded(row.net_sentiment),
  
      weightedNetSentiment:
        rounded(
          row.weighted_net_sentiment
        ),
  
      lowSampleWarning:
        booleanFlag(
          row.low_sample_warning
        )
    };
  }
  
  
  function getDestinationScope(
    state,
    destination
  ) {
    if (!destination) {
      return {
        type: 'unavailable',
        note:
          'No destination-level sentiment aggregate is available for this state.'
      };
    }
  
    const canonical =
      canonicalState(state);
  
    /*
     * These are naming equivalents rather than
     * geographic proxies.
     */
    const equivalentNames = {
      'W.P. Kuala Lumpur':
        'Kuala Lumpur',
  
      'W.P. Putrajaya':
        'Putrajaya',
  
      'Pulau Pinang':
        'Penang'
    };
  
    if (
      destination === canonical ||
      equivalentNames[canonical] ===
        destination
    ) {
      return {
        type: 'state_or_territory',
        note:
          'Destination sentiment corresponds to the selected state or federal territory.'
      };
    }
  
    /*
     * Important:
     * Langkawi is used by the existing dashboard
     * for Kedah, but it does NOT represent the
     * whole state.
     */
    if (
      canonical === 'Kedah' &&
      destination === 'Langkawi'
    ) {
      return {
        type: 'destination_proxy',
        note:
          'Langkawi destination sentiment is shown as contextual evidence for Kedah and should not be interpreted as state-wide sentiment.'
      };
    }
  
    return {
      type: 'destination',
      note:
        'The available sentiment aggregate represents a named tourism destination and may not represent the entire state.'
    };
  }
  
  
  function getQuarterlyCoverage(
    trend = []
  ) {
    if (!trend.length) {
      return {
        start: null,
        end: null
      };
    }
  
    return {
      start:
        trend[0].period,
  
      end:
        trend[
          trend.length - 1
        ].period
    };
  }
  
  
  function cleanQuarterlyTrend(
    trend = []
  ) {
    return trend.map(row => ({
      period:
        row.period,
  
      dimensions: {
        economic: {
          netSentiment:
            rounded(row.economic),
  
          sampleSize:
            numberOrNull(
              row.economic_n
            )
        },
  
        environmental: {
          netSentiment:
            rounded(
              row.environmental
            ),
  
          sampleSize:
            numberOrNull(
              row.environmental_n
            )
        },
  
        infrastructure: {
          netSentiment:
            rounded(
              row.infrastructure
            ),
  
          sampleSize:
            numberOrNull(
              row.infrastructure_n
            )
        },
  
        social: {
          netSentiment:
            rounded(row.social),
  
          sampleSize:
            numberOrNull(
              row.social_n
            )
        }
      }
    }));
  }
  
  
  /*
   * Build one deterministic sentiment evidence
   * package.
   *
   * Sentiment is intentionally kept separate from
   * measured STI / MQIMS evidence.
   */
  export function buildSentimentEvidence({
    overall = [],
    dimensions = [],
    stakeholders = [],
    quarterly = [],
    destinationDimensions = [],
    aspects = [],
    state = null
  } = {}) {
  
    const overallMetrics =
      sentimentMetrics(overall);
  
    const trend =
      quarterlySentiment(
        quarterly
      );
  
    const coverage =
      getQuarterlyCoverage(trend);
  
    const destinationResult =
      state
        ? destinationSentiment(
            destinationDimensions,
            canonicalState(state)
          )
        : {
            destination: null,
            rows: []
          };
  
    const destinationScope =
      state
        ? getDestinationScope(
            state,
            destinationResult.destination
          )
        : {
            type: 'not_requested',
            note:
              'No state was selected.'
          };
  
    const negativeAspects =
      topNegativeAspects(
        aspects,
        5
      );
  
    return {
      context: {
        state:
          state
            ? canonicalState(state)
            : null,
  
        selectedYearApplied:
          false
      },
  
      nationalOverall: {
        analyzedComments:
          numberOrNull(
            overallMetrics
              .analyzed_comments
          ),
  
        positivePct:
          rounded(
            overallMetrics
              .positive_pct
          ),
  
        neutralPct:
          rounded(
            overallMetrics
              .neutral_pct
          ),
  
        negativePct:
          rounded(
            overallMetrics
              .negative_pct
          ),
  
        netSentiment:
          rounded(
            overallMetrics
              .net_sentiment
          ),
  
        weightedNetSentiment:
          rounded(
            overallMetrics
              .weighted_net_sentiment
          )
      },
  
      nationalDimensions:
        dimensions.map(
          cleanDimension
        ),
  
      stakeholders:
        stakeholders.map(
          cleanStakeholder
        ),
  
      quarterlyTrend: {
        coverageStart:
          coverage.start,
  
        coverageEnd:
          coverage.end,
  
        rows:
          cleanQuarterlyTrend(
            trend
          )
      },
  
      destination: {
        available:
          destinationResult.rows.length >
          0,
  
        destinationUsed:
          destinationResult.destination,
  
        scopeType:
          destinationScope.type,
  
        scopeNote:
          destinationScope.note,
  
        dimensions:
          destinationResult.rows.map(
            cleanDestinationDimension
          )
      },
  
      topNegativeAspects:
        negativeAspects.map(
          cleanAspect
        ),
  
      limitations: [
        'Sentiment reflects analyzed social-media comments and is not a representative survey of all visitors or residents.',
  
        'Sentiment is a perception signal and is separate from measured sustainability indicators and the STI.',
  
        'Sentiment aggregates are pooled and are not filtered by the currently selected STI year.',
  
        'Quarterly sentiment is based on dated comments only and is not state-specific in the current export.',
  
        'National tourism-aspect rankings do not contain a destination field and therefore must not be presented as state-specific issues.',
  
        destinationScope.type ===
        'destination_proxy'
          ? destinationScope.note
          : null,
  
        'Differences or similarities between sentiment and measured indicators describe parallel signals and do not establish causation.'
      ].filter(Boolean)
    };
  }