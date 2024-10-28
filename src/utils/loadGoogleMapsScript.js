// Track loading state
let googleMapsPromise = null;
let isInitialized = false;

// Default map options
export const MELBOURNE_CENTER = { lat: -37.8136, lng: 144.9631 };
export const DEFAULT_MAP_OPTIONS = {
    center: MELBOURNE_CENTER,
    zoom: 11,
    styles: [
        {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
        },
    ],
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true,
};

// Load the Google Maps JavaScript API
export const loadGoogleMapsScript = () => {
    // Return existing promise if we're already loading
    if (googleMapsPromise) {
        return googleMapsPromise;
    }

    // Create new promise for loading
    googleMapsPromise = new Promise((resolve, reject) => {
        // If Google Maps is already loaded, resolve immediately
        if (window.google?.maps) {
            isInitialized = true;
            resolve(window.google);
            return;
        }

        try {
            const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

            if (!API_KEY) {
                throw new Error("Google Maps API key is not configured");
            }

            // Clean up any existing scripts first
            const existingScripts = document.querySelectorAll(
                'script[src*="maps.googleapis.com"]',
            );
            existingScripts.forEach((script) => script.remove());

            // Create new script element
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
            script.async = true;
            script.defer = true;

            // Setup load handler
            script.addEventListener("load", () => {
                // Wait briefly for Google Maps to initialize
                setTimeout(() => {
                    if (window.google?.maps) {
                        isInitialized = true;
                        resolve(window.google);
                    } else {
                        reject(new Error("Google Maps failed to initialize"));
                    }
                }, 100);
            });

            // Setup error handler
            script.addEventListener("error", (error) => {
                console.error("Google Maps script loading error:", error);
                reject(new Error("Failed to load Google Maps script"));
            });

            // Add script to document
            document.head.appendChild(script);
        } catch (error) {
            console.error("Error in loadGoogleMapsScript:", error);
            reject(error);
        }
    });

    return googleMapsPromise;
};

// Check if Google Maps is loaded
export const isGoogleMapsLoaded = () => {
    return isInitialized && !!window.google?.maps;
};

// Get Google Maps object if loaded
export const getGoogleMaps = () => {
    return window.google?.maps || null;
};

// Initialize a new Google Map instance
export const initializeMap = async (mapElement, options = {}) => {
    if (!mapElement) {
        throw new Error("Map container element is required");
    }

    try {
        await loadGoogleMapsScript();

        const mapOptions = {
            ...DEFAULT_MAP_OPTIONS,
            ...options,
        };

        const map = new window.google.maps.Map(mapElement, mapOptions);
        return map;
    } catch (error) {
        console.error("Failed to initialize map:", error);
        throw error;
    }
};

// Clean up Google Maps resources
export const cleanupGoogleMaps = () => {
    const scripts = document.querySelectorAll(
        'script[src*="maps.googleapis.com"]',
    );
    scripts.forEach((script) => script.remove());

    // Reset state
    googleMapsPromise = null;
    isInitialized = false;

    // Clean up global objects
    delete window.google;
    delete window.initMap;
};
