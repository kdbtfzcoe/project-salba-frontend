import { Link } from 'react-router-dom';
import '../css/pages/LandingPage.css';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1547683905-f686c993aae5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80';

// The three feature cards under the hero. Edit text here.
const FEATURES = [
  { icon: 'fa-bolt', title: 'Real-time Threshold Alerts', text: 'Instant SMS whenever water breaches HALF TIRE (32.92 cm) or KNEE (48.16 cm) levels.' },
  { icon: 'fa-map-location-dot', title: 'Geo-Targeted Brgy. Dela Paz Radius', text: 'Accurate flood rate predictions delivered specifically for your street or area.' },
  { icon: 'fa-chart-line', title: 'Live Flood Wave Graph', text: 'Watch the water level, rate of change and forecast straight from the telemetry node.' },
];

export default function LandingPage() {
  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="hero">

        {/* Background photo + two color overlays */}
        <div className="hero__bg">
          <img src={HERO_IMAGE} alt="Aerial flooded community" className="hero__img" />
          <div className="hero__overlay hero__overlay--main"></div>
          <div className="hero__overlay hero__overlay--vignette"></div>
        </div>

        <div className="hero__content">

          {/* Small badge on top */}
          <div className="hero__badge">
            <span className="hero__badge-dot anim-ping"></span>
            <span className="hero__badge-text">
              PARA SA HANDA AT LIGTAS NA BARANGAY · BRGY. DELA PAZ, BIÑAN CITY
            </span>
          </div>

          <h1 className="hero__title">PROJECT SALBA</h1>
          <p className="hero__tagline">Laging Handa, Laging Ligtas.</p>
          <p className="hero__text">
            Empowering Barangay Dela Paz with IoT-driven flood monitoring and geo-targeted early warnings to ensure community safety.
          </p>

          {/* Two buttons (Link = page change without reloading) */}
          <div className="hero__actions">
            <Link to="/register" className="btn btn--accent">
              <i className="fa-solid fa-user-plus"></i>Register Now
            </Link>
            <Link to="/monitoring" className="btn btn--ghost">
              <i className="fa-solid fa-chart-line"></i>View Live Dashboard
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}