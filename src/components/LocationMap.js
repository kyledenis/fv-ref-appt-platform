import React, { useEffect, useRef } from "react";

const LocationMap = ({
    location,
    zoom = 15,
    width = "100%",
    height = "300px",
}) => {
    const mapRef = useRef(null);
    const googleMapRef = useRef(null);

    useEffect(() => {
        const loadMap = () => {
            if (window.google && window.google.maps) {
                initMap();
            } else {
                const script = document.createElement("script");
                script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&callback=initMap&v=beta`;
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);
                window.initMap = initMap;
            }
        };

        const initMap = () => {
            googleMapRef.current = new window.google.maps.Map(mapRef.current, {
                center: location,
                zoom: zoom,
                mapId: "4f90136a1b865575",
                disableDefaultUI: true,
                zoomControl: true,
                mapTypeControl: false,
                scaleControl: true,
                streetViewControl: false,
                rotateControl: false,
                fullscreenControl: false,
            });

            new window.google.maps.Marker({
                position: location,
                map: googleMapRef.current,
            });
        };

        loadMap();

        return () => {
            delete window.initMap;
        };
    }, [location, zoom]);

    return <div ref={mapRef} style={{ width, height }} />;
};

export default LocationMap;
