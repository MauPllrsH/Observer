import React, { useState, useEffect } from 'react';
import { logRequest } from '../utils/logging';
import worldMap from '../assets/world-map.svg';

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
        if (!countryData) return '#2c2d31'; // Default color for non-attacking countries

        // Calculate color intensity based on attack_count
        const maxAttacks = Math.max(...attackData.map(d => d.attack_count));
        const intensity = countryData.attack_count / maxAttacks;
        return `rgba(220, 38, 38, ${intensity * 0.8})`; // Red with varying opacity
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
                    <svg
                        viewBox="0 0 2000 1001"
                        style={{
                            width: '100%',
                            height: '100%',
                        }}
                    >
                        {/* Our map paths will go here */}
                        {/* Each path should have its country's name as data attribute */}
                        {Array.from(document.querySelectorAll('path')).map(path => (
                            <path
                                key={path.getAttribute('name')}
                                d={path.getAttribute('d')}
                                fill={getCountryColor(path.getAttribute('name'))}
                                stroke="#3f3f46"
                                strokeWidth="0.5"
                                onMouseEnter={() => {
                                    const countryData = attackData.find(
                                        data => data.country === path.getAttribute('name')
                                    );
                                    if (countryData) setSelectedCountry(countryData);
                                }}
                                onMouseLeave={() => setSelectedCountry(null)}
                                style={{ cursor: 'pointer' }}
                            />
                        ))}
                    </svg>

                    {/* Tooltip */}
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
        </div>
    );
};

export default AttackOrigins;