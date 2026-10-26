import axios from 'axios';

// System status metadata used strictly for UI colors and labels
export const STATUS = {
    safe: { label: 'Safe', color: 'safe', icon: 'fa-circle-check' },
    normal: { label: 'Safe', color: 'safe', icon: 'fa-circle-check' },
    monitor: { label: 'Monitor', color: 'monitor', icon: 'fa-eye' },
    monitoring: { label: 'Monitor', color: 'monitor', icon: 'fa-eye' },
    warning: { label: 'Warning', color: 'warning', icon: 'fa-triangle-exclamation' },
    danger: { label: 'Danger', color: 'danger', icon: 'fa-radiation' },
    evacuate: { label: 'Evacuate', color: 'evacuate', icon: 'fa-person-walking-arrow-right' }
};

// 7-Level Threshold definitions matching backend configuration
export const THRESHOLDS = [
    { level: 1, name: 'Gutter', ft: 0.67, cm: 20.42, status: 'safe' },
    { level: 2, name: 'Half Knee', ft: 0.83, cm: 25.30, status: 'monitor' },
    { level: 3, name: 'Half Tire', ft: 1.08, cm: 32.92, status: 'warning' },
    { level: 4, name: 'Knee', ft: 1.58, cm: 48.16, status: 'danger' },
    { level: 5, name: 'Tires', ft: 2.17, cm: 66.14, status: 'evacuate' },
    { level: 6, name: 'Waist', ft: 3.08, cm: 93.88, status: 'evacuate' },
    { level: 7, name: 'Chest', ft: 3.75, cm: 114.30, status: 'evacuate' }
];

export const formatLiveTimestamp = () => {
    const now = new Date();
    return `LIVE UPDATE AS OF ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
};

/**
 * Dynamically converts any raw water level (cm) from the ESP32/Database
 * into SVG wave paths, height positions, and tooltip coordinates.
 */
export const calculateGraphGeometry = (waterLevelCm = 0) => {
    const maxCm = 130; 
    const clampedCm = Math.min(Math.max(waterLevelCm, 0), maxCm);
    
    // Map water level height to SVG canvas height
    const pointY = Math.round(280 - (clampedCm / maxCm) * 240);
    const path = `M 0 ${pointY} Q 200 ${pointY + 8} 400 ${pointY - 8} T 800 ${pointY}`;
    const tooltipTop = `${Math.max(pointY - 45, 10)}px`;

    let level = 1;
    if (clampedCm >= 114.30) level = 7;
    else if (clampedCm >= 93.88) level = 6;
    else if (clampedCm >= 66.14) level = 5;
    else if (clampedCm >= 48.16) level = 4;
    else if (clampedCm >= 32.92) level = 3;
    else if (clampedCm >= 25.30) level = 2;

    return {
        waterLevelCm: clampedCm,
        level,
        pointY,
        path,
        tooltipTop
    };
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const API = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000
});

export const getLiveTelemetry = async () => {
    const response = await API.get('/telemetry/live');
    return response.data;
};

export const getTimeToBreach = async () => {
    const response = await API.get('/telemetry/live');
    // Return backend forecast object
    return response.data.forecast || { estimatedMinutes: null, message: 'Water level stable.' };
};

/**
 * Register a community subscriber for flood SMS alerts
 * @param {Object} subscriberData - { name, mobile, address, latitude, longitude }
 */
export const registerSubscriber = async (subscriberData) => {
    try {
        const payload = {
            name: subscriberData.name,
            phone: subscriberData.mobile ? `+63${subscriberData.mobile}` : subscriberData.phone,
            address: subscriberData.address,
            latitude: subscriberData.latitude || null,
            longitude: subscriberData.longitude || null
        };
        
        const response = await API.post('/users/register', payload);
        return response.data;
    } catch (error) {
        // Multi-tier extraction: checks response payload, axios error message, or fallback
        const serverMessage = 
            error.response?.data?.message || 
            error.response?.data?.error ||
            error.message || 
            'Something went wrong. Please try again.';
            
        throw new Error(serverMessage);
    }
};

export { registerSubscriber as registerUser };

export default API;