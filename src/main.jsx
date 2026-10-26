// The very first file that runs. It mounts <App /> into the #root div.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // enables page routing
import App from './App.jsx';
import './css/main.css'; // global styles (Tailwind lives here)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);