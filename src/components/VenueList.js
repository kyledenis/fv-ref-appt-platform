import React from "react";

const VenueList = ({ venues }) => {
    return (
        <ul className="bg-white shadow rounded-lg divide-y divide-gray-200">
            {venues.map((venue) => (
                <li key={venue.id} className="p-4">
                    <h3 className="font-semibold">{venue.name}</h3>
                    <p className="text-gray-600">Location: {venue.location}</p>
                    <p className="text-gray-600">Capacity: {venue.capacity}</p>
                </li>
            ))}
        </ul>
    );
};

export default VenueList;
