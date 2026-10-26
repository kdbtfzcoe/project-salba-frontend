import React, { useEffect, useState } from 'react';
import MetricCard from '../components/shared/MetricCard.jsx';
import WaveGraph from '../components/shared/WaveGraph.jsx';
import { 
    getLiveTelemetry, 
    calculateGraphGeometry, 
    STATUS, 
    THRESHOLDS, 
    formatLiveTimestamp 
} from '../services/apiService';
import '../css/pages/MonitoringPage.css';

const RATE_ICON = {
    INCREASING: 'fa-arrow-trend-up',
    DECREASING: 'fa-arrow-trend-down',
    STABLE: 'fa-minus',
};

const DEFAULT_TELEMETRY = {
    waterLevelCm: 0,
    status: 'SAFE',
    rateStatus: 'STABLE',
    rateValue: '0.0 cm/min',
    nodeDesc: 'Continuous river height measurement active.',
    forecast: {
        estimatedMinutes: null,
        rateStatus: 'STABLE',
        rateValue: '0.0 cm/min',
        nextThreshold: null,
        message: 'Water level stable. No threshold breach expected.'
    }
};

// 1. Start loading as false and pre-load telemetry with DEFAULT_TELEMETRY
export default function MonitoringPage() {
    const [telemetry, setTelemetry] = useState(DEFAULT_TELEMETRY);
    const [timestamp, setTimestamp] = useState(formatLiveTimestamp());

    useEffect(() => {
        const fetchLiveData = async () => {
            try {
                const data = await getLiveTelemetry();
                if (data) setTelemetry(data);
                setTimestamp(formatLiveTimestamp());
            } catch (error) {
                console.error('API Error connecting to backend:', error);
            }
        };

        fetchLiveData(); // Fetches in background without blocking UI
        const interval = setInterval(fetchLiveData, 3000);

        return () => clearInterval(interval);
    }, []);


    const currentTelemetry = telemetry || DEFAULT_TELEMETRY;
    const currentCm = currentTelemetry.waterLevelCm || 0;
    const scenario = calculateGraphGeometry(currentCm);
    
    // Normalize status key for CSS badges
    let rawStatus = (currentTelemetry.status || 'SAFE').toLowerCase();
    if (rawStatus === 'normal') rawStatus = 'safe';
    if (rawStatus === 'monitoring') rawStatus = 'monitor';

    const statusKey = rawStatus;
    const status = STATUS[statusKey] || STATUS.safe || { label: 'Safe', color: 'safe', icon: 'fa-circle-check' };
    const currentLevel = THRESHOLDS[scenario.level - 1] || THRESHOLDS[0];

    // Forecast details from backend EMA engine
    const forecast = currentTelemetry.forecast || DEFAULT_TELEMETRY.forecast;

    return (
        <section className="monitor">
            <div className="monitor__inner">

                <div className="monitor__header">
                    <div>
                        <div className="eyebrow">
                            <i className="fa-solid fa-satellite-dish anim-pulse"></i> Real-Time Telemetry
                        </div>
                        <h2 className="monitor__title">LIVE FLOOD MONITORING</h2>
                    </div>

                    <div className="monitor__badge">
                        <span className="anim-ping"></span>
                        ESP32 Node Online
                    </div>
                </div>

                <div className="monitor__grid">
                    <WaveGraph scenario={scenario} statusKey={statusKey} timestamp={timestamp} />

                    <div className="monitor__side">

                        {/* Card 1: Live Water Level */}
                        <MetricCard
                            label="CURRENT WATER LEVEL"
                            data-status={statusKey}
                            icon={
                                <div className="monitor__icon-box">
                                    <i className="fa-solid fa-ruler-vertical"></i>
                                </div>
                            }
                        >
                            <div className="monitor__value">
                                <span className="monitor__number">{currentCm.toFixed(2)}</span>
                                <span className="monitor__unit">cm</span>
                            </div>
                            <div className="level-pill">
                                <i className="fa-solid fa-layer-group"></i>
                                <span>Level {currentLevel.level}: {currentLevel.name} ({currentLevel.cm.toFixed(2)} cm)</span>
                            </div>
                        </MetricCard>

                        {/* Card 2: Rate of Change */}
                        <MetricCard
                            label="RATE OF CHANGE"
                            data-rate={currentTelemetry.rateStatus || 'STABLE'}
                            icon={
                                <span className="rate-icon">
                                    <i className={`fa-solid ${RATE_ICON[currentTelemetry.rateStatus] || RATE_ICON.STABLE}`}></i>
                                </span>
                            }
                        >
                            <div className="monitor__rate">{currentTelemetry.rateStatus || 'STABLE'}</div>
                            <p className="monitor__note">
                                Speed: <strong>{currentTelemetry.rateValue || '0.0 cm/min'}</strong>
                            </p>
                        </MetricCard>

                        {/* Card 3: Node Status */}
                        <MetricCard label="PROJECT SALBA NODE STATUS" variant="status" data-status={statusKey}>
                            <div className="monitor__status-name">{status.label}</div>
                            <p className="monitor__status-desc">
                                <i className="fa-solid fa-circle-info"></i>
                                <span>{currentTelemetry.nodeDesc || 'Continuous river height measurement active.'}</span>
                            </p>
                        </MetricCard>

                        {/* Card 4: Forecast Engine (EMA Model) */}
                        <MetricCard
                            label="FORECAST ENGINE"
                            variant="dark"
                            icon={<span className="monitor__model-tag">EMA CM/MIN MODEL</span>}
                        >
                            <div className="monitor__forecast">
                                <span className="monitor__forecast-time">
                                    {forecast?.estimatedMinutes ? `${forecast.estimatedMinutes} mins` : 'N/A'}
                                </span>
                                <span className="monitor__forecast-hint">estimated time</span>
                            </div>
                            <p className="monitor__forecast-note">
                                {forecast?.nextThreshold && currentTelemetry.rateStatus === 'INCREASING' ? (
                                    <>
                                        Before reaching{' '}
                                        <strong>
                                            Level {forecast.nextThreshold.level}: {forecast.nextThreshold.name} ({forecast.nextThreshold.cm.toFixed(2)} cm)
                                        </strong>
                                    </>
                                ) : (
                                    forecast?.message || 'Water level stable. No threshold breach expected.'
                                )}
                            </p>
                        </MetricCard>

                    </div>
                </div>
            </div>
        </section>
    );
}