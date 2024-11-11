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

    // Find the maximum values for scaling
    const maxTotal = Math.max(...timelineData.map(d => d.total_requests));
    const maxAttacks = Math.max(...timelineData.map(d => d.attacks));

    return (
        <div className="logs-container">
            <h2>Attack Timeline</h2>
            <div className="log-entry">
                <div className="timeline-stats">
                    <div className="stat-box">
                        <span className="stat-label">Peak Requests</span>
                        <span className="stat-value">{maxTotal}</span>
                    </div>
                    <div className="stat-box attack">
                        <span className="stat-label">Peak Attacks</span>
                        <span className="stat-value">{maxAttacks}</span>
                    </div>
                </div>
                <div className="timeline-container">
                    {timelineData.map((entry, index) => {
                        const totalHeight = (entry.total_requests / maxTotal) * 100;
                        const attackHeight = (entry.attacks / maxTotal) * 100;

                        return (
                            <div key={index} className="timeline-bar">
                                <div className="bar-container">
                                    <div
                                        className="total-bar"
                                        style={{ height: `${totalHeight}%` }}
                                        title={`Total Requests: ${entry.total_requests}`}
                                    />
                                    <div
                                        className="attack-bar"
                                        style={{ height: `${attackHeight}%` }}
                                        title={`Attacks: ${entry.attacks}`}
                                    />
                                </div>
                                <span className="time-label">{entry.formattedTime}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style jsx>{`
                .timeline-stats {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1rem;
                    padding: 0.5rem;
                }

                .stat-box {
                    flex: 1;
                    padding: 0.5rem;
                    border-radius: 4px;
                    background: rgba(0, 0, 255, 0.1);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .stat-box.attack {
                    background: rgba(255, 0, 0, 0.1);
                }

                .stat-label {
                    font-size: 0.875rem;
                    color: #666;
                }

                .stat-value {
                    font-size: 1.25rem;
                    font-weight: bold;
                }

                .timeline-container {
                    height: 300px;
                    display: flex;
                    align-items: flex-end;
                    gap: 4px;
                    padding: 1rem;
                    background: rgba(0, 0, 0, 0.02);
                    border-radius: 4px;
                }

                .timeline-bar {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    min-width: 30px;
                }

                .bar-container {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                }

                .total-bar {
                    width: 100%;
                    background: rgba(0, 0, 255, 0.2);
                    transition: height 0.3s ease;
                    border-radius: 2px 2px 0 0;
                }

                .attack-bar {
                    width: 100%;
                    background: rgba(255, 0, 0, 0.3);
                    position: absolute;
                    bottom: 0;
                    transition: height 0.3s ease;
                    border-radius: 2px 2px 0 0;
                }

                .time-label {
                    font-size: 0.75rem;
                    color: #666;
                    margin-top: 0.5rem;
                    transform: rotate(-45deg);
                    white-space: nowrap;
                }
            `}</style>
        </div>
    );
};

export default AttackTimeline;