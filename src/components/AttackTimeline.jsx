import React, { useState, useEffect } from 'react';
import { logRequest } from '../utils/logging';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="tooltip-container">
                <p className="tooltip-time">{label}</p>
                <p className="tooltip-value tooltip-attacks">
                  <span className="tooltip-label">Attacks:</span> {payload[0].value}
                </p>
                {payload[0].payload.total_requests && (
                    <p className="tooltip-value tooltip-requests">
                      <span className="tooltip-label">Total Requests:</span> {payload[0].payload.total_requests}
                    </p>
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
                    // Debug timestamps and ensure they're valid
                    console.log('First timestamp example:', data[0]?.timestamp);
                    
                    const processedData = data.map(entry => {
                        // Parse timestamp properly, making sure it's valid
                        let date;
                        try {
                            // Check if timestamp is Unix timestamp (number) or string
                            if (typeof entry.timestamp === 'number') {
                                date = new Date(entry.timestamp * 1000); // Convert seconds to milliseconds
                            } else {
                                date = new Date(entry.timestamp);
                            }
                            
                            // Validate date - if invalid, create a fallback
                            if (isNaN(date.getTime())) {
                                console.warn('Invalid timestamp detected:', entry.timestamp);
                                date = new Date(); // Fallback to current time
                            }
                        } catch (err) {
                            console.error('Error parsing timestamp:', err);
                            date = new Date(); // Fallback to current time
                        }
                        
                        return {
                            ...entry,
                            // Include full date and time in formatted string
                            formattedTime: date.toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric',
                                hour12: true
                            })
                        };
                    });

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
        <div className="card attack-timeline">
            <div className="card-header attack-timeline-header">
                <div className="card-title">
                    <h2>Attack Timeline</h2>
                    <div className="card-stats">
                        <span>Peak: {Math.max(...timelineData.map(d => d.attacks))}</span>
                        <span>Points: {timelineData.length}</span>
                    </div>
                </div>
            </div>
            
            <div className="card-content attack-timeline-content">
                <div style={{ width: '100%', height: '200px' }} className="mt-2">
                <ResponsiveContainer>
                    <AreaChart
                        data={timelineData}
                        margin={{ top: 5, right: 10, left: 0, bottom: 30 }}
                    >
                        <defs>
                            <linearGradient id="attackGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(71, 85, 105, 0.3)" />
                        <XAxis
                            dataKey="formattedTime"
                            stroke="#94a3b8"
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                            tickFormatter={(value) => value}
                            interval={Math.ceil(timelineData.length / 6)}
                            angle={-35}
                            textAnchor="end"
                            height={65}
                            axisLine={{ stroke: 'rgba(71, 85, 105, 0.5)' }}
                            tickLine={{ stroke: 'rgba(71, 85, 105, 0.5)' }}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            tick={{ fill: '#94a3b8' }}
                            axisLine={{ stroke: 'rgba(71, 85, 105, 0.5)' }}
                            tickLine={{ stroke: 'rgba(71, 85, 105, 0.5)' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="attacks"
                            stroke="#3b82f6"
                            fill="url(#attackGradient)"
                            strokeWidth={2}
                            activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}