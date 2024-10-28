import React, { useState } from "react";
import Button from "./Button";
import { PlusCircle, MapPin, Users } from "lucide-react";
import AddressInput from "./AddressInput";
import Popup from "./Popup";

const VenueForm = ({ isOpen, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        venue_id: `VENUE_${Date.now()}`,
        venue_name: "",
        capacity: "",
        location: "",
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Convert capacity to number
            const venueData = {
                ...formData,
                capacity: parseInt(formData.capacity, 10),
            };
            await onSubmit(venueData);
        } catch (error) {
            console.error("Form submission error:", error);
            throw error;
        } finally {
            setSubmitting(false);
        }
    };

    const CustomTitle = () => (
        <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-full">
                <PlusCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold">Add New Venue</h3>
        </div>
    );

    return (
        <Popup isOpen={isOpen} onClose={onClose} title={<CustomTitle />}>
            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Venue Name
                    </label>
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={formData.venue_name}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    venue_name: e.target.value,
                                }))
                            }
                            required
                            className="w-full pl-10 pr-4 py-2 rounded-md border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter venue name"
                        />
                        <MapPin
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={18}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                    </label>
                    <AddressInput
                        value={formData.location}
                        onChange={(value) =>
                            setFormData((prev) => ({
                                ...prev,
                                location: value,
                            }))
                        }
                        onLocationSelect={(location) => {
                            setFormData((prev) => ({
                                ...prev,
                                location: `${location.coordinates.lat},${location.coordinates.lng}`,
                            }));
                        }}
                        placeholder="Enter venue address"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacity
                    </label>
                    <div className="relative flex-1">
                        <input
                            type="number"
                            value={formData.capacity}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    capacity: e.target.value,
                                }))
                            }
                            required
                            min="0"
                            className="w-full pl-10 pr-4 py-2 rounded-md border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter venue capacity"
                        />
                        <Users
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={18}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                        {submitting ? "Adding Venue..." : "Add Venue"}
                    </Button>
                </div>
            </form>
        </Popup>
    );
};

export default VenueForm;
