import React, { useState, useMemo, useEffect } from 'react';
import { FileSearch, Terminal, AlertTriangle, Check, Filter } from 'lucide-react';
import Card from './ui/Card.jsx';
import { useSecurityContext } from '../context/SecurityContext.jsx';

const LogsPanel = () => {
    const { logs, loading, refreshData } = useSecurityContext();
    const [filter, setFilter] = useState('all'); // 'all', 'attack', 'normal'

    // Filter logs based on selection
    const filteredLogs = useMemo(() => {
        if (filter === 'all') return logs;
        if (filter === 'attack') return logs.filter(log => log.analysis_result?.injection_detected);
        if (filter === 'normal') return logs.filter(log => !log.analysis_result?.injection_detected);
        return logs;
    }, [logs, filter]);

    // Filter button component
    const FilterButton = ({ value, label, count }) => (
        <button 
            className={`filter-button ${filter === value ? 'active' : ''}`}
            onClick={() => setFilter(value)}
        >
            {label} {count > 0 && `(${count})`}
        </button>
    );

    // Stats for header
    const attackCount = useMemo(() => 
        logs.filter(log => log.analysis_result?.injection_detected).length,
    [logs]);

    const headerStats = (
        <>
            <span>{logs.length} total</span>
            <span>{attackCount} attacks</span>
        </>
    );

    // Filter buttons for header actions
    const headerActions = (
        <div className="logs-panel-filters">
            <FilterButton value="all" label="All" />
            <FilterButton value="attack" label="Attacks" count={attackCount} />
            <FilterButton 
                value="normal" 
                label="Normal" 
                count={logs.length - attackCount}
            />
        </div>
    );

    return (
        <Card 
            title="Security Logs"
            className="logs-panel"
            loading={loading && logs.length === 0}
            stats={headerStats}
            headerActions={headerActions}
        >
            <div className="logs-panel-content">
                {filteredLogs.length === 0 ? (
                    <div className="logs-empty">
                        <FileSearch size={24} />
                        <p>No matching logs found</p>
                    </div>
                ) : (
                    <>
                        {filteredLogs.map((log, index) => {
                            const isAttack = log.analysis_result?.injection_detected;
                            
                            return (
                                <div 
                                    key={`${log.timestamp}-${index}`}
                                    className={`log-entry ${isAttack ? 'attack' : 'normal'}`}
                                >
                                    <div className="log-header">
                                        <div className="log-meta">
                                            <code>{log.method}</code>
                                            <span className="log-path">{log.path}</span>
                                        </div>
                                        <span className={`status ${isAttack ? 'attack' : 'normal'}`}>
                                            {isAttack ? (
                                                <>
                                                    <AlertTriangle size={12} />
                                                    Attack Detected
                                                </>
                                            ) : (
                                                <>
                                                    <Check size={12} />
                                                    Normal
                                                </>
                                            )}
                                        </span>
                                    </div>

                                    <div className="log-details">
                                        <div className="log-detail-row">
                                            <div className="log-detail">
                                                <strong>Timestamp</strong>
                                                <span className="timestamp">{new Date(log.timestamp).toLocaleString()}</span>
                                            </div>
                                            <div className="log-detail">
                                                <strong>IP Address</strong>
                                                <span>{log.ip}</span>
                                            </div>
                                        </div>
                                        
                                        {log.query && (
                                            <div className="log-detail-full">
                                                <strong>Query</strong>
                                                <div className="code-block">
                                                    <Terminal size={14} />
                                                    <code>{log.query}</code>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {log.analysis_result?.matched_rules?.length > 0 && (
                                            <div className="log-detail-full">
                                                <strong>Matched Rules</strong>
                                                <div className="tags">
                                                    {log.analysis_result.matched_rules.map((rule, idx) => (
                                                        <span key={idx} className="tag">{rule}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>
        </Card>
    );
};

export default LogsPanel;