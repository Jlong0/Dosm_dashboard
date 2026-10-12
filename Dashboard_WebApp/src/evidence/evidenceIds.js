function safeToken(value) {
    return String(value ?? 'ALL')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }
  
  
  function hasValue(value) {
    return (
      value !== null &&
      value !== undefined &&
      value !== ''
    );
  }
  
  
  function addEvidence(
    index,
    {
      id,
      value,
      source,
      definition,
      scope = {}
    }
  ) {
    if (!hasValue(value)) {
      return;
    }
  
    index[id] = {
      id,
      value,
      source,
      definition,
      scope
    };
  }
  
  
  export function buildEvidenceIndex(
    context
  ) {
    if (!context) {
      return {};
    }
  
    const index = {};
  
    const state =
      context.context?.state ??
      'ALL';
  
    const year =
      context.context?.year ??
      'NA';
  
    const stateToken =
      safeToken(state);
  
  
    /*
     * =================================
     * SUSTAINABILITY / STI
     * =================================
     */
  
    if (
      context.sustainability?.available
    ) {
      const s =
        context.sustainability;
  
      const sti =
        s.sustainabilityIndex;
  
      if (sti) {
        addEvidence(index, {
          id:
            `STI.${stateToken}.${year}.SCORE`,
  
          value:
            sti.score,
  
          source:
            'agg_states_detail.csv / agg_states_fallback.csv',
  
          definition:
            sti.fullStiAvailable
              ? 'Full Sustainability Tourism Index score.'
              : 'Available Economic + Social fallback score; not a full STI.',
  
          scope: {
            state,
            year
          }
        });
  
  
        addEvidence(index, {
          id:
            `STI.${stateToken}.${year}.PILLAR.ECONOMIC`,
  
          value:
            sti.pillars?.economic,
  
          source:
            'agg_states_detail.csv',
  
          definition:
            'Economic STI pillar score.',
  
          scope: {
            state,
            year
          }
        });
  
  
        addEvidence(index, {
          id:
            `STI.${stateToken}.${year}.PILLAR.SOCIAL`,
  
          value:
            sti.pillars?.social,
  
          source:
            'agg_states_detail.csv',
  
          definition:
            'Social STI pillar score.',
  
          scope: {
            state,
            year
          }
        });
  
  
        addEvidence(index, {
          id:
            `STI.${stateToken}.${year}.PILLAR.ENVIRONMENTAL`,
  
          value:
            sti.pillars?.environmental,
  
          source:
            'agg_states_detail.csv',
  
          definition:
            'Environmental STI pillar score.',
  
          scope: {
            state,
            year
          }
        });
      }
  
  
      const yoy =
        s.yearOverYear;
  
      if (yoy) {
        addEvidence(index, {
          id:
            `YOY.${stateToken}.${year}.CONCERN_COUNT`,
  
          value:
            yoy.summary?.concern,
  
          source:
            'agg_states_yoy_values.csv',
  
          definition:
            'Number of indicators classified as Concern in the year-over-year report.',
  
          scope: {
            state,
            year
          }
        });
  
  
        addEvidence(index, {
          id:
            `YOY.${stateToken}.${year}.FAVOURABLE_COUNT`,
  
          value:
            yoy.summary?.favourable,
  
          source:
            'agg_states_yoy_values.csv',
  
          definition:
            'Number of indicators classified as Favourable in the year-over-year report.',
  
          scope: {
            state,
            year
          }
        });
  
  
        [
          ...(yoy.stiIndicators ?? []),
          ...(yoy.diagnostics ?? [])
        ].forEach(row => {
  
          const indicatorToken =
            safeToken(
              row.indicator
            );
  
          addEvidence(index, {
            id:
              `YOY.${stateToken}.${year}.${indicatorToken}.CHANGE`,
  
            value:
              row.change,
  
            source:
              'agg_states_yoy_values.csv',
  
            definition:
              `Year-over-year change for ${row.indicator}.`,
  
            scope: {
              state,
              year,
              indicator:
                row.indicator
            }
          });
  
  
          addEvidence(index, {
            id:
              `YOY.${stateToken}.${year}.${indicatorToken}.STATUS`,
  
            value:
              row.interpretation,
  
            source:
              'agg_states_yoy_values.csv',
  
            definition:
              `Configured interpretation of the year-over-year movement for ${row.indicator}.`,
  
            scope: {
              state,
              year,
              indicator:
                row.indicator
            }
          });
        });
      }
  
  
      addEvidence(index, {
        id:
          `RECOVERY.${stateToken}.ECONOMIC_DELTA`,
  
        value:
          s.recovery?.deltaEconomic,
  
        source:
          'agg_states_recovery.csv',
  
        definition:
          'Difference between 2022–2024 and 2017–2019 average economic performance.',
  
        scope: {
          state
        }
      });
  
  
      addEvidence(index, {
        id:
          `RECOVERY.${stateToken}.ENVIRONMENTAL_DELTA`,
  
        value:
          s.recovery?.deltaEnvironmental,
  
        source:
          'agg_states_recovery.csv',
  
        definition:
          'Difference between 2022–2024 and 2017–2019 average environmental performance.',
  
        scope: {
          state
        }
      });
  
  
      addEvidence(index, {
        id:
          `STABILITY.${stateToken}.SCORE`,
  
        value:
          s.stability?.score,
  
        source:
          'agg_states_detail.csv',
  
        definition:
          'Leave-one-indicator-out STI rank stability measure.',
  
        scope: {
          state
        }
      });
    }
  
  
    /*
     * =================================
     * SENTIMENT
     * =================================
     */
  
    if (
      context.sentiment?.available
    ) {
      const sentiment =
        context.sentiment;
  
      addEvidence(index, {
        id:
          'SENTIMENT.NATIONAL.NET',
  
        value:
          sentiment
            .nationalOverall
            ?.netSentiment,
  
        source:
          'agg_sentiment_overall.csv',
  
        definition:
          'National pooled social-media net sentiment.',
  
        scope: {
          level: 'national'
        }
      });
  
  
      addEvidence(index, {
        id:
          'SENTIMENT.NATIONAL.ANALYZED_COMMENTS',
  
        value:
          sentiment
            .nationalOverall
            ?.analyzedComments,
  
        source:
          'agg_sentiment_overall.csv',
  
        definition:
          'Number of analyzed social-media comments.',
  
        scope: {
          level: 'national'
        }
      });
  
  
      const destination =
        sentiment.destination;
  
      if (
        destination?.available
      ) {
        const destinationToken =
          safeToken(
            destination
              .destinationUsed
          );
  
        destination.dimensions
          ?.forEach(row => {
  
            const dimensionToken =
              safeToken(
                row.dimension
              );
  
            addEvidence(index, {
              id:
                `SENTIMENT.DESTINATION.${destinationToken}.${dimensionToken}.NET`,
  
              value:
                row.netSentiment,
  
              source:
                'agg_sentiment_destination_dimension.csv',
  
              definition:
                `Net sentiment for the ${row.dimension} dimension at ${destination.destinationUsed}.`,
  
              scope: {
                state,
                destination:
                  destination
                    .destinationUsed,
  
                scopeType:
                  destination
                    .scopeType
              }
            });
          });
      }
  
  
      sentiment.topNegativeAspects
        ?.forEach(row => {
  
          addEvidence(index, {
            id:
              `SENTIMENT.ASPECT.NATIONAL.${safeToken(row.aspect)}.NET`,
  
            value:
              row.netSentiment,
  
            source:
              'agg_sentiment_aspect.csv',
  
            definition:
              `National net sentiment for tourism aspect ${row.aspect}.`,
  
            scope: {
              level: 'national'
            }
          });
        });
    }
  
  
    /*
     * =================================
     * FORECAST
     * =================================
     */
  
    if (
      context.forecast?.available
    ) {
      const forecast =
        context.forecast;
  
      forecast.nationalTasks
        ?.forEach(task => {
  
          const taskToken =
            safeToken(
              task.task
            );
  
          addEvidence(index, {
            id:
              `FORECAST.${taskToken}.BEATS_BASELINE`,
  
            value:
              task.validation
                ?.beatsNaiveBaseline,
  
            source:
              'agg_forecast_national_dashboard.csv',
  
            definition:
              `Whether the ${task.label} model beats the naive persistence baseline.`,
  
            scope: {
              forecastYear:
                2025
            }
          });
  
  
          addEvidence(index, {
            id:
              `FORECAST.${taskToken}.MODEL_ERROR`,
  
            value:
              task.validation
                ?.modelError,
  
            source:
              'agg_forecast_national_dashboard.csv',
  
            definition:
              `${task.label} model validation error.`,
  
            scope: {
              metric:
                task.validation
                  ?.modelErrorMetric
            }
          });
  
  
          addEvidence(index, {
            id:
              `FORECAST.${taskToken}.NAIVE_ERROR`,
  
            value:
              task.validation
                ?.naiveError,
  
            source:
              'agg_forecast_national_dashboard.csv',
  
            definition:
              `${task.label} naive persistence validation error.`,
  
            scope: {
              metric:
                task.validation
                  ?.naiveErrorMetric
            }
          });
  
  
          addEvidence(index, {
            id:
              `FORECAST.${taskToken}.RECOMMENDED_2025`,
  
            value:
              task.recommendation
                ?.value,
  
            source:
              'agg_forecast_national_dashboard.csv',
  
            definition:
              `Preferred 2025 forecast according to baseline comparison for ${task.label}.`,
  
            scope: {
              recommendationType:
                task.recommendation
                  ?.type
            }
          });
        });
  
  
      const stateForecast =
        forecast
          .selectedStateVisitors;
  
      if (stateForecast) {
        addEvidence(index, {
          id:
            `FORECAST.VISITORS.${stateToken}.MODEL_2025`,
  
          value:
            stateForecast
              .forecasts2025
              ?.model,
  
          source:
            'agg_forecast_states_visitors_dashboard.csv',
  
          definition:
            'Selected-state 2025 domestic visitor model forecast.',
  
          scope: {
            state
          }
        });
  
  
        addEvidence(index, {
          id:
            `FORECAST.VISITORS.${stateToken}.ACTUAL_2025`,
  
          value:
            stateForecast
              .observed2025,
  
          source:
            'agg_forecast_states_visitors_dashboard.csv',
  
          definition:
            'Published selected-state 2025 domestic visitor observation.',
  
          scope: {
            state
          }
        });
      }
    }
  
  
    /*
     * =================================
     * CAUSAL / TWFE
     * =================================
     */
  
    if (
      context.causal?.available
    ) {
      const causal =
        context.causal;
  
      addEvidence(index, {
        id:
          'CAUSAL.TWFE.COEFFICIENT',
  
        value:
          causal.estimate
            ?.coefficient,
  
        source:
          'agg_causal.json',
  
        definition:
          'TWFE estimated association between lagged tourism receipts per resident and coastal Good/Excellent share.',
  
        scope: {
          level:
            'state-year panel'
        }
      });
  
  
      addEvidence(index, {
        id:
          'CAUSAL.TWFE.P_VALUE',
  
        value:
          causal.estimate
            ?.pValue,
  
        source:
          'agg_causal.json',
  
        definition:
          'P-value for the TWFE tourism coefficient.',
  
        scope: {
          level:
            'state-year panel'
        }
      });
  
  
      addEvidence(index, {
        id:
          'CAUSAL.TWFE.SIGNIFICANT_AT_05',
  
        value:
          causal.inference
            ?.statisticallySignificantAt05,
  
        source:
          'agg_causal.json',
  
        definition:
          'Whether the TWFE coefficient is statistically significant at alpha = 0.05.',
  
        scope: {
          level:
            'state-year panel'
        }
      });
    }
  
  
    /*
     * =================================
     * MQIMS
     * =================================
     */
  
    if (
      context.waterQuality?.available
    ) {
      const water =
        context.waterQuality;
  
      const summary =
        water.summary;
  
      const marineState =
        summary?.scope?.state ??
        'All';
  
      const marineToken =
        safeToken(
          marineState
        );
  
  
      addEvidence(index, {
        id:
          `MQIMS.${marineToken}.STATION_COUNT`,
  
        value:
          summary?.stationCount,
  
        source:
          'station_dashboard_summary_enriched.geojson',
  
        definition:
          'Number of MQIMS stations in the current marine scope.',
  
        scope:
          summary?.scope ?? {}
      });
  
  
      addEvidence(index, {
        id:
          `MQIMS.${marineToken}.AVERAGE_LATEST_MWQI`,
  
        value:
          summary
            ?.averageLatestMwqi,
  
        source:
          'station_dashboard_summary_enriched.geojson',
  
        definition:
          'Mean latest MWQI across stations in the current marine scope.',
  
        scope:
          summary?.scope ?? {}
      });
  
  
      addEvidence(index, {
        id:
          `MQIMS.${marineToken}.POOR_COUNT`,
  
        value:
          summary
            ?.latestClassDistribution
            ?.Poor,
  
        source:
          'station_dashboard_summary_enriched.geojson',
  
        definition:
          'Number of stations currently classified Poor.',
  
        scope:
          summary?.scope ?? {}
      });
  
  
      addEvidence(index, {
        id:
          `MQIMS.${marineToken}.DECLINING_COUNT`,
  
        value:
          summary
            ?.decliningStationCount,
  
        source:
          'station_dashboard_summary_enriched.geojson',
  
        definition:
          'Number of stations classified as having a declining recent trend.',
  
        scope:
          summary?.scope ?? {}
      });
  
  
      addEvidence(index, {
        id:
          `MQIMS.${marineToken}.PRIORITY.IMMEDIATE_COUNT`,
  
        value:
          summary
            ?.priorityCounts
            ?.immediate,
  
        source:
          'station_dashboard_summary_enriched.geojson',
  
        definition:
          'Number of stations classified Immediate review by the MarineWatch monitoring-priority heuristic.',
  
        scope:
          summary?.scope ?? {}
      });
  
  
      water.priorityStations
        ?.forEach(station => {
  
          const stationToken =
            safeToken(
              station.stationId
            );
            
            addEvidence(index, {
                id:
                  `MQIMS.STATION.${stationToken}.LOCATION`,
              
                value:
                  station.stationLocation,
              
                source:
                  'station_dashboard_summary_enriched.geojson',
              
                definition:
                  `Monitoring location for station ${station.stationId}.`,
              
                scope: {
                  stationId:
                    station.stationId
                }
              });
              
              
              addEvidence(index, {
                id:
                  `MQIMS.STATION.${stationToken}.STATE`,
              
                value:
                  station.state,
              
                source:
                  'station_dashboard_summary_enriched.geojson',
              
                definition:
                  `Canonical state for station ${station.stationId}.`,
              
                scope: {
                  stationId:
                    station.stationId
                }
              });
              
              
              addEvidence(index, {
                id:
                  `MQIMS.STATION.${stationToken}.CATEGORY`,
              
                value:
                  station.category,
              
                source:
                  'station_dashboard_summary_enriched.geojson',
              
                definition:
                  `Monitoring category for station ${station.stationId}.`,
              
                scope: {
                  stationId:
                    station.stationId
                }
              });
              
              
              addEvidence(index, {
                id:
                  `MQIMS.STATION.${stationToken}.CLASS`,
              
                value:
                  station.latestClass,
              
                source:
                  'station_dashboard_summary_enriched.geojson',
              
                definition:
                  `Latest official MWQI class for station ${station.stationId}.`,
              
                scope: {
                  stationId:
                    station.stationId
                }
              });
              
              
              addEvidence(index, {
                id:
                  `MQIMS.STATION.${stationToken}.TREND`,
              
                value:
                  station.trend,
              
                source:
                  'station_dashboard_summary_enriched.geojson',
              
                definition:
                  `Recent MWQI trend classification for station ${station.stationId}.`,
              
                scope: {
                  stationId:
                    station.stationId
                }
              });
              
              
              addEvidence(index, {
                id:
                  `MQIMS.STATION.${stationToken}.PRIORITY_LABEL`,
              
                value:
                  station.priority?.label,
              
                source:
                  'MarineWatch deterministic priority rule',
              
                definition:
                  `Monitoring-priority label for station ${station.stationId}.`,
              
                scope: {
                  stationId:
                    station.stationId
                }
              });
              
              
              addEvidence(index, {
                id:
                  `MQIMS.STATION.${stationToken}.PRIORITY_REASONS`,
              
                value:
                  station.priority?.reasons?.join('; '),
              
                source:
                  'MarineWatch deterministic priority rule',
              
                definition:
                  `Deterministic reasons contributing to the monitoring priority for station ${station.stationId}.`,
              
                scope: {
                  stationId:
                    station.stationId
                }
              });
  
          addEvidence(index, {
            id:
              `MQIMS.STATION.${stationToken}.LATEST_MWQI`,
  
            value:
              station.latestMwqi,
  
            source:
              'station_dashboard_summary_enriched.geojson',
  
            definition:
              `Latest MWQI for station ${station.stationId}.`,
  
            scope: {
              stationId:
                station.stationId,
  
              state:
                station.state
            }
          });
  
  
          addEvidence(index, {
            id:
              `MQIMS.STATION.${stationToken}.CHANGE_5Y`,
  
            value:
              station.change5y,
  
            source:
              'station_dashboard_summary_enriched.geojson',
  
            definition:
              `Five-year MWQI change for station ${station.stationId}.`,
  
            scope: {
              stationId:
                station.stationId
            }
          });
  
  
          addEvidence(index, {
            id:
              `MQIMS.STATION.${stationToken}.PRIORITY_LEVEL`,
  
            value:
              station.priority
                ?.level,
  
            source:
              'MarineWatch deterministic priority rule',
  
            definition:
              `Monitoring-priority level for station ${station.stationId}.`,
  
            scope: {
              stationId:
                station.stationId
            }
          });
        });
  
  
      const selected =
        water.selectedStation;
  
      if (selected) {
        const stationToken =
          safeToken(
            selected.stationId
          );
  
        addEvidence(index, {
          id:
            `MQIMS.STATION.${stationToken}.SELECTED.LATEST_MWQI`,
  
          value:
            selected.latest
              ?.mwqi,
  
          source:
            'station_dashboard_summary_enriched.geojson',
  
          definition:
            `Latest MWQI for selected station ${selected.stationId}.`,
  
          scope: {
            stationId:
              selected.stationId
          }
        });
  
  
        addEvidence(index, {
          id:
            `MQIMS.STATION.${stationToken}.SELECTED.CLASS`,
  
          value:
            selected.latest
              ?.mwqiClass,
  
          source:
            'station_dashboard_summary_enriched.geojson',
  
          definition:
            `Latest official MWQI class for selected station ${selected.stationId}.`,
  
          scope: {
            stationId:
              selected.stationId
          }
        });
  
  
        addEvidence(index, {
          id:
            `MQIMS.STATION.${stationToken}.SELECTED.CHANGE_5Y`,
  
          value:
            selected.change
              ?.fiveYear,
  
          source:
            'station_dashboard_summary_enriched.geojson',
  
          definition:
            `Five-year MWQI change for selected station ${selected.stationId}.`,
  
          scope: {
            stationId:
              selected.stationId
          }
        });
  
  
        addEvidence(index, {
          id:
            `MQIMS.STATION.${stationToken}.SELECTED.MPA_DISTANCE_KM`,
  
          value:
            selected.mpaContext
              ?.referenceDistanceKm,
  
          source:
            'station_dashboard_summary_enriched.geojson',
  
          definition:
            'Distance to the available MPA reference coordinate, not the legal protected-area boundary.',
  
          scope: {
            stationId:
              selected.stationId
          }
        });
      }
    }
  
  
    return index;
  }