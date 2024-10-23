import React, { createContext, useContext, useState, useEffect } from "react";
import {
    mockUser,
    mockAppointments,
    mockAvailableDates,
    mockUnavailableDates,
    mockVenues,
    mockTeams,
    mockReferees,
} from "../mockData";
import { getTeams } from "../services/api";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);
    const [unavailableDates, setUnavailableDates] = useState([]);
    const [venues, setVenues] = useState([]);
    const [teams, setTeams] = useState([]);
    const [referees, setReferees] = useState([]);
    const [filteredReferees, setFilteredReferees] = useState([]);
    const [filters, setFilters] = useState({
        availability: false,
        level: "",
        minAge: "",
        minExperience: "",
        qualification: "",
        distance: 50,
    });
    
    useEffect(() => {
        const fetchInitialData = async () => {
                setUser(mockUser);
                setAppointments(mockAppointments);
                setAvailableDates(mockAvailableDates);
                setUnavailableDates(mockUnavailableDates);
                setVenues(mockVenues);
                setReferees(mockReferees);
                
                const response = await getTeams(); // Fetch teams from API
                setTeams(response.data); // Set teams from response

        };

        fetchInitialData();
    }, []);

    const updateAppointment = (id, updates) => {
        setAppointments((prevAppointments) =>
            prevAppointments.map((appointment) =>
                appointment.id === id
                    ? { ...appointment, ...updates }
                    : appointment,
            ),
        );
    };
    const login = (userData) => {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    const fetchAppointments = () => {
        // TODO: Fetch appointments from an API
        return Promise.resolve(mockAppointments);
    };

    const updateAvailability = (date, isAvailable, isGeneral, time) => {
        if (isGeneral) {
            const { startDate, endDate, days } = date;
            const start = new Date(startDate);
            const end = new Date(endDate);
            const newAvailableDates = new Set(availableDates);
            const newUnavailableDates = new Set(unavailableDates);

            for (
                let d = new Date(start);
                d <= end;
                d.setDate(d.getDate() + 1)
            ) {
                // Get day index (0-6), where 0 is Monday and 6 is Sunday
                const dayIndex = (d.getDay() + 6) % 7;

                if (days.includes(dayIndex)) {
                    const dateString = d.toISOString().split("T")[0];
                    if (isAvailable) {
                        newAvailableDates.add(dateString);
                        newUnavailableDates.delete(dateString);
                    } else {
                        newUnavailableDates.add(dateString);
                        newAvailableDates.delete(dateString);
                    }
                }
            }

            setAvailableDates(Array.from(newAvailableDates));
            setUnavailableDates(Array.from(newUnavailableDates));
        } else {
            const dateObject = new Date(date);
            const correctedDate = dateObject.toISOString().split("T")[0];

            if (isAvailable) {
                setAvailableDates((prev) => [
                    ...new Set([...prev, correctedDate]),
                ]);
                setUnavailableDates((prev) =>
                    prev.filter((d) => d !== correctedDate),
                );
            } else {
                setUnavailableDates((prev) => [
                    ...new Set([...prev, correctedDate]),
                ]);
                setAvailableDates((prev) =>
                    prev.filter((d) => d !== correctedDate),
                );
            }
        }
    };

    const updateUserSettings = (userId, newSettings) => {
        setUser((prev) => ({
            ...prev,
            settings: {
                ...prev.settings,
                ...newSettings,
            },
        }));
    };

    const addVenue = (newVenue) => {
        setVenues((prevVenues) => [
            ...prevVenues,
            { ...newVenue, id: Date.now() },
        ]);
    };

    const updateFilters = (newFilters) => {
        setFilters(newFilters);
    };

    const applyFilters = () => {
        const filtered = referees.filter((referee) => {
            const isAvailable = !filters.availability || referee.isAvailable;
            const meetsLevelRequirement = !filters.level || referee.level === filters.level;
            const meetsAgeRequirement = !filters.minAge || referee.age >= filters.minAge;
            const meetsExperienceRequirement = !filters.minExperience || referee.experienceYears >= filters.minExperience;
            const hasRequiredQualification = !filters.qualification || referee.qualifications.includes(filters.qualification);
            const withinDistance = !filters.distance || calculateDistance(referee.location, { lat: -37.8136, lng: 144.9631 }) <= filters.distance;

            return isAvailable && meetsLevelRequirement && meetsAgeRequirement && meetsExperienceRequirement && hasRequiredQualification && withinDistance;
        });

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
        <AppContext.Provider
            value={{
                user,
                teams,
                login,
                logout,
                appointments,
                availableDates,
                unavailableDates,
                updateAppointment,
                fetchAppointments,
                updateAvailability,
                updateUserSettings,
                venues,
                addVenue,
                referees,
                filteredReferees,
                filters,
                updateFilters,
                applyFilters,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);

export default AppContext;
