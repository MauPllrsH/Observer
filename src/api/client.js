import { logRequest } from '../utils/logging';

// Use relative URLs with the Vite proxy
// This avoids CORS issues and works in both development and production
const API_BASE_PATH = '/api';
export const API_URL = '';

// Prevent duplicate requests by adding a timestamp to URLs
let lastRequestTimestamp = {};

/**
 * Fetch data with retry logic for failed requests
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<any>} - Parsed JSON response
 */
export const fetchWithRetry = async (url, options = {}, maxRetries = 3) => {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          ...options.headers
        },
        signal: controller.signal,
        ...options
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      attempt++;
      logRequest('fetchWithRetry', 'attempt failed', { 
        url, 
        attempt, 
        error: error.name === 'AbortError' ? 'Request timeout' : error.message 
      });
      
      if (attempt === maxRetries) throw error;
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
};

export const apiClient = {
  /**
   * Fetch logs from API
   * @param {string|null} since - Optional timestamp to fetch logs since
   * @returns {Promise<Array>} - Array of logs
   */
  async fetchLogs(since = null) {
    // Check if we've made the same request recently
    const endpoint = 'logs';
    const now = Date.now();
    
    if (lastRequestTimestamp[endpoint] && (now - lastRequestTimestamp[endpoint] < 2000)) {
      // Prevent requests more frequently than every 2 seconds
      await new Promise(r => setTimeout(r, 2000));
    }
    
    lastRequestTimestamp[endpoint] = now;
    
    // Build URL
    let url = `${API_BASE_PATH}/logs`;
    
    // Add query parameters if needed
    if (since) {
      url += `?since=${encodeURIComponent(since)}`;
    }
    
    // Add cache-busting parameter
    url += (url.includes('?') ? '&' : '?') + `_t=${now}`;
    
    logRequest('apiClient', 'fetchLogs', { since });
    const data = await fetchWithRetry(url);
    
    if ('error' in data) {
      throw new Error(data.error);
    }
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format received');
    }
    
    return data;
  },
  
  /**
   * Fetch anomalous IPs
   * @returns {Promise<Array>} - Array of anomalous IPs
   */
  async fetchAnomalousIPs() {
    // Prevent rapid duplicate requests
    const endpoint = 'anomalousIPs';
    const now = Date.now();
    
    if (lastRequestTimestamp[endpoint] && (now - lastRequestTimestamp[endpoint] < 2000)) {
      await new Promise(r => setTimeout(r, 2000));
    }
    
    lastRequestTimestamp[endpoint] = now;
    
    logRequest('apiClient', 'fetchAnomalousIPs');
    const url = `${API_BASE_PATH}/anomalous-ips?_t=${now}`;
    return fetchWithRetry(url);
  },
  
  /**
   * Fetch attack timeline data
   * @returns {Promise<Array>} - Array of timeline data points
   */
  async fetchAttackTimeline() {
    // Prevent rapid duplicate requests
    const endpoint = 'attackTimeline';
    const now = Date.now();
    
    if (lastRequestTimestamp[endpoint] && (now - lastRequestTimestamp[endpoint] < 2000)) {
      await new Promise(r => setTimeout(r, 2000));
    }
    
    lastRequestTimestamp[endpoint] = now;
    
    logRequest('apiClient', 'fetchAttackTimeline');
    const url = `${API_BASE_PATH}/attack-timeline?_t=${now}`;
    return fetchWithRetry(url);
  },
  
  /**
   * Fetch attack origins data
   * @returns {Promise<Object>} - Attack origins data
   */
  async fetchAttackOrigins() {
    // Prevent rapid duplicate requests
    const endpoint = 'attackOrigins';
    const now = Date.now();
    
    if (lastRequestTimestamp[endpoint] && (now - lastRequestTimestamp[endpoint] < 2000)) {
      await new Promise(r => setTimeout(r, 2000));
    }
    
    lastRequestTimestamp[endpoint] = now;
    
    logRequest('apiClient', 'fetchAttackOrigins');
    const url = `${API_BASE_PATH}/attack-origins?_t=${now}`;
    return fetchWithRetry(url);
  }
};

export default apiClient;