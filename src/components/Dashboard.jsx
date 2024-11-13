// Dashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import AnomalousIPs from "./AnomalousIPs.jsx";
import AttackTimeline from "./AttackTimeline.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";

const API_URL = 'http://157.245.249.219:5000';

const DashboardContent = () => {
    const [state, setState] = useState({
        logs: [],
        loading: true,
        error: null,
        lastUpdate: new Date().toLocaleString(),
        retryCount: 0,
        isPollingPaused: false
    });

    const fetchData = useCallback(async () => {
        if (state.isPollingPaused) return;

        try {
            console.log('Fetching logs... Attempt:', state.retryCount + 1);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(`${API_URL}/api/logs`, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error('Invalid data format received');
            }

            setState(prev => ({
                ...prev,
                logs: data,
                lastUpdate: new Date().toLocaleString(),
                error: null,
                retryCount: 0,
                loading: false
            }));

        } catch (error) {
            console.error('Error fetching logs:', error);

            setState(prev => {
                const newState = {
                    ...prev,
                    error: error.name === 'AbortError' ? 'Request timed out. Retrying...' : error.message,
                    loading: false
                };

                if (prev.retryCount < 3) {
                    setTimeout(() => {
                        setState(current => ({
                            ...current,
                            retryCount: current.retryCount + 1
                        }));
                    }, Math.min(1000 * Math.pow(2, prev.retryCount), 10000));
                } else {
                    newState.isPollingPaused = true;
                    setTimeout(() => {
                        setState(current => ({
                            ...current,
                            isPollingPaused: false,
                            retryCount: 0
                        }));
                    }, 30000);
                }

                return newState;
            });
        }
    }, [state.retryCount, state.isPollingPaused]);

    useEffect(() => {
        fetchData();

        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleRetry = useCallback(() => {
        setState(prev => ({
            ...prev,
            isPollingPaused: false,
            retryCount: 0,
            loading: true
        }));
    }, []);

    if (state.loading && !state.logs.length) {
        return <div className="text-gray-300">Loading...</div>;
    }

    return (
        <div className="min-h-screen p-6 bg-[#1a1b1e] text-[#e1e1e3]">
            <div className="mb-6 p-4 bg-[#2c2d31] rounded-lg border border-[#3f3f46]">
                <p className="text-[#a1a1a3]">Last updated: {state.lastUpdate}</p>
                <p className="text-[#a1a1a3]">Logs loaded: {state.logs.length}</p>
                {state.loading && <p className="text-[#a1a1a3]">Refreshing...</p>}
                {state.error && (
                    <div className="mt-2 p-2 bg-red-900/20 rounded border border-red-700">
                        <div className="text-red-400 flex items-center justify-between">
                            <span>Error: {state.error}</span>
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

            <div className="bg-[#2c2d31] rounded-lg border border-[#3f3f46] p-6">
                <h2 className="text-2xl mb-4">Recent Logs</h2>
                {state.logs.length === 0 ? (
                    <p className="text-[#a1a1a3]">No logs found</p>
                ) : (
                    <div className="space-y-2">
                        {state.logs.map((log, index) => (
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