import React, { useState, useEffect } from "react";
import Form from "./Form";

const Venue = () => {
    const [venues, setVenues] = useState([]);
    

    // Fetch venues from the API
    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/venue/")
            .then((response) => response.json())
            .then((data) => setVenues(data))
            .catch((error) => console.error("Error fetching venues:", error));
    }, []);

    

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Manage Venues</h2>
            
            <table className="min-w-full bg-white">
                <thead>
                    <tr>
                        <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Venue ID 
                        </th>
                        <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Venue Name
                        </th>
                        <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                        </th>
                        <th className="px-3 py-3 border-b-2 border-gray-400 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Capacity
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {venues.map((venue) => (
                        <tr key={venue.venue_id}>
                            <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-left">
                                {venue.venue_id}
                            </td>
                            <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-left">
                                {venue.venue_name}
                            </td>
                            <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-left">
                                {venue.location}
                            </td>
                            <td className="px-3 py-3 whitespace-no-wrap border-b border-gray-200 text-left">
                                {venue.capacity}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <Form venues={venues} setVenues={setVenues} />

        </div>
    );
};

export default Venue;
