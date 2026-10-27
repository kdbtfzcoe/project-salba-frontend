# Project SALBA — Frontend Telemetry & Warning Dashboard

**Project SALBA** is an IoT-driven community flood monitoring and early warning system. This web dashboard provides real-time telemetry visualizations, accurate flood level threshold tracking, predictive wave graphing, and SMS early warning registration for residents.

## 🚀 Key Features

* **Live Telemetry & Threshold Tracking:** Real-time water level data rendered using a custom `WaveGraph` visualization mapped against standardized safety thresholds.
* **Real-time Wave Graphing:** Animated dynamic time-series charts updating automatically on 15-minute telemetry intervals.
* **SMS Alert Registration:** Resident portal to sign up for automated geo-targeted emergency SMS alerts.
* **Responsive Layout:** Flexbox-anchored viewports designed to scale seamlessly across mobile devices, tablets, laptops, and wide monitors.

## 💻 Development Guide

Follow these steps to set up and run the frontend application locally:

### 1. Install Dependencies
Open your terminal in the root project directory and run:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (do not commit this file to GitHub):
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

### 4. Build for Production
```bash
npm run build
```

## ⚠️ Team Collaboration Rules

1. **Keep Secrets Private:** Never paste active Supabase keys or backend API secrets directly inside `.js` or `.jsx` files. Reference them through `import.meta.env.VITE_...`.
2. **Pull Before Pushing:** Always run `git pull origin main` before pushing local commits to prevent merge conflicts.

## 📄 License & Demonstration Notice

*Project SALBA Node System © 2026. Designed and developed for Barangay Dela Paz, Biñan City.*
