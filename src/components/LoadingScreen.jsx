import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, AlertCircle } from 'lucide-react';

const LoadingScreen = () => {
    const [loadingText, setLoadingText] = useState('Initializing security systems');
    const [dots, setDots] = useState('');
    
    // Cycle through loading messages
    useEffect(() => {
        const messages = [
            'Initializing security systems',
            'Connecting to WAF network',
            'Loading attack signatures',
            'Calibrating threat detection',
            'Scanning for anomalies'
        ];
        
        let messageIndex = 0;
        
        const intervalId = setInterval(() => {
            messageIndex = (messageIndex + 1) % messages.length;
            setLoadingText(messages[messageIndex]);
        }, 2000);
        
        return () => clearInterval(intervalId);
    }, []);
    
    // Animate loading dots
    useEffect(() => {
        const dotsInterval = setInterval(() => {
            setDots(prev => {
                if (prev.length >= 3) return '';
                return prev + '.';
            });
        }, 400);
        
        return () => clearInterval(dotsInterval);
    }, []);
    
    return (
        <div className="loading-screen">
            <div className="loading-screen-content">
                <div>
                    <h1 className="app-title">SNOOPYWAF</h1>
                    <p className="app-subtitle">Security Dashboard</p>
                </div>
                
                <div className="security-icons">
                    <Shield size={28} className="icon shield" />
                    <AlertTriangle size={24} className="icon alert" />
                    <AlertCircle size={20} className="icon circle" />
                </div>
                
                <div className="progress-container">
                    <div className="progress-bar"></div>
                </div>
                
                <div className="loading-message">
                    {loadingText}{dots}
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;