import {
    useEffect,
    useMemo,
    useRef,
    useState
  } from 'react';
  
  import {
    GUIDED_QUERIES,
    buildGuidedQueryPayload,
    canRunGuidedQuery
  } from '../evidence/queryContracts';
  
  import {
    requestInsight
  } from '../api/decisionIntelligence';
  
  
  const PAGE_ACTIONS = {

    Overview: [
      'identify_risks',
      'visitor_perception',
      'forecast_reliability',
      'full_decision_brief'
    ],
  
    States: [
      'explain_state',
      'identify_risks',
      'visitor_perception',
      'policy_options'
    ],
  
    Forecast: [
      'forecast_reliability'
    ],
  
    Causal: [],
  
    Methodology: [],
  
    MQIMS: [
      'water_quality_brief',
      'identify_risks',
      'explain_state',
      'explain_station',
      'policy_options'
    ]
  };
  
  
  function formatValue(value) {
    if (
      value === null ||
      value === undefined
    ) {
      return 'N/A';
    }
  
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
  
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
  
    return String(value);
  }
  
  
  function EvidenceReference({
    evidenceId,
    evidenceIndex
  }) {
    const item =
      evidenceIndex?.[evidenceId];
  
    if (!item) {
      return (
        <span className="ai-evidence-missing">
          {evidenceId}
        </span>
      );
    }
  
    return (
      <details className="ai-evidence-ref">
        <summary>
          {evidenceId}
        </summary>
  
        <div className="ai-evidence-detail">
          <div>
            <span>Value</span>
            <strong>
              {formatValue(item.value)}
            </strong>
          </div>
  
          <div>
            <span>Source</span>
            <strong>
              {item.source}
            </strong>
          </div>
  
          <p>
            {item.definition}
          </p>
        </div>
      </details>
    );
  }
  
  
  export default function DecisionIntelligencePanel({
    evidenceContext
  }) {
    const [loadingAction, setLoadingAction] =
      useState(null);
  
    const [response, setResponse] =
      useState(null);
  
    const [activePayload, setActivePayload] =
      useState(null);
  
    const [error, setError] =
      useState(null);
  
    const requestCounter =
      useRef(0);
  
  
    /*
     * Determine which guided actions
     * are currently available.
     */
    const actions =
        useMemo(() => {

            if (!evidenceContext) {
            return [];
            }

            const page =
            evidenceContext.context?.page ??
            'Overview';

            const allowedActions =
            PAGE_ACTIONS[page] ?? [];

            return allowedActions.map(id => {

            const contract =
                GUIDED_QUERIES[id];

            const availability =
                canRunGuidedQuery(
                id,
                evidenceContext
                );

            return {
                id,

                label:
                contract.label,

                allowed:
                availability.allowed,

                reason:
                availability.reason
            };
            });

    }, [evidenceContext]);
  
  
    /*
     * Clear old AI answers whenever the
     * dashboard evidence context changes.
     *
     * This avoids showing a Johor answer
     * after switching to Sabah, for example.
     */
    useEffect(() => {
  
      requestCounter.current += 1;
  
      setResponse(null);
      setActivePayload(null);
      setError(null);
      setLoadingAction(null);
  
    }, [evidenceContext]);
  
  
    async function runAction(actionId) {
      if (
        !evidenceContext ||
        loadingAction
      ) {
        return;
      }
  
      const availability =
        canRunGuidedQuery(
          actionId,
          evidenceContext
        );
  
      if (!availability.allowed) {
        setError(
          availability.reason ??
          'This action is unavailable.'
        );
  
        return;
      }
  
  
      const payload =
        buildGuidedQueryPayload(
          actionId,
          evidenceContext
        );
  
  
      const requestId =
        ++requestCounter.current;
  
  
      try {
  
        setLoadingAction(actionId);
        setError(null);
        setResponse(null);
        setActivePayload(payload);
  
  
        const result =
          await requestInsight(
            payload
          );
  
  
        /*
         * Ignore an old response if the user
         * changed state/filter/station while
         * the model was working.
         */
        if (
          requestId !==
          requestCounter.current
        ) {
          return;
        }
  
  
        setResponse(result);
  
  
      } catch (err) {
  
        if (
          requestId !==
          requestCounter.current
        ) {
          return;
        }
  
        setError(
          err.message ??
          'Decision Intelligence request failed.'
        );
  
  
      } finally {
  
        if (
          requestId ===
          requestCounter.current
        ) {
          setLoadingAction(null);
        }
      }
    }
  
  
    if (!evidenceContext) {
      return null;
    }
  
  
    const result =
      response?.result;
  
  
    return (
      <section className="ai-panel">
  
        <div className="ai-panel-header">
  
          <div>
  
            <h2>
              Evidence-guided analysis
            </h2>
  
            <p className="muted">
              AI explanations are generated only from
              the validated evidence available in this
              dashboard.
            </p>
          </div>
  
          <div className="ai-context-badge">
  
            <strong>
              {evidenceContext.context?.state ??
                'All states'}
            </strong>
  
            {evidenceContext.context?.year && (
              <span>
                {evidenceContext.context.year}
              </span>
            )}
  
          </div>
  
        </div>
  
  
        <div className="ai-actions">
  
          {actions.map(action => (
  
            <button
              key={action.id}
              type="button"
              className={
                action.id ===
                'full_decision_brief'
                  ? 'ai-action ai-action-primary'
                  : 'ai-action'
              }
              disabled={
                !action.allowed ||
                Boolean(loadingAction)
              }
              title={
                action.allowed
                  ? action.label
                  : action.reason ??
                    'Unavailable'
              }
              onClick={() =>
                runAction(action.id)
              }
            >
  
              {loadingAction === action.id
                ? 'Analyzing…'
                : action.label}
  
            </button>
  
          ))}
  
        </div>
  
  
        {error && (
          <div className="ai-error">
            <strong>
              Unable to generate insight
            </strong>
  
            <p>
              {error}
            </p>
          </div>
        )}
  
  
        {loadingAction && (
          <div className="ai-loading">
  
            <span className="ai-loading-dot" />
  
            <div>
              <strong>
                Analyzing dashboard evidence
              </strong>
  
              <p>
                Checking the available evidence and
                preparing an evidence-linked response.
              </p>
            </div>
  
          </div>
        )}
  
  
        {result && (
          <div className="ai-result">
  
            <div className="ai-result-heading">
  
              <span className="eyebrow">
                AI BRIEF
              </span>
  
              <h3>
                {result.title}
              </h3>
  
            </div>
  
  
            <p className="ai-summary">
              {result.summary}
            </p>
  
  
            {result.findings?.length > 0 && (
              <div className="ai-findings">
  
                <h4>
                  Key findings
                </h4>
  
                {result.findings.map(
                  (finding, index) => (
  
                    <article
                      className="ai-finding"
                      key={`${index}-${finding.text}`}
                    >
  
                      <div className="ai-finding-number">
                        {index + 1}
                      </div>
  
                      <div className="ai-finding-body">
  
                        <p>
                          {finding.text}
                        </p>
  
  
                        {finding.evidenceIds
                          ?.length > 0 && (
  
                          <div className="ai-evidence-list">
  
                            <span className="ai-evidence-label">
                              Evidence
                            </span>
  
                            {finding.evidenceIds.map(
                              evidenceId => (
  
                                <EvidenceReference
                                  key={evidenceId}
                                  evidenceId={
                                    evidenceId
                                  }
                                  evidenceIndex={
                                    activePayload
                                      ?.evidenceIndex
                                  }
                                />
  
                              )
                            )}
  
                          </div>
  
                        )}
  
                      </div>
  
                    </article>
  
                  )
                )}
  
              </div>
            )}
  
  
            {result.limitations?.length > 0 && (
              <div className="ai-limitations">
  
                <h4>
                  Important limitations
                </h4>
  
                <ul>
                  {result.limitations.map(
                    (limitation, index) => (
                      <li key={index}>
                        {limitation}
                      </li>
                    )
                  )}
                </ul>
  
              </div>
            )}
  
  
            {response?.model?.id && (
              <div className="ai-model-note">
  
                Generated using{' '}
                <strong>
                  {response.model.id}
                </strong>
  
              </div>
            )}
  
          </div>
        )}
  
      </section>
    );
  }