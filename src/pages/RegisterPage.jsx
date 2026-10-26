import { useState } from 'react';
import MapModal from '../components/shared/MapModal.jsx';
import { registerSubscriber } from '../services/apiService';
import '../css/pages/RegisterPage.css';

// Starting values of the form (also used to reset it after success)
const EMPTY_FORM = { name: '', mobile: '', address: 'Purok 3, Brgy. Dela Paz, Biñan City' };

// The two benefit cards on the left: [icon, title, text]
const BENEFITS = [
  ['fa-bolt', 'Real-time Threshold Alerts', 'Instant SMS whenever water breaches HALF TIRE (32.92 cm) or KNEE (48.16 cm) levels.'],
  ['fa-map-location-dot', 'Geo-Targeted Brgy. Dela Paz Radius', 'Accurate flood rate predictions delivered specifically for your street or area.'],
];

export default function RegisterPage() {
  const [form, setForm] = useState(EMPTY_FORM);   // what the user typed
  const [status, setStatus] = useState('idle');   // idle | submitting | success | error
  const [mapOpen, setMapOpen] = useState(false);  // is the map popup open?

  // One handler for ALL inputs: the input's "name" attribute decides which field to update.
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();          // stop the browser from reloading the page
    setStatus('submitting');
    try {
      // Add +63 in front and remove spaces from the number
      await registerSubscriber({ ...form, mobile: `+63${form.mobile.replace(/\s/g, '')}` });
      setStatus('success');
      setForm(EMPTY_FORM);
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="register">
      <div className="register__inner">

        {/* ---------- LEFT: info ---------- */}
        <div className="register__info">
          <div className="eyebrow">
            <i className="fa-solid fa-mobile-screen-button"></i> Early Warning Registration
          </div>
          <h2 className="register__title">BE ALERTED BEFORE FLOODS REACH YOUR DOORSTEP</h2>
          <p className="register__text">
            Sign up your mobile number to receive automated SMS alerts generated directly from the Project SALBA telemetry node stationed at Brgy. Dela Paz.
          </p>

          <div className="register__benefits">
            {BENEFITS.map(([icon, title, text]) => (
              <div key={title} className="info-card info-card--compact">
                <div className="icon-box">
                  <i className={`fa-solid ${icon}`}></i>
                </div>
                <div>
                  <h4 className="info-card__title">{title}</h4>
                  <p className="info-card__text">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ---------- RIGHT: form card ---------- */}
        <div className="register__panel">
          <div className="register-card">
            <h3 className="register-card__title">Register Account</h3>
            <p className="register-card__sub">Enter your details to join the barangay warning roster.</p>

            <form onSubmit={handleSubmit} className="register-form">

              {/* Full name */}
              <div>
                <label className="form-label">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} type="text" required placeholder="e.g. Juan Dela Cruz" className="form-input" />
              </div>

              {/* Mobile number with a fixed +63 box on the left */}
              <div>
                <label className="form-label">Mobile Number (+63)</label>
                <div className="phone-field">
                  <span className="phone-field__prefix">+63</span>
                  <input name="mobile" value={form.mobile} onChange={handleChange} type="tel" required placeholder="912 345 6789" className="phone-field__input" />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="form-label">Home Address in Brgy. Dela Paz</label>
                <input name="address" value={form.address} onChange={handleChange} type="text" required className="form-input" />
              </div>

              {/* Opens the map popup (type="button" so it does NOT submit the form) */}
              <button type="button" onClick={() => setMapOpen(true)} className="btn btn--outline btn--block">
                <i className="fa-solid fa-location-dot"></i>View Node Location
              </button>

              {/* Success / error messages */}
              {status === 'success' && (
                <p className="form-message form-message--success">
                  Account registered successfully for Project SALBA SMS warnings!
                </p>
              )}
              {status === 'error' && (
                <p className="form-message form-message--error">
                  Something went wrong. Please try again.
                </p>
              )}

              {/* Submit (disabled while sending) */}
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="btn btn--teal btn--block register-form__submit"
              >
                {status === 'submitting' ? 'Registering…' : 'Register Account'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* The popup lives here but only shows when mapOpen is true */}
      <MapModal open={mapOpen} onClose={() => setMapOpen(false)} />
    </section>
  );
}