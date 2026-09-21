function getAlertLevel(station) {
    const p = station.properties;
  
    if (
      p.LATEST_CLASS === 'Poor' ||
      p.CHANGE_5Y <= -10
    ) {
      return 'High';
    }
  
    if (
      (
        p.LATEST_CLASS === 'Moderate' &&
        p.TREND_DIRECTION === 'Declining'
      ) ||
      p.CHANGE_5Y <= -5
    ) {
      return 'Medium';
    }
  
    if (p.TREND_DIRECTION === 'Declining') {
      return 'Watch';
    }
  
    return 'Normal';
  }
  
  function getReason(station) {
    const p = station.properties;
  
    if (p.LATEST_CLASS === 'Poor') {
      return 'Current water quality is classified as Poor and requires attention.';
    }
  
    if (p.CHANGE_5Y <= -10) {
      return 'Strong deterioration detected over the recent 5-year period.';
    }
  
    if (
      p.LATEST_CLASS === 'Moderate' &&
      p.TREND_DIRECTION === 'Declining'
    ) {
      return 'Moderate current condition with a continuing downward trend.';
    }
  
    return 'Recent MWQI trend indicates deterioration.';
  }
  
  export default function StationAlertPanel({
    stations,
    onSelect
  }) {
    const priority = stations
      .map(station => ({
        ...station,
        alertLevel: getAlertLevel(station)
      }))
      .filter(
        station =>
          station.alertLevel !== 'Normal'
      )
      .sort((a, b) => {
        const priorityOrder = {
          High: 0,
          Medium: 1,
          Watch: 2
        };
  
        const levelDifference =
          priorityOrder[a.alertLevel] -
          priorityOrder[b.alertLevel];
  
        if (levelDifference !== 0) {
          return levelDifference;
        }
  
        return (
          a.properties.CHANGE_5Y -
          b.properties.CHANGE_5Y
        );
      });
  
    return (
        <div className="marine-alert-list">

        {priority.slice(0, 10).map(station => {
          const p = station.properties;
      
          return (
            <button
              key={p.STATION_ID}
              className="marine-alert-card"
              onClick={() => onSelect(p)}
            >
      
              <div className="alert-card-top">
      
                <span
                  className={`alert-level ${station.alertLevel.toLowerCase()}`}
                >
                  {station.alertLevel}
                </span>
      
                <span className="alert-card-mwqi">
                  MWQI {Number(p.LATEST_MWQI).toFixed(1)}
                </span>
      
              </div>
      
              <div className="alert-card-title">
                {p.STATION_LOCATION}
              </div>
      
              <div className="alert-card-meta">
                {p.STATION_ID}
                <span>·</span>
                {p.STATE_NAME}
                <span>·</span>
                {p.CATEGORY}
              </div>
      
              <div className="alert-card-details">
      
                <div>
                  <span className="alert-detail-label">
                    Condition
                  </span>
      
                  <strong>
                    {p.LATEST_CLASS}
                  </strong>
                </div>
      
                <div>
                  <span className="alert-detail-label">
                    5-year change
                  </span>
      
                  <strong>
                    {p.CHANGE_5Y > 0 ? '+' : ''}
                    {Number(p.CHANGE_5Y).toFixed(1)}
                  </strong>
                </div>
      
                <div>
                  <span className="alert-detail-label">
                    Trend
                  </span>
      
                  <strong>
                    {p.TREND_DIRECTION}
                  </strong>
                </div>
      
              </div>
      
              <div className="alert-card-reason">
                {getReason(station)}
              </div>
      
            </button>
          );
        })}
      
      </div>
    );
  }