import React, { useState, useEffect } from "react";
import { useAppContext } from "../contexts/AppContext";
import Button from "./Button";
import LoadingSpinner from "./LoadingSpinner";
import ErrorDisplay from "./ErrorDisplay";
import TimePicker from "./TimePicker";
import { PlusCircle, Calendar, MapPin, Users, Clock } from "lucide-react";
import {
    appointmentService,
    venueService,
    refereeService,
} from "../services/api";
import { toast } from "react-toastify";

const AppointmentForm = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        appointment_id: `APP_${Date.now()}`,
        referee: "",
        venue: "",
        match: "",
        appointment_date: "",
        appointment_time: "",
        status: "pending",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [venues, setVenues] = useState([]);
    const [referees, setReferees] = useState([]);
    const { user } = useAppContext();

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [venuesRes, refereesRes] = await Promise.all([
                    venueService.getAllVenues(),
                    refereeService.getAllReferees(),
                ]);
                setVenues(venuesRes.data);
                setReferees(refereesRes.data);
            } catch (err) {
                setError(err.message || "Failed to load form data");
                toast.error("Failed to load form data");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);

            // Add any form validation here
            if (
                !formData.referee ||
                !formData.venue ||
                !formData.appointment_date
            ) {
                throw new Error("Please fill in all required fields");
            }

            await onSubmit(formData);
            toast.success("Appointment created successfully");
            onClose();
        } catch (err) {
            setError(err.message || "Failed to create appointment");
            toast.error(err.message || "Failed to create appointment");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    if (!isOpen) return null;

    if (loading && !formData.referee) {
        return <LoadingSpinner message="Loading form data..." />;
    }

    if (error) {
        return (
            <ErrorDisplay
                error={error}
                message="Failed to load form data"
                onRetry={() => window.location.reload()}
            />
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <PlusCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-semibold">
                        Create New Appointment
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Referee Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Users className="w-4 h-4 inline mr-2" />
                            Referee
                        </label>
                        <select
                            name="referee"
                            value={formData.referee}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select Referee</option>
                            {referees.map((referee) => (
                                <option
                                    key={referee.referee_id}
                                    value={referee.referee_id}
                                >
                                    {referee.first_name} {referee.last_name}{" "}
                                    (Level {referee.level})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Venue Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <MapPin className="w-4 h-4 inline mr-2" />
                            Venue
                        </label>
                        <select
                            name="venue"
                            value={formData.venue}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select Venue</option>
                            {venues.map((venue) => (
                                <option
                                    key={venue.venue_id}
                                    value={venue.venue_id}
                                >
                                    {venue.venue_name} ({venue.location})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="w-4 h-4 inline mr-2" />
                                Date
                            </label>
                            <input
                                type="date"
                                name="appointment_date"
                                value={formData.appointment_date}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                                required
                                min={new Date().toISOString().split("T")[0]}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Clock className="w-4 h-4 inline mr-2" />
                                Time
                            </label>
                            <TimePicker
                                value={formData.appointment_time}
                                onChange={(value) =>
                                    handleChange({
                                        target: {
                                            name: "appointment_time",
                                            value,
                                        },
                                    })
                                }
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Appointment"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AppointmentForm;
