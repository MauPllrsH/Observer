import React, { useState, useEffect } from 'react';
import { logRequest } from '../utils/logging';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AttackTimeline() {
    const [timelineData, setTimelineData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('http://157.245.249.219:5000/api/attack-timeline')
            .then(response => response.json())
            .then(data => {
                const processedData = data.map(entry => ({
                    ...entry,
                    formattedTime: new Date(entry.timestamp).toLocaleTimeString()
                }));
                setTimelineData(processedData);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    console.log('Timeline Data:', timelineData);

    return (
        <div className="w-full h-[400px] bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl text-gray-200 mb-4">Attack Timeline</h2>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="formattedTime" />
                        <YAxis dataKey="attacks" />
                        <Tooltip />
                        <Line type="monotone" dataKey="attacks" stroke="#ef4444" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}