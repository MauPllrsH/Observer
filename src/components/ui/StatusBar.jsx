import React from 'react';
import { AlertCircle, RefreshCw, Clock, Database } from 'lucide-react';

/**
 * Status bar to display system status information
 */
const StatusBar = ({ 
  lastUpdate, 
  logsCount, 
  loading, 
  error, 
  onRetry,
  onRefresh 
}) => {
  return (
    <div className="status-bar">
      <div className="status-content">
        <div className="status-info">
          <Clock size={16} className="status-icon" />
          <span className="status-text">
            Last updated: <span className="status-value">{lastUpdate}</span>
            <span className="status-separator">•</span>
            <Database size={14} className="status-inline-icon" /> 
            <span className="status-value">{logsCount}</span> logs
            {loading && (
              <span className="status-loading">
                <RefreshCw size={14} className="spinning" />
                Refreshing...
              </span>
            )}
          </span>
        </div>
        
        <div className="status-actions">
          {!loading ? (
            <button 
              onClick={onRefresh}
              className="refresh-button"
              aria-label="Refresh data"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          ) : (
            <button 
              className="refresh-button refresh-button-disabled"
              disabled
              aria-label="Refreshing"
            >
              <RefreshCw size={16} className="spinning" />
              <span>Refreshing</span>
            </button>
          )}
        </div>
        
        {error && (
          <div className="status-error">
            <div className="error-content">
              <AlertCircle size={16} />
              <span>Error: {error}</span>
            </div>
            <button
              onClick={onRetry}
              className="retry-button"
            >
              Retry Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusBar;