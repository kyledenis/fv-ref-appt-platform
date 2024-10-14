import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import { UserCircle, MapPin } from "lucide-react";

const GeographicalView = () => {
    const { filteredReferees, venues, filters, updateFilters, applyFilters } =
        useAppContext();
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);

    useEffect(() => {
        if (!map) {
            const googleMapScript = document.createElement("script");
            googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&callback=initMap&v=beta`;
            googleMapScript.async = true;
            window.document.body.appendChild(googleMapScript);

            window.initMap = () => {
                const newMap = new window.google.maps.Map(mapRef.current, {
                    center: { lat: -37.8136, lng: 144.9631 },
                    zoom: 10,
                });
                setMap(newMap);
            };

            return () => {
                window.document.body.removeChild(googleMapScript);
            };
        }
    }, [map]);

    useEffect(() => {
        if (map) {
            // Clear existing markers
            map.data.forEach((feature) => {
                map.data.remove(feature);
            });

            // Add referee markers
            filteredReferees.forEach((referee) => {
                const marker = new window.google.maps.Marker({
                    position: referee.location,
                    map: map,
                    icon: {
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: referee.isAvailable ? "#4CAF50" : "#FF5722",
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "#FFFFFF",
                    },
                    title: referee.name,
                });
            });

            // Add venue markers
            venues.forEach((venue) => {
                const marker = new window.google.maps.Marker({
                    position: venue.location,
                    map: map,
                    icon: {
                        path: window.google.maps.SymbolPath
                            .BACKWARD_CLOSED_ARROW,
                        scale: 6,
                        fillColor: "#2196F3",
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "#FFFFFF",
                    },
                    title: venue.name,
                });
            });
        }
    }, [map, filteredReferees, venues]);

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        updateFilters({
            ...filters,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleApplyFilters = () => {
        applyFilters();
    };

    return (
        <div>
            <div className="bg-blue-600 text-white p-4 mb-4">
                <h1 className="text-2xl font-bold">Geographical View</h1>
            </div>
            <div className="container mx-auto">
                <div className="mb-4 grid grid-cols-2 gap-4">
                    <label className="block">
                        <input
                            type="checkbox"
                            name="availability"
                            checked={filters.availability}
                            onChange={handleFilterChange}
                            className="mr-2"
                        />
                        Available Only
                    </label>
                    <label className="block">
                        <span className="mr-2">Level:</span>
                        <select
                            name="level"
                            value={filters.level}
                            onChange={handleFilterChange}
                            className="border p-1"
                        >
                            <option value="">All</option>
                            <option value="Junior">Junior</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Senior">Senior</option>
                        </select>
                    </label>
                    <label className="block">
                        <span className="mr-2">Min Age:</span>
                        <input
                            type="number"
                            name="minAge"
                            value={filters.minAge}
                            onChange={handleFilterChange}
                            className="border p-1 w-20"
                        />
                    </label>
                    <label className="block">
                        <span className="mr-2">Min Experience (years):</span>
                        <input
                            type="number"
                            name="minExperience"
                            value={filters.minExperience}
                            onChange={handleFilterChange}
                            className="border p-1 w-20"
                        />
                    </label>
                    <label className="block">
                        <span className="mr-2">Qualification:</span>
                        <select
                            name="qualification"
                            value={filters.qualification}
                            onChange={handleFilterChange}
                            className="border p-1"
                        >
                            <option value="">All</option>
                            <option value="FIFA">FIFA</option>
                            <option value="National">National</option>
                            <option value="Regional">Regional</option>
                            <option value="Youth">Youth</option>
                        </select>
                    </label>
                    <label className="block">
                        <span className="mr-2">Max Distance (km):</span>
                        <input
                            type="number"
                            name="distance"
                            value={filters.distance}
                            onChange={handleFilterChange}
                            className="border p-1 w-20"
                        />
                    </label>
                </div>
                <button
                    onClick={handleApplyFilters}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Apply Filters
                </button>
                <div
                    ref={mapRef}
                    style={{
                        width: "100%",
                        height: "500px",
                        marginTop: "20px",
                    }}
                ></div>
                <div>Filtered Referees: {filteredReferees.length}</div>
                <div>Venues: {venues.length}</div>
            </div>
        </div>
    );
};

export default GeographicalView;
