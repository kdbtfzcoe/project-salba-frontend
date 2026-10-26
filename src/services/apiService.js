import axios from 'axios';
// ---------------------------------------------------------------
// If you later build a backend, put its URL in a .env file:
//   VITE_API_URL=http://localhost:3000
// Until then the functions at the bottom return fake (simulated) results.
// ---------------------------------------------------------------

// ---------------------------------------------------------------
// 1. THRESHOLDS – the 7 official water levels.
//    "status" links each level to a color/label in STATUS below.
// ---------------------------------------------------------------
export const THRESHOLDS = [
  { level: 1, name: 'GUTTER',    ft: '0.67', cm: 20.42, status: 'safe',     action: 'Normal monitoring active. No alert required.' },
  { level: 2, name: 'HALF KNEE', ft: '0.83', cm: 25.3,  status: 'monitor',  action: 'Continuous telemetry checking. Advisory logged.' },
  { level: 3, name: 'HALF TIRE', ft: '1.08', cm: 32.92, status: 'warning',  action: 'Community warning SMS dispatched. Keep vehicles safe.' },
  { level: 4, name: 'KNEE',      ft: '1.58', cm: 48.16, status: 'danger',   action: 'Prepare for immediate evacuation. High risk for light vehicles.' },
  { level: 5, name: 'TIRES',     ft: '2.17', cm: 66.14, status: 'evacuate', action: 'Full barangay siren & evacuation sirens triggered.' },
  { level: 6, name: 'WAIST',     ft: '3.08', cm: 93.88, status: 'evacuate', action: 'Severe flooding. Emergency response rescue active.' },
  { level: 7, name: 'CHEST',     ft: '3.75', cm: 114.3, status: 'evacuate', action: 'Critical submersion level. Move to high ground immediately.' },
];

// ---------------------------------------------------------------
// 2. STATUS: the name and icon of each alert state.
//    The COLORS live in src/css/tokens.css, in the [data-status='...'] blocks.
//    The keys here must match the keys in SCENARIOS and the status in THRESHOLDS.
// ---------------------------------------------------------------
export const STATUS = {
  safe:     { label: 'Safe',     icon: 'fa-circle-check' },
  monitor:  { label: 'Monitor',  icon: 'fa-eye' },
  warning:  { label: 'Warning',  icon: 'fa-triangle-exclamation' },
  danger:   { label: 'Danger',   icon: 'fa-radiation' },
  evacuate: { label: 'Evacuate', icon: 'fa-bell' },
};

// ---------------------------------------------------------------
// 3. SCENARIOS – the demo data behind the "Simulate Status" buttons.
//    The key (safe, monitor...) matches a key in STATUS above.
//
//    waterLevelCm → current water height
//    level        → which THRESHOLD we're at (1–7)
//    rateStatus   → INCREASING | DECREASING | STABLE
//    rateValue    → speed text
//    nodeDesc     → sentence on the status card
//    forecastTime → "time until the next level"
//    path         → the SVG curve for the graph (viewBox is 800 x 300,
//                   so a SMALLER y = HIGHER water)
//    pointY       → y position of the dot on that curve
//    tooltipTop   → vertical position of the tooltip box
// ---------------------------------------------------------------
export const SCENARIOS = {
  safe: {
    waterLevelCm: 15.2, level: 1,
    rateStatus: 'STABLE', rateValue: '0.00 cm/min',
    nodeDesc: 'Water level below Gutter Level. All clear.',
    forecastTime: 'No Breach',
    path: 'M 0 280 Q 200 282, 400 278 T 800 280',
    pointY: 279, tooltipTop: '88%',
  },
  monitor: {
    waterLevelCm: 25.3, level: 2,
    rateStatus: 'INCREASING', rateValue: '+1.20 cm/min',
    nodeDesc: 'Water reached Half Knee Level. Continuous monitoring active.',
    forecastTime: '6 mins',
    path: 'M 0 270 Q 200 260, 400 240 T 800 220',
    pointY: 230, tooltipTop: '72%',
  },
  warning: {
    waterLevelCm: 32.92, level: 3,
    rateStatus: 'INCREASING', rateValue: '+2.10 cm/min',
    nodeDesc: 'Water elevated past Half Tire mark. Community advisories sent.',
    forecastTime: '7 mins',
    path: 'M 0 250 Q 150 240, 350 210 T 800 180',
    pointY: 190, tooltipTop: '60%',
  },
  danger: {
    waterLevelCm: 48.16, level: 4,
    rateStatus: 'INCREASING', rateValue: '+2.80 cm/min',
    nodeDesc: 'Water reached Knee Level. Prepare for immediate evacuation.',
    forecastTime: '2 mins',
    path: 'M 0 250 Q 100 245, 200 230 T 400 200 T 600 160 T 800 145',
    pointY: 160, tooltipTop: '50%',
  },
  evacuate: {
    waterLevelCm: 78.5, level: 5,
    rateStatus: 'INCREASING', rateValue: '+3.50 cm/min',
    nodeDesc: 'Severe flooding. Immediate barangay sirens & rescue active.',
    forecastTime: '4 mins',
    path: 'M 0 200 Q 100 170, 200 120 T 400 80 T 600 45 T 800 25',
    pointY: 45, tooltipTop: '18%',
  },
};

// ---------------------------------------------------------------
// 4. Helper: builds "LIVE UPDATE AS OF: OCTOBER 26, 2026 AT 11:04 PM"
// ---------------------------------------------------------------
export function formatLiveTimestamp(date = new Date()) {
  const day = date
    .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    .toUpperCase();
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `LIVE UPDATE AS OF: ${day} AT ${time}`;
}

// ---------------------------------------------------------------
// Backend connection. Set the URL in a .env file (see 12c).
// With no URL set, the functions below return fake results so the
// site still works as a demo.
// ---------------------------------------------------------------
const API_URL = import.meta.env.VITE_API_URL;

// One shared axios instance: every request uses the same base URL and timeout.
const api = axios.create({ baseURL: API_URL, timeout: 10000 });

// Gets the latest sensor reading. Returns null while there's no API.
export async function fetchLatestReading() {
  if (!API_URL) return null;
  const { data } = await api.get('/api/readings/latest');
  return data;
}

// Sends the register form data. Pretends to succeed while there's no API.
export async function registerSubscriber(payload) {
  if (!API_URL) {
    await new Promise((resolve) => setTimeout(resolve, 600)); // fake loading time
    return { ok: true };
  }
  const { data } = await api.post('/api/subscribers', payload);
  return data;
}