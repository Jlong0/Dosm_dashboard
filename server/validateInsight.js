export function validateInsight(
    result,
    allowedEvidenceIds = []
  ) {
    if (
      !result ||
      typeof result !== 'object'
    ) {
      throw new Error(
        'Model returned an invalid result.'
      );
    }
  
  
    if (
      typeof result.title !== 'string' ||
      !result.title.trim()
    ) {
      throw new Error(
        'Model response is missing a title.'
      );
    }
  
  
    if (
      typeof result.summary !== 'string' ||
      !result.summary.trim()
    ) {
      throw new Error(
        'Model response is missing a summary.'
      );
    }
  
  
    if (
      !Array.isArray(
        result.findings
      )
    ) {
      throw new Error(
        'Model response findings must be an array.'
      );
    }
  
  
    const allowed =
      new Set(
        allowedEvidenceIds
      );
  
  
    const findings =
      result.findings
        .filter(
          finding =>
            finding &&
            typeof finding.text ===
              'string'
        )
        .map(finding => {
    
          const evidenceIds =
            Array.isArray(
              finding.evidenceIds
            )
              ? finding.evidenceIds
              : [];
    
          const validEvidenceIds =
            evidenceIds.filter(
              id => allowed.has(id)
            );
    
          return {
            text:
              finding.text.trim(),
    
            evidenceIds:
              validEvidenceIds
          };
        })
        .filter(
          finding =>
            finding.evidenceIds.length > 0
        );
  
  
    const limitations =
      Array.isArray(
        result.limitations
      )
        ? result.limitations
            .filter(
              value =>
                typeof value ===
                'string'
            )
            .map(
              value =>
                value.trim()
            )
            .filter(Boolean)
        : [];
  
  
    return {
      title:
        result.title.trim(),
  
      summary:
        result.summary.trim(),
  
      findings,
  
      limitations
    };
  }