import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import TitleWithBar from "../components/TitleWithBar";
import Button from "../components/Button";

const RefereeFilter = () => {
    const { referees, venues, filters, updateFilters, applyFilters } =
        useAppContext();
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [filteredReferees, setFilteredReferees] = useState([]);

    useEffect(() => {
        if (!map) {
            const googleMapScript = document.createElement("script");
            googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&callback=initMap&v=weekly`;
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
            updateMapMarkers();
        }
    }, [map, filteredReferees, venues]);

    const updateMapMarkers = () => {
        // Clear existing markers
        markers.forEach((marker) => marker.setMap(null));

        const newMarkers = [];

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
            newMarkers.push(marker);
        });

        // Add venue markers
        venues.forEach((venue) => {
            const marker = new window.google.maps.Marker({
                position: venue.location,
                map: map,
                icon: {
                    path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                    scale: 6,
                    fillColor: "#2196F3",
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "#FFFFFF",
                },
                title: venue.name,
            });
            newMarkers.push(marker);
        });

        setMarkers(newMarkers);
    };

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        updateFilters({
            ...filters,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleApplyFilters = () => {
        const filtered = referees.filter((referee) => {
            const isAvailable = !filters.availability || referee.isAvailable;
            const meetsLevelRequirement =
                !filters.level || referee.level === filters.level;
            const meetsAgeRequirement =
                !filters.minAge || referee.age >= parseInt(filters.minAge);
            const meetsExperienceRequirement =
                !filters.minExperience ||
                referee.experienceYears >= parseInt(filters.minExperience);
            const hasRequiredQualification =
                !filters.qualification ||
                referee.qualifications.includes(filters.qualification);
            const withinDistance =
                !filters.distance ||
                calculateDistance(referee.location, {
                    lat: -37.8136,
                    lng: 144.9631,
                }) <= parseInt(filters.distance);

            return (
                isAvailable &&
                meetsLevelRequirement &&
                meetsAgeRequirement &&
                meetsExperienceRequirement &&
                hasRequiredQualification &&
                withinDistance
            );
        });

        console.log("Filtered Referees:", filtered);
        setFilteredReferees(filtered);
    };

    const calculateDistance = (point1, point2) => {
        const R = 6371; // Radius of the Earth in km
        const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
        const dLon = ((point2.lng - point1.lng) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((point1.lat * Math.PI) / 180) *
                Math.cos((point2.lat * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    };

    return (
        <div>
            <TitleWithBar title="Referee Filter" />
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
            <Button onClick={handleApplyFilters} className="mb-4">
                Apply Filters
            </Button>
            <div
                ref={mapRef}
                style={{ width: "100%", height: "500px", marginBottom: "20px" }}
            ></div>
            <div>Filtered Referees: {filteredReferees.length}</div>
            <div>Venues: {venues.length}</div>
        </div>
    );
};

export default RefereeFilter;
