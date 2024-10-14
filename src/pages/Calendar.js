import React, { useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import CalendarWidget from "../components/CalendarWidget";
import AvailabilityModal from "../components/AvailabilityModal";
import Button from "../components/Button";
import TitleWithBar from "../components/TitleWithBar";

const Calendar = () => {
    const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
    const { availableDates, unavailableDates } = useAppContext();

    return (
        <div>
            <TitleWithBar title="Calendar" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <CalendarWidget />
                    <Button
                        onClick={() => setShowAvailabilityModal(true)}
                        className="mt-4 w-full"
                    >
                        Update Availability
                    </Button>
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-4">
                        Availability Summary
                    </h3>
                    <div className="bg-white shadow rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Available Dates</h4>
                        <ul className="list-disc list-inside mb-4">
                            {availableDates && availableDates.length > 0 ? (
                                availableDates.map((date, index) => (
                                    <li key={index}>{date}</li>
                                ))
                            ) : (
                                <li>No available dates set.</li>
                            )}
                        </ul>
                        <h4 className="font-semibold mb-2">
                            Unavailable Dates
                        </h4>
                        <ul className="list-disc list-inside">
                            {unavailableDates && unavailableDates.length > 0 ? (
                                unavailableDates.map((date, index) => (
                                    <li key={index}>{date}</li>
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
                    onClose={() => setShowAvailabilityModal(false)}
                />
            )}
        </div>
    );
};

export default Calendar;
