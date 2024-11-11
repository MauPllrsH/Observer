import React, { useState, useEffect } from 'react';

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
                        minute: 'numeric',
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

    const maxAttacks = Math.max(...timelineData.map(d => d.attacks)) || 1;
    const graphHeight = 200;
    const graphWidth = '100%';

    // Create points for the SVG path
    const points = timelineData.map((entry, index) => {
        const x = (index / (timelineData.length - 1)) * 100;
        const y = 100 - ((entry.attacks / maxAttacks) * 100);
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="logs-container">
            <h2>Attack Timeline (Last 24 Hours)</h2>
            <div className="log-entry">
                <div style={{ padding: '1rem' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '1rem'
                    }}>
                        <span style={{ color: '#666' }}>Peak Attacks: {maxAttacks}</span>
                        <span style={{ color: '#666' }}>Data Points: {timelineData.length}</span>
                    </div>

                    <div style={{
                        position: 'relative',
                        height: `${graphHeight}px`,
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        borderRadius: '4px',
                        padding: '1rem'
                    }}>
                        <svg
                            width="100%"
                            height="100%"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                padding: '1rem'
                            }}
                        >
                            {/* Grid lines */}
                            <line x1="0" y1="25" x2="100" y2="25" stroke="#ddd" strokeWidth="0.2" />
                            <line x1="0" y1="50" x2="100" y2="50" stroke="#ddd" strokeWidth="0.2" />
                            <line x1="0" y1="75" x2="100" y2="75" stroke="#ddd" strokeWidth="0.2" />

                            {/* Attack line */}
                            <polyline
                                points={points}
                                fill="none"
                                stroke="rgba(255, 77, 79, 0.8)"
                                strokeWidth="1"
                            />

                            {/* Data points */}
                            {timelineData.map((entry, index) => {
                                const x = (index / (timelineData.length - 1)) * 100;
                                const y = 100 - ((entry.attacks / maxAttacks) * 100);
                                return (
                                    <circle
                                        key={index}
                                        cx={x}
                                        cy={y}
                                        r="1.5"
                                        fill="rgba(255, 77, 79, 0.8)"
                                    >
                                        <title>{`Time: ${entry.formattedTime}
Attacks: ${entry.attacks}
Total Requests: ${entry.total_requests}`}</title>
                                    </circle>
                                );
                            })}
                        </svg>

                        {/* Y-axis labels */}
                        <div style={{
                            position: 'absolute',
                            left: '-30px',
                            top: 0,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            color: '#666',
                            fontSize: '0.8rem',
                            padding: '0.5rem 0'
                        }}>
                            <span>{maxAttacks}</span>
                            <span>{Math.floor(maxAttacks * 0.75)}</span>
                            <span>{Math.floor(maxAttacks * 0.5)}</span>
                            <span>{Math.floor(maxAttacks * 0.25)}</span>
                            <span>0</span>
                        </div>

                        {/* X-axis labels */}
                        <div style={{
                            position: 'absolute',
                            bottom: '-25px',
                            left: 0,
                            right: 0,
                            display: 'flex',
                            justifyContent: 'space-between',
                            color: '#666',
                            fontSize: '0.8rem',
                            padding: '0 1rem'
                        }}>
                            {timelineData.map((entry, index) => (
                                index % Math.ceil(timelineData.length / 5) === 0 && (
                                    <span key={index} style={{
                                        transform: 'rotate(-45deg)',
                                        transformOrigin: 'top left',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {entry.formattedTime}
                                    </span>
                                )
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttackTimeline;