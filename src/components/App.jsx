import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import Dashboard from './Dashboard.jsx';
import LoadingScreen from './LoadingScreen.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';

function App() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const minLoadingTime = 2000; // Reduced to 2 seconds
        const startTime = Date.now();

        const initializeApp = async () => {
            try {
                // Simulate application initialization
                // In a real app, we might load configuration, check authentication, etc.
                
                const elapsedTime = Date.now() - startTime;
                const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

                // Wait for remaining time for minimum loading display
                setTimeout(() => {
                    setIsLoading(false);
                }, remainingTime);
            } catch (error) {
                console.error('Initialization error:', error);
                setIsLoading(false);
            }
        };

        initializeApp();
    }, []);

    return (
        <div className="app">
            {isLoading ? (
                <LoadingScreen />
            ) : (
                <>
                    <header>
                        <h1>
                            <Shield size={20} className="header-icon" />
                            SnoopyWAF Security Dashboard
                        </h1>
                    </header>
                    <main>
                        <ErrorBoundary>
                            <Dashboard />
                        </ErrorBoundary>
                    </main>
                </>
            )}
        </div>
    );
}

export default App;