import axios from "axios";

const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
});

export const loginUser = (credentials) => api.post("/login/", credentials);
export const getAppointments = () => api.get("/appointments/");
export const updateAppointment = (id, data) =>
    api.put(`/appointments/${id}/`, data);
export const getAvailableDates = () => api.get("/available-dates/");
export const getUnavailableDates = () => api.get("/unavailable-dates/");
export const updateAvailability = (data) =>
    api.post("/update-availability/", data);
export const getTeams = () => api.get("/club/"); // Fix from team to club to match with the api url
export const getVenues = () => api.get("/venues/");
export const createVenue = (data) => api.post("/venues/", data);
export const updateUserSettings = (userId, data) =>
    api.put(`/users/${userId}/settings/`, data);

export default api;
