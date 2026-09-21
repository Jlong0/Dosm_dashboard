import {
    buildMqimsEvidence
  } from './mqimsEvidence';
  
  import {
    buildSustainabilityEvidence
  } from './sustainabilityEvidence';
  
  import {
    buildSentimentEvidence
  } from './sentimentEvidence';
  
  import {
    buildForecastEvidence
  } from './forecastEvidence';
  
  import {
    buildCausalEvidence
  } from './causalEvidence';
  
  import {
    canonicalState
  } from '../data/stateNames';
  
  
  function uniqueStrings(values = []) {
    return [
      ...new Set(
        values
          .filter(Boolean)
          .map(value =>
            String(value).trim()
          )
          .filter(Boolean)
      )
    ];
  }
  
  
  function normalizeState(state) {
    if (
      !state ||
      state === 'All'
    ) {
      return null;
    }
  
    return canonicalState(state);
  }
  
  
  function resolveYear(
    requestedYear,
    dashboardData
  ) {
    /*
     * null, undefined and "" mean:
     * no year was explicitly selected.
     */
    const hasExplicitYear =
      requestedYear !== null &&
      requestedYear !== undefined &&
      requestedYear !== '';
  
    if (hasExplicitYear) {
      const numeric =
        Number(requestedYear);
  
      /*
       * Guard against invalid values such
       * as 0, NaN, etc.
       */
      if (
        Number.isFinite(numeric) &&
        numeric >= 2000
      ) {
        return {
          year: numeric,
          source: 'selected'
        };
      }
    }
  
    /*
     * No valid explicit year:
     * fall back to the latest year covered
     * by the full STI methodology.
     */
    const years =
      dashboardData
        ?.methodology
        ?.index_method
        ?.panel_years ??
      [];
  
    const validYears =
      years
        .map(Number)
        .filter(
          value =>
            Number.isFinite(value) &&
            value >= 2000
        );
  
    if (!validYears.length) {
      return {
        year: null,
        source: 'unavailable'
      };
    }
  
    return {
      year:
        Math.max(...validYears),
  
      source:
        'latest_full_sti'
    };
  }
  
  
  function buildMethodologyEvidence(
    dashboardData = {}
  ) {
    const methodology =
      dashboardData.methodology ?? {};
  
    const metadata =
      dashboardData.metadata ?? {};
  
    const indexMethod =
      methodology.index_method ?? {};
  
    const forecastMethod =
      methodology.forecast_method ?? {};
  
    return {
      available:
        Boolean(
          dashboardData.methodology ||
          dashboardData.metadata
        ),
  
      dataVintage:
        metadata.dataVintage ??
        null,
  
      lastUpdated:
        metadata.lastUpdated ??
        null,
  
      notebookVersion:
        metadata.notebookVersion ??
        null,
  
      sustainabilityIndex: {
        weighting:
          indexMethod.weighting ??
          null,
  
        panelYears:
          indexMethod.panel_years ??
          [],
  
        excludedStates:
          (
            indexMethod.excluded_states ??
            []
          ).map(
            state =>
              canonicalState(state)
          ),
  
        excludedReason:
          indexMethod.excluded_reason ??
          null,
  
        indicators:
          indexMethod.indicators ??
          {}
      },
  
      forecast: {
        rule:
          forecastMethod.rule ??
          null,
  
        outcome:
          forecastMethod.outcome ??
          null
      },
  
      provenance: {
        ...metadata.provenance,
        ...methodology.provenance
      },
  
      limitations:
        uniqueStrings([
          ...(metadata.caveats ?? []),
          ...(methodology.limitations ?? [])
        ])
    };
  }
  
  
  function unavailable(reason) {
    return {
      available: false,
      reason
    };
  }
  
  
  function available(evidence) {
    return {
      available: true,
      ...evidence
    };
  }
  
  
  /*
   * CENTRAL EVIDENCE BUILDER
   *
   * The LLM will eventually receive this object,
   * or a smaller query-specific subset of it.
   */
  export function buildEvidenceContext({
    dashboardData,
  
    page = null,
  
    state = null,
  
    year = null,
  
    selectedStationId = null,
  
    waterQuality = null
  } = {}) {
  
    if (!dashboardData) {
      return null;
    }
  
    const canonicalSelectedState =
      normalizeState(state);
  
    const resolvedYear =
      resolveYear(
        year,
        dashboardData
      );
  
    /*
     * -------------------------------
     * SUSTAINABILITY
     * -------------------------------
     */
  
    let sustainability;
  
    if (
      canonicalSelectedState &&
      resolvedYear.year
    ) {
      const evidence =
        buildSustainabilityEvidence({
          details:
            dashboardData
              .sti_details ??
            [],
  
          fallbacks:
            dashboardData
              .sti_fallbacks ??
            [],
  
          yoyValues:
            dashboardData
              .yoy_values ??
            [],
  
          recoveryRows:
            dashboardData
              .recovery ??
            [],
  
          stateYearRows:
            dashboardData
              .state_year ??
            [],
  
          state:
            canonicalSelectedState,
  
          year:
            resolvedYear.year
        });
  
      sustainability =
        evidence
          ? available(evidence)
          : unavailable(
              'Sustainability evidence could not be resolved for the selected state and year.'
            );
  
    } else {
  
      sustainability =
        unavailable(
          canonicalSelectedState
            ? 'No sustainability year is available.'
            : 'No single state is selected.'
        );
    }
  
  
    /*
     * -------------------------------
     * SENTIMENT
     * -------------------------------
     */
  
    const sentimentAvailable =
      Array.isArray(
        dashboardData
          .sentiment_overall
      );
  
    const sentiment =
      sentimentAvailable
        ? available(
            buildSentimentEvidence({
              overall:
                dashboardData
                  .sentiment_overall ??
                [],
  
              dimensions:
                dashboardData
                  .sentiment_dimensions ??
                [],
  
              stakeholders:
                dashboardData
                  .sentiment_stakeholders ??
                [],
  
              quarterly:
                dashboardData
                  .sentiment_quarterly ??
                [],
  
              destinationDimensions:
                dashboardData
                  .sentiment_destination_dimensions ??
                [],
  
              aspects:
                dashboardData
                  .sentiment_aspects ??
                [],
  
              state:
                canonicalSelectedState
            })
          )
        : unavailable(
            'Sentiment exports are unavailable.'
          );
  
  
    /*
     * -------------------------------
     * FORECAST
     * -------------------------------
     */
  
    const forecastAvailable =
      Array.isArray(
        dashboardData
          .forecast_tasks
      );
  
    const forecast =
      forecastAvailable
        ? available(
            buildForecastEvidence({
              tasks:
                dashboardData
                  .forecast_tasks ??
                [],
  
              stateVisitorRows:
                dashboardData
                  .forecast_state_visitors ??
                [],
  
              state:
                canonicalSelectedState
            })
          )
        : unavailable(
            'Forecast exports are unavailable.'
          );
  
  
    /*
     * -------------------------------
     * CAUSAL
     * -------------------------------
     */
  
    const causal =
      dashboardData.causal
        ? available(
            buildCausalEvidence(
              dashboardData.causal
            )
          )
        : unavailable(
            'Causal analysis export is unavailable.'
          );
  
  
    /*
     * -------------------------------
     * MQIMS / MARINE
     * -------------------------------
     */
  
    const mqimsStations =
      waterQuality?.stations ??
      [];
  
    let marine;
  
    if (mqimsStations.length) {
  
      const suppliedFilters =
        waterQuality?.filters ??
        {};
  
      /*
       * MQIMS can explicitly use "All"
       * even when no state-level context
       * exists elsewhere.
       */
      const marineState =
        suppliedFilters.state ??
        canonicalSelectedState ??
        'All';
  
      marine = available(
        buildMqimsEvidence({
          stations:
            mqimsStations,
  
          history:
            waterQuality?.history ??
            [],
  
          filters: {
            state:
              marineState,
  
            category:
              suppliedFilters.category ??
              'All',
  
            mwqiClass:
              suppliedFilters.mwqiClass ??
              'All',
  
            trend:
              suppliedFilters.trend ??
              'All'
          },
  
          selectedStationId:
            waterQuality
              ?.selectedStationId ??
            selectedStationId ??
            null,
  
          priorityLimit:
            waterQuality
              ?.priorityLimit ??
            10
        })
      );
  
    } else {
  
      marine =
        unavailable(
          'MQIMS station data was not supplied to this evidence context.'
        );
    }
  
  
    /*
     * -------------------------------
     * METHODOLOGY
     * -------------------------------
     */
  
    const methodology =
      buildMethodologyEvidence(
        dashboardData
      );
  
  
    /*
     * -------------------------------
     * GLOBAL LIMITATIONS
     * -------------------------------
     */
  
    const limitations =
      uniqueStrings([
        ...(methodology.limitations ?? []),
  
        ...(
          sustainability.available
            ? sustainability.limitations ??
              []
            : []
        ),
  
        ...(
          sentiment.available
            ? sentiment.limitations ??
              []
            : []
        ),
  
        ...(
          forecast.available
            ? forecast.limitations ??
              []
            : []
        ),
  
        ...(
          causal.available
            ? causal.limitations ??
              []
            : []
        ),
  
        ...(
          marine.available
            ? marine.limitations ??
              []
            : []
        )
      ]);
  
  
    /*
     * -------------------------------
     * PROVENANCE
     * -------------------------------
     */
  
    const sources = {
      sustainability: [
        'agg_states_detail.csv',
        'agg_states_fallback.csv',
        'agg_states_yoy_values.csv',
        'agg_states_recovery.csv',
        'state_year_dashboard.json'
      ],
  
      sentiment: [
        'agg_sentiment_overall.csv',
        'agg_sentiment_dimension.csv',
        'agg_sentiment_stakeholder.csv',
        'agg_sentiment_quarterly.csv',
        'agg_sentiment_destination_dimension.csv',
        'agg_sentiment_aspect.csv'
      ],
  
      forecast: [
        'agg_forecast_national_dashboard.csv',
        'agg_forecast_states_visitors_dashboard.csv'
      ],
  
      causal: [
        'agg_causal.json'
      ],
  
      waterQuality: [
        'station_dashboard_summary_enriched.geojson',
        'mwqi_history_with_coords.csv'
      ],
  
      methodology: [
        'agg_methodology.json',
        'metadata.json'
      ]
    };
  
  
    /*
     * -------------------------------
     * FINAL CONTEXT
     * -------------------------------
     */
  
    return {
      schemaVersion: '1.0',
  
      context: {
        page,
  
        state:
          canonicalSelectedState,
  
        year:
          resolvedYear.year,
  
        yearSource:
          resolvedYear.source,
  
        selectedStationId:
          waterQuality
            ?.selectedStationId ??
          selectedStationId ??
          null
      },
  
      availability: {
        sustainability:
          sustainability.available,
  
        sentiment:
          sentiment.available,
  
        forecast:
          forecast.available,
  
        causal:
          causal.available,
  
        waterQuality:
          marine.available,
  
        methodology:
          methodology.available
      },
  
      sustainability,
  
      sentiment,
  
      forecast,
  
      causal,
  
      waterQuality:
        marine,
  
      methodology,
  
      limitations,
  
      guardrails: [
        'Do not invent values that are absent from the supplied evidence.',
  
        'Do not treat Economic + Social fallback scores as a full Sustainability Tourism Index.',
  
        'Do not combine sentiment scores mathematically with STI, MWQI, or forecast values.',
  
        'Sentiment is perception evidence and is not a representative survey.',
  
        'A forecast model should not be preferred when it fails to beat the naive persistence baseline.',
  
        'Do not claim that tourism caused water-quality changes unless the supplied causal evidence supports that conclusion.',
  
        'The current TWFE evidence describes an observational association and does not establish definitive causation.',
  
        'Do not use state-level causal evidence to explain the cause of an individual MQIMS station trend.',
  
        'MPA distance refers to an available reference coordinate rather than the legal protected-area boundary.',
  
        'Monitoring priority is a decision-support heuristic and is not an official DOE classification.'
      ],
  
      sources
    };
  }