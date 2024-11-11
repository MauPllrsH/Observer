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

    const getThreatLevelColor = (level) => {
        if (level >= 75) return 'bg-red-100 text-red-700 border-red-300';
        if (level >= 50) return 'bg-orange-100 text-orange-700 border-orange-300';
        if (level >= 25) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
        return 'bg-green-100 text-green-700 border-green-300';
    };

    const getThreatLevelEmoji = (level) => {
        if (level >= 75) return '🔥';
        if (level >= 50) return '⚠️';
        if (level >= 25) return '⚡';
        return '✓';
    };

    if (loading) return (
        <div className="p-8 text-center">
            <div className="animate-spin text-3xl mb-4">⚙️</div>
            <p className="text-gray-600">Analyzing threat data...</p>
        </div>
    );

    if (error) return (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <div className="flex items-center">
                <span className="text-2xl mr-3">⚠️</span>
                <div>
                    <h3 className="text-red-800 font-bold">Error Loading Data</h3>
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-gradient-to-br from-slate-50 to-white shadow-lg rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🛡️</span>
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Threat Monitor
                        </h2>
                        <p className="text-sm text-gray-500">Real-time security analysis</p>
                    </div>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-full">
                    <span className="text-sm text-blue-600 font-medium">
                        {anomalousIPs.length} Active Threats
                    </span>
                </div>
            </div>

            <div className="space-y-4">
                {anomalousIPs.length === 0 ? (
                    <div className="text-center py-12 bg-green-50 rounded-lg">
                        <span className="text-4xl mb-4 block">✨</span>
                        <h3 className="text-lg font-medium text-green-700">All Clear</h3>
                        <p className="text-green-600">No threats detected in the system</p>
                    </div>
                ) : (
                    anomalousIPs.map((ip) => (
                        <div
                            key={ip.ip}
                            className={`rounded-lg p-5 border transition-all duration-200 hover:shadow-md
                                ${getThreatLevelColor(ip.threat_level)}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{getThreatLevelEmoji(ip.threat_level)}</span>
                                    <div>
                                        <h3 className="font-bold text-lg">{ip.ip}</h3>
                                        <p className="text-sm opacity-75">
                                            Last activity: {new Date(ip.last_detected).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-white bg-opacity-50 px-3 py-1.5 rounded-full">
                                    <span className="text-base">📊</span>
                                    <span className="font-bold">
                                        {ip.threat_level.toFixed(1)}% Risk
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mt-4">
                                <div className="bg-white bg-opacity-50 rounded-lg p-3">
                                    <p className="text-sm font-medium mb-1">Total Requests</p>
                                    <p className="text-2xl font-bold">{ip.total_requests.toLocaleString()}</p>
                                </div>
                                <div className="bg-white bg-opacity-50 rounded-lg p-3">
                                    <p className="text-sm font-medium mb-1">Anomalous Requests</p>
                                    <p className="text-2xl font-bold">{ip.anomalous_requests.toLocaleString()}</p>
                                </div>
                            </div>

                            {ip.matched_rules.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-opacity-20">
                                    <p className="text-sm font-medium mb-2">Detected Patterns</p>
                                    <div className="flex flex-wrap gap-2">
                                        {ip.matched_rules.map((rule) => (
                                            <span
                                                key={rule}
                                                className="px-3 py-1 bg-white bg-opacity-50 rounded-full text-xs font-medium"
                                            >
                                                {rule}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AnomalousIPs;