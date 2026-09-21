import {
    getPriorityReasons,
    rankMonitoringStations
  } from '../data/mqims';
  
  import {
    canonicalState
  } from '../data/stateNames';
  
  export default function StationAlertPanel({
    stations,
    onSelect
  }) {
    const priority = rankMonitoringStations(
        stations
      ).filter(
        station =>
          station.priority.level < 4
      );
  
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
                    className={`alert-level ${
                        station.priority.level === 1
                        ? 'high'
                        : station.priority.level === 2
                            ? 'medium'
                            : 'watch'
                    }`}
                    >
                    {station.priority.label}
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
                {canonicalState(
                    p.STATE_NAME
                )}
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
                {getPriorityReasons(station)
                    .join(' · ')}
              </div>
      
            </button>
          );
        })}
      
      </div>
    );
  }