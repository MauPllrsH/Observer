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
        <div className="status-item">
          <Clock size={18} className="status-icon" />
          <span className="status-text">
            Last updated: <span className="status-value">{lastUpdate}</span>
          </span>
        </div>
        
        <div className="status-item">
          <Database size={18} className="status-icon" /> 
          <span className="status-text">
            <span className="status-value">{logsCount}</span> logs
          </span>
        </div>
        
        {loading && (
          <div className="status-item">
            <RefreshCw size={18} className="status-icon spinning" />
            <span className="status-text">Refreshing...</span>
          </div>
        )}

        <div className="status-actions">
          {!loading ? (
            <button 
              onClick={onRefresh}
              className="refresh-button"
              aria-label="Refresh data"
            >
              <RefreshCw size={18} />
              <span>Refresh</span>
            </button>
          ) : (
            <button 
              className="refresh-button refresh-button-disabled"
              disabled
              aria-label="Refreshing"
            >
              <RefreshCw size={18} className="spinning" />
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