import React, { useState, useEffect } from "react";

const Venue = () => {
    const [venues, setVenues] = useState([]);
    const [newVenue, setNewVenue] = useState({
        venue_id: "",
        venue_name: "",
        location: "",
        capacity: "",
    });

    // Fetch venues from the API
    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/venue/")
            .then((response) => response.json())
            .then((data) => setVenues(data))
            .catch((error) => console.error("Error fetching venues:", error));
    }, []);

    // Handle input change for the form
    const handleChange = (e) => {
        setNewVenue({ ...newVenue, [e.target.name]: e.target.value });
    };

    // Submit a new venue to the API
    const handleSubmit = (e) => {
        e.preventDefault();

        fetch("/api/venue/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newVenue),
        })
            .then((response) => response.json())
            .then((data) => {
                setVenues([...venues, data]);
                setNewVenue({ name: "", location: "", capacity: "" }); // Clear form
            })
            .catch((error) => console.error("Error adding venue:", error));
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Manage Venues</h2>

            {/* Display a list of venues */}
            <ul>
                {venues.map((venue) => (
                    <li key={venue.venue_id}>
                        (Venue ID:{venue.venue_id}) - (Venue Name: {venue.venue_name}) - (Location: {venue.location}) - (Capacity: {venue.capacity})
                    </li>
                ))}
            </ul>

            {/* Form to add a new venue */}
            <form onSubmit={handleSubmit} className="mt-4">
                <div>
                    <label>Name: </label>
                    <input
                        type="text"
                        name="name"
                        value={newVenue.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Location: </label>
                    <input
                        type="text"
                        name="location"
                        value={newVenue.location}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Capacity: </label>
                    <input
                        type="number"
                        name="capacity"
                        value={newVenue.capacity}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="mt-2 bg-blue-500 text-white py-1 px-2 rounded">
                    Add Venue
                </button>
            </form>
        </div>
    );
};

export default Venue;
