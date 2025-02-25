import { useState, useEffect } from 'react';
import { logRequest } from '../utils/logging';

const API_URL = 'http://157.245.249.219:5000';

const PreventionModeToggle = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPreventionMode();
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
            logRequest('PreventionMode', 'toggle error', { error: err.message });
            setError('Failed to update prevention mode');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center">
                <button
                    onClick={togglePreventionMode}
                    disabled={isLoading}
                    className={`
                        relative inline-flex h-6 w-11 items-center rounded-full
                        transition-colors duration-200 ease-in-out
                        ${isEnabled ? 'bg-red-600' : 'bg-gray-600'}
                        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                >
                    <span
                        className={`
                            inline-block h-4 w-4 transform rounded-full bg-white
                            transition duration-200 ease-in-out
                            ${isEnabled ? 'translate-x-6' : 'translate-x-1'}
                        `}
                    />
                </button>
                <span className="ml-2 text-[#e1e1e3]">
                    Prevention Mode: {isEnabled ? 'Active' : 'Inactive'}
                </span>
            </div>
            {error && (
                <span className="text-red-400 text-sm">
                    {error}
                </span>
            )}
            {isLoading && (
                <span className="text-[#a1a1a3] text-sm animate-pulse">
                    Updating...
                </span>
            )}
        </div>
    );
};


export default PreventionModeToggle;