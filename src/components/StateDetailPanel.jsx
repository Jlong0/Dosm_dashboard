import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { formatIndicatorChange, formatIndicatorValue, getYoyReport } from '../data/yoyReport';
import StateSentimentPanel from './StateSentimentPanel';

const PILLARS=[['economic','Economic','#ac7845'],['social','Social','#577e9a'],['environmental','Environmental','#397da0']];
const FALLBACK_INDICATORS=[['receiptsPerResidentRm','Tourism receipts per resident','RM'],['avgStayNights','Average length of stay','nights'],['lfprPct','Labour force participation rate','%'],['unemploymentPct','Unemployment rate','%']];
const arrow={up:'▲',down:'▼',flat:'→'};
const asNumber = value => {
    if (
      value == null ||
      value === ''
    ) {
      return null;
    }
  
    const number = Number(value);
  
    return Number.isFinite(number)
      ? number
      : null;
  };
function ReportRows({ rows }) { return <div className="report-rows">{rows.map(row=><article className="report-row" key={row.indicator}><div><strong>{row.indicator}</strong><small>{formatIndicatorValue(row.currentValue,row.unit)}</small></div><span className={`movement ${row.direction}`}>{row.change==null?'—':arrow[row.direction]} {formatIndicatorChange(row.change,row.unit)}</span><span className={`report-status ${row.status.toLowerCase()}`}>{row.status}</span></article>)}</div>; }
function FallbackPillars({ pillars, sourceRow }) { const indicators=FALLBACK_INDICATORS.filter(([key])=>Number.isFinite(sourceRow?.[key])); return <><div className="pillar-grid"><article className="pillar"><div><span>Economic + Social</span><strong>{pillars.value.toFixed(1)}</strong></div><span className="pillar-track" aria-hidden="true"><i style={{width:`${pillars.value}%`,background:'#ac7845'}}/></span></article></div><div className="fallback-indicators"><h3>Underlying raw Economic + Social indicators</h3>{indicators.length?<div className="report-rows">{indicators.map(([key,label,unit])=><article className="report-row" key={key}><div><strong>{label}</strong><small>{formatIndicatorValue(sourceRow[key],unit)}</small></div></article>)}</div>:<div className="empty">No raw Economic + Social indicators are available for this year.</div>}</div></>; }
const signed=value=>Number.isFinite(value)?`${value>0?'+':''}${value.toFixed(1)}`:'N/A';
const patternLabel={
 'Sustainable improvement':'Sustainable Improvement',
 'Growth under environmental stress':'Growth Under Environmental Stress',
 'Overall deterioration':'Overall Deterioration',
 'Environmental recovery, tourism weakness':'Environmental Improvement / Economic Weakness',
};
const patternExplanation={
 'Sustainable improvement':'Economic and environmental conditions both improved compared with the 2017–2019 baseline.',
 'Growth under environmental stress':'Economic conditions improved while environmental conditions deteriorated compared with the 2017–2019 baseline.',
 'Overall deterioration':'Both economic and environmental conditions deteriorated compared with the 2017–2019 baseline.',
 'Environmental recovery, tourism weakness':'Environmental conditions improved while economic conditions weakened compared with the 2017–2019 baseline.',
};
export default function StateDetailPanel({ state, year, pillars, sourceRow, yoyValues, recovery, sentiment, rows }) {
 if (!state) return <section className="panel"><div className="empty">Select at least one state to view its sustainability profile.</div></section>;
 const metrics=[['visitors000',"Domestic visitors ('000)",'#16705b'],['receiptsPerResidentRm','Receipts per resident (RM)','#ac7845'],['coastalGoodExcellentPct','Coastal good + excellent (%)','#397da0']];
 const full=pillars?.status==='full', fallback=pillars?.status==='fallback';
 const report =
  getYoyReport(
    yoyValues,
    state,
    year
  );

const core =
  report.filter(
    item => item.partOfSti
  );

const diagnostics =
  report.filter(
    item => !item.partOfSti
  );

const hasComparison =
  report.some(
    item =>
      Number.isFinite(
        item.change
      )
  );


/*
 * Scheduled Waste
 * Stage 1 diagnostic only.
 */
const scheduledWaste =
  diagnostics.find(
    item =>
      item.indicator ===
      'Scheduled Waste'
  );


const wasteCurrent =
  scheduledWaste?.currentValue;


const wastePrevious =
  Number.isFinite(wasteCurrent) &&
  Number.isFinite(
    scheduledWaste?.change
  )
    ? wasteCurrent -
      scheduledWaste.change
    : null;


/*
 * Percentage change from the
 * previous year.
 */
const wasteYoyPct =
  Number.isFinite(wastePrevious) &&
  wastePrevious !== 0 &&
  Number.isFinite(
    scheduledWaste?.change
  )
    ? (
        scheduledWaste.change /
        wastePrevious
      ) * 100
    : null;


/*
 * Compare the selected state
 * with all states for this year.
 */
const wasteSameYear =
  yoyValues
    .filter(row => {
      const value =
        asNumber(row.value);

      return (
        row.indicator ===
          'Scheduled Waste' &&
        Number(row.Year) ===
          Number(year) &&
        Number.isFinite(value)
      );
    })
    .map(row => ({
      state: row.State,
      value: asNumber(row.value)
    }));


const wasteNationalTotal =
  wasteSameYear.reduce(
    (sum, row) =>
      sum + row.value,
    0
  );


const wasteNationalShare =
  Number.isFinite(wasteCurrent) &&
  wasteNationalTotal > 0
    ? (
        wasteCurrent /
        wasteNationalTotal
      ) * 100
    : null;


/*
 * Rank is descriptive only:
 * rank 1 = largest reported
 * scheduled-waste quantity.
 */
const wasteRankedStates =
  [...wasteSameYear]
    .sort(
      (a, b) =>
        b.value - a.value
    );


const wasteRankIndex =
  wasteRankedStates
    .findIndex(
      row =>
        row.state === state
    );


const wasteRank =
  wasteRankIndex >= 0
    ? wasteRankIndex + 1
    : null;


/*
 * Scheduled-waste historical trend.
 * Uses the same visible year range
 * as the other State-page charts.
 */
const visibleYears =
  new Set(
    rows.map(
      row => Number(row.year)
    )
  );

const scheduledWasteTrend =
  yoyValues
    .filter(row => {
      const value =
        asNumber(row.value);

      return (
        row.State === state &&
        row.indicator ===
          'Scheduled Waste' &&
        visibleYears.has(
          Number(row.Year)
        ) &&
        Number.isFinite(value)
      );
    })
    .map(row => ({
      year:
        Number(row.Year),

      scheduledWaste:
        asNumber(row.value)
    }))
    .sort(
      (a, b) =>
        a.year - b.year
    );
    
 return <section className="panel state-profile"><div className="section-heading"><div><span className="eyebrow">STATE PROFILE</span><h2>{state || 'Select a state'}</h2></div><span className="muted">Pillars: {year} · Trends: {rows[0]?.year ?? 'N/A'}–{rows.at(-1)?.year ?? 'N/A'}</span></div><div className="pillar-heading"><div><span className="eyebrow">SUSTAINABILITY PILLARS</span><h3>{full?`Full STI ${pillars.value.toFixed(1)}`:fallback?`Economic + Social Score ${pillars.value.toFixed(1)}`:'Full STI N/A'}</h3></div><span className="muted">Normalized scores / 100</span></div>{fallback?<FallbackPillars pillars={pillars} sourceRow={sourceRow}/>:<div className="pillar-grid">{PILLARS.map(([key,label,color])=>{const value=pillars?.pillars[key];return <article className="pillar" key={key}><div><span>{label}</span><strong>{Number.isFinite(value)?value.toFixed(1):'N/A'}</strong></div><span className="pillar-track" aria-hidden="true"><i style={{width:Number.isFinite(value)?`${value}%`:'0%',background:color}}/></span></article>;})}</div>}{!full&&<p className="pillar-note">{pillars?.message ?? 'Full STI is unavailable for this state and year.'}{fallback?' The available combined Economic + Social score is not a full STI.':''} Environmental is explicitly unavailable and is not carried forward or estimated.</p>}<section className="report-card"><div className="pillar-heading"><div><span className="eyebrow">YEAR-OVER-YEAR INDICATOR REPORT CARD</span><h3>{year} compared with {year-1}</h3></div><span className="muted">Arrow = raw movement · Status = interpretation</span></div>{hasComparison?<><h3 className="report-group-title">STI indicators</h3><ReportRows rows={core}/><h3 className="report-group-title">
 Additional pressure diagnostics
 <span>
   Diagnostic — not part of STI
 </span>
</h3>

<ReportRows
 rows={diagnostics}
/>

{Number.isFinite(wasteCurrent) && (
  <div className="waste-context">

    <div className="waste-context-heading">

      <div>
        <span className="eyebrow">
          SCHEDULED WASTE CONTEXT
        </span>

        <h4>
          {year} state comparison
        </h4>
      </div>

      <span className="diagnostic-badge">
        Diagnostic
      </span>

    </div>


    <div className="waste-context-grid">

      <div>
        <span>
          YoY change
        </span>

        <strong>
          {Number.isFinite(wasteYoyPct)
            ? `${
                wasteYoyPct > 0
                  ? '+'
                  : ''
              }${wasteYoyPct.toFixed(1)}%`
            : 'N/A'}
        </strong>
      </div>


      <div>
        <span>
          Share of Malaysia
        </span>

        <strong>
          {Number.isFinite(
            wasteNationalShare
          )
            ? `${wasteNationalShare.toFixed(1)}%`
            : 'N/A'}
        </strong>
      </div>


      <div>
        <span>
          Quantity rank
        </span>

        <strong>
          {Number.isFinite(wasteRank)
            ? `${wasteRank} / ${wasteRankedStates.length}`
            : 'N/A'}
        </strong>
      </div>

    </div>


    <p className="waste-context-note">
      Scheduled waste represents
      state-level industrial environmental
      pressure. It is shown as contextual
      evidence only and is not currently
      included in the STI or attributed
      directly to tourism activity.
    </p>

  </div>
)}</>:<div className="empty">Year-over-year comparison is unavailable for this year.</div>}</section><div className="insight-grid"><article className="insight-card change-diagnosis"><span className="eyebrow">SUSTAINABILITY CHANGE PATTERN</span><h3>{recovery?.quadrant ? patternLabel[recovery.quadrant] : 'N/A'}</h3>{recovery?.quadrant?<><p className="change-direction">Economic <strong>{recovery.deltaEconomic>=0?'↑':'↓'} {signed(recovery.deltaEconomic)}</strong> · Environmental <strong>{recovery.deltaEnvironmental>=0?'↑':'↓'} {signed(recovery.deltaEnvironmental)}</strong></p><p>{patternExplanation[recovery.quadrant]}</p></>:<p>Insufficient full-STI data for the comparison.</p>}<small>Change = 2022–2024 average minus 2017–2019 average</small></article><article className="insight-card"><span className="eyebrow">STI STABILITY</span><h3>{Number.isFinite(recovery?.stability)?`${recovery.stability.toFixed(1)} / 100`:'N/A'}</h3><p>{Number.isFinite(recovery?.stability)?'Higher means less rank movement when one indicator is removed.':'Not calculated because full STI is unavailable.'}</p><small>State-level leave-one-out sensitivity · 2017–2024 panel</small></article></div><div className="trend-section-heading"><span className="eyebrow">HISTORICAL TRENDS</span><h3>How has {state || 'this state'} changed over time?</h3><p>Track tourism demand, economic value, coastal conditions and broader environmental pressure{state ? ` for ${state}` : ''}.</p></div><div className="detail-charts">

{metrics.map(
  ([key, title, color]) => (
    <div key={key}>

      <h3>
        {title}
      </h3>

      {rows.some(
        r => r[key] != null
      ) ? (

        <ResponsiveContainer
          width="100%"
          height={205}
        >

          <LineChart
            data={rows}
            margin={{
              top: 15,
              right: 10,
              left: 0,
              bottom: 0
            }}
          >

            <CartesianGrid
              vertical={false}
              stroke="#edf0ec"
            />

            <XAxis
              dataKey="year"
              tick={{
                fontSize: 11
              }}
            />

            <YAxis
              width={52}
              tick={{
                fontSize: 10
              }}
              domain={
                key ===
                'coastalGoodExcellentPct'
                  ? [0, 100]
                  : [
                      'auto',
                      'auto'
                    ]
              }
            />

            <Tooltip
              formatter={v =>
                Number(v)
                  .toLocaleString(
                    'en-MY',
                    {
                      maximumFractionDigits: 2
                    }
                  )
              }
            />

            <Line
              type="linear"
              dataKey={key}
              name={title}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 2 }}
              connectNulls={false}
              isAnimationActive={false}
            />

          </LineChart>

        </ResponsiveContainer>

      ) : (

        <div className="empty">
          No observations for this period.
        </div>

      )}

    </div>
  )
)}


