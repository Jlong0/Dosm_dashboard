import {
    getPillarBreakdown
  } from '../data/stiAvailability';
  
  import {
    getYoyReport
  } from '../data/yoyReport';
  
  import {
    getRecoveryInsights
  } from '../data/recoveryInsights';
  
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
  
  
  function summarizeYoy(rows = []) {
    const counts = {
      favourable: 0,
      concern: 0,
      stable: 0,
      diagnostic: 0,
      unavailable: 0
    };
  
    rows.forEach(row => {
      const key =
        String(row.status ?? '')
          .toLowerCase();
  
      if (
        Object.prototype.hasOwnProperty.call(
          counts,
          key
        )
      ) {
        counts[key] += 1;
      }
    });
  
    return counts;
  }
  
  
  function cleanYoyRow(row) {
    return {
      indicator:
        row.indicator,
  
      unit:
        row.unit ?? null,
  
      currentValue:
        rounded(row.currentValue, 2),
  
      previousValue:
        rounded(row.previousValue, 2),
  
      change:
        rounded(row.change, 2),
  
      direction:
        row.direction,
  
      interpretation:
        row.status,
  
      partOfSti:
        Boolean(row.partOfSti)
    };
  }
  
  
  function getStateIndicatorHistory(
    stateYearRows = [],
    state
  ) {
    return stateYearRows
      .filter(
        row =>
          canonicalState(row.state) ===
          state
      )
      .sort(
        (a, b) =>
          Number(a.year) -
          Number(b.year)
      )
      .map(row => ({
        year:
          Number(row.year),
  
        tourism: {
          visitors000:
            rounded(
              row.visitors000,
              1
            ),
  
          visitorsPerResident:
            rounded(
              row.visitorsPerResident,
              2
            ),
  
          receiptsPerResidentRm:
            rounded(
              row.receiptsPerResidentRm,
              1
            ),
  
          averageStayNights:
            rounded(
              row.avgStayNights,
              1
            )
        },
  
        environmental: {
          coastalGoodExcellentPct:
            rounded(
              row.coastalGoodExcellentPct,
              1
            ),
  
          coastalPoorPct:
            rounded(
              row.coastalPoorPct,
              1
            ),
  
          mangroveHa:
            rounded(
              row.mangroveHa,
              1
            ),
  
          wasteTonnesPerDay:
            rounded(
              row.wasteTonnesPerDay,
              1
            )
        },
  
        socioeconomic: {
          unemploymentPct:
            rounded(
              row.unemploymentPct,
              1
            ),
  
          labourForceParticipationPct:
            rounded(
              row.lfprPct,
              1
            )
        }
      }));
  }
  
  
  /*
   * Sustainability evidence for one state/year.
   */
  export function buildSustainabilityEvidence({
    details = [],
    fallbacks = [],
    yoyValues = [],
    recoveryRows = [],
    stateYearRows = [],
    state,
    year
  } = {}) {
  
    if (!state || !year) {
      return null;
    }
  
    const canonical =
      canonicalState(state);
  
    const numericYear =
      Number(year);
  
    const pillars =
      getPillarBreakdown(
        details,
        fallbacks,
        canonical,
        numericYear
      );
  
    const yoy =
      getYoyReport(
        yoyValues,
        canonical,
        numericYear
      );
  
    const recovery =
      getRecoveryInsights(
        details,
        recoveryRows,
        canonical
      );
  
    const history =
      getStateIndicatorHistory(
        stateYearRows,
        canonical
      );
  
    const currentIndicators =
      history.find(
        row =>
          row.year === numericYear
      ) ?? null;
  
    const cleanedYoy =
      yoy.map(cleanYoyRow);
  
    const stiIndicators =
      cleanedYoy.filter(
        row => row.partOfSti
      );
  
    const diagnostics =
      cleanedYoy.filter(
        row => !row.partOfSti
      );
  
    return {
      context: {
        state: canonical,
        year: numericYear
      },
  
      sustainabilityIndex: {
        status:
          pillars.status,
  
        scoreLabel:
          pillars.label,
  
        score:
          rounded(
            pillars.value,
            1
          ),
  
        fullStiAvailable:
          pillars.status === 'full',
  
        message:
          pillars.message ?? null,
  
        pillars: {
          economic:
            rounded(
              pillars.pillars?.economic,
              1
            ),
  
          social:
            rounded(
              pillars.pillars?.social,
              1
            ),
  
          environmental:
            rounded(
              pillars.pillars?.environmental,
              1
            )
        }
      },
  
      yearOverYear: {
        comparisonYear:
          numericYear - 1,
  
        comparisonAvailable:
          cleanedYoy.some(
            row =>
              row.change !== null
          ),
  
        summary:
          summarizeYoy(
            cleanedYoy
          ),
  
        stiIndicators,
  
        diagnostics,
  
        concerns:
          cleanedYoy.filter(
            row =>
              row.interpretation ===
              'Concern'
          ),
  
        favourable:
          cleanedYoy.filter(
            row =>
              row.interpretation ===
              'Favourable'
          )
      },
  
      recovery: {
        quadrant:
          recovery.quadrant ??
          null,
  
        deltaEconomic:
          rounded(
            recovery.deltaEconomic,
            1
          ),
  
        deltaEnvironmental:
          rounded(
            recovery.deltaEnvironmental,
            1
          ),
  
        periodMeaning:
          'Difference between the 2022–2024 average and the 2017–2019 average.'
      },
  
      stability: {
        score:
          rounded(
            recovery.stability,
            1
          ),
  
        meaning:
          'Higher values indicate less state rank movement when one STI indicator is removed.'
      },
  
      currentIndicators,
  
      history,
  
      limitations: [
        pillars.status === 'fallback'
          ? 'A full STI is unavailable for this state and year. The displayed score contains only the available Economic and Social components.'
          : null,
  
        pillars.status === 'unavailable'
          ? 'A sustainability index score is unavailable for this state and year.'
          : null,
  
        'Year-over-year status describes indicator movement and its configured direction of desirability; it does not establish why the indicator changed.',
  
        'Recovery measures compare period averages and should not be interpreted as a causal effect.',
  
        'STI stability is a leave-one-indicator-out sensitivity measure and does not represent forecast certainty.'
      ].filter(Boolean)
    };
  }