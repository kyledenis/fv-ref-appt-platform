let googleMapsPromise = null;

export const loadGoogleMapsScript = () => {
    if (!googleMapsPromise) {
        googleMapsPromise = new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap&v=weekly`;
            script.async = true;
            script.defer = true;

            window.initMap = () => {
                resolve(window.google);
                delete window.initMap;
            };

            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    return googleMapsPromise;
};
