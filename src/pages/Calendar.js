import React, { useState, useEffect } from "react";
import { useAppContext } from "../contexts/AppContext";
import CalendarWidget from "../components/CalendarWidget";
import AvailabilityModal from "../components/AvailabilityModal";
import Button from "../components/Button";
import TitleWithBar from "../components/TitleWithBar";
import withAsyncState from "../hoc/withAsyncState";
import { availabilityService } from "../services/api";
import { toast } from "react-toastify";

const Calendar = () => {
    const { user } = useAppContext();
    const [availableDates, setAvailableDates] = useState([]);
    const [unavailableDates, setUnavailableDates] = useState([]);
    const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);

    const fetchAvailability = async () => {
        try {
            setLoading(true);
            setError(null);
            const [availableRes, unavailableRes] = await Promise.all([
                availabilityService.getAvailableDates(user.referee_id),
                availabilityService.getUnavailableDates(user.referee_id),
            ]);
            setAvailableDates(availableRes.data || []);
            setUnavailableDates(unavailableRes.data || []);
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to fetch availability",
            );
            toast.error("Failed to fetch availability");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAvailability = async (date, isAvailable, isGeneral) => {
        try {
            setUpdating(true);
            const response = await availabilityService.updateAvailability(
                user.referee_id,
                {
                    referee: user.referee_id,
                    date,
                    isAvailable,
                    isGeneral,
                },
            );

            if (response.data) {
                setAvailableDates(response.data.availableDates || []);
                setUnavailableDates(response.data.unavailableDates || []);
                toast.success("Availability updated successfully");
                setShowAvailabilityModal(false);
            }
        } catch (err) {
            console.error("Update availability error:", err);
            toast.error(
                err.response?.data?.error || "Failed to update availability",
            );
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        if (user?.referee_id) {
            fetchAvailability();
        }
    }, [user?.referee_id]);

    const CalendarContent = withAsyncState(
        ({ availableDates, unavailableDates }) => (
            <div>
                <TitleWithBar title="Calendar" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <CalendarWidget
                            availableDates={availableDates}
                            unavailableDates={unavailableDates}
                        />
                        <Button
                            onClick={() => setShowAvailabilityModal(true)}
                            className="mt-4 w-full"
                            disabled={updating}
                        >
                            {updating ? "Updating..." : "Update Availability"}
                        </Button>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-4">
                            Availability Summary
                        </h3>
                        <div className="bg-white shadow rounded-lg p-4">
                            <h4 className="font-semibold mb-2">
                                Available Dates
                            </h4>
                            <ul className="list-disc list-inside mb-4">
                                {availableDates && availableDates.length > 0 ? (
                                    availableDates.map((date, index) => (
                                        <li key={index}>
                                            {new Date(
                                                date,
                                            ).toLocaleDateString()}
                                        </li>
                                    ))
                                ) : (
                                    <li>No available dates set.</li>
                                )}
                            </ul>
                            <h4 className="font-semibold mb-2">
                                Unavailable Dates
                            </h4>
                            <ul className="list-disc list-inside">
                                {unavailableDates &&
                                unavailableDates.length > 0 ? (
                                    unavailableDates.map((date, index) => (
                                        <li key={index}>
                                            {new Date(
                                                date,
                                            ).toLocaleDateString()}
                                        </li>
                                    ))
                                ) : (
                                    <li>No unavailable dates set.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
                {showAvailabilityModal && (
                    <AvailabilityModal
                        isOpen={showAvailabilityModal}
                        onClose={() => setShowAvailabilityModal(false)}
                        onSubmit={handleUpdateAvailability}
                        isUpdating={updating}
                    />
                )}
            </div>
        ),
    );

    return (
        <CalendarContent
            loading={loading}
            error={error}
            availableDates={availableDates}
            unavailableDates={unavailableDates}
            onRetry={fetchAvailability}
            loadingMessage="Loading calendar..."
            errorMessage="Failed to load calendar data"
        />
    );
};

export default Calendar;
