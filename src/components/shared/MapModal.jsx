import { useEffect } from 'react';
import '../../css/components/MapModal.css';

const MAP_IMAGE =
  'https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';

// Props:
//   open    → true shows the popup, false hides it
//   onClose → function that closes it
//   lat/lng → node coordinates shown on the pin
export default function MapModal({ open, onClose, lat = '14.338114', lng = '121.078080' }) {

  // Close the popup when the Escape key is pressed
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey); // cleanup
  }, [open, onClose]);

  // Nothing to render while closed
  if (!open) return null;

  return (
    // Clicking the dark backdrop closes the popup...
    <div className="map-modal-backdrop" onClick={onClose}>
      {/* ...but clicking inside the white box must NOT, so we stop the click here */}
      <div className="map-modal-panel" onClick={(e) => e.stopPropagation()}>

        <div className="map-modal__header">
          <h4 className="map-modal__title">Project SALBA Node Location</h4>
          <button onClick={onClose} className="map-modal__close" aria-label="Close">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="map-modal__map">
          <img src={MAP_IMAGE} alt="Map location" className="map-modal__img" />

          {/* Red pin in the center of the image */}
          <div className="map-modal__pin">
            <div className="map-modal__pin-icon anim-bounce">
              <i className="fa-solid fa-location-dot"></i>
            </div>
            <span className="map-modal__pin-label">
              NODE: LAT {lat} | LNG {lng}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}