{/* Scheduled Waste diagnostic trend */}
<div className="waste-trend-chart">

  <h3>
    Scheduled waste (tonnes)
  </h3>

  {scheduledWasteTrend.length > 0 ? (

    <ResponsiveContainer
      width="100%"
      height={205}
    >

      <LineChart
        data={scheduledWasteTrend}
        margin={{
          top: 15,
          right: 10,
          left: 5,
          bottom: 0
        }}
      >

        <CartesianGrid
          vertical={false}
          stroke="#edf0ec"
        />

        <XAxis
          dataKey="year"
          tick={{
            fontSize: 11
          }}
        />

        <YAxis
          width={65}
          tick={{
            fontSize: 10
          }}
          tickFormatter={value => {
            if (value >= 1_000_000) {
              return `${
                (
                  value /
                  1_000_000
                ).toFixed(1)
              }M`;
            }

            if (value >= 1000) {
              return `${
                (
                  value /
                  1000
                ).toFixed(0)
              }k`;
            }

            return value;
          }}
        />

        <Tooltip
          formatter={value => [
            `${Number(value)
              .toLocaleString(
                'en-MY',
                {
                  maximumFractionDigits: 1
                }
              )} tonnes`,
            'Scheduled waste'
          ]}
        />

        <Line
          type="linear"
          dataKey="scheduledWaste"
          name="Scheduled waste"
          stroke="#7b6f5d"
          strokeWidth={2}
          dot={{ r: 2 }}
          connectNulls={false}
          isAnimationActive={false}
        />

      </LineChart>

    </ResponsiveContainer>

  ) : (

    <div className="empty">
      No scheduled-waste observations
      for this period.
    </div>

  )}

</div>

</div><StateSentimentPanel state={state} pillars={pillars} destinationRows={sentiment.destinationDimensions} aspects={sentiment.aspects} quarterly={sentiment.quarterly}/></section>;
}
