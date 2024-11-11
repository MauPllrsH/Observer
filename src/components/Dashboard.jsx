import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000'; // Use the service name from docker-compose

const Dashboard = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!logs?.length) return <div>No logs found</div>;


    return (
        <div className="dashboard">
            <div className="status-bar">
                <p>Last updated: {lastUpdate}</p>
                <p>Logs loaded: {logs.length}</p>
                {loading && <p>Refreshing...</p>}
            </div>

            <div className="logs-container">
                <h2>Recent Logs</h2>
                {logs.length === 0 ? (
                    <p>No logs found</p>
                ) : (
                    <div className="logs-table">
                        {logs.map((log, index) => (
                            <div
                                key={index}
                                className={`log-entry ${log.analysis_result?.injection_detected ? 'attack' : 'normal'}`}
                            >
                                <div className="log-header">
                                    <span className="timestamp">{log.timestamp}</span>
                                    <span className={`status ${log.analysis_result?.injection_detected ? 'attack' : 'normal'}`}>
                    {log.analysis_result?.injection_detected ? '⚠️ Attack Detected' : '✅ Normal'}
                  </span>
                                </div>
                                <div className="log-details">
                                    <p><strong>Method:</strong> {log.method}</p>
                                    <p><strong>Path:</strong> {log.path}</p>
                                    {log.query && <p><strong>Query:</strong> {log.query}</p>}
                                    <p><strong>IP:</strong> {log.ip}</p>
                                    {log.analysis_result?.matched_rules?.length > 0 && (
                                        <p><strong>Matched Rules:</strong> {log.analysis_result.matched_rules.join(', ')}</p>
                                    )}
                                    {log.analysis_result?.message && (
                                        <p><strong>Message:</strong> {log.analysis_result.message}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dashboard