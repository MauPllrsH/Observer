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

    const updateMapColors = (svg, data) => {
        console.log('Attack Data countries:', data.map(d => d.country));

        const svgElement = svg.target.querySelector('svg') || svg.target;
        console.log('SVG element found:', !!svgElement);

        const paths = svgElement.getElementsByTagName('path');
        console.log('Number of paths:', paths.length);

        Array.from(paths).forEach(path => {
            // Check both id and class attributes
            const countryCode = path.getAttribute('id');
            const countryClass = path.getAttribute('class');
            let mappedCountry = countryMapping[countryCode] || countryMapping[countryClass];

            // If no mapping found, try using the name attribute directly
            if (!mappedCountry) {
                mappedCountry = path.getAttribute('name');
            }

            console.log('Processing path:', {
                countryCode,
                countryClass,
                mappedCountry,
                name: path.getAttribute('name')
            });

            const countryData = data.find(d =>
                d.country === mappedCountry ||
                d.country === countryCode ||
                d.country === countryClass
            );

            if (countryData) {
                console.log('Found matching data for:', mappedCountry);
                const maxAttacks = Math.max(...data.map(d => d.attack_count));
                const intensity = countryData.attack_count / maxAttacks;
                path.setAttribute('fill', `rgba(220, 38, 38, ${intensity * 0.8})`);
            } else {
                path.setAttribute('fill', '#2c2d31');
            }

            path.setAttribute('stroke', '#3f3f46');
            path.setAttribute('stroke-width', '0.2');
            path.style.cursor = 'pointer';

            // Create unique function references for event listeners
            const handleMouseEnter = () => {
                if (countryData) {
                    setSelectedCountry(countryData);
                }
            };

            const handleMouseLeave = () => {
                setSelectedCountry(null);
            };

            // Remove old listeners if they exist
            path.removeEventListener('mouseenter', handleMouseEnter);
            path.removeEventListener('mouseleave', handleMouseLeave);

            // Add new listeners
            path.addEventListener('mouseenter', handleMouseEnter);
            path.addEventListener('mouseleave', handleMouseLeave);
        });
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

                    // Update colors for existing SVG
                    const svg = document.querySelector('svg');
                    if (svg) {
                        console.log('Found existing SVG, updating colors');
                        updateMapColors({ target: svg }, data);
                    }
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
                <WorldMap
                    style={{
                        width: '100%',
                        height: '100%'
                    }}
                    onLoad={(svg) => updateMapColors(svg, attackData)}
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