import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AttackTimeline = () => {
    const [timelineData, setTimelineData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://157.245.249.219:5000/api/attack-timeline');
                if (!response.ok) throw new Error('Failed to fetch timeline data');
                const data = await response.json();

                const processedData = data.map(entry => ({
                    ...entry,
                    formattedTime: new Date(entry.timestamp).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        hour12: true
                    })
                }));

                setTimelineData(processedData);
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="logs-container">
            <h2>Attack Timeline</h2>
            <div className="log-entry">Loading timeline data...</div>
        </div>
    );

    if (error) return (
        <div className="logs-container">
            <h2>Attack Timeline</h2>
            <div className="log-entry attack">Error: {error}</div>
        </div>
    );

    return (
        <div className="logs-container">
            <h2>Attack Timeline</h2>
            <div className="log-entry" style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={timelineData}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis
                            dataKey="formattedTime"
                            tick={{ fill: '#666' }}
                        />
                        <YAxis
                            tick={{ fill: '#666' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                            }}
                            formatter={(value, name) => [value, name === 'attacks' ? 'Attacks' : 'Total Requests']}
                        />
                        <Area
                            type="monotone"
                            dataKey="total_requests"
                            stroke="#8884d8"
                            fill="#8884d8"
                            fillOpacity={0.3}
                            name="Total Requests"
                        />
                        <Area
                            type="monotone"
                            dataKey="attacks"
                            stroke="#ff4d4f"
                            fill="#ff4d4f"
                            fillOpacity={0.3}
                            name="Attacks"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AttackTimeline;