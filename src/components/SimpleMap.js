import React, { useEffect, useRef, useState } from "react";

const SimpleMap = ({ venues }) => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Load Google Maps script
        const loadGoogleMaps = () => {
            if (!window.google) {
                const script = document.createElement("script");
                script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`;
                script.async = true;
                script.defer = true;
                script.onerror = () => setError("Failed to load Google Maps");

                document.head.appendChild(script);

                script.onload = initializeMap;
            } else {
                initializeMap();
            }
        };

        // Initialize map
        const initializeMap = () => {
            if (!mapRef.current) return;

            const mapInstance = new window.google.maps.Map(mapRef.current, {
                center: { lat: -37.8136, lng: 144.9631 }, // Melbourne
                zoom: 11,
            });

            setMap(mapInstance);

            // Add markers for venues
            venues.forEach((venue) => {
                try {
                    if (venue.location) {
                        const [lat, lng] = venue.location
                            .split(",")
                            .map((coord) => parseFloat(coord.trim()));

                        if (!isNaN(lat) && !isNaN(lng)) {
                            new window.google.maps.Marker({
                                position: { lat, lng },
                                map: mapInstance,
                                title: venue.venue_name,
                            });
                        }
                    }
                } catch (err) {
                    console.warn(
                        `Error adding marker for venue ${venue.venue_name}:`,
                        err,
                    );
                }
            });
        };

        loadGoogleMaps();

        return () => {
            // Cleanup
            setMap(null);
        };
    }, [venues]);

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-lg text-red-600">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div ref={mapRef} className="w-full h-[457px] rounded-lg shadow-lg" />
    );
};

export default SimpleMap;
