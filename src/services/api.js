import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Create axios instance with default config
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Auth endpoints
export const authService = {
    login: (credentials) => api.post("/auth/login/", credentials),
    register: (userData) => api.post("/auth/register/", userData),
    logout: () => api.post("/auth/logout/"),
    getCurrentUser: () => api.get("/auth/current-user/"),
};

// Referee endpoints
export const refereeService = {
    getRefereeProfile: (id) => api.get(`/referee/${id}/`),
    updateRefereeProfile: (id, data) => api.put(`/referee/${id}/`, data),
    getAllReferees: () => api.get("/referee/"),
    getRefereesByFilters: (filters) => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                params.append(key, value);
            }
        });

        return api.get(`/referee/filter/?${params.toString()}`);
    },
};

// Appointment endpoints
export const appointmentService = {
    getAllAppointments: async (page = 1) => {
        try {
            console.log("Fetching appointments for page:", page);

            const response = await api.get("/appointments/", {
                params: {
                    page,
                    page_size: 20,
                    ordering: "-appointment_date,appointment_time",
                },
                timeout: 15000, // 15 seconds
            });

            console.log("Raw appointment response:", response);

            // Check if we got a valid response
            if (!response.data) {
                throw new Error("No data received from server");
            }

            // Handle both paginated and non-paginated responses
            const appointments = response.data.results || response.data;
            const count = response.data.count || appointments.length;

            return {
                data: Array.isArray(appointments) ? appointments : [],
                meta: {
                    count: count,
                    next: response.data.next,
                    previous: response.data.previous,
                    current_page: page,
                    total_pages: Math.ceil(count / 20),
                },
            };
        } catch (error) {
            console.error("Detailed appointment fetch error:", {
                error,
                response: error.response,
                request: error.request,
                config: error.config,
            });

            if (error.code === "ECONNABORTED") {
                throw new Error("Request timed out. Please try again.");
            }

            const errorMessage =
                error.response?.data?.error ||
                error.response?.data?.message ||
                error.message ||
                "Failed to fetch appointments";

            throw new Error(errorMessage);
        }
    },

    getAppointment: async (id) => {
        try {
            const response = await api.get(`/appointments/${id}/`);
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.error ||
                    "Failed to fetch appointment details",
            );
        }
    },

    createAppointment: async (data) => {
        try {
            const response = await api.post("/appointments/", data);
            return response;
        } catch (error) {
            console.error("Appointment creation error:", error);
            throw new Error(
                error.response?.data?.error || "Failed to create appointment",
            );
        }
    },

    updateAppointment: async (id, data) => {
        try {
            const response = await api.put(`/appointments/${id}/`, data);
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.error || "Failed to update appointment",
            );
        }
    },

    deleteAppointment: async (id) => {
        try {
            const response = await api.delete(`/appointments/${id}/`);
            return response;
        } catch (error) {
            console.error("Appointment deletion error:", error);
            throw new Error(
                error.response?.data?.error || "Failed to delete appointment",
            );
        }
    },
};

// Availability endpoints
export const availabilityService = {
    getAvailability: (refereeId) =>
        api.get(`/availability/?referee=${refereeId}`),
    updateAvailability: (refereeId, data) =>
        api.post(`/availability/`, {
            referee: refereeId,
            ...data,
        }),
    getAvailableDates: (refereeId) =>
        api.get(`/availability/dates/?referee=${refereeId}`),
    getUnavailableDates: (refereeId) =>
        api.get(`/availability/unavailable/?referee=${refereeId}`),
};

// Venue endpoints
export const venueService = {
    getAllVenues: () => api.get("/venues/"),
    getVenue: (id) => api.get(`/venues/${id}/`),
    createVenue: (data) => api.post("/venues/", data),
    updateVenue: (id, data) => api.put(`/venues/${id}/`, data),
    deleteVenue: (id) => api.delete(`/venues/${id}/`),
};

// Team endpoints
export const teamService = {
    getAllTeams: () => api.get("/teams/"),
    getTeam: (id) => api.get(`/teams/${id}/`),
    createTeam: (data) => api.post("/teams/", data),
    updateTeam: (id, data) => api.put(`/teams/${id}/`, data),
    deleteTeam: (id) => api.delete(`/teams/${id}/`),
};

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("authToken");
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Response interceptor for handling errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("authToken");
            window.location.href = "/login";
        }

        // Format error message
        const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "An error occurred";

        // Enhance error object
        error.userMessage = errorMessage;
        return Promise.reject(error);
    },
);

export default api;
