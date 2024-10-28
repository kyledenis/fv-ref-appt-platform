import React, { useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import Button from "./Button";
import Popup from "./Popup";

const AvailabilityModal = ({ isOpen, onClose }) => {
    const { updateAvailability } = useAppContext();
    const [availabilityType, setAvailabilityType] = useState("specific");
    const [specificDate, setSpecificDate] = useState("");
    const [generalStartDate, setGeneralStartDate] = useState("");
    const [generalEndDate, setGeneralEndDate] = useState("");
    const [selectedDays, setSelectedDays] = useState([]);
    const [isAvailable, setIsAvailable] = useState(true);

    const handleSubmit = (e) => {
        e.preventDefault();
        const availableType = isAvailable ? "A" : "U";
        if (availabilityType === "specific") {
            updateAvailability(specificDate, availableType, false);
        } else {
            updateAvailability(
                {
                    startDate: generalStartDate,
                    endDate: generalEndDate,
                    days: selectedDays,
                    availableType: availableType,
                },
                true,
            );
        }
        onClose();
    };

    return (
        <Popup isOpen={isOpen} onClose={onClose} title="Update Availability">
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block mb-2">
                        <input
                            type="radio"
                            name="availabilityType"
                            value="specific"
                            checked={availabilityType === "specific"}
                            onChange={() => setAvailabilityType("specific")}
                            className="mr-2"
                        />
                        Specific Date
                    </label>
                    {availabilityType === "specific" && (
                        <input
                            type="date"
                            value={specificDate}
                            onChange={(e) => setSpecificDate(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    )}
                </div>
                <div className="mb-4">
                    <label className="block mb-2">
                        <input
                            type="radio"
                            name="availabilityType"
                            value="general"
                            checked={availabilityType === "general"}
                            onChange={() => setAvailabilityType("general")}
                            className="mr-2"
                        />
                        General Availability
                    </label>
                    {availabilityType === "general" && (
                        <>
                            <div className="flex space-x-2 mb-2">
                                <input
                                    type="date"
                                    value={generalStartDate}
                                    onChange={(e) =>
                                        setGeneralStartDate(e.target.value)
                                    }
                                    className="w-1/2 p-2 border rounded"
                                    required
                                    placeholder="Start Date"
                                />
                                <input
                                    type="date"
                                    value={generalEndDate}
                                    onChange={(e) =>
                                        setGeneralEndDate(e.target.value)
                                    }
                                    className="w-1/2 p-2 border rounded"
                                    required
                                    placeholder="End Date"
                                />
                            </div>
                            <div>
                                {[
                                    "MON",
                                    "TUE",
                                    "WED",
                                    "THU",
                                    "FRI",
                                    "SAT",
                                    "SUN",
                                ].map((day, index) => (
                                    <label
                                        key={day}
                                        className="inline-flex items-center mr-2"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedDays.includes(
                                                index,
                                            )}
                                            onChange={() => {
                                                if (
                                                    selectedDays.includes(index)
                                                ) {
                                                    setSelectedDays(
                                                        selectedDays.filter(
                                                            (d) => d !== index,
                                                        ),
                                                    );
                                                } else {
                                                    setSelectedDays([
                                                        ...selectedDays,
                                                        index,
                                                    ]);
                                                }
                                            }}
                                            className="mr-1"
                                        />
                                        {day}
                                    </label>
                                ))}
                            </div>
                        </>
                    )}
                </div>
                <div className="mb-4">
                    <label className="block mb-2">
                        <input
                            type="checkbox"
                            checked={isAvailable}
                            onChange={(e) => setIsAvailable(e.target.checked)}
                            className="mr-2"
                        />
                        Available
                    </label>
                </div>
                <Button type="submit">Update Availability</Button>
            </form>
        </Popup>
    );
};

export default AvailabilityModal;
