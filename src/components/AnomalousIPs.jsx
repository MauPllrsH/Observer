import React, { useState, useEffect } from 'react';

const AnomalousIPs = () => {
    const [anomalousIPs, setAnomalousIPs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnomalousIPs = async () => {
            try {
                const response = await fetch('http://157.245.249.219:5000/api/anomalous-ips');
                if (!response.ok) throw new Error('Failed to fetch anomalous IPs');
                const data = await response.json();
                setAnomalousIPs(data);
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAnomalousIPs();
        const interval = setInterval(fetchAnomalousIPs, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="logs-container">
            <h2>Anomalous IPs</h2>
            {anomalousIPs.length === 0 ? (
                <p>No anomalous IPs found</p>
            ) : (
                <div className="logs-table">
                    {anomalousIPs.map((ip) => (
                        <div
                            key={ip.ip}
                            className={`log-entry attack`}
                        >
                            <div className="log-header">
                                <span className="timestamp">{new Date(ip.last_detected).toLocaleString()}</span>
                                <span className="status attack">
                                    ⚠️ Risk Level: {ip.threat_level.toFixed(1)}%
                                </span>
                            </div>
                            <div className="log-details">
                                <p><strong>IP Address:</strong> {ip.ip}</p>
                                <p><strong>Total Requests:</strong> {ip.total_requests}</p>
                                <p><strong>Anomalous Requests:</strong> {ip.anomalous_requests}</p>
                                {ip.matched_rules?.length > 0 && (
                                    <p><strong>Matched Rules:</strong> {ip.matched_rules.join(', ')}</p>
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