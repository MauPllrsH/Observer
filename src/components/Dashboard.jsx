import { useState, useEffect } from 'react';
import AnomalousIPs from "./AnomalousIPs.jsx";
import AttackTimeline from "./AttackTimeline.jsx";

const API_URL = 'http://157.245.249.219:5000';

const Dashboard = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleString());

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('Fetching logs...');
                const response = await fetch(`${API_URL}/api/logs`);
                console.log('Response status:', response.status);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Received logs:', data);
                setLogs(data);
                setLastUpdate(new Date().toLocaleString());
                setError(null);
            } catch (error) {
                console.error('Error fetching logs:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="text-gray-300">Loading...</div>;
    if (error) return <div className="text-red-400">Error: {error}</div>;
    if (!logs?.length) return <div className="text-gray-300">No logs found</div>;

    return (
        <div style={{
            backgroundColor: '#1a1b1e',
            minHeight: '100vh',
            padding: '1.5rem',
            color: '#e1e1e3'
        }}>
            <div style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: '#2c2d31',
                borderRadius: '0.5rem',
                border: '1px solid #3f3f46'
            }}>
                <p style={{ color: '#a1a1a3' }}>Last updated: {lastUpdate}</p>
                <p style={{ color: '#a1a1a3' }}>Logs loaded: {logs.length}</p>
                {loading && <p style={{ color: '#a1a1a3' }}>Refreshing...</p>}
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '50%' }}>
                    <AnomalousIPs />
                </div>
                <div style={{ width: '50%' }}>
                    <AttackTimeline />
                </div>
            </div>

            <div style={{
                backgroundColor: '#2c2d31',
                borderRadius: '0.5rem',
                border: '1px solid #3f3f46',
                padding: '1.5rem'
            }}>
                <h2 style={{
                    color: '#e1e1e3',
                    fontSize: '1.5rem',
                    marginBottom: '1rem'
                }}>Recent Logs</h2>
                {logs.length === 0 ? (
                    <p style={{ color: '#a1a1a3' }}>No logs found</p>
                ) : (
                    <div>
                        {logs.map((log, index) => (
                            <div
                                key={index}
                                style={{
                                    backgroundColor: '#1a1b1e',
                                    borderRadius: '0.5rem',
                                    marginBottom: '0.5rem',
                                    border: '1px solid #3f3f46',
                                    borderLeft: log.analysis_result?.injection_detected ?
                                        '4px solid #dc2626' : '4px solid #22c55e'
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
                                        {log.timestamp}
                                    </span>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.875rem',
                                        backgroundColor: log.analysis_result?.injection_detected ?
                                            'rgba(220, 38, 38, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                        color: log.analysis_result?.injection_detected ?
                                            '#dc2626' : '#22c55e'
                                    }}>
                                        {log.analysis_result?.injection_detected ? '⚠️ Attack Detected' : '✅ Normal'}
                                    </span>
                                </div>
                                <div style={{ padding: '0.75rem' }}>
                                    <p style={{ color: '#a1a1a3', marginBottom: '0.5rem' }}>
                                        <strong style={{ color: '#e1e1e3' }}>Method:</strong> {log.method}
                                    </p>
                                    <p style={{ color: '#a1a1a3', marginBottom: '0.5rem' }}>
                                        <strong style={{ color: '#e1e1e3' }}>Path:</strong> {log.path}
                                    </p>
                                    {log.query && (
                                        <p style={{ color: '#a1a1a3', marginBottom: '0.5rem' }}>
                                            <strong style={{ color: '#e1e1e3' }}>Query:</strong> {log.query}
                                        </p>
                                    )}
                                    <p style={{ color: '#a1a1a3', marginBottom: '0.5rem' }}>
                                        <strong style={{ color: '#e1e1e3' }}>IP:</strong> {log.ip}
                                    </p>
                                    {log.analysis_result?.matched_rules?.length > 0 && (
                                        <p style={{ color: '#a1a1a3', marginBottom: '0.5rem' }}>
                                            <strong style={{ color: '#e1e1e3' }}>Matched Rules:</strong>
                                            {log.analysis_result.matched_rules.join(', ')}
                                        </p>
                                    )}
                                    {log.analysis_result?.message && (
                                        <p style={{ color: '#a1a1a3', marginBottom: '0.5rem' }}>
                                            <strong style={{ color: '#e1e1e3' }}>Message:</strong>
                                            {log.analysis_result.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;