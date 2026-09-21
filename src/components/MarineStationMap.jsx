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
    focusStation,
    onSelect
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
  
        <div className="marine-map-controls">
            <button onClick={zoomIn}>+</button>
            <button onClick={zoomOut}>−</button>

            <span className="zoom-level">
                {position.zoom.toFixed(1)}×
            </span>

            <button onClick={resetMap}>
                Reset
            </button>
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
  
            {stations.map(feature => {
              const station = feature.properties;
  
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
        </div>
  
      </div>
    );
}