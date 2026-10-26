import React from 'react';
import { THRESHOLDS, STATUS } from '../../services/apiService';
import '../../css/components/WaveGraph.css';

const BANDS = ['l7', 'l6', 'l5', 'l4', 'l3', 'l2', 'l1'];

// 🕒 Dynamically generate 9 timestamps spaced 15 mins apart with Index 6 as NOW
const getRealtimeTimestamps = () => {
  const now = new Date();
  return Array.from({ length: 9 }, (_, i) => {
    const offsetMinutes = (i - 6) * 15; // -90m, -75m, -60m, -45m, -30m, -15m, NOW (+0m), +15m, +30m
    const pointTime = new Date(now.getTime() + offsetMinutes * 60000);
    return pointTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  });
};

const timeClass = (i, totalLength) =>
  i === 6 ? 'wave-graph__time--now' : i === totalLength - 1 ? 'wave-graph__time--end' : '';

export default function WaveGraph({ scenario, statusKey, timestamp }) {
  if (!scenario) {
    return (
      <div className="wave-graph wave-graph--loading">
        <p>Receiving telemetry stream...</p>
      </div>
    );
  }

  const times = getRealtimeTimestamps();
  const current = THRESHOLDS[scenario.level - 1] || THRESHOLDS[0];
  const gridLines = [...THRESHOLDS].reverse();
  const areaPath = `M 0 300 ${scenario.path.replace('M', 'L')} L 800 300 Z`;

  return (
    <div className="wave-graph" data-status={statusKey}>

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

      <div className="wave-graph__box">
        <div className="wave-graph__layer wave-graph__photo" />

        <div className="wave-graph__layer wave-graph__bands">
          {BANDS.map((band) => (
            <div key={band} className={`wave-graph__band--${band}`}></div>
          ))}
        </div>

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
              <span className="wave-graph__tag wave-graph__tag--status">
                {STATUS[t.status]?.label || 'Normal'}
              </span>
            </div>
          ))}
        </div>

        <div className="wave-graph__water">
          <svg className="wave-graph__svg" viewBox="0 0 800 300" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" className="wave-graph__stop-top" />
                <stop offset="100%" className="wave-graph__stop-bottom" />
              </linearGradient>
            </defs>

            {/* SCALE-ACCURATE SILHOUETTES */}
            <g className="wave-graph__illustrations" opacity="0.4">
              
              {/* 4'11" Human - Ground is at Y=290, Chest hits perfectly at L7 (Y=73) */}
              <g id="human-scale" transform="translate(40, 0)">
                <circle cx="25" cy="30" r="14" fill="#ffffff" />
                {/* Torso */}
                <path d="M 12 50 L 38 50 L 34 135 L 16 135 Z" fill="#ffffff" />
                {/* Arms */}
                <rect x="2" y="50" width="8" height="85" rx="4" fill="#ffffff" />
                <rect x="40" y="50" width="8" height="85" rx="4" fill="#ffffff" />
                {/* Legs down to Y=290 */}
                <rect x="15" y="130" width="10" height="160" rx="4" fill="#ffffff" />
                <rect x="25" y="130" width="10" height="160" rx="4" fill="#ffffff" />
              </g>

              {/* Realistic Sedan (Toyota Vios Profile) */}
              <g id="car-scale" transform="translate(140, 0)">
                {/* Car Body - Roof peaks below L7, chassis aligns with human hips */}
                <path d="M 50 160 Q 90 150 120 100 Q 180 85 220 85 Q 260 95 300 135 L 350 140 Q 370 145 370 170 L 370 230 Q 365 240 340 240 L 40 240 Q 10 240 10 200 L 20 170 Z" fill="#ffffff" />
                
                {/* Windows */}
                <path d="M 130 105 Q 170 95 210 95 L 210 140 L 95 140 Q 110 120 130 105 Z" fill="#0d1b2a" opacity="0.8" />
                <path d="M 220 95 Q 250 100 280 135 L 220 135 Z" fill="#0d1b2a" opacity="0.8" />
                
                {/* Tires - Radius 35 hits exactly at L5 (66.1cm) */}
                <circle cx="90" cy="240" r="35" fill="#0d1b2a" stroke="#ffffff" strokeWidth="4" />
                <circle cx="290" cy="240" r="35" fill="#0d1b2a" stroke="#ffffff" strokeWidth="4" />
              </g>
            </g>

            {/* WATER ANIMATION & LINE */}
            <path d={areaPath} fill="url(#waterGrad)" />
            <path d={scenario.path} className="wave-graph__line" />

            <g transform={`translate(600, ${scenario.pointY})`}>
              <line x1="0" y1="-160" x2="0" y2="140" className="wave-graph__guide" />
              <circle r="7" className="wave-graph__dot" />
            </g>
          </svg>

          <div className="wave-graph__tooltip" style={{ top: scenario.tooltipTop }}>
            <div className="wave-graph__tip-row">
              <span className="wave-graph__tip-value">{scenario.waterLevelCm.toFixed(2)}</span>
              <span className="wave-graph__tip-unit">cm</span>
            </div>
            <div className="wave-graph__tip-level">
              Level {current.level}: {current.name}
            </div>
          </div>
        </div>

        {/* DYNAMIC REAL-TIME TIMESTAMPS */}
        <div className="wave-graph__times">
          {times.map((time, i) => (
            <span key={i} className={timeClass(i, times.length)}>{time}</span>
          ))}
        </div>
      </div>
    </div>
  );
}