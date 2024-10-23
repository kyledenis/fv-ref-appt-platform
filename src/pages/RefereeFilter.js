import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import TitleWithBar from "../components/TitleWithBar";
import Button from "../components/Button";

const RefereeFilter = () => {
    const { referees, venues, filters, updateFilters } = useAppContext();
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [filteredReferees, setFilteredReferees] = useState([]);

    useEffect(() => {
        const loadGoogleMapsApi = () => {
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&callback=initMap`;
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);

            window.initMap = () => {
                const newMap = new window.google.maps.Map(mapRef.current, {
                    center: { lat: -37.8136, lng: 144.9631 },
                    zoom: 12,
                });
                setMap(newMap);
            };
        };

        if (!window.google) {
            loadGoogleMapsApi();
        } else {
            window.initMap();
        }

        return () => {
            window.google = undefined;
        };
    }, []);

    useEffect(() => {
        if (map) {
            try {
                updateMapMarkers();
            } catch (error) {
                console.error("Error updating map markers:", error);
            }
        }
    }, [map, filteredReferees, venues]);

    useEffect(() => {
        console.log("Venues data:", venues);
        if (
            venues.some(
                (venue) =>
                    !venue.location ||
                    typeof venue.location.lat !== "number" ||
                    typeof venue.location.lng !== "number",
            )
        ) {
            console.warn("Some venues have invalid location data");
        }
    }, [venues]);

    const updateMapMarkers = () => {
        markers.forEach((marker) => marker.setMap(null));
        const newMarkers = [];

        filteredReferees.forEach((referee) => {
            if (
                referee.location &&
                typeof referee.location.lat === "number" &&
                typeof referee.location.lng === "number"
            ) {
                try {
                    const marker = new window.google.maps.Marker({
                        position: referee.location,
                        map: map,
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
                        title: referee.name,
                    });
                    newMarkers.push(marker);
                } catch (error) {
                    console.error(
                        "Error creating referee marker:",
                        error,
                        referee,
                    );
                }
            } else {
                console.warn("Invalid location data for referee:", referee);
            }
        });

        venues.forEach((venue) => {
            if (
                venue.location &&
                typeof venue.location.lat === "number" &&
                typeof venue.location.lng === "number"
            ) {
                try {
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
                    newMarkers.push(marker);
                } catch (error) {
                    console.error("Error creating venue marker:", error, venue);
                }
            } else {
                console.warn("Invalid location data for venue:", venue);
            }
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
            if (!referee.location) return false;

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

            let withinDistance = true;
            if (filters.distance) {
                const centerPoint = { lat: -37.8136, lng: 144.9631 }; // Melbourne CBD
                const distance = calculateDistance(
                    referee.location,
                    centerPoint,
                );
                withinDistance = distance <= parseInt(filters.distance);
            }

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
