import { useState, useEffect, useCallback } from 'react';
import AnomalousIPs from "./AnomalousIPs.jsx";
import AttackTimeline from "./AttackTimeline.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";

const API_URL = 'http://157.245.249.219:5000';

const fetchWithRetry = async (url, maxRetries = 3) => {
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            attempt++;
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

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchWithRetry(`${API_URL}/api/logs`);

            if (!Array.isArray(data)) {
                throw new Error('Invalid data format received');
            }

            setLogs(data);
            setLastUpdate(new Date().toLocaleString());
            setError(null);
        } catch (error) {
            console.error('Error fetching logs:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        let interval;

        const startPolling = async () => {
            if (!mounted) return;
            await fetchData();

            if (mounted) {
                interval = setInterval(fetchData, 5000);
            }
        };

        startPolling();

        return () => {
            mounted = false;
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [fetchData]);


    const handleRetry = useCallback(() => {
        setIsPollingPaused(false);
        setRetryCount(0);
        setLoading(true);
        setError(null);
    }, []);

    if (loading && !logs.length) {
        return (
            <div className="min-h-screen p-6 bg-[#1a1b1e] text-[#e1e1e3]">
                <div className="flex items-center justify-center p-4">
                    <div className="animate-spin mr-2">⟳</div> Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 bg-[#1a1b1e] text-[#e1e1e3]">
            {/* Status Bar */}
            <div className="mb-6 p-4 bg-[#2c2d31] rounded-lg border border-[#3f3f46]">
                <p className="text-[#a1a1a3]">Last updated: {lastUpdate}</p>
                <p className="text-[#a1a1a3]">Logs loaded: {logs.length}</p>
                {loading && <p className="text-[#a1a1a3]">Refreshing...</p>}
                {error && (
                    <div className="mt-2 p-2 bg-red-900/20 rounded border border-red-700">
                        <div className="text-red-400 flex items-center justify-between">
                            <span>Error: {error}</span>
                            <button
                                onClick={handleRetry}
                                className="px-3 py-1 bg-red-900/30 rounded hover:bg-red-900/50 transition-colors"
                            >
                                Retry Now
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Component panels */}
            <div className="flex gap-6 mb-6">
                <div className="w-1/2">
                    <ErrorBoundary>
                        <AnomalousIPs />
                    </ErrorBoundary>
                </div>
                <div className="w-1/2">
                    <ErrorBoundary>
                        <AttackTimeline />
                    </ErrorBoundary>
                </div>
            </div>

            {/* Logs panel */}
            <div className="bg-[#2c2d31] rounded-lg border border-[#3f3f46] p-6">
                <h2 className="text-2xl mb-4">Recent Logs</h2>
                {logs.length === 0 ? (
                    <p className="text-[#a1a1a3]">No logs found</p>
                ) : (
                    <div className="space-y-2">
                        {logs.map((log, index) => (
                            <div
                                key={index}
                                className={`bg-[#1a1b1e] rounded-lg border border-[#3f3f46] 
                                    ${log.analysis_result?.injection_detected
                                    ? 'border-l-4 border-l-red-600'
                                    : 'border-l-4 border-l-green-500'}`}
                            >
                                <div className="p-3 flex justify-between items-center border-b border-[#3f3f46]">
                                    <span className="text-sm text-[#a1a1a3]">
                                        {log.timestamp}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-sm
                                        ${log.analysis_result?.injection_detected
                                        ? 'bg-red-600/10 text-red-600'
                                        : 'bg-green-500/10 text-green-500'}`}>
                                        {log.analysis_result?.injection_detected ? '⚠️ Attack Detected' : '✅ Normal'}
                                    </span>
                                </div>
                                <div className="p-3 space-y-2">
                                    <p className="text-[#a1a1a3]">
                                        <strong className="text-[#e1e1e3]">Method:</strong> {log.method}
                                    </p>
                                    <p className="text-[#a1a1a3]">
                                        <strong className="text-[#e1e1e3]">Path:</strong> {log.path}
                                    </p>
                                    {log.query && (
                                        <p className="text-[#a1a1a3]">
                                            <strong className="text-[#e1e1e3]">Query:</strong> {log.query}
                                        </p>
                                    )}
                                    <p className="text-[#a1a1a3]">
                                        <strong className="text-[#e1e1e3]">IP:</strong> {log.ip}
                                    </p>
                                    {log.analysis_result?.matched_rules?.length > 0 && (
                                        <p className="text-[#a1a1a3]">
                                            <strong className="text-[#e1e1e3]">Matched Rules:</strong>
                                            {log.analysis_result.matched_rules.join(', ')}
                                        </p>
                                    )}
                                    {log.analysis_result?.message && (
                                        <p className="text-[#a1a1a3]">
                                            <strong className="text-[#e1e1e3]">Message:</strong>
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
};

const Dashboard = () => {
    return (
        <ErrorBoundary>
            <DashboardContent />
        </ErrorBoundary>
    );
};

export default Dashboard;