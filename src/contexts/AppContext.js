import React, { createContext, useContext, useState, useEffect } from "react";
import {
    authService,
    refereeService,
    appointmentService,
    availabilityService,
    venueService,
    teamService,
} from "../services/api";
import {
    getGoogleMaps,
    isGoogleMapsLoaded,
} from "../utils/loadGoogleMapsScript";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // Core state
    const [user, setUser] = useState(null);
    const [venues, setVenues] = useState([]);
    const [teams, setTeams] = useState([]);
    const [referees, setReferees] = useState([]);
    const [filteredReferees, setFilteredReferees] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);
    const [unavailableDates, setUnavailableDates] = useState([]);

    // UI state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
    const [notifications, setNotifications] = useState([]);

    // Filter state
    const [filters, setFilters] = useState({
        availability: false,
        level: "",
        minAge: "",
        minExperience: "",
        qualification: "",
        distance: 50,
        location: null,
    });

    // Initialize Google Maps
    useEffect(() => {
        const initGoogleMaps = async () => {
            try {
                if (!isGoogleMapsLoaded()) {
                    const script = document.createElement("script");
                    const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

                    if (!API_KEY) {
                        throw new Error(
                            "Google Maps API key is not configured",
                        );
                    }

                    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
                    script.async = true;
                    script.defer = true;

                    await new Promise((resolve, reject) => {
                        script.addEventListener("load", resolve);
                        script.addEventListener("error", reject);
                        document.head.appendChild(script);
                    });
                }
                setGoogleMapsLoaded(true);
            } catch (error) {
                console.error("Error loading Google Maps:", error);
                setError("Failed to load mapping services");
            }
        };

        initGoogleMaps();
    }, []);

    // Check for existing authentication
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("authToken");
            if (token) {
                try {
                    const response = await authService.getCurrentUser();
                    setUser(response.data);
                    await fetchAllData();
                } catch (error) {
                    localStorage.removeItem("authToken");
                    setError("Authentication expired. Please log in again.");
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    // Fetch all necessary data
    const fetchAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [appointmentsRes, venuesRes, teamsRes, refereesRes] =
                await Promise.all([
                    appointmentService.getAllAppointments(),
                    venueService.getAllVenues(),
                    teamService.getAllTeams(),
                    refereeService.getAllReferees(),
                ]);

            setAppointments(appointmentsRes.data);
            setVenues(venuesRes.data);
            setTeams(teamsRes.data);
            setReferees(refereesRes.data);

            if (user?.id) {
                const [availableRes, unavailableRes] = await Promise.all([
                    availabilityService.getAvailableDates(user.id),
                    availabilityService.getUnavailableDates(user.id),
                ]);
                setAvailableDates(availableRes.data);
                setUnavailableDates(unavailableRes.data);
            }
        } catch (error) {
            setError("Failed to fetch data. Please try again.");
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Authentication methods
    const login = async (userData) => {
        try {
            setUser(userData);
            return userData;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem("authToken");
            setUser(null);
            setAppointments([]);
            setAvailableDates([]);
            setUnavailableDates([]);
            setVenues([]);
            setTeams([]);
            setReferees([]);
            setFilteredReferees([]);
            setLoading(false);
        }
    };

    // Appointment methods
    const updateAppointment = async (id, updates) => {
        setLoading(true);
        try {
            const response = await appointmentService.updateAppointment(
                id,
                updates,
            );
            setAppointments((prev) =>
                prev.map((appointment) =>
                    appointment.id === id ? response.data : appointment,
                ),
            );
            return response.data;
        } catch (error) {
            setError("Failed to update appointment");
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Availability methods
    const updateAvailability = async (date, isAvailable, isGeneral) => {
        setLoading(true);
        try {
            const data = {
                date,
                isAvailable,
                isGeneral,
                refereeId: user.id,
            };

            const response = await availabilityService.updateAvailability(
                user.id,
                data,
            );
            setAvailableDates(response.data.availableDates);
            setUnavailableDates(response.data.unavailableDates);

            return response.data;
        } catch (error) {
            setError("Failed to update availability");
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Referee filtering methods
    const applyFilters = async () => {
        setLoading(true);
        try {
            const response = await refereeService.getRefereesByFilters(filters);
            setFilteredReferees(response.data);
        } catch (error) {
            setError("Failed to apply filters");
            console.error("Error applying filters:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateFilters = (newFilters) => {
        setFilters(newFilters);
        applyFilters();
    };

    // Venue methods
    const addVenue = async (venueData) => {
        setLoading(true);
        try {
            const response = await venueService.createVenue(venueData);
            setVenues((prev) => [...prev, response.data]);
            return response.data;
        } catch (error) {
            setError("Failed to add venue");
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // User settings methods
    const updateUserSettings = async (userId, settings) => {
        setLoading(true);
        try {
            const response = await refereeService.updateRefereeProfile(
                userId,
                settings,
            );
            setUser((prev) => ({ ...prev, settings: response.data.settings }));
            return response.data;
        } catch (error) {
            setError("Failed to update settings");
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Notification methods
    const addNotification = (notification) => {
        setNotifications((prev) => [
            ...prev,
            { id: Date.now(), ...notification },
        ]);
    };

    const removeNotification = (id) => {
        setNotifications((prev) =>
            prev.filter((notification) => notification.id !== id),
        );
    };

    // Clear errors
    const clearError = () => {
        setError(null);
    };

    const contextValue = {
        // State
        user,
        appointments,
        availableDates,
        unavailableDates,
        venues,
        teams,
        referees,
        filteredReferees,
        loading,
        error,
        filters,
        googleMapsLoaded,
        notifications,

        // Methods
        login,
        logout,
        updateAppointment,
        updateAvailability,
        updateFilters,
        applyFilters,
        addVenue,
        updateUserSettings,
        addNotification,
        removeNotification,
        clearError,
        refreshData: fetchAllData,
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
};

export default AppContext;
