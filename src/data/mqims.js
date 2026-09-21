import {
    canonicalState,
    stateEquals
  } from './stateNames';
  
  function stationProperties(station) {
    return station?.properties ?? station ?? {};
  }
  
  function numeric(value) {
    if (
      value == null ||
      value === ''
    ) {
      return null;
    }
  
    const parsed = Number(value);
  
    return Number.isFinite(parsed)
      ? parsed
      : null;
  }
  
  export function getMonitoringPriority(
    station
  ) {
    const p =
      stationProperties(station);
  
    const change5y =
      numeric(p.CHANGE_5Y);
  
    const distance =
      numeric(p.DISTANCE_KM);
  
    const nearMpa =
      distance !== null &&
      distance <= 25;
  
    const strongDecline =
      change5y !== null &&
      change5y <= -10;
  
    if (
      p.LATEST_CLASS === 'Poor' &&
      (
        p.TREND_DIRECTION === 'Declining' ||
        strongDecline ||
        nearMpa
      )
    ) {
      return {
        level: 1,
        label: 'Immediate review'
      };
    }
  
    if (
      p.LATEST_CLASS === 'Poor' ||
      (
        p.LATEST_CLASS === 'Moderate' &&
        p.TREND_DIRECTION === 'Declining'
      ) ||
      strongDecline
    ) {
      return {
        level: 2,
        label: 'Elevated monitoring'
      };
    }
  
    if (
      p.TREND_DIRECTION === 'Declining' ||
      p.LATEST_CLASS === 'Moderate'
    ) {
      return {
        level: 3,
        label: 'Watch'
      };
    }
  
    return {
      level: 4,
      label: 'Routine'
    };
  }
  
  export function getPriorityReasons(
    station
  ) {
    const p =
      stationProperties(station);
  
    const priority =
      getMonitoringPriority(p);
  
    const reasons = [];
  
    if (p.LATEST_CLASS === 'Poor') {
      reasons.push(
        'Poor current MWQI'
      );
    } else if (
      p.LATEST_CLASS === 'Moderate'
    ) {
      reasons.push(
        'Moderate current MWQI'
      );
    }
  
    if (
      p.TREND_DIRECTION === 'Declining'
    ) {
      reasons.push(
        'Declining recent trend'
      );
    }
  
    const change5y =
      numeric(p.CHANGE_5Y);
  
    if (
      change5y !== null &&
      change5y <= -10
    ) {
      reasons.push(
        'Strong 5-year deterioration'
      );
    }
  
    const distance =
      numeric(p.DISTANCE_KM);
  
    if (
      priority.level === 1 &&
      p.LATEST_CLASS === 'Poor' &&
      distance !== null &&
      distance <= 25
    ) {
      reasons.push(
        'MPA reference within 25 km'
      );
    }
  
    return reasons;
  }
  
  export function rankMonitoringStations(
    features = []
  ) {
    return features
      .map(feature => ({
        ...feature,
  
        priority:
          getMonitoringPriority(feature)
      }))
      .sort((a, b) => {
  
        const levelDifference =
          a.priority.level -
          b.priority.level;
  
        if (levelDifference !== 0) {
          return levelDifference;
        }
  
        const aMwqi =
          numeric(
            a.properties?.LATEST_MWQI
          ) ?? Infinity;
  
        const bMwqi =
          numeric(
            b.properties?.LATEST_MWQI
          ) ?? Infinity;
  
        return aMwqi - bMwqi;
      });
  }
  
  export function filterMqimsStations(
    features = [],
    {
      state = 'All',
      category = 'All',
      mwqiClass = 'All',
      trend = 'All'
    } = {}
  ) {
    return features.filter(feature => {
  
      const p =
        feature.properties ?? {};
  
      const matchesState =
        state === 'All' ||
        stateEquals(
          p.STATE_NAME,
          state
        );
  
      const matchesCategory =
        category === 'All' ||
        p.CATEGORY === category;
  
      const matchesClass =
        mwqiClass === 'All' ||
        p.LATEST_CLASS === mwqiClass;
  
      const matchesTrend =
        trend === 'All' ||
        p.TREND_DIRECTION === trend;
  
      return (
        matchesState &&
        matchesCategory &&
        matchesClass &&
        matchesTrend
      );
    });
  }
  
  export function filterMpasByState(
    features = [],
    state = 'All'
  ) {
    if (state === 'All') {
      return features;
    }
  
    return features.filter(
      feature =>
        stateEquals(
          feature.properties?.State,
          state
        )
    );
  }
  
  export function getMqimsSummary(
    features = []
  ) {
    return {
      total:
        features.length,
  
      poor:
        features.filter(
          feature =>
            feature.properties
              ?.LATEST_CLASS === 'Poor'
        ).length,
  
      moderate:
        features.filter(
          feature =>
            feature.properties
              ?.LATEST_CLASS === 'Moderate'
        ).length,
  
      declining:
        features.filter(
          feature =>
            feature.properties
              ?.TREND_DIRECTION ===
            'Declining'
        ).length
    };
  }
  
  export function getPrioritySummary(
    features = []
  ) {
    const ranked =
      features.every(
        feature => feature.priority
      )
        ? features
        : rankMonitoringStations(
            features
          );
  
    return {
      immediate:
        ranked.filter(
          feature =>
            feature.priority.level === 1
        ).length,
  
      elevated:
        ranked.filter(
          feature =>
            feature.priority.level === 2
        ).length,
  
      watch:
        ranked.filter(
          feature =>
            feature.priority.level === 3
        ).length,
  
      routine:
        ranked.filter(
          feature =>
            feature.priority.level === 4
        ).length
    };
  }
  
  export function getMqimsAvailableStates(
    features = []
  ) {
    return [
      ...new Set(
        features
          .map(feature =>
            canonicalState(
              feature.properties
                ?.STATE_NAME
            )
          )
          .filter(Boolean)
      )
    ].sort(
      (a, b) =>
        a.localeCompare(b)
    );
  }
  
  export function getStationHistory(
    rows = [],
    stationId
  ) {
    if (!stationId) {
      return [];
    }
  
    return rows
      .filter(
        row =>
          row.STATION_ID ===
          stationId
      )
      .sort(
        (a, b) =>
          a.YEAR - b.YEAR
      );
  }