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
                    
                    // Ensure we have valid data
                    const validData = data.filter(entry => entry && entry.timestamp && entry.attacks !== undefined);
                    console.log('Filtered valid data items:', validData.length);
                    
                    // Check for -Infinity values and debug
                    const hasNegInfinity = validData.some(entry => entry.attacks === -Infinity);
                    if (hasNegInfinity) {
                        console.warn('Detected -Infinity values in data, fixing...');
                    }
                    
                    const processedData = validData.map(entry => {
                        // Fix any -Infinity values
                        const attacks = entry.attacks === -Infinity ? 0 : entry.attacks;
                        
                        // Parse timestamp properly, making sure it's valid
                        let date;
                        try {
                            // Check if timestamp is Unix timestamp (number) or string
                            if (typeof entry.timestamp === 'number') {
                                date = new Date(entry.timestamp * 1000); // Convert seconds to milliseconds
                            } else {
                                // Handle ISO strings or other formats
                                date = new Date(entry.timestamp);
                            }
                            
                            // Extra validation - if date is invalid or wildly off (like year 0), use now
                            if (isNaN(date.getTime()) || date.getFullYear() < 2000) {
                                console.warn('Invalid timestamp detected, using current time:', entry.timestamp);
                                date = new Date(); // Fallback to current time
                            }
                        } catch (err) {
                            console.error('Error parsing timestamp:', err);
                            date = new Date(); // Fallback to current time
                        }
                        
                        // Use UTC methods to avoid timezone issues
                        const formattedTime = new Intl.DateTimeFormat('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true,
                            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone // Use local timezone explicitly
                        }).format(date);
                        
                        return {
                            ...entry,
                            attacks, // Use fixed attacks value
                            formattedTime
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

    // Validate that we have good data to display
    const hasValidData = timelineData && timelineData.length > 0 && 
                         timelineData.every(item => 
                           typeof item.attacks === 'number' && 
                           !isNaN(item.attacks) && 
                           isFinite(item.attacks));
    
    if (loading) {
        return (
            <div className="card">
                <div className="card-loading">
                    <div className="spinner"></div>
                    <span>Loading timeline data...</span>
                </div>
            </div>
        );
    }

    if (error || !hasValidData) {
        return (
            <div className="card">
                <div className="card-error">
                    <div className="error-message">
                        <span>
                            {error || "Invalid data received. Please try refreshing."}
                        </span>
                    </div>
                </div>
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
                        isAnimationActive={false} // Disable animation for better stability
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
                            allowDecimals={false}
                            domain={[0, 'auto']} // Ensure y-axis starts at 0 and prevents negative values
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