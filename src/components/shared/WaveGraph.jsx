import { THRESHOLDS, STATUS } from '../../services/apiService';
import '../../css/components/WaveGraph.css';

// Time labels along the bottom (every 15 minutes)
const TIMES = ['9:04 PM', '9:19 PM', '9:34 PM', '9:49 PM', '10:04 PM', '10:19 PM', '10:34 PM', '10:49 PM', '11:04 PM'];

// Colored stripes behind the graph, highest level (top) to lowest.
// The color of each one is in WaveGraph.css (.wave-graph__band--l7 ...)
const BANDS = ['l7', 'l6', 'l5', 'l4', 'l3', 'l2', 'l1'];

// Index 6 (10:34 PM) is highlighted yellow, the last one green.
const timeClass = (i) =>
  i === 6 ? 'wave-graph__time--now' : i === TIMES.length - 1 ? 'wave-graph__time--end' : '';

// Props:
//   scenario  → the current SCENARIOS entry (path, water level, etc.)
//   statusKey → 'safe' | 'monitor' | 'warning' | 'danger' | 'evacuate' (colors are in tokens.css)
//   timestamp → the "LIVE UPDATE AS OF..." text
export default function WaveGraph({ scenario, statusKey, timestamp }) {
  // Which threshold are we currently at? (used by the tooltip)
  const current = THRESHOLDS[scenario.level - 1];

  // Level 7 should be at the TOP, so we reverse a copy of the list.
  const gridLines = [...THRESHOLDS].reverse();

  // The filled area under the line
  const areaPath = `M 0 300 ${scenario.path.replace('M', 'L')} L 800 300 Z`;

  return (
    <div className="wave-graph" data-status={statusKey}>

      {/* ---------- Header: title + live timestamp ---------- */}
      <div className="wave-graph__header">
        <div className="wave-graph__heading">
          <span className="wave-graph__heading-dot"></span>
          <h3 className="wave-graph__title">FLOOD LEVEL WAVE GRAPH</h3>
        </div>
        <div className="wave-graph__live">
          <span className="wave-graph__live-dot anim-ping"></span>
          <span>{timestamp}</span>
        </div>
      </div>

      {/* ---------- Dark graph box ---------- */}
      <div className="wave-graph__box">

        {/* Layer 1: faint photo (image is set in WaveGraph.css) */}
        <div className="wave-graph__layer wave-graph__photo" />

        {/* Layer 2: colored level stripes */}
        <div className="wave-graph__layer wave-graph__bands">
          {BANDS.map((band) => (
            <div key={band} className={`wave-graph__band--${band}`}></div>
          ))}
        </div>

        {/* Layer 3: person + car silhouettes so people can judge the depth */}
        <div className="wave-graph__layer wave-graph__figures">
          <div className="wave-graph__figure wave-graph__figure--person">
            <svg className="wave-graph__figure-svg" viewBox="0 0 100 220">
              <circle cx="50" cy="25" r="18" />
              <path d="M 30 50 C 30 45, 70 45, 70 50 L 75 120 L 62 120 L 62 215 L 52 215 L 52 140 L 48 140 L 48 215 L 38 215 L 38 120 L 25 120 Z" />
            </svg>
            <span className="wave-graph__caption">Human Scale</span>
          </div>
          <div className="wave-graph__figure wave-graph__figure--car">
            <svg className="wave-graph__figure-svg" viewBox="0 0 240 100">
              <path d="M 10 60 L 30 60 L 50 30 L 160 30 L 190 60 L 230 60 C 235 60, 240 65, 240 70 L 240 85 L 220 85 C 220 75, 195 75, 195 85 L 75 85 C 75 75, 50 75, 50 85 L 10 85 Z" />
              <circle cx="62" cy="85" r="12" fill="#000" />
              <circle cx="207" cy="85" r="12" fill="#000" />
            </svg>
            <span className="wave-graph__caption">Vehicle Scale</span>
          </div>
        </div>

        {/* Layer 4: the 7 dashed threshold lines (Level 7 at top).
            data-status gives each line its own color; data-active brightens the current level. */}
        <div className="wave-graph__layer wave-graph__rows">
          {gridLines.map((t) => (
            <div
              key={t.level}
              className="wave-graph__row"
              data-status={t.status}
              data-active={t.level === scenario.level}
            >
              <span className="wave-graph__tag">
                L{t.level}: {t.name} ({t.cm.toFixed(1)}cm)
              </span>
              <span className="wave-graph__tag wave-graph__tag--status">{STATUS[t.status].label}</span>
            </div>
          ))}
        </div>

        {/* Layer 5: the water curve + tooltip */}
        <div className="wave-graph__water">
          <svg className="wave-graph__svg" viewBox="0 0 800 300" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" className="wave-graph__stop-top" />
                <stop offset="100%" className="wave-graph__stop-bottom" />
              </linearGradient>
            </defs>

            {/* Filled water area */}
            <path d={areaPath} fill="url(#waterGrad)" />

            {/* The glowing line itself */}
            <path d={scenario.path} className="wave-graph__line" />

            {/* Vertical guide + pulsing dot at x = 600 */}
            <g transform={`translate(600, ${scenario.pointY})`}>
              <line x1="0" y1="-160" x2="0" y2="140" className="wave-graph__guide" />
              <circle r="7" className="wave-graph__dot" />
            </g>
          </svg>

          {/* Tooltip. Only 'top' stays inline because it comes from the data. */}
          <div className="wave-graph__tooltip" style={{ top: scenario.tooltipTop }}>
            <div className="wave-graph__tip-time">10:34 PM</div>
            <div className="wave-graph__tip-row">
              <span className="wave-graph__tip-value">{scenario.waterLevelCm.toFixed(2)}</span>
              <span className="wave-graph__tip-unit">cm</span>
            </div>
            <div className="wave-graph__tip-level">
              Level {current.level}: {current.name}
            </div>
          </div>
        </div>

        {/* Time labels */}
        <div className="wave-graph__times">
          {TIMES.map((time, i) => (
            <span key={time} className={timeClass(i)}>{time}</span>
          ))}
        </div>
      </div>
    </div>
  );
}