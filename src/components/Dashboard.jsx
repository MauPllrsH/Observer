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

    const fetchWithTimeout = async (url, options = {}, timeout = 5000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            clearTimeout(id);
            return data;
        } catch (error) {
            clearTimeout(id);
            throw error;
        }
    };

    const fetchData = useCallback(async () => {
        if (state.isPollingPaused) return;

        const backoffDelay = (attempt) => Math.min(1000 * Math.pow(2, attempt), 10000);

        try {
            console.log('Fetching logs... Attempt:', state.retryCount + 1);

            const data = await fetchWithTimeout(`${API_URL}/api/logs`);

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
                    error: error.name === 'AbortError' ? 'Request timed out' :
                        error.message.includes('reset') ? 'Connection reset - retrying...' :
                            error.message,
                    loading: false
                };

                if (prev.retryCount < 3) {
                    setTimeout(() => {
                        setState(current => ({
                            ...current,
                            retryCount: current.retryCount + 1
                        }));
                    }, backoffDelay(prev.retryCount));
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
        let mounted = true;
        let pollInterval;

        const startPolling = async () => {
            if (!mounted) return;

            try {
                await fetchData();

                if (mounted) {
                    pollInterval = setInterval(() => {
                        if (mounted && !state.isPollingPaused) {
                            fetchData();
                        }
                    }, 5000);
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        };

        startPolling();

        return () => {
            mounted = false;
            if (pollInterval) {
                clearInterval(pollInterval);
            }
        };
    }, [fetchData]);

    const handleRetry = useCallback(() => {
        setState(prev => ({
            ...prev,
            isPollingPaused: false,
            retryCount: 0,
            loading: true
        }));
    }, []);
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