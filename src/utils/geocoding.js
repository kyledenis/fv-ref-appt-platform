import { loadGoogleMapsScript } from "./loadGoogleMapsScript";

// Cache for geocoded addresses to prevent redundant API calls
const geocodeCache = new Map();

// Geocode a single address
export const geocodeAddress = async (address) => {
    if (!address) return null;

    // Check cache first
    const cachedResult = geocodeCache.get(address);
    if (cachedResult) {
        return cachedResult;
    }

    try {
        // Ensure Google Maps is loaded
        await loadGoogleMapsScript();

        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                address,
            )}&components=country:AU&key=${
                process.env.REACT_APP_GOOGLE_MAPS_API_KEY
            }`,
        );

        if (!response.ok) {
            throw new Error(`Geocoding failed: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "OK" && data.results.length > 0) {
            const result = data.results[0];
            const geocodeResult = {
                coordinates: result.geometry.location,
                formattedAddress: result.formatted_address,
                placeId: result.place_id,
                addressComponents: result.address_components,
            };

            // Cache the result
            geocodeCache.set(address, geocodeResult);
            return geocodeResult;
        } else {
            console.error("Geocoding failed:", data.status);
            return null;
        }
    } catch (error) {
        console.error("Error geocoding address:", error);
        return null;
    }
};

// Batch geocode multiple addresses
export const batchGeocodeAddresses = async (addresses, batchSize = 10) => {
    const results = [];
    const errors = [];

    // Process addresses in batches
    for (let i = 0; i < addresses.length; i += batchSize) {
        const batch = addresses.slice(i, i + batchSize);
        const batchPromises = batch.map(async ({ id, address }) => {
            try {
                const result = await geocodeAddress(address);
                return {
                    id,
                    address,
                    ...result,
                };
            } catch (error) {
                errors.push({ id, address, error: error.message });
                return null;
            }
        });

        // Add delay between batches to respect rate limits
        if (i > 0) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults.filter(Boolean));
    }

    if (errors.length > 0) {
        console.warn("Some addresses failed to geocode:", errors);
    }

    return results;
};

// Calculate distance between two points using Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const lat1Rad = (lat1 * Math.PI) / 180;
    const lon1Rad = (lon1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const lon2Rad = (lon2 * Math.PI) / 180;

    const dLat = lat2Rad - lat1Rad;
    const dLon = lon2Rad - lon1Rad;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1Rad) *
            Math.cos(lat2Rad) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Check if a point is within a given radius of a center point
export const isWithinRadius = (center, point, radius) => {
    if (!center || !point) return false;
    const distance = calculateDistance(
        center.lat,
        center.lng,
        point.lat,
        point.lng,
    );
    return distance <= radius;
};

// Format distance for display
export const formatDistance = (distance, precise = false) => {
    if (distance == null) return "N/A";

    if (distance < 1) {
        const meters = Math.round(distance * 1000);
        return `${meters}m`;
    }

    return precise ? `${distance.toFixed(2)}km` : `${Math.round(distance)}km`;
};

// Create a custom marker icon for Google Maps
export const createMarkerIcon = ({
    fillColor = "#FF0000",
    scale = 8,
    fillOpacity = 1,
    strokeWeight = 2,
    strokeColor = "#FFFFFF",
}) => ({
    path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
    scale,
    fillColor,
    fillOpacity,
    strokeWeight,
    strokeColor,
});
