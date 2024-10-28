export const MELBOURNE_CENTER = { lat: -37.8136, lng: 144.9631 };

let googleMapsPromise = null;

export class MapManager {
    constructor() {
        this.map = null;
        this.markers = new Map();
        this.infoWindows = new Map();
        this.bounds = null;
        this.isInitialized = false;
    }

    async loadGoogleMaps() {
        if (window.google?.maps) {
            return window.google;
        }

        const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        if (!API_KEY) {
            throw new Error(
                "Google Maps API key is not configured. Please check your environment variables.",
            );
        }

        try {
            await new Promise((resolve, reject) => {
                const script = document.createElement("script");
                script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
                script.async = true;
                script.defer = true;

                script.addEventListener("load", () => {
                    if (window.google?.maps) {
                        resolve(window.google);
                    } else {
                        reject(
                            new Error("Google Maps failed to load properly"),
                        );
                    }
                });

                script.addEventListener("error", () => {
                    reject(new Error("Failed to load Google Maps script"));
                });

                document.head.appendChild(script);
            });

            return window.google;
        } catch (error) {
            console.error("Error loading Google Maps:", error);
            throw new Error("Failed to load Google Maps: " + error.message);
        }
    }

    async initializeMap(mapElement, options = {}) {
        if (!mapElement) {
            throw new Error("Map container element is required");
        }

        try {
            const google = await this.loadGoogleMaps();

            // Clear any existing markers
            this.clearMarkers();

            const defaultOptions = {
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

            this.map = new google.maps.Map(mapElement, {
                ...defaultOptions,
                ...options,
            });

            this.bounds = new google.maps.LatLngBounds();
            this.isInitialized = true;

            return this.map;
        } catch (error) {
            console.error("Failed to initialize map:", error);
            throw new Error("Failed to initialize map: " + error.message);
        }
    }

    clearMarkers() {
        if (!this.markers) return;

        this.markers.forEach((marker) => marker.setMap(null));
        this.markers.clear();

        if (this.infoWindows) {
            this.infoWindows.forEach((window) => window.close());
            this.infoWindows.clear();
        }

        if (this.bounds && window.google) {
            this.bounds = new window.google.maps.LatLngBounds();
        }
    }

    addMarker(id, position, options = {}) {
        if (!this.isInitialized || !this.map) {
            console.warn("Map not initialized");
            return null;
        }

        if (this.markers.has(id)) {
            this.markers.get(id).setMap(null);
        }

        const marker = new window.google.maps.Marker({
            position,
            map: this.map,
            ...options,
        });

        this.markers.set(id, marker);
        this.bounds.extend(position);
        return marker;
    }

    addInfoWindow(id, marker, content) {
        if (!this.isInitialized || !this.map) {
            console.warn("Map not initialized");
            return null;
        }

        if (this.infoWindows.has(id)) {
            this.infoWindows.get(id).close();
        }

        const infoWindow = new window.google.maps.InfoWindow({
            content,
        });

        marker.addListener("click", () => {
            this.infoWindows.forEach((window) => window.close());
            infoWindow.open(this.map, marker);
        });

        this.infoWindows.set(id, infoWindow);
        return infoWindow;
    }

    fitBounds() {
        if (!this.isInitialized || !this.map || !this.bounds) return;
        if (this.markers.size > 0) {
            this.map.fitBounds(this.bounds);
        }
    }

    setCenter(position) {
        if (!this.isInitialized || !this.map) return;
        this.map.setCenter(position);
    }

    getMap() {
        return this.map;
    }

    cleanup() {
        this.clearMarkers();
        this.map = null;
        this.bounds = null;
        this.isInitialized = false;
    }
}
