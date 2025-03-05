import { useState, useEffect } from 'react';
import { logRequest } from '../utils/logging';

// Import icons if you're using lucide-react or another icon library
// If not, you can remove these imports and the icon elements
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

const API_URL = 'http://157.245.249.219:5000';

const PreventionModeToggle = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPreventionMode();
        // Poll for updates every 30 seconds
        const interval = setInterval(fetchPreventionMode, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchPreventionMode = async () => {
        try {
            logRequest('PreventionMode', 'fetching status');
            const response = await fetch(`${API_URL}/api/waf/prevention`);
            if (!response.ok) throw new Error('Failed to fetch prevention mode status');
            const data = await response.json();
            setIsEnabled(data.enabled);
            setError(null);
        } catch (err) {
            logRequest('PreventionMode', 'error', { error: err.message });
            setError('Failed to fetch prevention mode status');
        } finally {
            setIsLoading(false);
        }
    };

    const togglePreventionMode = async () => {
        try {
            setIsLoading(true);
            logRequest('PreventionMode', 'toggling', { newState: !isEnabled });

            const response = await fetch(`${API_URL}/api/waf/prevention`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ enabled: !isEnabled }),
            });

            if (!response.ok) throw new Error('Failed to update prevention mode');

            const data = await response.json();
            setIsEnabled(data.enabled);
            setError(null);
        } catch (err) {
            logRequest('PreventionMode', 'error', { error: err.message });
            setError('Failed to update prevention mode');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="prevention-toggle">
            <div className="prevention-toggle-header">
                <div className="toggle-title">
                    {isEnabled ? (
                        <ShieldAlert size={20} className="prevention-icon" />
                    ) : (
                        <ShieldCheck size={20} className="detection-icon" />
                    )}
                    <h3>WAF Mode</h3>
                </div>
                <div className={`status ${isEnabled ? 'attack' : 'normal'}`}>
                    {isEnabled ? 'Prevention' : 'Detection'}
                </div>
            </div>

            <div className="prevention-toggle-content">
                <p className="mode-description">
                    {isEnabled
                        ? 'Prevention mode is ACTIVE. Detected threats will be BLOCKED automatically.'
                        : 'Detection mode is ACTIVE. Threats will be logged but NOT blocked.'}
                </p>

                <button
                    onClick={togglePreventionMode}
                    disabled={isLoading}
                    className={`toggle-button ${isEnabled ? 'prevention-active' : 'detection-active'}`}
                >
                    {isLoading ? (
                        <>
                            <span className="spinner"></span>
                            <span>Updating...</span>
                        </>
                    ) : (
                        <>
                            {isEnabled ? 'Switch to Detection Mode' : 'Switch to Prevention Mode'}
                        </>
                    )}
                </button>

                {error && (
                    <div className="error-message">
                        <AlertTriangle size={16} />
                        <span>{error}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PreventionModeToggle;