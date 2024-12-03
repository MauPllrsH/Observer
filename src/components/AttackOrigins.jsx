import React, { useState, useEffect } from 'react';
import { logRequest } from '../utils/logging';
import WorldMap from '../assets/world-map.svg';
import { countryMappings, getCountryName } from '../utils/countryMappings';

const AttackOrigins = () => {
    const [attackData, setAttackData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState(null);

    const updateMapColors = (svg, data) => {
        console.log('Attack Data countries:', data.map(d => d.country));

        const svgElement = svg.target.querySelector('svg') || svg.target;
        console.log('SVG element found:', !!svgElement);

        const paths = svgElement.getElementsByTagName('path');
        console.log('Number of paths:', paths.length);

        // Calculate max attacks for intensity scaling
        const maxAttacks = Math.max(...data.map(d => d.attack_count));

        Array.from(paths).forEach(path => {
            const countryCode = path.getAttribute('id');
            const countryName = path.getAttribute('name');

            // Try to find matching country data
            const countryData = data.find(d =>
                d.country === countryName || // Direct name match
                d.country === getCountryName(countryCode) || // Try mapped name
                d.country === countryCode // Direct code match
            );

            if (countryData) {
                console.log('Found matching data for:', countryData.country);
                const intensity = countryData.attack_count / maxAttacks;
                path.setAttribute('fill', `rgba(220, 38, 38, ${intensity * 0.8})`);
            } else {
                path.setAttribute('fill', '#2c2d31'); // Default color for countries with no attacks
            }

            // Set common attributes for all countries
            path.setAttribute('stroke', '#3f3f46');
            path.setAttribute('stroke-width', '0.2');
            path.style.cursor = 'pointer';

            // Create hover event handlers
            const handleMouseEnter = () => {
                if (countryData) {
                    // Add hover effect
                    const currentFill = path.getAttribute('fill');
                    path.setAttribute('data-original-fill', currentFill);
                    path.setAttribute('fill', adjustColor(currentFill, -20)); // Darken on hover
                    setSelectedCountry(countryData);
                }
            };

            const handleMouseLeave = () => {
                if (countryData) {
                    // Restore original color
                    const originalFill = path.getAttribute('data-original-fill');
                    if (originalFill) {
                        path.setAttribute('fill', originalFill);
                    }
                }
                setSelectedCountry(null);
            };

            // Remove existing listeners to prevent duplicates
            path.removeEventListener('mouseenter', handleMouseEnter);
            path.removeEventListener('mouseleave', handleMouseLeave);

            // Add new listeners
            path.addEventListener('mouseenter', handleMouseEnter);
            path.addEventListener('mouseleave', handleMouseLeave);
        });
    };

    // Helper function to adjust color brightness
    const adjustColor = (color, amount) => {
        if (color.startsWith('rgba')) {
            const [r, g, b, a] = color.match(/[\d.]+/g).map(Number);
            const adjustedR = Math.max(0, Math.min(255, r + amount));
            const adjustedG = Math.max(0, Math.min(255, g + amount));
            const adjustedB = Math.max(0, Math.min(255, b + amount));
            return `rgba(${adjustedR}, ${adjustedG}, ${adjustedB}, ${a})`;
        }
        return color;
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