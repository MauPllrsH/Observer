import React, { useState, useEffect } from 'react';
import { logRequest } from '../utils/logging';

const WORLD_MAP_SVG = `M239.4 297.7L253.4 299.9L256.7 299.7L264.3 298.5L267.4 297.7L276.7 297.7L284.8 296.8L290.6 297.5L294.6 296.8L298.3 297.7L307.8 296.2L309.7 296.8L310.6 299.4L310.8 304.8L311.4 305.9L311.4 310L310.6 312.1L310.6 314.9L311.4 319L311.4 322.6L311.7 323.6L313.7 323.6L316.6 323.4L318.2 322.6L319.8 322.6L321.9 321.7L330.6 321.7L337.7 322.6L347.7 323.3L351.8 323.9L354.6 323.6L358.3 323.6L362 323.6L364.6 323.4L367.5 323.1L370.8 323.6L374.5 322.6L378.2 322.9L379.8 321.9L380.4 320.7L382.8 320.7L390.3 320.2L392.3 321.2L394.8 321.7L396.8 321.7L402.8 321.7L408.8 322.6L410.9 322.6L413.5 321.7L414.3 321.2L418.7 321.7L421.7 321.7L425.4 321.7L429.1 321.7L432.8 321.7L436.5 321.9L438.7 321.7L442.4 321.7L444.7 323.4L446.1 323.6L449.3 323.6L453 323.6L456.7 323.6L460.4 322.1L461.6 321.4L464.4 321.7L464.1 331.1L462.5 335.3L462.7 337.8L464.1 341.2L462.1 345.6L461.4 349L461.4 350.7L462.1 354.1L457.6 358.5L457.2 363.1L455.4 365.3L452.9 367L451 367.8L450.3 370.3L451 371.9L453.6 373.9L453.4 375.8L451 380L450.3 381.9L450.3 383.9L449.9 385L446.8 388.1L446.1 389.1L442.4 393.1L440.6 393.9L438.3 395.6L436.7 396.5L433.2 397L431.6 397.7L428 398.5L424.3 399.7L424.3 401.6L422.6 403.5L420.7 407.1L417.2 411.4L413.5 413.5L409.8 414.7L408.1 415.2L405.8 414.2L405.8 412.5L407.5 410.8L409.2 409.1L409.2 407.6L408.5 406.2L407.5 405.7L404.4 405.7L401.9 406.7L398.8 408.2L395.3 410.1L393.3 410.8L387.6 413.2L383.9 415.9L382.3 417.6L379.8 419.3L377.1 420.7L372.2 422.1L370.5 422.8L366.7 426.2L364.8 426.7L362.9 426.5L358.3 423.6L356.6 422.8L351.8 422.1L347.9 423.4L343.7 424.4L340.3 424.9L337.7 424.9L333.9 423.3L329.1 422.1L324.6 422.3L318.9 422.8L315.2 422.8L311.2 422.6L306.4 422.8L302.7 423.1L298.1 422.6L294.9 422.1L292.9 419.3L291.7 414.9L290.3 411.4L287.5 409L285.2 407.9L282.9 407.9L280.6 406.4L275.4 404.7L271.4 401.6L268.2 398.2L266.2 397L263.9 394.1L261.6 390.4L258.7 387.3L254.7 384.4L252 382.7L249.6 379.3L246.8 376.6L243.3 374.1L239.9 370.5L236.7 366.8L234.6 362.9L233.6 358.7L233.6 354.8L233.6 351.2L233.6 347.7L233.6 343.4L234.6 340L236.5 334L237.7 330.1L238.2 326.7L238.4 323.1L238.4 320.7L237.9 317.1L236.9 314.2L236.7 311.5L237.2 308.7L238 306.1L239.4 297.7ZM258.6 451L258.9 449.2L260.8 443.5L260.2 441.5L257.4 443.5L254.5 445.4L252.5 448L249.9 450.5L249.9 452.7L250.9 454.4L255.2 453.4L258.6 451Z`;

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
    const latLongToXY = (lat, long) => {
        const mapWidth = 1000;
        const mapHeight = 500;

        const x = (long + 180) * (mapWidth / 360);
        const y = (90 - lat) * (mapHeight / 180);

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
                <svg
                    viewBox="0 0 1000 500"
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#1a1b1e'
                    }}
                >
                    {/* World Map Base */}
                    <path
                        d={WORLD_MAP_SVG}
                        fill="#2c2d31"
                        stroke="#3f3f46"
                        strokeWidth="1"
                    />

                    {/* Attack Points */}
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
    );
};

export default AttackOrigins;