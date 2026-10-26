import { useEffect, useState } from 'react';
import MetricCard from '../components/shared/MetricCard.jsx';
import WaveGraph from '../components/shared/WaveGraph.jsx';
import { SCENARIOS, STATUS, THRESHOLDS, formatLiveTimestamp } from '../services/apiService';
import '../css/pages/MonitoringPage.css';

// Icon of the "Rate of Change" card for each rate type.
// (The colors are in tokens.css, found through data-rate.)
const RATE_ICON = {
  INCREASING: 'fa-arrow-trend-up',
  DECREASING: 'fa-arrow-trend-down',
  STABLE: 'fa-minus',
};

export default function MonitoringPage() {
  // statusKey = which scenario is selected ('safe', 'monitor', 'warning', 'danger', 'evacuate').
  // Changing it re-renders the whole page with new data. Starts on 'danger'.
  const [statusKey, setStatusKey] = useState('danger');

  // The "LIVE UPDATE AS OF" text. Refreshes every 30 seconds.
  const [timestamp, setTimestamp] = useState(formatLiveTimestamp);
  useEffect(() => {
    const id = setInterval(() => setTimestamp(formatLiveTimestamp()), 30000);
    return () => clearInterval(id); // stop the timer when leaving the page
  }, []);

  // Everything below is worked out from the selected statusKey
  const scenario = SCENARIOS[statusKey];                 // numbers + curve
  const status = STATUS[statusKey];                      // label + icon
  const current = THRESHOLDS[scenario.level - 1];        // the level we're at
  const next = THRESHOLDS[scenario.level];               // the next level up (may be undefined)

  return (
    <section className="monitor">
      <div className="monitor__inner">

        {/* ---------- Page title + simulate buttons ---------- */}
        <div className="monitor__header">
          <div>
            <div className="eyebrow">
              <i className="fa-solid fa-satellite-dish anim-pulse"></i> Real-time Telemetry
            </div>
            <h2 className="monitor__title">LIVE FLOOD MONITORING</h2>
            <p className="monitor__subtitle">
              System Node Location: <strong>Brgy. Dela Paz, Biñan City</strong>
            </p>
          </div>

          {/* One button per scenario. data-status gives each button its text color. */}
          <div className="scenario-bar">
            <span className="scenario-bar__label">Simulate Status:</span>
            {Object.keys(SCENARIOS).map((k) => (
              <button
                key={k}
                data-status={k}
                onClick={() => setStatusKey(k)}
                className={`scenario-btn ${statusKey === k ? 'active' : ''}`}
              >
                <i className={`fa-solid ${STATUS[k].icon}`}></i> {STATUS[k].label}
              </button>
            ))}
          </div>
        </div>

        {/* ---------- Graph (left) + cards (right) ---------- */}
        <div className="monitor__grid">

          <WaveGraph scenario={scenario} statusKey={statusKey} timestamp={timestamp} />

          <div className="monitor__side">

            {/* Card 1: current water level */}
            <MetricCard
              label="CURRENT WATER LEVEL"
              data-status={statusKey}
              icon={
                <div className="monitor__icon-box">
                  <i className="fa-solid fa-ruler-vertical"></i>
                </div>
              }
            >
              <div className="monitor__value">
                <span className="monitor__number">{scenario.waterLevelCm.toFixed(2)}</span>
                <span className="monitor__unit">cm</span>
              </div>
              <div className="level-pill">
                <i className="fa-solid fa-layer-group"></i>
                <span>Level {current.level}: {current.name} LEVEL ({current.cm.toFixed(2)} cm)</span>
              </div>
            </MetricCard>

            {/* Card 2: rate of change */}
            <MetricCard
              label="RATE OF CHANGE"
              data-rate={scenario.rateStatus}
              icon={
                <span className="rate-icon">
                  <i className={`fa-solid ${RATE_ICON[scenario.rateStatus]}`}></i>
                </span>
              }
            >
              <div className="monitor__rate">{scenario.rateStatus}</div>
              <p className="monitor__note">
                Speed: <strong>{scenario.rateValue}</strong>
              </p>
            </MetricCard>

            {/* Card 3: node status (gradient changes per status) */}
            <MetricCard label="PROJECT SALBA NODE STATUS" variant="status" data-status={statusKey}>
              <div className="monitor__status-name">{status.label}</div>
              <p className="monitor__status-desc">
                <i className="fa-solid fa-circle-info"></i>
                <span>{scenario.nodeDesc}</span>
              </p>
            </MetricCard>

            {/* Card 4: forecast (estimated time until the next level) */}
            <MetricCard
              label="FORECAST ENGINE"
              variant="dark"
              icon={<span className="monitor__model-tag">CM/MIN MODEL</span>}
            >
              <div className="monitor__forecast">
                <span className="monitor__forecast-time">{scenario.forecastTime}</span>
                <span className="monitor__forecast-hint">estimated time</span>
              </div>
              <p className="monitor__forecast-note">
                {/* If the water is rising and there IS a next level, name it. Otherwise say it's stable. */}
                {next && scenario.rateStatus !== 'STABLE' ? (
                  <>
                    Before reaching{' '}
                    <strong>
                      Level {next.level}: {next.name} ({next.cm.toFixed(2)} cm)
                    </strong>{' '}
                    at {scenario.rateValue}.
                  </>
                ) : (
                  'Water level stable. No threshold breach expected in the next 60 mins.'
                )}
              </p>
            </MetricCard>
          </div>
        </div>
      </div>
    </section>
  );
}