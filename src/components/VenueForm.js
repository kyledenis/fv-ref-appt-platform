import React, { useState } from "react";
import Button from "./Button";

const VenueForm = ({ onSubmit, onCancel }) => {
    const [venueData, setVenueData] = useState({
        name: "",
        location: "",
        capacity: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setVenueData({ ...venueData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(venueData);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white shadow rounded-lg p-4 mt-4"
        >
            <div className="mb-4">
                <label
                    htmlFor="name"
                    className="block text-gray-700 font-bold mb-2"
                >
                    Venue Name
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={venueData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                />
            </div>
            <div className="mb-4">
                <label
                    htmlFor="location"
                    className="block text-gray-700 font-bold mb-2"
                >
                    Location
                </label>
                <input
                    type="text"
                    id="location"
                    name="location"
                    value={venueData.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                />
            </div>
            <div className="mb-4">
                <label
                    htmlFor="capacity"
                    className="block text-gray-700 font-bold mb-2"
                >
                    Capacity
                </label>
                <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={venueData.capacity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                />
            </div>
            <div className="flex justify-end">
                <Button onClick={onCancel} variant="secondary" className="mr-2">
                    Cancel
                </Button>
                <Button type="submit">Add Venue</Button>
            </div>
        </form>
    );
};

export default VenueForm;
