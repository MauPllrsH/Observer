import { useState, useEffect } from 'react';
import Dashboard from './Dashboard.jsx';
import LoadingScreen from './LoadingScreen.jsx';

function App() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const minLoadingTime = 2000; // 2 seconds
        const startTime = Date.now();

        const initializeApp = async () => {
            try {

                const elapsedTime = Date.now() - startTime;
                const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

                // Wait for remaining time if needed
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
                        <h1>IDS Security Dashboard</h1>
                    </header>
                    <main>
                        <Dashboard />
                    </main>
                </>
            )}
        </div>
    );
}

export default App;