import React, { useState, useEffect, useRef } from "react";
import TitleWithBar from "../components/TitleWithBar";
import Button from "../components/Button";
import { venueService } from "../services/api";
import {
    Map,
    Search,
    Plus,
    MapPin,
    Users,
    ChevronLeft,
    ChevronRight,
    Grid2X2,
    MapIcon,
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorDisplay from "../components/ErrorDisplay";
import VenueForm from "../components/VenueForm";
import VenueDetails from "../components/VenueDetails";
import { toast } from "react-toastify";
import { geocodeAddress } from "../utils/geocoding";

const MELBOURNE_CENTER = { lat: -37.8136, lng: 144.9631 };
const ITEMS_PER_PAGE = 9;

const Venues = () => {
    const mapRef = useRef(null);
    const markersRef = useRef([]);
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mapLoading, setMapLoading] = useState(false);
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState("grid");
    const [searchTerm, setSearchTerm] = useState("");
    const [mapError, setMapError] = useState(null);

    // Filter venues based on search term
    const filteredVenues = venues.filter(
        (venue) =>
            venue.venue_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            venue.location.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Calculate pagination
    const totalPages = Math.ceil(filteredVenues.length / ITEMS_PER_PAGE);
    const paginatedVenues = filteredVenues.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );

    useEffect(() => {
        const fetchVenues = async () => {
            try {
                setLoading(true);
                const response = await venueService.getAllVenues();
                const venuesData = Array.isArray(response.data)
                    ? response.data
                    : response.data.results || [];
                setVenues(venuesData);
            } catch (error) {
                console.error("Error fetching venues:", error);
                toast.error("Failed to load venues");
            } finally {
                setLoading(false);
            }
        };

        fetchVenues();
    }, []);

    const initializeMap = async () => {
        if (!mapRef.current) {
            console.error("Map container not available");
            return;
        }

        try {
            setMapLoading(true);
            setMapError(null);

            // Initialize map
            const map = new window.google.maps.Map(mapRef.current, {
                center: MELBOURNE_CENTER,
                zoom: 11,
                styles: [
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }],
                    },
                ],
            });

            // Clear existing markers
            markersRef.current.forEach((marker) => marker.setMap(null));
            markersRef.current = [];

            const bounds = new window.google.maps.LatLngBounds();
            let markersAdded = 0;

            // Add markers for each venue
            for (const venue of venues) {
                if (venue.location) {
                    try {
                        const geocodeResult = await geocodeAddress(
                            venue.location,
                        );
                        if (geocodeResult?.coordinates) {
                            const marker = new window.google.maps.Marker({
                                position: geocodeResult.coordinates,
                                map: map,
                                title: venue.venue_name,
                            });

                            const infoWindow =
                                new window.google.maps.InfoWindow({
                                    content: `
                                    <div class="p-4">
                                        <h3 class="font-semibold text-lg mb-2">${
                                            venue.venue_name
                                        }</h3>
                                        <p class="text-gray-600 mb-1">${
                                            venue.location
                                        }</p>
                                        <p class="text-gray-600">Capacity: ${venue.capacity.toLocaleString()}</p>
                                    </div>
                                `,
                                });

                            marker.addListener("click", () => {
                                markersRef.current.forEach((m) =>
                                    m.infoWindow?.close(),
                                );
                                infoWindow.open(map, marker);
                            });

                            marker.infoWindow = infoWindow;
                            markersRef.current.push(marker);
                            bounds.extend(geocodeResult.coordinates);
                            markersAdded++;
                        }
                    } catch (error) {
                        console.error(
                            `Error geocoding venue ${venue.venue_name}:`,
                            error,
                        );
                    }
                }
            }

            if (markersAdded > 0) {
                map.fitBounds(bounds);
                const listener = map.addListener("idle", () => {
                    if (map.getZoom() > 15) map.setZoom(15);
                    window.google.maps.event.removeListener(listener);
                });
            }

            setMapLoading(false);
        } catch (error) {
            console.error("Map initialization error:", error);
            setMapError(error.message || "Failed to initialize map");
            setMapLoading(false);
        }
    };

    useEffect(() => {
        const loadGoogleMaps = async () => {
            if (viewMode === "map" && !window.google?.maps) {
                const script = document.createElement("script");
                script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
                script.async = true;
                script.defer = true;

                script.onload = () => {
                    if (mapRef.current) {
                        initializeMap();
                    }
                };

                script.onerror = () => {
                    setMapError("Failed to load Google Maps");
                    setMapLoading(false);
                };

                document.head.appendChild(script);
            } else if (viewMode === "map" && window.google?.maps) {
                initializeMap();
            }
        };

        if (viewMode === "map" && venues.length > 0 && !loading) {
            loadGoogleMaps();
        }

        return () => {
            if (markersRef.current) {
                markersRef.current.forEach((marker) => marker.setMap(null));
                markersRef.current = [];
            }
        };
    }, [viewMode, venues, loading]);

    const handleAddVenue = async (venueData) => {
        try {
            console.log("Creating venue with data:", venueData);

            const response = await venueService.createVenue({
                venue_id: venueData.venue_id,
                venue_name: venueData.venue_name,
                capacity: parseInt(venueData.capacity, 10),
                location: venueData.location,
            });

            setVenues((prev) => [...prev, response.data]);
            setShowAddForm(false);
            toast.success("Venue created successfully");

            // If in map view, reinitialize the map
            if (viewMode === "map") {
                await initializeMap();
            }
        } catch (error) {
            console.error("Error creating venue:", error);
            console.error("Error response:", error.response?.data);
            const errorMessage =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Failed to create venue";
            toast.error(errorMessage);
            throw error;
        }
    };

    if (loading) {
        return <LoadingSpinner message="Loading venues..." />;
    }

    return (
        <>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <TitleWithBar title="Venues" />
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded-lg transition-colors ${
                                viewMode === "grid"
                                    ? "bg-blue-100 text-blue-600"
                                    : "text-gray-400 hover:text-gray-600"
                            }`}
                        >
                            <Grid2X2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode("map")}
                            className={`p-2 rounded-lg transition-colors ${
                                viewMode === "map"
                                    ? "bg-blue-100 text-blue-600"
                                    : "text-gray-400 hover:text-gray-600"
                            }`}
                        >
                            <MapIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <Button onClick={() => setShowAddForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Venue
                    </Button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search venues by name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            </div>

            {viewMode === "map" ? (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-6 mb-6">
                    {mapLoading ? (
                        <div className="h-[500px] flex items-center justify-center">
                            <LoadingSpinner message="Loading map..." />
                        </div>
                    ) : mapError ? (
                        <div className="h-[500px] flex items-center justify-center">
                            <ErrorDisplay
                                error={mapError}
                                message="Failed to load map"
                                onRetry={() => initializeMap()}
                            />
                        </div>
                    ) : (
                        <div
                            ref={mapRef}
                            className="w-full h-[500px] rounded-lg"
                        />
                    )}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        {paginatedVenues.map((venue) => (
                            <div
                                key={venue.venue_id}
                                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer"
                                onClick={() => setSelectedVenue(venue)}
                            >
                                <div className="p-6">
                                    <h3 className="font-semibold text-lg mb-4">
                                        {venue.venue_name}
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center text-gray-600">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            <span className="truncate">
                                                {venue.location}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <Users className="w-4 h-4 mr-2" />
                                            <span>
                                                Capacity:{" "}
                                                {venue.capacity.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-gray-50 border-t">
                                    <Button
                                        variant="secondary"
                                        className="w-full"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(
                                                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                                    venue.location,
                                                )}`,
                                                "_blank",
                                            );
                                        }}
                                    >
                                        <Map className="w-full h-4" />
                                        View on Maps
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-8 mb-8">
                            <button
                                onClick={() =>
                                    setCurrentPage((p) => Math.max(1, p - 1))
                                }
                                disabled={currentPage === 1}
                                className={`p-2 rounded-lg ${
                                    currentPage === 1
                                        ? "text-gray-300"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            <span className="text-gray-600">
                                Page {currentPage} of {totalPages}
                            </span>

                            <button
                                onClick={() =>
                                    setCurrentPage((p) =>
                                        Math.min(totalPages, p + 1),
                                    )
                                }
                                disabled={currentPage === totalPages}
                                className={`p-2 rounded-lg ${
                                    currentPage === totalPages
                                        ? "text-gray-300"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Modals */}
            <VenueForm
                isOpen={showAddForm}
                onSubmit={handleAddVenue}
                onClose={() => setShowAddForm(false)}
            />

            <VenueDetails
                venue={selectedVenue}
                isOpen={!!selectedVenue}
                onClose={() => setSelectedVenue(null)}
            />
        </>
    );
};

export default Venues;
