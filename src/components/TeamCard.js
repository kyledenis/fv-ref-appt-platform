import React from "react";

const TeamCard = ({ team }) => {
    return (
        <div className="bg-white shadow rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">{team.name}</h3>
            <p className="text-gray-600">League: {team.league}</p>
            {team.homeVenue && (
                <p className="text-gray-600">Home Venue: {team.homeVenue}</p>
            )}
            {team.contactName && (
                <p className="text-gray-600">Contact: {team.contactName}</p>
            )}
            {team.contactPhone && (
                <p className="text-gray-600">Phone: {team.contactPhone}</p>
            )}
        </div>
    );
};

export default TeamCard;
