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
        <div className="status-items">
          <div className="status-item">
            <Clock size={16} />
            <span>Last updated: {lastUpdate}</span>
          </div>
          
          <div className="status-item">
            <Database size={16} />
            <span>Logs: {logsCount}</span>
          </div>
          
          {loading && (
            <div className="status-item">
              <RefreshCw size={16} className="spinning" />
              <span>Refreshing...</span>
            </div>
          )}
        </div>
        
        <div className="status-actions">
          {!loading ? (
            <button 
              onClick={onRefresh}
              className="refresh-button"
              aria-label="Refresh data"
            >
              <RefreshCw size={16} />
              <span>Refresh Now</span>
            </button>
          ) : (
            <button 
              className="refresh-button refresh-button-disabled"
              disabled
              aria-label="Refreshing"
            >
              <RefreshCw size={16} className="spinning" />
              <span>Refreshing...</span>
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