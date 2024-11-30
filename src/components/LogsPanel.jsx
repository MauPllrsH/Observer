import React from 'react';

const LogsPanel = ({ logs }) => {
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
                }}>Recent Logs</h2>
                <span style={{
                    color: '#a1a1a3',
                    fontSize: '0.875rem'
                }}>
                    {logs.length} Entries
                </span>
            </div>

            <div style={{
                height: '400px',
                overflowY: 'auto',
                marginRight: '-0.5rem',
                paddingRight: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
            }}>
                {logs.length === 0 ? (
                    <p style={{ color: '#a1a1a3' }}>No logs found</p>
                ) : (
                    logs.map((log, index) => (
                        <div
                            key={index}
                            style={{
                                backgroundColor: '#1a1b1e',
                                borderRadius: '0.5rem',
                                border: '1px solid #3f3f46',
                                borderLeft: `4px solid ${log.analysis_result?.injection_detected ? '#dc2626' : '#22c55e'}`
                            }}
                        >
                            <div style={{
                                padding: '0.75rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: '1px solid #3f3f46'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}>
                                    <span style={{
                                        color: '#a1a1a3',
                                        fontSize: '0.875rem',
                                        fontFamily: 'monospace'
                                    }}>
                                        {log.method}
                                    </span>
                                    <span style={{
                                        color: '#a1a1a3',
                                        fontSize: '0.875rem',
                                        maxWidth: '300px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {log.path}
                                    </span>
                                </div>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.875rem',
                                    backgroundColor: log.analysis_result?.injection_detected ? 'rgba(220, 38, 38, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                    color: log.analysis_result?.injection_detected ? '#dc2626' : '#22c55e'
                                }}>
                                    {log.analysis_result?.injection_detected ? '⚠️ Attack Detected' : '✅ Normal'}
                                </span>
                            </div>

                            <div style={{
                                padding: '0.75rem',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '0.75rem'
                            }}>
                                <div style={{ color: '#a1a1a3' }}>
                                    <strong style={{ color: '#e1e1e3', display: 'block', marginBottom: '0.25rem' }}>
                                        Timestamp
                                    </strong>
                                    {new Date(log.timestamp).toLocaleString()}
                                </div>
                                <div style={{ color: '#a1a1a3' }}>
                                    <strong style={{ color: '#e1e1e3', display: 'block', marginBottom: '0.25rem' }}>
                                        IP Address
                                    </strong>
                                    {log.ip}
                                </div>
                                {log.query && (
                                    <div style={{ color: '#a1a1a3', gridColumn: '1 / -1' }}>
                                        <strong style={{ color: '#e1e1e3', display: 'block', marginBottom: '0.25rem' }}>
                                            Query
                                        </strong>
                                        <div style={{
                                            backgroundColor: '#222326',
                                            padding: '0.5rem',
                                            borderRadius: '0.25rem',
                                            fontFamily: 'monospace',
                                            fontSize: '0.875rem',
                                            overflowX: 'auto'
                                        }}>
                                            {log.query}
                                        </div>
                                    </div>
                                )}
                                {log.analysis_result?.matched_rules?.length > 0 && (
                                    <div style={{ color: '#a1a1a3', gridColumn: '1 / -1' }}>
                                        <strong style={{ color: '#e1e1e3', display: 'block', marginBottom: '0.25rem' }}>
                                            Matched Rules
                                        </strong>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {log.analysis_result.matched_rules.map((rule, index) => (
                                                <span key={index} style={{
                                                    backgroundColor: '#222326',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '0.25rem',
                                                    fontSize: '0.875rem'
                                                }}>
                                                    {rule}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LogsPanel;