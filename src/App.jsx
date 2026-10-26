// Defines the page layout: Navbar on top, the current page in the middle, Footer at the bottom.
import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import LandingPage from './pages/LandingPage.jsx';
import MonitoringPage from './pages/MonitoringPage.jsx';
import GuidePage from './pages/GuidePage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

// Small helper: scrolls to the top whenever you switch pages.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null; // renders nothing
}

export default function App() {
  return (
    <div className="app-layout">
      <ScrollToTop />
      <Navbar />

      <main className="app-main">
        {/* Each Route = one URL → one page component */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/monitoring" element={<MonitoringPage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}