import React, { useState, useEffect } from 'react';
import { logRequest } from '../utils/logging';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-lg">
                <p className="text-gray-200">Time: {label}</p>
                <p className="text-red-400">Attacks: {payload[0].value}</p>
                {payload[0].payload.total_requests && (
                    <p className="text-blue-400">Total Requests: {payload[0].payload.total_requests}</p>
                )}
            </div>
        );
    }
    return null;
};

export default function AttackTimeline() {
    const [timelineData, setTimelineData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastFetch, setLastFetch] = useState(null);

    useEffect(() => {
        let mounted = true;
        let interval = null;

        const fetchData = async () => {
            try {
                logRequest('AttackTimeline', 'fetching data', { lastFetch });
                const response = await fetch('http://157.245.249.219:5000/api/attack-timeline');

                if (!response.ok) {
                    throw new Error('Failed to fetch timeline data');
                }

                const data = await response.json();
                logRequest('AttackTimeline', 'received data', { count: data.length });

                if (mounted) {
                    const processedData = data.map(entry => ({
                        ...entry,
                        formattedTime: new Date(entry.timestamp).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true
                        })
                    }));

                    setTimelineData(processedData);
                    setLastFetch(new Date().toISOString());
                    setError(null);
                }
            } catch (err) {
                logRequest('AttackTimeline', 'error', { error: err.message });
                if (mounted) {
                    setError(err.message);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();
        interval = setInterval(fetchData, 5000);

        return () => {
            logRequest('AttackTimeline', 'cleanup');
            mounted = false;
            if (interval) {
                clearInterval(interval);
            }
        };
    }, []);

    if (loading) {
        return (
            <div className="bg-gray-800 p-6 rounded-lg">
                <div className="animate-pulse text-gray-400">Loading timeline data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-800 p-6 rounded-lg">
                <div className="text-red-500">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl text-gray-200">Attack Timeline (Last 24 Hours)</h2>
                <div className="flex gap-4 text-sm text-gray-400">
                    <span>Peak Attacks: {Math.max(...timelineData.map(d => d.attacks))}</span>
                    <span>Data Points: {timelineData.length}</span>
                </div>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={timelineData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="attackGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                            dataKey="formattedTime"
                            stroke="#9ca3af"
                            tick={{ fill: '#9ca3af' }}
                            tickFormatter={(value) => value}
                            interval={Math.ceil(timelineData.length / 5)}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            tick={{ fill: '#9ca3af' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="attacks"
                            stroke="#ef4444"
                            fill="url(#attackGradient)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}