// ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
                    <h2 className="text-red-400 text-lg mb-2">Something went wrong</h2>
                    <p className="text-red-400">{this.state.error?.message}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-900/30 rounded hover:bg-red-900/50 transition-colors text-red-400"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;