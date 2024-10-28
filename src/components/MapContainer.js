import React from 'react';

const MapContainer = ({ mapRef, error, isLoading }) => {
    if (error) {
        return (
            <div className="w-full h-[500px] rounded-lg bg-red-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-red-600 font-medium mb-2">Failed to load map</p>
                    <p className="text-sm text-red-500">{error}</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="w-full h-[500px] rounded-lg bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-2"></div>
                    <p className="text-gray-600">Loading map...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={mapRef}
            className="w-full h-[500px] rounded-lg shadow-lg"
            id="google-map"
        />
    );
};

export default MapContainer;