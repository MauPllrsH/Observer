import { createContext, useContext, useState, useEffect, useCallback, useReducer } from 'react';
import apiClient from '../api/client';
import { logRequest } from '../utils/logging';

// Create context
const SecurityContext = createContext(null);

// Initial state
const initialState = {
  logs: [],
  loading: true,
  error: null,
  lastUpdate: new Date().toLocaleString(),
  lastTimestamp: null,
};

// Action types
const ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_ERROR: 'FETCH_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer function
function securityReducer(state, action) {
  switch (action.type) {
    case ACTIONS.FETCH_START:
      return { ...state, loading: true };
    
    case ACTIONS.FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        logs: action.payload.logs,
        lastTimestamp: action.payload.lastTimestamp,
        lastUpdate: new Date().toLocaleString(),
      };
    
    case ACTIONS.FETCH_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    
    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
}

// Provider component
export function SecurityProvider({ children }) {
  const [state, dispatch] = useReducer(securityReducer, initialState);
  const { logs, loading, error, lastUpdate, lastTimestamp } = state;
  
  // Cached values
  const [anomalousIPs, setAnomalousIPs] = useState([]);
  const [attackTimeline, setAttackTimeline] = useState([]);
  const [attackOrigins, setAttackOrigins] = useState({});
  
  // Fetch logs with timestamp tracking
  const fetchLogs = useCallback(async (forceRefresh = false) => {
    try {
      dispatch({ type: ACTIONS.FETCH_START });
      
      // When forcing a refresh, don't use the timestamp to get all logs
      const timestampToUse = forceRefresh ? null : lastTimestamp;
      const data = await apiClient.fetchLogs(timestampToUse);
      logRequest('SecurityContext', 'received logs', { count: data.length });
      
      // If forcing refresh, just use new data, otherwise merge
      const updatedLogs = forceRefresh ? data : (!lastTimestamp ? data : [...logs]);
      
      if (!forceRefresh && lastTimestamp) {
        // Merge new logs with existing logs
        data.forEach(log => {
          const index = updatedLogs.findIndex(l => l.timestamp === log.timestamp);
          if (index === -1) {
            updatedLogs.push(log);
          }
        });
      }
      
      // Sort by timestamp descending and keep only latest 100 logs
      const sortedLogs = updatedLogs
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 100);
      
      // Update last timestamp from the newest log
      let newTimestamp = lastTimestamp;
      if (data.length > 0) {
        const timestamps = data.map(log => new Date(log.timestamp));
        const newestTimestamp = new Date(Math.max(...timestamps));
        newTimestamp = newestTimestamp.toISOString();
      }
      
      dispatch({ 
        type: ACTIONS.FETCH_SUCCESS, 
        payload: { 
          logs: sortedLogs, 
          lastTimestamp: newTimestamp 
        } 
      });
    } catch (error) {
      logRequest('SecurityContext', 'error', { error: error.message });
      console.error('Error fetching logs:', error);
      dispatch({ type: ACTIONS.FETCH_ERROR, payload: error.message });
    }
  }, [lastTimestamp, logs]);
  
  // Fetch anomalous IPs
  const fetchAnomalousIPs = useCallback(async () => {
    try {
      const data = await apiClient.fetchAnomalousIPs();
      setAnomalousIPs(data);
    } catch (error) {
      console.error('Error fetching anomalous IPs:', error);
      // We don't set global error here to avoid disrupting the whole dashboard
    }
  }, []);
  
  // Fetch attack timeline
  const fetchAttackTimeline = useCallback(async () => {
    try {
      const data = await apiClient.fetchAttackTimeline();
      setAttackTimeline(data);
    } catch (error) {
      console.error('Error fetching attack timeline:', error);
    }
  }, []);
  
  // Fetch attack origins
  const fetchAttackOrigins = useCallback(async () => {
    try {
      const data = await apiClient.fetchAttackOrigins();
      setAttackOrigins(data);
    } catch (error) {
      console.error('Error fetching attack origins:', error);
    }
  }, []);
  
  // Load all data
  const loadAllData = useCallback(async (forceRefresh = true) => {
    await Promise.all([
      fetchLogs(forceRefresh),
      fetchAnomalousIPs(),
      fetchAttackTimeline(),
      fetchAttackOrigins()
    ]);
  }, [fetchLogs, fetchAnomalousIPs, fetchAttackTimeline, fetchAttackOrigins]);
  
  // Retry after error
  const handleRetry = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
    loadAllData();
  }, [loadAllData]);
  
  // Only load data initially, explicitly no auto polling
  useEffect(() => {
    let mounted = true;
    
    const initialLoad = async () => {
      if (!mounted) return;
      
      try {
        // Initial load should not force refresh, just use what's available
        await loadAllData(false);
      } catch (error) {
        logRequest('SecurityContext', 'initial load error', { error: error.message });
      }
    };
    
    initialLoad().catch(error => {
      logRequest('SecurityContext', 'initial load failed', { error: error.message });
    });
    
    return () => {
      logRequest('SecurityContext', 'cleanup');
      mounted = false;
    };
  }, []); // Empty dependency array - only run on mount
  
  // Context value
  const value = {
    logs,
    loading,
    error,
    lastUpdate,
    anomalousIPs,
    attackTimeline,
    attackOrigins,
    handleRetry,
    refreshData: loadAllData,
  };
  
  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
}

// Custom hook for using the context
export function useSecurityContext() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within a SecurityProvider');
  }
  return context;
}

export default SecurityContext;