import React, { useState, useEffect } from 'react';
import { logRequest } from '../utils/logging';

const AnomalousIPs = () => {
    const [anomalousIPs, setAnomalousIPs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastFetch, setLastFetch] = useState(null);

    useEffect(() => {
        let mounted = true;
        let interval = null;

        const fetchAnomalousIPs = async () => {
            try {
                logRequest('AnomalousIPs', 'fetching data', { lastFetch });
                const response = await fetch('http://157.245.249.219:5000/api/anomalous-ips');

                if (!response.ok) {
                    throw new Error('Failed to fetch anomalous IPs');
                }

                const data = await response.json();
                logRequest('AnomalousIPs', 'received data', { count: data.length });

                if (mounted) {
                    setAnomalousIPs(data);
                    setLastFetch(new Date().toISOString());
                    setError(null);
                }
            } catch (err) {
                logRequest('AnomalousIPs', 'error', { error: err.message });
                if (mounted) {
                    setError(err.message);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchAnomalousIPs();
        interval = setInterval(fetchAnomalousIPs, 5000);

        return () => {
            logRequest('AnomalousIPs', 'cleanup');
            mounted = false;
            if (interval) {
                clearInterval(interval);
            }
        };
    }, []);

    if (loading) return (
        <div style={{
            backgroundColor: '#2c2d31',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            color: '#a1a1a3'
        }}>
            Loading...
        </div>
    );

    if (error) return (
        <div style={{
            backgroundColor: '#2c2d31',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            color: '#dc2626'
        }}>
            Error: {error}
        </div>
    );

    return (
        <div style={{
            backgroundColor: '#2c2d31',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            border: '1px solid #3f3f46'
        }}>
            <h2 style={{
                color: '#e1e1e3',
                fontSize: '1.5rem',
                marginBottom: '1rem'
            }}>Anomalous IPs</h2>

            {anomalousIPs.length === 0 ? (
                <p style={{ color: '#a1a1a3' }}>No anomalous IPs found</p>
            ) : (
                <div>
                    {anomalousIPs.map((ip) => (
                        <div
                            key={ip.ip}
                            style={{
                                backgroundColor: '#1a1b1e',
                                borderRadius: '0.5rem',
                                marginBottom: '0.5rem',
                                border: '1px solid #3f3f46',
                                borderLeft: '4px solid #dc2626'
                            }}
                        >
                            <div style={{
                                padding: '0.75rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: '1px solid #3f3f46'
                            }}>
                                <span style={{ color: '#a1a1a3', fontSize: '0.875rem' }}>
                                    {new Date(ip.last_detected).toLocaleString()}
                                </span>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.875rem',
                                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                                    color: '#dc2626'
                                }}>
                                    ⚠️ Risk Level: {ip.threat_level.toFixed(1)}%
                                </span>
                            </div>
                            <div style={{ padding: '0.75rem' }}>
                                <p style={{ color: '#a1a1a3', marginBottom: '0.5rem' }}>
                                    <strong style={{ color: '#e1e1e3' }}>IP Address:</strong> {ip.ip}
                                </p>
                                <p style={{ color: '#a1a1a3', marginBottom: '0.5rem' }}>
                                    <strong style={{ color: '#e1e1e3' }}>Total Requests:</strong> {ip.total_requests}
                                </p>
                                <p style={{ color: '#a1a1a3', marginBottom: '0.5rem' }}>
                                    <strong style={{ color: '#e1e1e3' }}>Anomalous Requests:</strong> {ip.anomalous_requests}
                                </p>
                                {ip.matched_rules?.length > 0 && (
                                    <p style={{ color: '#a1a1a3', marginBottom: '0.5rem' }}>
                                        <strong style={{ color: '#e1e1e3' }}>Matched Rules:</strong>
                                        {ip.matched_rules.join(', ')}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AnomalousIPs;