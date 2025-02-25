import React from 'react';
import AnomalousIPs from "./AnomalousIPs.jsx";
import AttackTimeline from "./AttackTimeline.jsx";
import LogsPanel from "./LogsPanel.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";
import AttackOrigins from "./AttackOrigins.jsx";
import StatusBar from './ui/StatusBar.jsx';
import { useSecurityContext } from '../context/SecurityContext.jsx';

const Dashboard = () => {
    const { 
        logs, 
        loading, 
        error, 
        lastUpdate, 
        handleRetry,
        refreshData
    } = useSecurityContext();

    if (loading && !logs.length) {
        return (
            <div className="dashboard dashboard-loading">
                <div className="spinner-container">
                    <div className="spinner"></div>
                    <span>Loading dashboard data...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            {/* Status Bar */}
            <StatusBar
                lastUpdate={lastUpdate}
                logsCount={logs.length}
                loading={loading}
                error={error}
                onRetry={handleRetry}
                onRefresh={refreshData}
            />

            {/* Component Grid - Top Row */}
            <div className="dashboard-grid">
                <ErrorBoundary>
                    <AnomalousIPs />
                </ErrorBoundary>
                <ErrorBoundary>
                    <AttackTimeline />
                </ErrorBoundary>
            </div>

            {/* Component Grid - Bottom Row */}
            <div className="dashboard-grid">
                <ErrorBoundary>
                    <AttackOrigins />
                </ErrorBoundary>
                <ErrorBoundary>
                    <LogsPanel />
                </ErrorBoundary>
            </div>
        </div>
    );
};

export default Dashboard;