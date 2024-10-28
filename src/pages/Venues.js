import React, { useState, useEffect } from "react";
import { useAppContext } from "../contexts/AppContext";
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
import VenueForm from "../components/VenueForm";
import VenueDetails from "../components/VenueDetails";
import LocationMap from "../components/LocationMap";
import { toast } from "react-toastify";

const MELBOURNE_CENTER = { lat: -37.8136, lng: 144.9631 };
const ITEMS_PER_PAGE = 9;

const Venues = () => {
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'map'
    const [searchTerm, setSearchTerm] = useState("");

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

    const handleAddVenue = async (venueData) => {
        try {
            // Log the data being sent
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
        } catch (error) {
            console.error("Error creating venue:", error);
            console.error("Error response:", error.response?.data);

            // Show more specific error message
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
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>

            {viewMode === "map" ? (
                /* Map View */
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-6 mb-6">
                    <LocationMap
                        location={MELBOURNE_CENTER}
                        height="458px"
                        markers={venues.map((venue) => ({
                            position: venue.location
                                ?.split(",")
                                .map((coord) => parseFloat(coord.trim())),
                            title: venue.venue_name,
                        }))}
                    />
                </div>
            ) : (
                /* Grid View */
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
                                        <Map className="w-4 h-4 mr-2" />
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
