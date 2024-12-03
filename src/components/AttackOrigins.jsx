import React, { useState, useEffect } from 'react';
import { logRequest } from '../utils/logging';
import WorldMap from '../assets/world-map.svg';

const AttackOrigins = () => {
    const [attackData, setAttackData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState(null);

    const countryMapping = {
        'AF': 'Afghanistan',
        'AL': 'Albania',
        'AE': 'United Arab Emirates',
        'Angola': 'Angola',
        'US': 'United States',
        'KR': 'South Korea',
        'LT': 'Lithuania',
        'NL': 'Netherlands',
        'CN': 'China',
        // ... add more as needed
    };

    const getCountryColor = (countryCode, countryClass, countryName) => {
        const mappedCountry = countryMapping[countryCode] ||
            countryMapping[countryClass] ||
            countryName;

        const countryData = attackData.find(d =>
            d.country === mappedCountry ||
            d.country === countryCode ||
            d.country === countryClass
        );

        if (countryData) {
            const maxAttacks = Math.max(...attackData.map(d => d.attack_count));
            const intensity = countryData.attack_count / maxAttacks;
            return `rgba(220, 38, 38, ${intensity * 0.8})`;
        }
        return '#2c2d31';
    };

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
                console.log('Fetched data:', data);

                if (mounted) {
                    setAttackData(data);
                    setError(null);
                }
            } catch (err) {
                console.error('Fetch error:', err);
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
                <svg
                    baseProfile="tiny"
                    fill="#2c2d31"
                    height="100%"
                    stroke="#3f3f46"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth=".2"
                    version="1.2"
                    viewBox="0 0 2000 857"
                    width="100%"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Your SVG paths here */}
                    <path
                        d="M1383 261.6l1.5 1.8-2.9 0.8-2.4 1.1-5.9 0.8-5.3 1.3-2.4 2.8 1.9 2.7 1.4 3.2-2 2.7 0.8 2.5-0.9 2.3-5.2-0.2 3.1 4.2-3.1 1.7-1.4 3.8 1.1 3.9-1.8 1.8-2.1-0.6-4 0.9-0.2 1.7-4.1 0-2.3 3.7 0.8 5.4-6.6 2.7-3.9-0.6-0.9 1.4-3.4-0.8-5.3 1-9.6-3.3 3.9-5.8-1.1-4.1-4.3-1.1-1.2-4.1-2.7-5.1 1.6-3.5-2.5-1 0.5-4.7 0.6-8 5.9 2.5 3.9-0.9 0.4-2.9 4-0.9 2.6-2-0.2-5.1 4.2-1.3 0.3-2.2 2.9 1.7 1.6 0.2 3 0 4.3 1.4 1.8 0.7 3.4-2 2.1 1.2 0.9-2.9 3.2 0.1 0.6-0.9-0.2-2.6 1.7-2.2 3.3 1.4-0.1 2 1.7 0.3 0.9 5.4 2.7 2.1 1.5-1.4 2.2-0.6 2.5-2.9 3.8 0.5 5.4 0z"
                        id="AF"
                        name="Afghanistan"
                        fill={getCountryColor('AF', null, 'Afghanistan')}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => {
                            const countryData = attackData.find(d =>
                                d.country === 'Afghanistan' ||
                                d.country === 'AF'
                            );
                            if (countryData) setSelectedCountry(countryData);
                        }}
                        onMouseLeave={() => setSelectedCountry(null)}
                    />
                    {/* Add more paths similarly */}
                </svg>

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