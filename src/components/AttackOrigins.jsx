import React, { useState, useEffect, useRef } from 'react';
import { logRequest } from '../utils/logging';
import WorldMap from '../assets/world-map.svg';

const AttackOrigins = () => {
    const [attackData, setAttackData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const svgRef = useRef(null);

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
        'GB': 'United Kingdom',
        'DE': 'Germany',
        'FR': 'France',
        'IN': 'India',
        'BR': 'Brazil',
        'RU': 'Russia',
        'JP': 'Japan',
        'CA': 'Canada',
        'AU': 'Australia',
        'IT': 'Italy'
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
                console.log('Fetched attack data:', data);

                if (mounted) {
                    setAttackData(data);
                    setError(null);
                    updateMap(data);
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

    const updateMap = (data) => {
        if (!svgRef.current) return;

        const svg = svgRef.current;
        const paths = svg.getElementsByTagName('path');

        Array.from(paths).forEach(path => {
            const id = path.getAttribute('id');
            const className = path.getAttribute('class');
            const name = path.getAttribute('name');

            // Try to find matching country data
            const countryName = countryMapping[id] || countryMapping[className] || name;
            const countryData = data.find(d => d.country === countryName);

            if (countryData) {
                const maxAttacks = Math.max(...data.map(d => d.attack_count));
                const intensity = countryData.attack_count / maxAttacks;
                path.style.fill = `rgba(220, 38, 38, ${intensity * 0.8})`;

                // Add hover events
                path.style.cursor = 'pointer';
                path.onmouseenter = () => setSelectedCountry(countryData);
                path.onmouseleave = () => setSelectedCountry(null);
            } else {
                path.style.fill = '#2c2d31';
            }

            path.style.stroke = '#3f3f46';
            path.style.strokeWidth = '0.2';
        });
    };

    useEffect(() => {
        if (attackData.length > 0) {
            updateMap(attackData);
        }
    }, [attackData]);

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
                    ref={svgRef}
                    style={{
                        width: '100%',
                        height: '100%'
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