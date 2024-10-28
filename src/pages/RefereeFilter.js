import React, { useEffect, useRef, useState } from "react";
import { useRefereeFilter } from "../hooks/useRefereeFilter";
import {
    geocodeAddress,
    calculateDistance,
    formatDistance,
} from "../utils/geocoding";
import { MapManager } from "../utils/mapManager";
import TitleWithBar from "../components/TitleWithBar";
import Button from "../components/Button";
import AddressInput from "../components/AddressInput";
import { toast } from "react-toastify";
import { Search } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorDisplay from "../components/ErrorDisplay";

const MELBOURNE_CENTER = { lat: -37.8136, lng: 144.9631 };

const RefereeFilter = () => {
    const mapRef = useRef(null);
    const mapManagerRef = useRef(null);
    const [map, setMap] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [mapError, setMapError] = useState(null);

    const {
        filteredReferees,
        loading,
        error,
        filters,
        updateFilters,
        applyFilters,
        resetFilters,
        fetchReferees,
    } = useRefereeFilter();

    // Initialize Google Maps
    useEffect(() => {
        const initializeMap = async () => {
            try {
                // Create new MapManager instance if it doesn't exist
                if (!mapManagerRef.current) {
                    mapManagerRef.current = new MapManager();
                }

                // Initialize the map
                const mapInstance = await mapManagerRef.current.initializeMap(
                    mapRef.current,
                    {
                        center: MELBOURNE_CENTER,
                        zoom: 11,
                        styles: [
                            {
                                featureType: "poi",
                                elementType: "labels",
                                stylers: [{ visibility: "off" }],
                            },
                        ],
                    },
                );

                setMap(mapInstance);
                setMapError(null);
            } catch (err) {
                console.error("Map initialization error:", err);
                setMapError(err.message || "Failed to load map");
            }
        };

        if (mapRef.current) {
            initializeMap();
        }

        // Cleanup
        return () => {
            if (mapManagerRef.current) {
                mapManagerRef.current.cleanup();
            }
            if (markers.length > 0) {
                markers.forEach((marker) => marker.setMap(null));
            }
        };
    }, []);

    // Update map markers when filtered referees change
    useEffect(() => {
        if (!map || !filteredReferees?.length) return;

        try {
            // Clear existing markers
            markers.forEach((marker) => marker.setMap(null));
            const bounds = new window.google.maps.LatLngBounds();
            const newMarkers = [];

            // Add search location marker if exists
            if (filters.coordinates) {
                const searchMarker = new window.google.maps.Marker({
                    position: filters.coordinates,
                    map: map,
                    title: "Search Location",
                    icon: {
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: "#FF0000",
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "#FFFFFF",
                    },
                });
                newMarkers.push(searchMarker);
                bounds.extend(filters.coordinates);
            }

            // Add referee markers
            filteredReferees.forEach((referee) => {
                if (referee.coordinates) {
                    const marker = new window.google.maps.Marker({
                        position: referee.coordinates,
                        map: map,
                        title: `${referee.first_name} ${referee.last_name}`,
                        icon: {
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 8,
                            fillColor: referee.isAvailable
                                ? "#4CAF50"
                                : "#FF5722",
                            fillOpacity: 1,
                            strokeWeight: 2,
                            strokeColor: "#FFFFFF",
                        },
                    });

                    const infoWindow = new window.google.maps.InfoWindow({
                        content: `
                            <div class="p-2">
                                <h3 class="font-semibold">${
                                    referee.first_name
                                } ${referee.last_name}</h3>
                                <p>Level: ${referee.level}</p>
                                <p>Experience: ${
                                    referee.experience_years
                                } years</p>
                                ${
                                    filters.coordinates
                                        ? `<p>Distance: ${formatDistance(
                                              calculateDistance(
                                                  filters.coordinates.lat,
                                                  filters.coordinates.lng,
                                                  referee.coordinates.lat,
                                                  referee.coordinates.lng,
                                              ),
                                          )}</p>`
                                        : ""
                                }
                            </div>
                        `,
                    });

                    marker.addListener("click", () => {
                        markers.forEach((m) => m.infoWindow?.close());
                        infoWindow.open(map, marker);
                    });

                    marker.infoWindow = infoWindow;
                    newMarkers.push(marker);
                    bounds.extend(referee.coordinates);
                }
            });

            setMarkers(newMarkers);

            if (newMarkers.length > 0) {
                map.fitBounds(bounds);
                const listener = map.addListener("idle", () => {
                    if (map.getZoom() > 15) map.setZoom(15);
                    window.google.maps.event.removeListener(listener);
                });
            }
        } catch (err) {
            console.error("Error updating markers:", err);
            toast.error("Error updating map markers");
        }
    }, [map, filteredReferees, filters.coordinates]);
    // Fetch initial referee data
    useEffect(() => {
        fetchReferees();
    }, [fetchReferees]);

    const handleAddressSelect = async (location) => {
        if (location?.coordinates) {
            updateFilters({
                address: location.formattedAddress,
                coordinates: location.coordinates,
            });
            applyFilters(location.coordinates);
        }
    };

    const handleSearch = async () => {
        if (!filters.address) {
            toast.warn("Please enter an address to search");
            return;
        }

        setIsSearching(true);
        try {
            const geocodeResult = await geocodeAddress(filters.address);
            if (geocodeResult) {
                handleAddressSelect(geocodeResult);
                if (map) {
                    map.setCenter(geocodeResult.coordinates);
                    map.setZoom(12);
                }
            } else {
                toast.error("Couldn't find the specified address");
            }
        } catch (error) {
            toast.error("Error geocoding address");
        } finally {
            setIsSearching(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === "checkbox" ? checked : value;
        updateFilters({ [name]: newValue });
    };

    const handleApplyFilters = () => {
        applyFilters(filters.coordinates);
    };

    const handleReset = () => {
        resetFilters();
        if (map) {
            map.setCenter(MELBOURNE_CENTER);
            map.setZoom(11);
        }
    };

    const renderMap = () => {
        if (mapError) {
            return (
                <ErrorDisplay
                    error={mapError}
                    message="Failed to load map"
                    onRetry={() => {
                        setMapError(null);
                        if (mapManagerRef.current) {
                            mapManagerRef.current.cleanup();
                        }
                        if (mapRef.current) {
                            mapManagerRef.current = new MapManager();
                            mapManagerRef.current.initializeMap(mapRef.current);
                        }
                    }}
                />
            );
        }

        return (
            <div className="relative">
                <div ref={mapRef} className="w-full h-[500px] rounded-lg" />
                {loading && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 z-10 flex items-center justify-center">
                        <LoadingSpinner message="Loading map data..." />
                    </div>
                )}
            </div>
        );
    };

    if (error) {
        return (
            <ErrorDisplay
                error={error}
                message="Failed to load referee data"
                onRetry={() => window.location.reload()}
            />
        );
    }

    return (
        <>
            <TitleWithBar title="Referee Filter" />

            {/* Filters Panel */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Location Search */}
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Location
                        </label>
                        <div className="flex space-x-2">
                            <AddressInput
                                value={filters.address}
                                onChange={(value) =>
                                    updateFilters({ address: value })
                                }
                                onLocationSelect={handleAddressSelect}
                                isSearching={isSearching}
                            />
                            <Button
                                onClick={handleSearch}
                                disabled={loading || isSearching}
                            >
                                <Search className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Distance Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Maximum Distance (km)
                        </label>
                        <input
                            type="number"
                            name="distance"
                            value={filters.distance}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            min="0"
                            max="200"
                        />
                    </div>

                    {/* Level Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Level
                        </label>
                        <select
                            name="level"
                            value={filters.level}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">All Levels</option>
                            <option value="1">Level 1</option>
                            <option value="2">Level 2</option>
                            <option value="3">Level 3</option>
                            <option value="4">Level 4</option>
                        </select>
                    </div>

                    {/* Age Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Minimum Age
                        </label>
                        <input
                            type="number"
                            name="minAge"
                            value={filters.minAge}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            min="0"
                        />
                    </div>

                    {/* Experience Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Minimum Experience (years)
                        </label>
                        <input
                            type="number"
                            name="minExperience"
                            value={filters.minExperience}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            min="0"
                        />
                    </div>

                    {/* Availability Filter */}
                    <div className="flex items-center h-full pt-6">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name="availability"
                                checked={filters.availability}
                                onChange={handleFilterChange}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                Available Only
                            </span>
                        </label>
                    </div>
                </div>

                <div className="mt-6 space-y-2">
                    <Button
                        onClick={handleReset}
                        className="w-full"
                        variant="secondary"
                    >
                        Reset Filters
                    </Button>
                    <Button
                        onClick={handleApplyFilters}
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? "Applying Filters..." : "Apply Filters"}
                    </Button>
                </div>
            </div>

            {/* Map View */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden p-4 mt-6">
                {renderMap()}
            </div>

            {/* Results */}
            <div className="bg-white rounded-lg shadow-lg p-6 mt-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">
                    Found {filteredReferees.length} matching referees
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredReferees.length > 0 ? (
                        filteredReferees.map((referee) => (
                            <div
                                key={referee.referee_id}
                                className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-medium">
                                            {referee.first_name}{" "}
                                            {referee.last_name}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Level: {referee.level}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Experience:{" "}
                                            {referee.experience_years} years
                                        </p>
                                        {filters.coordinates &&
                                            referee.coordinates && (
                                                <p className="text-sm text-gray-600">
                                                    Distance:{" "}
                                                    {formatDistance(
                                                        calculateDistance(
                                                            filters.coordinates
                                                                .lat,
                                                            filters.coordinates
                                                                .lng,
                                                            referee.coordinates
                                                                .lat,
                                                            referee.coordinates
                                                                .lng,
                                                        ),
                                                    )}
                                                </p>
                                            )}
                                    </div>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            referee.isAvailable
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                        }`}
                                    >
                                        {referee.isAvailable
                                            ? "Available"
                                            : "Unavailable"}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8 text-gray-500">
                            No referees found matching the selected criteria
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default RefereeFilter;
