import { useState, useCallback } from "react";
import { refereeService } from "../services/api";
import { batchGeocodeAddresses, calculateDistance } from "../utils/geocoding";
import { toast } from "react-toastify";

export const useRefereeFilter = () => {
    const [referees, setReferees] = useState([]);
    const [filteredReferees, setFilteredReferees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        availability: false,
        level: "",
        minAge: "",
        minExperience: "",
        distance: 50,
        address: "",
        coordinates: null,
    });

    const fetchReferees = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await refereeService.getAllReferees();
            const refereeData = Array.isArray(response.data)
                ? response.data
                : [];

            // Geocode all referee addresses in batch
            const addressesToGeocode = refereeData.map((referee) => ({
                id: referee.referee_id,
                address: referee.location,
            }));

            const geocodedResults = await batchGeocodeAddresses(
                addressesToGeocode,
            );

            // Process referee data with geocoded coordinates
            const processedReferees = refereeData.map((referee) => {
                const geocodeResult = geocodedResults.find(
                    (r) => r.id === referee.referee_id,
                );
                return {
                    ...referee,
                    coordinates: geocodeResult?.coordinates,
                    formattedAddress: geocodeResult?.formattedAddress,
                };
            });

            setReferees(processedReferees);
            setFilteredReferees(processedReferees);
            return processedReferees;
        } catch (err) {
            const errorMessage =
                err.response?.data?.message || "Failed to fetch referees";
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const applyFilters = useCallback(
        (searchCoordinates = null) => {
            if (!Array.isArray(referees)) return;

            const filtered = referees.filter((referee) => {
                if (!referee) return false;

                // Basic filters
                const meetsLevel =
                    !filters.level || referee.level === filters.level;
                const meetsAge =
                    !filters.minAge ||
                    (referee.age && referee.age >= parseInt(filters.minAge));
                const meetsExperience =
                    !filters.minExperience ||
                    (referee.experience_years &&
                        referee.experience_years >=
                            parseInt(filters.minExperience));
                const meetsAvailability =
                    !filters.availability || referee.isAvailable;

                // Distance filter
                let meetsDistance = true;
                if (
                    searchCoordinates &&
                    referee.coordinates &&
                    filters.distance
                ) {
                    const distance = calculateDistance(
                        searchCoordinates.lat,
                        searchCoordinates.lng,
                        referee.coordinates.lat,
                        referee.coordinates.lng,
                    );
                    meetsDistance = distance <= filters.distance;
                }

                return (
                    meetsLevel &&
                    meetsAge &&
                    meetsExperience &&
                    meetsAvailability &&
                    meetsDistance
                );
            });

            setFilteredReferees(filtered);
            return filtered;
        },
        [referees, filters],
    );

    const updateFilters = useCallback((newFilters) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({
            availability: false,
            level: "",
            minAge: "",
            minExperience: "",
            distance: 50,
            address: "",
            coordinates: null,
        });
        setFilteredReferees(referees);
    }, [referees]);

    return {
        referees,
        filteredReferees,
        loading,
        error,
        filters,
        fetchReferees,
        applyFilters,
        updateFilters,
        resetFilters,
    };
};
