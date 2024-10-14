import React, { useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import TitleWithBar from "../components/TitleWithBar";
import VenueList from "../components/VenueList";
import VenueForm from "../components/VenueForm";
import Button from "../components/Button";

const Venues = () => {
    const { venues, addVenue } = useAppContext();
    const [showForm, setShowForm] = useState(false);

    const handleAddVenue = (venueData) => {
        addVenue(venueData);
        setShowForm(false);
    };

    return (
        <div>
            <TitleWithBar title="Manage Venues" />
            {venues && venues.length > 0 ? (
                <VenueList venues={venues} />
            ) : (
                <p>No venues available.</p>
            )}
            {showForm ? (
                <VenueForm
                    onSubmit={handleAddVenue}
                    onCancel={() => setShowForm(false)}
                />
            ) : (
                <Button onClick={() => setShowForm(true)} className="mt-4">
                    Add New Venue
                </Button>
            )}
        </div>
    );
};

export default Venues;
