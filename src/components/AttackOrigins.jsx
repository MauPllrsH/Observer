import React, { useState, useEffect } from 'react';
import { logRequest } from '../utils/logging';

const AttackOrigins = () => {
    const [attackData, setAttackData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastFetch, setLastFetch] = useState(null);

    useEffect(() => {
        let mounted = true;
        let interval = null;

        const fetchData = async () => {
            try {
                logRequest('AttackOrigins', 'fetching data', { lastFetch });
                const response = await fetch('http://157.245.249.219:5000/api/attack-origins');

                if (!response.ok) {
                    throw new Error('Failed to fetch attack origins');
                }

                const data = await response.json();
                logRequest('AttackOrigins', 'received data', { count: data.length });

                if (mounted) {
                    setAttackData(data);
                    setLastFetch(new Date().toISOString());
                    setError(null);
                }
            } catch (err) {
                logRequest('AttackOrigins', 'error', { error: err.message });
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
            logRequest('AttackOrigins', 'cleanup');
            mounted = false;
            if (interval) {
                clearInterval(interval);
            }
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
                Loading attack origins...
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
            maxHeight: '400px',
            overflow: 'auto'
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
                }}>Attack Origins</h2>
                <span style={{ color: '#a1a1a3', fontSize: '0.875rem' }}>
                    {attackData.length} Countries
                </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {attackData.map((country, index) => (
                    <div
                        key={country.country}
                        style={{
                            backgroundColor: '#1a1b1e',
                            borderRadius: '0.5rem',
                            border: '1px solid #3f3f46',
                            padding: '1rem'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.5rem'
                        }}>
                            <span style={{ color: '#e1e1e3', fontSize: '1.1rem' }}>
                                {country.country}
                            </span>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.875rem',
                                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                                color: '#dc2626'
                            }}>
                                {country.attack_count} Attacks
                            </span>
                        </div>

                        <div style={{ color: '#a1a1a3', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            <strong style={{ color: '#e1e1e3' }}>Unique IPs:</strong> {country.unique_ips}
                            <span style={{ margin: '0 0.5rem' }}>•</span>
                            <strong style={{ color: '#e1e1e3' }}>Last Attack:</strong> {new Date(country.last_attack).toLocaleString()}
                        </div>

                        <div style={{ marginTop: '0.5rem' }}>
                            <strong style={{ color: '#e1e1e3', fontSize: '0.875rem' }}>Common Attack Types:</strong>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '0.5rem',
                                marginTop: '0.5rem'
                            }}>
                                {country.top_attack_types.map((type, idx) => (
                                    <span
                                        key={idx}
                                        style={{
                                            backgroundColor: '#222326',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '0.25rem',
                                            fontSize: '0.75rem',
                                            color: '#a1a1a3'
                                        }}
                                    >
                                        {type.rule} ({type.count})
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AttackOrigins;