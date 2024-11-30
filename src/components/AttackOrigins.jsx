import React, { useState, useEffect } from 'react';
import { logRequest } from '../utils/logging';
import worldMap from 'src/assets/world-map.svg';

const AttackOrigins = () => {
    const [attackData, setAttackData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPoint, setSelectedPoint] = useState(null);

    useEffect(() => {
        let mounted = true;
        let interval = null;

        const fetchData = async () => {
            try {
                logRequest('AttackOrigins', 'fetching data', {});
                const response = await fetch('http://157.245.249.219:5000/api/attack-origins');

                if (!response.ok) {
                    throw new Error('Failed to fetch attack origins');
                }

                const data = await response.json();
                if (mounted) {
                    setAttackData(data);
                    setError(null);
                }
            } catch (err) {
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
            mounted = false;
            if (interval) clearInterval(interval);
        };
    }, []);

    // Convert lat/long to SVG coordinates
    // These coordinates are specifically for the Natural Earth SVG projection
    const latLongToXY = (lat, long) => {
        // The viewBox of the Natural Earth SVG is typically "0 0 2000 1001"
        const mapWidth = 2000;
        const mapHeight = 1001;

        // Convert the coordinates using the Mercator projection
        const x = (long + 180) * (mapWidth / 360);
        const y = (mapHeight / 2) - (mapWidth * Math.log(Math.tan((Math.PI / 4) + (lat * Math.PI / 360))) / (2 * Math.PI));

        return [x, y];
    };

    if (loading) {
        return (
            <div style={{
                backgroundColor: '#2c2d31',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                color: '#a1a1a3'
            }}>
                Loading attack map...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                backgroundColor: '#2c2d31',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                color: '#dc2626'
            }}>
                Error: {error}
            </div>
        );
    }

    return (
        <div style={{
            backgroundColor: '#2c2d31',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            border: '1px solid #3f3f46'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
            }}>
                <h2 style={{
                    color: '#e1e1e3',
                    fontSize: '1.5rem',
                    margin: 0
                }}>Global Attack Map</h2>
                <span style={{ color: '#a1a1a3', fontSize: '0.875rem' }}>
                    {attackData.length} Active Threats
                </span>
            </div>

            <div style={{
                position: 'relative',
                backgroundColor: '#1a1b1e',
                borderRadius: '0.5rem',
                padding: '1rem',
                height: '400px'
            }}>
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <img
                        src={worldMap}
                        alt="World Map"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            filter: 'invert(0.8) brightness(0.3)',
                            zIndex: 1
                        }}
                    />
                    <svg
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: 2
                        }}
                        viewBox="0 0 2000 1001"
                        preserveAspectRatio="xMidYMid slice"
                    >
                        {attackData.map((point, index) => {
                            const [x, y] = latLongToXY(point.latitude, point.longitude);
                            return (
                                <g key={index}>
                                    {/* Pulse animation */}
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r="5"
                                        fill="rgba(220, 38, 38, 0.3)"
                                        style={{
                                            animation: 'pulse 2s infinite',
                                        }}
                                    />
                                    {/* Attack point */}
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r="3"
                                        fill="#dc2626"
                                        stroke="#1a1b1e"
                                        strokeWidth="1"
                                        onMouseEnter={() => setSelectedPoint(point)}
                                        onMouseLeave={() => setSelectedPoint(null)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </g>
                            );
                        })}
                    </svg>

                    {/* Tooltip */}
                    {selectedPoint && (
                        <div style={{
                            position: 'absolute',
                            backgroundColor: '#2c2d31',
                            border: '1px solid #3f3f46',
                            borderRadius: '0.25rem',
                            padding: '0.75rem',
                            maxWidth: '300px',
                            zIndex: 1000,
                            color: '#e1e1e3',
                            fontSize: '0.875rem',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                {selectedPoint.country}
                            </div>
                            <div style={{ color: '#a1a1a3' }}>
                                Attacks: {selectedPoint.attack_count}
                                <br />
                                Unique IPs: {selectedPoint.unique_ips}
                                <br />
                                Last Attack: {new Date(selectedPoint.last_attack).toLocaleString()}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttackOrigins;