import React from 'react';

/**
 * Card component for dashboard panels
 */
const Card = ({ 
  title, 
  children, 
  className = '', 
  loading = false,
  error = null,
  onRetry = null,
  headerActions = null,
  stats = null,
}) => {
  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <div className="card-title">
          <h2>{title}</h2>
          {stats && (
            <div className="card-stats">
              {stats}
            </div>
          )}
        </div>
        {headerActions && (
          <div className="card-actions">
            {headerActions}
          </div>
        )}
      </div>
      
      <div className="card-content">
        {loading && !React.Children.count(children) ? (
          <div className="card-loading">
            <div className="spinner"></div>
            <span>Loading data...</span>
          </div>
        ) : error ? (
          <div className="card-error">
            <div className="error-message">
              <span>Error: {error}</span>
              {onRetry && (
                <button 
                  onClick={onRetry}
                  className="retry-button"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default Card;