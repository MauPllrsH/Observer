// AnomalousIPs.jsx
import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Activity } from 'lucide-react';

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
        if (level >= 75) return 'text-red-500';
        if (level >= 50) return 'text-orange-500';
        if (level >= 25) return 'text-yellow-500';
        return 'text-green-500';
    };

    if (loading) return <div className="p-4">Loading threat analysis...</div>;
    if (error) return <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>;

    return (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5" />
                <h2 className="text-xl font-bold">Detected Threats</h2>
            </div>

            <div className="space-y-4">
                {anomalousIPs.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No threats detected</div>
                ) : (
                    anomalousIPs.map((ip) => (
                        <div key={ip.ip} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className={`w-5 h-5 ${getThreatLevelColor(ip.threat_level)}`} />
                                    <h3 className="font-medium">{ip.ip}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Activity className="w-4 h-4" />
                                    <span className={`font-bold ${getThreatLevelColor(ip.threat_level)}`}>
                                        {ip.threat_level.toFixed(1)}% Risk
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                                <div>
                                    <p className="text-gray-500">Total Requests</p>
                                    <p className="font-medium">{ip.total_requests}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Anomalous Requests</p>
                                    <p className="font-medium text-red-500">{ip.anomalous_requests}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-gray-500">Last Detected</p>
                                    <p className="font-medium">{new Date(ip.last_detected).toLocaleString()}</p>
                                </div>
                                {ip.matched_rules.length > 0 && (
                                    <div className="col-span-2">
                                        <p className="text-gray-500">Matched Rules</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {ip.matched_rules.map((rule) => (
                                                <span key={rule} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                    {rule}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AnomalousIPs;