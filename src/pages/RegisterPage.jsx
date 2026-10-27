import { useState, useEffect, useRef } from 'react';
import { registerSubscriber } from '../services/apiService';
import '../css/pages/RegisterPage.css';

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

const DEFAULT_CENTER = { lat: 14.3487, lon: 121.0848 };

export default function RegisterPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [mapOpen, setMapOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const [inlineSuggestions, setInlineSuggestions] = useState([]);
  const [isSearchingInline, setIsSearchingInline] = useState(false);

  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [modalSuggestions, setModalSuggestions] = useState([]);
  const [selectedCoords, setSelectedCoords] = useState(DEFAULT_CENTER);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const debounceTimerRef = useRef(null); // Ref for debouncing API calls

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobile') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setForm({ ...form, mobile: cleaned });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // 🔎 Debounced Inline Address Input Search to prevent 429 Too Many Requests
  const handleInlineAddressChange = (e) => {
    const query = e.target.value;
    
    setForm((prev) => ({
      ...prev,
      address: query,
      latitude: null,
      longitude: null,
    }));

    if (!query || query.length < 3) {
      setInlineSuggestions([]);
      setIsSearchingInline(false);
      return;
    }

    setIsSearchingInline(true);

    // Clear previous timer so it resets while typing
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Wait 400ms after user stops typing before fetching
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Binan, Laguna, Philippines')}&limit=5`;
        
        const res = await fetch(url, { 
          headers: { 'User-Agent': 'ProjectSalba-FloodWarningApp-v1.0' } 
        });
        const data = await res.json();
        
        setInlineSuggestions(data);
      } catch (err) {
        console.error("Nominatim search error:", err);
        setInlineSuggestions([]);
      } finally {
        setIsSearchingInline(false);
      }
    }, 400);
  };

  const handleSelectInlineSuggestion = (item) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);

    setForm((prev) => ({
      ...prev,
      address: item.display_name,
      latitude: lat,
      longitude: lon,
    }));

    setSelectedCoords({ lat, lon });
    setInlineSuggestions([]);
  };

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
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
            { headers: { 'User-Agent': 'ProjectSalba-FloodWarningApp' } }
          );
          const data = await res.json();
          const fetchedAddress = data.display_name || `Pinned Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`;

          setSelectedCoords({ lat, lon });
          setForm((prev) => ({
            ...prev,
            address: fetchedAddress,
            latitude: lat,
            longitude: lon,
          }));

          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([lat, lon], 17);
            markerRef.current.setLatLng([lat, lon]);
          }
        } catch {
          setSelectedCoords({ lat, lon });
          setForm((prev) => ({
            ...prev,
            address: `Pinned Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
            latitude: lat,
            longitude: lon,
          }));
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        setErrorMessage(error.code === 1 ? 'Please allow location permissions.' : 'Could not determine location.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleOpenMapModal = () => {
    if (form.latitude && form.longitude) {
      setSelectedCoords({ lat: form.latitude, lon: form.longitude });
    } else {
      setSelectedCoords(DEFAULT_CENTER);
    }
    setMapOpen(true);
  };

  useEffect(() => {
    if (!mapOpen) return;

    let timer;
    const initMap = () => {
      if (!mapRef.current) return;

      if (window.L) {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        const initialLat = selectedCoords.lat;
        const initialLon = selectedCoords.lon;

        const map = window.L.map(mapRef.current).setView([initialLat, initialLon], 17);
        mapInstanceRef.current = map;

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors',
        }).addTo(map);

        const marker = window.L.marker([initialLat, initialLon], { draggable: true }).addTo(map);
        markerRef.current = marker;

        marker.on('dragend', (e) => {
          const pos = e.target.getLatLng();
          setSelectedCoords({ lat: pos.lat, lon: pos.lng });
        });

        map.on('click', (e) => {
          marker.setLatLng(e.latlng);
          setSelectedCoords({ lat: e.latlng.lat, lon: e.latlng.lng });
        });
      }
    };

    if (!window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => {
        timer = setTimeout(initMap, 50);
      };
      document.body.appendChild(script);
    } else {
      timer = setTimeout(initMap, 50);
    }

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapOpen]);

  const handleModalMapSearch = async (query) => {
    setModalSearchQuery(query);
    if (!query || query.length < 3) {
      setModalSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Binan, Laguna, Philippines')}&limit=5`,
        { headers: { 'User-Agent': 'ProjectSalba-FloodWarningApp' } }
      );
      const data = await res.json();
      setModalSuggestions(data);
    } catch {
      setModalSuggestions([]);
    }
  };

  const handleSelectModalSuggestion = (item) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    setSelectedCoords({ lat, lon });
    setModalSearchQuery(item.display_name);
    setModalSuggestions([]);

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lon], 17);
      markerRef.current.setLatLng([lat, lon]);
    }
  };

  const handleConfirmMapLocation = async () => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${selectedCoords.lat}&lon=${selectedCoords.lon}`,
        { headers: { 'User-Agent': 'ProjectSalba-FloodWarningApp' } }
      );
      const data = await res.json();
      const finalAddress = data.display_name || `Brgy. Dela Paz (${selectedCoords.lat.toFixed(4)}, ${selectedCoords.lon.toFixed(4)})`;

      setForm((prev) => ({
        ...prev,
        address: finalAddress,
        latitude: selectedCoords.lat,
        longitude: selectedCoords.lon,
      }));
      setMapOpen(false);
    } catch {
      setForm((prev) => ({
        ...prev,
        address: `Brgy. Dela Paz (${selectedCoords.lat.toFixed(4)}, ${selectedCoords.lon.toFixed(4)})`,
        latitude: selectedCoords.lat,
        longitude: selectedCoords.lon,
      }));
      setMapOpen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.latitude || !form.longitude) {
      setErrorMessage('Please select a valid address from the dropdown suggestions or use the "Open Map" option to pin your location.');
      return;
    }

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

              <div>
                <label className="form-label">Home Address in Brgy. Dela Paz</label>
                <div className="address-field-group">
                  <div className="autocomplete-wrapper">
                    <input
                      name="address"
                      value={form.address}
                      onChange={handleInlineAddressChange}
                      type="text"
                      required
                      placeholder="Type street or select from list..."
                      className="form-input"
                      autoComplete="off"
                    />
                    
                    {inlineSuggestions.length > 0 && (
                      <ul className="autocomplete-suggestions">
                        {inlineSuggestions.map((item, idx) => (
                          <li
                            key={idx}
                            onClick={() => handleSelectInlineSuggestion(item)}
                            className="autocomplete-suggestion-item"
                          >
                            <i className="fa-solid fa-location-dot suggestion-icon"></i>
                            {item.display_name}
                          </li>
                        ))}
                      </ul>
                    )}

                    {isSearchingInline && (
                      <div className="autocomplete-loading">
                        <i className="fa-solid fa-spinner fa-spin"></i> Searching locations...
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenMapModal}
                    className="btn btn--outline btn--icon-text"
                    title="Open map to view or fine-tune location pin"
                  >
                    <i className="fa-solid fa-map-location-dot"></i> Open Map
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

      {mapOpen && (
        <div className="map-modal-overlay">
          <div className="map-modal-content">
            <div className="map-modal__header">
              <h3 className="map-modal__title">Pin Exact Location in Brgy. Dela Paz</h3>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="btn btn--outline btn--sm"
                title="Use current GPS location"
              >
                {isLocating ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Locating...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-location-crosshairs"></i> Use Current Location
                  </>
                )}
              </button>
            </div>

            <p className="map-modal__desc">
              Search a street name below or drag/click the map pin directly to your exact house location.
            </p>

            <div className="map-search-wrapper">
              <input
                type="text"
                placeholder="Search street in Brgy. Dela Paz..."
                value={modalSearchQuery}
                onChange={(e) => handleModalMapSearch(e.target.value)}
                className="form-input map-search-input"
              />
              {modalSuggestions.length > 0 && (
                <ul className="map-search-suggestions">
                  {modalSuggestions.map((item, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleSelectModalSuggestion(item)}
                      className="map-search-suggestion-item"
                    >
                      {item.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div ref={mapRef} className="map-container"></div>

            <div className="map-modal__actions">
              <button
                type="button"
                onClick={() => setMapOpen(false)}
                className="btn btn--outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMapLocation}
                className="btn btn--teal"
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}