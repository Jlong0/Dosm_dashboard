import { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';

import MarineStationMap from './MarineStationMap';
import StationTrendChart from './StationTrendChart';
import StationAlertPanel from './StationAlertPanel';

export default function MQIMS({ geography }) {
  const [stations, setStations] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [sideTab, setSideTab] = useState('alerts');

  const [stateFilter, setStateFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');
  const [trendFilter, setTrendFilter] = useState('All');

  useEffect(() => {
    fetch(
        `${import.meta.env.BASE_URL}data/mqims/station_dashboard_summary.geojson`
    )
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to load MQIMS data');
        }

        return res.json();
      })
      .then(setStations)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(
      `${import.meta.env.BASE_URL}data/mqims/mwqi_history_with_coords.csv`
    )
      .then(response => {
        if (!response.ok) {
          throw new Error(
            'Failed to load historical MWQI data'
          );
        }
  
        return response.text();
      })
      .then(csv => {
        const parsed = Papa.parse(csv, {
          header: true,
          skipEmptyLines: true
        });
  
        const cleaned = parsed.data
          .map(row => ({
            STATION_ID: row.STATION_ID,
            YEAR: Number(row.YEAR),
            MWQI: Number(row.MWQI),
            MWQI_RANGE: row.MWQI_RANGE
          }))
          .filter(
            row =>
              row.STATION_ID &&
              Number.isFinite(row.YEAR) &&
              Number.isFinite(row.MWQI)
          );
  
        setHistory(cleaned);
      })
      .catch(error => {
        console.error(
          'MWQI history error:',
          error
        );
      });
  }, []);

  const filteredStations = useMemo(() => {
    if (!stations) return [];
  
    return stations.features.filter(feature => {
      const station = feature.properties;
  
      const matchesState =
        stateFilter === 'All' ||
        station.STATE_NAME === stateFilter;
  
      const matchesCategory =
        categoryFilter === 'All' ||
        station.CATEGORY === categoryFilter;
  
      const matchesClass =
        classFilter === 'All' ||
        station.LATEST_CLASS === classFilter;
  
      const matchesTrend =
        trendFilter === 'All' ||
        station.TREND_DIRECTION === trendFilter;
  
      return (
        matchesState &&
        matchesCategory &&
        matchesClass &&
        matchesTrend
      );
    });
  }, [
    stations,
    stateFilter,
    categoryFilter,
    classFilter,
    trendFilter
  ]);

  const summary = useMemo(() => {
    const features = filteredStations;
  
    return {
      total: features.length,
  
      poor: features.filter(
        feature =>
          feature.properties.LATEST_CLASS === 'Poor'
      ).length,
  
      moderate: features.filter(
        feature =>
          feature.properties.LATEST_CLASS === 'Moderate'
      ).length,
  
      declining: features.filter(
        feature =>
          feature.properties.TREND_DIRECTION === 'Declining'
      ).length
    };
  }, [filteredStations]);

  const selectedHistory = useMemo(() => {
    if (!selectedStation) {
      return [];
    }
  
    return history
      .filter(
        row =>
          row.STATION_ID ===
          selectedStation.STATION_ID
      )
      .sort(
        (a, b) =>
          a.YEAR - b.YEAR
      );
  }, [
    history,
    selectedStation
  ]);

  const availableStates = useMemo(() => {
    if (!stations) return [];
  
    return [
      ...new Set(
        stations.features
          .map(feature => feature.properties.STATE_NAME)
          .filter(Boolean)
      )
    ].sort();
  }, [stations]);

  if (!stations || !summary) {
    return (
      <section className="panel">
        <p className="muted">
          Loading MQIMS data...
        </p>
      </section>
    );
  }

  function formatChange(value) {
    if (!Number.isFinite(value)) return 'N/A';
  
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}`;
  }

  function handleStationSelect(station) {
    setSelectedStation(station);
    setSideTab('station');
  }

  return (
    <section className="panel">

      <div className="section-heading">
        <div>
          <span className="eyebrow">
            MARINE WATER QUALITY
          </span>

          <h2>
            MQIMS Malaysia
          </h2>
        </div>

        <span className="badge">
          {summary.total} stations
        </span>
      </div>

      <p className="muted">
        Marine water-quality monitoring across Malaysia,
        highlighting current condition and recent MWQI trends.
      </p>

      <div className="marine-summary-grid">

        <article className="marine-stat">
          <span className="eyebrow">
            Monitoring stations
          </span>

          <strong>
            {summary.total}
          </strong>
        </article>

        <article className="marine-stat">
          <span className="eyebrow">
            Poor
          </span>

          <strong>
            {summary.poor}
          </strong>
        </article>

        <article className="marine-stat">
          <span className="eyebrow">
            Moderate
          </span>

          <strong>
            {summary.moderate}
          </strong>
        </article>

        <article className="marine-stat">
          <span className="eyebrow">
            Declining trend
          </span>

          <strong>
            {summary.declining}
          </strong>
        </article>

      </div>

      <div className="marine-filters">

        <label>
            <span>State</span>

            <select
            value={stateFilter}
            onChange={event =>
                setStateFilter(event.target.value)
            }
            >
            <option value="All">
                All states
            </option>

            {availableStates.map(state => (
                <option
                key={state}
                value={state}
                >
                {state}
                </option>
            ))}
            </select>
        </label>

        <label>
            <span>Category</span>

            <select
            value={categoryFilter}
            onChange={event =>
                setCategoryFilter(event.target.value)
            }
            >
            <option value="All">All categories</option>
            <option value="Coastal">Coastal</option>
            <option value="Estuary">Estuary</option>
            <option value="Island">Island</option>
            </select>
        </label>

        <label>
            <span>MWQI class</span>

            <select
            value={classFilter}
            onChange={event =>
                setClassFilter(event.target.value)
            }
            >
            <option value="All">All classes</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Moderate">Moderate</option>
            <option value="Poor">Poor</option>
            </select>
        </label>

        <label>
            <span>Trend</span>

            <select
            value={trendFilter}
            onChange={event =>
                setTrendFilter(event.target.value)
            }
            >
            <option value="All">All trends</option>
            <option value="Improving">Improving</option>
            <option value="Stable">Stable</option>
            <option value="Declining">Declining</option>
            </select>
        </label>

        <button
            className="reset marine-filter-reset"
            onClick={() => {
            setStateFilter('All');
            setCategoryFilter('All');
            setClassFilter('All');
            setTrendFilter('All');
            setSelectedStation(null);
            setSideTab('alerts');
            }}
        >
            Reset filters ↺
        </button>

        </div>

      <div className="marine-explorer">

        <div className="marine-map-column">
            <MarineStationMap
            geography={geography}
            stations={filteredStations}
            allStations={stations.features}
            selectedStation={selectedStation}
            focusStation={selectedStation}
            onSelect={handleStationSelect}
            />
        </div>

        <aside
        className={`marine-station-panel ${
            selectedStation ? 'has-selection' : ''
        }`}
        aria-live="polite"
        >

        <div className="marine-side-tabs">

            <button
            className={sideTab === 'station' ? 'active' : ''}
            onClick={() => setSideTab('station')}
            >
            Station details
            </button>

            <button
            className={sideTab === 'alerts' ? 'active' : ''}
            onClick={() => setSideTab('alerts')}
            >
            Priority alerts
            </button>

        </div>


        {sideTab === 'alerts' && (
            <StationAlertPanel
            stations={filteredStations}
            onSelect={handleStationSelect}
            />
        )}


        {sideTab === 'station' && (
            <>
            {!selectedStation ? (

                <div className="station-empty">

                <span className="eyebrow">
                    STATION EXPLORER
                </span>

                <h3>
                    Select a monitoring station
                </h3>

                <p className="muted">
                    Click any point on the map to inspect its
                    latest MWQI condition and historical trend.
                </p>

                </div>

            ) : (

                <div
                key={selectedStation.STATION_ID}
                className="station-detail-content"
                >

                <span className="eyebrow">
                    SELECTED STATION
                </span>

                <h3>
                    {selectedStation.STATION_LOCATION}
                </h3>

                <p className="station-code">
                    {selectedStation.STATION_ID}
                </p>

                <div className="station-meta">
                    <span>
                    {selectedStation.STATE_NAME}
                    </span>

                    <span>·</span>

                    <span>
                    {selectedStation.CATEGORY}
                    </span>
                </div>


                <div className="station-mwqi">

                    <span>
                    Latest MWQI
                    </span>

                    <strong>
                    {selectedStation.LATEST_MWQI?.toFixed(1)}
                    </strong>

                    <span
                    className={`mwqi-status ${
                        selectedStation.LATEST_CLASS?.toLowerCase()
                    }`}
                    >
                    {selectedStation.LATEST_CLASS}
                    </span>

                </div>


                <StationTrendChart
                    rows={selectedHistory}
                />


                <dl className="station-metrics">

                    <div>
                    <dt>1-year change</dt>

                    <dd>
                        {formatChange(
                        selectedStation.CHANGE_1Y
                        )}
                    </dd>
                    </div>


                    <div>
                    <dt>5-year change</dt>

                    <dd>
                        {formatChange(
                        selectedStation.CHANGE_5Y
                        )}
                    </dd>
                    </div>


                    <div>
                    <dt>Trend</dt>

                    <dd>
                        {selectedStation.TREND_DIRECTION}
                    </dd>
                    </div>


                    <div>
                    <dt>Trend slope</dt>

                    <dd>
                        {selectedStation.TREND_SLOPE_5Y?.toFixed(2)}
                        {' '}pts/year
                    </dd>
                    </div>

                </dl>

                </div>

            )}
            </>
        )}

        </aside>

        </div>

    </section>
  );
}