import {
    filterMqimsStations,
    getMqimsSummary,
    getMonitoringPriority,
    getPriorityReasons,
    getPrioritySummary,
    getStationHistory,
    rankMonitoringStations
  } from '../data/mqims';
  
  import {
    canonicalState
  } from '../data/stateNames';
  
  
  function props(feature) {
    return feature?.properties ?? feature ?? {};
  }
  
  
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
  
  
  function classDistribution(features) {
    const distribution = {
      Excellent: 0,
      Good: 0,
      Moderate: 0,
      Poor: 0,
      Unknown: 0
    };
  
    features.forEach(feature => {
      const value =
        props(feature).LATEST_CLASS;
  
      if (
        Object.prototype.hasOwnProperty.call(
          distribution,
          value
        )
      ) {
        distribution[value] += 1;
      } else {
        distribution.Unknown += 1;
      }
    });
  
    return distribution;
  }
  
  
  function averageLatestMwqi(features) {
    const values = features
      .map(feature =>
        numberOrNull(
          props(feature).LATEST_MWQI
        )
      )
      .filter(value => value !== null);
  
    if (!values.length) {
      return null;
    }
  
    const total = values.reduce(
      (sum, value) => sum + value,
      0
    );
  
    return rounded(
      total / values.length,
      1
    );
  }
  
  
  function normalizeFilters(filters = {}) {
    return {
      state:
        filters.state === 'All' ||
        !filters.state
          ? 'All'
          : canonicalState(filters.state),
  
      category:
        filters.category ?? 'All',
  
      mwqiClass:
        filters.mwqiClass ?? 'All',
  
      trend:
        filters.trend ?? 'All'
    };
  }
  
  
  /*
   * STATE / FILTERED SUMMARY
   *
   * Gives the future AI a compact picture of
   * water-quality conditions for the current scope.
   */
  export function getWaterQualityStateSummary(
    stationFeatures = [],
    filters = {}
  ) {
    const normalizedFilters =
      normalizeFilters(filters);
  
    const filtered =
      filterMqimsStations(
        stationFeatures,
        normalizedFilters
      );
  
    const summary =
      getMqimsSummary(filtered);
  
    const ranked =
      rankMonitoringStations(filtered);
  
    const priorities =
      getPrioritySummary(ranked);
  
    const changes5y = filtered
      .map(feature =>
        numberOrNull(
          props(feature).CHANGE_5Y
        )
      )
      .filter(value => value !== null);
  
    const deteriorating5y =
      changes5y.filter(
        value => value < 0
      ).length;
  
    const strongDeterioration =
      changes5y.filter(
        value => value <= -10
      ).length;
  
    return {
      scope: {
        state: normalizedFilters.state,
        category:
          normalizedFilters.category,
        mwqiClass:
          normalizedFilters.mwqiClass,
        trend:
          normalizedFilters.trend
      },
  
      stationCount:
        summary.total,
  
      averageLatestMwqi:
        averageLatestMwqi(filtered),
  
      latestClassDistribution:
        classDistribution(filtered),
  
      decliningStationCount:
        summary.declining,
  
      deteriorating5yCount:
        deteriorating5y,
  
      strongDeterioration5yCount:
        strongDeterioration,
  
      priorityCounts: {
        immediate:
          priorities.immediate,
  
        elevated:
          priorities.elevated,
  
        watch:
          priorities.watch,
  
        routine:
          priorities.routine
      }
    };
  }
  
  
  /*
   * PRIORITY STATIONS
   *
   * Returns the highest-priority stations using the
   * exact same deterministic rule as the dashboard.
   */
  export function getPriorityStations(
    stationFeatures = [],
    filters = {},
    limit = 10
  ) {
    const normalizedFilters =
      normalizeFilters(filters);
  
    const filtered =
      filterMqimsStations(
        stationFeatures,
        normalizedFilters
      );
  
    return rankMonitoringStations(filtered)
      .filter(
        feature =>
          feature.priority.level < 4
      )
      .slice(0, limit)
      .map(feature => {
        const p = props(feature);
  
        return {
          stationId:
            p.STATION_ID,
  
          stationLocation:
            p.STATION_LOCATION,
  
          state:
            canonicalState(
              p.STATE_NAME
            ),
  
          category:
            p.CATEGORY ?? null,
  
          latestMwqi:
            rounded(
              p.LATEST_MWQI
            ),
  
          latestClass:
            p.LATEST_CLASS ?? null,
  
          change1y:
            rounded(
              p.CHANGE_1Y
            ),
  
          change5y:
            rounded(
              p.CHANGE_5Y
            ),
  
          trend:
            p.TREND_DIRECTION ?? null,
  
          trendSlope5y:
            rounded(
              p.TREND_SLOPE_5Y,
              2
            ),
  
          priority: {
            ...feature.priority,
  
            reasons:
              getPriorityReasons(feature)
          },
  
          mpaContext: {
            nearestMpaName:
              p.NEAREST_MPA_NAME ??
              null,
  
            nearestMpaState:
              p.NEAREST_MPA_STATE
                ? canonicalState(
                    p.NEAREST_MPA_STATE
                  )
                : null,
  
            referenceDistanceKm:
              rounded(
                p.DISTANCE_KM
              ),
  
            distanceBand:
              p.MPA_DISTANCE_BAND ??
              null
          }
        };
      });
  }
  
  
  /*
   * ONE STATION
   *
   * Used when a station has been selected on the
   * MQIMS map.
   */
  export function getWaterQualityStation(
    stationFeatures = [],
    historyRows = [],
    stationId
  ) {
    if (!stationId) {
      return null;
    }
  
    const feature =
      stationFeatures.find(
        item =>
          props(item).STATION_ID ===
          stationId
      );
  
    if (!feature) {
      return null;
    }
  
    const p = props(feature);
  
    const priority =
      getMonitoringPriority(feature);
  
    const history =
      getStationHistory(
        historyRows,
        stationId
      ).map(row => ({
        year:
          Number(row.YEAR),
  
        mwqi:
          rounded(row.MWQI),
  
        mwqiClass:
          row.MWQI_RANGE ??
          null
      }));
  
    return {
      stationId:
        p.STATION_ID,
  
      location:
        p.STATION_LOCATION,
  
      state:
        canonicalState(
          p.STATE_NAME
        ),
  
      category:
        p.CATEGORY ?? null,
  
      latest: {
        mwqi:
          rounded(
            p.LATEST_MWQI
          ),
  
        mwqiClass:
          p.LATEST_CLASS ??
          null
      },
  
      change: {
        oneYear:
          rounded(
            p.CHANGE_1Y
          ),
  
        fiveYear:
          rounded(
            p.CHANGE_5Y
          )
      },
  
      recentPeriod: {
        mean5y:
          rounded(
            p.MEAN_5Y
          ),
  
        minimum5y:
          rounded(
            p.MIN_5Y
          ),
  
        trendSlope5y:
          rounded(
            p.TREND_SLOPE_5Y,
            2
          ),
  
        trendDirection:
          p.TREND_DIRECTION ??
          null
      },
  
      monitoringPriority: {
        level:
          priority.level,
  
        label:
          priority.label,
  
        reasons:
          getPriorityReasons(feature)
      },
  
      mpaContext: {
        nearestMpaId:
          p.NEAREST_MPA_ID ??
          null,
  
        nearestMpaName:
          p.NEAREST_MPA_NAME ??
          null,
  
        nearestMpaState:
          p.NEAREST_MPA_STATE
            ? canonicalState(
                p.NEAREST_MPA_STATE
              )
            : null,
  
        designation:
          p.NEAREST_MPA_DESIGNATION ??
          null,
  
        referenceDistanceKm:
          rounded(
            p.DISTANCE_KM
          ),
  
        distanceBand:
          p.MPA_DISTANCE_BAND ??
          null,
  
        distanceMeaning:
          'Distance to the available MPA reference coordinate, not the legal protected-area boundary.'
      },
  
      history
    };
  }
  
  
  /*
   * COMPLETE MQIMS EVIDENCE PACKAGE
   *
   * This is what buildEvidenceContext() will call
   * in the next step.
   */
  export function buildMqimsEvidence({
    stations = [],
    history = [],
    filters = {},
    selectedStationId = null,
    priorityLimit = 10
  } = {}) {
    return {
      summary:
        getWaterQualityStateSummary(
          stations,
          filters
        ),
  
      priorityStations:
        getPriorityStations(
          stations,
          filters,
          priorityLimit
        ),
  
      selectedStation:
        getWaterQualityStation(
          stations,
          history,
          selectedStationId
        ),
  
      limitations: [
        'Monitoring priority is a dashboard decision-support heuristic and not an official DOE classification.',
  
        'MPA proximity is measured to an available reference coordinate rather than a legal protected-area boundary.',
  
        'The available evidence identifies monitoring patterns and associations but does not establish the cause of MWQI deterioration.'
      ]
    };
  }