import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
    ZoomableGroup
} from 'react-simple-maps';

import { useEffect, useState } from 'react';
  
function colorForClass(value) {
    switch (value) {
      case 'Excellent':
        return '#16705b';
      case 'Good':
        return '#74a58f';
      case 'Moderate':
        return '#e4c675';
      case 'Poor':
        return '#c76451';
      default:
        return '#9ca3af';
    }
  }
  
  export default function MarineStationMap({
    geography,
    stations,
    allStations,
    selectedStation,
    selectedMpa,
    mpas = [],
    showMpas,
    onToggleMpas,
    focusStation,
    onSelect,
    onMpaSelect
  }) {
    const [position, setPosition] = useState({
      coordinates: [109.5, 4.1],
      zoom: 1
    });

    useEffect(() => {
        if (!focusStation) return;
      
        const feature = allStations.find(
          item =>
            item.properties.STATION_ID ===
            focusStation.STATION_ID
        );
      
        if (!feature) return;
      
        const [longitude, latitude] =
          feature.geometry.coordinates;
      
        setPosition({
          coordinates: [longitude, latitude],
          zoom: 12
        });
      }, [focusStation]);
  
    function handleMoveEnd(newPosition) {
      setPosition(newPosition);
    }
  
    function zoomIn() {
        setPosition(prev => ({
          ...prev,
          zoom: Math.min(prev.zoom * 2, 32)
        }));
    }
      
      function zoomOut() {
        setPosition(prev => ({
          ...prev,
          zoom: Math.max(prev.zoom / 2, 1)
        }));
    }
  
    function resetMap() {
      setPosition({
        coordinates: [109.5, 4.1],
        zoom: 1
      });
    }
  
    return (
      <div className="map-wrap marine-map-wrap">

        <div className="marine-map-toolbar">

            <button
                type="button"
                className={`map-layer-button ${
                showMpas ? 'active' : ''
                }`}
                onClick={() => onToggleMpas(!showMpas)}
            >
                <span className="map-layer-diamond" />
                MPAs
            </button>

            <div className="marine-map-controls">
                <button onClick={zoomIn}>+</button>
                <button onClick={zoomOut}>−</button>
                <span className="zoom-level">
                    {position.zoom.toFixed(1)}×
                </span>
                <button onClick={resetMap}>Reset</button>
            </div>

        </div>
  
        <ComposableMap
          width={800}
          height={400}
          projection="geoMercator"
          projectionConfig={{
            center: [109.5, 4.1],
            scale: 2450
          }}
          aria-label="Malaysia marine water quality monitoring stations"
        >
  
            <ZoomableGroup
                center={position.coordinates}
                zoom={position.zoom}
                minZoom={1}
                maxZoom={32}
                onMoveEnd={handleMoveEnd}
            >
  
            <Geographies geography={geography}>
              {({ geographies }) =>
                geographies.map(geo => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#bdc0bc"
                    stroke="#ffffff"
                    strokeWidth={0.7 / position.zoom}
                    style={{
                      default: {
                        outline: 'none'
                      },
                      hover: {
                        outline: 'none',
                        fill: '#e0e7e4'
                      },
                      pressed: {
                        outline: 'none'
                      }
                    }}
                  />
                ))
              }
            </Geographies>

            {showMpas && mpas.map(feature => {
                const mpa = feature.properties;

                const [longitude, latitude] =
                    feature.geometry.coordinates;

                const selected =
                    selectedMpa?.MPA_ID === mpa.MPA_ID;

                const size =
                    (selected ? 13 : 9) / position.zoom;

                return (
                    <Marker
                    key={`mpa-${mpa.MPA_ID}`}
                    coordinates={[
                        longitude,
                        latitude
                    ]}
                    >

                    {selected && (
                        <rect
                        x={-9 / position.zoom}
                        y={-9 / position.zoom}
                        width={18 / position.zoom}
                        height={18 / position.zoom}
                        fill="none"
                        stroke="#1f3f67"
                        strokeWidth={1.5 / position.zoom}
                        transform="rotate(45)"
                        pointerEvents="none"
                        />
                    )}

                    <rect
                        x={-size / 2}
                        y={-size / 2}
                        width={size}
                        height={size}
                        fill="#365f8d"
                        stroke="#ffffff"
                        strokeWidth={0.8 / position.zoom}
                        transform="rotate(45)"
                        style={{
                        cursor: 'pointer'
                        }}
                        onClick={() => {
                        onMpaSelect(mpa);

                        setPosition({
                            coordinates: [
                            longitude,
                            latitude
                            ],
                            zoom: Math.max(
                            position.zoom,
                            10
                            )
                        });
                        }}
                    >
                        <title>
                        {`${mpa.MPA_Name}
                ${mpa.State}
                ${mpa.Designation}`}
                        </title>
                    </rect>

                    </Marker>
                );
            })}
  
            {stations.map(feature => {
              const station = feature.properties;
              const priority = feature.priority;
  
              const [longitude, latitude] =
                feature.geometry.coordinates;
  
              const selected =
                selectedStation?.STATION_ID ===
                station.STATION_ID;
  
              /*
               * Divide radius by zoom so markers don't
               * become enormous when zooming in.
               */
              const radius = (selected ? 8 : 5) / position.zoom;
  
              return (
                <Marker
                  key={station.STATION_ID}
                  coordinates={[
                    longitude,
                    latitude
                  ]}
                >

                    {priority.level === 1 && (
                    <circle
                        r={10 / position.zoom}
                        fill="none"
                        stroke="#7c2f25"
                        strokeWidth={2 / position.zoom}
                        pointerEvents="none"
                    />
                    )}

                  <circle
                    r={radius}
                    fill={colorForClass(
                      station.LATEST_CLASS
                    )}
                    fillOpacity={selected ? 1 : 0.8}
                    stroke="#ffffff"
                    strokeWidth={
                        0.8 / position.zoom
                    }
                    onClick={() => {
                        onSelect(station);
                      
                        setPosition({
                          coordinates: [longitude, latitude],
                          zoom: Math.max(position.zoom, 10)
                        });
                    }}
                    style={{
                      cursor: 'pointer'
                    }}
                  >
  
                    <title>
                        {`${station.STATION_ID}
                            ${station.STATION_LOCATION}
                            ${station.STATE_NAME}
                            MWQI: ${station.LATEST_MWQI}
                            Class: ${station.LATEST_CLASS}
                            Trend: ${station.TREND_DIRECTION}
                        `}
                    </title>
  
                  </circle>
                </Marker>
              );
            })}
  
          </ZoomableGroup>
  
        </ComposableMap>
  
        <div className="marine-map-legend">
          <span>
            <i className="excellent" />
            Excellent
          </span>
  
          <span>
            <i className="good" />
            Good
          </span>
  
          <span>
            <i className="moderate" />
            Moderate
          </span>
  
          <span>
            <i className="poor" />
            Poor
          </span>
          {showMpas && (
            <span className="mpa-legend-item">
                <i className="mpa-symbol" />
                Protected area
            </span>
          )}
        </div>
  
      </div>
    );
}