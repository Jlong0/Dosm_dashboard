import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
  } from 'recharts';
  
  export default function StationTrendChart({ rows }) {
    if (!rows?.length) {
      return (
        <div className="empty station-chart-empty">
          Historical MWQI data unavailable for this station.
        </div>
      );
    }
  
    return (
      <div className="station-trend">
  
        <div className="station-trend-heading">
          <div>
            <span className="eyebrow">
              MWQI HISTORY
            </span>
  
            <h3>Water quality over time</h3>
          </div>
  
          <span className="badge">
            {rows[0].YEAR}–{rows[rows.length - 1].YEAR}
          </span>
        </div>
  
        <ResponsiveContainer width="100%" height={230}>
          <LineChart
            data={rows}
            margin={{
              top: 10,
              right: 10,
              bottom: 0,
              left: -20
            }}
          >
  
            <CartesianGrid
              vertical={false}
              stroke="#edf0ec"
            />
  
            <XAxis
              dataKey="YEAR"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
  
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
  
            <Tooltip
              formatter={value => [
                Number(value).toFixed(1),
                'MWQI'
              ]}
              labelFormatter={year => `Year ${year}`}
            />
  
            {/* MWQI classification boundaries */}
  
            <ReferenceLine
              y={50}
              stroke="#c76451"
              strokeDasharray="4 4"
            />
  
            <ReferenceLine
              y={80}
              stroke="#d3ad49"
              strokeDasharray="4 4"
            />
  
            <ReferenceLine
              y={90}
              stroke="#74a58f"
              strokeDasharray="4 4"
            />
  
            <Line
              type="linear"
              dataKey="MWQI"
              stroke="#16705b"
              strokeWidth={2.5}
              dot={{
                r: 3,
                strokeWidth: 1
              }}
              activeDot={{
                r: 5
              }}
              connectNulls={false}
              isAnimationActive={false}
            />
  
          </LineChart>
        </ResponsiveContainer>
  
        <div className="mwqi-threshold-note">
          <span>Poor &lt; 50</span>
          <span>Moderate 50–79.9</span>
          <span>Good 80–89.9</span>
          <span>Excellent ≥ 90</span>
        </div>
  
      </div>
    );
  }