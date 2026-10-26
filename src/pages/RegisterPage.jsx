import { useState } from 'react';
import { registerSubscriber } from '../services/apiService';
import '../css/pages/RegisterPage.css';

// Include latitude and longitude in the default form state
const EMPTY_FORM = { 
  name: '', 
  mobile: '', 
  address: '', 
  latitude: null, 
  longitude: null 
};

const BENEFITS = [
  ['fa-bolt', 'Real-time Threshold Alerts', 'Instant SMS whenever water breaches HALF TIRE (32.92 cm) or KNEE (48.16 cm) levels.'],
  ['fa-map-location-dot', 'Geo-Targeted Brgy. Dela Paz Radius', 'Accurate flood rate predictions delivered specifically for your street or area.'],
];

export default function RegisterPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [mapOpen, setMapOpen] = useState(false);
  
  // New state to show a loading spinner while fetching GPS
  const [isLocating, setIsLocating] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobile') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setForm({ ...form, mobile: cleaned });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // 📍 Geolocation Logic
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Location tracking is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          // Free reverse geocoding via OpenStreetMap (No API key needed)
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const data = await res.json();
          
          // Use the fetched address, or fallback to raw coordinates if the street isn't mapped
          const fetchedAddress = data.display_name || `Pinned Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
          
          setForm(prev => ({
            ...prev,
            address: fetchedAddress,
            latitude: lat,
            longitude: lon
          }));
        } catch (error) {
          setForm(prev => ({
            ...prev,
            address: `Pinned Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
            latitude: lat,
            longitude: lon
          }));
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        if (error.code === 1) {
          setErrorMessage('Please allow location permissions in your browser to use this feature.');
        } else {
          setErrorMessage('Could not determine your location. Please type your address manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');
    
    try {
      await registerSubscriber(form);
      setStatus('success');
      setForm(EMPTY_FORM);
    } catch (err) {
      setStatus('error');
      const messageText = 
        err.message || 
        err.data?.message || 
        (typeof err === 'string' ? err : null) || 
        'Something went wrong. Please try again.';

      setErrorMessage(messageText);
    }
  };

  return (
    <section className="register">
      <div className="register__inner">
        <div className="register__info">
          <div className="eyebrow">
            <i className="fa-solid fa-mobile-screen-button"></i> Early Warning Registration
          </div>
          <h2 className="register__title">GET REAL-TIME ALERTS AND STAY FLOOD-AWARE</h2>
          <p className="register__text">
            Sign up your mobile number to receive automated SMS alerts generated directly from the Project SALBA telemetry node.
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

        <div className="register__panel">
          <div className="register-card">
            <h3 className="register-card__title">Register Account</h3>
            <p className="register-card__sub">Enter your details to join.</p>

            <form onSubmit={handleSubmit} className="register-form">
              <div>
                <label className="form-label">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} type="text" required placeholder="e.g. Juan Dela Cruz" className="form-input" />
              </div>

              <div>
                <label className="form-label">Mobile Number (+63)</label>
                <div className="phone-field">
                  <span className="phone-field__prefix">+63</span>
                  <input
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    type="tel"
                    maxLength={10}
                    inputMode="numeric"
                    required
                    placeholder="9123456789"
                    className="phone-field__input"
                  />
                </div>
              </div>

{/* Updated Address Field with Inline Text Button */}
              <div>
                <label className="form-label">Home Address in Brgy. Dela Paz</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    name="address" 
                    value={form.address} 
                    onChange={handleChange} 
                    type="text" 
                    required 
                    placeholder="Type address or pin location"
                    className="form-input" 
                    style={{ flex: 1 }} 
                  />
                  <button 
                    type="button" 
                    onClick={handleGetLocation} 
                    disabled={isLocating}
                    className="btn btn--outline"
                    title="Get my current location"
                    style={{ padding: '0 16px', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
                  >
                    {isLocating ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i> Locating...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-location-crosshairs"></i> Pin Location
                      </>
                    )}
                  </button>
                </div>
              </div>

              {status === 'success' && (
                <p className="form-message form-message--success">
                  Account registered successfully for Project SALBA SMS warnings!
                </p>
              )}

              {status === 'error' && (
                <p className="form-message form-message--error">
                  {errorMessage}
                </p>
              )}

              <button type="submit" disabled={status === 'submitting'} className="btn btn--teal btn--block register-form__submit">
                {status === 'submitting' ? 'Registering…' : 'Register Account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}