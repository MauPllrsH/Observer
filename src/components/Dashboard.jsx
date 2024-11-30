import { useState, useEffect, useCallback } from 'react';
import AnomalousIPs from "./AnomalousIPs.jsx";
import AttackTimeline from "./AttackTimeline.jsx";
import LogsPanel from "./LogsPanel.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";
import { logRequest } from '../utils/logging';

const API_URL = 'http://157.245.249.219:5000';

const fetchWithRetry = async (url, options = {}, maxRetries = 3) => {
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            attempt++;
            logRequest('fetchWithRetry', 'attempt failed', { attempt, error: error.message });
            if (attempt === maxRetries) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        }
    }
};

const DashboardContent = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleString());
    const [lastTimestamp, setLastTimestamp] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            logRequest('Dashboard', 'fetching logs', { lastTimestamp });

            const url = new URL(`${API_URL}/api/logs`);
            if (lastTimestamp) {
                url.searchParams.append('since', lastTimestamp);
            }

            const data = await fetchWithRetry(url.toString());
            logRequest('Dashboard', 'received logs', { count: data.length });

            if ('error' in data) {
                throw new Error(data.error);
            }

            if (!Array.isArray(data)) {
                throw new Error('Invalid data format received');
            }

            // Update logs and timestamp
            setLogs(prevLogs => {
                if (!lastTimestamp) return data;

                // Merge new logs with existing logs
                const newLogs = [...prevLogs];
                data.forEach(log => {
                    const index = newLogs.findIndex(l => l.timestamp === log.timestamp);
                    if (index === -1) {
                        newLogs.push(log);
                    }
                });

                // Sort by timestamp descending
                return newLogs.sort((a, b) =>
                    new Date(b.timestamp) - new Date(a.timestamp)
                ).slice(0, 100); // Keep only latest 100 logs
            });

            // Update last timestamp from the newest log
            if (data.length > 0) {
                const timestamps = data.map(log => new Date(log.timestamp));
                const newestTimestamp = new Date(Math.max(...timestamps));
                setLastTimestamp(newestTimestamp.toISOString());
            }

            setLastUpdate(new Date().toLocaleString());
            setError(null);
        } catch (error) {
            logRequest('Dashboard', 'error', { error: error.message });
            console.error('Error fetching logs:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [lastTimestamp]);

    useEffect(() => {
        let mounted = true;
        let interval = null;

        const startPolling = async () => {
            if (!mounted) return;

            try {
                await fetchData();

                if (mounted) {
                    interval = setInterval(async () => {
                        if (mounted) {
                            try {
                                await fetchData();
                            } catch (error) {
                                logRequest('Dashboard', 'polling error', { error: error.message });
                            }
                        }
                    }, 5000);
                }
            } catch (error) {
                logRequest('Dashboard', 'initial polling error', { error: error.message });
                if (mounted) {
                    setTimeout(startPolling, 5000);
                }
            }
        };

        startPolling().catch(error => {
            logRequest('Dashboard', 'polling start failed', { error: error.message });
        });

        return () => {
            logRequest('Dashboard', 'cleanup');
            mounted = false;
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [fetchData]);

    const handleRetry = useCallback(() => {
        setLoading(true);
        setError(null);
        fetchData().catch(error => {
            console.error('Retry failed:', error);
        });
    }, [fetchData]);

    if (loading && !logs.length) {
        return (
            <div style={{
                minHeight: '100vh',
                padding: '1.5rem',
                backgroundColor: '#1a1b1e',
                color: '#e1e1e3'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}>
                    <div style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }}>⟳</div>
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            padding: '1.5rem',
            backgroundColor: '#1a1b1e',
            color: '#e1e1e3'
        }}>
            {/* Status Bar */}
            <div style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: '#2c2d31',
                borderRadius: '0.5rem',
                border: '1px solid #3f3f46'
            }}>
                <div style={{ color: '#a1a1a3', marginBottom: '0.5rem' }}>Last updated: {lastUpdate}</div>
                <div style={{ color: '#a1a1a3' }}>Logs loaded: {logs.length}</div>
                {loading && <div style={{ color: '#a1a1a3' }}>Refreshing...</div>}
                {error && (
                    <div style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        backgroundColor: 'rgba(220, 38, 38, 0.1)',
                        borderRadius: '0.5rem',
                        border: '1px solid #dc2626'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            color: '#dc2626'
                        }}>
                            <span>Error: {error}</span>
                            <button
                                onClick={handleRetry}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: 'rgba(220, 38, 38, 0.2)',
                                    borderRadius: '0.25rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Retry Now
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Component Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1.5rem',
                marginBottom: '1.5rem'
            }}>
                <ErrorBoundary>
                    <AnomalousIPs />
                </ErrorBoundary>
                <ErrorBoundary>
                    <AttackTimeline />
                </ErrorBoundary>
            </div>

            {/* Logs Panel */}
            <ErrorBoundary>
                <LogsPanel logs={logs} loading={loading} />
            </ErrorBoundary>
        </div>
    );
};

const Dashboard = () => (
    <ErrorBoundary>
        <DashboardContent />
    </ErrorBoundary>
);

export default Dashboard;