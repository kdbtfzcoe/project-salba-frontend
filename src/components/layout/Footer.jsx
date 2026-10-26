import '../../css/components/Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <i className="fa-solid fa-water site-footer__icon"></i>
          <span className="site-footer__name">PROJECT SALBA</span>
        </div>
        <p className="site-footer__tagline">
          Community-focused Flood Awareness &amp; Telemetry System &middot; Barangay Dela Paz, Biñan City
        </p>
        {/* new Date().getFullYear() keeps the year up to date automatically */}
        <p className="site-footer__copy">
          Project SALBA Node System &copy; {new Date().getFullYear()}. Demonstration Interface.
        </p>
      </div>
    </footer>
  );
}