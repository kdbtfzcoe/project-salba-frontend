import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import '../../css/components/Navbar.css';

// The menu links. Add a new page by adding one line here.
const LINKS = [
  { to: '/', label: 'Home', end: true },     // "end" = only active on exactly "/"
  { to: '/monitoring', label: 'Live Dashboard' },
  { to: '/guide', label: 'Guide' },
];

export default function Navbar() {
  // Controls the mobile dropdown (open / closed)
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar__inner">

        {/* Logo (clicking it goes home) */}
        <Link to="/" onClick={() => setOpen(false)} className="navbar__logo">
          <div className="navbar__logo-icon">
            <i className="fa-solid fa-water"></i>
          </div>
          <div className="navbar__brand">
            <span className="navbar__title">PROJECT SALBA</span>
            <span className="navbar__subtitle">Brgy. Dela Paz Node</span>
          </div>
        </Link>

        {/* Desktop menu */}
        <div className="navbar__menu">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className="nav-link">
              {link.label}
            </NavLink>
          ))}
          <Link to="/register" className="navbar__cta">Register</Link>
        </div>

        {/* Hamburger button (mobile only) */}
        <button className="navbar__toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          <i className={`fa-solid ${open ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>
      </div>

      {/* Mobile dropdown (only rendered when open is true) */}
      {open && (
        <div className="navbar__mobile">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setOpen(false)} className="nav-link">
              {link.label}
            </NavLink>
          ))}
          <Link to="/register" onClick={() => setOpen(false)} className="navbar__cta-mobile">
            Register Now
          </Link>
        </div>
      )}
    </nav>
  );
}