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

    return (
        <div className="logs-container">
            <h2>Attack Timeline (Last 24 Hours)</h2>
            <div className="log-entry">
                <div style={{
                    height: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    padding: '1rem'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.5rem',
                        backgroundColor: 'rgba(255, 0, 0, 0.1)',
                        borderRadius: '4px'
                    }}>
                        <span>Peak Attacks: {maxAttacks}</span>
                        <span>Total Points: {timelineData.length}</span>
                    </div>

                    <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: '2px',
                        padding: '20px 0',
                        position: 'relative',
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        borderRadius: '4px'
                    }}>
                        {timelineData.map((entry, index) => (
                            <div
                                key={index}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    height: '100%',
                                    position: 'relative'
                                }}
                            >
                                <div style={{
                                    width: '100%',
                                    height: `${(entry.attacks / maxAttacks) * 100}%`,
                                    backgroundColor: entry.attacks > 0 ? 'rgba(255, 77, 79, 0.6)' : 'rgba(0, 0, 0, 0.1)',
                                    transition: 'height 0.3s ease',
                                    position: 'relative',
                                    cursor: 'pointer'
                                }}
                                     title={`Time: ${entry.formattedTime}
Attacks: ${entry.attacks}
Total Requests: ${entry.total_requests}`}
                                />
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-25px',
                                    fontSize: '0.7rem',
                                    transform: 'rotate(-45deg)',
                                    transformOrigin: 'top left',
                                    whiteSpace: 'nowrap',
                                    color: '#666'
                                }}>
                                    {entry.formattedTime}
                                </div>
                            </div>
                        ))}

                        {/* Y-axis markers */}
                        <div style={{
                            position: 'absolute',
                            left: '-40px',
                            top: 0,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            color: '#666',
                            fontSize: '0.8rem'
                        }}>
                            <span>{maxAttacks}</span>
                            <span>{Math.floor(maxAttacks / 2)}</span>
                            <span>0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttackTimeline;