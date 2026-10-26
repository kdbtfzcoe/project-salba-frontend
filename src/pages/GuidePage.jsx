import { Link } from 'react-router-dom';
import { THRESHOLDS, STATUS } from '../services/apiService';
import '../css/pages/GuidePage.css';

// "How Project SALBA Works" steps: [title, description]
const STEPS = [
  ['Register your number', 'Sign up so the barangay node can text you when water crosses key levels.'],
  ['Know the levels', 'Each level maps to a physical height: gutter, knee, tires, waist, chest.'],
  ['Act on the alert', 'Follow the action for your alert level and move vehicles and valuables early.'],
  ['Evacuate when told', 'At Level 5 and above, sirens sound. Move to higher ground immediately.'],
];

// Table column titles
const HEADERS = ['Level & Name', 'Physical Height (Feet)', 'Physical Height (cm)', 'System Status'];

export default function GuidePage() {
  return (
    <>
      {/* ---------- HOW PROJECT SALBA WORKS ---------- */}
      <section className="guide-intro">
        <div className="guide__inner">
          <div className="guide__head">
            <span className="eyebrow eyebrow--pill">Community Guide</span>
            <h2 className="guide__title">How Project SALBA Works</h2>
          </div>

          <div className="guide__steps">
            {/* [title, text] is "destructured"; i is the index so the numbers go 1, 2, 3, 4 */}
            {STEPS.map(([title, text], i) => (
              <div key={title} className="info-card">
                <div className="guide-step-number">{i + 1}</div>
                <div>
                  <h4 className="info-card__title">{title}</h4>
                  <p className="info-card__text">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- WATER LEVEL & ALERT REFERENCE TABLE ---------- */}
      <section className="guide-ref">
        <div className="guide__inner guide__inner--wide">
          <div className="guide__head">
            <span className="eyebrow eyebrow--pill">Flood Level Guide</span>
            <h3 className="guide__title guide__title--sm">Water Level &amp; Alert Reference</h3>
          </div>

          <div className="guide-table-wrap">
            <table className="guide-table">
              <thead>
                <tr className="guide-table__head">
                  {HEADERS.map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* One row per threshold, all read from apiService.js */}
                {THRESHOLDS.map((t) => (
                  <tr key={t.level}>
                    <td className="guide-table__level">Level {t.level}: {t.name}</td>
                    <td className="guide-table__ft">{t.ft} ft</td>
                    <td className="guide-table__cm">{t.cm.toFixed(2)} cm</td>
                    <td>
                      {/* data-status picks the badge colors from tokens.css */}
                      <span className="status-pill" data-status={t.status}>
                        {STATUS[t.status].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="guide__cta">
            <Link to="/register" className="btn btn--teal">Register for SMS Alerts</Link>
          </div>
        </div>
      </section>
    </>
  );
}