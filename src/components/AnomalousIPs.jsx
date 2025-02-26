import React from 'react';
import { AlertTriangle, Monitor, Globe, Activity, Shield } from 'lucide-react';
import Card from './ui/Card.jsx';
import { useSecurityContext } from '../context/SecurityContext.jsx';

const AnomalousIPs = () => {
    const { anomalousIPs, loading, error, handleRetry } = useSecurityContext();

    // Calculate average threat level
    const avgThreatLevel = anomalousIPs.length > 0
        ? (anomalousIPs.reduce((acc, ip) => acc + ip.threat_level, 0) / anomalousIPs.length).toFixed(1)
        : 0;

    // Header stats for the card
    const headerStats = (
        <>
            <span>{anomalousIPs.length} active threats</span>
            {anomalousIPs.length > 0 && <span>Avg. risk: {avgThreatLevel}%</span>}
        </>
    );

    // Get threat color class based on threat level
    const getThreatClass = (level) => {
        if (level >= 75) return 'severe';
        if (level >= 50) return 'high';
        if (level >= 25) return 'medium';
        return 'low';
    };

    return (
        <Card 
            title="Anomalous IPs" 
            loading={loading}
            error={error}
            onRetry={handleRetry}
            stats={headerStats}
            className="anomalous-ips"
        >
            <div className="threats-list">
                {anomalousIPs.length === 0 ? (
                    <div className="empty-state">
                        <Shield size={24} />
                        <p>No threats detected</p>
                        <span>The system is not detecting any anomalous IP activity</span>
                    </div>
                ) : (
                    anomalousIPs.map((ip) => (
                        <div
                            key={ip.ip}
                            className={`threat-item ${getThreatClass(ip.threat_level)}`}
                        >
                            <div className="threat-header">
                                <span className="timestamp">
                                    {new Date(ip.last_detected).toLocaleString()}
                                </span>
                                <div className="threat-badge">
                                    <AlertTriangle size={14} />
                                    Risk: {ip.threat_level.toFixed(1)}%
                                </div>
                            </div>
                            <div className="threat-details">
                                <div className="detail-grid">
                                    <div className="detail-card">
                                        <Globe size={16} className="icon" />
                                        <div className="detail-info">
                                            <label>IP Address</label>
                                            <span className="value">{ip.ip}</span>
                                        </div>
                                    </div>
                                    <div className="detail-card">
                                        <Monitor size={16} className="icon" />
                                        <div className="detail-info">
                                            <label>Total Requests</label>
                                            <span className="value">{ip.total_requests}</span>
                                        </div>
                                    </div>
                                    <div className="detail-card">
                                        <Activity size={16} className="icon" />
                                        <div className="detail-info">
                                            <label>Anomalous Requests</label>
                                            <span className="value">{ip.anomalous_requests}</span>
                                        </div>
                                    </div>
                                    <div className="detail-card">
                                        <Shield size={16} className="icon" />
                                        <div className="detail-info">
                                            <label>Attack Rate</label>
                                            <span className="value">{((ip.anomalous_requests / ip.total_requests) * 100).toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>
                                {ip.matched_rules?.length > 0 && (
                                    <div className="rules-section">
                                        <div className="rules-header">
                                            <strong>Matched Rules</strong>
                                        </div>
                                        <div className="tags">
                                            {ip.matched_rules.map((rule, idx) => (
                                                <span key={idx} className="tag">{rule}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};

export default AnomalousIPs;