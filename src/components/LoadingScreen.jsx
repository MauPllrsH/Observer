import React from 'react';

const LoadingScreen = () => {
    const renderCubeSet = (height) => {
        return Array.from({ length: 3 }, (_, w) =>
            Array.from({ length: 3 }, (_, l) => (
                <div key={`h${height}w${w+1}l${l+1}`} className={`cube h${height} w${w+1} l${l+1}`}>
                    <div className="face top"></div>
                    <div className="face left"></div>
                    <div className="face right"></div>
                </div>
            ))
        ).flat();
    };

    return (
        <div className="loading-screen">
            <div className="container">
                <div className="h1Container">
                    {renderCubeSet(1)}
                </div>
                <div className="h2Container">
                    {renderCubeSet(2)}
                </div>
                <div className="h3Container">
                    {renderCubeSet(3)}
                </div>
            </div>
            <h2>Loading Dashboard...</h2>
        </div>
    );
};

export default LoadingScreen;