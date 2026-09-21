import {
    canonicalState
  } from '../data/stateNames';
  
  
  const TASK_LABELS = {
    domestic_visitors:
      'Domestic visitors',
  
    water_pressure:
      'Water pressure',
  
    coastal_quality:
      'Coastal quality'
  };
  
  
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
  
  
  function rounded(value, digits = 2) {
    const parsed =
      numberOrNull(value);
  
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
  
  
  function approximatelyEqual(a, b) {
    const left = numberOrNull(a);
    const right = numberOrNull(b);
  
    if (
      left === null ||
      right === null
    ) {
      return false;
    }
  
    return (
      Math.abs(left - right) <
      1e-9
    );
  }
  
  
  function recommendationType(row) {
    if (
      approximatelyEqual(
        row.recommended_forecast_2025,
        row.model_forecast_2025
      )
    ) {
      return 'model';
    }
  
    if (
      approximatelyEqual(
        row.recommended_forecast_2025,
        row.naive_forecast_2025
      )
    ) {
      return 'naive_persistence';
    }
  
    return 'provided_recommendation';
  }
  
  
  function cleanNationalTask(row) {
    const beatsBaseline =
      booleanFlag(
        row.beats_baseline
      );
  
    const actual2025 =
      numberOrNull(
        row.actual_2025
      );
  
    return {
      task:
        row.task,
  
      label:
        TASK_LABELS[row.task] ??
        row.task,
  
      unit:
        row.unit ?? null,
  
      observed2024:
        rounded(
          row.actual_2024
        ),
  
      forecasts2025: {
        naive:
          rounded(
            row.naive_forecast_2025
          ),
  
        model:
          rounded(
            row.model_forecast_2025
          ),
  
        recommended:
          rounded(
            row.recommended_forecast_2025
          )
      },
  
      observed2025:
        rounded(actual2025),
  
      observed2025Available:
        actual2025 !== null,
  
      validation: {
        naiveError:
          rounded(
            row.naive_error
          ),
  
        naiveErrorMetric:
          row.naive_error_metric ??
          null,
  
        modelError:
          rounded(
            row.model_error
          ),
  
        modelErrorMetric:
          row.model_error_metric ??
          null,
  
        beatsNaiveBaseline:
          beatsBaseline
      },
  
      model: {
        name:
          row.model_name ?? null,
  
        useStatus:
          beatsBaseline
            ? 'model_supported'
            : 'baseline_preferred'
      },
  
      recommendation: {
        type:
          recommendationType(row),
  
        value:
          rounded(
            row.recommended_forecast_2025
          )
      }
    };
  }
  
  
  export function getStateVisitorForecast(
    rows = [],
    state
  ) {
    if (!state) {
      return null;
    }
  
    const canonical =
      canonicalState(state);
  
    const row = rows.find(
      item =>
        canonicalState(item.state) ===
        canonical
    );
  
    if (!row) {
      return null;
    }
  
    const actual2025 =
      numberOrNull(
        row.actual_2025
      );
  
    const modelForecast =
      numberOrNull(
        row.model_forecast_2025
      );
  
    const naiveForecast =
      numberOrNull(
        row.naive_forecast_2025
      );
  
    let realized = null;
  
    /*
     * This is a simple observed-vs-forecast
     * comparison for 2025.
     *
     * It is NOT the historical validation
     * metric shown in the national forecast
     * table.
     */
    if (
      actual2025 !== null
    ) {
      realized = {
        modelAbsoluteError:
          modelForecast !== null
            ? rounded(
                Math.abs(
                  actual2025 -
                  modelForecast
                ),
                1
              )
            : null,
  
        naiveAbsoluteError:
          naiveForecast !== null
            ? rounded(
                Math.abs(
                  actual2025 -
                  naiveForecast
                ),
                1
              )
            : null
      };
    }
  
    return {
      state:
        canonical,
  
      task:
        row.task ??
        'domestic_visitors',
  
      unit:
        "'000 domestic visitors",
  
      observed2024:
        rounded(
          row.actual_2024,
          1
        ),
  
      forecasts2025: {
        naive:
          rounded(
            row.naive_forecast_2025,
            1
          ),
  
        model:
          rounded(
            row.model_forecast_2025,
            1
          )
      },
  
      observed2025:
        rounded(
          actual2025,
          1
        ),
  
      observed2025Available:
        actual2025 !== null,
  
      realized2025Comparison:
        realized
    };
  }
  
  
  export function buildForecastEvidence({
    tasks = [],
    stateVisitorRows = [],
    state = null
  } = {}) {
  
    const nationalTasks =
      tasks.map(
        cleanNationalTask
      );
  
    const modelSupported =
      nationalTasks.filter(
        task =>
          task.validation
            .beatsNaiveBaseline
      );
  
    const baselinePreferred =
      nationalTasks.filter(
        task =>
          !task.validation
            .beatsNaiveBaseline
      );
  
    return {
      context: {
        selectedState:
          state
            ? canonicalState(state)
            : null,
  
        forecastYear:
          2025
      },
  
      decisionRule: {
        rule:
          'A model must beat the naive persistence baseline before its model forecast is preferred.',
  
        supportedModelCount:
          modelSupported.length,
  
        totalTaskCount:
          nationalTasks.length
      },
  
      nationalTasks,
  
      modelSupportedTasks:
        modelSupported.map(
          task => task.task
        ),
  
      baselinePreferredTasks:
        baselinePreferred.map(
          task => task.task
        ),
  
      selectedStateVisitors:
        getStateVisitorForecast(
          stateVisitorRows,
          state
        ),
  
      limitations: [
        'Forecast quality must be interpreted relative to the naive persistence baseline.',
  
        'Environmental 2025 observed values are not available in the current dashboard export, so real-world 2025 validation is not yet possible for those tasks.',
  
        'The state-level visitor forecast is a forecast output and does not have a separate state-specific historical validation metric in the current export.',
  
        'A model failing to beat the baseline should not be described as the preferred forecast.',
  
        'Forecasts describe expected future values and do not identify causal drivers.'
      ]
    };
  }