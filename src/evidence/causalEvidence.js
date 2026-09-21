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
  
  
  function rounded(value, digits = 4) {
    const parsed =
      numberOrNull(value);
  
    if (parsed === null) {
      return null;
    }
  
    return Number(
      parsed.toFixed(digits)
    );
  }
  
  
  function cleanStationCoverage(
    caveat = {}
  ) {
    return Object.entries(caveat)
      .map(([state, stations]) => ({
        state:
          canonicalState(state),
  
        averageStationCount:
          numberOrNull(stations)
      }))
      .sort(
        (a, b) =>
          (
            a.averageStationCount ??
            Infinity
          ) -
          (
            b.averageStationCount ??
            Infinity
          )
      );
  }
  
  
  export function buildCausalEvidence(
    causal
  ) {
    if (!causal) {
      return null;
    }
  
    const estimate =
      causal
        .tourism_receipts_lag1 ??
      {};
  
    const coefficient =
      numberOrNull(
        estimate.coefficient
      );
  
    const standardError =
      numberOrNull(
        estimate.se
      );
  
    const pValue =
      numberOrNull(
        estimate.p_value
      );
  
    const confidenceInterval =
      Array.isArray(
        estimate.ci_95
      )
        ? estimate.ci_95.map(
            value =>
              rounded(value, 4)
          )
        : [null, null];
  
    const [
      confidenceLower,
      confidenceUpper
    ] = confidenceInterval;
  
    const statisticallySignificant =
      pValue !== null &&
      pValue < 0.05;
  
    const confidenceIncludesZero =
      confidenceLower !== null &&
      confidenceUpper !== null &&
      confidenceLower <= 0 &&
      confidenceUpper >= 0;
  
    const years =
      causal.panel_years ?? [];
  
    return {
      analysis: {
        type:
          'Two-way fixed-effects observational panel',
  
        outcome:
          'Coastal stations rated Good or Excellent',
  
        exposure:
          'Lagged tourism receipts per resident'
      },
  
      panel: {
        observations:
          numberOrNull(
            causal.panel_n
          ),
  
        states:
          numberOrNull(
            causal.panel_states
          ),
  
        years,
  
        yearStart:
          years.length
            ? years[0]
            : null,
  
        yearEnd:
          years.length
            ? years[
                years.length - 1
              ]
            : null,
  
        rSquared:
          rounded(
            causal.r_squared,
            3
          ),
  
        fixedEffects:
          causal.fixed_effects ??
          []
      },
  
      estimate: {
        coefficient:
          rounded(
            coefficient,
            4
          ),
  
        robustStandardError:
          rounded(
            standardError,
            4
          ),
  
        pValue:
          rounded(
            pValue,
            3
          ),
  
        confidenceInterval95:
          confidenceInterval
      },
  
      inference: {
        significanceThreshold:
          0.05,
  
        statisticallySignificantAt05:
          statisticallySignificant,
  
        confidenceIntervalIncludesZero:
          confidenceIncludesZero,
  
        causalConclusionSupported:
          false
      },
  
      finding:
        causal.finding ??
        null,
  
      monitoringCoverage:
        cleanStationCoverage(
          causal
            .coastal_station_caveat
        ),
  
      provenance: {
        dataSource:
          causal.data_source ??
          null
      },
  
      interpretation: {
        allowed:
          [
            'Describe the coefficient as an estimated association.',
            'State whether the estimate is statistically distinguishable from zero.',
            'Report the confidence interval and uncertainty.',
            'Present tourism and water-quality evidence as complementary context.'
          ],
  
        notAllowed:
          [
            'Claim that tourism caused coastal water-quality changes.',
            'Treat a non-significant result as proof that no relationship exists.',
            'Use the estimate to predict station-level MQIMS changes.',
            'Treat the analysis as experimental evidence.'
          ]
      },
  
      limitations: [
        'The analysis is observational and does not establish causation.',
  
        'State and year fixed effects do not eliminate every possible time-varying confounder.',
  
        'The panel contains a limited number of annual observations and states, which limits statistical power.',
  
        'A non-significant estimate is not proof that no effect exists.',
  
        'Coastal-quality percentages may be more volatile where relatively few monitoring stations are available.',
  
        'The causal panel outcome is an aggregated coastal-quality measure and should not be treated as equivalent to an individual MQIMS station.'
      ]
    };
  }