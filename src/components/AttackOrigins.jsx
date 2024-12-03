import React, { useState, useEffect } from 'react';
import { logRequest } from '../utils/logging';
import WorldMap from '../assets/world-map.svg';

const AttackOrigins = () => {
    const [attackData, setAttackData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState(null);

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

    const getCountryColor = (countryName) => {
        const countryData = attackData.find(data => data.country === countryName);
        if (!countryData) return '#2c2d31';

        const maxAttacks = Math.max(...attackData.map(d => d.attack_count));
        const intensity = countryData.attack_count / maxAttacks;
        return `rgba(220, 38, 38, ${intensity * 0.8})`;
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
            border: '1px solid #3f3f46',
            height: '400px'
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
                height: 'calc(100% - 3rem)',
                backgroundColor: '#1a1b1e',
                borderRadius: '0.5rem'
            }}>
                <WorldMap
                    style={{
                        width: '100%',
                        height: '100%'
                    }}
                    onLoad={(svg) => {
                        // When SVG loads, set colors and event listeners for all countries
                        const paths = svg.target.getElementsByTagName('path');
                        Array.from(paths).forEach(path => {
                            const countryName = path.getAttribute('name');
                            path.style.fill = getCountryColor(countryName);
                            path.style.stroke = '#3f3f46';
                            path.style.strokeWidth = '0.2';
                            path.style.cursor = 'pointer';

                            path.addEventListener('mouseenter', () => {
                                const countryData = attackData.find(data => data.country === countryName);
                                if (countryData) setSelectedCountry(countryData);
                            });

                            path.addEventListener('mouseleave', () => {
                                setSelectedCountry(null);
                            });
                        });
                    }}
                />

                {selectedCountry && (
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
                            {selectedCountry.country}
                        </div>
                        <div style={{ color: '#a1a1a3' }}>
                            Attacks: {selectedCountry.attack_count}
                            <br />
                            Unique IPs: {selectedCountry.unique_ips}
                            <br />
                            Last Attack: {new Date(selectedCountry.last_attack).toLocaleString()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttackOrigins;