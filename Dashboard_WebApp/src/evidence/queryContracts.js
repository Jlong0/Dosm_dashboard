import {
    buildEvidenceIndex
  } from './evidenceIds';
  
  
  export const GUIDED_QUERIES = {
    explain_state: {
      id:
        'explain_state',
  
      label:
        "Explain this state's sustainability",
  
      task:
        'Explain the selected state sustainability picture using STI, pillars, year-over-year movement, recovery and stability.',
  
      domains: [
        'sustainability'
      ],
  
      evidencePrefixes: [
        'STI.',
        'YOY.',
        'RECOVERY.',
        'STABILITY.'
      ],
  
      requiredDomains: [
        'sustainability'
      ]
    },
  
  
    identify_risks: {
      id:
        'identify_risks',
  
      label:
        'What needs attention?',
  
      task:
        'Identify evidence-supported areas that may require closer monitoring. Separate measured sustainability indicators, perception evidence and marine monitoring evidence.',
  
      domains: [
        'sustainability',
        'sentiment',
        'waterQuality'
      ],
  
      evidencePrefixes: [
        'STI.',
        'YOY.',
        'SENTIMENT.',
        'MQIMS.'
      ],
  
      requiredDomains: []
    },
  
  
    water_quality_brief: {
      id:
        'water_quality_brief',
  
      label:
        'Explain water-quality conditions',
  
      task:
        'Summarize current marine water-quality conditions, deterioration patterns, monitoring priorities and the selected station when one is available.',
  
      domains: [
        'waterQuality'
      ],
  
      evidencePrefixes: [
        'MQIMS.'
      ],
  
      requiredDomains: [
        'waterQuality'
      ]
    },
  
  
    visitor_perception: {
      id:
        'visitor_perception',
  
      label:
        'What are visitors concerned about?',
  
      task:
        'Summarize available visitor and social-media perception evidence, clearly distinguishing national and destination-level evidence.',
  
      domains: [
        'sentiment'
      ],
  
      evidencePrefixes: [
        'SENTIMENT.'
      ],
  
      requiredDomains: [
        'sentiment'
      ]
    },
  
  
    forecast_reliability: {
      id:
        'forecast_reliability',
  
      label:
        'What can we reliably forecast?',
  
      task:
        'Explain which forecast models beat their naive baseline, which forecasts should remain persistence-based, and the major validation limitations.',
  
      domains: [
        'forecast'
      ],
  
      evidencePrefixes: [
        'FORECAST.'
      ],
  
      requiredDomains: [
        'forecast'
      ]
    },
  
  
    policy_options: {
      id:
        'policy_options',
  
      label:
        'Show evidence-supported policy options',
  
      task:
        'Present possible evidence-supported policy or monitoring options, with supporting evidence, trade-offs and explicit limitations. Do not claim that any option is proven optimal.',
  
      domains: [
        'sustainability',
        'sentiment',
        'forecast',
        'causal',
        'waterQuality'
      ],
  
      evidencePrefixes: [
        'STI.',
        'YOY.',
        'RECOVERY.',
        'STABILITY.',
        'SENTIMENT.',
        'FORECAST.',
        'CAUSAL.',
        'MQIMS.'
      ],
  
      requiredDomains: []
    },
  
  
    explain_station: {
      id:
        'explain_station',
  
      label:
        'Explain this station',
  
      task:
        'Explain the selected monitoring station using its latest MWQI, recent change, trend, monitoring priority, history and protected-area reference context.',
  
      domains: [
        'waterQuality'
      ],
  
      evidencePrefixes: [
        'MQIMS.STATION.'
      ],
  
      requiredDomains: [
        'waterQuality'
      ],
  
      requiresSelectedStation:
        true
    },
  
  
    full_decision_brief: {
      id:
        'full_decision_brief',
  
      label:
        'Generate full decision brief',
  
      task:
        'Produce a concise decision brief synthesizing the available sustainability, sentiment, forecast, causal and marine evidence while preserving uncertainty and domain boundaries.',
  
      domains: [
        'sustainability',
        'sentiment',
        'forecast',
        'causal',
        'waterQuality'
      ],
  
      evidencePrefixes: [
        'STI.',
        'YOY.',
        'RECOVERY.',
        'STABILITY.',
        'SENTIMENT.',
        'FORECAST.',
        'CAUSAL.',
        'MQIMS.'
      ],
  
      requiredDomains: []
    }
  };
  
  
  function uniqueStrings(values = []) {
    return [
      ...new Set(
        values.filter(Boolean)
      )
    ];
  }
  
  
  function domainLimitations(
    context,
    domains
  ) {
    const limitations = [];
  
    domains.forEach(domain => {
  
      const evidence =
        context[domain];
  
      if (
        evidence?.available &&
        Array.isArray(
          evidence.limitations
        )
      ) {
        limitations.push(
          ...evidence.limitations
        );
      }
    });
  
    return uniqueStrings(
      limitations
    );
  }
  
  
  function selectEvidenceIndex(
    index,
    prefixes
  ) {
    return Object.fromEntries(
      Object.entries(index)
        .filter(([id]) =>
          prefixes.some(
            prefix =>
              id.startsWith(prefix)
          )
        )
    );
  }
  
  
  function selectDomains(
    context,
    domains
  ) {
    const selected = {};
  
    domains.forEach(domain => {
      selected[domain] =
        context[domain];
    });
  
    return selected;
  }
  
  
  function selectSources(
    context,
    domains
  ) {
    const selected = {};
  
    domains.forEach(domain => {
  
      const sourceKey =
        domain === 'waterQuality'
          ? 'waterQuality'
          : domain;
  
      if (
        context.sources?.[sourceKey]
      ) {
        selected[sourceKey] =
          context.sources[sourceKey];
      }
    });
  
    return selected;
  }
  
  
  function missingRequiredDomains(
    context,
    contract
  ) {
    return (
      contract.requiredDomains ??
      []
    ).filter(
      domain =>
        !context[domain]?.available
    );
  }
  
  
  export function canRunGuidedQuery(
    action,
    context
  ) {
    const contract =
      GUIDED_QUERIES[action];
  
    if (!contract) {
      return {
        allowed: false,
        reason:
          'Unknown guided query.'
      };
    }
  
  
    const missing =
      missingRequiredDomains(
        context,
        contract
      );
  
    if (missing.length) {
      return {
        allowed: false,
  
        reason:
          `Required evidence unavailable: ${missing.join(', ')}`
      };
    }
  
  
    if (
      contract.requiresSelectedStation &&
      !context.context
        ?.selectedStationId
    ) {
      return {
        allowed: false,
  
        reason:
          'Select a monitoring station first.'
      };
    }
  
  
    return {
      allowed: true,
      reason: null
    };
  }
  
  
  export function buildGuidedQueryPayload(
    action,
    context
  ) {
    const contract =
      GUIDED_QUERIES[action];
  
    if (!contract) {
      throw new Error(
        `Unknown guided query: ${action}`
      );
    }
  
  
    const availability =
      canRunGuidedQuery(
        action,
        context
      );
  
  
    const fullIndex =
      buildEvidenceIndex(
        context
      );
  
  
    const selectedIndex =
      selectEvidenceIndex(
        fullIndex,
        contract.evidencePrefixes
      );
  
  
    return {
      schemaVersion:
        '1.0',
  
      query: {
        id:
          contract.id,
  
        label:
          contract.label,
  
        task:
          contract.task,
  
        allowed:
          availability.allowed,
  
        unavailableReason:
          availability.reason
      },
  
  
      context: {
        page:
          context.context?.page ??
          null,
  
        state:
          context.context?.state ??
          null,
  
        year:
          context.context?.year ??
          null,
  
        selectedStationId:
          context.context
            ?.selectedStationId ??
          null
      },
  
  
      evidence:
        selectDomains(
          context,
          contract.domains
        ),
  
  
      evidenceIndex:
        selectedIndex,
  
  
      evidenceIds:
        Object.keys(
          selectedIndex
        ),
  
  
      limitations:
        domainLimitations(
          context,
          contract.domains
        ),
  
  
      guardrails:
        context.guardrails ?? [],
  
  
      sources:
        selectSources(
          context,
          contract.domains
        ),
  
  
      outputContract: {
        citeEvidenceIds:
          true,
  
        unsupportedClaims:
          'Do not make factual claims that require evidence not contained in this payload.',
  
        uncertainty:
          'State uncertainty and relevant limitations explicitly.',
  
        causalLanguage:
          'Use causal language only when the supplied causal evidence supports it.'
      }
    };
  }